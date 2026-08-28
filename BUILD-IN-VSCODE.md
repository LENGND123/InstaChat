# Build InstaChat in VS Code (step by step)

Two ways to get the app:

1. **Zip (fastest)** — unzip `InstaChat-VSCode.zip`, open that folder in VS Code, run the commands in Step 0.
2. **Type it yourself** — create an empty folder, then add the files below in order. Each step is the complete file, ready to paste.

This is the GreatStack Expo chat app, with **Convex** instead of Clerk + Express + MongoDB + Cloudinary.

## Step 0 — Open in VS Code and run

Install [VS Code](https://code.visualstudio.com/), [Node 22+](https://nodejs.org/), and [pnpm](https://pnpm.io).

1. Unzip the project (or clone the repo).
2. **File → Open Folder…** and pick the `instachat` folder (the one that contains `package.json`).
3. Install recommended extensions when VS Code asks (Expo Tools, ESLint).
4. **Terminal → New Terminal** and run:

```bash
pnpm install
pnpm exec convex login
pnpm convex:dev
```

5. Copy the Convex URL into a new file named `.env.local`:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

6. **Terminal → New Terminal** (second tab) and run:

```bash
pnpm web
```

7. Open http://localhost:43127

Or use **Terminal → Run Task… → Start InstaChat**.

Demo logins (password `demo1234`):

- Maya — `maya@instachat.dev`
- Jordan — `jordan@instachat.dev`

On a phone: `pnpm start` and scan the QR code with Expo Go.

Use `pnpm convex:dev` while you code. Do not use `convex deploy` unless you mean production.

---

## Step 1 — Project files (create the Expo app)

In VS Code: File → Open Folder on an empty `instachat` folder. Create these files first, then run `pnpm install`.

### `package.json`

```json
{
  "name": "instachat",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web --port 43127",
    "lint": "eslint convex",
    "typecheck": "tsc --noEmit",
    "convex:dev": "convex dev"
  },
  "dependencies": {
    "@expo/ui": "~57.0.12",
    "@expo/vector-icons": "^15.1.1",
    "convex": "^1.45.0",
    "convex-helpers": "^0.1.123",
    "expo": "~57.0.15",
    "expo-constants": "~57.0.13",
    "expo-device": "~57.0.1",
    "expo-font": "~57.0.1",
    "expo-glass-effect": "~57.0.1",
    "expo-image": "~57.0.3",
    "expo-image-picker": "^57.0.12",
    "expo-linear-gradient": "^57.0.1",
    "expo-linking": "~57.0.7",
    "expo-router": "~57.0.15",
    "expo-secure-store": "^57.0.1",
    "expo-splash-screen": "~57.0.7",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.2",
    "expo-system-ui": "~57.0.2",
    "expo-web-browser": "~57.0.2",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.2",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@convex-dev/eslint-plugin": "^4.0.0",
    "@types/react": "~19.2.2",
    "eslint": "^10.9.0",
    "typescript": "~6.0.3",
    "typescript-eslint": "^8.67.0"
  }
}
```

### `app.json`

```json
{
  "expo": {
    "name": "InstaChat",
    "slug": "instachat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "instachat",
    "userInterfaceStyle": "light",
    "ios": {
      "icon": "./assets/expo.icon",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "InstaChat uses your photos for avatars, chat images, and stories."
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#EDE9FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "InstaChat uses your photos for avatars, chat images, and stories."
        }
      ],
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#6D28D9",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### `eslint.config.mjs`

```js
import convexPlugin from "@convex-dev/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["convex/_generated/**"],
  },
  ...tseslint.configs.recommended,
  ...convexPlugin.configs.recommended,
  {
    files: ["convex/**/*.ts"],
    rules: {
      "@convex-dev/explicit-table-ids": "off",
    },
  },
);
```

### `.gitignore`

```text
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env
.env*.local

# typescript
*.tsbuildinfo

example

# Convex local backend
.convex/

# Agent scratch
agent-tools/

# Downloadable snapshot (regenerate with scripts if needed)
*.zip
```

### `.env.example`

```text
# Paste the URL printed by `pnpm convex:dev`
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### `.vscode/extensions.json`

```json
{
  "recommendations": [
    "expo.vscode-expo-tools",
    "dbaeumer.vscode-eslint"
  ]
}
```

