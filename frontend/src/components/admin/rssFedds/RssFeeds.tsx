// RssFeeds.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { getAllAdminRssFeeds } from '../../../api/adminAPI';
import EditRssFeedModal from './EditUserModal';

// -----------------------------
// RSS 피드 타입 정의
// -----------------------------
interface RssFeed {
  id: number;
  sourceName: string;          // 출처 이름
  url: string;           // 피드 URL
  category: string;      // 카테고리 (쉼표로 연결된 문자열)
  articleCount: number;  // 기사 수
  lastFetched: string;   // 마지막 수집 시간 (ISO 문자열)
  status: 'active' | 'inactive'; // 활성화 상태
}

// -----------------------------
// RssFeeds 컴포넌트
// -----------------------------
export const RssFeeds: React.FC = () => {
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});
  const [selectedFeed, setSelectedFeed] = useState<RssFeed | null>(null);

  // -----------------------------
  // API 호출 및 데이터 매핑
  // -----------------------------
  const fetchFeeds = async () => {
    try {
      const response = await getAllAdminRssFeeds();

      // 서버 DTO -> 프론트 매핑
      const feeds: RssFeed[] = response.data.map((feed: any) => ({
        id: feed.id,
        sourceName: feed.sourceName,
        url: feed.url,
        category: Array.from(feed.categories).join(', '),
        articleCount: feed.articleCount,
        lastFetched: feed.lastFetched,
        status: feed.status as 'active' | 'inactive',
      }));
      console.log(feeds)
      setRssFeeds(feeds);

      // 기존 접힘 상태 유지 + 새로 추가된 출처는 false로 초기화
      setCollapsedSources(prev => {
        const newCollapsed = { ...prev };
        feeds.forEach(feed => {
          if (!(feed.sourceName in newCollapsed)) newCollapsed[feed.sourceName] = false;
        });
        return newCollapsed;
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  // -----------------------------
  // 출처 접기/펼치기 토글
  // -----------------------------
  const toggleCollapse = (source: string) => {
    setCollapsedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  // -----------------------------
  // 상태 배지
  // -----------------------------
  const getStatusBadge = (status: 'active' | 'inactive') => (
    status === 'active'
      ? <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">활성화</span>
      : <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-medium">비활성화</span>
  );

  // -----------------------------
  // 출처별 그룹화
  // -----------------------------
  const groupedFeeds = rssFeeds.reduce<Record<string, RssFeed[]>>((acc, feed) => {
    if (!acc[feed.sourceName]) acc[feed.sourceName] = [];
    acc[feed.sourceName].push(feed);
    return acc;
  }, {});

  // -----------------------------
  // JSX 렌더링
  // -----------------------------
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">RSS 피드 목록</h3>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
            <Plus className="w-4 h-4 mr-2" />
            피드 추가
          </Button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* 헤더 */}
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">출처</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">기사 수</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">마지막 수집</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>

            {/* 바디 */}
            <tbody className="divide-y divide-white/5">
              {Object.entries(groupedFeeds).map(([source, feeds]) => {
                const isCollapsed = collapsedSources[source]; // 현재 접힘 상태
                return (
                  <React.Fragment key={source}>
                    {/* 출처 행 */}
                    <tr 
                      className="bg-white/10 cursor-pointer hover:bg-white/20 transition-colors" 
                      onClick={() => toggleCollapse(source)}
                    >
                      <td className="px-6 py-2 text-lg font-semibold text-white flex justify-between items-center" colSpan={7}>
                        {source}
                        {/* 접힘/펼침 아이콘 */}
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    {/* 피드별 행: 접힌 경우 숨김 */}
                    {!isCollapsed && feeds.map((feed) => (
                      <tr key={feed.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium">
                            {feed.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{feed.url}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">{feed.articleCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            {feed.lastFetched.slice(0, 19).replace('T', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(feed.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                              onClick={() => setSelectedFeed(feed)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedFeed && (
        <EditRssFeedModal
          feedId={selectedFeed.id}
          feedData={selectedFeed}
          onClose={() => setSelectedFeed(null)}
          onUpdate={fetchFeeds}
        />
      )}
    </div>
  );
};
