interface ProfileAvatarProps {
  avatarUrl?: string;
  frameUrl?: string;
  size?: number; // px 크기 (32, 48, 96 등)
}

export default function ProfileAvatar({
  avatarUrl,
  frameUrl,
  size = 120,
}: {
  avatarUrl?: string;
  frameUrl?: string;
  size?: number;
}) {
  // 기본 아바타 fallback (이모지 또는 기본 이미지)
  const defaultAvatar = (
    <div
      className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl z-10"
      style={{ position: "absolute" }}
    >
      
    </div>
  );

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* 프로필 이미지 */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          className="w-[88%] h-[88%] object-cover rounded-full z-10"
          style={{ position: "absolute" }}
          onError={(e) => {
            // 이미지 로드 실패 시 기본 아바타로 대체
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        defaultAvatar
      )}

      {/* 프레임 (더 큰 비율로) */}
      {frameUrl && (
        <img
          src={frameUrl}
          className="w-full h-full object-contain pointer-events-none z-20"
          style={{
            position: "absolute",
            transform: "scale(1.5)", // ⭐ 프레임 15% 확대
            transformOrigin: "center",
          }}
          onError={(e) => {
            // 프레임 로드 실패 시 숨김
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
