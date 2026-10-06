import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

import { BrandMark } from "@/components/app-shell";
import { colors } from "@/constants/colors";
import { readAuthError } from "@/lib/auth-error";
import { useAuth } from "@/providers/auth-provider";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local
    .replace(/[._-]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();
  return words.length >= 2 ? words : "";
}

function handleFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase().replace(/[^a-z0-9._]/g, "");
  return local.slice(0, 20);
}

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(nextEmail = email, nextPassword = password) {
    setError(null);
    setBusy(true);
    try {
      await signIn(nextEmail, nextPassword);
      router.replace("/");
    } catch (err) {
      const info = readAuthError(err, "Could not sign in");
      if (info.code === "unknown_email") {
        setCreating(true);
        setName((current) => current || nameFromEmail(nextEmail));
        setHandle((current) => current || handleFromEmail(nextEmail));
        setError("No account for this email yet. Add your name and handle to create one.");
      } else {
        setError(info.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function createAccount() {
    setError(null);
    setBusy(true);
    try {
      await signUp({ name, handle, email, password });
      router.replace("/");
    } catch (err) {
      setError(readAuthError(err, "Could not create account").message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flexGrow}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.flex}
          keyboardShouldPersistTaps="handled"
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
            placeholder="Password (6+ characters)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {creating ? (
            <>
              <Field
                icon="person-outline"
                placeholder="Full name"
                value={name}
                onChangeText={setName}
              />
              <Field
                icon="at-outline"
                placeholder="Handle"
                autoCapitalize="none"
                value={handle}
                onChangeText={setHandle}
              />
            </>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={busy}
            onPress={() => void (creating ? createAccount() : submit())}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cta, busy && styles.disabled]}
            >
              <Text style={styles.ctaText}>
                {busy ? "Please wait…" : creating ? "Create account" : "Sign in"}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={() => {
              setCreating((current) => !current);
              setError(null);
              if (!name) setName(nameFromEmail(email));
              if (!handle) setHandle(handleFromEmail(email));
            }}
          >
            <Text style={styles.switch}>
              {creating ? "Already have an account? " : "New here? "}
              <Text style={styles.link}>{creating ? "Sign in" : "Create an account"}</Text>
            </Text>
          </Pressable>

          <Text style={styles.demoLabel}>Or try a demo account</Text>
          <View style={styles.demoRow}>
            <Pressable
              style={styles.demo}
              onPress={() => {
                setCreating(false);
                void submit("maya@instachat.dev", "demo1234");
              }}
            >
              <Text style={styles.demoText}>Try as Maya</Text>
            </Pressable>
            <Pressable
              style={styles.demo}
              onPress={() => {
                setCreating(false);
                void submit("jordan@instachat.dev", "demo1234");
              }}
            >
              <Text style={styles.demoText}>Try as Jordan</Text>
            </Pressable>
          </View>
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
  flexGrow: { flex: 1 },
  flex: { flexGrow: 1, justifyContent: "space-between", padding: 24 },
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
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  cta: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.7 },
  demoLabel: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
  },
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
