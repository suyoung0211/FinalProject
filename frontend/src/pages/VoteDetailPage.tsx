// src/pages/VoteDetailPage.tsx

import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

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

  // 모달은 now choiceId 를 저장한다
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

  // ====================================================================
  //  NORMAL Percent
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
  //  CHART DATA
  // ====================================================================
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

  // ====================================================================
  //  PARTICIPATE AI — ⭐ 핵심 리팩토링 완료
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
  //  PARTICIPATE NORMAL
  // ====================================================================
  async function handleParticipateNormal(optionId: number, choiceId: number) {
    if (!user) return alert("로그인 필요");

    try {
      await participateNormalVote(marketId, choiceId);
      alert("투표 완료");
      load();
    } catch {
      alert("실패");
    }
  }

  // ====================================================================
  //  ADMIN 처리
  // ====================================================================
  async function handleAdminResolve(alsoSettle: boolean) {
    if (!adminCorrectChoiceId) return alert("정답 선택 필요");

    try {
      if (alsoSettle) {
        await adminResolveAndSettleVote(data.voteId, {
          correctChoiceId: adminCorrectChoiceId,
        });
      } else {
        await adminResolveVote(data.voteId, {
          correctChoiceId: adminCorrectChoiceId,
        });
      }
      alert("처리 완료");
      load();
    } catch {
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
  //  SELECTED CHOICE (now safe)
  // ====================================================================
  const selectedChoice = useMemo(() => {
    if (!data || showVoteModal === null) return null;

    const allChoices = data.options?.flatMap((o: any) => o.choices ?? []);
    return (
      allChoices?.find((c: any) => (c.choiceId ?? c.id) === showVoteModal) ?? null
    );
  }, [data, showVoteModal]);

  // ====================================================================
  //  RENDER
  // ====================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button onClick={onBack} variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 mr-2" /> 뒤로
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white">
              <Share2 />
            </Button>
            <Button variant="ghost" className="text-white">
              <Bookmark />
            </Button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          setShowVoteModal={setShowVoteModal} // now choiceId 전달
          handleParticipateNormal={handleParticipateNormal}
        />
      </div>

      {/* MODALS */}
      {isAIVote && showVoteModal !== null && data && (
        <VoteModal
          choiceId={showVoteModal}
          amount={selectedAmount}
          odds={selectedChoice?.odds ?? 1}
          percent={selectedChoice?.percent ?? 0}
          onClose={() => setShowVoteModal(null)}
          onConfirm={handleParticipateAI}
        />
      )}

      {isAIVote && voteComplete && (
        <VoteCompleteModal amount={selectedAmount} onClose={() => setVoteComplete(false)} />
      )}
    </div>
  );
}
