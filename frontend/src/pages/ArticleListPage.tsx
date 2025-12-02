// ------------------------------------------------------------
// src/pages/ArticleListPage.tsx
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
  const [loading, setLoading] = useState(false);

  // ⭐ NewsList에서 10개씩 로딩
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

  const sliderArticles = filteredArticles.filter((a) => !!a.image);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="article" />

      <div className="container mx-auto px-4 pt-24 pb-10">

        {/* 카테고리 필터 */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {loading && (
          <p className="text-center text-gray-300 py-10">
            기사 불러오는 중...
          </p>
        )}

        {!loading && filteredArticles.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            해당 카테고리에 뉴스가 없습니다.
          </p>
        )}

        {!loading && filteredArticles.length > 0 && (
          <>
            {/* ⭐ NewsList + RankingNews */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
              <NewsList
                articles={filteredArticles.slice(0, visibleCount)}
                visibleCount={visibleCount}
                setVisibleCount={setVisibleCount}
                totalCount={filteredArticles.length}
              />

              <RankingNews
                articles={filteredArticles.slice(0, 20)} // ⭐ 20개
              />
            </div>

            {/* 라이브 슬라이더 (NewsList 기준 정렬됨) */}
            <LiveSlider articles={sliderArticles} />
          </>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
