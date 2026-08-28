import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { colors } from "@/constants/colors";
import { formatChatTime } from "@/lib/time";

type ChatRowProps = {
  name: string;
  handle: string;
  avatarUrl: string | null;
  online: boolean;
  lastMessage?: string;
  lastMessageKind?: "text" | "image";
  lastMessageAt?: number;
  unreadCount: number;
  now: number;
  onPress: () => void;
};

export function ChatRow({
  name,
  handle,
  avatarUrl,
  online,
  lastMessage,
  lastMessageKind,
  lastMessageAt,
  unreadCount,
  now,
  onPress,
}: ChatRowProps) {
  const preview =
    lastMessageKind === "image" ? "Sent a photo" : lastMessage ?? "Start a conversation";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar name={name} uri={avatarUrl} online={online} size={54} />
      <View style={styles.copy}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {lastMessageAt ? (
            <Text style={styles.time}>{formatChatTime(lastMessageAt, now)}</Text>
          ) : null}
        </View>
        <View style={styles.bottom}>
          <Text
            style={[styles.preview, unreadCount > 0 && styles.unreadPreview]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : (
            <Text style={styles.handle}>@{handle}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  time: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  unreadPreview: {
    color: colors.onSurface,
    fontWeight: "600",
  },
  handle: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
});
