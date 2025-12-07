import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { fetchNormalVoteDetail, submitNormalVote } from "../api/normalVoteApi";

export function NormalVoteDetailPage({ onBack, voteId }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [submitComplete, setSubmitComplete] = useState(false);

  useEffect(() => {
    load();
  }, [voteId]);

  async function load() {
    try {
      const res = await fetchNormalVoteDetail(voteId);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onVoteSubmit() {
    if (!selectedChoice) return;

    try {
      await submitNormalVote(voteId, selectedChoice);
      setSubmitComplete(true);
    } catch (err) {
      console.error(err);
      alert("투표 실패");
    }
  }

  if (loading) return <div className="text-white p-8">로딩중…</div>;

  const option = data.options[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> 뒤로
          </Button>
          <span className="text-white font-semibold">Normal Vote</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl text-white font-bold mb-4">{data.title}</h1>

        {data.description && (
          <p className="text-gray-300 mb-6">{data.description}</p>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">선택하기</h2>

          <div className="space-y-3">
            {option.choices.map((ch) => (
              <button
                key={ch.choiceId}
                onClick={() => setSelectedChoice(ch.choiceId)}
                className={`w-full p-4 rounded-xl text-left border ${
                  selectedChoice === ch.choiceId
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-white/5 border-white/10 text-gray-300"
                }`}
              >
                {ch.choiceText} ({ch.participantsCount}명)
              </button>
            ))}
          </div>

          <Button
            onClick={onVoteSubmit}
            className="w-full bg-purple-600 text-white mt-6"
          >
            투표하기
          </Button>
        </div>

        {/* 제출 완료 모달 */}
        {submitComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-xl border border-white/20">
              <h2 className="text-white text-2xl font-bold mb-4">
                투표 완료 🎉
              </h2>
              <Button
                onClick={() => setSubmitComplete(false)}
                className="w-full bg-purple-600"
              >
                확인
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
