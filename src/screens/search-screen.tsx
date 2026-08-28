import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { colors } from "@/constants/colors";
import { useNow } from "@/hooks/use-now";
import { api, type Id } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function SearchScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const now = useNow();
  const [query, setQuery] = useState("");
  const getOrCreate = useMutation(api.conversations.getOrCreate);

  const results = useQuery(
    api.users.search,
    sessionToken ? { sessionToken, query, now } : "skip",
  );

  async function openChat(userId: Id<"users">) {
    if (!sessionToken) {
      return;
    }
    const conversationId = await getOrCreate({ sessionToken, otherUserId: userId });
    router.push(`/(app)/chat/${conversationId}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or handle"
            placeholderTextColor={colors.onSurfaceVariant}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={(event) => {
              event.preventDefault();
            }}
            style={styles.input}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {results === undefined ? (
        <ActivityIndicator style={styles.spinner} color={colors.primary} />
      ) : query.trim().length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Find someone to chat with"
          body="Try maya or jordan, or search the name of anyone who already signed up."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No people found"
          body="Check the spelling, or invite them to create an InstaChat account."
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void openChat(item._id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Avatar name={item.name} uri={item.avatarUrl} online={item.isOnline} size={50} />
              <View style={styles.copy}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.handle}>@{item.handle}</Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    zIndex: 1,
  },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontWeight: "800", color: colors.onSurface },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    height: 48,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 16 },
  spinner: { marginTop: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pressed: { backgroundColor: colors.primarySoft },
  copy: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  handle: { color: colors.onSurfaceVariant, marginTop: 2 },
});
