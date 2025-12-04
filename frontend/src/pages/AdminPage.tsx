import { 
  ArrowLeft, BarChart3, Rss, FileCheck, Vote, MessageSquare, 
  ShoppingBag, FileText, Shield 
} from 'lucide-react';
import { AdminPageProps } from '../types';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/admin/dashboard/Dashboard';
import { RssFeeds } from '../components/admin/rssFedds/RssFeeds';
import { Issues } from '../components/admin/Issues';
import { Votes } from '../components/admin/Votes';
import { Community } from '../components/admin/Community';
import { Store } from '../components/admin/Store';
import { Logs } from '../components/admin/Logs';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { refreshTokenApi } from '../api/authApi';

export function AdminPage({ onBack }: AdminPageProps) {
  const { user, setUser, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [roleChecked, setRoleChecked] = useState(false); // role 검사 완료 여부

  // -------------------------------------------------
  // ⭐ 액세스 토큰 기반 role 검사 + 페이지 방어 + 자동 갱신
  // -------------------------------------------------
  useEffect(() => {
    const checkRole = async () => {
      let currentRole = user?.role;

      const refreshAccessToken = async () => {
        try {
          // 서버에 refresh token 요청해서 access token 재발급
          const res = await refreshTokenApi();
          const newAccessToken = res.data.accessToken;

          localStorage.setItem("accessToken", newAccessToken);
          return newAccessToken;
        } catch (err) {
          console.error("액세스 토큰 갱신 실패", err);
          logout(); // refresh 실패 시 로그아웃
          navigate("/", { replace: true });
          return null;
        }
      };

      // 1️⃣ user state가 없거나 role이 없는 경우
      if (!currentRole) {
        let accessToken = token || localStorage.getItem("accessToken");

        if (accessToken) {
          try {
            // 토큰 디코딩
            const payloadBase64 = accessToken.split(".")[1];
            const decoded = JSON.parse(atob(payloadBase64));

            // 만료 확인 (exp: UNIX timestamp)
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
              // 토큰 만료 → refresh token으로 재발급
              const newToken = await refreshAccessToken();
              if (!newToken) return; // 실패 시 return
              accessToken = newToken;

              // 재발급 토큰 디코딩
              const newDecoded = JSON.parse(atob(newToken.split(".")[1]));
              currentRole = newDecoded.role;

              // user state 업데이트
              setUser({
                id: newDecoded.userId,
                loginId: newDecoded.loginId,
                nickname: newDecoded.nickname,
                role: newDecoded.role,
                level: newDecoded.level || 1,      // 기본값 1
                points: newDecoded.points || 0,    // 기본값 0
                avatarIcon: newDecoded.avatarIcon,
                profileFrame: newDecoded.profileFrame,
                profileBadge: newDecoded.profileBadge,
              });
            } else {
              // 만료되지 않았으면 그대로 user 세팅
              currentRole = decoded.role;
              setUser({
                id: decoded.userId,
                loginId: decoded.loginId,
                nickname: decoded.nickname,
                role: decoded.role,
                level: decoded.level || 1,      // 기본값 1
                points: decoded.points || 0,    // 기본값 0
                avatarIcon: decoded.avatarIcon,
                profileFrame: decoded.profileFrame,
                profileBadge: decoded.profileBadge,
              });
            }
          } catch (err) {
            console.error("AccessToken decode 실패", err);
            logout();
            navigate("/", { replace: true });
            return;
          }
        } else {
          // 토큰 자체가 없으면 홈으로
          navigate("/", { replace: true });
          return;
        }
      }

      // 2️⃣ role 검사
      if (currentRole !== "ADMIN" && currentRole !== "SUPER_ADMIN") {
        navigate("/", { replace: true });
      } else {
        setRoleChecked(true); // role 검사 완료
      }
    };

    checkRole();
  }, [user, token, setUser, navigate, logout]);

  // role 검사 전까지 렌더링하지 않음
  if (!roleChecked) return null;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
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

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {user?.nickname}
              </div>
              <div className="text-xs text-gray-400">
                @{user?.role}
              </div>
            </div>
          </div>
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
