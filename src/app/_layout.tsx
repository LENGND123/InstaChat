import { type ReactNode } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { BootScreen } from "@/components/boot-screen";
import { colors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";

function AuthGate({ children }: { children: ReactNode }) {
  const { hydrated, sessionToken, user } = useAuth();
  const segments = useSegments();

  if (!hydrated) {
    return <BootScreen />;
  }

  if (sessionToken && user === undefined) {
    return <BootScreen />;
  }

  const signedIn = Boolean(sessionToken && user);
  const inAuthGroup = segments[0] === "(auth)";

  if (!signedIn && !inAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (signedIn && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return children;
}

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <AppShell>
          <StatusBar style="dark" />
          <AuthGate>
            <View style={styles.stack}>
              <Slot />
            </View>
          </AuthGate>
        </AppShell>
      </AuthProvider>
    </ConvexClientProvider>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
