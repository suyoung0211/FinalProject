// Issues.tsx
export function Issues() {
  const issues = [
    { id: 1, title: '로그인 오류', status: '대기' },
    { id: 2, title: '포인트 적립 문제', status: '해결' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">이슈 관리</h2>
      <ul className="space-y-2">
        {issues.map(issue => (
          <li key={issue.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{issue.title}</span>
            <span className={`px-2 py-1 text-xs rounded ${issue.status === '대기' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{issue.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
