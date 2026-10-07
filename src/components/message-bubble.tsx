import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { formatClock, formatOpensIn } from "@/lib/time";

type MessageBubbleProps = {
  mine: boolean;
  kind: "text" | "image";
  text?: string;
  imageUrl: string | null;
  createdAt: number;
  sealed: boolean;
  unlockAt?: number;
  now: number;
};

export const MessageBubble = memo(function MessageBubble({
  mine,
  kind,
  text,
  imageUrl,
  createdAt,
  sealed,
  unlockAt,
  now,
}: MessageBubbleProps) {
  const hidden = sealed && !mine;
  const opens =
    sealed && unlockAt !== undefined ? formatOpensIn(unlockAt, now) : null;

  return (
    <View style={[styles.wrap, mine ? styles.mineWrap : styles.theirsWrap]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          !hidden && kind === "image" && styles.imageBubble,
          hidden && styles.sealed,
        ]}
      >
        {hidden ? (
          <View style={styles.sealedRow}>
            <Ionicons name="lock-closed" size={16} color={colors.primaryDark} />
            <View>
              <Text style={styles.sealedTitle}>Sealed note</Text>
              <Text style={styles.sealedBody}>{opens ?? "Opens later"}</Text>
            </View>
          </View>
        ) : (
          <>
            {kind === "image" && imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : null}
            {kind === "image" && !imageUrl ? (
              <View style={styles.imageFallback}>
                <Ionicons name="image-outline" size={28} color={colors.onPrimary} />
              </View>
            ) : null}
            {text ? (
              <Text style={[styles.text, mine ? styles.mineText : styles.theirsText]}>
                {text}
              </Text>
            ) : null}
          </>
        )}
      </View>
      <Text style={[styles.time, mine ? styles.mineTime : styles.theirsTime]}>
        {formatClock(createdAt)}
        {mine && opens ? ` · ${opens}` : ""}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    maxWidth: "82%",
    marginVertical: 4,
    gap: 4,
  },
  mineWrap: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirsWrap: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  imageBubble: {
    padding: 4,
    overflow: "hidden",
  },
  mine: {
    backgroundColor: colors.bubbleMe,
    borderBottomRightRadius: 6,
  },
  theirs: {
    backgroundColor: colors.bubbleThem,
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  mineText: {
    color: colors.onPrimary,
  },
  theirsText: {
    color: colors.onSurface,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  imageFallback: {
    width: 220,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  sealed: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    borderBottomLeftRadius: 6,
  },
  sealedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sealedTitle: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 14,
  },
  sealedBody: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  mineTime: {
    marginRight: 4,
  },
  theirsTime: {
    marginLeft: 4,
  },
});