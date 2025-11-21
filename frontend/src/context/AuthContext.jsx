import { createContext, useState, useEffect } from "react";
import { logoutApi, getMyInfoApi } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // ⭐ 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");
    const savedRefresh = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedAccess) setToken(savedAccess);
    if (savedRefresh) setRefreshToken(savedRefresh);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ⭐ 로그인
  const login = (userData, accessToken, newRefreshToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ⭐ 로그아웃 — 서버 + 클라이언트
  const logout = async () => {
    try {
      if (token) await logoutApi(token);
    } catch (e) {
      console.log("⚠ 로그아웃 API 에러:", e);
    }

    setUser(null);
    setToken(null);
    setRefreshToken(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
