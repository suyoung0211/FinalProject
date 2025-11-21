import { ArrowLeft, TrendingUp, Clock, DollarSign, Users, MessageCircle, Share2, Bookmark, ChevronDown, ExternalLink, Flame, Activity, Trophy, BarChart3, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MarketDetailPageProps {
  onBack: () => void;
  marketId?: string;
}

export function MarketDetailPage({ onBack, marketId }: MarketDetailPageProps) {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [selectedTab, setSelectedTab] = useState<'chart' | 'discussion' | 'info' | 'activity'>('chart');
  const [showVoteModal, setShowVoteModal] = useState<'yes' | 'no' | null>(null);
  const [voteComplete, setVoteComplete] = useState(false);

  // Mock data for the chart
  const chartData = [
    { date: '11/01', yes: 52, no: 48 },
    { date: '11/05', yes: 55, no: 45 },
    { date: '11/08', yes: 58, no: 42 },
    { date: '11/10', yes: 62, no: 38 },
    { date: '11/12', yes: 65, no: 35 },
    { date: '11/14', yes: 64, no: 36 },
    { date: '11/16', yes: 67, no: 33 },
    { date: '11/19', yes: 67, no: 33 },
  ];

  const market = {
    id: '1',
    question: '2025년 비트코인이 15만 달러를 돌파할까요?',
    description: '2025년 12월 31일 23:59:59 (UTC) 이전에 비트코인(BTC)의 가격이 어떤 주요 거래소에서든 $150,000 이상으로 기록되면 YES로 결정됩니다. 가격은 CoinMarketCap, CoinGecko 등의 주요 데이터 제공업체를 기준으로 합니다.',
    category: '크립토',
    yesPrice: 67,
    noPrice: 33,
    volume: '$2.4M',
    liquidity: '$890K',
    endDate: '2025년 12월 31일',
    participants: 3421,
    createdBy: 'crypto_whale',
    createdDate: '2024년 10월 15일',
  };

  const comments = [
    {
      id: '1',
      user: 'investor_kim',
      avatar: '👨‍💼',
      text: '반감기 효과와 ETF 유입을 고려하면 충분히 가능한 시나리오입니다.',
      likes: 42,
      time: '2시간 전',
      position: 'YES'
    },
    {
      id: '2',
      user: 'market_analyst',
      avatar: '📊',
      text: '15만불은 너무 낙관적입니다. 10만불 선에서 강한 저항이 예상됩니다.',
      likes: 28,
      time: '5시간 전',
      position: 'NO'
    },
    {
      id: '3',
      user: 'hodler_2017',
      avatar: '💎',
      text: '2024년 패턴을 보면 2025년 상반기에 이미 도달할 수 있을 것 같습니다.',
      likes: 35,
      time: '8시간 전',
      position: 'YES'
    },
  ];

  const relatedMarkets = [
    {
      id: '2',
      question: '이더리움이 비트코인을 시가총액으로 추월할까요?',
      yesPrice: 23,
      volume: '$1.5M',
    },
    {
      id: '3',
      question: '2025년 암호화폐 규제가 강화될까요?',
      yesPrice: 71,
      volume: '$620K',
    },
  ];

  const amounts = [50, 100, 250, 500, 1000];

  const recentActivity = [
    {
      id: '1',
      user: 'whale_trader',
      action: 'YES',
      amount: 5000,
      time: '방금 전',
      avatar: '🐋',
    },
    {
      id: '2',
      user: 'smart_money',
      action: 'YES',
      amount: 2500,
      time: '5분 전',
      avatar: '🧠',
    },
    {
      id: '3',
      user: 'bear_market',
      action: 'NO',
      amount: 1800,
      time: '12분 전',
      avatar: '🐻',
    },
    {
      id: '4',
      user: 'crypto_bull',
      action: 'YES',
      amount: 3200,
      time: '25분 전',
      avatar: '🐂',
    },
    {
      id: '5',
      user: 'day_trader',
      action: 'NO',
      amount: 750,
      time: '1시간 전',
      avatar: '📈',
    },
  ];

  const topTraders = [
    {
      id: '1',
      user: 'whale_investor',
      avatar: '🐋',
      position: 'YES',
      amount: 25000,
      profit: '+12,500',
    },
    {
      id: '2',
      user: 'crypto_king',
      avatar: '👑',
      position: 'YES',
      amount: 18500,
      profit: '+8,880',
    },
    {
      id: '3',
      user: 'market_maker',
      avatar: '💼',
      position: 'NO',
      amount: 15200,
      profit: '+4,560',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                뒤로
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Mak' gora</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Info */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
                    <span className="text-sm text-purple-300 font-medium">{market.category}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                    {market.question}
                  </h1>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {market.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">거래량</div>
                  <div className="text-white font-bold text-lg">{market.volume}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">유동성</div>
                  <div className="text-white font-bold text-lg">{market.liquidity}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">참여자</div>
                  <div className="text-white font-bold text-lg">{market.participants.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">마감일</div>
                  <div className="text-white font-bold text-sm">{market.endDate}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setSelectedTab('chart')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === 'chart'
                      ? 'bg-purple-600/30 text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  차트
                </button>
                <button
                  onClick={() => setSelectedTab('discussion')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === 'discussion'
                      ? 'bg-purple-600/30 text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  토론
                </button>
                <button
                  onClick={() => setSelectedTab('info')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === 'info'
                      ? 'bg-purple-600/30 text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  정보
                </button>
                <button
                  onClick={() => setSelectedTab('activity')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    selectedTab === 'activity'
                      ? 'bg-purple-600/30 text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  활동
                </button>
              </div>

              <div className="p-6">
                {selectedTab === 'chart' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">확률 추이</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-400">YES</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm text-gray-400">NO</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorNo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="yes"
                              stroke="#22c55e"
                              strokeWidth={2}
                              fill="url(#colorYes)"
                            />
                            <Area
                              type="monotone"
                              dataKey="no"
                              stroke="#ef4444"
                              strokeWidth={2}
                              fill="url(#colorNo)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Comments Section under Chart */}
                    <div className="mt-8 space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        댓글 ({comments.length})
                      </h3>
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{comment.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium">{comment.user}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  comment.position === 'YES'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {comment.position}
                                </span>
                                <span className="text-gray-500 text-sm">{comment.time}</span>
                              </div>
                              <p className="text-gray-300 mb-3">{comment.text}</p>
                              <button className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                                👍 {comment.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4">
                        <textarea
                          placeholder="의견을 공유해주세요..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            댓글 작성
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'discussion' && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{comment.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-medium">{comment.user}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                comment.position === 'YES'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {comment.position}
                              </span>
                              <span className="text-gray-500 text-sm">{comment.time}</span>
                            </div>
                            <p className="text-gray-300 mb-3">{comment.text}</p>
                            <button className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                              👍 {comment.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4">
                      <textarea
                        placeholder="의견을 공유해주세요..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          댓글 작성
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'info' && (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">생성자</div>
                      <div className="text-white font-medium">{market.createdBy}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">생성일</div>
                      <div className="text-white font-medium">{market.createdDate}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">해결 기준</div>
                      <div className="text-white">
                        CoinMarketCap, CoinGecko 등의 주요 데이터 제공업체를 기준으로 합니다.
                        공식 데이터는 UTC 기준 2025년 12월 31일 23:59:59에 확정됩니다.
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-2">규칙</div>
                      <ul className="text-white space-y-2 text-sm">
                        <li>• 투표는 마감일까지 언제든 변경 가능합니다</li>
                        <li>• 결과는 신뢰할 수 있는 제3자 데이터를 기준으로 결정됩니다</li>
                        <li>• 분쟁 발생 시 커뮤니티 투표로 해결됩니다</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTab === 'activity' && (
                  <div className="space-y-6">
                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        최근 거래 활동
                      </h3>
                      <div className="space-y-2">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{activity.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">{activity.user}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    activity.action === 'YES'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {activity.action}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">${activity.amount.toLocaleString()} 투표</span>
                                  <span className="text-xs text-gray-500">{activity.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Traders */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        상위 투표자
                      </h3>
                      <div className="space-y-2">
                        {topTraders.map((trader, index) => (
                          <div key={trader.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="text-2xl">{trader.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">{trader.user}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    trader.position === 'YES'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {trader.position}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-400">${trader.amount.toLocaleString()}</span>
                                  <span className="text-sm text-green-400 font-medium">{trader.profit}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Statistics */}
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        시장 통계
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">24h 거래량</div>
                          <div className="text-white font-bold text-lg">$456K</div>
                          <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +24.5%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">24h 참여자</div>
                          <div className="text-white font-bold text-lg">+248</div>
                          <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12.3%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">YES 평균 투표액</div>
                          <div className="text-white font-bold text-lg">$1,245</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="text-gray-400 text-sm mb-1">NO 평균 투표액</div>
                          <div className="text-white font-bold text-lg">$892</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Vote Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vote Card */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4">투표하기</h3>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowVoteModal('yes')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-green-500/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium mb-1">YES</div>
                      <div className="text-2xl font-bold">{market.yesPrice}%</div>
                    </div>
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      ✅
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowVoteModal('no')}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-red-500/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium mb-1">NO</div>
                      <div className="text-2xl font-bold">{market.noPrice}%</div>
                    </div>
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      ❌
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-gray-400 text-sm">배팅 포인트</label>
                <div className="grid grid-cols-3 gap-2">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedAmount === amount
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {amount}pt
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="직접 입력"
                />
              </div>

              <div className="bg-white/5 rounded-lg p-3 mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>예상 수익률</span>
                  <span className="text-green-400 font-medium">+{(selectedAmount * 0.48).toFixed(0)}pt</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>수수료</span>
                  <span>{(selectedAmount * 0.02).toFixed(0)}pt</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                투표는 언제든 변경할 수 있으며, 마감 시 결과에 따라 정산됩니다.
              </div>
            </div>

            {/* Related Markets */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">관련 이슈</h3>
              <div className="space-y-3">
                {relatedMarkets.map((rm) => (
                  <button
                    key={rm.id}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="text-white text-sm mb-2 line-clamp-2">{rm.question}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">{rm.yesPrice}%</span>
                      <span className="text-gray-400 text-xs">{rm.volume}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              {showVoteModal === 'yes' ? 'YES' : 'NO'} 투표 확인
            </h2>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="text-gray-400 text-sm mb-2">배팅 포인트</div>
              <div className="text-white text-3xl font-bold mb-4">{selectedAmount}pt</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">현재 확률</span>
                  <span className="text-white font-medium">
                    {showVoteModal === 'yes' ? market.yesPrice : market.noPrice}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">예상 수익</span>
                  <span className="text-green-400 font-medium">
                    +{(selectedAmount * 0.48).toFixed(0)}pt
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowVoteModal(null)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  setShowVoteModal(null);
                  setVoteComplete(true);
                }}
                className={`flex-1 ${
                  showVoteModal === 'yes'
                    ? 'bg-gradient-to-r from-green-600 to-green-500'
                    : 'bg-gradient-to-r from-red-600 to-red-500'
                }`}
              >
                투표 확정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vote Complete Modal */}
      {voteComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              투표가 완료되었습니다! 🎉
            </h2>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="text-gray-400 text-sm mb-2">배팅 포인트</div>
              <div className="text-white text-3xl font-bold mb-4">{selectedAmount}pt</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">예상 수익</span>
                  <span className="text-green-400 font-medium">
                    +{(selectedAmount * 0.48).toFixed(0)}pt
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setVoteComplete(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}