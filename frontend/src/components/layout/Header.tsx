// src/components/layout/Header.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { User, Gem } from "lucide-react";

interface HeaderProps {
  activeMenu?: string;          // 현재 활성 메뉴
}

export function Header({ activeMenu }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50
      bg-slate-900/80 backdrop-blur-xl ">
      
      <div className="container mx-auto px-24 py-7 flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <div className="w-12 h-11 rounded-lg bg-gradient-to-br
            from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <span className="text-3xl font-bold text-white">Mak'gora</span>
        </button>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-7 text-lg font-medium">
          {[
            { key: "vote", label: "투표", path: "/vote" },
            { key: "community", label: "커뮤니티", path: "/community" },
            { key: "news", label: "뉴스", path: "/article" },
            { key: "leaderboard", label: "리더보드", path: "/leaderboard" },
            { key: "store", label: "포인트 상점", path: "/store" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`transition ${
                activeMenu === item.key
                  ? "text-purple-300"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* USER AREA */}
        <div className="flex items-center gap-4">
          {/* 포인트 */}
          {user && (
            <div className="flex items-center gap-1 px-6 py-3
              rounded-full bg-linear-to-r from-purple-600 to-pink-600
              text-white text-sm font-semibold shadow-lg">
              <Gem className="w-4 h-6\" />
              {user.points ?? 0} P
            </div>
          )}

          {/* 로그인 / 드롭다운 */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-6 py-3 rounded-full
                  bg-white/10 border border-white/20 text-white"
              >
                <User className="w-4 h-4" />
                {user.nickname || "유저"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-pink-600
               text-white shadow-md"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}