import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { EmptyState, ScreenSpinner } from "@/components/empty-state";
import { MessageBubble } from "@/components/message-bubble";
import { colors } from "@/constants/colors";
import { useNow } from "@/hooks/use-now";
import { api, type Id } from "@/lib/api";
import { pickMedia, uploadToConvex } from "@/lib/media";
import { formatLastSeen } from "@/lib/time";
import { useAuth } from "@/providers/auth-provider";

const SEAL_OPTIONS = [
  { label: "1 min", ms: 60_000 },
  { label: "1 hour", ms: 3_600_000 },
  { label: "Tomorrow", ms: 86_400_000 },
] as const;

export default function ChatScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id as Id<"conversations">;
  const now = useNow(1000);
  const [draft, setDraft] = useState("");
  const [sealForMs, setSealForMs] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const conversations = useQuery(
    api.conversations.list,
    sessionToken ? { sessionToken, now } : "skip",
  );
  const messages = useQuery(
    api.messages.list,
    sessionToken ? { sessionToken, conversationId } : "skip",
  );
  const send = useMutation(api.messages.send);
  const markRead = useMutation(api.messages.markRead);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const conversation = conversations?.find((item) => item.conversationId === conversationId);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }
    void markRead({ sessionToken, conversationId }).catch(() => undefined);
  }, [conversationId, markRead, messages?.length, sessionToken]);

  async function sendText() {
    if (!sessionToken || !draft.trim()) {
      return;
    }
    const text = draft.trim();
    setDraft("");
    setSending(true);
    try {
      await send({
        sessionToken,
        conversationId,
        text,
        sealForMs: sealForMs ?? undefined,
      });
      setSealForMs(null);
    } catch (error) {
      setDraft(text);
      Alert.alert("Message", error instanceof Error ? error.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  async function sendImage() {
    if (!sessionToken) {
      return;
    }
    try {
      const media = await pickMedia(["images"]);
      if (!media) {
        return;
      }
      setSending(true);
      const uploadUrl = await generateUploadUrl({ sessionToken });
      const storageId = await uploadToConvex(uploadUrl, media);
      await send({
        sessionToken,
        conversationId,
        imageStorageId: storageId,
        sealForMs: sealForMs ?? undefined,
      });
      setSealForMs(null);
    } catch (error) {
      Alert.alert("Photo", error instanceof Error ? error.message : "Could not send photo");
    } finally {
      setSending(false);
    }
  }

  if (!conversation || messages === undefined) {
    return <ScreenSpinner />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Avatar
          name={conversation.otherUser.name}
          uri={conversation.otherUser.avatarUrl}
          online={conversation.otherUser.isOnline}
          size={40}
        />
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{conversation.otherUser.name}</Text>
          <Text style={styles.status}>
            {formatLastSeen(
              conversation.otherUser.lastSeen,
              now,
              conversation.otherUser.isOnline,
            )}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="sparkles-outline"
              title={`Say hi to ${conversation.otherUser.name.split(" ")[0]}`}
              body="Messages land instantly on every device signed into this account."
            />
          }
          renderItem={({ item }) => (
            <MessageBubble
              mine={item.mine}
              kind={item.kind}
              text={item.text}
              imageUrl={item.imageUrl}
              createdAt={item.createdAt}
              sealed={item.sealed}
              unlockAt={item.unlockAt}
              now={now}
            />
          )}
        />

        <View style={styles.composerWrap}>
          {sealForMs ? (
            <Text style={styles.sealHint}>
              Sealed note. {conversation.otherUser.name.split(" ")[0]} cannot read it until it opens.
            </Text>
          ) : null}
          <View style={styles.seals}>
            <Pressable
              onPress={() => setSealForMs(null)}
              style={[styles.seal, sealForMs === null && styles.sealOn]}
            >
              <Text style={[styles.sealText, sealForMs === null && styles.sealTextOn]}>Now</Text>
            </Pressable>
            {SEAL_OPTIONS.map((option) => (
              <Pressable
                key={option.ms}
                onPress={() => setSealForMs(option.ms)}
                style={[styles.seal, sealForMs === option.ms && styles.sealOn]}
              >
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color={sealForMs === option.ms ? colors.onPrimary : colors.primary}
                />
                <Text style={[styles.sealText, sealForMs === option.ms && styles.sealTextOn]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        <View style={styles.composer}>
          <Pressable onPress={() => void sendImage()} style={styles.iconBtn}>
            <Ionicons name="image-outline" size={22} color={colors.primary} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={sealForMs ? "Write a sealed note" : "Message"}
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.input}
            onSubmitEditing={() => void sendText()}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => void sendText()}
            disabled={sending || draft.trim().length === 0}
            style={[styles.send, (sending || !draft.trim()) && styles.sendDisabled]}
          >
            <Ionicons name="send" size={16} color={colors.onPrimary} />
          </Pressable>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    backgroundColor: colors.surface,
  },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  status: { fontSize: 12, color: colors.onSurfaceVariant },
  list: { padding: 16, flexGrow: 1 },
  composerWrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    paddingTop: 8,
  },
  sealHint: {
    color: colors.primaryDark,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  seals: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  seal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
  },
  sealOn: {
    backgroundColor: colors.primary,
  },
  sealText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  sealTextOn: {
    color: colors.onPrimary,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    color: colors.onSurface,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.45 },
});
