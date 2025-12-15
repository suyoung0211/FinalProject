import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation, // ⭐ 추가
} from 'react-router-dom';

import { MainPage } from './pages/MainPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { ArticleModalProvider } from "./context/ArticleModalContext";
import { NewsDetailModal } from "./components/articles/NewsDetailModal";

import { CommunityPageContainer } from './pages/CommunityPageContainer';
import { CommunityWritePage } from './pages/CommunityWritePage';
import { CommunityPostDetailPage } from './pages/CommunityPostDetailPage';
import { CommunityEditPageContainer } from "./pages/CommunityEditPageContainer";

import { AdminPage } from "./pages/AdminPage";
import { VoteListPage } from './pages/VoteListPage';
import { VoteDetailRouteWrapper } from './pages/VoteDetailPage';

import { PointsShopPage } from './pages/PointsShopPage';
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ArticleListPage } from "./pages/ArticleListPage";

import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { Toaster } from "react-hot-toast";
import { ProfilePageWrapper } from './pages/ProfilePageWrapper';
import "./styles/glow.css";

/* =========================
 * Community Write Wrapper
 * ========================= */
function CommunityWriteRouteWrapper() {
  const navigate = useNavigate();

  return (
    <CommunityWritePage
      mode="create"
      onBack={() => navigate(-1)}
      onSubmit={() => navigate('/community')}
    />
  );
}

/* =========================
 * Vote Detail Modal Wrapper (⭐ 추가)
 * ========================= */
function VoteDetailModal() {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl">
        <VoteDetailRouteWrapper />
      </div>
    </div>
  );
}

/* =========================
 * App Routes (⭐ 핵심)
 * ========================= */
function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      {/* 🔹 기본 라우트 */}
      <Routes location={background || location}>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/community">
          <Route index element={<CommunityPageContainer />} />
          <Route path="write" element={<CommunityWriteRouteWrapper />} />
          <Route path="posts/:postId" element={<CommunityPostDetailPage />} />
          <Route path="posts/:postId/edit" element={<CommunityEditPageContainer />} />
        </Route>

        <Route path="/votes">
          <Route index element={<VoteListPage />} />
          <Route path=":voteId" element={<VoteDetailRouteWrapper />} />
        </Route>

        <Route path="/store" element={<PointsShopPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/article" element={<ArticleListPage />} />
        <Route path="/profile" element={<ProfilePageWrapper />} />

        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>

      {/* 🔥 투표 상세 모달 라우트 */}
      {background && (
        <Routes>
          <Route path="/votes/:voteId" element={<VoteDetailModal />} />
        </Routes>
      )}
    </>
  );
}

/* =========================
 * App Root
 * ========================= */
export default function App() {
  return (
    <AuthProvider>
      <ArticleModalProvider>
        <BrowserRouter>
          <div className="w-screen min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#2a0048]">

            {/* 🔥 전역 뉴스 상세 모달 */}
            <NewsDetailModal />

            {/* 🔥 라우트 */}
            <AppRoutes />

            {/* 🔹 Toaster */}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </div>
        </BrowserRouter>
      </ArticleModalProvider>
    </AuthProvider>
  );
}
