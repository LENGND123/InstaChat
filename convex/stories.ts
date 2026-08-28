import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { authedMutation, authedQuery } from "./lib/functions";
import { toProfile } from "./lib/users";
import { storyGroupValidator } from "./lib/validators";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export const listActive = authedQuery({
  args: { now: v.number() },
  returns: v.array(storyGroupValidator),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("stories")
      .withIndex("by_expires", (q) => q.gt("expiresAt", args.now))
      .take(80);

    const grouped = new Map<string, { userId: Id<"users">; stories: Doc<"stories">[] }>();

    for (const story of rows) {
      const existing = grouped.get(story.userId);
      if (existing) {
        existing.stories.push(story);
      } else {
        grouped.set(story.userId, { userId: story.userId, stories: [story] });
      }
    }

    const groups = [];
    const mine = grouped.get(ctx.user._id);
    if (mine) {
      const stories = [];
      for (const story of mine.stories.sort((a, b) => a.createdAt - b.createdAt)) {
        stories.push({
          _id: story._id,
          mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
          mediaType: story.mediaType,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }
      groups.push({
        user: await toProfile(ctx, ctx.user, args.now),
        stories,
      });
    }

    for (const group of grouped.values()) {
      if (group.userId === ctx.user._id) {
        continue;
      }
      const user = await ctx.db.get(group.userId);
      if (!user) {
        continue;
      }
      const stories = [];
      for (const story of group.stories.sort((a, b) => a.createdAt - b.createdAt)) {
        stories.push({
          _id: story._id,
          mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
          mediaType: story.mediaType,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }
      groups.push({
        user: await toProfile(ctx, user, args.now),
        stories,
      });
    }

    return groups;
  },
});

export const forUser = authedQuery({
  args: {
    userId: v.id("users"),
    now: v.number(),
  },
  returns: v.union(storyGroupValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    const rows = await ctx.db
      .query("stories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(20);
    const active = rows
      .filter((story) => story.expiresAt > args.now)
      .sort((a, b) => a.createdAt - b.createdAt);
    if (active.length === 0) {
      return null;
    }
    const stories = [];
    for (const story of active) {
      stories.push({
        _id: story._id,
        mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
        mediaType: story.mediaType,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });
    }
    return {
      user: await toProfile(ctx, user, args.now),
      stories,
    };
  },
});

export const create = authedMutation({
  args: {
    mediaStorageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
  },
  returns: v.id("stories"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("stories", {
      userId: ctx.user._id,
      mediaStorageId: args.mediaStorageId,
      mediaType: args.mediaType,
      createdAt: now,
      expiresAt: now + STORY_TTL_MS,
    });
  },
});
