import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_EXPIRED_EVENT, tokenStore } from "@/lib/tokenStore";

interface AuthContextValue {
  isAuthenticated: boolean;
  userName: string | null;
  signIn: (token: string, userName: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [userName, setUserName] = useState<string | null>(() => tokenStore.getUserName());

  const signIn = useCallback((newToken: string, name: string) => {
    tokenStore.set(newToken, name);
    setToken(newToken);
    setUserName(name);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUserName(null);
    queryClient.clear();
  }, [queryClient]);

  // پاسخ 401 از هر درخواست محافظت‌شده ← خروج خودکار
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, signOut);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, signOut);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: !!token, userName, signIn, signOut }),
    [token, userName, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider استفاده شود.");
  return ctx;
}
