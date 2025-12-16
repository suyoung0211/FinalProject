// src/pages/VoteDetailPage.tsx
import {
  ArrowLeft,
  TrendingUp,
  MessageCircle,
  Share2,
  Bookmark,
  Activity,
  Trophy,
  BarChart3,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

import {
  fetchVoteDetail,
  participateVote,
} from "../api/voteApi";

import {
  fetchNormalVoteDetail,
  participateNormalVote,
} from "../api/normalVoteApi";

type VoteType = "AI" | "NORMAL";

/* ------------------------------------------------------
 📌 라우트 래퍼 – /vote/:voteId + state.voteType
------------------------------------------------------ */
export function VoteDetailRouteWrapper() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const location = useLocation();

  const voteType = (location.state?.voteType ?? "AI") as VoteType;

  return (
    <VoteDetailPage
      onBack={() => navigate(-1)}
      voteId={Number(voteId)}
      voteType={voteType}
    />
  );
}

/* ------------------------------------------------------
 📌 메인 VoteDetailPage (피그마 레이아웃 + 실제 API)
------------------------------------------------------ */
interface VoteDetailPageProps {
  onBack: () => void;
  voteId: number;
  voteType: VoteType;
}

export function VoteDetailPage({ onBack, voteId, voteType }: VoteDetailPageProps) {
  const { user } = useAuth();

  // ====== 공통 상태 (훅 순서 절대 안 바꿈) ======
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [selectedTab, setSelectedTab] = useState<
    "chart" | "discussion" | "info" | "activity"
  >("chart");
  const [showVoteModal, setShowVoteModal] = useState<null | "YES" | "NO">(null);
  const [voteComplete, setVoteComplete] = useState(false);

  const isAIVote = voteType === "AI";
  const isNormalVote = voteType === "NORMAL";

  const fixedAmounts = [50, 100, 250, 500, 1000];

  /* ------------------------------------------------------
   📌 데이터 로드
  ------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setData(null);

        const res = isAIVote
          ? await fetchVoteDetail(voteId)
          : await fetchNormalVoteDetail(voteId);

        if (!cancelled) {
          setData(res.data);
        }
      } catch (e) {
        console.error("❌ VoteDetail load error:", e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [voteId, isAIVote]);

  /* ------------------------------------------------------
   📌 데이터에서 공통 필드 추출
  ------------------------------------------------------ */
  const question = data?.title ?? data?.question ?? "제목 없음";
  const description = data?.description ?? "";
  const category = data?.category ?? (isAIVote ? "AI 이슈" : "일반 이슈");

  const participants =
    data?.totalParticipants ?? data?.participants ?? data?.participantCount ?? 0;

  const endDate =
    data?.endAt?.substring(0, 10) ??
    data?.endDate ??
    data?.end_at ??
    "미정";

  const volumeText =
    data?.volumeText ??
    (isAIVote ? `${participants.toLocaleString()} 참여` : `${participants} 참여`);

  const liquidityText = data?.liquidityText ?? "—";

  /* ------------------------------------------------------
   📌 YES/NO 퍼센트 (첫 번째 옵션 기반)
  ------------------------------------------------------ */
  const { yesPercent, noPercent } = useMemo(() => {
    const opt = data?.options?.[0];
    if (!opt?.choices) return { yesPercent: 50, noPercent: 50 };

    // 우선 percent / probability 읽고, 없으면 participantsCount 기반
    const yes = opt.choices.find((c: any) => c.text === "YES");
    const no = opt.choices.find((c: any) => c.text === "NO");

    if (yes?.percent != null && no?.percent != null) {
      return { yesPercent: yes.percent, noPercent: no.percent };
    }

    const yesCount = yes?.participantsCount ?? 0;
    const noCount = no?.participantsCount ?? 0;
    const sum = yesCount + noCount;

    if (!sum) return { yesPercent: 50, noPercent: 50 };

    const yp = Math.round((yesCount / sum) * 100);
    const np = 100 - yp;

    return { yesPercent: yp, noPercent: np };
  }, [data]);

  /* ------------------------------------------------------
   📌 차트 데이터 (AI 투표만)
  ------------------------------------------------------ */
  const chartData = useMemo(() => {
    if (!isAIVote || !data?.statistics?.changes) return [];

    return data.statistics.changes.map((ch: any) => ({
      date: new Date(ch.time).toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }),
      yes: ch.yesPercent,
      no: ch.noPercent,
    }));
  }, [isAIVote, data]);

  /* ------------------------------------------------------
   📌 댓글 / 활동 / 상위투표자 – 일단 목데이터 유지
   (원하면 나중에 vote 댓글 API 붙일 수 있음)
  ------------------------------------------------------ */
  const comments = [
    {
      id: "1",
      user: "investor_kim",
      avatar: "👨‍💼",
      text: "이 이슈에 대한 생각은 어떤가요? 저는 YES 쪽으로 기웁니다.",
      likes: 10,
      time: "2시간 전",
      position: "YES",
    },
    {
      id: "2",
      user: "market_analyst",
      avatar: "📊",
      text: "데이터를 보면 아직 확신하긴 이릅니다.",
      likes: 5,
      time: "5시간 전",
      position: "NO",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      user: "whale_trader",
      action: "YES",
      amount: 5000,
      time: "방금 전",
      avatar: "🐋",
    },
    {
      id: "2",
      user: "bear_market",
      action: "NO",
      amount: 1800,
      time: "12분 전",
      avatar: "🐻",
    },
  ];

  const topTraders = [
    {
      id: "1",
      user: "whale_investor",
      avatar: "🐋",
      position: "YES",
      amount: 25000,
      profit: "+12,500",
    },
    {
      id: "2",
      user: "market_maker",
      avatar: "💼",
      position: "NO",
      amount: 15200,
      profit: "+4,560",
    },
  ];

  const relatedMarkets = [
    {
      id: 1,
      question: "관련 이슈 예시 1",
      yesPrice: 60,
      volume: "1.2K 참여",
    },
    {
      id: 2,
      question: "관련 이슈 예시 2",
      yesPrice: 35,
      volume: "890 참여",
    },
  ];

  /* ------------------------------------------------------
   📌 실투표 처리 (AI / NORMAL 공통)
  ------------------------------------------------------ */
  async function handleConfirmVote() {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!data || !showVoteModal) return;

    // voteId 값 대응 (백엔드에서 어떤 필드 쓰는지에 따라)
    const voteIdentifier = data.voteId ?? data.id ?? voteId;

    try {
      // 첫 번째 옵션에서 YES/NO 선택
      const opt = data.options?.[0];
      if (!opt?.choices) {
        alert("옵션 정보가 없습니다.");
        return;
      }

      const yes = opt.choices.find((c: any) => c.text === "YES");
      const no = opt.choices.find((c: any) => c.text === "NO");

      const targetChoice =
        showVoteModal === "YES" ? yes : no;

      if (!targetChoice) {
        alert("선택 가능한 옵션이 없습니다.");
        return;
      }

      const choiceId = targetChoice.choiceId ?? targetChoice.id;

      if (isAIVote) {
        // AI 투표는 금액 포함
        await participateVote(voteIdentifier, choiceId, selectedAmount);
      } else {
        // 일반 투표는 금액 없이 참여
        await participateNormalVote(voteIdentifier, choiceId);
      }

      setShowVoteModal(null);
      setVoteComplete(true);

      // 투표 후 데이터 새로고침
      try {
        const res = isAIVote
          ? await fetchVoteDetail(voteIdentifier)
          : await fetchNormalVoteDetail(voteIdentifier);
        setData(res.data);
      } catch (e) {
        console.error("❌ reload after vote error:", e);
      }
    } catch (e) {
      console.error("❌ participate error:", e);
      alert("투표에 실패했습니다.");
    }
  }

  /* ------------------------------------------------------
   📌 로딩 / 에러 / 본문 렌더링
  ------------------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        로딩 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white">
        <p className="mb-4">데이터를 불러오지 못했습니다.</p>
        <Button onClick={onBack} className="bg-purple-600">
          뒤로가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                뒤로
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Mak&apos; gora</span>
              </div>
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

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Info */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
                    <span className="text-sm text-purple-300 font-medium">
                      {category}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                    {question}
                  </h1>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">거래/참여</div>
                  <div className="text-white font-bold text-lg">
                    {volumeText}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">유동성</div>
                  <div className="text-white font-bold text-lg">
                    {liquidityText}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">참여자</div>
                  <div className="text-white font-bold text-lg">
                    {participants.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">마감일</div>
                  <div className="text-white font-bold text-sm">{endDate}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setSelectedTab("chart")}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === "chart"
                      ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  차트
                </button>
                <button
                  onClick={() => setSelectedTab("discussion")}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === "discussion"
                      ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  토론
                </button>
                <button
                  onClick={() => setSelectedTab("info")}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === "info"
                      ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  정보
                </button>
                <button
                  onClick={() => setSelectedTab("activity")}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === "activity"
                      ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  활동
                </button>
              </div>

              <div className="p-6">
                {/* TAB: CHART */}
                {selectedTab === "chart" && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">확률 추이</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-400">YES</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm text-gray-400">NO</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="colorYes"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#22c55e"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#22c55e"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <linearGradient
                                id="colorNo"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#ef4444"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="yes"
                              stroke="#22c55e"
                              strokeWidth={2}
                              fill="url(#colorYes)"
                            />
                            <Area
                              type="monotone"
                              dataKey="no"
                              stroke="#ef4444"
                              strokeWidth={2}
                              fill="url(#colorNo)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Comments Section under Chart */}
                    <div className="mt-8 space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        댓글 ({comments.length})
                      </h3>
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{comment.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium">
                                  {comment.user}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    comment.position === "YES"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {comment.position}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-gray-300 mb-3">
                                {comment.text}
                              </p>
                              <button className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                                👍 {comment.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: DISCUSSION */}
                {selectedTab === "discussion" && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{comment.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-medium">
                                {comment.user}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  comment.position === "YES"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {comment.position}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {comment.time}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-3">
                              {comment.text}
                            </p>
                            <button className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                              👍 {comment.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB: INFO */}
                {selectedTab === "info" && (
                  <div className="space-y-4 text-sm text-white">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-2">이슈 타입</div>
                      <div>{isAIVote ? "AI 생성 투표" : "사용자 생성 투표"}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-2">규칙</div>
                      <ul className="space-y-2">
                        <li>• 마감 전까지는 언제든 참여 가능</li>
                        <li>• 정답 기준은 관리자/시스템에 의해 확정</li>
                        <li>• 결과는 투표 종료 후 정산됩니다.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB: ACTIVITY */}
                {selectedTab === "activity" && (
                  <div className="space-y-6">
                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        최근 거래 활동
                      </h3>
                      <div className="space-y-2">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{activity.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">
                                    {activity.user}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      activity.action === "YES"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {activity.action}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">
                                    {activity.amount.toLocaleString()}pt 투표
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {activity.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Traders */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        상위 투표자
                      </h3>
                      <div className="space-y-2">
                        {topTraders.map((trader, index) => (
                          <div
                            key={trader.id}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="text-2xl">{trader.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">
                                    {trader.user}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      trader.position === "YES"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {trader.position}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">
                                    {trader.amount.toLocaleString()}pt
                                  </span>
                                  <span className="text-sm text-green-400 font-medium">
                                    {trader.profit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Statistics */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        시장 통계
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">
                            24h 거래/참여
                          </div>
                          <div className="text-white font-bold text-lg">
                            —{/* 원하면 나중에 백엔드 값 매핑 */}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">
                            24h 참여자
                          </div>
                          <div className="text-white font-bold text-lg">
                            —{/* 나중에 확장 */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Vote Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vote Card */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4">투표하기</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowVoteModal("YES")}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-green-500/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium mb-1">YES</div>
                      <div className="text-2xl font-bold">{yesPercent}%</div>
                    </div>
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      ✅
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowVoteModal("NO")}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-red-500/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium mb-1">NO</div>
                      <div className="text-2xl font-bold">{noPercent}%</div>
                    </div>
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      ❌
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-gray-400 text-sm">배팅 포인트</label>
                <div className="grid grid-cols-3 gap-2">
                  {fixedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedAmount === amount
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {amount}pt
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) =>
                    setSelectedAmount(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="직접 입력"
                />
              </div>

              <div className="bg-white/5 rounded-lg p-3 mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>예상 수익률</span>
                  <span className="text-green-400 font-medium">
                    +{(selectedAmount * 0.48).toFixed(0)}pt
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>수수료 (예시)</span>
                  <span>{(selectedAmount * 0.02).toFixed(0)}pt</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                투표는 마감 전까지 참여 가능하며, 결과에 따라 정산됩니다.
              </div>
            </div>

            {/* Related Markets */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">관련 이슈</h3>
              <div className="space-y-3">
                {relatedMarkets.map((rm) => (
                  <button
                    key={rm.id}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="text-white text-sm mb-2 line-clamp-2">
                      {rm.question}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">
                        {rm.yesPrice}%
                      </span>
                      <span className="text-gray-400 text-xs">
                        {rm.volume}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              {showVoteModal === "YES" ? "YES" : "NO"} 투표 확인
            </h2>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="text-gray-400 text-sm mb-2">배팅 포인트</div>
              <div className="text-white text-3xl font-bold mb-4">
                {selectedAmount}pt
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">현재 확률</span>
                  <span className="text-white font-medium">
                    {showVoteModal === "YES" ? yesPercent : noPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">예상 수익</span>
                  <span className="text-green-400 font-medium">
                    +{(selectedAmount * 0.48).toFixed(0)}pt
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowVoteModal(null)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmVote}
                className={`flex-1 ${
                  showVoteModal === "YES"
                    ? "bg-gradient-to-r from-green-600 to-green-500"
                    : "bg-gradient-to-r from-red-600 to-red-500"
                }`}
              >
                투표 확정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vote Complete Modal */}
      {voteComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              투표가 완료되었습니다! 🎉
            </h2>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="text-gray-400 text-sm mb-2">배팅 포인트</div>
              <div className="text-white text-3xl font-bold mb-4">
                {selectedAmount}pt
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">예상 수익</span>
                  <span className="text-green-400 font-medium">
                    +{(selectedAmount * 0.48).toFixed(0)}pt
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setVoteComplete(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
