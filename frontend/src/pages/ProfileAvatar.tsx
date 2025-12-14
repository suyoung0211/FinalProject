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
      className="relative flex items-center justify-center"
      style={{
        width: outerSize,
        height: outerSize,
      }}
    >
      {/* 아바타 */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          className="
            absolute
            w-[88%] h-[88%]
            object-cover
            rounded-full
            z-10
          "
          /*
            absolute + 중앙 정렬
            → 프레임이 커져도 항상 정확히 중앙
          */
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className="
            absolute
            w-[88%] h-[88%]
            rounded-full
            bg-gradient-to-br
            from-purple-500 to-pink-500
            z-10
          "
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* 프레임 */}
      {frameUrl && (
        <img
          src={frameUrl}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-contain
            pointer-events-none
            z-20
          "
          /*
            프레임은 outer div 기준으로 그대로 렌더링
            → scale 사용 X
            → 좌표 어긋남 발생하지 않음
          */
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
