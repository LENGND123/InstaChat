import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import ChatsScreen from "@/screens/chats-screen";
import ProfileScreen from "@/screens/profile-screen";
import SearchScreen from "@/screens/search-screen";

type TabId = "chats" | "search" | "profile";

const TABS: { id: TabId; label: string; icon: "chatbubbles" | "search" | "person" }[] = [
  { id: "chats", label: "Chats", icon: "chatbubbles" },
  { id: "search", label: "Search", icon: "search" },
  { id: "profile", label: "Profile", icon: "person" },
];

function ActiveScreen({ tab }: { tab: TabId }) {
  switch (tab) {
    case "chats":
      return <ChatsScreen />;
    case "search":
      return <SearchScreen />;
    case "profile":
      return <ProfileScreen />;
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export default function AppHome() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>("chats");

  return (
    <View style={styles.wrap}>
      <View style={styles.body}>
        <ActiveScreen tab={tab} />
      </View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((item) => {
          const active = item.id === tab;
          const color = active ? colors.primary : colors.onSurfaceVariant;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(item.id)}
              style={styles.item}
            >
              <Ionicons name={item.icon} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLowest,
    borderTopColor: colors.outline,
    borderTopWidth: 1,
    paddingTop: 6,
    minHeight: 56,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 48,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
