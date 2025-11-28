// Votes.tsx
export function Votes() {
  const votes = [
    { id: 1, question: '최신 영화 추천', votes: 120 },
    { id: 2, question: 'AI 뉴스 제목 재가공', votes: 80 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">투표 관리</h2>
      <ul className="space-y-2">
        {votes.map(vote => (
          <li key={vote.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{vote.question}</span>
            <span className="text-blue-400 font-semibold">{vote.votes}표</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
