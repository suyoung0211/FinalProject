import { useEffect, useState } from "react";
import { Button } from "../../ui/button";

import { fetchVoteList, fetchVoteDetail } from "../../../api/voteApi";
import { fetchNormalVoteList, updateNormalVote } from "../../../api/normalVoteApi";

import {
  adminResolveAndSettleVote,
  adminSettleVote,
  adminFinishNormalVote,
  adminCancelNormalVote,
  adminOpenVote,
} from "../../../api/adminAPI";

import { ResolveVoteModal } from "./ResolveVoteModal";
import { NormalVoteEditModal } from "./NormalVoteEditModal";

export function Votes() {
  const [tab, setTab] = useState<"AI" | "NORMAL">("AI");

  const [aiVotes, setAiVotes] = useState<any[]>([]);
  const [normalVotes, setNormalVotes] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const [resolveVote, setResolveVote] = useState<any | null>(null);
  const [editNormalVote, setEditNormalVote] = useState<any | null>(null);

  // 🔥 리스트 로드
  async function loadAll() {
    const aiRes = await fetchVoteList();
    const normalRes = await fetchNormalVoteList();

    console.log("🔥 AI Vote Response:", aiRes.data);
    console.log("🔥 Normal Vote Response:", normalRes.data);

    const rawAI = aiRes.data.votes || aiRes.data || [];

    const mappedAI = rawAI.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      totalParticipants: v.totalParticipants ?? 0,
      status: v.status ?? "UNKNOWN",
    }));

    setAiVotes(mappedAI);
    setNormalVotes(normalRes.data.votes || []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredAI = aiVotes
    .filter((v) => (v.title || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === "latest" ? b.id - a.id : a.id - b.id));

  const filteredNormal = normalVotes
    .filter((v) => (v.title || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === "latest" ? b.id - a.id : a.id - b.id));

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-3">
        <Button
          className={`px-4 py-2 rounded-xl ${tab === "AI" ? "bg-purple-600" : "bg-white/10"}`}
          onClick={() => setTab("AI")}
        >
          AI 투표
        </Button>

        <Button
          className={`px-4 py-2 rounded-xl ${tab === "NORMAL" ? "bg-purple-600" : "bg-white/10"}`}
          onClick={() => setTab("NORMAL")}
        >
          일반 투표
        </Button>
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex gap-4 items-center">
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

      {/* ----------------------------- */}
      {/* AI Votes */}
      {/* ----------------------------- */}
      {tab === "AI" && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400">제목</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">참여자</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredAI.map((v) => (
                <tr key={v.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{v.title}</td>
                  <td className="px-6 py-4 text-white">{v.totalParticipants}</td>

                  <td className="px-6 py-4 flex gap-2 items-center">

  {/* 🔥 상태 라벨 */}
  <span
    className={`
      text-xs px-2 py-1 rounded-full font-semibold
      ${
        v.status === "REVIEWING"
          ? "bg-yellow-500/20 text-yellow-300"
        : v.status === "ONGOING"
          ? "bg-green-500/20 text-green-300"
        : v.status === "FINISHED"
          ? "bg-blue-500/20 text-blue-300"
        : v.status === "RESOLVED"
          ? "bg-purple-500/20 text-purple-300"
        : v.status === "REWARDED"
          ? "bg-gray-500/20 text-gray-300"
        : "bg-white/10 text-gray-300"
      }
    `}
  >
    {v.status}
  </span>

  {/* ------------------------------------------------------- */}
  {/* 🔥 REVIEWING → 오픈 버튼 (ON) */}
  {/* ------------------------------------------------------- */}
  {v.status === "REVIEWING" && (
    <Button
      className="bg-yellow-500/20 text-yellow-300 text-xs"
      onClick={() => adminOpenVote(v.id).then(loadAll)}
    >
      오픈
    </Button>
  )}

  {/* ------------------------------------------------------- */}
  {/* 🔥 ONGOING → 정답 선택 버튼 */}
  {/* ------------------------------------------------------- */}
  {v.status === "ONGOING" && (
    <Button
      className="bg-purple-500/20 text-purple-300 text-xs"
      onClick={async () => {
        const detail = await fetchVoteDetail(v.id);
        setResolveVote(detail.data);
      }}
    >
      정답 선택
    </Button>
  )}

  {/* ------------------------------------------------------- */}
  {/* 🔥 FINISHED → 정산 버튼 */}
  {/* ------------------------------------------------------- */}
  {v.status === "FINISHED" && (
    <Button
      className="bg-blue-500/20 text-blue-300 text-xs"
      onClick={() => adminSettleVote(v.id).then(loadAll)}
    >
      정산
    </Button>
  )}

  {/* ------------------------------------------------------- */}
  {/* 🔒 RESOLVED / REWARDED 상태에서는 모든 조작 비활성 */}
  {/* ------------------------------------------------------- */}
  {(v.status === "RESOLVED" || v.status === "REWARDED") && (
    <span className="text-xs text-gray-400">완료됨</span>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------------------- */}
      {/* Normal Votes */}
      {/* ----------------------------- */}
      {tab === "NORMAL" && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400">제목</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">참여</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredNormal.map((v) => (
                <tr key={v.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white">
  <div className="font-semibold">{v.title}</div>

  <div className="text-gray-400 text-xs mt-1 line-clamp-2">
    {v.description}
  </div>
</td>                  
                  <td className="px-6 py-4 text-white">{v.totalParticipants}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      className="bg-yellow-500/20 text-yellow-300 text-xs"
                      onClick={() => setEditNormalVote(v)}
                    >
                      수정
                    </Button>

                    <Button
                      className="bg-green-500/20 text-green-300 text-xs"
                      onClick={() => adminFinishNormalVote(v.id).then(loadAll)}
                    >
                      종료
                    </Button>

                    <Button
                      className="bg-red-500/20 text-red-300 text-xs"
                      onClick={() => adminCancelNormalVote(v.id).then(loadAll)}
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

      {/* ----------------------------- */}
      {/* Modals */}
      {/* ----------------------------- */}
      {resolveVote && (
        <ResolveVoteModal
          vote={resolveVote}
          onClose={() => setResolveVote(null)}
          onSubmit={(choiceId: number) =>
            adminResolveAndSettleVote(resolveVote.voteId ?? resolveVote.id, {
              correctChoiceId: choiceId,
            }).then(() => {
              setResolveVote(null);
              loadAll();
            })
          }
        />
      )}

      {editNormalVote && (
        <NormalVoteEditModal
          vote={editNormalVote}
          onClose={() => setEditNormalVote(null)}
          onSubmit={(data) =>
            updateNormalVote(editNormalVote.id, data).then(() => {
              setEditNormalVote(null);
              loadAll();
            })
          }
        />
      )}

    </div>
  );
}
