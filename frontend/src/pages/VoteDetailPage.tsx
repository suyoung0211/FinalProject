// src/pages/VoteDetailPage.tsx

import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";

// API
import { fetchVoteDetailFull, participateVote } from "../api/voteApi";
import {
  fetchNormalVoteDetail,
  updateNormalVote,
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

// ====================================================================
//  Route Wrapper
// ====================================================================
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

// ====================================================================
//  MAIN PAGE
// ====================================================================
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

  // STATE
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<"chart" | "discussion">("chart");
  const [selectedAmount, setSelectedAmount] = useState(100);

  const [showVoteModal, setShowVoteModal] = useState<number | null>(null);
  const [voteComplete, setVoteComplete] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [adminCorrectChoiceId, setAdminCorrectChoiceId] = useState<number | null>(null);

  // ====================================================================
  //  LOAD DATA
  // ====================================================================
  useEffect(() => {
    load();
  }, [marketId, voteType]);

  async function load() {
    try {
      setLoading(true);
      setEditMode(false);

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

  function calcExpectedOdds(choicePoints: number, totalPool: number, amount: number) {
  const newChoicePoints = (choicePoints ?? 0) + amount;
  const newTotalPool = (totalPool ?? 0) + amount;

  if (newChoicePoints <= 0) return 1;

  return Math.round((newTotalPool / newChoicePoints) * 100) / 100;
}

  // ====================================================================
  //  NORMAL Percent 계산
  // ====================================================================
  const getNormalChoicePercent = useCallback((choice: any, option: any) => {
    const total = option.choices?.reduce(
      (sum: number, c: any) => sum + (c.participantsCount ?? 0),
      0
    );
    if (!total) return 0;
    return Math.round(((choice.participantsCount ?? 0) / total) * 100);
  }, []);

  // ====================================================================
  //  OWNER CHECK
  // ====================================================================
  const isOwner = useMemo(() => {
    if (!isNormalVote || !data || !user) return false;
    return (data.ownerId ?? data.userId) === user.id;
  }, [isNormalVote, data, user]);

  // ====================================================================
  //  AI 차트 데이터
  // ====================================================================
  const chartData = useMemo(() => {
  if (!isAIVote || !data?.odds?.odds) return [];

  // YES / NO / DRAW 등 모든 choice의 history를 합친다
  const histories = data.odds.odds;

  // X축 기준: history.count
  const maxCount = Math.max(
    ...histories.map((c: any) => c.history?.length ?? 0)
  );

  const result: any[] = [];

  for (let i = 0; i < maxCount; i++) {
    const entry: any = { count: i + 1 };

    histories.forEach((c: any) => {
      const h = c.history?.[i];

      entry[c.text] = h ? h.odds : null; // 없으면 null
    });

    result.push(entry);
  }

  return result;
}, [isAIVote, data]);

  // ====================================================================
  //  PARTICIPATE — AI
  // ====================================================================
  async function handleParticipateAI(choiceId: number) {
    if (!user) return alert("로그인 필요");

    try {
      await participateVote(data.voteId, choiceId, selectedAmount);

      setShowVoteModal(null);
      setVoteComplete(true);
      load();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message ?? "투표 실패");
    }
  }

  // ====================================================================
  //  PARTICIPATE — NORMAL
  // ====================================================================
  async function handleParticipateNormal(choiceId: number) {
    if (!user) return alert("로그인 필요");

    console.log("🔥 NormalVote 참여 요청:", { choiceId });

    try {
      await participateNormalVote(marketId, choiceId);
      alert("투표 완료!");
      load();
    } catch (err) {
      console.error("⚠ NormalVote 실패:", err);
      alert("일반 투표 참여 실패");
    }
  }

  // ====================================================================
  //  ADMIN 처리
  // ====================================================================
  async function handleAdminResolve(alsoSettle: boolean) {
  if (!adminCorrectChoiceId) return alert("정답 선택 필요");

  try {
    // 단일 AI투표는 option이 하나뿐
    const optionId =
      data.options?.[0]?.optionId ??
      data.options?.[0]?.id ??
      null;

    if (!optionId) {
      alert("옵션 ID를 찾을 수 없습니다.");
      return;
    }

    const payload = {
      answers: [
        {
          optionId,
          choiceId: adminCorrectChoiceId
        }
      ]
    };

    console.log("📤 Admin Resolve Payload:", payload);

    if (alsoSettle) {
      await adminResolveAndSettleVote(data.voteId, payload);
    } else {
      await adminResolveVote(data.voteId, payload);
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
    await adminSettleVote(data.voteId);
    alert("정산 완료");
    load();
  } catch {
    alert("정산 실패");
  }
}

  async function handleSaveEdit() {
    try {
      await updateNormalVote(data.id, { ...data });
      alert("저장 완료");
      load();
    } catch {
      alert("저장 실패");
    }
  }

  // ====================================================================
  //  선택된 choice
  // ====================================================================
  const selectedChoice = useMemo(() => {
    if (!data || showVoteModal === null) return null;

    const allChoices = data.options?.flatMap((o: any) => o.choices ?? []);
    return allChoices?.find((c: any) => (c.choiceId ?? c.id) === showVoteModal) ?? null;
  }, [data, showVoteModal]);

  // ====================================================================
  //  RENDER
  // ====================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ---------------- HEADER ---------------- */}
      <Header activeMenu="VoteDetailPage" />

      {/* BODY */}
      <div className="container mx-auto px-4 py-8 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {loading || !data ? (
            <div className="text-white p-8">{loading ? "로딩중..." : "데이터 없음"}</div>
          ) : (
            <>
              <VoteInfoCard
                data={data}
                isAIVote={isAIVote}
                isNormalVote={isNormalVote}
                isOwner={isOwner}
                isAdmin={isAdmin}
                editMode={editMode}
                setEditMode={setEditMode}
                setData={setData}
                handleSaveEdit={handleSaveEdit}
                adminCorrectChoiceId={adminCorrectChoiceId}
                setAdminCorrectChoiceId={setAdminCorrectChoiceId}
                handleAdminResolve={handleAdminResolve}
                handleAdminSettleOnly={handleAdminSettleOnly}
              />

              <VoteTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                isAIVote={isAIVote}
                chartData={chartData}
                data={data}
                getNormalChoicePercent={getNormalChoicePercent}
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
          handleParticipateNormal={handleParticipateNormal}
        />
      </div>

      {/* AI Vote Modal */}
      {isAIVote && showVoteModal !== null && data && (
        <VoteModal
  choiceId={showVoteModal}
  amount={selectedAmount}
  currentOdds={selectedChoice?.odds ?? 1}

  expectedOdds={calcExpectedOdds(
    selectedChoice?.pointsTotal ?? 0,
    data.totalPoints ?? 0,
    selectedAmount
  )}

  expectedReward={
    selectedAmount *
    calcExpectedOdds(
      selectedChoice?.pointsTotal ?? 0,
      data.totalPoints ?? 0,
      selectedAmount
    )
  }

  percent={selectedChoice?.percent ?? 0}

  onClose={() => setShowVoteModal(null)}
  onConfirm={handleParticipateAI}
/>
      )}

      {/* AI 완료 Modal */}
      {isAIVote && voteComplete && (
        <VoteCompleteModal amount={selectedAmount} onClose={() => setVoteComplete(false)} />
      )}
    </div>
  );
}
