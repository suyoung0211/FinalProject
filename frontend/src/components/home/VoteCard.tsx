import { useNavigate } from "react-router-dom";

export function VoteCard({ vote }: any) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/vote/${vote.voteId}`)}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
    >
      <h3 className="text-white text-lg font-semibold">
        {vote.title}
      </h3>

      <p className="text-gray-400 text-sm mt-1">
        상태: {vote.status}
      </p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-purple-400 text-sm">
          참여자: {vote.totalParticipants}
        </span>
        <span className="text-gray-300 text-xs">
          종료: {vote.endAt ?? "미정"}
        </span>
      </div>
    </div>
  );
}