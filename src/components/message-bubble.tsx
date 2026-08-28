import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { formatClock } from "@/lib/time";

type MessageBubbleProps = {
  mine: boolean;
  kind: "text" | "image";
  text?: string;
  imageUrl: string | null;
  createdAt: number;
};

export const MessageBubble = memo(function MessageBubble({
  mine,
  kind,
  text,
  imageUrl,
  createdAt,
}: MessageBubbleProps) {
  return (
    <View style={[styles.wrap, mine ? styles.mineWrap : styles.theirsWrap]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          kind === "image" && styles.imageBubble,
        ]}
      >
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
      </View>
      <Text style={[styles.time, mine ? styles.mineTime : styles.theirsTime]}>
        {formatClock(createdAt)}
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