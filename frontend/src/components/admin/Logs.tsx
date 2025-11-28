// Logs.tsx
export function Logs() {
  const logs = [
    { id: 1, action: '홍길동 로그인', time: '2025-11-27 10:12' },
    { id: 2, action: '김철수 투표 참여', time: '2025-11-27 11:05' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">활동 로그</h2>
      <ul className="space-y-2">
        {logs.map(log => (
          <li key={log.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{log.action}</span>
            <span className="text-gray-400">{log.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
