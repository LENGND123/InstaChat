import { useMutation, useQuery } from "convex/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNow } from "@/hooks/use-now";
import { api } from "@/lib/api";
import { isOnline } from "@/lib/presence";
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
  const stickyUser = useRef<AuthUser | null>(null);

  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const signOutMutation = useMutation(api.auth.signOut);
  const heartbeat = useMutation(api.users.heartbeat);
  const seedDemoUsers = useMutation(api.auth.seedDemoUsers);

  const queried = useQuery(
    api.auth.me,
    sessionToken ? { sessionToken } : "skip",
  );

  const user = useMemo(() => {
    if (!sessionToken) {
      stickyUser.current = null;
      return queried === undefined ? undefined : null;
    }
    if (queried === undefined) {
      return stickyUser.current ?? undefined;
    }
    if (queried === null) {
      stickyUser.current = null;
      return null;
    }
    const next: AuthUser = {
      ...queried,
      isOnline: isOnline(queried.lastSeen, now),
    };
    stickyUser.current = next;
    return next;
  }, [now, queried, sessionToken]);

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
    stickyUser.current = null;
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
