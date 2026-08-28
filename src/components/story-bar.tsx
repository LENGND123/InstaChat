import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { colors } from "@/constants/colors";

type StoryUser = {
  _id: string;
  name: string;
  avatarUrl: string | null;
};

type StoryBarProps = {
  groups: Array<{
    user: StoryUser;
    stories: unknown[];
  }>;
  currentUserId: string;
  onAdd: () => void;
  onOpen: (userId: string) => void;
};

export function StoryBar({
  groups,
  currentUserId,
  onAdd,
  onOpen,
}: StoryBarProps) {
  const mine = groups.find((group) => group.user._id === currentUserId);
  const others = groups.filter((group) => group.user._id !== currentUserId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable onPress={onAdd} style={styles.item}>
        <View>
          <Avatar
            name="You"
            uri={mine?.user.avatarUrl}
            size={64}
          />
          <View style={styles.addBadge}>
            <Text style={styles.addPlus}>+</Text>
          </View>
        </View>
        <Text style={styles.label} numberOfLines={1}>
          Your story
        </Text>
      </Pressable>

      {others.map((group) => (
        <Pressable
          key={group.user._id}
          onPress={() => onOpen(group.user._id)}
          style={styles.item}
        >
          <LinearGradient
            colors={[colors.accent, colors.primary]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.ring}
          >
            <View style={styles.ringInner}>
              <Avatar name={group.user.name} uri={group.user.avatarUrl} size={58} />
            </View>
          </LinearGradient>
          <Text style={styles.label} numberOfLines={1}>
            {group.user.name.split(" ")[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  item: {
    width: 72,
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  addBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  addPlus: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: -1,
  },
  ring: {
    padding: 3,
    borderRadius: 999,
  },
  ringInner: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 2,
  },
});
