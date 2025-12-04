// ------------------------------------------------------------
// src/pages/ArticleListPage.tsx (뉴스리스트만 검색 적용 + 슬라이더 독립 + 정렬 수정)
// ------------------------------------------------------------
import { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { fetchArticleListAll } from "../api/articleApi";
import { fetchCategories } from "../api/categoryApi";

import CategoryFilter from "../components/articles/CategoryFilter";
import NewsList from "../components/articles/NewsList";
import RankingNews from "../components/articles/RankingNews";
import LiveSlider from "../components/articles/LiveSlider";

export interface Article {
  id: number;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  image?: string;
  categories: string[];
}

// ⭐ timeAgo → Date 변환
function timeAgoToDate(timeAgo: string): Date {
  const now = new Date();
  if (!timeAgo) return now;

  if (timeAgo.includes("-")) return new Date("2100-01-01");

  if (timeAgo.includes("분")) {
    return new Date(now.getTime() - parseInt(timeAgo) * 60000);
  }
  if (timeAgo.includes("시간")) {
    return new Date(now.getTime() - parseInt(timeAgo) * 3600000);
  }
  if (timeAgo.includes("일")) {
    return new Date(now.getTime() - parseInt(timeAgo) * 86400000);
  }
  return now;
}

export function ArticleListPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // ------------------------------------------------------
  // 1) 카테고리 + 기사 로딩
  // ------------------------------------------------------
  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(["all", ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticleListAll();

      const normalized = data.map((a: any) => ({
        ...a,
        categories: Array.isArray(a.categories)
          ? a.categories
          : a.category
          ? [a.category]
          : ["기타"],
      }));

      setAllArticles(normalized);
      setFilteredArticles(normalized);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // 2) 카테고리 필터
  // ------------------------------------------------------
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(allArticles);
      return;
    }
    setFilteredArticles(
      allArticles.filter((a) => a.categories.includes(selectedCategory))
    );
  }, [selectedCategory, allArticles]);

  // ------------------------------------------------------
  // 3) 뉴스 리스트용 검색 + 5일 제한 필터 (뉴스 리스트 ONLY)
  // ------------------------------------------------------
  const searchedArticles = filteredArticles
    .filter((a) => {
      const now = new Date();
      const publishedDate = timeAgoToDate(a.timeAgo);

      if (publishedDate > now) return false;

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);

      return publishedDate >= fiveDaysAgo;
    })
    .filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ------------------------------------------------------
  // 4) 슬라이더 데이터: 🔥검색 영향 안받게 원본 기준
  // ------------------------------------------------------
  const sliderArticles = filteredArticles.filter((a) => !!a.image);

  // ------------------------------------------------------
  // 5) 랭킹 뉴스: 검색 영향 ❌ / 원본(allArticles) 기준
  // ------------------------------------------------------
  const rankingArticles = allArticles.filter((a) => !!a.image).slice(0, 35);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="article" />

      <div className="container mx-auto px-4 pt-24 pb-10">

        {/* ⭐ 카테고리 + 검색 한 줄에 정렬 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 overflow-x-auto pr-4">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* 검색창 */}
          <div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어 입력"
              className="px-4 py-2 w-48 rounded-full bg-white/10 text-white border border-white/20
                       focus:outline-none focus:border-purple-400 transition"
            />
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <p className="text-center text-gray-300 py-10">기사 불러오는 중...</p>
        )}

        {/* 렌더링 */}
        {!loading && (
          <div className="flex gap-8 mt-6 items-start">

            {/* 왼쪽 뉴스 리스트 */}
            <div className="flex-1 min-w-0">
              {searchedArticles.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                  검색 결과가 없습니다.
                </p>
              ) : (
                <NewsList
                  articles={searchedArticles.slice(0, visibleCount)}
                  visibleCount={visibleCount}
                  setVisibleCount={setVisibleCount}
                  totalCount={searchedArticles.length}
                />
              )}

              {/* ⭐ 뉴스 리스트 아래 슬라이더 — 검색 영향 ❌ */}
              <LiveSlider articles={sliderArticles} />
            </div>

            {/* 오른쪽 랭킹뉴스 */}
            <div className="hidden lg:block w-[320px] max-w-full shrink-0">
              <RankingNews articles={rankingArticles} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
