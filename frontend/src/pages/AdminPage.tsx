// src/components/admin/AdminPage.tsx
import { 
  BarChart3, Rss, FileCheck, Vote, MessageSquare, 
  ShoppingBag, FileText, Shield, 
  ArrowLeft,
  LogOut,
  User
} from 'lucide-react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/admin/dashboard/Dashboard';
import { RssFeeds } from '../components/admin/rssFedds/RssFeeds';
import { Issues } from '../components/admin/issue/Issues';
import { Votes } from '../components/admin/vote/Votes';
import { Community } from '../components/admin/community/Community';
import { Store } from '../components/admin/store/Store';
import { Logs } from '../components/admin/log/Logs';
import { useAuth } from '../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { logoutApi } from '../api/authApi';



export function AdminPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // 🔹 드롭다운 상태 및 ref
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔹 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 로그아웃 함수
  const logout = async () => {
    try {
      await logoutApi(); // 서버 로그아웃 & 쿠키 만료
      localStorage.removeItem("accessToken"); // 액세스 토큰 삭제
      setUser(null); // 유저 상태 초기화
      navigate("/"); // 홈 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // -------------------------------------------------
  // 메뉴 아이템 정의
  // -------------------------------------------------
  const menuItems = [
    { path: 'dashboard', label: '대시보드', icon: BarChart3, subtitle: '회원 관리' },
    { path: 'rss-feeds', label: 'RSS 피드', icon: Rss, subtitle: '피드 목록' },
    { path: 'issues', label: '이슈 관리', icon: FileCheck, subtitle: '승인 대기 이슈' },
    { path: 'votes', label: '투표 관리', icon: Vote, subtitle: '투표 생성/관리' },
    { path: 'community', label: '커뮤니티', icon: MessageSquare, subtitle: '게시글/댓글' },
    { path: 'store', label: '상점 관리', icon: ShoppingBag, subtitle: '아이템 관리' },
    { path: 'logs', label: '활동 로그', icon: FileText, subtitle: '관리자 활동' },
  ] as const;

  // -------------------------------------------------
  // 렌더링
  // -------------------------------------------------
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-slate-950/50 backdrop-blur-xl border-r border-white/10 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-xl font-bold text-white">관리자</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={`/admin/${item.path}`}
                className={({ isActive }) =>
                  `w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : "hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isActive ? "text-white" : "text-gray-300"
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-medium ${
                          isActive ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div
                        className={`text-xs ${
                          isActive ? "text-purple-200" : "text-gray-500"
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Dropdown */}
        <div className="p-4 border-t border-white/10 relative" ref={dropdownRef}>
          {/* 유저 정보 클릭 영역 */}
          <div
            className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl cursor-pointer"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user?.nickname}</div>
              <div className="text-xs text-gray-400">@{user?.role}</div>
            </div>
          </div>

          {/* 드롭다운 */}
          {menuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-[#1B1B29] rounded-xl border border-white/10 shadow-xl overflow-hidden animate-fadeIn z-50">
            {/* 프로필 버튼 */}
            <button
              className="flex items-center gap-2 px-4 py-3 w-full text-left text-gray-300 hover:bg-white/10 hover:text-white transition"
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
            >
              <User className="w-4 h-4" /> 프로필
            </button>

            {/* 메인 페이지 이동 버튼 */}
            <button
              className="flex items-center gap-2 px-4 py-3 w-full text-left text-gray-300 hover:bg-white/10 hover:text-white transition"
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
            >
              <ArrowLeft className="w-4 h-4" /> 메인으로 돌아가기
            </button>

            {/* 로그아웃 버튼 */}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rss-feeds" element={<RssFeeds />} />
          <Route path="issues" element={<Issues />} />
          <Route path="votes" element={<Votes />} />
          <Route path="community" element={<Community />} />
          <Route path="store" element={<Store />} />
          <Route path="logs" element={<Logs />} />
          <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </main>
    </div>
  );
}
