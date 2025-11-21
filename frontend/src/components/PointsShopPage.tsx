import { ArrowLeft, TrendingUp, ShoppingBag, Sparkles, Trophy, Star, Crown, Flame, Zap, Heart, Shield, Gem, Award, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface PointsShopPageProps {
  onBack: () => void;
}

type Category = 'all' | 'icons' | 'badges' | 'banners';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'icons' | 'badges' | 'banners';
  emoji?: string;
  gradient?: string;
  icon?: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned?: boolean;
}

export function PointsShopPage({ onBack }: PointsShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [userPoints, setUserPoints] = useState(2500);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const shopItems: ShopItem[] = [
    // Profile Icons
    {
      id: 'icon-whale',
      name: '고래 아이콘',
      description: '큰 손의 상징',
      price: 500,
      category: 'icons',
      emoji: '🐋',
      rarity: 'epic',
    },
    {
      id: 'icon-rocket',
      name: '로켓 아이콘',
      description: '무한 상승!',
      price: 300,
      category: 'icons',
      emoji: '🚀',
      rarity: 'rare',
    },
    {
      id: 'icon-diamond',
      name: '다이아몬드 아이콘',
      description: '다이아몬드 핸즈',
      price: 800,
      category: 'icons',
      emoji: '💎',
      rarity: 'legendary',
    },
    {
      id: 'icon-crown',
      name: '왕관 아이콘',
      description: '투표의 왕',
      price: 1000,
      category: 'icons',
      emoji: '👑',
      rarity: 'legendary',
    },
    {
      id: 'icon-fire',
      name: '불꽃 아이콘',
      description: '핫한 투표자',
      price: 400,
      category: 'icons',
      emoji: '🔥',
      rarity: 'rare',
    },
    {
      id: 'icon-brain',
      name: '두뇌 아이콘',
      description: '스마트 머니',
      price: 600,
      category: 'icons',
      emoji: '🧠',
      rarity: 'epic',
    },
    {
      id: 'icon-bull',
      name: '황소 아이콘',
      description: '강세장의 지배자',
      price: 350,
      category: 'icons',
      emoji: '🐂',
      rarity: 'rare',
    },
    {
      id: 'icon-bear',
      name: '곰 아이콘',
      description: '약세장 예측가',
      price: 350,
      category: 'icons',
      emoji: '🐻',
      rarity: 'rare',
    },

    // Badges
    {
      id: 'badge-winner',
      name: '승리자 뱃지',
      description: '10번 이상 승리',
      price: 750,
      category: 'badges',
      icon: Trophy,
      gradient: 'from-yellow-500 to-orange-500',
      rarity: 'epic',
    },
    {
      id: 'badge-streak',
      name: '연승 뱃지',
      description: '5연승 달성',
      price: 900,
      category: 'badges',
      icon: Flame,
      gradient: 'from-red-500 to-orange-500',
      rarity: 'epic',
    },
    {
      id: 'badge-pro',
      name: '프로 트레이더',
      description: '승률 80% 이상',
      price: 1200,
      category: 'badges',
      icon: Star,
      gradient: 'from-purple-500 to-pink-500',
      rarity: 'legendary',
    },
    {
      id: 'badge-early',
      name: '얼리어답터',
      description: '초기 투표자',
      price: 500,
      category: 'badges',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      rarity: 'rare',
    },
    {
      id: 'badge-whale',
      name: '고래 뱃지',
      description: '10,000pt 이상 보유',
      price: 1500,
      category: 'badges',
      icon: Crown,
      gradient: 'from-yellow-600 to-yellow-400',
      rarity: 'legendary',
    },
    {
      id: 'badge-lucky',
      name: '행운의 뱃지',
      description: '럭키 세븐',
      price: 777,
      category: 'badges',
      icon: Sparkles,
      gradient: 'from-green-500 to-emerald-500',
      rarity: 'epic',
    },
    {
      id: 'badge-heart',
      name: '커뮤니티 히어로',
      description: '좋아요 100개 이상',
      price: 600,
      category: 'badges',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      rarity: 'rare',
    },
    {
      id: 'badge-shield',
      name: '수호자 뱃지',
      description: '포트폴리오 보호',
      price: 800,
      category: 'badges',
      icon: Shield,
      gradient: 'from-indigo-500 to-blue-500',
      rarity: 'epic',
    },

    // Banners
    {
      id: 'banner-galaxy',
      name: '은하수 배너',
      description: '우주를 배경으로',
      price: 1200,
      category: 'banners',
      gradient: 'from-indigo-900 via-purple-900 to-pink-900',
      rarity: 'epic',
    },
    {
      id: 'banner-sunset',
      name: '석양 배너',
      description: '따뜻한 노을빛',
      price: 800,
      category: 'banners',
      gradient: 'from-orange-500 via-pink-500 to-purple-500',
      rarity: 'rare',
    },
    {
      id: 'banner-ocean',
      name: '오션 배너',
      description: '깊은 바다의 색',
      price: 900,
      category: 'banners',
      gradient: 'from-blue-900 via-cyan-700 to-teal-500',
      rarity: 'epic',
    },
    {
      id: 'banner-fire',
      name: '화염 배너',
      description: '불타는 열정',
      price: 1000,
      category: 'banners',
      gradient: 'from-red-600 via-orange-500 to-yellow-500',
      rarity: 'epic',
    },
    {
      id: 'banner-emerald',
      name: '에메랄드 배너',
      description: '신비로운 녹색',
      price: 1100,
      category: 'banners',
      gradient: 'from-emerald-800 via-green-600 to-lime-500',
      rarity: 'epic',
    },
    {
      id: 'banner-gold',
      name: '골드 배너',
      description: '황금빛 영광',
      price: 1500,
      category: 'banners',
      gradient: 'from-yellow-700 via-yellow-500 to-amber-300',
      rarity: 'legendary',
    },
    {
      id: 'banner-rainbow',
      name: '레인보우 배너',
      description: '무지개의 환상',
      price: 2000,
      category: 'banners',
      gradient: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
      rarity: 'legendary',
    },
    {
      id: 'banner-aurora',
      name: '오로라 배너',
      description: '신비로운 오로라',
      price: 1800,
      category: 'banners',
      gradient: 'from-cyan-400 via-purple-400 to-pink-400',
      rarity: 'legendary',
    },
  ];

  const filteredItems = shopItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500/30';
      case 'rare': return 'text-blue-400 border-blue-500/30';
      case 'epic': return 'text-purple-400 border-purple-500/30';
      case 'legendary': return 'text-yellow-400 border-yellow-500/30';
      default: return 'text-gray-400';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return '일반';
      case 'rare': return '레어';
      case 'epic': return '에픽';
      case 'legendary': return '전설';
      default: return '';
    }
  };

  const handlePurchase = (item: ShopItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedItem && userPoints >= selectedItem.price) {
      setUserPoints(userPoints - selectedItem.price);
      setPurchasedItems([...purchasedItems, selectedItem.id]);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                뒤로
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">포인트 상점</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl px-4 py-2">
              <Gem className="w-5 h-5 text-purple-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">보유 포인트</span>
                <span className="font-bold text-white">{userPoints.toLocaleString()}pt</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-white" />
              <span className="text-white/80 font-medium">신규 아이템</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">프로필을 꾸며보세요!</h1>
            <p className="text-white/90">다양한 아이콘, 뱃지, 배너로 나만의 개성을 표현하세요</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedCategory('icons')}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'icons'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            프로필 아이콘
          </button>
          <button
            onClick={() => setSelectedCategory('badges')}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'badges'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            뱃지
          </button>
          <button
            onClick={() => setSelectedCategory('banners')}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'banners'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            배너
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`bg-white/5 backdrop-blur border rounded-2xl overflow-hidden transition-all hover:scale-105 ${getRarityColor(item.rarity)}`}
              >
                {/* Item Preview */}
                <div className="relative">
                  {item.category === 'icons' && (
                    <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-8xl">{item.emoji}</span>
                    </div>
                  )}
                  {item.category === 'badges' && item.icon && (
                    <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`} />
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl`}>
                        <item.icon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}
                  {item.category === 'banners' && (
                    <div className={`aspect-[3/1] bg-gradient-to-r ${item.gradient}`} />
                  )}
                  
                  {/* Rarity Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border ${getRarityColor(item.rarity)} bg-black/50`}>
                    {getRarityName(item.rarity)}
                  </div>

                  {/* Owned Badge */}
                  {isOwned && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm bg-green-500/80 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      보유중
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Gem className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-bold">{item.price}pt</span>
                    </div>
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={isOwned}
                      className={`${
                        isOwned
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                      } text-white text-sm px-4`}
                    >
                      {isOwned ? '보유중' : '구매'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">구매 확인</h2>
            
            {/* Item Preview in Modal */}
            <div className={`mb-6 rounded-xl overflow-hidden border ${getRarityColor(selectedItem.rarity)}`}>
              {selectedItem.category === 'icons' && (
                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-8xl">{selectedItem.emoji}</span>
                </div>
              )}
              {selectedItem.category === 'badges' && selectedItem.icon && (
                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${selectedItem.gradient} flex items-center justify-center shadow-2xl`}>
                    <selectedItem.icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
              {selectedItem.category === 'banners' && (
                <div className={`aspect-[3/1] bg-gradient-to-r ${selectedItem.gradient}`} />
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">{selectedItem.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{selectedItem.description}</p>
              
              <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">등급</span>
                  <span className={getRarityColor(selectedItem.rarity)}>{getRarityName(selectedItem.rarity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">가격</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Gem className="w-4 h-4 text-purple-400" />
                    {selectedItem.price}pt
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">구매 후 잔액</span>
                  <span className={`font-medium ${
                    userPoints - selectedItem.price >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(userPoints - selectedItem.price).toLocaleString()}pt
                  </span>
                </div>
              </div>
            </div>

            {userPoints < selectedItem.price && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm">포인트가 부족합니다!</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPurchaseModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={userPoints < selectedItem.price}
                className={`flex-1 ${
                  userPoints < selectedItem.price
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                구매하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
