// Dashboard.tsx
import { Users, DollarSign, TrendingUp, MessageSquare } from 'lucide-react';
import { Avatar } from '../Avatar';

export function Dashboard() {
  const users = [
    { id: 1, name: '홍길동', email: 'hong@test.com', points: 1500, level: 5, status: '활성' },
    { id: 2, name: '김철수', email: 'kim@test.com', points: 800, level: 3, status: '정지' },
  ];

  const getStatusBadge = (status: string) => {
    const color = status === '활성' ? 'bg-green-500' : 'bg-red-500';
    return <span className={`px-2 py-1 text-xs rounded ${color} text-white`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-green-400 text-sm font-medium">+42</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">8,567</div>
          <div className="text-sm text-gray-400">전체 회원</div>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <span className="text-green-400 text-sm font-medium">+120</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">3,200</div>
          <div className="text-sm text-gray-400">포인트 총합</div>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-pink-400" />
            <span className="text-green-400 text-sm font-medium">+5%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">120</div>
          <div className="text-sm text-gray-400">오늘 신규 가입</div>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-purple-400" />
            <span className="text-green-400 text-sm font-medium">+8</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">45</div>
          <div className="text-sm text-gray-400">활성 커뮤니티 글</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">사용자</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">포인트</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">레벨</th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Avatar name={user.name} />
                  {user.name}
                </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.points}</td>
                <td className="px-6 py-4">{user.level}</td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
