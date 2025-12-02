import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePage } from "./ProfilePage"; // ✅ 경로 체크
import { useAuth } from "../hooks/useAuth";

export function ProfilePageContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const profileUser = {
    username: user.nickname || "",
    name: user.nickname || "",
    email: "", // loginId는 UserInfoResponse에 없으므로 빈 문자열 사용
    points: user.points || 0,
    avatar: user.profileImage || undefined,
    avatarType: undefined as "male" | "female" | undefined,
    avatarVariant: undefined as number | undefined,
  };

  return (
    <ProfilePage
      onBack={() => navigate(-1)}
      user={profileUser}
      onUpdateUser={(updatedUser) => {
        console.log("사용자 정보 업데이트:", updatedUser);
      }}
      onAdminPage={() => {
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          navigate("/admin");
        }
      }}
      onGoVotePage={() => navigate("/votes")}
    />
  );
}
