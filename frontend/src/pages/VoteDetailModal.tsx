import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { VoteDetailRouteWrapper } from "./VoteDetailPage";

export function VoteDetailModal() {
  const navigate = useNavigate();

  /* =========================
   * ESC 키 닫기 (확정판)
   * ========================= */
  useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      navigate(-1);
    }
  };

  document.addEventListener("keydown", onKeyDown, true);
  return () =>
    document.removeEventListener("keydown", onKeyDown, true);
}, [navigate]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70"
      onClick={() => navigate(-1)}
    >
      {/* 🔥 바깥 여백 확보 */}
      <div className="absolute inset-0 flex justify-center py-10">
        <div
          className="
            relative
            w-full max-w-6xl
            h-full
            max-h-[calc(100vh-5rem)]
            overflow-hidden
            rounded-2xl
            bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* X 버튼 */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 z-50 text-white/70 hover:text-white"
          >
            <X size={28} />
          </button>

          {/* 🔥 실제 스크롤은 여기서 */}
          <div className="h-full overflow-y-auto">
            <VoteDetailRouteWrapper isModal />
          </div>
        </div>
      </div>
    </div>
  );
}
