import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi, type LoginPayload, type RegisterPayload } from "../api/endpoints";
import { clearToken, setToken as persistToken, getToken } from "../api/client";
import type { CurrentUser } from "../types";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<CurrentUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const { access_token } = await authApi.login(payload);
    persistToken(access_token);
    const me = await authApi.me();
    setUser(me);
    return me;
  }

  async function register(payload: RegisterPayload) {
    await authApi.register(payload);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
