import { ArrowLeft, Shield, Users, Rss, FileCheck, Vote, MessageSquare, ShoppingBag, FileText, BarChart3, Search, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Eye, Ban } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CreateVoteModal } from '../components/CreateVoteModal';

interface AdminPageProps {
  onBack: () => void;
  currentUser?: {
    username: string;
    name: string;
    avatarType?: 'male' | 'female';
    avatarVariant?: number;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  points: number;
  level: number;
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
}

interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  lastFetched: string;
  status: 'active' | 'inactive';
  itemCount: number;
}

interface Issue {
  id: string;
  title: string;
  category: string;
  source: 'rss' | 'community';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  author?: string;
}

interface VoteItem {
  id: string;
  question: string;
  category: string;
  status: 'active' | 'closed' | 'pending';
  totalVolume: number;
  participants: number;
  yesVotes: number;
  noVotes: number;
  endDate: string;
}

interface CommunityPost {
  id: string;
  title: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
  status: 'approved' | 'pending' | 'reported';
  createdAt: string;
}

interface StoreItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sold: number;
  status: 'available' | 'soldout';
}

interface AdminLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export function AdminPage({ onBack, currentUser }: AdminPageProps) {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'rss-feeds' | 'issues' | 'votes' | 'community' | 'store' | 'logs'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  // Sample data
  const users: User[] = [
    { id: '1', username: 'crypto_master', name: '크립토마스터', email: 'crypto@example.com', points: 14580, level: 15, status: 'active', joinDate: '2024-10-15', avatarType: 'male', avatarVariant: 2 },
    { id: '2', username: 'trend_hunter', name: '트렌드헌터', email: 'trend@example.com', points: 13920, level: 14, status: 'active', joinDate: '2024-09-01', avatarType: 'female', avatarVariant: 2 },
    { id: '3', username: 'spammer_user', name: '스패머', email: 'spam@example.com', points: 1200, level: 3, status: 'suspended', joinDate: '2024-11-20', avatarType: 'male', avatarVariant: 1 },
  ];

  const rssFeeds: RssFeed[] = [
    { id: '1', name: 'CNN Tech', url: 'https://rss.cnn.com/tech', category: 'business', lastFetched: '5분 전', status: 'active', itemCount: 156 },
    { id: '2', name: 'CoinDesk', url: 'https://coindesk.com/rss', category: 'crypto', lastFetched: '10분 전', status: 'active', itemCount: 234 },
    { id: '3', name: 'Reuters Politics', url: 'https://reuters.com/politics/rss', category: 'politics', lastFetched: '1시간 전', status: 'inactive', itemCount: 89 },
  ];

  const issues: Issue[] = [
    { id: '1', title: '2025년 비트코인이 15만 달러를 돌파할까요?', category: 'crypto', source: 'rss', status: 'pending', createdAt: '10분 전' },
    { id: '2', title: 'AI가 2025년 내에 의사 면허 시험을 통과할까요?', category: 'business', source: 'community', status: 'pending', createdAt: '30분 전', author: 'ai_enthusiast' },
    { id: '3', title: '다음 대선에서 여당이 승리할까요?', category: 'politics', source: 'rss', status: 'approved', createdAt: '1시간 전' },
  ];

  const votes: VoteItem[] = [
    { id: '1', question: '2025년 비트코인이 15만 달러를 돌파할까요?', category: 'crypto', status: 'active', totalVolume: 125000, participants: 456, yesVotes: 78, noVotes: 22, endDate: '2025-12-31' },
    { id: '2', question: '다음 대선에서 여당이 승리할까요?', category: 'politics', status: 'active', totalVolume: 98000, participants: 389, yesVotes: 45, noVotes: 55, endDate: '2027-03-09' },
    { id: '3', question: 'AI가 2025년 내에 의사 면허 시험을 통과할까요?', category: 'business', status: 'pending', totalVolume: 45000, participants: 234, yesVotes: 82, noVotes: 18, endDate: '2025-12-31' },
  ];

  const communityPosts: CommunityPost[] = [
    { id: '1', title: '비트코인 15만 달러 돌파 예측 - 상세 분석', author: 'crypto_analyst', category: 'prediction', likes: 287, comments: 89, status: 'approved', createdAt: '2시간 전' },
    { id: '2', title: '부적절한 광고성 게시글', author: 'spammer_user', category: 'free', likes: 2, comments: 5, status: 'reported', createdAt: '1시간 전' },
    { id: '3', title: '초보자를 위한 포인트 배팅 전략 가이드', author: 'strategy_master', category: 'strategy', likes: 342, comments: 124, status: 'approved', createdAt: '5시간 전' },
  ];

  const storeItems: StoreItem[] = [
    { id: '1', name: '프리미엄 아바타 팩', price: 500, category: 'avatar', stock: 100, sold: 234, status: 'available' },
    { id: '2', name: '포인트 부스터 (2배)', price: 1000, category: 'boost', stock: 50, sold: 189, status: 'available' },
    { id: '3', name: '레전더리 뱃지', price: 2000, category: 'badge', stock: 0, sold: 56, status: 'soldout' },
  ];

