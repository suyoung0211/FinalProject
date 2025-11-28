import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { CommunityPageContainer } from './pages/CommunityPageContainer';
import { CommunityWritePage } from './components/CommunityWritePage';
import { CommunityPostDetailPage } from './pages/CommunityPostDetailPage';
import { CommunityEditPageContainer } from "./pages/CommunityEditPageContainer";
import { AdminPage } from "./pages/AdminPage";
import { AdminPage22 } from "./components/AdminPage22";
import {VoteListPage} from './pages/VoteListPage';
import {VoteDetailPage} from './pages/VoteDetailPage';
import { PointsShopPage } from './pages/PointsShopPage';
import { LeaderboardPage } from "./pages/LeaderboardPage";

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
            {/* 관리자 페이지 */}
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/admin22" element={<AdminPage22 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}