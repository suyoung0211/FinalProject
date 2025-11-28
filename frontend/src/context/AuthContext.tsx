import { createContext, useState, useEffect, ReactNode } from "react";
import { logoutApi, getMyInfoApi } from "../api/authApi";

export interface UserType {
  loginId?: number;
  nickname?: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (user: UserType, access: string) => void;
  logout: () => void;
  role?: string;
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
    }
  }, []);

  const login = (
    userData: UserType,
    accessToken: string,
  ) => {
    setUser(userData);
    setToken(accessToken);

    localStorage.setItem("accessToken", accessToken);
  };

  const logout = async () => {
  try {
    if (user?.loginId) {
      await logoutApi(user.loginId); 
    }
  } catch (e) {
    console.error("Logout error:", e);
  }

  // 반드시 clear 전에 실행하면 X
  localStorage.removeItem("accessToken");

  setUser(null);
  setToken(null);
};



  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