### `.vscode/settings.json`

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Install dependencies",
      "type": "shell",
      "command": "pnpm install",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      }
    },
    {
      "label": "Convex backend",
      "type": "shell",
      "command": "pnpm convex:dev",
      "isBackground": true,
      "problemMatcher": {
        "owner": "convex",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".",
          "endsPattern": "Convex functions ready"
        }
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "group": "instachat-dev"
      }
    },
    {
      "label": "Expo web",
      "type": "shell",
      "command": "pnpm web",
      "isBackground": true,
      "problemMatcher": {
        "owner": "expo",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".",
          "endsPattern": "Logs for your project will appear below"
        }
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "group": "instachat-dev"
      }
    },
    {
      "label": "Expo Go (phone)",
      "type": "shell",
      "command": "pnpm start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "expo",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".",
          "endsPattern": "Logs for your project will appear below"
        }
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      }
    },
    {
      "label": "Start InstaChat",
      "dependsOn": ["Convex backend", "Expo web"],
      "dependsOrder": "parallel",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": []
    }
  ]
}
```

## Step 2 — Theme

Same as the video color tokens. Import `colors` in every screen.

### `src/constants/colors.ts`

```ts
export const colors = {
  primary: "#6D28D9",
  primaryDark: "#4C1D95",
  primarySoft: "#EDE9FE",
  primaryContainer: "#DDD6FE",
  accent: "#F43F5E",
  online: "#22C55E",
  background: "#F4F1FA",
  surface: "#FFFFFF",
  surfaceLowest: "#FFFFFF",
  surfaceMuted: "#EEEAF6",
  onSurface: "#161221",
  onSurfaceVariant: "#6F6680",
  onPrimary: "#FFFFFF",
  outline: "#E4DEF0",
  danger: "#E11D48",
  bubbleMe: "#6D28D9",
  bubbleThem: "#EEEAF6",
  overlay: "rgba(15, 10, 25, 0.72)",
} as const;
```

## Step 3 — Shared client helpers

Time, session storage, Convex client, and small UI pieces used by later screens.

### `src/hooks/use-now.ts`

```ts
import { useEffect, useState } from "react";

export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
```

### `src/lib/time.ts`

```ts
export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatChatTime(timestamp: number, now: number): string {
  const delta = now - timestamp;
  if (delta < 60_000) {
    return "now";
  }
  if (delta < 60 * 60_000) {
    return `${Math.floor(delta / 60_000)}m`;
  }
  const date = new Date(timestamp);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday.getTime()) {
    return formatClock(timestamp);
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatLastSeen(lastSeen: number, now: number, online: boolean): string {
  if (online) {
    return "Online";
  }
  if (lastSeen <= 0) {
    return "Offline";
  }
  const delta = now - lastSeen;
  if (delta < 60_000) {
    return "Last seen just now";
  }
  if (delta < 60 * 60_000) {
    return `Last seen ${Math.floor(delta / 60_000)}m ago`;
  }
  return `Last seen ${formatChatTime(lastSeen, now)}`;
}
```

### `src/lib/session.ts`

```ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "instachat.sessionToken";

export async function loadSessionToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveSessionToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

### `src/lib/api.ts`

```ts
export { api } from "../../convex/_generated/api";
export type { Id } from "../../convex/_generated/dataModel";
```

### `src/lib/media.ts`

```ts
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
```

### `src/providers/convex-provider.tsx`

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

function getConvexUrl(): string {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing EXPO_PUBLIC_CONVEX_URL. Run `pnpm convex:dev` and copy the deployment URL into .env.local.",
    );
  }
  return url;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => new ConvexReactClient(getConvexUrl()), []);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
```

### `src/components/boot-screen.tsx`

```tsx
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

export function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
```

### `src/components/app-shell.tsx`

```tsx
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

function useBlockNativeFormSubmit() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const onSubmit = (event: Event) => {
      event.preventDefault();
    };
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
}

export function AppShell({ children }: { children: ReactNode }) {
  useBlockNativeFormSubmit();

  if (Platform.OS !== "web") {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.webPage}>
      <View style={styles.phone}>
        {children}
      </View>
    </View>
  );
}

