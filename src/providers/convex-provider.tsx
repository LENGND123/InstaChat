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
