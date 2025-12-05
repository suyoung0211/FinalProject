  import { useState, useRef, useEffect } from "react";
  import { useAuth } from "../../hooks/useAuth";
  import { Coins, ChevronDown, User, LogOut } from "lucide-react";
  import { useNavigate, useLocation } from "react-router-dom";

  interface HeaderProps {
    activeMenu?: string;
  }

  export function Header({ activeMenu }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    console.log(user);

    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /** 외부 클릭 시 닫기 */
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setMenuOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentPath = activeMenu ?? location.pathname;

    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F1A]/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-22 py-7 flex items-center justify-between">

          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-2xl font-bold text-white">Mak'gora</span>
          </div>

          {/* MENU */}
          <nav className="flex items-center gap-8 text-gray-300">
            {[
              { name: "투표", path: "/vote" },
              { name: "커뮤니티", path: "/community" },
              { name: "뉴스", path: "/article" },
              { name: "리더보드", path: "/leaderboard" },
              { name: "포인트 상점", path: "/store" },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`hover:text-white transition ${
                  currentPath.startsWith(item.path)
                    ? "text-white font-semibold"
                    : ""
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* 로그인 상태일 때만 포인트 */}
            {user && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center gap-2 text-white font-bold shadow-md">
                <Coins className="w-4 h-4" />
                {user.points.toLocaleString()} P
              </div>
            )}

            {/* 🔥 로그인 안 했을 때 — Guest 대신 회원가입/로그인 표시 */}
            {!user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition"
                >
                  회원가입
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-full transition"
                >
                  로그인
                </button>
              </div>
            )}

            {/* 🔥 로그인 했을 때만 드롭다운 */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-full border border-white/20 text-white"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.nickname}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#1B1B29] rounded-xl border border-white/10 shadow-xl overflow-hidden animate-fadeIn">
                    <button
                      className="flex items-center gap-2 px-4 py-3 w-full text-left text-gray-300 hover:bg-white/10 hover:text-white transition"
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" /> 프로필
                    </button>

                    <button
                      className="flex items-center gap-2 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 transition"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      <LogOut className="w-4 h-4" /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
