import { ArrowLeft, MessageCircle, Share2, Bookmark, Activity, Trophy, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

import { fetchVoteDetail } from "../api/voteApi";

export function VoteDetailPage({ onBack, marketId }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("chart");
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [showVoteModal, setShowVoteModal] = useState(null);
  const [voteComplete, setVoteComplete] = useState(false);

  useEffect(() => {
    load();
  }, [marketId]);

  async function load() {
    try {
      const res = await fetchVoteDetail(marketId);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-white p-8">로딩중...</div>;
  if (!data) return <div className="text-white p-8">데이터 없음</div>;

  /* ---------------------------------------
      YES / NO Choice Mapping
  ---------------------------------------- */
  const firstOption = data.options[0];
  const yesChoice = firstOption.choices.find(c => c.text === "YES");
  const noChoice = firstOption.choices.find(c => c.text === "NO");

  const yesPercent = yesChoice?.percent ?? 0;
  const noPercent = noChoice?.percent ?? 0;

  /* ---------------------------------------
      Chart Data
  ---------------------------------------- */
  const chartData =
    data.statistics?.changes?.map(ch => ({
      date: new Date(ch.time).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }),
      yes: ch.yesPercent,
      no: ch.noPercent,
    })) ?? [];

  /* ---------------------------------------
      Comments
  ---------------------------------------- */
  const comments = data.comments ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5 mr-2" /> 뒤로
              </Button>

              <div className="h-6 w-px bg-white/20" />

              <span className="text-white font-semibold">Mak'gora</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">

          {/* TOP INFO CARD */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
              <span className="text-sm text-purple-300 font-medium">{data.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{data.title}</h1>

            {data.description && (
              <p className="text-gray-300 leading-relaxed mb-6">{data.description}</p>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm">참여자</div>
                <div className="text-white font-bold text-lg">{data.totalParticipants}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm">총 포인트</div>
                <div className="text-white font-bold text-lg">{data.totalPoints}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm">상태</div>
                <div className="text-white font-bold text-lg">{data.status}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm">마감일</div>
                <div className="text-white font-bold text-sm">
                  {new Date(data.endAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/10">
              {["chart", "discussion"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 px-6 py-4 font-medium ${
                    selectedTab === tab
                      ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "chart" ? "차트" : "토론"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ---------- CHART TAB ---------- */}
              {selectedTab === "chart" && (
                <div>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <XAxis dataKey="date" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />

                        <Area type="monotone" dataKey="yes" stroke="#22c55e" strokeWidth={2} fill="url(#colorYes)" />
                        <Area type="monotone" dataKey="no" stroke="#ef4444" strokeWidth={2} fill="url(#colorNo)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Comments under chart */}
                  <VoteCommentList comments={comments} />
                </div>
              )}

              {/* ---------- DISCUSSION TAB ---------- */}
              {selectedTab === "discussion" && (
                <VoteCommentList comments={comments} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <VoteSidebar
          yesPercent={yesPercent}
          noPercent={noPercent}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
          setShowVoteModal={setShowVoteModal}
        />
      </div>

      {/* Vote Modal + Complete Modal */}
      {showVoteModal && (
        <VoteModal
          mode={showVoteModal}
          amount={selectedAmount}
          yesPercent={yesPercent}
          noPercent={noPercent}
          onClose={() => setShowVoteModal(null)}
          onComplete={() => setVoteComplete(true)}
        />
      )}

      {voteComplete && (
        <VoteCompleteModal amount={selectedAmount} onClose={() => setVoteComplete(false)} />
      )}
    </div>
  );
}

/* ---------------------------------------
   COMPONENTS: 댓글, 사이드바, 모달
---------------------------------------- */

function VoteCommentList({ comments }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" /> 댓글 ({comments.length})
      </h3>

      {comments.map((c) => (
        <div key={c.commentId} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white font-medium mb-1">{c.nickname}</p>
          <p className="text-gray-300">{c.content}</p>
        </div>
      ))}
    </div>
  );
}

function VoteSidebar({ yesPercent, noPercent, selectedAmount, setSelectedAmount, setShowVoteModal }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">
      <h3 className="text-white font-semibold">투표하기</h3>

      {/* YES / NO buttons */}
      <button
        onClick={() => setShowVoteModal("yes")}
        className="w-full bg-green-600/70 text-white rounded-xl p-4"
      >
        YES — {yesPercent}%
      </button>

      <button
        onClick={() => setShowVoteModal("no")}
        className="w-full bg-red-600/70 text-white rounded-xl p-4"
      >
        NO — {noPercent}%
      </button>

      {/* Amount buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[50, 100, 250, 500, 1000].map((amt) => (
          <button
            key={amt}
            onClick={() => setSelectedAmount(amt)}
            className={`p-2 rounded-lg ${
              amt === selectedAmount ? "bg-purple-600 text-white" : "bg-white/10 text-gray-300"
            }`}
          >
            {amt}pt
          </button>
        ))}
      </div>

      <input
        type="number"
        value={selectedAmount}
        onChange={(e) => setSelectedAmount(Number(e.target.value))}
        className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white"
      />
    </div>
  );
}

function VoteModal({ mode, amount, yesPercent, noPercent, onClose, onComplete }) {
  const percent = mode === "yes" ? yesPercent : noPercent;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">
        <h2 className="text-white text-2xl font-bold mb-6">{mode.toUpperCase()} 투표 확인</h2>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-gray-400 text-sm">배팅 포인트</div>
          <div className="text-white text-3xl font-bold">{amount}pt</div>

          <div className="mt-4">
            <div className="flex justify-between text-gray-400">
              <span>현재 확률</span>
              <span className="text-white">{percent}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            취소
          </Button>
          <Button onClick={onComplete} className="flex-1 bg-purple-600 text-white">
            투표 확정
          </Button>
        </div>
      </div>
    </div>
  );
}

function VoteCompleteModal({ amount, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">
        <h2 className="text-white text-2xl font-bold mb-6">투표 완료 🎉</h2>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-gray-400 text-sm">배팅 포인트</div>
          <div className="text-white text-3xl font-bold">{amount}pt</div>
        </div>

        <Button onClick={onClose} className="w-full bg-purple-600 text-white">
          확인
        </Button>
      </div>
    </div>
  );
}