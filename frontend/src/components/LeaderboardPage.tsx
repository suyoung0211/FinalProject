import { ArrowLeft, Trophy, TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface LeaderboardPageProps {
  onBack: () => void;
  onCommunity?: () => void;
  onNews?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onVote?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

export function LeaderboardPage({ onBack, onCommunity, onNews, onPointsShop, onProfile, onVote, user, onLogin, onLogout, onSignup }: LeaderboardPageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <button onClick={onBack} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Mak' gora</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <button 
                  onClick={onVote}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  투표
                </button>
                <button 
                  onClick={onCommunity}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  커뮤니티
                </button>
                <button 
                  onClick={onNews}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  뉴스
                </button>
                <button 
                  className="text-purple-400 font-medium"
                >
                  리더보드
                </button>
                <button 
                  onClick={onPointsShop}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  포인트 상점
                </button>
              </nav>

              {user ? (
                <>
                  {/* Points Display */}
                  <button
                    onClick={onPointsShop}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Coins className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">{user.points.toLocaleString()} P</span>
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block text-white font-medium">{user.name}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{user.name}</div>
                              <div className="text-gray-400 text-sm">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                            <Coins className="w-4 h-4 text-white" />
                            <span className="text-white font-bold">{user.points.toLocaleString()} 포인트</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onProfile) onProfile();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            <span>프로필</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onPointsShop) onPointsShop();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>포인트 상점</span>
                          </button>
                        </div>
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onLogout) onLogout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>로그아웃</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => onSignup ? onSignup() : onLogin && onLogin()}
                    variant="ghost" 
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    회원가입
                  </Button>
                  <Button 
                    onClick={onLogin}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    로그인
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">{/* pt-24 for header spacing */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <h1 className="text-5xl font-bold text-white mb-6">리더보드</h1>
            <p className="text-xl text-gray-300 mb-8">곧 출시 예정입니다</p>
            <p className="text-gray-400">
              최고의 예측 전문가들과 경쟁해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}