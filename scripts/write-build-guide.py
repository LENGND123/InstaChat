#!/usr/bin/env python3
"""Write BUILD-IN-VSCODE.md with every source file grouped by tutorial step."""

from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "BUILD-IN-VSCODE.md"

STEPS: list[tuple[str, str, list[str]]] = [
    (
        "Step 1 — Project files (create the Expo app)",
        "In VS Code: File → Open Folder on an empty `instachat` folder. Create these files first, then run `pnpm install`.",
        [
            "package.json",
            "app.json",
            "tsconfig.json",
            "eslint.config.mjs",
            ".gitignore",
            ".env.example",
            ".vscode/extensions.json",
            ".vscode/settings.json",
            ".vscode/tasks.json",
        ],
    ),
    (
        "Step 2 — Theme",
        "Same as the video color tokens. Import `colors` in every screen.",
        ["src/constants/colors.ts"],
    ),
    (
        "Step 3 — Shared client helpers",
        "Time, session storage, Convex client, and small UI pieces used by later screens.",
        [
            "src/hooks/use-now.ts",
            "src/lib/time.ts",
            "src/lib/session.ts",
            "src/lib/api.ts",
            "src/lib/media.ts",
            "src/providers/convex-provider.tsx",
            "src/components/boot-screen.tsx",
            "src/components/app-shell.tsx",
            "src/components/empty-state.tsx",
            "src/components/avatar.tsx",
        ],
    ),
    (
        "Step 4 — Database schema (Mongo models in the video)",
        "Create the `convex` folder. After this file exists, run `pnpm convex:dev` so Convex can generate types.",
        [
            "convex/schema.ts",
            "convex/tsconfig.json",
            "convex/lib/passwords.ts",
            "convex/lib/validators.ts",
            "convex/lib/users.ts",
            "convex/lib/functions.ts",
        ],
    ),
    (
        "Step 5 — Auth (Clerk in the video)",
        "Email + password in Convex. Then the sign-in / sign-up screens.",
        [
            "convex/auth.ts",
            "src/providers/auth-provider.tsx",
            "src/app/_layout.tsx",
            "src/app/(auth)/_layout.tsx",
            "src/app/(auth)/sign-in.tsx",
            "src/app/(auth)/sign-up.tsx",
        ],
    ),
    (
        "Step 6 — Bottom tabs",
        "Chats / Search / Profile on one home screen. Chat and story still use Expo Router.",
        [
            "src/app/(app)/_layout.tsx",
            "src/app/(app)/(tabs)/_layout.tsx",
            "src/app/(app)/(tabs)/index.tsx",
        ],
    ),
    (
        "Step 7 — Search and start a chat",
        "Search people, then get-or-create a 1:1 conversation.",
        [
            "convex/users.ts",
            "convex/conversations.ts",
            "src/screens/search-screen.tsx",
        ],
    ),
    (
        "Step 8 — Realtime messages",
        "Convex queries update the other window by themselves. No WebSocket server to write.",
        [
            "convex/messages.ts",
            "src/screens/chats-screen.tsx",
            "src/components/chat-row.tsx",
            "src/components/message-bubble.tsx",
            "src/app/(app)/chat/[id].tsx",
        ],
    ),
    (
        "Step 9 — Photos (Cloudinary in the video)",
        "Convex storage upload URL + image picker. Profile photo lives here too.",
        [
            "convex/files.ts",
            "src/screens/profile-screen.tsx",
        ],
    ),
    (
        "Step 10 — Stories (24 hours)",
        "Story bar on Chats and the full-screen viewer.",
        [
            "convex/stories.ts",
            "src/components/story-bar.tsx",
            "src/app/(app)/story/[userId].tsx",
        ],
    ),
]


def fence_lang(path: str) -> str:
    if path.endswith(".tsx"):
        return "tsx"
    if path.endswith(".ts"):
        return "ts"
    if path.endswith(".json"):
        return "json"
    if path.endswith(".mjs"):
        return "js"
    if path.endswith(".md"):
        return "md"
    return "text"


def main() -> None:
    parts: list[str] = []
    parts.append(
        """# Build InstaChat in VS Code (step by step)

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
"""
    )

    for title, blurb, files in STEPS:
        parts.append(f"## {title}\n\n{blurb}\n")
        for rel in files:
            path = ROOT / rel
            if not path.is_file():
                raise SystemExit(f"missing file: {rel}")
            body = path.read_text(encoding="utf-8")
            lang = fence_lang(rel)
            parts.append(f"### `{rel}`\n\n```{lang}\n{body.rstrip()}\n```\n")

    parts.append(
        """## Step 11 — Online status

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
"""
    )

    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
