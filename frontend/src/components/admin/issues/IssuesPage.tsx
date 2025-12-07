import { CheckCircle, Eye, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { getAllIssuesApi, updateAdminIssueStatusApi } from "../../../api/adminAPI";

// DTO 타입 정의
export interface IssueResponse {
  id: number;
  title: string;
  source: "기사" | "커뮤니티" | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  importance?: string | null;
  keyPoints?: string[];
}

export function Issues() {
  const [issues, setIssues] = useState<IssueResponse[]>([]);

  // 이슈 목록 불러오기
  useEffect(() => {
    getAllIssuesApi()
      .then(res => setIssues(res.data))
      .catch(err => console.error("이슈 조회 실패:", err));
  }, []);

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-1 text-xs rounded bg-yellow-500 text-white">대기</span>;
      case "APPROVED":
        return <span className="px-2 py-1 text-xs rounded bg-green-500 text-white">승인</span>;
      case "REJECTED":
        return <span className="px-2 py-1 text-xs rounded bg-red-500 text-white">거절</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded bg-gray-500 text-white">{status}</span>;
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleString() : "-";

  // 승인/거절 버튼 클릭 핸들러
  const handleStatusChange = (issueId: number, status: "APPROVED" | "REJECTED") => {
    updateAdminIssueStatusApi({ issueId, status })
      .then(res => {
        // 상태 변경 후 issues 배열 업데이트
        setIssues(prev =>
          prev.map(issue => issue.id === issueId ? res.data : issue)
        );
      })
      .catch(err => console.error("상태 변경 실패:", err));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">승인 대기 이슈</h3>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
            <Plus className="w-4 h-4 mr-2" />
            이슈 생성
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center"> {/* 가운데 정렬 */}
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">제목</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">출처</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">생성일</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">승인 시간</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">거절 시간</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">AI 중요도</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {issues.map(issue => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white max-w-md">{issue.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      issue.source === '기사' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    }`}>{issue.source}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(issue.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(issue.approvedAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(issue.rejectedAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{issue.importance || '-'}</td>
                  <td className="px-6 py-4">
                    {issue.status === 'PENDING' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                          onClick={() => handleStatusChange(issue.id, "APPROVED")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          onClick={() => handleStatusChange(issue.id, "REJECTED")}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
