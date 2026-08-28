import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatRow } from "@/components/chat-row";
import { EmptyState, ScreenSpinner } from "@/components/empty-state";
import { StoryBar } from "@/components/story-bar";
import { colors } from "@/constants/colors";
import { useNow } from "@/hooks/use-now";
import { api } from "@/lib/api";
import { pickMedia, uploadToConvex } from "@/lib/media";
import { useAuth } from "@/providers/auth-provider";

export default function ChatsScreen() {
  const router = useRouter();
  const { sessionToken, user } = useAuth();
  const now = useNow();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createStory = useMutation(api.stories.create);

  const conversations = useQuery(
    api.conversations.list,
    sessionToken ? { sessionToken, now } : "skip",
  );
  const stories = useQuery(
    api.stories.listActive,
    sessionToken ? { sessionToken, now } : "skip",
  );

  async function addStory() {
    if (!sessionToken) {
      return;
    }
    try {
      const media = await pickMedia(["images", "videos"]);
      if (!media) {
        return;
      }
      const uploadUrl = await generateUploadUrl({ sessionToken });
      const storageId = await uploadToConvex(uploadUrl, media);
      await createStory({
        sessionToken,
        mediaStorageId: storageId,
        mediaType: media.mediaType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add story";
      Alert.alert("Story", message);
    }
  }

  if (!user || conversations === undefined || stories === undefined) {
    return <ScreenSpinner />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>InstaChat</Text>
          <Text style={styles.title}>Chats</Text>
        </View>
        <Text style={styles.me}>@{user.handle}</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversationId}
        ListHeaderComponent={
          <StoryBar
            groups={stories}
            currentUserId={user._id}
            onAdd={() => void addStory()}
            onOpen={(userId) => router.push(`/(app)/story/${userId}`)}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No conversations yet"
            body="Search for Maya, Jordan, or a friend and send the first message."
          />
        }
        renderItem={({ item }) => (
          <ChatRow
            name={item.otherUser.name}
            handle={item.otherUser.handle}
            avatarUrl={item.otherUser.avatarUrl}
            online={item.otherUser.isOnline}
            lastMessage={item.lastMessage}
            lastMessageKind={item.lastMessageKind}
            lastMessageAt={item.lastMessageAt}
            unreadCount={item.unreadCount}
            now={now}
            onPress={() => router.push(`/(app)/chat/${item.conversationId}`)}
          />
        )}
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  kicker: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  title: { fontSize: 28, fontWeight: "800", color: colors.onSurface },
  me: { color: colors.onSurfaceVariant, fontWeight: "600", marginBottom: 4 },
  emptyList: { flexGrow: 1 },
});
