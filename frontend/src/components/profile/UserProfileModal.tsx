// components/profile/UserProfileModal.tsx
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import UserProfileCard from "./UserProfileCard";
import { Button } from "../ui/button";

// ✅ 공개 프로필 API import
import { getPublicUserProfileApi } from "../../api/publicProfile";

interface UserProfileModalProps {
  userId: number;
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  open,
  onClose,
}: UserProfileModalProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    console.log("🟡 공개 프로필 카드 요청 userId:", userId);

    setLoading(true);

    // ✅ 공개 프로필 API 사용
    getPublicUserProfileApi(userId)
      .then((res) => {
        console.log("🟢 공개 프로필 카드 응답:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error("🔴 공개 프로필 조회 실패:", err);
        if (err.response) {
          console.log("status:", err.response.status);
          console.log("data:", err.response.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, userId]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[40] flex items-center justify-center"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {loading || !user ? (
          <div className="text-white p-8">불러오는 중...</div>
        ) : (
          <>
            <UserProfileCard user={user} />
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
