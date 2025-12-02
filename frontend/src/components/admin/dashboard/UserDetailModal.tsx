import { Button } from "../../ui/button";
import ReactDOM from "react-dom";

interface UserDetailModalProps {
  open: boolean;
  user: any | null;
  onClose: () => void;
}

export default function UserDetailModal({ open, user, onClose }: UserDetailModalProps) {
  if (!open || !user) return null;

  return ReactDOM.createPortal(
    <div
        className="fixed inset-0 z-[40]" // 화면 전체 덮는 투명 레이어
        onClick={onClose} // 배경 클릭 시 닫기
    >
      {/* 모달 */}
      <div
        className="fixed top-1/2 left-[calc(50%+128px)] transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 프로필 배경 */}
        <div
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{
            height: "120px",
            background: user.profileBackground
              ? `url(${user.profileBackground}) center/cover no-repeat`
              : "linear-gradient(to right, #6b21a8, #db2777)", // 기본 그라디언트
          }}
        >
          {/* 프로필 이미지 */}
          <img
            src={user.profileImage || "/default-avatar.png"} // 기본 이미지
            alt={user.nickname}
            className="absolute bottom-[-20px] left-6 w-16 h-16 rounded-full border-2 border-white object-cover"
          />
        </div>

        {/* 사용자 정보 */}
        <div className="ml-24">
          <h2 className="text-xl font-bold text-white">{user.nickname} (@{user.loginId})</h2>
          <p className="text-sm text-gray-300">레벨: {user.level}</p>
          <p className="text-sm text-yellow-400">포인트: {user.points?.toLocaleString()}P</p>
          <p className="text-sm text-gray-400">상태: {user.status}</p>
          <p className="text-sm text-gray-400">가입일: {new Date(user.createdAt).toISOString().split("T")[0]}</p>
          <p className="text-sm text-gray-400">인증 이메일: {user.verificationEmail}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
