# InstaChat

Full-stack realtime chat app inspired by the [GreatStack Expo tutorial](https://youtu.be/lFUIRQGBZYc). Sign up, search people, send messages and photos, post 24-hour stories, and see who's online.

The original video uses Expo + Clerk + Express + MongoDB + Cloudinary + WebSockets. This repo keeps the Expo client and the same product surface, and uses **Convex** for the backend so realtime chat works without MongoDB, Clerk, or Cloudinary credentials.

## What you can do

- Create an account with name, handle, email, and password
- Sign in, edit your profile photo / name / handle / bio, and sign out
- Search people and start a 1:1 chat
- Send text and image messages with instant delivery
- Post a story (image or video) that expires after 24 hours
- See online status while someone has the app open

Two demo accounts are seeded automatically:

| Name | Email | Password |
| --- | --- | --- |
| Maya Chen | `maya@instachat.dev` | `demo1234` |
| Jordan Blake | `jordan@instachat.dev` | `demo1234` |

Open the app in two browser windows, sign in as Maya and Jordan, and chat between them.

## Develop in VS Code

You need [VS Code](https://code.visualstudio.com/), [Node 22+](https://nodejs.org/), and [pnpm](https://pnpm.io).

**Want every file as copy-paste code?** Open [BUILD-IN-VSCODE.md](./BUILD-IN-VSCODE.md). **Want a zip?** Download `InstaChat-VSCode.zip` from this project, unzip it, then File → Open Folder on that unzipped folder.

1. Clone this repo (or unzip) and open the folder in VS Code: **File → Open Folder…**
2. Install the recommended extensions when VS Code prompts (Expo Tools and ESLint).
3. Open a terminal in VS Code (**Terminal → New Terminal**):

```bash
pnpm install
```

4. Log in to Convex once (creates a free personal backend):

```bash
pnpm exec convex login
```

5. Start both processes. Easiest path: **Terminal → Run Task… → Start InstaChat**.

Or use two terminals:

```bash
pnpm convex:dev
```

When Convex prints a URL like `https://….convex.cloud`, copy it into `.env.local`:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

There is an `.env.example` you can duplicate. Then in the second terminal:

```bash
pnpm web
```

6. Open [http://localhost:43127](http://localhost:43127) in the browser. Sign in as Maya or Jordan, or create your own account.

On a phone, run **Run Task → Expo Go (phone)** (or `pnpm start`) and scan the QR code with Expo Go.

`pnpm convex:dev` is the development backend. Do not use `convex deploy` unless you intend to ship to production.

## Project layout

- `src/app` — Expo Router screens (auth, chats, search, profile, story viewer)
- `src/screens` — Chats, Search, and Profile views hosted by the home tab bar
- `convex` — users, sessions, conversations, messages, stories, and file uploads
- `src/providers` — Convex client and session auth
- `.vscode` — recommended extensions and Run Task entries

Auth is email + password stored in Convex (PBKDF2 hashes). Swap this for Clerk later if you want the exact tutorial auth provider.

## Learn it step by step

The GreatStack video order, mapped to this repo, is in [WALKTHROUGH.md](./WALKTHROUGH.md). Start at Step 0 (run the app), then Step 1 (folders), then auth, database, tabs, chat, photos, and stories.
