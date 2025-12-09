// Logs.tsx
import { Shield, Clock } from "lucide-react";

export function Logs() {

  // 📌 기존 logs 데이터 확장
  const adminLogs = [
    {
      id: 1,
      admin: "홍길동",
      action: "로그인",
      target: "-",
      details: "관리자 계정 로그인 성공",
      timestamp: "2025-11-27 10:12",
    },
    {
      id: 2,
      admin: "김철수",
      action: "투표 참여 처리",
      target: "투표 ID: 22",
      details: "사용자 투표 승인",
      timestamp: "2025-11-27 11:05",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <h2 className="text-2xl font-bold text-white">활동 로그</h2>

      {/* 테이블 컨테이너 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold text-white">Admin Actions 로그</h3>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">액션</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">대상</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상세 내용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">시간</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {adminLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  {/* 관리자 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{log.admin}</span>
                    </div>
                  </td>

                  {/* 액션 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium">
                      {log.action}
                    </span>
                  </td>

                  {/* 대상 */}
                  <td className="px-6 py-4 text-sm text-gray-300">{log.target}</td>

                  {/* 상세 내용 */}
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">
                    {log.details}
                  </td>

                  {/* 시간 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
