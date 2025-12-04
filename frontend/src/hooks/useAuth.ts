// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * UserType
 * 실제 로그인 후 상태로 관리되는 사용자 정보 타입
 * profileImage, role 등 추가 정보 포함
 */
export interface UserType {
  id: number;
  loginId: string;
  nickname: string;
  points: number;               // 사용자 포인트
  level: number;                // 사용자 레벨
  profileImage?: string;        // 프로필 이미지 URL
  role: "USER" | "ADMIN" | "SUPER_ADMIN"; // 사용자 권한
  avatarIcon?: string;          // 추가 프로필 아이콘
  profileFrame?: string;        // 프로필 테두리
  profileBadge?: string;        // 프로필 뱃지
}

/**
 * useAuth 훅
 * AuthContext를 가져와서 상태와 함수들을 사용할 수 있게 제공
 * - user, token: 로그인 정보 상태
 * - login, logout: 로그인/로그아웃 함수
 * - setUser, setToken: 상태 직접 수정 가능
 * - refreshUser: refresh token 기반으로 access token 갱신 후 user 업데이트
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  }

  /**
   * refreshUser
   * - 서버에 refresh token 요청하여 access token 갱신
   * - 갱신 성공 시 localStorage + context 업데이트
   * - 실패 시 로그아웃 처리
   */
  const refreshUser = async () => {
    try {
      // 서버 refresh API 호출 (쿠키 기반 refresh token 사용)
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // 쿠키 전달
      });

      if (!res.ok) throw new Error("토큰 갱신 실패");

      const data = await res.json();
      const newAccessToken = data.accessToken;

      // accessToken 저장
      localStorage.setItem("accessToken", newAccessToken);

      // 토큰 디코딩
      const payloadBase64 = newAccessToken.split(".")[1];
      const decoded = JSON.parse(atob(payloadBase64));

      // user context 업데이트
      context.setUser({
        id: decoded.userId,
        loginId: decoded.loginId,
        nickname: decoded.nickname,
        role: decoded.role,
        points: decoded.points ?? 0,
        level: decoded.level ?? 1,
        avatarIcon: decoded.avatarIcon,
        profileFrame: decoded.profileFrame,
        profileBadge: decoded.profileBadge,
      });

      return decoded; // 필요 시 반환
    } catch (err) {
      console.error("refreshUser 실패", err);
      context.logout(); // 실패 시 로그아웃
      return null;
    }
  };

  // 기존 context에 refreshUser를 추가해서 반환
  return { ...context, refreshUser };
}