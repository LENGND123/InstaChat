import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { type ComponentProps, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      await signUp({ name, handle, email, password });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>Join InstaChat</Text>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>
            Pick a handle, add your name, and you can start chatting instantly.
          </Text>

          <View style={styles.form}>
            <Field icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} />
            <Field
              icon="at-outline"
              placeholder="Handle"
              autoCapitalize="none"
              value={handle}
              onChangeText={setHandle}
            />
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
                <Text style={styles.ctaText}>{busy ? "Creating…" : "Create account"}</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.switch}>
              Already have an account?{" "}
              <Link href="/(auth)/sign-in" style={styles.link}>
                Sign in
              </Link>
            </Text>
          </View>
        </ScrollView>
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
  flex: { flex: 1 },
  content: { padding: 24, gap: 10, paddingBottom: 40 },
  kicker: { color: colors.primary, fontWeight: "700", marginTop: 12 },
  title: { fontSize: 30, fontWeight: "800", color: colors.onSurface },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.onSurfaceVariant, marginBottom: 8 },
  form: { gap: 12, marginTop: 8 },
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
    marginTop: 4,
  },
  ctaText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.7 },
  switch: { textAlign: "center", color: colors.onSurfaceVariant, marginTop: 8 },
  link: { color: colors.primary, fontWeight: "700" },
});
