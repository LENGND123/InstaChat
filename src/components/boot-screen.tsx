import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

export function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
