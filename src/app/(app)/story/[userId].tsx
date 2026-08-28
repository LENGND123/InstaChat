import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenSpinner } from "@/components/empty-state";
import { colors } from "@/constants/colors";
import { useNow } from "@/hooks/use-now";
import { api, type Id } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const SLIDE_MS = 4500;

export default function StoryScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const now = useNow(1000);
  const group = useQuery(
    api.stories.forUser,
    sessionToken
      ? { sessionToken, userId: userId as Id<"users">, now }
      : "skip",
  );
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());

  const stories = group?.stories ?? [];
  const current = stories[index];
  const progress = useMemo(() => {
    const elapsed = Date.now() - startedAt;
    return Math.min(1, elapsed / SLIDE_MS);
  }, [now, startedAt]);

  useEffect(() => {
    setIndex(0);
    setStartedAt(Date.now());
  }, [userId]);

  useEffect(() => {
    if (!current) {
      return;
    }
    const timeout = setTimeout(() => {
      if (index >= stories.length - 1) {
        router.back();
        return;
      }
      setIndex((value) => value + 1);
      setStartedAt(Date.now());
    }, SLIDE_MS);
    return () => clearTimeout(timeout);
  }, [current, index, router, stories.length]);

  if (group === undefined) {
    return <ScreenSpinner />;
  }

  if (!group || !current) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={24} color={colors.onPrimary} />
        </Pressable>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This story expired.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function goNext() {
    if (index >= stories.length - 1) {
      router.back();
      return;
    }
    setIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  function goPrev() {
    if (index === 0) {
      router.back();
      return;
    }
    setIndex((value) => value - 1);
    setStartedAt(Date.now());
  }

  return (
    <View style={styles.safe}>
      {current.mediaUrl ? (
        <Image source={{ uri: current.mediaUrl }} style={styles.media} contentFit="cover" />
      ) : (
        <View style={styles.media} />
      )}
      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.progressRow}>
          {stories.map((story, storyIndex) => (
            <View key={story._id} style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width:
                      storyIndex < index
                        ? "100%"
                        : storyIndex === index
                          ? `${Math.round(progress * 100)}%`
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.top}>
          <Text style={styles.name}>{group.user.name}</Text>
          <Pressable onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>
      <View style={styles.taps}>
        <Pressable style={styles.tap} onPress={goPrev} />
        <Pressable style={styles.tap} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#09060F" },
  media: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#140F1C" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, paddingHorizontal: 12 },
  progressRow: { flexDirection: "row", gap: 4, marginTop: 8 },
  track: { flex: 1, height: 3, backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "white" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  name: { color: "white", fontWeight: "700", fontSize: 16 },
  close: { padding: 6 },
  taps: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, flexDirection: "row", zIndex: 1 },
  tap: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "white" },
});
