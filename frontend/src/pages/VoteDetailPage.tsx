// src/pages/VoteDetailPage.tsx
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";

import { useAuth } from "../hooks/useAuth";

import {
  fetchVoteDetail,
  participateVote,
} from "../api/voteApi";

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

// 🔥 분리된 컴포넌트들
import { VoteTabs } from "../components/voteDetail/VoteTabs";
import { VoteSidebarAI } from "../components/voteDetail/VoteSidebarAI";
import { VoteSidebarNormal } from "../components/voteDetail/VoteSidebarNormal";
import { VoteModal } from "../components/voteDetail/VoteModal";
import { VoteCompleteModal } from "../components/voteDetail/VoteCompleteModal";
import { VoteInfoCard } from "../components/voteDetail/VoteInfoCard";

type VoteType = "AI" | "NORMAL";

/* ------------------------------------------------------
    📌 Page Wrapper (라우트 전용)
------------------------------------------------------ */
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

/* ------------------------------------------------------
    📌 VoteDetailPage 본문
------------------------------------------------------ */
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

  // ======================================================
  // 🔥 모든 Hook은 최상단에만 위치!! (Hook 순서 오류 방지)
  // ======================================================
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<"chart" | "discussion">("chart");
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [showVoteModal, setShowVoteModal] = useState<null | "YES" | "NO">(null);
  const [voteComplete, setVoteComplete] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [adminCorrectChoiceId, setAdminCorrectChoiceId] = useState<number | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isAIVote = voteType === "AI";
  const isNormalVote = voteType === "NORMAL";

  // ======================================================
  // 🔥 데이터 로드
  // ======================================================
  useEffect(() => {
    load();
  }, [marketId, voteType]);

  async function load() {
    try {
      setLoading(true);
      let res;

      res =
        voteType === "AI"
          ? await fetchVoteDetail(marketId)
          : await fetchNormalVoteDetail(marketId);

      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  }

  // NormalVote 작성자 체크
  const isOwner = useMemo(() => {
    if (!isNormalVote || !data || !user) return false;
    return (data.ownerId ?? data.userId) === user.id;
  }, [isNormalVote, data, user]);

  if (loading) return <div className="text-white p-8">로딩중...</div>;
  if (!data) return <div className="text-white p-8">데이터 없음</div>;

  // ======================================================
  // 🔥 참여 처리
  // ======================================================
  async function handleParticipateAI(mode: "YES" | "NO") {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const firstOption = data.options[0];
    const yes = firstOption.choices.find((c: any) => c.text === "YES");
    const no = firstOption.choices.find((c: any) => c.text === "NO");

    const choiceId = mode === "YES" ? yes.choiceId : no.choiceId;

    try {
      await participateVote(data.voteId, choiceId, selectedAmount);
      setShowVoteModal(null);
      setVoteComplete(true);
      load();
    } catch {
      alert("투표 실패");
    }
  }

  async function handleParticipateNormal(optionId: number, choiceId: number) {
    if (!user) return alert("로그인이 필요합니다.");

    try {
      await participateNormalVote(data.id, choiceId);
      alert("투표 완료");
      load();
    } catch {
      alert("실패");
    }
  }

  // ======================================================
  // 🔥 관리자 처리
  // ======================================================
  async function handleAdminResolve(alsoSettle: boolean) {
    if (!isAdmin || !adminCorrectChoiceId) {
      return alert("정답을 선택해 주세요.");
    }

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
    if (!isAdmin) return;

    try {
      await adminSettleVote(data.voteId);
      alert("정산 완료");
      load();
    } catch {
      alert("정산 실패");
    }
  }

  // ======================================================
  // 🔥 NormalVote 수정 저장
  // ======================================================
  async function handleSaveEdit() {
    try {
      await updateNormalVote(data.id, {
        ...data,
      });
      alert("저장 완료");
      load();
    } catch {
      alert("저장 실패");
    }
  }

  // ======================================================
  // 🔥 차트 데이터 생성 (AI Vote)
  // ======================================================
  const chartData =
    isAIVote && data.statistics?.changes
      ? data.statistics.changes.map((ch: any) => ({
          date: new Date(ch.time).toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
          }),
          yes: ch.yesPercent,
          no: ch.noPercent,
        }))
      : [];

  // ======================================================
  // 🔥 화면 렌더링
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
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

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

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
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {isAIVote ? (
            <VoteSidebarAI
              yesPercent={data.options[0].choices.find((c: any) => c.text === "YES")?.percent ?? 0}
              noPercent={data.options[0].choices.find((c: any) => c.text === "NO")?.percent ?? 0}
              selectedAmount={selectedAmount}
              setSelectedAmount={setSelectedAmount}
              setShowVoteModal={setShowVoteModal}
              myParticipation={data.myParticipation}
              options={data.options}
            />
          ) : (
            <VoteSidebarNormal
              options={data.options}
              onParticipate={handleParticipateNormal}
            />
          )}
        </div>
      </div>

      {/* MODALS */}
      {isAIVote && showVoteModal && (
        <VoteModal
          mode={showVoteModal}
          amount={selectedAmount}
          yesPercent={data.options[0].choices.find((c: any) => c.text === "YES")?.percent ?? 0}
          noPercent={data.options[0].choices.find((c: any) => c.text === "NO")?.percent ?? 0}
          onClose={() => setShowVoteModal(null)}
          onConfirm={handleParticipateAI}
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
