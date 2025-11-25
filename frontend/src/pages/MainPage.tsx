// src/pages/MainPage.tsx
import {
  TrendingUp,
  Flame,
  Globe,
  Users,
  Briefcase,
  Zap,
  DollarSign,
  Search,
  User,
  ChevronDown,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { fetchHomeData, fetchArticlesByCategory } from "../api/homeApi";

import NewsSlider from "../components/home/NewsSlider";
import LatestNewsSidebar from "../components/home/LatestNewsSidebar";

// 타입 정의
interface HotIssue {
  articleId: number;
  title: string;
  aiTitle: string | null;
  thumbnail: string | null;
  publishedAt: string;
  categories: string[];
}

interface SlideNews {
  articleId: number;
  aiTitle: string | null;
  thumbnail: string | null;
  publishedAt: string;
}

export function MainPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [newsSlides, setNewsSlides] = useState<SlideNews[]>([]);
  const [hotIssues, setHotIssues] = useState<HotIssue[]>([]);
  const [latestIssues, setLatestIssues] = useState<HotIssue[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "all", label: "전체", icon: Globe },
    { id: "정치", label: "정치", icon: Users },
    { id: "경제", label: "경제", icon: Briefcase },
    { id: "크립토", label: "크립토", icon: DollarSign },
    { id: "스포츠", label: "스포츠", icon: Zap },
    { id: "엔터", label: "엔터", icon: Flame },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await fetchHomeData();

      setNewsSlides(res.data.newsSlides || []);
      setHotIssues(res.data.hotIssues || []);
      setLatestIssues(res.data.latestIssues || []);
    } catch (err) {
      console.error("홈 데이터 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      loadHomeData();
    } else {
      loadCategoryArticles(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategoryArticles = async (category: string) => {
    try {
      setLoading(true);
      const res = await fetchArticlesByCategory(category);
      setHotIssues(res.data || []);
    } catch (err) {
      console.error("카테고리 로딩 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = hotIssues.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Mak'gora</span>
          </div>

          <nav className="hidden md:flex gap-6 items-center text-gray-300">
            <button
              onClick={() => navigate("/community")}   // ⭐ onClick 없어서 추가함.
              className="hover:text-white transition">커뮤니티</button>

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

          <div>
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login?mode=signup")}
                  className="text-gray-300 hover:text-white px-4 py-2"
                >
                  회원가입
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white px-4 py-2"
                >
                  로그인
                </button>
              </div>
            ) : (
              <UserDropdown user={user} onLogout={logout} />
            )}
          </div>
        </div>
      </header>

      {/* SLIDER + SIDEBAR (2:1 레이아웃) */}
<section className="w-full max-w-[1440px] mx-auto px-6 pt-32">
  <div className="flex gap-6">
    {/* LEFT: 슬라이드쇼 (2/3) */}
    <div className="flex-[2]">
      <NewsSlider slides={newsSlides} />
    </div>

    {/* RIGHT: 최신 뉴스 사이드바 (1/3) */}
    <div className="flex-[1]">
      <LatestNewsSidebar items={latestIssues} />
    </div>
  </div>
</section>

      {/* CATEGORY */}
      <section className="w-full px-6 mt-8">
        <div className="max-w-[1440px] mx-auto flex gap-3 justify-center flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "bg-white/10 text-gray-300 border border-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 검색 */}
      <section className="w-full px-6 pt-6">
        <div className="max-w-[700px] mx-auto relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <Input
            className="bg-white/10 border-white/20 text-white pl-12 h-12"
            placeholder="이슈 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* HOT ISSUES */}
      <section className="w-full px-6 mt-10 pb-20">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">핫이슈</h2>

          {loading && <p className="text-gray-300">불러오는 중...</p>}
          <LatestNewsSidebar items={filteredIssues} />
        </div>
      </section>
    </div>
  );
}

// User Dropdown
function UserDropdown({
  user,
  onLogout,
}: {
  user: any;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20"
      >
        <User className="w-5 h-5 text-white" />
        <span className="hidden sm:block text-white">{user?.nickname}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-2xl p-2">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-xl"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
