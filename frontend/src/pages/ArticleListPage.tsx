import { useState, useEffect, useRef } from "react";
import { TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { fetchArticleList } from "../api/articleApi";
import { useNavigate } from "react-router-dom";

type NewsCategory =
  | "홈"
  | "정치"
  | "경제"
  | "사회"
  | "크립토"
  | "스포츠"
  | "기술"
  | "문화"
  | "국제";

interface Article {
  id: number;
  category: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  image?: string;
  hasVideo?: boolean;
}

export function ArticleListPage() {
  const navigate = useNavigate();

  const categories: NewsCategory[] = [
    "홈",
    "정치",
    "경제",
    "사회",
    "크립토",
    "스포츠",
    "기술",
    "문화",
    "국제",
  ];

  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("홈");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  /** 카테고리 변경 시 데이터 불러오기 */
  useEffect(() => {
    setLoading(true);

    fetchArticleList(selectedCategory)
      .then((data) => {
        setArticles(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  /** 슬라이드 자동 넘김 */
  useEffect(() => {
    if (!articles.length) return;

    const images = articles.filter((a) => a.image);
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);

    slideIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [articles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        기사 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Mak'gora 뉴스</span>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-8 pt-24">

        {/* CATEGORY TABS */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "text-white font-bold border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY */}
        {articles.length === 0 && (
          <div className="text-center text-gray-400 py-10 text-lg">
            해당 카테고리에 뉴스가 없습니다.
          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {articles.map((news) => (
            <div
              key={news.id}
              onClick={() => navigate(`/article/${news.id}`)}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex gap-4 p-4">

                {/* IMAGE */}
                {news.image ? (
                  <div className="w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex-shrink-0" />
                )}

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{news.timeAgo}</span>
                    </div>
                    <span className="text-xs text-gray-500">{news.source}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