export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      <View style={styles.markInner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webPage: {
    flex: 1,
    backgroundColor: "#120C1C",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    height: "100%",
    maxHeight: 920,
    backgroundColor: colors.background,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  mark: {
    alignItems: "center",
    justifyContent: "center",
  },
  markInner: {
    width: "42%",
    height: "42%",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "white",
    transform: [{ rotate: "18deg" }],
  },
});
```

### `src/components/empty-state.tsx`

```tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function ScreenSpinner() {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  spinner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

### `src/components/avatar.tsx`

```tsx
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  online?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

export function Avatar({ name, uri, size = 48, online }: AvatarProps) {
  const radius = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: radius }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>
            {initials(name)}
          </Text>
        </View>
      )}
      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: Math.max(10, size * 0.22),
              height: Math.max(10, size * 0.22),
              borderRadius: size,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
```

## Step 4 — Database schema (Mongo models in the video)

Create the `convex` folder. After this file exists, run `pnpm convex:dev` so Convex can generate types.

### `convex/schema.ts`

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    handle: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    searchText: v.string(),
    lastSeen: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_handle", ["handle"])
    .searchIndex("search_text", {
      searchField: "searchText",
    }),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  conversations: defineTable({
    participantA: v.id("users"),
    participantB: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageKind: v.optional(
      v.union(v.literal("text"), v.literal("image")),
    ),
    lastMessageAt: v.optional(v.number()),
    lastMessageSenderId: v.optional(v.id("users")),
    unreadForA: v.number(),
    unreadForB: v.number(),
  })
    .index("by_pair", ["participantA", "participantB"])
    .index("by_participantA", ["participantA"])
    .index("by_participantB", ["participantB"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    kind: v.union(v.literal("text"), v.literal("image")),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  stories: defineTable({
    userId: v.id("users"),
    mediaStorageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),
});
```

### `convex/tsconfig.json`

```json
{
  "compilerOptions": {
    "allowJs": true,
    "strict": true,
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "lib": ["ES2021", "dom"],
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["./**/*"],
  "exclude": ["./_generated"]
}
```

### `convex/lib/passwords.ts`

```ts
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function randomBytesHex(size: number): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  if (actual.length !== expectedHash.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < actual.length; i += 1) {
    mismatch |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
```

### `convex/lib/validators.ts`

```ts
import { v } from "convex/values";

export const profileValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  handle: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  lastSeen: v.number(),
  isOnline: v.boolean(),
});

export const meValidator = v.object({
  _id: v.id("users"),
  name: v.string(),
  handle: v.string(),
  email: v.string(),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  lastSeen: v.number(),
  isOnline: v.boolean(),
});

export const conversationListItemValidator = v.object({
  conversationId: v.id("conversations"),
  otherUser: profileValidator,
  lastMessage: v.optional(v.string()),
  lastMessageKind: v.optional(
    v.union(v.literal("text"), v.literal("image")),
  ),
  lastMessageAt: v.optional(v.number()),
  unreadCount: v.number(),
});

export const messageValidator = v.object({
  _id: v.id("messages"),
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  receiverId: v.id("users"),
  kind: v.union(v.literal("text"), v.literal("image")),
  text: v.optional(v.string()),
  imageUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  mine: v.boolean(),
});

export const storyGroupValidator = v.object({
  user: profileValidator,
  stories: v.array(
    v.object({
      _id: v.id("stories"),
      mediaUrl: v.union(v.string(), v.null()),
      mediaType: v.union(v.literal("image"), v.literal("video")),
      createdAt: v.number(),
      expiresAt: v.number(),
    }),
  ),
});
```

### `convex/lib/users.ts`

```ts
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const ONLINE_WINDOW_MS = 45_000;

export async function requireUser(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
): Promise<Doc<"users">> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export function isOnline(lastSeen: number, now: number): boolean {
  return now - lastSeen < ONLINE_WINDOW_MS;
}

export async function toProfile(
  ctx: QueryCtx | MutationCtx,
  user: Doc<"users">,
  now: number,
) {
  const avatarUrl = user.avatarStorageId
    ? await ctx.storage.getUrl(user.avatarStorageId)
    : null;

  return {
    _id: user._id,
    name: user.name,
    handle: user.handle,
    bio: user.bio,
    avatarUrl,
    lastSeen: user.lastSeen,
    isOnline: isOnline(user.lastSeen, now),
  };
}

export function pairParticipants(
  a: Id<"users">,
  b: Id<"users">,
): { participantA: Id<"users">; participantB: Id<"users"> } {
  return a < b
    ? { participantA: a, participantB: b }
    : { participantA: b, participantB: a };
}

export function searchTextFor(name: string, handle: string): string {
  return `${name} ${handle}`.toLowerCase();
}
```

### `convex/lib/functions.ts`

```ts
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";

import { mutation, query } from "../_generated/server";
import { requireUser } from "./users";

export const authedQuery = customQuery(query, {
  args: {
    sessionToken: v.string(),
  },
  input: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    return { ctx: { ...ctx, user }, args };
  },
});

export const authedMutation = customMutation(mutation, {
  args: {
    sessionToken: v.string(),
  },
  input: async (ctx, args) => {
    const user = await requireUser(ctx, args.sessionToken);
    return { ctx: { ...ctx, user }, args };
  },
});
```

## Step 5 — Auth (Clerk in the video)

Email + password in Convex. Then the sign-in / sign-up screens.

### `convex/auth.ts`

```ts
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { hashPassword, randomBytesHex, verifyPassword } from "./lib/passwords";
import { searchTextFor, toProfile } from "./lib/users";
import { meValidator } from "./lib/validators";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const DEMO_USERS = [
  {
    name: "Maya Chen",
    handle: "maya",
    email: "maya@instachat.dev",
    password: "demo1234",
    bio: "Designing product stories. Coffee first.",
  },
  {
    name: "Jordan Blake",
    handle: "jordan",
    email: "jordan@instachat.dev",
    password: "demo1234",
    bio: "Always down for a late-night voice note.",
  },
] as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

function validateSignup(args: {
  name: string;
  handle: string;
  email: string;
  password: string;
}): void {
  if (args.name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters");
  }
  if (!/^[a-z0-9._]{3,20}$/.test(args.handle)) {
    throw new Error("Handle must be 3-20 letters, numbers, dots, or underscores");
  }
  if (!args.email.includes("@")) {
    throw new Error("Enter a valid email address");
  }
  if (args.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}

async function createSession(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<string> {
  const token = randomBytesHex(32);
  await ctx.db.insert("sessions", {
    token,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export const signUp = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    sessionToken: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const handle = normalizeHandle(args.handle);
    const email = normalizeEmail(args.email);
    validateSignup({ name, handle, email, password: args.password });

    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingHandle = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .unique();
    if (existingHandle) {
      throw new Error("Handle is already taken");
    }

    const salt = randomBytesHex(16);
    const passwordHash = await hashPassword(args.password, salt);
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name,
      handle,
      email,
      passwordHash,
      salt,
      searchText: searchTextFor(name, handle),
      lastSeen: now,
      createdAt: now,
    });

    const sessionToken = await createSession(ctx, userId);
    return { sessionToken, userId };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({
    sessionToken: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const ok = await verifyPassword(args.password, user.salt, user.passwordHash);
    if (!ok) {
      throw new Error("Invalid email or password");
    }

    await ctx.db.patch(user._id, { lastSeen: Date.now() });
    const sessionToken = await createSession(ctx, user._id);
    return { sessionToken, userId: user._id };
  },
});

export const signOut = mutation({
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.patch(session.userId, { lastSeen: 0 });
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

export const me = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.union(meValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (!session) {
      return null;
    }
    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }
    const profile = await toProfile(ctx, user, args.now);
    return { ...profile, email: user.email };
  },
});

export const seedDemoUsers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const demo of DEMO_USERS) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", demo.email))
        .unique();
      if (existing) {
        continue;
      }
      const salt = randomBytesHex(16);
      const passwordHash = await hashPassword(demo.password, salt);
      const now = Date.now();
      await ctx.db.insert("users", {
        name: demo.name,
        handle: demo.handle,
        email: demo.email,
        passwordHash,
        salt,
        bio: demo.bio,
        searchText: searchTextFor(demo.name, demo.handle),
        lastSeen: 0,
        createdAt: now,
      });
    }
    return null;
  },
});
```

### `src/providers/auth-provider.tsx`

```tsx
import { useMutation, useQuery } from "convex/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNow } from "@/hooks/use-now";
import { api } from "@/lib/api";
import {
  clearSessionToken,
  loadSessionToken,
  saveSessionToken,
} from "@/lib/session";

