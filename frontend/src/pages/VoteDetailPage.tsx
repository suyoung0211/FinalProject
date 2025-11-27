import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVoteDetail } from "../api/voteApi";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

interface VoteDetail {
  id: number;
  question: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  participants: number;
  endDate: string;
}

export function VoteDetailPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();

  const [detail, setDetail] = useState<VoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [showVoteModal, setShowVoteModal] = useState<"YES" | "NO" | null>(null);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const data = await fetchVoteDetail(voteId);

      const mapped: VoteDetail = {
        id: data.voteId,
        question: data.title,
        description: data.description || "",
        category: data.category || "기타",
        yesPrice: data.options?.[0]?.percent ?? 0,
        noPrice: data.options?.[1]?.percent ?? 0,
        volume: data.totalPoints ?? 0,
        participants: data.totalParticipants ?? 0,
        endDate: data.endAt?.split("T")[0],
      };

      setDetail(mapped);
    } catch (err) {
      console.error("투표 상세 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white p-10">로딩중…</div>;
  if (!detail) return <div className="text-white p-10">데이터 없음</div>;

  const market = detail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate(-1)} variant="ghost" className="text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-white font-bold mb-6">
          {market.question}
        </h1>

        <p className="text-gray-300 mb-4">{market.description}</p>

        {/* YES / NO 선택 */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => setShowVoteModal("YES")}
            className="bg-green-600/40 p-6 rounded-xl text-white"
          >
            YES: {market.yesPrice}%
          </button>

          <button
            onClick={() => setShowVoteModal("NO")}
            className="bg-red-600/40 p-6 rounded-xl text-white"
          >
            NO: {market.noPrice}%
          </button>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl border border-white/20">
            <h2 className="text-white text-xl mb-4">
              {showVoteModal} 투표 확인
            </h2>

            <Button onClick={() => setShowVoteModal(null)} className="bg-purple-600">
              닫기
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
