import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authedMutation, authedQuery } from "./lib/functions";
import { pairParticipants, toProfile } from "./lib/users";
import { conversationListItemValidator } from "./lib/validators";

async function findConversation(
  ctx: QueryCtx | MutationCtx,
  a: Id<"users">,
  b: Id<"users">,
): Promise<Doc<"conversations"> | null> {
  const pair = pairParticipants(a, b);
  return await ctx.db
    .query("conversations")
    .withIndex("by_pair", (q) =>
      q.eq("participantA", pair.participantA).eq("participantB", pair.participantB),
    )
    .unique();
}

export const list = authedQuery({
  args: { now: v.number() },
  returns: v.array(conversationListItemValidator),
  handler: async (ctx, args) => {
    const asA = await ctx.db
      .query("conversations")
      .withIndex("by_participantA", (q) => q.eq("participantA", ctx.user._id))
      .take(100);
    const asB = await ctx.db
      .query("conversations")
      .withIndex("by_participantB", (q) => q.eq("participantB", ctx.user._id))
      .take(100);

    const seen = new Set<string>();
    const conversations: Doc<"conversations">[] = [];
    for (const conversation of [...asA, ...asB]) {
      if (seen.has(conversation._id)) {
        continue;
      }
      seen.add(conversation._id);
      conversations.push(conversation);
    }

    conversations.sort(
      (left, right) => (right.lastMessageAt ?? 0) - (left.lastMessageAt ?? 0),
    );

    const items = [];
    for (const conversation of conversations) {
      const otherId =
        conversation.participantA === ctx.user._id
          ? conversation.participantB
          : conversation.participantA;
      const other = await ctx.db.get(otherId);
      if (!other) {
        continue;
      }
      const unreadCount =
        conversation.participantA === ctx.user._id
          ? conversation.unreadForA
          : conversation.unreadForB;
      items.push({
        conversationId: conversation._id,
        otherUser: await toProfile(ctx, other, args.now),
        lastMessage: conversation.lastMessage,
        lastMessageKind: conversation.lastMessageKind,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
      });
    }
    return items;
  },
});

export const getById = authedQuery({
  args: { conversationId: v.id("conversations") },
  returns: v.union(conversationListItemValidator, v.null()),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }
    const otherId =
      conversation.participantA === ctx.user._id
        ? conversation.participantB
        : conversation.participantA;
    const other = await ctx.db.get(otherId);
    if (!other) {
      return null;
    }
    const unreadCount =
      conversation.participantA === ctx.user._id
        ? conversation.unreadForA
        : conversation.unreadForB;
    return {
      conversationId: conversation._id,
      otherUser: await toProfile(ctx, other, 0),
      lastMessage: conversation.lastMessage,
      lastMessageKind: conversation.lastMessageKind,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
    };
  },
});

export const getOrCreate = authedMutation({
  args: { otherUserId: v.id("users") },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    if (args.otherUserId === ctx.user._id) {
      throw new Error("You cannot chat with yourself");
    }
    const other = await ctx.db.get(args.otherUserId);
    if (!other) {
      throw new Error("User not found");
    }

    const existing = await findConversation(ctx, ctx.user._id, args.otherUserId);
    if (existing) {
      return existing._id;
    }

    const pair = pairParticipants(ctx.user._id, args.otherUserId);
    return await ctx.db.insert("conversations", {
      ...pair,
      unreadForA: 0,
      unreadForB: 0,
    });
  },
});
