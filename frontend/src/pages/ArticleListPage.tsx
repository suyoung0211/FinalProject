// ------------------------------------------------------------
// src/pages/ArticleListPage.tsx (미래 기사 제거 + 5일 제한 완전 적용본)
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
  timeAgo: string; // 예: "3시간 전", "-14023분 전"
  image?: string;
  categories: string[];
}

// ⭐ timeAgo → 실제 Date 객체로 변환
function timeAgoToDate(timeAgo: string): Date {
  const now = new Date();
  if (!timeAgo) return now;

  // 미래값 예외 처리 (예: "-14000분 전")
  if (timeAgo.includes("-")) return new Date("2100-01-01");

  if (timeAgo.includes("분")) {
    const mins = parseInt(timeAgo.replace("분 전", "").trim());
    return new Date(now.getTime() - mins * 60000);
  }

  if (timeAgo.includes("시간")) {
    const hours = parseInt(timeAgo.replace("시간 전", "").trim());
    return new Date(now.getTime() - hours * 3600000);
  }

  if (timeAgo.includes("일")) {
    const days = parseInt(timeAgo.replace("일 전", "").trim());
    return new Date(now.getTime() - days * 86400000);
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

  // 카테고리 가져오기 + 기사 가져오기
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

  // 카테고리 필터 적용
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(allArticles);
      return;
    }
    setFilteredArticles(
      allArticles.filter((a) => a.categories.includes(selectedCategory))
    );
  }, [selectedCategory, allArticles]);

  // ⭐ 미래 기사 제거 + 최근 5일 기사만 + 검색 필터
  const searchedArticles = filteredArticles
    .filter((a) => {
      const now = new Date();
      const publishedDate = timeAgoToDate(a.timeAgo);

      // 미래 기사 제거
      if (publishedDate > now) return false;

      // 최근 5일 이내만 표시
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);

      return publishedDate >= fiveDaysAgo;
    })
    .filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 슬라이더 & 랭킹뉴스 데이터
  const sliderArticles = searchedArticles.filter((a) => !!a.image);
  const rankingArticles = searchedArticles.slice(0, 21);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="article" />

      <div className="container mx-auto px-4 pt-24 pb-10">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {loading && (
          <p className="text-center text-gray-300 py-10">기사 불러오는 중...</p>
        )}

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

              <LiveSlider articles={sliderArticles} />
            </div>

            {/* 오른쪽 랭킹뉴스 */}
            <div className="hidden lg:block w-[320px] shrink-0">
              <RankingNews articles={rankingArticles} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
