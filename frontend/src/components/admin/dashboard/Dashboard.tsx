import { useState, useEffect } from "react";
import { getAllAdminUsersApi } from "../../../api/adminAPI";
import { Users, DollarSign, TrendingUp, MessageSquare, Search, Plus, Edit, Ban, Trash2 } from "lucide-react";
import { Avatar } from "../../Avatar";
import { Button } from '../../ui/button';
import CreateAdminModal from "./CreateAdminModal";
import UserDetailModal from "./UserDetailModal";
import UserActionButtons from "./UserActionButtons";
import EditUserModal from "./EditUserModal";

export function Dashboard() {
  // 전체 유저 데이터
  const [users, setUsers] = useState<any[]>([]);

  // 로딩
  const [loading, setLoading] = useState(true);
  
  // 모달
  const [modal, setModal] = useState<ModalType>({ type: null });

  // 검색 
  const [searchQuery, setSearchQuery] = useState("");             // 실제 검색 기준
  const [tempQuery, setTempQuery] = useState("");                 // 입력창 상태

  
  // 🔹 검색 실행 (엔터 또는 돋보기 클릭)
  const handleSearch = () => {
    setSearchQuery(tempQuery.trim()); // searchQuery 업데이트
  };

  // 🔹 렌더링 시점에서 필터링 + 정렬
  const filteredUsers = (searchQuery === ""
    ? users // 검색어 없으면 전체 사용자
    : users.filter(user =>
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      )
  ).sort((a, b) => {
    // role 우선순위 정의
    const rolePriority: { [key: string]: number } = {
      "SUPER_ADMIN": 0, // 최고관리자
      "ADMIN": 1,       // 관리자
      "USER": 2         // 일반 유저
    };

    const aPriority = rolePriority[a.role] ?? 99; // role 정의 안 되어 있으면 마지막
    const bPriority = rolePriority[b.role] ?? 99;

    return aPriority - bPriority; // 낮은 순서가 먼저
  });
      

  // 모달 관리 타입
  type ModalType =
    | { type: "CREATE_ADMIN" }
    | { type: "USER_DETAIL"; user: any }
    | { type: "EDIT_USER"; user: any }
    | { type: null };

  const openModal = (type: ModalType["type"], user?: any) => {
    if (modal.type) return; // 관리자 모달 열려있으면 무시
    setModal({ type, user });
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllAdminUsersApi();
      setUsers(res.data);
      console.log("API 응답 데이터:", res.data);
    } catch (err) { 
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-xl">활성화</span>;
      case "INACTIVE":
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-xl">비활성화</span>;
      case "DELETED":
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-xl">정지</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-xl">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 flex-1 overflow-auto p-6 relative">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            {users
              .filter(u => u.role !== "ADMIN" && u.role !== "SUPER_ADMIN") // ADMIN/슈퍼어드민 제외
              .reduce((sum, u) => sum + (u.points || 0), 0)
              .toLocaleString()}P
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

      {/* 🔹 검색 영역 - 엔터/아이콘 클릭으로 검색 */}
      <div className="p-6 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-white text-lg md:text-xl">사용자 검색</h3>

        <div className="w-full md:w-64 relative flex items-center">
          <input
            type="text"
            value={tempQuery}
            onChange={(e) => setTempQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(); // 엔터 눌렀을 때 검색
            }}
            placeholder="닉네임으로 검색..."
            className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-colors"
          />

          {/* 돋보기 아이콘 - 클릭 시 검색 */}
          <Search
            className="absolute right-3 w-5 h-5 text-gray-400 cursor-pointer hover:text-white"
            onClick={handleSearch}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 pr-14 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg md:text-xl">전체 사용자 목록</h3>
          </div>

          {/* 관리자 추가 버튼 */}
          <div>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm"
              onClick={() => openModal("CREATE_ADMIN")}
            >
              <Plus className="w-4 h-4 mr-2" />
              관리자 추가
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">사용자</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">인증 이메일</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">포인트</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">레벨</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">가입일</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr
                    key={user.loginId}
                    className="hover:bg-white/5 transition-colors"
                    onClick={() => openModal("USER_DETAIL", user)}
                  >
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
                          <div className="text-xs text-gray-400">@{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">{user.verificationEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-400 font-bold">{user.points?.toLocaleString()}P</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-purple-400 font-bold">Lv.{user.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400">{new Date(user.createdAt).toISOString().split('T')[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <UserActionButtons
                        userId={user.id}        // user.id 반드시 있어야 함
                        userData={user}         // 수정 시 초기값
                        onUpdate={fetchUsers}   // 테이블 갱신 함수
                        onEdit={() => openModal("EDIT_USER", user)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>사용자가 없습니다.</p>
                      <p className="text-sm mt-1">다른 검색어를 입력해보세요.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 관리자 생성 */}
      {modal.type === "CREATE_ADMIN" && (
        <CreateAdminModal
          open={true}
          onClose={() => setModal({ type: null })}
          onUpdate={fetchUsers}
        />
      )}

      {/* 유저 상세 */}
      {modal.type === "USER_DETAIL" && modal.user && (
        <UserDetailModal
          open={true}
          user={modal.user}
          onClose={() => setModal({ type: null })}
        />
      )}

      {/* 유저 정보 수정 */}
      {modal.type === "EDIT_USER" && modal.user && (
        <EditUserModal
          userId={modal.user.id}
          userData={modal.user}
          onClose={() => setModal({ type: null })}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}
