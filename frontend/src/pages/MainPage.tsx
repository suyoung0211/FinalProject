// ------------------------------------------------------------
// src/pages/MainPage.tsx (최종 완성본)
// ------------------------------------------------------------

import {
  TrendingUp,
  Search,
  User,
  ChevronDown,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { fetchHomeData } from "../api/homeApi";
import { fetchRecommendedIssues, fetchLatestIssues } from "../api/issueApi";
import { fetchCategories } from "../api/categoryApi";

import NewsSlider from "../components/home/NewsSlider";
import LatestNewsSidebar from "../components/home/LatestNewsSidebar";
import LatestNewsList from "../components/home/LatestNewsList";

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

  const [newsSlides, setNewsSlides] = useState<SlideNews[]>([]);
  const [hotIssues, setHotIssues] = useState<HotIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<HotIssue[]>([]);
  const [latestIssues, setLatestIssues] = useState<HotIssue[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [recommendedIssues, setRecommendedIssues] = useState([]);
  const [siteLatestIssues, setSiteLatestIssues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------
  // 🔥 1) 홈 데이터 + 카테고리 로드 (초기 1회)
  // -------------------------------------------------------
  useEffect(() => {
    loadHomeData();
    loadSiteIssues();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(["all", ...res.data]);
    } catch (err) {
      console.error("카테고리 불러오기 실패:", err);
    }
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await fetchHomeData();

      setNewsSlides(res.data.newsSlides || []);
      setHotIssues(res.data.hotIssues || []);
      setFilteredIssues(res.data.hotIssues || []); // 초기 기본값
      setLatestIssues(res.data.latestIssues || []);
    } catch (err) {
      console.error("홈 데이터 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteIssues = async () => {
    try {
      const [rec, latest] = await Promise.all([
        fetchRecommendedIssues(),
        fetchLatestIssues(),
      ]);

      setRecommendedIssues(rec.data || []);
      setSiteLatestIssues(latest.data || []);
    } catch (err) {
      console.error("사이트 이슈 로딩 오류:", err);
    }
  };

  // -------------------------------------------------------
  // 🔥 2) 카테고리 변경 시 API 호출 없이 local filter
  // -------------------------------------------------------
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredIssues(hotIssues);
    } else {
      const filtered = hotIssues.filter((article) =>
        article.categories?.includes(selectedCategory)
      );
      setFilteredIssues(filtered);
    }
  }, [selectedCategory, hotIssues]);

  // -------------------------------------------------------
  // 🔍 검색 필터링
  // -------------------------------------------------------
  const finalFiltered = filteredIssues.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.aiTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24">

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
            <button onClick={() => navigate("/community")} className="hover:text-white">커뮤니티</button>
            <button onClick={() => navigate("/vote")} className="hover:text-white">투표하기</button>
            <button onClick={() => navigate("/article")} className="hover:text-white">기사</button>
          </nav>

          {!user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/login?mode=signup")} className="text-gray-300 hover:text-white px-4 py-2">회원가입</button>
              <button onClick={() => navigate("/login")} className="text-gray-300 hover:text-white px-4 py-2">로그인</button>
            </div>
          ) : (
            <UserDropdown user={user} onLogout={logout} />
          )}
        </div>
      </header>

      {/* ---------------- SLIDER + SIDEBAR ---------------- */}
<section className="w-full px-6 mt-10">
  <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <div className="md:col-span-2">
      <NewsSlider slides={newsSlides} />
    </div>

    <div className="md:col-span-1">
      <div className="h-[380px] md:h-[525px] overflow-hidden rounded-2xl">
        <LatestNewsSidebar items={latestIssues} />
      </div>
    </div>

  </div>
</section>

      {/* ---------------- CATEGORY ---------------- */}
      <section className="w-full px-6 mt-8">
        <div className="max-w-[1440px] mx-auto flex gap-3 justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  : "bg-white/10 text-gray-300 border border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- SEARCH ---------------- */}
      <section className="w-full px-6 pt-5">
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

      {/* ---------------- MAIN CONTENT ---------------- */}
      <section className="w-full px-6 mt-3">
        <h2 className="text-2xl font-bold text-white mb-6">핫이슈</h2>
        {loading && <p className="text-gray-300">불러오는 중...</p>}
        <LatestNewsList items={finalFiltered} />
      </section>

    </div>
  );
}

// ---------------- USER DROPDOWN ----------------
function UserDropdown({ user, onLogout }: { user: any; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/20"
      >
        <User className="w-5 h-5 text-white" />
        {user?.nickname}
        <ChevronDown className={`w-4 h-4 text-gray-400 ${open ? "rotate-180" : ""}`} />
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
