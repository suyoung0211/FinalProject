// ------------------------------------------------------------
// src/pages/ArticleListPage.tsx
// ------------------------------------------------------------
import { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { fetchArticleListAll } from "../api/articleApi";
import { fetchCategories } from "../api/categoryApi";
import { useNavigate } from "react-router-dom";

// ⭐ 분리된 컴포넌트
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
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // 1) 카테고리 + 전체 기사 불러오기
  // ----------------------------
  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(["all", ...res.data]);
    } catch (err) {
      console.error("카테고리 로드 실패", err);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);

      const data = await fetchArticleListAll();

      // ⭐ 카테고리 배열 보정 (필수)
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
    } catch (err) {
      console.error("기사 로드 실패", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 2) 카테고리 필터링
  // ----------------------------
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(allArticles);
      return;
    }
    setFilteredArticles(
      allArticles.filter((a) => a.categories.includes(selectedCategory))
    );
  }, [selectedCategory, allArticles]);

  // ----------------------------
  // 3) 데이터 분리
  // ----------------------------
  const mainArticle = filteredArticles[0];
  const sideArticles = filteredArticles.slice(1, 3);
  const listArticles = filteredArticles.slice(3);
  const rankingArticles = filteredArticles.slice(0, 5);
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

        {/* 로딩 */}
        {loading && (
          <p className="text-center text-gray-300 py-10">기사 불러오는 중...</p>
        )}

        {/* 빈 리스트 */}
        {!loading && filteredArticles.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            해당 카테고리에 뉴스가 없습니다.
          </p>
        )}

        {/* 콘텐츠 */}
        {!loading && filteredArticles.length > 0 && (
          <>
            {/* 리스트 + 랭킹 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
              <NewsList articles={listArticles} />
              <RankingNews articles={rankingArticles} />
            </div>

            {/* 라이브 슬라이더 */}
            <LiveSlider articles={sliderArticles} />

          </>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
