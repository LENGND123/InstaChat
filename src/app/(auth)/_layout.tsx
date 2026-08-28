import { Redirect, Stack } from "expo-router";

import { BootScreen } from "@/components/boot-screen";
import { colors } from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";

export default function AuthGroupLayout() {
  const { hydrated, sessionToken, user } = useAuth();

  if (!hydrated || (sessionToken && user === undefined)) {
    return <BootScreen />;
  }

  if (sessionToken && user) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
