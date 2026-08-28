import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

function useBlockNativeFormSubmit() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const onSubmit = (event: Event) => {
      event.preventDefault();
    };
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
}

export function AppShell({ children }: { children: ReactNode }) {
  useBlockNativeFormSubmit();

  if (Platform.OS !== "web") {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.webPage}>
      <View style={styles.phone}>
        {children}
      </View>
    </View>
  );
}

export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      <View style={styles.markInner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webPage: {
    flex: 1,
    backgroundColor: "#120C1C",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    height: "100%",
    maxHeight: 920,
    backgroundColor: colors.background,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  mark: {
    alignItems: "center",
    justifyContent: "center",
  },
  markInner: {
    width: "42%",
    height: "42%",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "white",
    transform: [{ rotate: "18deg" }],
  },
});
