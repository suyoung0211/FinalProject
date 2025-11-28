// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export interface UserType {
  id: number;
  loginId: string;
  nickname: string;
  points: number;   // 🔥 추가
  level: number;    // 있으면 추가
  profileImage?: string;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  }
  return context;
}

