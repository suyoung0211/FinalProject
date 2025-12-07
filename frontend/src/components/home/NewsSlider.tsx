// src/components/home/NewsSlider.tsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useArticleModal } from "../../context/ArticleModalContext";

export interface SlideNews {
  articleId: number;
  aiTitle: string | null;
  thumbnail: string | null;
  publishedAt: string;
}

interface Props {
  slides: SlideNews[];
}

export default function NewsSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const { openModal } = useArticleModal();

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [index, slides]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[380px] bg-white/10 rounded-2xl flex items-center justify-center text-gray-300">
        로딩 중...
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="relative w-full h-[380px] md:h-[525px] rounded-2xl overflow-hidden">
      {/* 이미지 */}
      <img
        onClick={() => openModal(current.articleId)}     // ← 추가!
        src={current.thumbnail || "/no_img.png"}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* 왼쪽 버튼 */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 오른쪽 버튼 */}
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 텍스트 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <h2 className="text-xl md:text-3xl font-bold text-white">
          {current.aiTitle || "제목 없음"}
        </h2>
        <p className="text-gray-300 text-sm mt-1">{current.publishedAt}</p>
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i: number) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