type AuthUser = {
  _id: string;
  name: string;
  handle: string;
  email: string;
  bio?: string;
  avatarUrl: string | null;
  lastSeen: number;
  isOnline: boolean;
};

type AuthContextValue = {
  hydrated: boolean;
  sessionToken: string | null;
  user: AuthUser | null | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    handle: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const now = useNow();

  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const signOutMutation = useMutation(api.auth.signOut);
  const heartbeat = useMutation(api.users.heartbeat);
  const seedDemoUsers = useMutation(api.auth.seedDemoUsers);

  const user = useQuery(
    api.auth.me,
    sessionToken ? { sessionToken, now } : "skip",
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await loadSessionToken();
      if (!cancelled) {
        setSessionToken(token);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }
    void heartbeat({ sessionToken }).catch(() => undefined);
    const id = setInterval(() => {
      void heartbeat({ sessionToken }).catch(() => undefined);
    }, 15_000);
    return () => clearInterval(id);
  }, [heartbeat, sessionToken]);

  useEffect(() => {
    void seedDemoUsers().catch(() => undefined);
  }, [seedDemoUsers]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInMutation({ email, password });
      await saveSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
    },
    [signInMutation],
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      handle: string;
      email: string;
      password: string;
    }) => {
      const result = await signUpMutation(input);
      await saveSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
    },
    [signUpMutation],
  );

  const signOut = useCallback(async () => {
    if (sessionToken) {
      await signOutMutation({ sessionToken }).catch(() => undefined);
    }
    await clearSessionToken();
    setSessionToken(null);
  }, [sessionToken, signOutMutation]);

  const value = useMemo(
    () => ({
      hydrated,
      sessionToken,
      user,
      signIn,
      signUp,
      signOut,
    }),
    [hydrated, sessionToken, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}

export function useRequiredAuth(): AuthContextValue & {
  sessionToken: string;
  user: AuthUser;
} {
  const auth = useAuth();
  if (!auth.sessionToken || !auth.user) {
    throw new Error("Not authenticated");
  }
  return {
    ...auth,
    sessionToken: auth.sessionToken,
    user: auth.user,
  };
}
```

### `src/app/_layout.tsx`

```tsx
import { type ReactNode } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { BootScreen } from "@/components/boot-screen";
import { colors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";

function AuthGate({ children }: { children: ReactNode }) {
  const { hydrated, sessionToken, user } = useAuth();
  const segments = useSegments();

  if (!hydrated || (sessionToken && user === undefined)) {
    return <BootScreen />;
  }

  const signedIn = Boolean(sessionToken && user);
  const inAuthGroup = segments[0] === "(auth)";

  if (!signedIn && !inAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (signedIn && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return children;
}

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <AppShell>
          <StatusBar style="dark" />
          <AuthGate>
            <View style={styles.stack}>
              <Slot />
            </View>
          </AuthGate>
        </AppShell>
      </AuthProvider>
    </ConvexClientProvider>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

### `src/app/(auth)/_layout.tsx`

```tsx
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
```

### `src/app/(auth)/sign-in.tsx`

```tsx
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
```

### `src/app/(auth)/sign-up.tsx`

```tsx
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
```

## Step 6 — Bottom tabs

Chats / Search / Profile on one home screen. Chat and story still use Expo Router.

### `src/app/(app)/_layout.tsx`

```tsx
import { Redirect, Stack } from "expo-router";

import { BootScreen } from "@/components/boot-screen";
import { colors } from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";

export default function AppGroupLayout() {
  const { hydrated, sessionToken, user } = useAuth();

  if (!hydrated || (sessionToken && user === undefined)) {
    return <BootScreen />;
  }

  if (!sessionToken || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen
        name="story/[userId]"
        options={{ animation: "fade", presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
```

### `src/app/(app)/(tabs)/_layout.tsx`

```tsx
import { Slot } from "expo-router";

export default function TabsLayout() {
  return <Slot />;
}
```

### `src/app/(app)/(tabs)/index.tsx`

```tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import ChatsScreen from "@/screens/chats-screen";
import ProfileScreen from "@/screens/profile-screen";
import SearchScreen from "@/screens/search-screen";

type TabId = "chats" | "search" | "profile";

const TABS: { id: TabId; label: string; icon: "chatbubbles" | "search" | "person" }[] = [
  { id: "chats", label: "Chats", icon: "chatbubbles" },
  { id: "search", label: "Search", icon: "search" },
  { id: "profile", label: "Profile", icon: "person" },
];

function ActiveScreen({ tab }: { tab: TabId }) {
  switch (tab) {
    case "chats":
      return <ChatsScreen />;
    case "search":
      return <SearchScreen />;
    case "profile":
      return <ProfileScreen />;
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export default function AppHome() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>("chats");

  return (
    <View style={styles.wrap}>
      <View style={styles.body}>
        <ActiveScreen tab={tab} />
      </View>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((item) => {
          const active = item.id === tab;
          const color = active ? colors.primary : colors.onSurfaceVariant;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(item.id)}
              style={styles.item}
            >
              <Ionicons name={item.icon} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLowest,
    borderTopColor: colors.outline,
    borderTopWidth: 1,
    paddingTop: 6,
    minHeight: 56,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 48,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
```

## Step 7 — Search and start a chat

Search people, then get-or-create a 1:1 conversation.

### `convex/users.ts`

```ts
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { authedMutation, authedQuery } from "./lib/functions";
import { searchTextFor, toProfile } from "./lib/users";
import { meValidator, profileValidator } from "./lib/validators";

export const heartbeat = authedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.db.patch(ctx.user._id, { lastSeen: Date.now() });
    return null;
  },
});

export const updateProfile = authedMutation({
  args: {
    name: v.string(),
    handle: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const handle = args.handle.trim().replace(/^@/, "").toLowerCase();
    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (!/^[a-z0-9._]{3,20}$/.test(handle)) {
      throw new Error("Handle must be 3-20 letters, numbers, dots, or underscores");
    }
    if (args.bio && args.bio.length > 160) {
      throw new Error("Bio must be 160 characters or less");
    }

    if (handle !== ctx.user.handle) {
      const taken = await ctx.db
        .query("users")
        .withIndex("by_handle", (q) => q.eq("handle", handle))
        .unique();
      if (taken) {
        throw new Error("Handle is already taken");
      }
    }

    await ctx.db.patch(ctx.user._id, {
      name,
      handle,
      bio: args.bio?.trim() || undefined,
      avatarStorageId: args.avatarStorageId ?? ctx.user.avatarStorageId,
      searchText: searchTextFor(name, handle),
    });
    return null;
  },
});

export const search = authedQuery({
  args: {
    query: v.string(),
    now: v.number(),
  },
  returns: v.array(profileValidator),
  handler: async (ctx, args) => {
    const needle = args.query.trim().replace(/^@/, "").toLowerCase();
    if (needle.length === 0) {
      return [];
    }

    const byHandle = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", needle))
      .unique();

    const searched = await ctx.db
      .query("users")
      .withSearchIndex("search_text", (q) => q.search("searchText", needle))
      .take(20);

    const merged = new Map<string, Doc<"users">>();
    if (byHandle) {
      merged.set(byHandle._id, byHandle);
    }
    for (const user of searched) {
      merged.set(user._id, user);
    }

    const profiles = [];
    for (const user of merged.values()) {
      if (user._id === ctx.user._id) {
        continue;
      }
      profiles.push(await toProfile(ctx, user, args.now));
    }
    return profiles;
  },
});

export const get = authedQuery({
  args: {
    userId: v.id("users"),
    now: v.number(),
  },
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    return await toProfile(ctx, user, args.now);
  },
});

export const myProfile = authedQuery({
  args: { now: v.number() },
  returns: meValidator,
  handler: async (ctx, args) => {
    const profile = await toProfile(ctx, ctx.user, args.now);
    return { ...profile, email: ctx.user.email };
  },
});
```

### `convex/conversations.ts`

```ts
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authedMutation, authedQuery } from "./lib/functions";
import { pairParticipants, toProfile } from "./lib/users";
import { conversationListItemValidator } from "./lib/validators";

async function findConversation(
  ctx: QueryCtx | MutationCtx,
  a: Id<"users">,
  b: Id<"users">,
): Promise<Doc<"conversations"> | null> {
  const pair = pairParticipants(a, b);
  return await ctx.db
    .query("conversations")
    .withIndex("by_pair", (q) =>
      q.eq("participantA", pair.participantA).eq("participantB", pair.participantB),
    )
    .unique();
}

export const list = authedQuery({
  args: { now: v.number() },
  returns: v.array(conversationListItemValidator),
  handler: async (ctx, args) => {
    const asA = await ctx.db
      .query("conversations")
      .withIndex("by_participantA", (q) => q.eq("participantA", ctx.user._id))
      .take(100);
    const asB = await ctx.db
      .query("conversations")
      .withIndex("by_participantB", (q) => q.eq("participantB", ctx.user._id))
      .take(100);

    const seen = new Set<string>();
    const conversations: Doc<"conversations">[] = [];
    for (const conversation of [...asA, ...asB]) {
      if (seen.has(conversation._id)) {
        continue;
      }
      seen.add(conversation._id);
      conversations.push(conversation);
    }

    conversations.sort(
      (left, right) => (right.lastMessageAt ?? 0) - (left.lastMessageAt ?? 0),
    );

    const items = [];
    for (const conversation of conversations) {
      const otherId =
        conversation.participantA === ctx.user._id
          ? conversation.participantB
          : conversation.participantA;
      const other = await ctx.db.get(otherId);
      if (!other) {
        continue;
      }
      const unreadCount =
        conversation.participantA === ctx.user._id
          ? conversation.unreadForA
          : conversation.unreadForB;
      items.push({
        conversationId: conversation._id,
        otherUser: await toProfile(ctx, other, args.now),
        lastMessage: conversation.lastMessage,
        lastMessageKind: conversation.lastMessageKind,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
      });
    }
    return items;
  },
});

export const getOrCreate = authedMutation({
  args: { otherUserId: v.id("users") },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    if (args.otherUserId === ctx.user._id) {
      throw new Error("You cannot chat with yourself");
    }
    const other = await ctx.db.get(args.otherUserId);
    if (!other) {
      throw new Error("User not found");
    }

    const existing = await findConversation(ctx, ctx.user._id, args.otherUserId);
    if (existing) {
      return existing._id;
    }

    const pair = pairParticipants(ctx.user._id, args.otherUserId);
    return await ctx.db.insert("conversations", {
      ...pair,
      unreadForA: 0,
      unreadForB: 0,
    });
  },
});
```

### `src/screens/search-screen.tsx`

```tsx
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
```

## Step 8 — Realtime messages

Convex queries update the other window by themselves. No WebSocket server to write.

### `convex/messages.ts`

```ts
import { v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/functions";
import { messageValidator } from "./lib/validators";

export const list = authedQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    const rows = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(80);

    const messages = [];
    for (const row of rows.reverse()) {
      const imageUrl = row.imageStorageId
        ? await ctx.storage.getUrl(row.imageStorageId)
        : null;
      messages.push({
        _id: row._id,
        conversationId: row.conversationId,
        senderId: row.senderId,
        receiverId: row.receiverId,
        kind: row.kind,
        text: row.text,
        imageUrl,
        createdAt: row.createdAt,
        mine: row.senderId === ctx.user._id,
      });
    }
    return messages;
  },
});

export const send = authedMutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    const text = args.text?.trim();
    const hasImage = Boolean(args.imageStorageId);
    if (!text && !hasImage) {
      throw new Error("Message cannot be empty");
    }
    if (text && text.length > 2000) {
      throw new Error("Message is too long");
    }

    const receiverId =
      conversation.participantA === ctx.user._id
        ? conversation.participantB
        : conversation.participantA;
    const kind = hasImage ? "image" : "text";
    const now = Date.now();
    const preview = hasImage ? "Photo" : text;

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: ctx.user._id,
      receiverId,
      kind,
      text: text || undefined,
      imageStorageId: args.imageStorageId,
      createdAt: now,
    });

    const unreadPatch =
      conversation.participantA === receiverId
        ? { unreadForA: conversation.unreadForA + 1 }
        : { unreadForB: conversation.unreadForB + 1 };

    await ctx.db.patch(args.conversationId, {
      lastMessage: preview,
      lastMessageKind: kind,
      lastMessageAt: now,
      lastMessageSenderId: ctx.user._id,
      ...unreadPatch,
    });

    return messageId;
  },
});

export const markRead = authedMutation({
  args: { conversationId: v.id("conversations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (
      conversation.participantA !== ctx.user._id &&
      conversation.participantB !== ctx.user._id
    ) {
      throw new Error("Unauthorized");
    }

    if (conversation.participantA === ctx.user._id) {
      await ctx.db.patch(args.conversationId, { unreadForA: 0 });
    } else {
      await ctx.db.patch(args.conversationId, { unreadForB: 0 });
    }
    return null;
  },
});
```

### `src/screens/chats-screen.tsx`

```tsx
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
```

### `src/components/chat-row.tsx`

```tsx
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { colors } from "@/constants/colors";
import { formatChatTime } from "@/lib/time";

type ChatRowProps = {
  name: string;
  handle: string;
  avatarUrl: string | null;
  online: boolean;
  lastMessage?: string;
  lastMessageKind?: "text" | "image";
  lastMessageAt?: number;
  unreadCount: number;
  now: number;
  onPress: () => void;
};

export function ChatRow({
  name,
  handle,
  avatarUrl,
  online,
  lastMessage,
  lastMessageKind,
  lastMessageAt,
  unreadCount,
  now,
  onPress,
}: ChatRowProps) {
  const preview =
    lastMessageKind === "image" ? "Sent a photo" : lastMessage ?? "Start a conversation";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar name={name} uri={avatarUrl} online={online} size={54} />
      <View style={styles.copy}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {lastMessageAt ? (
            <Text style={styles.time}>{formatChatTime(lastMessageAt, now)}</Text>
          ) : null}
        </View>
        <View style={styles.bottom}>
          <Text
            style={[styles.preview, unreadCount > 0 && styles.unreadPreview]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : (
            <Text style={styles.handle}>@{handle}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  time: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  unreadPreview: {
    color: colors.onSurface,
    fontWeight: "600",
  },
  handle: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
});
```

### `src/components/message-bubble.tsx`

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { formatClock } from "@/lib/time";

type MessageBubbleProps = {
  mine: boolean;
  kind: "text" | "image";
  text?: string;
  imageUrl: string | null;
  createdAt: number;
};

export function MessageBubble({
  mine,
  kind,
  text,
  imageUrl,
  createdAt,
}: MessageBubbleProps) {
  return (
    <View style={[styles.wrap, mine ? styles.mineWrap : styles.theirsWrap]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          kind === "image" && styles.imageBubble,
        ]}
      >
        {kind === "image" && imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : null}
        {kind === "image" && !imageUrl ? (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={28} color={colors.onPrimary} />
          </View>
        ) : null}
        {text ? (
          <Text style={[styles.text, mine ? styles.mineText : styles.theirsText]}>
            {text}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.time, mine ? styles.mineTime : styles.theirsTime]}>
        {formatClock(createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: "82%",
    marginVertical: 4,
    gap: 4,
  },
  mineWrap: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirsWrap: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  imageBubble: {
    padding: 4,
    overflow: "hidden",
  },
  mine: {
    backgroundColor: colors.bubbleMe,
    borderBottomRightRadius: 6,
  },
  theirs: {
    backgroundColor: colors.bubbleThem,
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  mineText: {
    color: colors.onPrimary,
  },
  theirsText: {
    color: colors.onSurface,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  imageFallback: {
    width: 220,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  mineTime: {
    marginRight: 4,
  },
  theirsTime: {
    marginLeft: 4,
  },
});
```

### `src/app/(app)/chat/[id].tsx`

```tsx
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

export default function ChatScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id as Id<"conversations">;
  const now = useNow();
  const [draft, setDraft] = useState("");
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
      await send({ sessionToken, conversationId, text });
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
      await send({ sessionToken, conversationId, imageStorageId: storageId });
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
            />
          )}
        />

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
```

## Step 9 — Photos (Cloudinary in the video)

Convex storage upload URL + image picker. Profile photo lives here too.

### `convex/files.ts`

```ts
import { v } from "convex/values";

import { authedMutation } from "./lib/functions";

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### `src/screens/profile-screen.tsx`

```tsx
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
```

## Step 10 — Stories (24 hours)

Story bar on Chats and the full-screen viewer.

### `convex/stories.ts`

```ts
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { authedMutation, authedQuery } from "./lib/functions";
import { toProfile } from "./lib/users";
import { storyGroupValidator } from "./lib/validators";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export const listActive = authedQuery({
  args: { now: v.number() },
  returns: v.array(storyGroupValidator),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("stories")
      .withIndex("by_expires", (q) => q.gt("expiresAt", args.now))
      .take(80);

    const grouped = new Map<string, { userId: Id<"users">; stories: Doc<"stories">[] }>();

    for (const story of rows) {
      const existing = grouped.get(story.userId);
      if (existing) {
        existing.stories.push(story);
      } else {
        grouped.set(story.userId, { userId: story.userId, stories: [story] });
      }
    }

    const groups = [];
    const mine = grouped.get(ctx.user._id);
    if (mine) {
      const stories = [];
      for (const story of mine.stories.sort((a, b) => a.createdAt - b.createdAt)) {
        stories.push({
          _id: story._id,
          mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
          mediaType: story.mediaType,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }
      groups.push({
        user: await toProfile(ctx, ctx.user, args.now),
        stories,
      });
    }

    for (const group of grouped.values()) {
      if (group.userId === ctx.user._id) {
        continue;
      }
      const user = await ctx.db.get(group.userId);
      if (!user) {
        continue;
      }
      const stories = [];
      for (const story of group.stories.sort((a, b) => a.createdAt - b.createdAt)) {
        stories.push({
          _id: story._id,
          mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
          mediaType: story.mediaType,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }
      groups.push({
        user: await toProfile(ctx, user, args.now),
        stories,
      });
    }

    return groups;
  },
});

export const forUser = authedQuery({
  args: {
    userId: v.id("users"),
    now: v.number(),
  },
  returns: v.union(storyGroupValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    const rows = await ctx.db
      .query("stories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(20);
    const active = rows
      .filter((story) => story.expiresAt > args.now)
      .sort((a, b) => a.createdAt - b.createdAt);
    if (active.length === 0) {
      return null;
    }
    const stories = [];
    for (const story of active) {
      stories.push({
        _id: story._id,
        mediaUrl: await ctx.storage.getUrl(story.mediaStorageId),
        mediaType: story.mediaType,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });
    }
    return {
      user: await toProfile(ctx, user, args.now),
      stories,
    };
  },
});

export const create = authedMutation({
  args: {
    mediaStorageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
  },
  returns: v.id("stories"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("stories", {
      userId: ctx.user._id,
      mediaStorageId: args.mediaStorageId,
      mediaType: args.mediaType,
      createdAt: now,
      expiresAt: now + STORY_TTL_MS,
    });
  },
});
```

### `src/components/story-bar.tsx`

```tsx
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import { colors } from "@/constants/colors";

type StoryUser = {
  _id: string;
  name: string;
  avatarUrl: string | null;
};

type StoryBarProps = {
  groups: Array<{
    user: StoryUser;
    stories: unknown[];
  }>;
  currentUserId: string;
  onAdd: () => void;
  onOpen: (userId: string) => void;
};

export function StoryBar({
  groups,
  currentUserId,
  onAdd,
  onOpen,
}: StoryBarProps) {
  const mine = groups.find((group) => group.user._id === currentUserId);
  const others = groups.filter((group) => group.user._id !== currentUserId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable onPress={onAdd} style={styles.item}>
        <View>
          <Avatar
            name="You"
            uri={mine?.user.avatarUrl}
            size={64}
          />
          <View style={styles.addBadge}>
            <Text style={styles.addPlus}>+</Text>
          </View>
        </View>
        <Text style={styles.label} numberOfLines={1}>
          Your story
        </Text>
      </Pressable>

      {others.map((group) => (
        <Pressable
          key={group.user._id}
          onPress={() => onOpen(group.user._id)}
          style={styles.item}
        >
          <LinearGradient
            colors={[colors.accent, colors.primary]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.ring}
          >
            <View style={styles.ringInner}>
              <Avatar name={group.user.name} uri={group.user.avatarUrl} size={58} />
            </View>
          </LinearGradient>
          <Text style={styles.label} numberOfLines={1}>
            {group.user.name.split(" ")[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  item: {
    width: 72,
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  addBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  addPlus: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: -1,
  },
  ring: {
    padding: 3,
    borderRadius: 999,
  },
  ringInner: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 2,
  },
});
```

### `src/app/(app)/story/[userId].tsx`

```tsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenSpinner } from "@/components/empty-state";
import { colors } from "@/constants/colors";
import { useNow } from "@/hooks/use-now";
import { api, type Id } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const SLIDE_MS = 4500;

export default function StoryScreen() {
  const router = useRouter();
  const { sessionToken } = useAuth();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const now = useNow(1000);
  const group = useQuery(
    api.stories.forUser,
    sessionToken
      ? { sessionToken, userId: userId as Id<"users">, now }
      : "skip",
  );
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());

  const stories = group?.stories ?? [];
  const current = stories[index];
  const progress = useMemo(() => {
    const elapsed = Date.now() - startedAt;
    return Math.min(1, elapsed / SLIDE_MS);
  }, [now, startedAt]);

  useEffect(() => {
    setIndex(0);
    setStartedAt(Date.now());
  }, [userId]);

  useEffect(() => {
    if (!current) {
      return;
    }
    const timeout = setTimeout(() => {
      if (index >= stories.length - 1) {
        router.back();
        return;
      }
      setIndex((value) => value + 1);
      setStartedAt(Date.now());
    }, SLIDE_MS);
    return () => clearTimeout(timeout);
  }, [current, index, router, stories.length]);

  if (group === undefined) {
    return <ScreenSpinner />;
  }

  if (!group || !current) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={24} color={colors.onPrimary} />
        </Pressable>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This story expired.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function goNext() {
    if (index >= stories.length - 1) {
      router.back();
      return;
    }
    setIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  function goPrev() {
    if (index === 0) {
      router.back();
      return;
    }
    setIndex((value) => value - 1);
    setStartedAt(Date.now());
  }

  return (
    <View style={styles.safe}>
      {current.mediaUrl ? (
        <Image source={{ uri: current.mediaUrl }} style={styles.media} contentFit="cover" />
      ) : (
        <View style={styles.media} />
      )}
      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.progressRow}>
          {stories.map((story, storyIndex) => (
            <View key={story._id} style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width:
                      storyIndex < index
                        ? "100%"
                        : storyIndex === index
                          ? `${Math.round(progress * 100)}%`
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.top}>
          <Text style={styles.name}>{group.user.name}</Text>
          <Pressable onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>
      <View style={styles.taps}>
        <Pressable style={styles.tap} onPress={goPrev} />
        <Pressable style={styles.tap} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#09060F" },
  media: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#140F1C" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, paddingHorizontal: 12 },
  progressRow: { flexDirection: "row", gap: 4, marginTop: 8 },
  track: { flex: 1, height: 3, backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "white" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  name: { color: "white", fontWeight: "700", fontSize: 16 },
  close: { padding: 6 },
  taps: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, flexDirection: "row", zIndex: 1 },
  tap: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "white" },
});
```

## Step 11 — Online status

Already included in `convex/users.ts` (`heartbeat`) and `src/providers/auth-provider.tsx` (calls it every 15s). Avatars show a green dot when `lastSeen` is within 45 seconds.

## After the files exist

```bash
pnpm install
pnpm convex:dev
pnpm web
```

Then follow [WALKTHROUGH.md](./WALKTHROUGH.md) if you want the same order as the YouTube video.

## Video stack vs this code

| Video | This project |
| --- | --- |
| Expo + Expo Router | same |
| Clerk | `convex/auth.ts` |
| Express + MongoDB | `convex/schema.ts` |
| WebSockets | Convex live queries |
| Cloudinary | `convex/files.ts` |
