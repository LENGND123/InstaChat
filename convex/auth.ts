import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { hashPassword, randomBytesHex, verifyPassword } from "./lib/passwords";
import { searchTextFor, toProfile } from "./lib/users";
import { meValidator } from "./lib/validators";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const DEMO_USERS = [
  {
    name: "Maya Chen",
    handle: "maya",
    email: "maya@instachat.dev",
    password: "demo1234",
    bio: "Designing product stories. Coffee first.",
  },
  {
    name: "Jordan Blake",
    handle: "jordan",
    email: "jordan@instachat.dev",
    password: "demo1234",
    bio: "Always down for a late-night voice note.",
  },
] as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

function fail(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

function validateSignup(args: {
  name: string;
  handle: string;
  email: string;
  password: string;
}): void {
  if (args.name.trim().length < 2) {
    fail("invalid_name", "Name must be at least 2 characters");
  }
  if (!/^[a-z0-9._]{3,20}$/.test(args.handle)) {
    fail("invalid_handle", "Handle must be 3-20 letters, numbers, dots, or underscores");
  }
  if (!args.email.includes("@") || args.email.startsWith("@") || args.email.endsWith("@")) {
    fail("invalid_email", "Enter a valid email address");
  }
  if (args.password.length < 6) {
    fail("invalid_password", "Password must be at least 6 characters");
  }
}

async function createSession(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<string> {
  const token = randomBytesHex(32);
  await ctx.db.insert("sessions", {
    token,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export const signUp = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    sessionToken: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const handle = normalizeHandle(args.handle);
    const email = normalizeEmail(args.email);
    validateSignup({ name, handle, email, password: args.password });

    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existingEmail) {
      fail("email_taken", "That email already has an account. Sign in instead.");
    }

    const existingHandle = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .unique();
    if (existingHandle) {
      fail("handle_taken", "That handle is already taken. Pick another one.");
    }

    const salt = randomBytesHex(16);
    const passwordHash = await hashPassword(args.password, salt);
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name,
      handle,
      email,
      passwordHash,
      salt,
      searchText: searchTextFor(name, handle),
      lastSeen: now,
      createdAt: now,
    });

    const sessionToken = await createSession(ctx, userId);
    return { sessionToken, userId };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    sessionToken: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      fail(
        "unknown_email",
        "No account for this email yet. Create one with the same password.",
      );
    }

    const ok = await verifyPassword(args.password, user.salt, user.passwordHash);
    if (!ok) {
      fail("bad_password", "Wrong password for this email.");
    }

    await ctx.db.patch(user._id, { lastSeen: Date.now() });
    const sessionToken = await createSession(ctx, user._id);
    return { sessionToken, userId: user._id };
  },
});

export const signOut = mutation({
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.patch(session.userId, { lastSeen: 0 });
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

export const me = query({
  args: {
    sessionToken: v.string(),
  },
  returns: v.union(meValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (!session) {
      return null;
    }
    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }
    // isOnline is derived on the client so this query stays stable (no `now` arg).
    const profile = await toProfile(ctx, user, 0);
    return { ...profile, email: user.email };
  },
});

export const seedDemoUsers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const demo of DEMO_USERS) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .unique();
      if (existing) {
        continue;
      }
      const salt = randomBytesHex(16);
      const passwordHash = await hashPassword(demo.password, salt);
      const now = Date.now();
      await ctx.db.insert("users", {
        name: demo.name,
        handle: demo.handle,
        email: demo.email,
        passwordHash,
        salt,
        bio: demo.bio,
        searchText: searchTextFor(demo.name, demo.handle),
        lastSeen: 0,
        createdAt: now,
      });
    }
    return null;
  },
});
