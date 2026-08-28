import { v } from "convex/values";

export const profileValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  handle: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  lastSeen: v.number(),
  isOnline: v.boolean(),
});

export const meValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  handle: v.string(),
  email: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  lastSeen: v.number(),
  isOnline: v.boolean(),
});

export const conversationListItemValidator = v.object({
  conversationId: v.id("conversations"),
  otherUser: profileValidator,
  lastMessage: v.optional(v.string()),
  lastMessageKind: v.optional(
    v.union(v.literal("text"), v.literal("image")),
  ),
  lastMessageAt: v.optional(v.number()),
  unreadCount: v.number(),
});

export const messageValidator = v.object({
  _id: v.id("messages"),
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  receiverId: v.id("users"),
  kind: v.union(v.literal("text"), v.literal("image")),
  text: v.optional(v.string()),
  imageUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  mine: v.boolean(),
});

export const storyGroupValidator = v.object({
  user: profileValidator,
  stories: v.array(
    v.object({
      _id: v.id("stories"),
      mediaUrl: v.union(v.string(), v.null()),
      mediaType: v.union(v.literal("image"), v.literal("video")),
      createdAt: v.number(),
      expiresAt: v.number(),
    }),
  ),
});
