import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { type ComponentProps, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/app-shell";
import { colors } from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(nextEmail = email, nextPassword = password) {
    setError(null);
    setBusy(true);
    try {
      await signIn(nextEmail, nextPassword);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.hero}>
          <BrandMark />
          <Text style={styles.title}>InstaChat</Text>
          <Text style={styles.subtitle}>
            Real-time messages, stories, and presence — the full-stack chat app from the GreatStack tutorial.
          </Text>
        </View>

        <View style={styles.form}>
          <Field
            icon="mail-outline"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable disabled={busy} onPress={() => void submit()}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cta, busy && styles.disabled]}
            >
              <Text style={styles.ctaText}>{busy ? "Signing in…" : "Sign in"}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.demoRow}>
            <Pressable
              style={styles.demo}
              onPress={() => void submit("maya@instachat.dev", "demo1234")}
            >
              <Text style={styles.demoText}>Try as Maya</Text>
            </Pressable>
            <Pressable
              style={styles.demo}
              onPress={() => void submit("jordan@instachat.dev", "demo1234")}
            >
              <Text style={styles.demoText}>Try as Jordan</Text>
            </Pressable>
          </View>

          <Text style={styles.switch}>
            New here?{" "}
            <Link href="/(auth)/sign-up" style={styles.link}>
              Create an account
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  icon,
  ...props
}: ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={colors.onSurfaceVariant} />
      <TextInput
        placeholderTextColor={colors.onSurfaceVariant}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, justifyContent: "space-between", padding: 24 },
  hero: { gap: 10, paddingTop: 24 },
  title: { fontSize: 32, fontWeight: "800", color: colors.onSurface },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.onSurfaceVariant, maxWidth: 340 },
  form: { gap: 12, paddingBottom: 12 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 16 },
  error: { color: colors.danger, fontSize: 13 },
  cta: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.7 },
  demoRow: { flexDirection: "row", gap: 10 },
  demo: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  demoText: { color: colors.primaryDark, fontWeight: "700" },
  switch: { textAlign: "center", color: colors.onSurfaceVariant, marginTop: 4 },
  link: { color: colors.primary, fontWeight: "700" },
});
