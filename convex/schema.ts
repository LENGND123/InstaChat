import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    handle: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    searchText: v.string(),
    lastSeen: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_handle", ["handle"])
    .searchIndex("search_text", {
      searchField: "searchText",
    }),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  conversations: defineTable({
    participantA: v.id("users"),
    participantB: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageKind: v.optional(
      v.union(v.literal("text"), v.literal("image")),
    ),
    lastMessageAt: v.optional(v.number()),
    lastMessageSenderId: v.optional(v.id("users")),
    unreadForA: v.number(),
    unreadForB: v.number(),
  })
    .index("by_pair", ["participantA", "participantB"])
    .index("by_participantA", ["participantA"])
    .index("by_participantB", ["participantB"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    kind: v.union(v.literal("text"), v.literal("image")),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    // Sealed notes stay hidden from the receiver until unlockAt.
    unlockAt: v.optional(v.number()),
    sealed: v.optional(v.boolean()),
  }).index("by_conversation", ["conversationId"]),

  stories: defineTable({
    userId: v.id("users"),
    mediaStorageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),
});
