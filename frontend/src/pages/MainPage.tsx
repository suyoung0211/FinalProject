// ------------------------------------------------------------
// src/pages/MainPage.tsx  (이슈리스트 포함 전체 최신 버전)
// ------------------------------------------------------------

import {
  TrendingUp,
  Flame,
  Globe,
  Briefcase,
  Search,
  User,
  ChevronDown,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { fetchHomeData, fetchArticlesByCategory } from "../api/homeApi";
import { fetchRecommendedIssues, fetchLatestIssues } from "../api/issueApi";

import NewsSlider from "../components/home/NewsSlider";
import LatestNewsSidebar from "../components/home/LatestNewsSidebar";
import LatestNewsList from "../components/home/LatestNewsList";
import { Header } from "../components/layout/Header";

// 👉 사이트 이슈 타입
interface IssueItem {
  id: number;
  title: string;
  aiTitle: string | null;
  thumbnail: string | null;
  createdAt: string;
  category: string | null;
}

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

  // 🔥 기존 홈 데이터 상태
  const [newsSlides, setNewsSlides] = useState<SlideNews[]>([]);
  const [hotIssues, setHotIssues] = useState<HotIssue[]>([]);
  const [latestIssues, setLatestIssues] = useState<HotIssue[]>([]);

  // 🔥 사이트 이슈 상태
  const [recommendedIssues, setRecommendedIssues] = useState<IssueItem[]>([]);
  const [siteLatestIssues, setSiteLatestIssues] = useState<IssueItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);

  const categories = [
    { id: "all", label: "전체", icon: Globe },
    { id: "World", label: "세계", icon: Globe },
    { id: "Business", label: "경제", icon: Briefcase },
    { id: "Environment", label: "환경", icon: Flame },
  ];

  // -------------------------------------------------------
  // 🔥 1) 홈 데이터 로딩
  // -------------------------------------------------------
  useEffect(() => {
    loadHomeData();
    loadSiteIssues();
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

  // -------------------------------------------------------
  // 🔥 2) 사이트 자체 이슈 로딩
  // -------------------------------------------------------
  const loadSiteIssues = async () => {
    try {
      setLoadingIssues(true);

      const [rec, latest] = await Promise.all([
        fetchRecommendedIssues(),
        fetchLatestIssues(),
      ]);

      setRecommendedIssues(rec.data || []);
      setSiteLatestIssues(latest.data || []);
    } catch (err) {
      console.error("사이트 이슈 불러오기 오류:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  // -------------------------------------------------------
  // 🔥 카테고리 변경 시 핫이슈만 갱신
  // -------------------------------------------------------
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

  const filteredIssues = hotIssues.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.aiTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ---------------- HEADER ---------------- */}
      <Header activeMenu="" />

      {/* ---------------- SLIDER + SIDE ---------------- */}
      <section className="w-full max-w-[1440px] mx-auto px-6 pt-32">
        <div className="flex gap-6">
          <div className="flex-[2]">
            <NewsSlider slides={newsSlides} />
          </div>
          <div className="flex-[1]">
            <LatestNewsSidebar items={latestIssues} />
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORY ---------------- */}
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

      {/* ---------------- SEARCH ---------------- */}
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

      {/* ---------------- HOT ISSUES ---------------- */}
      <section className="w-full px-6 mt-10">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">핫이슈</h2>
          {loading && <p className="text-gray-300">불러오는 중...</p>}
          <LatestNewsList items={filteredIssues} />
        </div>
      </section>

      {/* ---------------- SITE ISSUES ---------------- */}
      <section className="w-full px-6 mt-16 pb-24">
        <div className="max-w-[1440px] mx-auto">

          {/* 추천 이슈 */}
          <h2 className="text-2xl font-bold text-white mb-4">오늘의 추천 이슈</h2>
          {loadingIssues ? (
            <p className="text-gray-300 mb-6">불러오는 중...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {recommendedIssues.map((i) => (
                <div
                  key={i.id}
                  className="p-4 bg-white/10 rounded-xl text-white cursor-pointer hover:bg-white/20 transition"
                  onClick={() => navigate(`/issue/${i.id}`)}
                >
                  <p className="font-bold">{i.aiTitle || i.title}</p>
                  <p className="text-sm text-gray-300 mt-1">{i.category || "카테고리 없음"}</p>
                </div>
              ))}
            </div>
          )}

          {/* 최신 이슈 */}
          <h2 className="text-2xl font-bold text-white mb-4">최신 이슈</h2>
          {loadingIssues ? (
            <p className="text-gray-300">불러오는 중...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {siteLatestIssues.map((i) => (
                <div
                  key={i.id}
                  className="p-4 bg-white/10 rounded-xl text-white cursor-pointer hover:bg-white/20 transition"
                  onClick={() => navigate(`/issue/${i.id}`)}
                >
                  <p className="font-bold">{i.aiTitle || i.title}</p>
                  <p className="text-sm text-gray-300 mt-1">{i.category || "카테고리 없음"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
        <span className="hidden sm:block text-white">{user?.nickname}</span>
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
