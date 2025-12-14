interface ProfileAvatarProps {
  avatarUrl?: string;
  frameUrl?: string;
  size?: number;
}

export default function ProfileAvatar({
  avatarUrl,
  frameUrl,
  size = 120,
}: ProfileAvatarProps) {
  const FRAME_SCALE = 1.5;
  const outerSize = size * FRAME_SCALE;

  return (
    <div
      className="relative flex items-center justify-center overflow-visible"
      style={{ width: outerSize, height: outerSize }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* 아바타 */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-[88%] h-[88%] object-cover rounded-full z-10"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-[88%] h-[88%] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 z-10" />
        )}

        {/* 프레임 */}
        {frameUrl && (
          <img
            src={frameUrl}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
            style={{
              transform: `scale(${FRAME_SCALE})`,
              transformOrigin: "center",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
}
