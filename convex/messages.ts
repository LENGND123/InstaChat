import { v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/functions";
import { messageValidator } from "./lib/validators";

export const list = authedQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    const rows = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(80);

    const messages = [];
    for (const row of rows.reverse()) {
      const imageUrl = row.imageStorageId
        ? await ctx.storage.getUrl(row.imageStorageId)
        : null;
      messages.push({
        _id: row._id,
        conversationId: row.conversationId,
        senderId: row.senderId,
        receiverId: row.receiverId,
        kind: row.kind,
        text: row.text,
        imageUrl,
        createdAt: row.createdAt,
        mine: row.senderId === ctx.user._id,
      });
    }
    return messages;
  },
});

export const send = authedMutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    const text = args.text?.trim();
    const hasImage = Boolean(args.imageStorageId);
    if (!text && !hasImage) {
      throw new Error("Message cannot be empty");
    }
    if (text && text.length > 2000) {
      throw new Error("Message is too long");
    }

    const receiverId =
      conversation.participantA === ctx.user._id
        ? conversation.participantB
        : conversation.participantA;
    const kind = hasImage ? "image" : "text";
    const now = Date.now();
    const preview = hasImage ? "Photo" : text;

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: ctx.user._id,
      receiverId,
      kind,
      text: text || undefined,
      imageStorageId: args.imageStorageId,
      createdAt: now,
    });

    const unreadPatch =
      conversation.participantA === receiverId
        ? { unreadForA: conversation.unreadForA + 1 }
        : { unreadForB: conversation.unreadForB + 1 };

    await ctx.db.patch(args.conversationId, {
      lastMessage: preview,
      lastMessageKind: kind,
      lastMessageAt: now,
      lastMessageSenderId: ctx.user._id,
      ...unreadPatch,
    });

    return messageId;
  },
});

export const markRead = authedMutation({
  args: { conversationId: v.id("conversations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    if (conversation.participantA === ctx.user._id) {
      await ctx.db.patch(args.conversationId, { unreadForA: 0 });
    } else {
      await ctx.db.patch(args.conversationId, { unreadForB: 0 });
    }
    return null;
  },
});
