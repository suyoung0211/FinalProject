import { createContext, useState, useEffect, ReactNode } from "react";
import { logoutApi, getMyInfoApi } from "../api/authApi";

export interface UserType {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
}

export interface AuthContextType {
  user: UserType | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: UserType, access: string, refresh: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");
    const savedRefresh = localStorage.getItem("refreshToken");

    if (savedAccess) {
      setToken(savedAccess);
      setRefreshToken(savedRefresh);

      // 🔥 JS module이라 타입을 TS가 모름 → as any 로 처리(가장 안전)
      (getMyInfoApi as any)(savedAccess)
        .then((res: any) => {
          setUser(res.data);
        })
        .catch(() => logout());
    }
  }, []);

  const login = (
    userData: UserType,
    accessToken: string,
    newRefreshToken: string
  ) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  const logout = async () => {
  try {
    if (user?.id) {
      await logoutApi(user.id); 
    }
  } catch (e) {
    console.error("Logout error:", e);
  }

  // 반드시 clear 전에 실행하면 X
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  setUser(null);
  setToken(null);
  setRefreshToken(null);
};



  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
