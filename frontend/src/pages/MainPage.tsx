import {
  TrendingUp,
  Search,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { fetchHomeData } from "../api/homeApi";
import { fetchCategories } from "../api/categoryApi";

import { useArticleModal } from "../context/ArticleModalContext";

import NewsSlider from "../components/home/NewsSlider";
import LatestNewsSidebar from "../components/home/LatestNewsSidebar";
import LatestNewsList from "../components/home/LatestNewsList";
import { VoteCard } from "../components/home/VoteCard";

import { Header } from "../components/layout/Header";

// 타입
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
  const { openModal } = useArticleModal();

  const [newsSlides, setNewsSlides] = useState<SlideNews[]>([]);
  const [hotIssues, setHotIssues] = useState<HotIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<HotIssue[]>([]);
  const [latestIssues, setLatestIssues] = useState<HotIssue[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [votes, setVotes] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 무한스크롤
  const [visibleVotes, setVisibleVotes] = useState(20);

  // 초기 Load
  useEffect(() => {
    loadHomeData();
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
      setFilteredIssues(res.data.hotIssues || []);
      setLatestIssues(res.data.latestIssues || []);

      setVotes(res.data.voteList || []);
    } catch (err) {
      console.error("홈 데이터 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Top 3 투표
  const topVotes = [...votes]
    .sort((a, b) => b.totalParticipants - a.totalParticipants)
    .slice(0, 3);

  // 투표 검색 필터
  const filteredVotes = votes.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 무한 스크롤 적용 투표 리스트
  const displayedVotes = filteredVotes.slice(0, visibleVotes);

  // 무한 스크롤 이벤트
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        setVisibleVotes((prev) => prev + 20);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 카테고리 필터링
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredIssues(hotIssues);
    } else {
      const filtered = hotIssues.filter((a) =>
        a.categories?.includes(selectedCategory)
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="" />

      {/* SLIDER + 우측 뉴스 */}
      <section className="w-full px-6 pt-[150px]">
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

      {/* CATEGORY */}
      <section className="w-full px-6 mt-8">
        <div className="max-w-[1440px] mx-auto flex gap-3 justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full transition ${
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

      {/* SEARCH */}
      <section className="w-full px-6 pt-5">
        <div className="max-w-[700px] mx-auto relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <Input
            className="bg-white/10 border-white/20 text-white pl-12 h-12"
            placeholder="이슈 / 투표 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* TOP 3 VOTES */}
      <section className="w-full px-6 mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">🔥 인기 투표 Top 3</h2>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {topVotes.map((v) => (
            <VoteCard key={v.voteId} vote={v} />
          ))}
        </div>
      </section>

      {/* MAIN CONTENT — 핫이슈 & 투표 */}
      <section className="w-full px-6 mt-14">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT - NEWs LIST */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">📰 핫이슈</h2>
            <LatestNewsList items={filteredIssues} />
          </div>

          {/* RIGHT - VOTE LIST */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">🗳 전체 투표</h2>

            {/* Vote List */}
            <div className="flex flex-col gap-4">
              {displayedVotes.map((v) => (
                <VoteCard key={v.voteId} vote={v} />
              ))}
            </div>

            {visibleVotes < filteredVotes.length && (
              <p className="text-gray-400 text-center mt-4">스크롤하여 더 보기...</p>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
