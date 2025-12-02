// RssFeeds.tsx
import { useState } from 'react';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';

// RSS 피드 타입 정의
interface RssFeed {
  id: number;
  name: string;
  url: string;
  category: string;
  itemCount: number;
  lastFetched: string;
  status: 'active' | 'inactive';
}

// 상태 배지 함수
const getStatusBadge = (status: 'active' | 'inactive') => {
  return status === 'active' ? (
    <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">활성</span>
  ) : (
    <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-medium">비활성</span>
  );
};

export const RssFeeds = () => {
  const [rssFeeds] = useState<RssFeed[]>([
    {
      id: 1,
      name: 'Example Feed',
      url: 'https://example.com/rss',
      category: 'Tech',
      itemCount: 12,
      lastFetched: '2025-12-01 12:34',
      status: 'active',
    },
  ]);

  return (
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
  );
};
