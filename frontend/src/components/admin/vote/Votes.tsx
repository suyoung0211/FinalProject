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
type SortOrder = "LATEST" | "OLDEST";

/* =========================
 * Utils
 * ========================= */
function sortVotes<T extends { createdAt?: string; id?: number }>(
  list: T[],
  order: SortOrder
) {
  return [...list].sort((a, b) => {
    const aTime = a.createdAt
      ? new Date(a.createdAt).getTime()
      : a.id ?? 0;
    const bTime = b.createdAt
      ? new Date(b.createdAt).getTime()
      : b.id ?? 0;

    return order === "LATEST" ? bTime - aTime : aTime - bTime;
  });
}

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
  const [sortOrder, setSortOrder] = useState<SortOrder>("LATEST");

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

    const mappedAI = rawAI.map((v: any) => ({
      id: v.id,
      title: v.title,
      totalParticipants: v.totalParticipants ?? 0,
      status: v.status ?? "UNKNOWN",
      createdAt: v.createdAt,
    }));

    const mappedNormal = (normalRes.data.votes || []).map((v: any) => ({
      ...v,
      status: v.status ?? "UNKNOWN",
      createdAt: v.createdAt,
    }));

    setAiVotes(sortVotes(mappedAI, sortOrder));
    setNormalVotes(sortVotes(mappedNormal, sortOrder));
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* 정렬 변경 시 재정렬 */
  useEffect(() => {
    setAiVotes((prev) => sortVotes(prev, sortOrder));
    setNormalVotes((prev) => sortVotes(prev, sortOrder));
  }, [sortOrder]);

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* Tabs + Sort */}
      <div className="flex items-center justify-between">
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

        <select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
  className="
    bg-purple-600/30 text-white text-sm
    px-3 py-2 rounded-md
    border border-purple-500/40
    focus:outline-none focus:ring-2 focus:ring-purple-500
  "
>
  <option
    value="LATEST"
    className="bg-purple-700 text-white"
  >
    최신순
  </option>
  <option
    value="OLDEST"
    className="bg-purple-700 text-white"
  >
    오래된순
  </option>
</select>
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

      {/* ================= CONFIRM / RESULT MODALS ================= */}
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
                }
                if (confirmTarget.action === "FINISH") {
                  tab === "AI"
                    ? await adminFinishVote(confirmTarget.voteId)
                    : await adminFinishNormalVote(confirmTarget.voteId);
                }
                if (confirmTarget.action === "CANCEL") {
                  await adminCancelNormalVote(confirmTarget.voteId);
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

function Td({
  children,
  clickable = false,
  onClick,
  align = "left",
}: {
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      onClick={onClick}
      className={`px-6 py-4 text-white ${
        clickable ? "cursor-pointer hover:underline" : ""
      } ${align === "center" ? "text-center" : ""}`}
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
