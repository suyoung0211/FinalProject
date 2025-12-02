import { createContext, useState, useEffect, ReactNode } from "react";
import { logoutApi, getMyInfoApi } from "../api/authApi";

export interface UserType {
  nickname: string;
  level: number;
  points: number;
  profileImage?: string;
  profileBackground?: string;
  role: string;
}

export interface AuthContextType {
  user: UserType | null;
  token: string | null;
  setUser: (user: UserType | null) => void;       // ⭐ 추가
  setToken: (token: string | null) => void;       // ⭐ 추가
  login: (user: UserType, access: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");
    if (savedAccess) {
      setToken(savedAccess);

      getMyInfoApi()
        .then((res: any) => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
        });
    }
  }, []);

  const login = (userData: UserType, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error("Logout API error:", e);
    }

    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,   // ⭐ 추가됨
        setToken,  // ⭐ 추가됨
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
