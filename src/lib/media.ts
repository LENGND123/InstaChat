import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import type { Id } from "./api";

export type PickedMedia = {
  uri: string;
  mimeType: string;
  mediaType: "image" | "video";
};

type MediaKind = "images" | "videos";

export async function pickMedia(
  mediaTypes: MediaKind[] = ["images"],
): Promise<PickedMedia | null> {
  if (Platform.OS !== "web") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Photo library permission is required");
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    quality: 0.82,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";
  const mediaType: "image" | "video" = mimeType.startsWith("video")
    ? "video"
    : "image";

  return {
    uri: asset.uri,
    mimeType,
    mediaType,
  };
}

export async function uploadToConvex(
  uploadUrl: string,
  media: PickedMedia,
): Promise<Id<"_storage">> {
  const fileResponse = await fetch(media.uri);
  const blob = await fileResponse.blob();
  const uploaded = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": media.mimeType },
    body: blob,
  });
  if (!uploaded.ok) {
    throw new Error("Upload failed. Try another photo.");
  }
  const payload = (await uploaded.json()) as { storageId: Id<"_storage"> };
  return payload.storageId;
}
