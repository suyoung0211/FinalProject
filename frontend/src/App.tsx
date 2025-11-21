import { useState } from 'react';
import { MainPage } from './components/MainPage';
import { MarketDetailPage } from './components/MarketDetailPage';
import { LoginPage } from './components/LoginPage';
import { PointsShopPage } from './components/PointsShopPage';
import { ProfilePage } from './components/ProfilePage';
import { LeaderboardPage } from './components/LeaderboardPage';

interface UserProfile {
  username: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
}

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMarketDetail, setShowMarketDetail] = useState(false);
  const [showPointsShop, setShowPointsShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // ------------------------ Layout Wrapper ------------------------
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="w-screen min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#0f0f1a] to-[#2a0048]">
      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  );

  // ------------------------ Pages ------------------------

  if (showLogin) {
    return (
      <Layout>
        <LoginPage
          onBack={() => {
            setShowLogin(false);
            setIsStarted(false);
          }}
          onLoginSuccess={(userData) => {
            setUser({
              username: userData?.username || '사용자',
              name: userData?.name || '사용자',
              email: userData?.email || 'user@example.com',
              points: 5000,
              avatar: userData?.avatar,
              avatarType: userData?.avatarType,
              avatarVariant: userData?.avatarVariant,
            });
            setShowLogin(false);
            setIsStarted(false);
          }}
        />
      </Layout>
    );
  }

  if (showPointsShop) {
    return (
      <Layout>
        <PointsShopPage
          onBack={() => {
            setShowPointsShop(false);
            setIsStarted(false);
          }}
        />
      </Layout>
    );
  }

  if (showMarketDetail) {
    return (
      <Layout>
        <MarketDetailPage
          onBack={() => {
            setShowMarketDetail(false);
            setIsStarted(false);
          }}
          marketId={selectedMarketId || undefined}
        />
      </Layout>
    );
  }

  if (showProfile && user) {
    return (
      <Layout>
        <ProfilePage
          onBack={() => {
            setShowProfile(false);
            setIsStarted(false);
          }}
          user={user}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
        />
      </Layout>
    );
  }

  if (showLeaderboard) {
    return (
      <Layout>
        <LeaderboardPage
          onBack={() => {
            setShowLeaderboard(false);
            setIsStarted(false);
          }}
        />
      </Layout>
    );
  }

  // ------------------------ Main Page ------------------------
  return (
    <Layout>
      <MainPage
        onStart={() => setIsStarted(true)}
        onLogin={() => {
          setShowLogin(true);
          setIsStarted(true);
        }}
        onSignup={() => {
          setShowLogin(true);
          setIsStarted(true);
        }}
        onLogout={() => setUser(null)}
        onMarketClick={(marketId) => {
          setSelectedMarketId(marketId);
          setShowMarketDetail(true);
          setIsStarted(true);
        }}
        onPointsShop={() => {
          setShowPointsShop(true);
          setIsStarted(true);
        }}
        onProfile={() => {
          setShowProfile(true);
          setIsStarted(true);
        }}
        onLeaderboard={() => {
          setShowLeaderboard(true);
          setIsStarted(true);
        }}
        user={user}
      />
    </Layout>
  );
}
