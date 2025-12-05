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
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* 프로필 이미지 */}
      <img
        src={avatarUrl || "/default-profile.png"}
        className="w-[88%] h-[88%] object-cover rounded-full z-10"
        style={{ position: "absolute" }}
      />

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
        />
      )}
    </div>
  );
}
