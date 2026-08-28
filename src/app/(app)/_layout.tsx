import { Redirect, Stack } from "expo-router";

import { BootScreen } from "@/components/boot-screen";
import { colors } from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";

export default function AppGroupLayout() {
  const { hydrated, sessionToken, user } = useAuth();

  if (!hydrated || (sessionToken && user === undefined)) {
    return <BootScreen />;
  }

  if (!sessionToken || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen
        name="story/[userId]"
        options={{ animation: "fade", presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
