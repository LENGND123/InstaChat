import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  online?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

export function Avatar({ name, uri, size = 48, online }: AvatarProps) {
  const radius = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>
            {initials(name)}
          </Text>
        </View>
      )}
      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: Math.max(10, size * 0.22),
              height: Math.max(10, size * 0.22),
              borderRadius: size,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
