import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { authedMutation, authedQuery } from "./lib/functions";
import { messageValidator } from "./lib/validators";

const SEAL_CHOICES_MS = new Set([60_000, 3_600_000, 86_400_000]);

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
      const hidden = Boolean(row.sealed) && row.senderId !== ctx.user._id;
      const imageUrl =
        !hidden && row.imageStorageId
          ? await ctx.storage.getUrl(row.imageStorageId)
          : null;
      messages.push({
        _id: row._id,
        conversationId: row.conversationId,
        senderId: row.senderId,
        receiverId: row.receiverId,
        kind: row.kind,
        text: hidden ? undefined : row.text,
        imageUrl,
        createdAt: row.createdAt,
        mine: row.senderId === ctx.user._id,
        sealed: Boolean(row.sealed),
        unlockAt: row.unlockAt,
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
    sealForMs: v.optional(v.number()),
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
    if (args.sealForMs !== undefined && !SEAL_CHOICES_MS.has(args.sealForMs)) {
      throw new Error("Pick 1 minute, 1 hour, or tomorrow for a sealed note");
    }

    const receiverId =
      conversation.participantA === ctx.user._id
        ? conversation.participantB
        : conversation.participantA;
    const kind = hasImage ? "image" : "text";
    const now = Date.now();
    const sealForMs = args.sealForMs;
    const unlockAt = sealForMs === undefined ? undefined : now + sealForMs;
    const sealed = unlockAt !== undefined;
    const preview = sealed ? "Sealed note" : hasImage ? "Photo" : text;

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: ctx.user._id,
      receiverId,
      kind,
      text: text || undefined,
      imageStorageId: args.imageStorageId,
      createdAt: now,
      unlockAt,
      sealed: sealed || undefined,
    });

    if (unlockAt !== undefined) {
      await ctx.scheduler.runAt(unlockAt, internal.messages.reveal, { messageId });
    }

    const unreadPatch =
      conversation.participantA === receiverId
        ? { unreadForA: conversation.unreadForA + 1 }
        : { unreadForB: conversation.unreadForB + 1 };

    await ctx.db.patch(args.conversationId, {
      lastMessage: preview,
      lastMessageKind: sealed ? "text" : kind,
      lastMessageAt: now,
      lastMessageSenderId: ctx.user._id,
      ...unreadPatch,
    });

    return messageId;
  },
});

export const reveal = internalMutation({
  args: { messageId: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message?.sealed) {
      return null;
    }
    if (message.unlockAt !== undefined && message.unlockAt > Date.now() + 5_000) {
      return null;
    }

    await ctx.db.patch(message._id, { sealed: false });

    const conversation = await ctx.db.get(message.conversationId);
    if (
      conversation &&
      conversation.lastMessageAt === message.createdAt &&
      conversation.lastMessageSenderId === message.senderId
    ) {
      await ctx.db.patch(conversation._id, {
        lastMessage: message.kind === "image" ? "Photo" : message.text,
        lastMessageKind: message.kind,
      });
    }
    return null;
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
