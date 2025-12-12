// src/pages/VoteDetailPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";

// API
import { fetchVoteDetailFull, participateVote } from "../api/voteApi";
import {
  fetchNormalVoteDetail,
  participateNormalVote,
} from "../api/normalVoteApi";

import {
  adminResolveVote,
  adminResolveAndSettleVote,
  adminSettleVote,
} from "../api/adminAPI";

// Components
import { VoteTabs } from "../components/voteDetail/VoteTabs";
import { VoteModal } from "../components/voteDetail/VoteModal";
import { VoteCompleteModal } from "../components/voteDetail/VoteCompleteModal";
import { VoteInfoCard } from "../components/voteDetail/VoteInfoCard";
import { UnifiedSidebar } from "../components/voteDetail/UnifiedSidebar";

type VoteType = "AI" | "NORMAL";

/* =====================================================
   Route Wrapper
===================================================== */
export function VoteDetailRouteWrapper() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const location = useLocation();

  const voteType = (location.state?.voteType ?? "AI") as VoteType;

  return (
    <VoteDetailPage
      onBack={() => navigate(-1)}
      marketId={Number(voteId)}
      voteType={voteType}
    />
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */
export function VoteDetailPage({
  onBack,
  marketId,
  voteType,
}: {
  onBack: () => void;
  marketId: number;
  voteType: VoteType;
}) {
  const { user } = useAuth();

  const isAIVote = voteType === "AI";
  const isNormalVote = voteType === "NORMAL";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /* ================= STATE ================= */
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] =
    useState<"chart" | "discussion">("chart");
  const [selectedAmount, setSelectedAmount] = useState(100);

  const [showVoteModal, setShowVoteModal] = useState<number | null>(null);
  const [voteComplete, setVoteComplete] = useState(false);

  // 🔥 관리자 상태
  const [adminAnswers, setAdminAnswers] =
    useState<Record<number, number>>({});
  const [settlementResult, setSettlementResult] =
    useState<any | null>(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
  }, [marketId, voteType]);

  async function load() {
    try {
      setLoading(true);
      const res = isAIVote
        ? await fetchVoteDetailFull(marketId)
        : await fetchNormalVoteDetail(marketId);

      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     🔥 투표 참여 로직 (추가된 부분)
  ===================================================== */

  // ✅ AI 투표 참여
  async function handleParticipateAI(choiceId: number) {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await participateVote(
        data.voteId,
        choiceId,
        selectedAmount
      );

      setShowVoteModal(null);
      setVoteComplete(true);
      load(); // 통계 / 내 참여 갱신
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message ?? "투표 실패");
    }
  }

  // ✅ NORMAL 투표 참여
  async function handleParticipateNormal(choiceId: number) {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await participateNormalVote(marketId, choiceId);
      alert("투표 완료");
      load();
    } catch (err) {
      console.error(err);
      alert("투표 실패");
    }
  }

  /* ================= ADMIN ================= */
  async function handleAdminResolve(alsoSettle: boolean) {
    const answers = Object.entries(adminAnswers).map(
      ([optionId, choiceId]) => ({
        optionId: Number(optionId),
        choiceId: Number(choiceId),
      })
    );

    if (answers.length === 0) {
      alert("옵션별 정답을 선택해주세요.");
      return;
    }

    try {
      if (alsoSettle) {
        const res = await adminResolveAndSettleVote(data.voteId, { answers });
        setSettlementResult(res.data);
      } else {
        await adminResolveVote(data.voteId, { answers });
      }

      alert("처리 완료");
      load();
    } catch (err) {
      console.error(err);
      alert("실패");
    }
  }

  async function handleAdminSettleOnly() {
    try {
      const res = await adminSettleVote(data.voteId);
      setSettlementResult(res.data);
      alert("정산 완료");
      load();
    } catch {
      alert("정산 실패");
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="VoteDetailPage" />

      <div className="container mx-auto px-4 py-8 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {loading || !data ? (
            <div className="text-white p-8">
              {loading ? "로딩중..." : "데이터 없음"}
            </div>
          ) : (
            <>
              <VoteInfoCard
                data={data}
                isAIVote={isAIVote}
                isNormalVote={isNormalVote}
                isAdmin={isAdmin}
                setData={setData}
                handleSaveEdit={() => {}}
                adminAnswers={adminAnswers}
                setAdminAnswers={setAdminAnswers}
                handleAdminResolve={handleAdminResolve}
                handleAdminSettleOnly={handleAdminSettleOnly}
                settlementResult={settlementResult}
              />

              <VoteTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                isAIVote={isAIVote}
                data={data}
                chartData={[]}
                getNormalChoicePercent={() => 0}
              />
            </>
          )}
        </div>

        {/* RIGHT */}
        <UnifiedSidebar
          isAIVote={isAIVote}
          data={data}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
          setShowVoteModal={setShowVoteModal}
          handleParticipateNormal={handleParticipateNormal} // 🔥 연결
        />
      </div>

      {/* 🔥 AI 투표 모달 */}
      {isAIVote && showVoteModal !== null && data && (
        <VoteModal
          choiceId={showVoteModal}
          amount={selectedAmount}
          currentOdds={1}
          expectedOdds={1}
          expectedReward={selectedAmount}
          percent={0}
          onClose={() => setShowVoteModal(null)}
          onConfirm={handleParticipateAI} // 🔥 핵심
        />
      )}

      {isAIVote && voteComplete && (
        <VoteCompleteModal
          amount={selectedAmount}
          onClose={() => setVoteComplete(false)}
        />
      )}
    </div>
  );
}
