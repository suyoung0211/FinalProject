import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchVoteList, fetchVoteDetail } from "../../../api/voteApi";
import { fetchNormalVoteList } from "../../../api/normalVoteApi";

import {
  adminResolveAndSettleVote,
  adminFinishNormalVote,
  adminCancelNormalVote,
  adminOpenVote,
  adminFinishVote,
} from "../../../api/adminAPI";

import { ResolveVoteModal } from "./ResolveVoteModal";

/* =========================
 * Types
 * ========================= */
type VoteStatus =
  | "REVIEWING"
  | "ONGOING"
  | "FINISHED"
  | "RESOLVED"
  | "REWARDED"
  | "CANCELLED"
  | "UNKNOWN";

type ConfirmAction = "OPEN" | "FINISH" | "CANCEL";

/* =========================
 * Status Badge
 * ========================= */
function StatusBadge({ status }: { status: VoteStatus }) {
  const map: Record<VoteStatus, string> = {
    REVIEWING: "bg-gray-500/20 text-gray-300",
    ONGOING: "bg-green-500/20 text-green-300",
    FINISHED: "bg-yellow-500/20 text-yellow-300",
    RESOLVED: "bg-blue-500/20 text-blue-300",
    REWARDED: "bg-purple-500/20 text-purple-300",
    CANCELLED: "bg-red-500/20 text-red-300",
    UNKNOWN: "bg-white/10 text-gray-300",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
      {status}
    </span>
  );
}

/* =========================
 * Main
 * ========================= */
