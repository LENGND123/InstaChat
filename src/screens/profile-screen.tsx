import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { ScreenSpinner } from "@/components/empty-state";
import { colors } from "@/constants/colors";
import { api, type Id } from "@/lib/api";
import { pickMedia, uploadToConvex } from "@/lib/media";
import { useAuth } from "@/providers/auth-provider";

export default function ProfileScreen() {
  const { user, sessionToken, signOut } = useAuth();
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState(user?.name ?? "");
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [avatarStorageId, setAvatarStorageId] = useState<Id<"_storage"> | undefined>(
    undefined,
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!user || !sessionToken) {
    return <ScreenSpinner />;
  }

  const token = sessionToken;

  async function changePhoto() {
    try {
      const media = await pickMedia(["images"]);
      if (!media) {
        return;
      }
      setAvatarUrl(media.uri);
      const uploadUrl = await generateUploadUrl({ sessionToken: token });
      const storageId = await uploadToConvex(uploadUrl, media);
      setAvatarStorageId(storageId);
    } catch (error) {
      Alert.alert("Photo", error instanceof Error ? error.message : "Could not update photo");
    }
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      await updateProfile({
        sessionToken: token,
        name,
        handle,
        bio,
        avatarStorageId,
      });
      setStatus("Profile saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Pressable onPress={() => void changePhoto()} style={styles.avatarWrap}>
          <Avatar name={name || user.name} uri={avatarUrl} size={96} />
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color={colors.onPrimary} />
          </View>
        </Pressable>
        <Text style={styles.email}>{user.email}</Text>

        <Label>Name</Label>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <Label>Handle</Label>
        <TextInput
          value={handle}
          onChangeText={setHandle}
          autoCapitalize="none"
          style={styles.input}
        />
        <Label>Bio</Label>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          style={[styles.input, styles.bio]}
          placeholder="A short line about you"
          placeholderTextColor={colors.onSurfaceVariant}
        />

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <Pressable onPress={() => void save()} style={[styles.button, styles.primary]}>
          <Text style={styles.primaryText}>{busy ? "Saving…" : "Save changes"}</Text>
        </Pressable>
        <Pressable onPress={() => void signOut()} style={[styles.button, styles.ghost]}>
          <Text style={styles.ghostText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: colors.onSurface, marginBottom: 8 },
  avatarWrap: { alignSelf: "center", marginVertical: 8 },
  editBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  email: { textAlign: "center", color: colors.onSurfaceVariant, marginBottom: 8 },
  label: { color: colors.onSurfaceVariant, fontWeight: "700", marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    minHeight: 48,
    color: colors.onSurface,
    fontSize: 16,
  },
  bio: { minHeight: 96, textAlignVertical: "top", paddingTop: 12 },
  status: { color: colors.primary, fontWeight: "600", textAlign: "center", marginTop: 8 },
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: colors.onPrimary, fontWeight: "700", fontSize: 16 },
  ghost: { backgroundColor: colors.primarySoft },
  ghostText: { color: colors.danger, fontWeight: "700", fontSize: 16 },
});
