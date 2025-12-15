import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { ArticleModalProvider } from "./context/ArticleModalContext";   // ⭐ 추가
import { NewsDetailModal } from "./components/articles/NewsDetailModal";  // ⭐ 추가

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

export default function App() {
  return (
    <AuthProvider>
      <ArticleModalProvider>
        <BrowserRouter>
          <div className="w-screen min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#2a0048]">

            {/* =========================== */}
            {/* 🔥 전역 뉴스 상세 모달 */}
            {/* =========================== */}
            <NewsDetailModal />

            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/community">
                <Route index element={<CommunityPageContainer />} />
                <Route path="write" element={<CommunityWriteRouteWrapper />} />
                <Route path="posts/:postId" element={<CommunityPostDetailPage />} />
                <Route path="posts/:postId/edit" element={<CommunityEditPageContainer />} />
              </Route>

              <Route path="/vote">
                <Route index element={<VoteListPage />} />
                <Route path=":voteId" element={<VoteDetailRouteWrapper />} />
              </Route>

              <Route path="/store" element={<PointsShopPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/article" element={<ArticleListPage />} />
              <Route path='/profile' element={<ProfilePageWrapper />} />

              <Route path="/admin/*" element={
                <AdminProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminPage />
                </AdminProtectedRoute>
              } />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>

            {/* 🔹 Toaster 추가 */}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </div>
        </BrowserRouter>
      </ArticleModalProvider>
    </AuthProvider>
  );
}
