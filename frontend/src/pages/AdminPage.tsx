import { ArrowLeft, BarChart3, Rss, FileCheck, Vote, MessageSquare, ShoppingBag, FileText, Shield } from 'lucide-react';
import { AdminPageProps } from '../types';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/admin/Dashboard';
import { RssFeeds } from '../components/admin/RssFeeds';
import { Issues } from '../components/admin/Issues';
import { Votes } from '../components/admin/Votes';
import { Community } from '../components/admin/Community';
import { Store } from '../components/admin/Store';
import { Logs } from '../components/admin/Logs';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';


export function AdminPage({ onBack }: AdminPageProps) {
  const { user: currentUser } = useAuth(); // <- 여기서 유저 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser?.role !== 'ADMIN') return null;

  // 메뉴 아이템 정의
  const menuItems = [
    { path: 'dashboard', label: '대시보드', icon: BarChart3, subtitle: '회원 관리' },
    { path: 'rss-feeds', label: 'RSS 피드', icon: Rss, subtitle: '피드 목록' },
    { path: 'issues', label: '이슈 관리', icon: FileCheck, subtitle: '승인 대기 이슈' },
    { path: 'votes', label: '투표 관리', icon: Vote, subtitle: '투표 생성/관리' },
    { path: 'community', label: '커뮤니티', icon: MessageSquare, subtitle: '게시글/댓글' },
    { path: 'store', label: '상점 관리', icon: ShoppingBag, subtitle: '아이템 관리' },
    { path: 'logs', label: '활동 로그', icon: FileText, subtitle: '관리자 활동' },
  ] as const;

  // role 체크: ADMIN이 아니면 홈으로 이동
  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // 렌더링 부분에서는 그냥 null 처리
  if (currentUser?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          {/* 기본 접근 시 dashboard로 이동 */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* 각 메뉴 라우트 */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rss-feeds" element={<RssFeeds />} />
          <Route path="issues" element={<Issues />} />
          <Route path="votes" element={<Votes />} />
          <Route path="community" element={<Community />} />
          <Route path="store" element={<Store />} />
          <Route path="logs" element={<Logs />} />

          {/* 없는 페이지 */}
          <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </main>
    </div>
  );
}
