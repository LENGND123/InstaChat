# Build InstaChat step by step

This matches the [GreatStack Expo chat tutorial](https://youtu.be/lFUIRQGBZYc). The video builds **client** (Expo) and **server** (Express + MongoDB + Clerk + Cloudinary + WebSockets). This repo keeps the same screens and features, with **Convex** as the backend so you can run it without those extra accounts.

Follow the steps in order. After each step, the files listed are the ones that implement it.

## What you are building

A mobile chat app that runs on iOS, Android, and the web:

1. Sign up / sign in
2. Chat list + 24-hour stories
3. Search people and start a 1:1 chat
4. Realtime text and photo messages
5. Profile (photo, name, handle, bio)
6. Online / last-seen status

Demo logins (password `demo1234`):

- Maya — `maya@instachat.dev`
- Jordan — `jordan@instachat.dev`

Open two browser windows, sign in as each person, and chat.

## Step 0 — Run the app in VS Code

You need VS Code, Node 22+, and pnpm. Open this folder in VS Code, then use two terminals (or **Terminal → Run Task… → Start InstaChat**).

```bash
pnpm install
pnpm exec convex login
pnpm convex:dev
```

Leave that running. Copy the Convex URL it prints into `.env.local` as `EXPO_PUBLIC_CONVEX_URL`. In another terminal:

```bash
pnpm web
```

Open http://localhost:43127. On a phone, use `pnpm start` and Expo Go instead of `pnpm web`.

## Step 1 — Expo app and folders

The video creates a folder named `insta chat`, then `npx create-expo-app client`. Here the Expo app lives at the repo root.

Expo Router uses files under `src/app` as screens:

```
src/app/
  _layout.tsx              # providers + auth gate
  (auth)/
    sign-in.tsx
    sign-up.tsx
  (app)/
    (tabs)/
      index.tsx            # Chats / Search / Profile host
    chat/[id].tsx
    story/[userId].tsx
src/screens/
  chats-screen.tsx
  search-screen.tsx
  profile-screen.tsx
```

Parentheses in folder names (`(auth)`, `(app)`, `(tabs)`) are route groups. They organize files without adding a URL segment.

## Step 2 — Theme

The video adds `constants/colors.ts` with Material-style tokens (`primary`, `surface`, `onSurfaceVariant`). Ours is:

- `src/constants/colors.ts`

Those colors are used by the tab bar, bubbles, and buttons.

## Step 3 — Sign in and sign up screens

Video: name, handle, email, password on sign up; email + password on sign in.

- `src/app/(auth)/sign-in.tsx`
- `src/app/(auth)/sign-up.tsx`
- `src/app/(auth)/_layout.tsx` — if you already have a session, skip auth and go to chats

Try it: open the app, create an account, or tap **Try as Maya**.

## Step 4 — Database models

Video: Mongoose models for User, Conversation, Message, Story.

Here the same tables live in `convex/schema.ts`:

| Table | Purpose |
| --- | --- |
| `users` | name, handle, email, password hash, bio, avatar, lastSeen |
| `sessions` | login token |
| `conversations` | the pair of users plus last message / unread counts |
| `messages` | text or image in a conversation |
| `stories` | media that expires after 24 hours |

Indexes (`by_email`, `by_handle`, `by_conversation`, …) are how lookups stay fast. Do not scan the whole table with `.filter()`.

## Step 5 — Auth (Clerk in the video)

The video uses Clerk. This app stores email/password in Convex so it runs without a Clerk key.

- Backend: `convex/auth.ts` (`signUp`, `signIn`, `signOut`, `me`)
- Password hashing: `convex/lib/passwords.ts` (PBKDF2)
- Client session: `src/lib/session.ts` (SecureStore on device, localStorage on web)
- React wiring: `src/providers/auth-provider.tsx`

Every private query/mutation takes `sessionToken`. The wrappers in `convex/lib/functions.ts` load the user from that token.

## Step 6 — Bottom tabs

Video: Chats, Search, Profile.

The tab bar lives on the home screen (`src/app/(app)/(tabs)/index.tsx`) and swaps Chats / Search / Profile in React state so those views are not separate URLs. Chat and story screens still push onto the Expo Router stack.

## Step 7 — Search and start a chat

Video: type a name, show results, open that user's chat.

- Search API: `convex/users.ts` (`search`)
- Search screen: `src/screens/search-screen.tsx` (opened from the Search tab on the home screen)
- Get or create the 1:1 conversation: `convex/conversations.ts` (`getOrCreate`)

Try it: Search → type `jordan` → tap the row.

## Step 8 — Realtime messages

Video: Express WebSocket server. Here Convex queries are live — when someone inserts a message, the other window updates on its own.

- Send / list / mark read: `convex/messages.ts`
- Chat UI: `src/app/(app)/chat/[id].tsx`
- Chat list: `src/screens/chats-screen.tsx` + `convex/conversations.ts` (`list`)

Try it: two windows, Maya and Jordan, send “hello”.

## Step 9 — Photos (Cloudinary in the video)

- Create an upload URL: `convex/files.ts`
- Pick a file: `src/lib/media.ts`
- Chat composer image button: `src/app/(app)/chat/[id].tsx`
- Profile photo: `src/screens/profile-screen.tsx`

The file goes to Convex storage, then the message stores the storage id.

## Step 10 — Stories (24 hours)

- Create / list: `convex/stories.ts`
- Story bar on Chats: `src/components/story-bar.tsx`
- Full-screen viewer with progress bar: `src/app/(app)/story/[userId].tsx`

Stories set `expiresAt = now + 24h`. Queries take `now` from the client (Convex queries must not call `Date.now()`).

## Step 11 — Online status

Video: `isOnline` + `lastSeen` on the user, updated over the socket.

- Heartbeat every 15s: `src/providers/auth-provider.tsx` → `convex/users.ts` (`heartbeat`)
- Online if `lastSeen` is within 45 seconds: `convex/lib/users.ts` (`isOnline`)

Green dot on avatars and “Online” in the chat header come from that.

## Where things live

```
src/app          screens (Expo Router)
src/components   avatar, bubbles, story bar
src/providers    Convex client + auth session
convex           schema + queries + mutations
```

## Video stack vs this repo

| Video | This repo |
| --- | --- |
| Expo + Expo Router | same |
| Clerk | email/password in Convex |
| Express + MongoDB | Convex tables |
| WebSockets | Convex live queries |
| Cloudinary | Convex file storage |

To follow the video literally later, you can swap auth to Clerk and keep these screens. The UI and data model already match.

## What to do next

1. Run Step 0 and click around.
2. Pick one step (for example Step 8) and read those two files.
3. Change something small (bubble color, 24h → 1h for stories) and reload.

If you want the next lesson expanded (auth, chat, or stories) with every line explained, say which step.
