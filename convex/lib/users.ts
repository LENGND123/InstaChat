import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const ONLINE_WINDOW_MS = 45_000;

export async function requireUser(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
): Promise<Doc<"users">> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export function isOnline(lastSeen: number, now: number): boolean {
  return now - lastSeen < ONLINE_WINDOW_MS;
}

export async function toProfile(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
  now: number,
) {
  const avatarUrl = user.avatarStorageId
    ? await ctx.storage.getUrl(user.avatarStorageId)
    : null;

  return {
    _id: user._id,
    name: user.name,
    handle: user.handle,
    bio: user.bio,
    avatarUrl,
    lastSeen: user.lastSeen,
    isOnline: isOnline(user.lastSeen, now),
  };
}

export function pairParticipants(
  a: Id<"users">,
  b: Id<"users">,
): { participantA: Id<"users">; participantB: Id<"users"> } {
  return a < b
    ? { participantA: a, participantB: b }
    : { participantA: b, participantB: a };
}

export function searchTextFor(name: string, handle: string): string {
  return `${name} ${handle}`.toLowerCase();
}