  const adminLogs: AdminLog[] = [
    { id: '1', admin: 'admin', action: '사용자 정지', target: 'spammer_user', timestamp: '5분 전', details: '스팸 게시글 작성으로 인한 정지' },
    { id: '2', admin: 'admin', action: '이슈 승인', target: '비트코인 15만 달러 돌파', timestamp: '10분 전', details: 'RSS 피드에서 자동 생성된 이슈 승인' },
    { id: '3', admin: 'admin', action: '게시글 삭제', target: '부적절한 광고성 게시글', timestamp: '15분 전', details: '커뮤니티 가이드라인 위반' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium">활성</span>;
      case 'suspended':
        return <span className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-medium">정지</span>;
      case 'banned':
        return <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">차단</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium">대기</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium">승인</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">거절</span>;
      case 'closed':
        return <span className="px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-medium">종료</span>;
      case 'reported':
        return <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">신고됨</span>;
      case 'inactive':
        return <span className="px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-medium">비활성</span>;
      case 'available':
        return <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium">판매중</span>;
      case 'soldout':
        return <span className="px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-medium">품절</span>;
      default:
        return null;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3, subtitle: '회원 관리' },
    { id: 'rss-feeds', label: 'RSS 피드', icon: Rss, subtitle: '피드 목록' },
    { id: 'issues', label: '이슈 관리', icon: FileCheck, subtitle: '승인 대기 이슈' },
    { id: 'votes', label: '투표 관리', icon: Vote, subtitle: '투표 생성/관리' },
    { id: 'community', label: '커뮤니티', icon: MessageSquare, subtitle: '게시글/댓글' },
    { id: 'store', label: '상점 관리', icon: ShoppingBag, subtitle: '아이템 관리' },
    { id: 'logs', label: '활동 로그', icon: FileText, subtitle: '관리자 활동' },
  ] as const;

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
        onCreate={(voteData) => {
          console.log('New vote created:', voteData);
          // TODO: 실제로는 백엔드로 데이터를 전송해야 합니다
          alert(`투표가 생성되었습니다!\n질문: ${voteData.question}\n카테고리: ${voteData.category}\n종료일: ${voteData.endDate}`);
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-xl font-bold text-white">관리자</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeMenu === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${activeMenu === item.id ? 'text-purple-200' : 'text-gray-500'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            {currentUser?.avatarType && currentUser?.avatarVariant ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Avatar type={currentUser.avatarType} variant={currentUser.avatarVariant} size={40} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-white">{currentUser?.name || 'Admin'}</div>
              <div className="text-xs text-gray-400">@{currentUser?.username || 'admin'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-slate-950/30 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {menuItems.find(item => item.id === activeMenu)?.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-64"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard / Users Management */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-400" />
                    <span className="text-green-400 text-sm font-medium">+42</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">8,567</div>
                  <div className="text-sm text-gray-400">전체 회원</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                    <span className="text-green-400 text-sm font-medium">+45K</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">12.4M</div>
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
                  <div className="text-3xl font-bold text-white mb-1">1,234</div>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">이메일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">포인트</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">레벨</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">가입일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors">
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
                                  <div className="text-sm font-medium text-white">{user.name}</div>
                                  <div className="text-xs text-gray-400">@{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">{user.points.toLocaleString()}P</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-bold">Lv.{user.level}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.joinDate}</td>
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
          )}

          {/* RSS Feeds */}
          {activeMenu === 'rss-feeds' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-white">RSS 피드 목록</h3>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    피드 추가
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">피드명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">아이템 수</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">마지막 수집</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rssFeeds.map((feed) => (
                        <tr key={feed.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{feed.name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{feed.url}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                              {feed.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{feed.itemCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              {feed.lastFetched}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(feed.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Issues */}
          {activeMenu === 'issues' && (
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
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">제목</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">출처</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">작성자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">생성일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {issues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white max-w-md">{issue.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                              {issue.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              issue.source === 'rss' 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                            }`}>
                              {issue.source === 'rss' ? 'RSS' : '커뮤니티'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {issue.author || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(issue.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{issue.createdAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {issue.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
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
          )}

          {/* Votes */}
          {activeMenu === 'votes' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-white">투표 목록</h3>
                  <Button 
                    onClick={() => setShowCreateVoteModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    투표 생성
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">질문</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">총 거래량</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">참여자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">YES/NO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {votes.map((vote) => (
                        <tr key={vote.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white max-w-md">{vote.question}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                              {vote.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">
                            {vote.totalVolume.toLocaleString()}P
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{vote.participants}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-400 font-bold">{vote.yesVotes}%</span>
                              <span className="text-gray-500">/</span>
                              <span className="text-red-400 font-bold">{vote.noVotes}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(vote.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Community */}
          {activeMenu === 'community' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-bold text-white">게시글 관리</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">제목</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">작성자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">좋아요</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">댓글</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {communityPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white max-w-md">{post.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">@{post.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                              {post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-400 font-bold">{post.likes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">{post.comments}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(post.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Store */}
          {activeMenu === 'store' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-white">아이템 관리</h3>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    아이템 추가
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">아이템명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">가격</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">재고</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">판매량</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {storeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-bold">{item.price.toLocaleString()}P</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{item.stock}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">{item.sold}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {activeMenu === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-bold text-white">Admin Actions 로그</h3>
                </div>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-white">{log.admin}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{log.target}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">{log.details}</td>
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
          )}
        </div>
      </main>
      </div>
    </>
  );
}