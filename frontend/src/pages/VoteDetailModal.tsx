import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { VoteDetailRouteWrapper } from "./VoteDetailPage";

export function VoteDetailModal() {
  const navigate = useNavigate();

  /* ESC 키 닫기 */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center"
      onClick={() => navigate(-1)}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl
                   bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-white hover:text-red-400 z-50"
        >
          <X size={28} />
        </button>

        <VoteDetailRouteWrapper />
      </div>
    </div>
  );
}
