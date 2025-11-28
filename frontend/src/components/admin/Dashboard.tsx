import { useState, useEffect } from "react";
import { getAllAdminUsersApi } from "../../api/authApi";
import { Users, DollarSign, TrendingUp, MessageSquare, Search, Plus, Edit, Ban, Trash2 } from "lucide-react";
import { Avatar } from "../Avatar"; // 아바타 컴포넌트 가정
import { Button } from '../ui/button'; // 버튼 컴포넌트 가정

export function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 사용자 목록 API 호출
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllAdminUsersApi();
        setUsers(res.data);
        console.log("API 응답 데이터:", res.data); // ← 여기에 유저 정보가 나옵니다.
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 검색 적용
  const filteredUsers = users.filter(user =>
    user.loginId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-xl">활성</span>;
      case "INACTIVE":
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-xl">비활성</span>;
      case "BANNED":
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-xl">정지</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-xl">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-green-400 text-sm font-medium">+42</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{users.length.toLocaleString()}</div>
          <div className="text-sm text-gray-400">전체 회원</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <span className="text-green-400 text-sm font-medium">+45K</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {users.reduce((sum, u) => sum + (u.points || 0), 0).toLocaleString()}P
          </div>
          <div className="text-sm text-gray-400">총 포인트</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-green-400 text-sm font-medium">+12</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">156</div>
          <div className="text-sm text-gray-400">활성 마켓</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-pink-400" />
            <span className="text-green-400 text-sm font-medium">+89</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{users.filter(u => u.posts).length}</div>
          <div className="text-sm text-gray-400">커뮤니티 글</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">전체 사용자 목록</h3>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-1">
                검색 결과: <span className="text-white font-bold">{filteredUsers.length}</span>명
              </p>
            )}
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
            <Plus className="w-4 h-4 mr-2" />
            사용자 추가
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">사용자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">인증   이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">포인트</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">레벨</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">가입일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.loginId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          {user.avatarType && user.avatarVariant ? (
                            <Avatar type={user.avatarType} variant={user.avatarVariant} size={40} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.nickname}</div>
                          <div className="text-xs text-gray-400">@{user.loginId}</div>
                        </div>
                      </div>
                    </td>
                    {/* 인증 이메일 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>

                    {/* 유저 포인트 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">{user.points?.toLocaleString()}P</td>

                    {/* 유저 레벨 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-bold">Lv.{user.level}</td>

                    {/*  */}
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>검색 결과가 없습니다.</p>
                      <p className="text-sm mt-1">다른 검색어를 입력해보세요.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
