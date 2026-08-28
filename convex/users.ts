import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { authedMutation, authedQuery } from "./lib/functions";
import { searchTextFor, toProfile } from "./lib/users";
import { meValidator, profileValidator } from "./lib/validators";

export const heartbeat = authedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.db.patch(ctx.user._id, { lastSeen: Date.now() });
    return null;
  },
});

export const updateProfile = authedMutation({
  args: {
    name: v.string(),
    handle: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const handle = args.handle.trim().replace(/^@/, "").toLowerCase();
    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (!/^[a-z0-9._]{3,20}$/.test(handle)) {
      throw new Error("Handle must be 3-20 letters, numbers, dots, or underscores");
    }
    if (args.bio && args.bio.length > 160) {
      throw new Error("Bio must be 160 characters or less");
    }

    if (handle !== ctx.user.handle) {
      const taken = await ctx.db
        .query("users")
        .withIndex("by_handle", (q) => q.eq("handle", handle))
        .unique();
      if (taken) {
        throw new Error("Handle is already taken");
      }
    }

    await ctx.db.patch(ctx.user._id, {
      name,
      handle,
      bio: args.bio?.trim() || undefined,
      avatarStorageId: args.avatarStorageId ?? ctx.user.avatarStorageId,
      searchText: searchTextFor(name, handle),
    });
    return null;
  },
});

export const search = authedQuery({
  args: {
    query: v.string(),
    now: v.number(),
  },
  returns: v.array(profileValidator),
  handler: async (ctx, args) => {
    const needle = args.query.trim().replace(/^@/, "").toLowerCase();
    if (needle.length === 0) {
      return [];
    }

    const byHandle = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", needle))
      .unique();

    const searched = await ctx.db
      .query("users")
      .withSearchIndex("search_text", (q) => q.search("searchText", needle))
      .take(20);

    const merged = new Map<string, Doc<"users">>();
    if (byHandle) {
      merged.set(byHandle._id, byHandle);
    }
    for (const user of searched) {
      merged.set(user._id, user);
    }

    const profiles = [];
    for (const user of merged.values()) {
      if (user._id === ctx.user._id) {
        continue;
      }
      profiles.push(await toProfile(ctx, user, args.now));
    }
    return profiles;
  },
});

export const get = authedQuery({
  args: {
    userId: v.id("users"),
    now: v.number(),
  },
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    return await toProfile(ctx, user, args.now);
  },
});

export const myProfile = authedQuery({
  args: { now: v.number() },
  returns: meValidator,
  handler: async (ctx, args) => {
    const profile = await toProfile(ctx, ctx.user, args.now);
    return { ...profile, email: ctx.user.email };
  },
});
