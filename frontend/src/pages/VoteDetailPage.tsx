// src/pages/VoteDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";

import {
  fetchVoteDetail,
  participateVote,
  fetchExpectedOdds,
  fetchVoteOdds,
  fetchVoteTrendChart,
} from "../api/voteApi";
import {
  fetchNormalVoteDetail,
  participateNormalVote,
} from "../api/normalVoteApi";

import {
  adminResolveVote,
  adminResolveAndSettleVote,
  adminSettleVote,
} from "../api/adminAPI";

import { VoteTabs } from "../components/voteDetail/VoteTabs";
import { VoteModal } from "../components/voteDetail/VoteModal";
import { VoteCompleteModal } from "../components/voteDetail/VoteCompleteModal";
import { VoteInfoCard } from "../components/voteDetail/VoteInfoCard";
import { UnifiedSidebar } from "../components/voteDetail/UnifiedSidebar";

type VoteType = "AI" | "NORMAL";

/* ================= ROUTE ================= */
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

/* ================= PAGE ================= */
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

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendChart, setTrendChart] = useState<any[]>([]);

  const [selectedTab, setSelectedTab] =
    useState<"chart" | "discussion">("chart");
  const [selectedAmount, setSelectedAmount] = useState(100);

  const [showVoteModal, setShowVoteModal] = useState<number | null>(null);
  const [voteComplete, setVoteComplete] = useState(false);
  const [modalMeta, setModalMeta] = useState<any>(null);

  const [adminAnswers, setAdminAnswers] =
    useState<Record<number, number>>({});
  const [settlementResult, setSettlementResult] =
    useState<any | null>(null);

  useEffect(() => {
    load();
  }, [marketId, voteType]);

  async function load() {
  try {
    setLoading(true);

    if (isAIVote) {
      const [detailRes, oddsRes, trendRes] = await Promise.all([
        fetchVoteDetail(marketId),
        fetchVoteOdds(marketId), // 🔥 추가
        fetchVoteTrendChart(marketId),
      ]);
      console.log("📊 chartData", trendRes.data);
      setData({
        ...detailRes.data,
        odds: oddsRes.data, // 🔥 핵심
      });
      setTrendChart(trendRes.data.options); // 🔥 차트 데이터 저장
    } else {
      const res = await fetchNormalVoteDetail(marketId);
      setData(res.data);
    }
  } finally {
    setLoading(false);
  }
}

function buildResolvePayload() {
  return {
    answers: Object.entries(adminAnswers).map(
      ([optionId, choiceId]) => ({
        optionId: Number(optionId),
        choiceId: Number(choiceId),
      })
    ),
  };
}

async function handleAdminResolve(withSettle: boolean) {
  if (!data) return;

  const payload = buildResolvePayload();

  if (payload.answers.length === 0) {
    alert("정답을 하나 이상 선택해야 합니다.");
    return;
  }

  try {
    if (withSettle) {
      // 🔥 종료 + 정산
      const res = await adminResolveAndSettleVote(
        data.voteId,
        payload
      );
      setSettlementResult(res.data);
    } else {
      // 🔥 종료만
      await adminResolveVote(data.voteId, payload);
    }

    await load(); // 상태/데이터 갱신
  } catch (e) {
    console.error(e);
    alert("관리자 처리 실패");
  }
}

async function handleAdminSettleOnly() {
  if (!data) return;

  try {
    const res = await adminSettleVote(data.voteId);
    setSettlementResult(res.data);
    await load();
  } catch (e) {
    console.error(e);
    alert("정산 실패");
  }
}

  /* ================= MODAL ================= */
  async function openVoteModal(choiceId: number) {
    if (!data || !isAIVote) return;

    let percent = 0;
    let currentOdds: number | null = null;

    for (const opt of data.options ?? []) {
      const ch = opt.choices?.find(
        (c: any) => (c.choiceId ?? c.id) === choiceId
      );
      if (ch) {
        percent = ch.percent ?? 0;

        // ✅ optionId → odds
        currentOdds = ch.odds ?? null; // ✅ 핵심
        break;
      }
    }

    setShowVoteModal(choiceId);
    setModalMeta({
      percent,
      currentOdds,
      expectedOdds: null,
      expectedReward: null,
    });

    const res = await fetchExpectedOdds(
      data.voteId,
      choiceId,
      selectedAmount
    );

    setModalMeta((prev: any) => ({
      ...prev,
      expectedOdds: res.data.expectedOdds,
      expectedReward: res.data.expectedReward,
    }));
  }

  async function handleParticipateAI(choiceId: number) {
    if (!user) return alert("로그인이 필요합니다.");
    await participateVote(data.voteId, choiceId, selectedAmount);
    setShowVoteModal(null);
    setVoteComplete(true);
    load();
  }

  async function handleParticipateNormal(choiceId: number) {
    if (!user) return alert("로그인이 필요합니다.");
    await participateNormalVote(marketId, choiceId);
    load();
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="VoteDetailPage" />

      <div className="container mx-auto px-4 py-8 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {loading || !data ? (
            <div className="text-white p-8">로딩중...</div>
          ) : (
            <>
              <VoteInfoCard
              data={data}
              isAIVote={isAIVote}
              isNormalVote={isNormalVote}
              isAdmin={isAdmin}
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
                chartData={trendChart} // 🔥 진짜 데이터  
                getNormalChoicePercent={() => 0}
              />
            </>
          )}
        </div>

        <UnifiedSidebar
          isAIVote={isAIVote}
          data={data}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
          openVoteModal={openVoteModal}
          handleParticipateNormal={handleParticipateNormal}
        />
      </div>

      {isAIVote && showVoteModal !== null && modalMeta && (
        <VoteModal
          choiceId={showVoteModal}
          amount={selectedAmount}
          currentOdds={modalMeta.currentOdds}
          expectedOdds={modalMeta.expectedOdds}
          expectedReward={modalMeta.expectedReward}
          percent={modalMeta.percent}
          onClose={() => setShowVoteModal(null)}
          onConfirm={handleParticipateAI}
        />
      )}

      {voteComplete && (
        <VoteCompleteModal
          amount={selectedAmount}
          onClose={() => setVoteComplete(false)}
        />
      )}
    </div>
  );
}
