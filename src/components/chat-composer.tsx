import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";

type ChatComposerProps = {
  onSendText: (text: string) => Promise<void>;
  onSendImage: () => Promise<void>;
};

export const ChatComposer = memo(function ChatComposer({
  onSendText,
  onSendImage,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const empty = draft.trim().length === 0;

  async function sendText() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setDraft("");
    setSending(true);
    try {
      await onSendText(text);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  async function sendImage() {
    if (sending) {
      return;
    }
    setSending(true);
    try {
      await onSendImage();
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.composer}>
      <Pressable onPress={() => void sendImage()} style={styles.iconBtn}>
        <Ionicons name="image-outline" size={22} color={colors.primary} />
      </Pressable>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Message"
        placeholderTextColor={colors.onSurfaceVariant}
        style={styles.input}
        blurOnSubmit={false}
        autoCorrect={false}
        returnKeyType={Platform.OS === "web" ? "default" : "send"}
        onSubmitEditing={(event) => {
          event.preventDefault();
          void sendText();
        }}
      />
      <Pressable
        onPress={() => void sendText()}
        disabled={sending || empty}
        style={[styles.send, (sending || empty) && styles.sendDisabled]}
      >
        <Ionicons name="send" size={16} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
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
