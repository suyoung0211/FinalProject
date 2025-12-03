// ------------------------------------------------------------
// src/pages/ArticleListPage.tsx (사이드바 화면 우측 고정 버전)
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

export function ArticleListPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

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

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(allArticles);
      return;
    }
    setFilteredArticles(
      allArticles.filter((a) => a.categories.includes(selectedCategory))
    );
  }, [selectedCategory, allArticles]);

  const searchedArticles = filteredArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sliderArticles = filteredArticles.filter((a) => !!a.image);
  const rankingArticles = filteredArticles.slice(0, 20);

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

            {/* 왼쪽 뉴스리스트 */}
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

            {/* 오른쪽 사이드바 */}
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
