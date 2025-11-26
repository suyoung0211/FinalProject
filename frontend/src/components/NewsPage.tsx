import { TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface NewsPageProps {
  onBack: () => void;
  onCommunity?: () => void;
  onLeaderboard?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onVote?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

type NewsCategory = '홈' | '정치' | '경제' | '사회' | '크립토' | '스포츠' | '기술' | '문화' | '국제';

interface NewsArticle {
  id: number;
  category: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  image?: string;
  hasVideo?: boolean;
}

export function NewsPage({ onBack, onCommunity, onLeaderboard, onPointsShop, onProfile, onVote, user, onLogin, onLogout, onSignup }: NewsPageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('홈');
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const categories: NewsCategory[] = ['홈', '정치', '경제', '사회', '크립토', '스포츠', '기술', '문화', '국제'];

  const mainNews: NewsArticle[] = [
    {
      id: 1,
      category: '크립토',
      title: '비트코인, 10만 달러 돌파... 기관 투자자들의 관심 집중',
      summary: '비트코인이 사상 최고가인 10만 달러를 돌파하며 암호화폐 시장이 다시 한번 뜨거운 관심을 받고 있다. 기관 투자자들의 대규모 매수세가 이어지면서...',
      source: 'CryptoNews',
      timeAgo: '1시간 전',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    },
    {
      id: 2,
      category: '정치',
      title: '2025년 대선 후보 토론회 개최... 경제 정책 공방 치열',
      summary: '주요 대선 후보들이 첫 TV 토론회에서 경제 정책을 놓고 치열한 공방을 벌였다. 특히 부동산 정책과 세제 개편안을 두고...',
      source: '정치뉴스',
      timeAgo: '2시간 전',
      hasVideo: true,
      image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
    },
    {
      id: 3,
      category: '경제',
      title: 'AI 산업 급성장... 관련 기업들 주가 상승세',
      summary: '인공지능 산업의 급성장으로 관련 기업들의 주가가 일제히 상승하고 있다. 특히 반도체와 클라우드 서비스 기업들이...',
      source: '경제일보',
      timeAgo: '3시간 전',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    },
    {
      id: 4,
      category: '스포츠',
      title: '손흥민, 프리미어리그 2경기 연속 멀티골 달성',
      summary: '손흥민이 프리미어리그에서 2경기 연속 멀티골을 기록하며 팀 승리를 이끌었다. 이번 시즌 통산 15골째를 기록하며...',
      source: '스포츠타임즈',
      timeAgo: '4시간 전',
      hasVideo: true,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    },
    {
      id: 5,
      category: '기술',
      title: 'OpenAI, GPT-5 모델 공개 예정... AI 성능 대폭 향상',
      summary: 'OpenAI가 차세대 언어 모델인 GPT-5를 곧 공개할 예정이라고 발표했다. 이전 모델 대비 추론 능력과 정확도가...',
      source: 'TechWorld',
      timeAgo: '5시간 전',
    },
    {
      id: 6,
      category: '사회',
      title: '전국 지하철 요금 인상 논의... 시민단체 반발',
      summary: '전국 주요 도시의 지하철 요금 인상이 논의되면서 시민단체들의 반발이 거세지고 있다. 평균 200원 인상안이...',
      source: '사회뉴스',
      timeAgo: '6시간 전',
    },
    {
      id: 7,
      category: '정치',
      title: '국회, 내년도 예산안 본회의 통과',
      summary: '국회가 내년도 예산안을 본회의에서 통과시켰다. 총 예산 규모는 전년 대비 3.2% 증가한 것으로...',
      source: '정치뉴스',
      timeAgo: '7시간 전',
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    },
    {
      id: 8,
      category: '경제',
      title: '코스피, 3,000선 돌파... 외국인 매수세 지속',
      summary: '코스피 지수가 3,000선을 돌파했다. 외국인 투자자들의 매수세가 지속되면서...',
      source: '경제일보',
      timeAgo: '8시간 전',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    },
    {
      id: 9,
      category: '크립토',
      title: '이더리움 2.0 업그레이드 완료... 수수료 90% 감소',
      summary: '이더리움 2.0 업그레이드가 성공적으로 완료되었다. 거래 수수료가 90% 이상 감소하며...',
      source: 'CryptoNews',
      timeAgo: '9시간 전',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    },
    {
      id: 10,
      category: '스포츠',
      title: 'MLB 시즌 개막... 오타니, 개막전 홈런 포함 3안타',
      summary: 'MLB 시즌이 개막했다. 오타니 쇼헤이가 개막전에서 홈런을 포함 3안타를 기록하며...',
      source: '스포츠타임즈',
      timeAgo: '10시간 전',
    },
    {
      id: 11,
      category: '기술',
      title: '애플, AR 글래스 출시 예고... VR 시장 본격 진출',
      summary: '애플이 증강현실(AR) 글래스를 곧 출시할 예정이라고 발표했다. VR 시장에 본격 진출하며...',
      source: 'TechWorld',
      timeAgo: '11시간 전',
    },
    {
      id: 12,
      category: '사회',
      title: '서울 아파트 평균 가격 10억 돌파',
      summary: '서울 지역 아파트 평균 가격이 10억 원을 돌파했다. 강남 3구를 중심으로 가격 상승이...',
      source: '사회뉴스',
      timeAgo: '12시간 전',
    },
    {
      id: 13,
      category: '문화',
      title: 'BTS 새 앨범 발매... 빌보드 1위 전망',
      summary: 'BTS가 새 앨범을 발매했다. 빌보드 차트 1위를 차지할 것으로 전망되며...',
      source: '문화일보',
      timeAgo: '13시간 전',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    },
    {
      id: 14,
      category: '국제',
      title: 'G7 정상회담 개최... 기후변화 대응 논의',
      summary: 'G7 정상회담이 개최되어 기후변화 대응 방안을 논의했다. 2030년까지 탄소 배출량 50% 감축에...',
      source: '국제뉴스',
      timeAgo: '14시간 전',
    },
    {
      id: 15,
      category: '정치',
      title: '지방선거 D-30... 각 정당 공약 발표 경쟁',
      summary: '지방선거가 한 달 앞으로 다가오면서 각 정당들이 공약 발표에 나섰다. 교통, 주거, 교육 분야에...',
      source: '정치뉴스',
      timeAgo: '15시간 전',
    },
    {
      id: 16,
      category: '경제',
      title: '한국은행, 기준금리 동결... 경기 회복 지켜보기로',
      summary: '한국은행이 기준금리를 동결했다. 경기 회복세를 지켜본 뒤 추가 조치를 결정하기로...',
      source: '경제일보',
      timeAgo: '16시간 전',
    },
  ];

  // 선택된 카테고리에 따라 뉴스 필터링
  const categoryNews = selectedCategory === '홈' 
    ? mainNews 
    : mainNews.filter(news => news.category === selectedCategory);

  // 해당 카테고리 뉴스에 다른 뉴스를 추가하여 최소 12개 보장
  const minNewsCount = 12;
  const displayNews = selectedCategory === '홈'
    ? mainNews
    : categoryNews.length >= minNewsCount
      ? categoryNews
      : [
          ...categoryNews,
          ...mainNews.filter(news => news.category !== selectedCategory).slice(0, minNewsCount - categoryNews.length)
        ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % displayNews.filter(news => news.image).length);
    }, 3000);
    slideIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [displayNews]);

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
                  className="text-purple-400 font-medium"
                >
                  뉴스
                </button>
                <button 
                  onClick={onLeaderboard}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Category Tabs */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'text-white font-bold border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {selectedCategory === '홈' ? (
          /* Home Layout with Sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Main News List */}
            <div className="lg:col-span-2 space-y-4">
              {displayNews.map((news, index) => (
                <div
                  key={news.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex gap-4 p-4">
                    {news.image && (
                      <div className="w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {news.hasVideo && !news.image && (
                      <div className="w-40 h-28 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <div className="text-white text-sm">▶ 동영상</div>
                      </div>
                    )}
                    {!news.image && !news.hasVideo && (
                      <div className="w-40 h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {news.summary}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{news.timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index === 2 && (
                    <div className="px-4 pb-4">
                      <div className="h-px bg-white/10" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section - Hot News & More */}
            <div className="lg:col-span-1 space-y-6">
              {/* Hot News */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="text-white font-bold text-lg">핫뉴스</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {displayNews.slice(0, 8).map((news, index) => (
                    <div
                      key={`hot-${news.id}`}
                      className="flex gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
                    >
                      {news.image && (
                        <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm line-clamp-2 mb-1">
                          {news.title}
                        </p>
                        <span className="text-xs text-gray-500">{news.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Viewed */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="text-white font-bold text-lg">많이 본 뉴스</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {displayNews.slice(0, 10).map((news, index) => (
                    <div
                      key={`viewed-${news.id}`}
                      className="flex gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
                    >
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        <span className={`font-bold ${index < 3 ? 'text-purple-400' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm line-clamp-2">
                          {news.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Keywords */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="text-white font-bold text-lg">실시간 검색어</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  {['비트코인 10만불', '대선 토론회', 'AI 산업', '손흥민 멀티골', 'GPT-5 출시', '지하철 요금', '코스피 3000', '이더리움 2.0', 'BTS 신곡', 'G7 정상회담'].map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
                    >
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        <span className={`font-bold text-sm ${index < 3 ? 'text-purple-400' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-white text-sm">{keyword}</span>
                      {index < 5 && (
                        <div className="ml-auto">
                          <span className="text-red-400 text-xs">🔥</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Category Layout - Full Width */
          <div>
            {/* Top Section - Main Story & Side Stories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Main Story - Takes 2 columns */}
              {displayNews[0] && (
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
                  {displayNews[0].image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={displayNews[0].image} 
                        alt={displayNews[0].title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-4 hover:text-purple-400 transition-colors">
                      {displayNews[0].title}
                    </h2>
                    <p className="text-gray-300 text-base mb-4">
                      {displayNews[0].summary}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{displayNews[0].source}</span>
                      <span>•</span>
                      <span>{displayNews[0].timeAgo}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Side Stories - Takes 1 column */}
              <div className="space-y-4">
                {displayNews.slice(1, 3).map((news) => (
                  <div 
                    key={news.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex gap-3 p-4">
                      {news.image && (
                        <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-3 hover:text-purple-400 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {news.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News List with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left - News List (3 columns) */}
              <div className="lg:col-span-3 space-y-4">
                {displayNews.slice(3).map((news) => (
                  <div
                    key={news.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex gap-4 p-4">
                      {news.image && (
                        <div className="w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {!news.image && news.hasVideo && (
                        <div className="w-40 h-28 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <div className="text-white text-sm">▶ 동영상</div>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {news.summary}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{news.source}</span>
                          <span>•</span>
                          <span>{news.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right - Most Viewed (1 column) */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sticky top-24">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">{selectedCategory} 많이 본 뉴스</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {displayNews.slice(0, 5).map((news, index) => (
                      <div
                        key={`most-viewed-${news.id}`}
                        className="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
                      >
                        <div className="flex gap-3 mb-2">
                          <span className="text-xl font-bold text-purple-400">{index + 1}</span>
                          <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">
                            {news.title}
                          </h4>
                        </div>
                        {news.image && (
                          <div className="ml-8 rounded-lg overflow-hidden">
                            <img 
                              src={news.image} 
                              alt={news.title}
                              className="w-full aspect-video object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section - More News - Only show on Home */}
        {selectedCategory === '홈' && (
          <>
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">속보</span>
                <h2 className="text-2xl font-bold text-white">실시간 뉴스</h2>
              </div>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-4"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {displayNews.filter(news => news.image).map((news) => (
                  <div key={news.id} className="min-w-full md:min-w-[calc(50%-8px)] lg:min-w-[calc(33.333%-11px)]">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer h-full">
                      <div className="relative">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded animate-pulse">
                            속보
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                            {news.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {news.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{news.timeAgo}</span>
                          </div>
                          <span className="text-xs text-gray-500">{news.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {displayNews.filter(news => news.image).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-purple-500 w-8' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
            </div>

            {/* Photo News Section */}
            <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              포토
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>1 / 2</span>
              <div className="flex items-center gap-2">
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
              <div className="aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80"
                  alt="포토 뉴스 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded">사진</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    우도 천진항 사고 현장 점검하는 헨더 검찰 관계자들
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
              <div className="aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80"
                  alt="포토 뉴스 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded">화보</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    스위트룸 차지한 칼만조...백악관 사면 전 호사스런 하루밤
                  </h3>
                </div>
              </div>
            </div>
            </div>

            {/* Video News Section */}
            <div className="mt-16 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              영상
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>1 / 2</span>
              <div className="flex items-center gap-2">
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
              <div className="relative">
                <div className="aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80"
                    alt="영상 뉴스 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-purple-600 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">연합뉴스</span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">01:57</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                  3천600톤급 미니이지스함 최신예 호위함 '진남함' 진수
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                  [영상] 5개월만에 또…3천600톤급 최신예 호위함 '진남함' 진수
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
              <div className="relative">
                <div className="aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=600&q=80"
                    alt="영상 뉴스 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-purple-600 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">연합뉴스</span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">01:37</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                  평화 협상 이랑곳 앞고리, 우크라 한밤 대공습
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                  [영상] 평화 협상 중이는데…러, 우크라 키이우에 한밤 대공습
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
              <div className="relative">
                <div className="aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80"
                    alt="영상 뉴스 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-purple-600 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">연합뉴스</span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">07:48</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                  부토가 뒤덮어쓰고 의회 입장 "벗어라!" 요구에 손가락질
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                  [영상] 일신고 부토가 뒤덮어쓰고 상임…\"벗어라!\" 요구에 손가락질
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}