// components/profile/UserProfileCard.tsx
import { useRef } from "react";
import { Coins, Badge } from "lucide-react";
import ProfileAvatar from "../../pages/ProfileAvatar";

interface UserProfileCardProps {
  user: {
    nickname: string;
    level: number;
    points: number;
    avatarIcon?: string | null;
    profileFrame?: string | null;
    profileBadge?: string | null;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const resolveImage = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:8080/${path}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !shineRef.current || !glareRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 회전 범위 제한 (-15 ~ 15도)
    const rotateY = Math.max(Math.min((x / rect.width - 0.5) * 30, 15), -15);
    const rotateX = Math.max(Math.min((0.5 - y / rect.height) * 30, 15), -15);

    // 전체 모달 회전
    containerRef.current.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    containerRef.current.style.transition = "transform 0.2s ease-out";

    // shine/glare 효과
    const shinePosX = (x / rect.width) * 100;
    const shinePosY = (y / rect.height) * 100;

    shineRef.current.style.background = `linear-gradient(120deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`;
    shineRef.current.style.opacity = "1";
    shineRef.current.style.backgroundPosition = `${shinePosX}% ${shinePosY}%`;

    glareRef.current.style.background = `radial-gradient(circle at ${shinePosX}% ${shinePosY}%, rgba(255,255,255,0.3), transparent 80%)`;
    glareRef.current.style.opacity = "1";
  };

  const handleMouseOut = () => {
    if (!containerRef.current || !shineRef.current || !glareRef.current) return;

    containerRef.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
    containerRef.current.style.transition = "transform 0.3s ease-out";

    shineRef.current.style.opacity = "0";
    glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={containerRef}
      className="relative w-[480px] min-h-[600px] rounded-3xl overflow-hidden cursor-pointer bg-white/5 border border-white/20 backdrop-blur-xl p-8"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
      style={{ perspective: "600px" }}
    >
      {/* shine 효과 */}
      <div
        ref={shineRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-3xl opacity-0"
        style={{
          mixBlendMode: "screen",
          transition: "opacity 0.2s, background-position 0.2s",
        }}
      ></div>

      {/* glare 효과 */}
      <div
        ref={glareRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-3xl opacity-0"
        style={{
          mixBlendMode: "screen",
          transition: "opacity 0.2s, background-position 0.2s",
        }}
      ></div>

      {/* 카드 내용 */}
      <div className="flex flex-col items-center justify-start p-8 gap-6 text-black z-10 relative">
        <ProfileAvatar
          avatarUrl={resolveImage(user.avatarIcon)}
          frameUrl={resolveImage(user.profileFrame)}
          size={140}
        />

        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-bold text-white">{user.nickname}</h2>
          {user.profileBadge &&
            (user.profileBadge.startsWith("http") ? (
              <img
                src={resolveImage(user.profileBadge)}
                alt="badge"
                className="w-6 h-6"
              />
            ) : (
              <span className="text-2xl">{user.profileBadge}</span>
            ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge className="w-4 h-4 text-yellow-400" />
          <span className="text-base font-semibold text-gray-200">
            Lv. {user.level}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-fit">
          <Coins className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{user.points.toLocaleString()} P</span>
        </div>
      </div>
    </div>
  );
}
