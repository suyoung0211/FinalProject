import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { AxiosResponse } from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchVoteList, fetchVoteDetail } from "../../../api/voteApi";
import { fetchNormalVoteList } from "../../../api/normalVoteApi";

import {
  adminResolveAndSettleVote,
  adminSettleVote,
  adminFinishNormalVote,
  adminCancelNormalVote,
  adminOpenVote,
} from "../../../api/adminAPI";

import { ResolveVoteModal } from "./ResolveVoteModal";

/* ======================================================
 * 옵션 / Choice ID → 텍스트 매핑 (순수 유틸)
 * ====================================================== */
function buildOptionLookup(vote: any) {
  const optionMap = new Map<number, string>();
  const choiceMap = new Map<number, string>();

  if (!vote?.options) return { optionMap, choiceMap };

  vote.options.forEach((opt: any) => {
    const optionId = opt.optionId ?? opt.id;

    optionMap.set(
      optionId,
      opt.optionTitle ?? opt.title ?? `옵션 ${optionId}`
    );

    opt.choices?.forEach((c: any) => {
      const choiceId = c.choiceId ?? c.id;
      choiceMap.set(
        choiceId,
        c.text ?? c.choiceText ?? `선택지 ${choiceId}`
      );
    });
  });

  return { optionMap, choiceMap };
}

export function Votes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState<"AI" | "NORMAL">("AI");

  const [aiVotes, setAiVotes] = useState<any[]>([]);
  const [normalVotes, setNormalVotes] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const [resolveVote, setResolveVote] = useState<any | null>(null);
  const [settlementResult, setSettlementResult] = useState<any | null>(null);

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

    setNormalVotes(normalRes.data.votes || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= 필터 ================= */
  const filteredAI = aiVotes
    .filter((v) => v.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === "latest" ? b.id - a.id : a.id - b.id));

  const filteredNormal = normalVotes
    .filter((v) => v.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === "latest" ? b.id - a.id : a.id - b.id));

  return (
    <div className="space-y-6">
      {/* ================= Tabs ================= */}
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

      {/* ================= 검색 ================= */}
      <div className="flex gap-4">
        <input
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="검색 (제목)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {/* ================= AI Votes ================= */}
      {tab === "AI" && (
        <VoteTable
          votes={filteredAI}
          voteType="AI"
          navigate={navigate}
          location={location}
          onOpenResolve={async (id) => {
            const res = await fetchVoteDetail(id);
            setResolveVote(res.data);
          }}
          onReload={loadAll}
        />
      )}

      {/* ================= NORMAL Votes ================= */}
      {tab === "NORMAL" && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-xs text-gray-400">제목</th>
                <th className="px-6 py-3 text-xs text-gray-400">참여자</th>
                <th className="px-6 py-3 text-xs text-gray-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredNormal.map((v) => (
                <tr key={v.id}>
                  {/* 🔥 제목 클릭 → NORMAL 상세 모달 */}
                  <td
                    className="px-6 py-4 text-white cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/votes/${v.id}`, {
                        state: {
                          voteType: "NORMAL",
                          background: location,
                        },
                      })
                    }
                  >
                    {v.title}
                  </td>

                  <td className="px-6 py-4 text-white">
                    {v.totalParticipants ?? 0}
                  </td>

                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      className="bg-green-500/20 text-green-300 text-xs"
                      onClick={() =>
                        adminFinishNormalVote(v.id).then(loadAll)
                      }
                    >
                      종료
                    </Button>
                    <Button
                      className="bg-red-500/20 text-red-300 text-xs"
                      onClick={() =>
                        adminCancelNormalVote(v.id).then(loadAll)
                      }
                    >
                      취소
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= Resolve Modal ================= */}
      {resolveVote && (
        <ResolveVoteModal
          vote={resolveVote}
          onClose={() => setResolveVote(null)}
          onSubmit={(selectedChoices) => {
            const voteId = resolveVote.voteId ?? resolveVote.id;
            const answers = Object.entries(selectedChoices).map(
              ([optionId, choiceId]) => ({
                optionId: Number(optionId),
                choiceId: Number(choiceId),
              })
            );

            adminResolveAndSettleVote(voteId, { answers }).then(
              (res: AxiosResponse<any>) => {
                setResolveVote(null);
                setSettlementResult(res.data);
                loadAll();
              }
            );
          }}
        />
      )}

      {/* ================= Settlement Result ================= */}
      {settlementResult && (() => {
        const { optionMap, choiceMap } = buildOptionLookup(resolveVote);

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[520px] space-y-4">
              <h2 className="text-white font-bold text-lg">정산 결과</h2>

              <div className="text-sm text-gray-300 space-y-1">
                <p>총 당첨자 수: {settlementResult.totalWinnerCount}</p>
                <p>총 지급 포인트: {settlementResult.totalDistributed}</p>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-purple-600"
                  onClick={() => setSettlementResult(null)}
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ================= 공용 AI 테이블 ================= */
function VoteTable({
  votes,
  voteType,
  navigate,
  location,
  onOpenResolve,
  onReload,
}: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-3 text-xs text-gray-400">제목</th>
            <th className="px-6 py-3 text-xs text-gray-400">참여자</th>
            <th className="px-6 py-3 text-xs text-gray-400">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {votes.map((v: any) => (
            <tr key={v.id}>
              <td
                className="px-6 py-4 text-white cursor-pointer hover:underline"
                onClick={() =>
                  navigate(`/votes/${v.id}`, {
                    state: { voteType, background: location },
                  })
                }
              >
                {v.title}
              </td>
              <td className="px-6 py-4 text-white">
                {v.totalParticipants}
              </td>
              <td className="px-6 py-4">
                <Button
                  className="bg-purple-500/20 text-purple-300 text-xs"
                  onClick={() => onOpenResolve(v.id)}
                >
                  정답 선택
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