export function Votes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<"AI" | "NORMAL">("AI");
  const [aiVotes, setAiVotes] = useState<any[]>([]);
  const [normalVotes, setNormalVotes] = useState<any[]>([]);
  const [resolveVote, setResolveVote] = useState<any | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    voteId: number;
    action: ConfirmAction;
  } | null>(null);

  const [resultMessage, setResultMessage] = useState<string | null>(null);

  /* ================= 데이터 로드 ================= */
  async function loadAll() {
    const aiRes = await fetchVoteList();
    const normalRes = await fetchNormalVoteList();

    const rawAI = aiRes.data.votes || aiRes.data || [];

    setAiVotes(
      rawAI.map((v: any) => ({
        id: v.id,
        title: v.title,
        totalParticipants: v.totalParticipants ?? 0,
        status: v.status ?? "UNKNOWN",
      }))
    );

    setNormalVotes(
      (normalRes.data.votes || []).map((v: any) => ({
        ...v,
        status: v.status ?? "UNKNOWN",
      }))
    );
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        <Button
          className={tab === "AI" ? "bg-purple-600" : "bg-white/10"}
          onClick={() => setTab("AI")}
        >
          AI 투표
        </Button>
        <Button
          className={tab === "NORMAL" ? "bg-purple-600" : "bg-white/10"}
          onClick={() => setTab("NORMAL")}
        >
          일반 투표
        </Button>
      </div>

      {/* ================= AI ================= */}
      {tab === "AI" && (
        <Table>
          {aiVotes.map((v) => (
            <tr key={v.id}>
              <Td
                clickable
                onClick={() =>
                  navigate(`/votes/${v.id}`, {
                    state: { voteType: "AI", background: location },
                  })
                }
              >
                {v.title}
              </Td>

              <Td align="center">{v.totalParticipants}</Td>
              <Td align="center">
                <StatusBadge status={v.status} />
              </Td>

              <Td align="center">
                <div className="flex justify-center gap-2 min-h-[32px]">
                  {v.status === "REVIEWING" && (
                    <Button
                      className="bg-blue-500/20 text-blue-300 text-xs"
                      onClick={() =>
                        setConfirmTarget({ voteId: v.id, action: "OPEN" })
                      }
                    >
                      투표 개시
                    </Button>
                  )}

                  {v.status === "ONGOING" && (
                    <Button
                      className="bg-green-500/20 text-green-300 text-xs"
                      onClick={() =>
                        setConfirmTarget({ voteId: v.id, action: "FINISH" })
                      }
                    >
                      투표 종료
                    </Button>
                  )}

                  {v.status === "FINISHED" && (
                    <Button
                      className="bg-purple-500/20 text-purple-300 text-xs"
                      onClick={async () => {
                        const res = await fetchVoteDetail(v.id);
                        setResolveVote(res.data);
                      }}
                    >
                      정답 선택
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* ================= NORMAL ================= */}
      {tab === "NORMAL" && (
        <Table>
          {normalVotes.map((v) => (
            <tr key={v.id}>
              <Td
                clickable
                onClick={() =>
                  navigate(`/votes/${v.id}`, {
                    state: { voteType: "NORMAL", background: location },
                  })
                }
              >
                {v.title}
              </Td>

              <Td align="center">{v.totalParticipants}</Td>
              <Td align="center">
                <StatusBadge status={v.status} />
              </Td>

              <Td align="center">
                <div className="flex justify-center gap-2 min-h-[32px]">
                  {v.status === "ONGOING" && (
                    <>
                      <Button
                        className="bg-green-500/20 text-green-300 text-xs"
                        onClick={() =>
                          setConfirmTarget({ voteId: v.id, action: "FINISH" })
                        }
                      >
                        종료
                      </Button>

                      <Button
                        className="bg-red-500/20 text-red-300 text-xs"
                        onClick={() =>
                          setConfirmTarget({ voteId: v.id, action: "CANCEL" })
                        }
                      >
                        취소
                      </Button>
                    </>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* ================= Resolve Modal ================= */}
      {resolveVote && (
        <ResolveVoteModal
          vote={resolveVote}
          onClose={() => setResolveVote(null)}
          onSubmit={(selectedChoices: Record<number, number>) => {
            if (!resolveVote?.voteId) {
              alert("voteId가 없습니다.");
              return;
            }

            const answers = Object.entries(selectedChoices).map(
              ([optionId, choiceId]) => ({
                optionId: Number(optionId),
                choiceId: Number(choiceId),
              })
            );

            adminResolveAndSettleVote(resolveVote.voteId, { answers }).then(
              () => {
                setResolveVote(null);
                loadAll();
              }
            );
          }}
        />
      )}

      {/* ================= CONFIRM MODAL ================= */}
      {confirmTarget && (
        <Modal>
          <p className="text-white font-bold">
            {confirmTarget.action === "OPEN" && "투표를 개시하시겠습니까?"}
            {confirmTarget.action === "FINISH" && "투표를 종료하시겠습니까?"}
            {confirmTarget.action === "CANCEL" && "투표를 취소하시겠습니까?"}
          </p>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmTarget(null)}>취소</Button>
            <Button
              className="bg-purple-600"
              onClick={async () => {
                if (confirmTarget.action === "OPEN") {
                  await adminOpenVote(confirmTarget.voteId);
                  setResultMessage("투표를 개시하였습니다.");
                }
                if (confirmTarget.action === "FINISH") {
                  tab === "AI"
                    ? await adminFinishVote(confirmTarget.voteId)
                    : await adminFinishNormalVote(confirmTarget.voteId);
                  setResultMessage("투표를 종료하였습니다.");
                }
                if (confirmTarget.action === "CANCEL") {
                  await adminCancelNormalVote(confirmTarget.voteId);
                  setResultMessage("투표를 취소하였습니다.");
                }

                setConfirmTarget(null);
                loadAll();
              }}
            >
              확인
            </Button>
          </div>
        </Modal>
      )}

      {/* ================= RESULT ================= */}
      {resultMessage && (
        <Modal>
          <p className="text-white text-center">{resultMessage}</p>
          <Button onClick={() => setResultMessage(null)}>확인</Button>
        </Modal>
      )}
    </div>
  );
}

/* ================= UI Helpers ================= */
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-3 text-xs text-gray-400">제목</th>
            <th className="px-6 py-3 text-xs text-gray-400">참여자</th>
            <th className="px-6 py-3 text-xs text-gray-400">상태</th>
            <th className="px-6 py-3 text-xs text-gray-400">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}

type TdProps = {
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  align?: "left" | "center" | "right";
};

function Td({
  children,
  clickable = false,
  onClick,
  align = "left",
}: TdProps) {
  return (
    <td
      onClick={onClick}
      className={`px-6 py-4 text-white align-middle ${
        clickable ? "cursor-pointer hover:underline" : ""
      } ${
        align === "center"
          ? "text-center"
          : align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[420px] space-y-4">
        {children}
      </div>
    </div>
  );
}
