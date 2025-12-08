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
import { AdminPage22 } from "./components/AdminPage22";

import { VoteListPage } from './pages/VoteListPage';
import { VoteDetailRouteWrapper } from './pages/VoteDetailsPage';

import { PointsShopPage } from './pages/PointsShopPage';
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ArticleListPage } from "./pages/ArticleListPage";
import { ProfilePageContainer } from "./pages/ProfilePageContainer";

import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { Toaster } from "react-hot-toast";

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

              <Route path="/community" element={<CommunityPageContainer />} />
              <Route path="/community/write" element={<CommunityWriteRouteWrapper />} />
              <Route path="/community/posts/:postId" element={<CommunityPostDetailPage />} />
              <Route path="/community/posts/:postId/edit" element={<CommunityEditPageContainer />} />

              <Route path="/vote" element={<VoteListPage />} />
              <Route path="/vote/:voteId" element={<VoteDetailRouteWrapper />} />

              <Route path="/store" element={<PointsShopPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/article" element={<ArticleListPage />} />

              <Route 
                path="/admin/*"
                element={
                  <AdminProtectedRoute roles={['ADMIN','SUPER_ADMIN']}>
                    <AdminPage />
                  </AdminProtectedRoute>
                }
              />

              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              <Route path="/admin22" element={<AdminPage22 />} />
            </Routes>
            {/* 🔹 Toaster 추가 */}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </div>
        </BrowserRouter>
      </ArticleModalProvider>
    </AuthProvider>
  );
}
