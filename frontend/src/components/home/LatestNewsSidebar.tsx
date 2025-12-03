// src/components/home/LatestNewsSidebar.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HotIssue {
  articleId: number;
  title: string;
  aiTitle: string | null;
  thumbnail: string | null;
  publishedAt: string;
  categories: string[];
}

export default function LatestNewsSidebar({ items }: { items: HotIssue[] }) {
  const [page, setPage] = useState(0);

  const pageSize = 4;
  const maxPage = Math.ceil(items.length / pageSize) - 1;

  const paginated = items.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">최신 뉴스</h3>

        <div className="flex gap-2">
          <button
            className="p-2 bg-white/10 rounded-full hover:bg-white/20"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            className="p-2 bg-white/10 rounded-full hover:bg-white/20"
            disabled={page === maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {paginated.map((n) => (
          <div
            key={n.articleId}
            className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"
          >
            <img
              src={n.thumbnail || "/no_img.png"}
              className="w-20 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-white font-semibold line-clamp-2">
                {n.aiTitle || n.title}
              </p>
              <p className="text-gray-400 text-sm mt-1">{n.publishedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
