// src/pages/VoteDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";

import {
  fetchVoteDetail,
  participateVote,
  fetchExpectedOdds,
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
      const res = isAIVote
        ? await fetchVoteDetail(marketId)
        : await fetchNormalVoteDetail(marketId);
      setData(res.data);
    } finally {
      setLoading(false);
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
        currentOdds =
          data.odds?.odds?.find(
            (o: any) => o.optionId === (opt.optionId ?? opt.id)
          )?.odds ?? null;
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
                handleAdminResolve={() => {}}
                handleAdminSettleOnly={() => {}}
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
