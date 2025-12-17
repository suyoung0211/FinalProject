import { useNavigate } from "react-router-dom";

export function VoteCard({ vote }: any) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/votes/${vote.voteId}`)}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer
                 flex flex-col h-full"
    >
      {/* 상단 콘텐츠 */}
      <h3 className="text-white text-lg font-semibold">
        {vote.title}
      </h3>

      {/* 🔽 하단 고정 영역 */}
      <div className="flex justify-between items-center mt-auto pt-3">
        <span className="text-purple-400 text-sm">
          참여자: {vote.totalParticipants}
        </span>
        <span className="text-gray-300 text-xs">
          종료: {vote.endAt ? vote.endAt.slice(0, 10) : "미정"}
        </span>
      </div>
    </div>
  );
}