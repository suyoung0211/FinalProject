import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { CommunityPageContainer } from './pages/CommunityPageContainer';
import { CommunityWritePage } from './pages/CommunityWritePage';
import { CommunityPostDetailPage } from './pages/CommunityPostDetailPage';
import { CommunityEditPageContainer } from "./pages/CommunityEditPageContainer";
import { AdminPage } from "./pages/AdminPage";
import { AdminPage22 } from "./components/AdminPage22";
import {VoteListPage} from './pages/VoteListPage';
import {VoteDetailPage} from './pages/VoteDetailPage';
import { PointsShopPage } from './pages/PointsShopPage';
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ArticleListPage } from "./pages/ArticleListPage";   // 뉴스 리스트 페이지
import { ArticleDetailPage } from "./pages/ArticleDetailPage"; // 상세페이지(나중 개발)
import { ProfilePageContainer } from "./pages/ProfilePageContainer";
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';

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
      <BrowserRouter>
        <div className="w-screen min-h-screen bg-gradient-to-b from-[#0f0f1a] to-[#2a0048]">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/community" element={<CommunityPageContainer />} />
            <Route path="/community/write" element={<CommunityWriteRouteWrapper />} />
            <Route path="/community/posts/:postId" element={<CommunityPostDetailPage />} />
            <Route path="/community/edit/:postId" element={<CommunityEditPageContainer />} />
            <Route path="/vote" element={<VoteListPage />} />
            <Route path="/vote/:voteId" element={<VoteDetailPage />} />
            <Route path="/store" element={<PointsShopPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/article" element={<ArticleListPage />} />
            <Route path="/article/:articleId" element={<ArticleDetailPage />} />
            {/* 관리자 페이지 */}
            <Route 
              path="/admin/*" 
              element={
                <AdminProtectedRoute roles={['ADMIN','SUPER_ADMIN']}>
                  <AdminPage />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/dashboard" replace />} 
            />
            <Route path="/admin22" element={<AdminPage22 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}