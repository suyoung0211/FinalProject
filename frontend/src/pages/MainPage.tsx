import {
  TrendingUp,
  Flame,
  Clock,
  Globe,
  Briefcase,
  Zap,
  Users,
  DollarSign,
  Search,
  Filter,
  User,
  ChevronDown,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  trending?: boolean;
}

export function MainPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "전체", icon: Globe },
    { id: "politics", label: "정치", icon: Users },
    { id: "business", label: "경제", icon: Briefcase },
    { id: "crypto", label: "크립토", icon: DollarSign },
    { id: "sports", label: "스포츠", icon: Zap },
    { id: "entertainment", label: "엔터", icon: Flame },
  ];

  const markets: Market[] = [
    {
      id: "1",
      question: "2025년 비트코인이 15만 달러를 돌파할까요?",
      category: "crypto",
      yesPrice: 67,
      noPrice: 33,
      volume: "$2.4M",
      endDate: "2025년 12월 31일",
      trending: true,
    },
    {
      id: "2",
      question: "다음 대선에서 여당이 승리할까요?",
      category: "politics",
      yesPrice: 52,
      noPrice: 48,
      volume: "$1.8M",
      endDate: "2027년 3월 9일",
      trending: true,
    },
    {
      id: "3",
      question: "AI가 2025년 내에 의사 면허 시험을 통과할까요?",
      category: "business",
      yesPrice: 78,
      noPrice: 22,
      volume: "$890K",
      endDate: "2025년 12월 31일",
    },
    {
      id: "4",
      question: "손흥민이 이번 시즌 20골 이상을 기록할까요?",
      category: "sports",
      yesPrice: 45,
      noPrice: 55,
      volume: "$650K",
      endDate: "2025년 5월 25일",
    },
    {
      id: "5",
      question: "Tesla 주가가 2025년 내 500달러를 돌파할까요?",
      category: "business",
      yesPrice: 61,
      noPrice: 39,
      volume: "$1.2M",
      endDate: "2025년 12월 31일",
      trending: true,
    },
    {
      id: "6",
      question: "BTS가 2025년에 완전체 컴백을 할까요?",
      category: "entertainment",
      yesPrice: 34,
      noPrice: 66,
      volume: "$780K",
      endDate: "2025년 12월 31일",
    },
  ];

  const filteredMarkets = markets.filter((m) => {
    const matchCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    const matchSearch = m.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const trendingMarkets = markets.filter((m) => m.trending);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Mak' gora</span>
          </div>

          {/* NAV */}
          <nav className="hidden md:flex gap-6 items-center text-gray-300">
            <button className="hover:text-white transition">커뮤니티</button>

            <button
              onClick={() => (user ? navigate("/leaderboard") : navigate("/login"))}
              className="hover:text-white transition"
            >
              리더보드
            </button>

            <button
              onClick={() => (user ? navigate("/shop") : navigate("/login"))}
              className="hover:text-white transition"
            >
              포인트 상점
            </button>
          </nav>

          {/* USER AREA */}
          <div>
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login?mode=signup")} // ⭐ fix : 회원가입 눌렀을 때 회원가입 폼으로 가게 변경함
                  className="text-gray-300 hover:text-white px-4 py-2"
                >
                  회원가입
                </button>
                <div className="w-px h-4 bg-gray-600" />
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white px-4 py-2"
                >
                  로그인
                </button>
              </div>
            ) : (
              <UserDropdown
                user={user}
                onLogout={logout}
                onProfile={() => navigate("/profile")}
                onPointsShop={() => navigate("/shop")}
              />
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="w-full pt-32 pb-16 px-6">
        <div className="max-w-[1440px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-purple-200 text-sm">실시간 예측 시장</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            미래의 이슈에 <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              투표하고 예측하세요
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            정치, 경제, 스포츠, 엔터테인먼트까지  
            <br />
            다양한 이슈에 대한 집단 지성을 확인하세요.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="w-full px-6 pb-10">
        <div className="max-w-[700px] mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              className="bg-white/10 border-white/20 text-white pl-12 h-12"
              placeholder="이슈 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-white/10 text-white border border-white/20 h-12 px-6">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="w-full px-6 pb-12">
        <div className="max-w-[1440px] mx-auto flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition 
                  ${
                    active
                      ? "bg-gradient-to-r from-[#FF4EC7] to-[#A548FF] text-white shadow-lg shadow-pink-500/30"
                      : "bg-white/10 text-gray-300 border border-white/20 backdrop-blur-sm hover:bg-white/20"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      {selectedCategory === "all" && (
        <section className="w-full px-6 mb-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-2 mb-6 text-white">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold">트렌딩 이슈</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {trendingMarkets.map((m) => (
                <MarketCard key={m.id} market={m} featured onClick={() => navigate(`/market/${m.id}`)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL MARKETS */}
      <section className="w-full px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 mb-6 text-white">
            <Clock className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all"
                ? "모든 이슈"
                : categories.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <span className="text-gray-400">({filteredMarkets.length})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMarkets.map((m) => (
              <MarketCard key={m.id} market={m} onClick={() => navigate(`/market/${m.id}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full px-6 mt-20 pb-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsBox value="$8.2M" label="총 거래량" />
          <StatsBox value="24,891" label="활성 사용자" />
          <StatsBox value="156" label="진행 중인 이슈" />
        </div>
      </section>
    </div>
  );
}

function StatsBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-6 text-center">
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

function MarketCard({
  market,
  featured,
  onClick,
}: {
  market: Market;
  featured?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 border border-white/10 rounded-2xl p-6 transition cursor-pointer hover:bg-white/10 
        ${featured ? "ring-2 ring-purple-500/40" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {market.question}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            {market.endDate}
          </div>
        </div>

        {market.trending && (
          <div className="px-2 py-1 bg-orange-500/20 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-300">HOT</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <VoteBtn type="yes" value={market.yesPrice} />
        <VoteBtn type="no" value={market.noPrice} />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          거래량: {market.volume}
        </div>
        <button className="text-purple-400 hover:text-purple-300">
          자세히 보기 →
        </button>
      </div>
    </div>
  );
}

function VoteBtn({ type, value }: { type: "yes" | "no"; value: number }) {
  const isYes = type === "yes";
  return (
    <button
      className={`p-4 rounded-xl transition group 
        ${
          isYes
            ? "bg-green-500/20 border border-green-500/30 hover:bg-green-500/30"
            : "bg-red-500/20 border border-red-500/30 hover:bg-red-500/30"
        }`}
    >
      <div className={isYes ? "text-green-400" : "text-red-400"}>
        {isYes ? "YES" : "NO"}
      </div>
      <div className="text-2xl text-white font-bold">{value}%</div>
      <div
        className={`text-xs mt-1 opacity-0 group-hover:opacity-100 transition ${
          isYes ? "text-green-300" : "text-red-300"
        }`}
      >
        투표하기
      </div>
    </button>
  );
}

function UserDropdown({
  user,
  onLogout,
  onProfile,
  onPointsShop,
}: {
  user: any;
  onLogout?: () => void;
  onProfile?: () => void;
  onPointsShop?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="hidden sm:block text-white">{user?.nickname || user?.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 border border-white/20 rounded-2xl shadow-xl p-2">
          <button
            onClick={() => {
              setOpen(false);
              onProfile?.();
            }}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl"
          >
            프로필
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onPointsShop?.();
            }}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl"
          >
            포인트 상점
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl mt-2"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
