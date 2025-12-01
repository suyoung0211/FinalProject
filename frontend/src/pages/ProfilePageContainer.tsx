import React from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePage } from "./ProfilePage";
import { useAuth } from "../hooks/useAuth";

export function ProfilePageContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // user가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    navigate("/login");
    return null;
  }

  // AuthContext의 UserType을 ProfilePage의 UserProfile로 변환
  const profileUser = {
    username: user.nickname || "",
    name: user.nickname || "",
    email: "", // AuthContext에 email이 없으면 빈 문자열
    points: user.points || 0,
    avatar: user.profileImage || undefined,
    avatarType: undefined as 'male' | 'female' | undefined,
    avatarVariant: undefined as number | undefined,
  };

  return (
    <ProfilePage
      onBack={() => navigate(-1)}
      user={profileUser}
      onUpdateUser={(updatedUser) => {
        // TODO: 실제 API 호출로 사용자 정보 업데이트
        console.log("사용자 정보 업데이트:", updatedUser);
      }}
      onAdminPage={() => {
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          navigate("/admin");
        }
      }}
    />
  );
}

