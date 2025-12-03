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

export function ArticleListPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  // ⭐ 검색어
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

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

  // ⭐ 카테고리 필터
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(allArticles);
      return;
    }
    setFilteredArticles(
      allArticles.filter((a) => a.categories.includes(selectedCategory))
    );
  }, [selectedCategory, allArticles]);

  // ⭐ 검색 적용 (NewsList 전용)
  const searchedArticles = filteredArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ⭐ 슬라이드 / 랭킹은 검색 비적용!
  const sliderArticles = filteredArticles.filter((a) => !!a.image);
  const rankingArticles = filteredArticles.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="article" />

      <div className="container mx-auto px-4 pt-24 pb-10">

        {/* 카테고리 + 검색 */}
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

        {!loading && searchedArticles.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            검색 결과가 없습니다.
          </p>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-14 items-start">
  {/* 왼쪽 뉴스리스트 — 최소 높이 보장 */}
  <div className="min-h-[600px]">
    <NewsList
      articles={searchedArticles.slice(0, visibleCount)}
      visibleCount={visibleCount}
      setVisibleCount={setVisibleCount}
      totalCount={searchedArticles.length}
    />
  </div>

  {/* 오른쪽 랭킹뉴스 — 고정 유지 */}
  <RankingNews articles={rankingArticles} />
</div>
            <LiveSlider articles={sliderArticles} />
          </>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
