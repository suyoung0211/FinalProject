// src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { logoutApi, getMyInfoApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // ⭐ 앱 시작 시 저장된 토큰 복원 + 최신 유저 정보 조회
  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");
    const savedRefresh = localStorage.getItem("refreshToken");

    if (savedAccess) {
      setToken(savedAccess);
      setRefreshToken(savedRefresh);

      // 📌 서버에서 최신 유저 정보 가져오기
      getMyInfoApi(savedAccess)
        .then((res) => setUser(res))
        .catch(() => logout());
    }
  }, []);

  // ⭐ 로그인
  const login = (userData, accessToken, newRefreshToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  // ⭐ 로그아웃
  const logout = async () => {
    try {
      if (token) await logoutApi(token);
    } catch (_) {}

    setUser(null);
    setToken(null);
    setRefreshToken(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
