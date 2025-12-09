// RssFeeds.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { getAllAdminRssFeeds,
         collectSingleFeedApi,
         deleteFeedApi,
         updateAdminRssFeedApi,
         collectFeedsBySourceNameApi,
         collectAllFeedsApi } from '../../../api/adminAPI';
import toast from "react-hot-toast";
import EditRssFeedModal from './EditRssFeedModal';
import CreateRssFeedModal from './CreateRssFeedModal';

// -----------------------------
// RSS 피드 타입 정의 (✔ 정정 완료)
// -----------------------------
interface RssFeed {
  id: number;
  sourceName: string;
  url: string;
  categories: string[]; // ✔ 필드명 categories 로 통일
  articleCount: number;
  lastFetched: string;
  status: 'active' | 'inactive';
}

export const RssFeeds: React.FC = () => {
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([]);
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});
  const [selectedFeed, setSelectedFeed] = useState<RssFeed | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /**
   * 📌 RSS 피드 목록 가져오기
   */
  const fetchFeeds = async () => {
    try {
      const response = await getAllAdminRssFeeds();

      const feeds: RssFeed[] = response.data.map((feed: any) => ({
        id: feed.id,
        sourceName: feed.sourceName,
        url: feed.url,
        categories: feed.categories ?? [], // ✔ null-safe
        articleCount: feed.articleCount,
        lastFetched: feed.lastFetched,
        status: feed.status as 'active' | 'inactive',
      }));

      console.log(feeds)
      setRssFeeds(feeds);

      // 출처 그룹 접힘 상태 유지
      setCollapsedSources(prev => {
        const newCollapsed = { ...prev };
        feeds.forEach(feed => {
          if (!(feed.sourceName in newCollapsed)) newCollapsed[feed.sourceName] = false;
        });
        return newCollapsed;
      });

    } catch (err) {
      console.error(err);
      toast.error("RSS 피드 리스트 로딩 실패 😢");
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  /**
   * 📌 출처 그룹 접기/펼치기
   */
  const toggleCollapse = (source: string) => {
    setCollapsedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  /**
   * 📌 상태 표시 배지
   */
  const getStatusBadge = (status: 'active' | 'inactive') =>
    status === 'active'
      ? <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium">활성화</span>
      : <span className="px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 text-xs font-medium">비활성화</span>;

  /**
   * 📌 출처별 Grouping
   */
  const groupedFeeds = rssFeeds.reduce<Record<string, RssFeed[]>>((acc, feed) => {
    if (!acc[feed.sourceName]) acc[feed.sourceName] = [];
    acc[feed.sourceName].push(feed);
    return acc;
  }, {});
  
  /**
   * 🔹 RSS 피드 수집 공통 함수
   *
   * 설명:
   * - 단일 피드 또는 특정 출처(SourceName) 전체 피드를 수집할 때 사용
   * - 수집 전 confirm 창 표시
   * - 수집 진행/성공/실패 상태 toast 표시
   * - 수집 완료 후 피드 목록 갱신
   * - 백엔드가 messages: string[] 형태로 두 단계 메시지를 반환하면 각 단계별로 toast 표시
   * - react-hot-toast v2 기준으로 toast.update 대신 toast.dismiss + toast.success 사용
   *
   * @param label 수집 대상 표시 이름 (단일 피드: sourceName, 전체 피드: '전체')
   * @param apiCall 호출할 API 함수 (단일 피드: collectSingleFeedApi, SourceName 전체: collectFeedsBySourceNameApi, 전체 수집: collectAllFeedsApi)
   * @param isSingleFeed 단일 피드 수집 여부 (true: 단일 피드, false: 전체 또는 SourceName 기준)
   * @param categories 단일 피드일 경우 카테고리 표시용 (선택적)
   */
  const handleCollect = async (
    label: string,
    apiCall: () => Promise<any>,
    isSingleFeed: boolean = true,
    categories?: string[]
  ) => {
    // 단일 피드라면 카테고리 포함 표시
    const labelWithCategories = isSingleFeed && categories
      ? `${label} [${categories.join(", ")}]`
      : label;

    // 1️⃣ 사용자 확인
    const confirmCollect = window.confirm(
      `"${labelWithCategories}" ${isSingleFeed ? "피드를" : "소스의 활성화된 피드를 모두"} 수집하시겠습니까?`
    );
    if (!confirmCollect) return;

    // 2️⃣ Toast 로딩 표시
    const toastId = toast.loading("수집 중...");

    try {
      // 3️⃣ API 호출
      const response = await apiCall();
      const result = response.data; // CollectResponse(messages) 또는 BatchResult

      // 4️⃣ 메시지 처리
      if ("messages" in result && Array.isArray(result.messages)) {
        // 🔹 messages 배열 존재 시 각 단계별 toast 표시
        result.messages.forEach((msg: string, index: number) => {
          if (index === 0) {
            // 첫 번째 메시지: 로딩 toast 제거 후 성공 toast
            toast.dismiss(toastId);
            toast.success(msg, { duration: 3000 });
          } else {
            // 두 번째 이후 메시지: 새 toast로 표시
            setTimeout(() => {
              toast.success(msg, { duration: 3000 });
            }, 3500 * index); // index=1이면 3.5초 후, index=2이면 7초 후 등
          }
        });
      } else if ("message" in result) {
        // 🔹 단일 메시지 처리 (하위 호환)
        toast.dismiss(toastId);
        toast.success(result.message, { duration: 3000 });
      } else {
        // 🔹 BatchResult fallback 처리
        toast.dismiss(toastId);
        if (result.fetched === 0 && result.saved === 0 && result.skipped === 0) {
          toast.error(`⚠️ "${label}" 소스에는 활성화된 피드가 없거나 URL 접근 오류`, { duration: 3000 });
        } else {
          toast.success(`🔥 "${label}" 수집 완료 | 저장:${result.saved} | 스킵:${result.skipped} | 전체:${result.fetched}`, { duration: 3000 });
        }
      }

      // 5️⃣ 피드 목록 갱신
      fetchFeeds();

    } catch (err: any) {
      // 6️⃣ 예외 처리
      toast.dismiss(toastId);
      toast.error("수집 실패: " + (err.response?.data || err.message), { duration: 5000 });
      console.error(err);
    }
  };

  /**
   * 단일 피드 수집
   * - feed: 단일 피드 객체
   * - categories 포함 메시지 표시
   */
  const handleCollectFeed = (feed: RssFeed) =>
    handleCollect(feed.sourceName, () => collectSingleFeedApi(feed.id), true, feed.categories);

  /**
   * 특정 SourceName 기준 전체 수집
   * - source: 수집할 SourceName
   * - 단일 피드가 아니므로 isSingleFeed=false
   */
  const handleCollectSource = (source: string) =>
    handleCollect(source, () => collectFeedsBySourceNameApi(source), false);

  /**
   * 전체 Feed 수집
   * - 전체 활성화된 피드 수집
   * - isSingleFeed=false
   */
  const handleCollectAllFeeds = () =>
    handleCollect("전체", () => collectAllFeedsApi(), false);


  /**
   * 📌 RSS 피드 삭제 호출
   * - 활성화 상태인 피드는 먼저 비활성화 여부 확인
   * - 비활성화 상태에서 삭제 진행
   */
  const handleDelete = async (feed: RssFeed) => {
    try {
      // 1️⃣ 활성화 상태 확인
      if (feed.status === "active") {
        const confirmDeactivate = window.confirm(
          `"${feed.sourceName}" 피드는 활성화 상태입니다.\n삭제 전 비활성화하시겠습니까?`
        );
        if (!confirmDeactivate) return;

        // 2️⃣ 상태를 즉시 UI에 반영 (setState 사용)
        setRssFeeds(prevFeeds =>
          prevFeeds.map(f =>
            f.id === feed.id ? { ...f, status: 'inactive' } : f
          )
        );

        // 3️⃣ Toast 표시
        toast.success(`✅ "${feed.sourceName}" 피드를 비활성화했습니다.`, { duration: 3000 });

        // 4️⃣ 서버에 상태 변경 요청
        await updateAdminRssFeedApi(feed.id, { status: 'inactive' });

        // 5️⃣ 서버 동기화를 위해 피드 목록 갱신
        fetchFeeds();
      }

      // 6️⃣ 삭제 확인
      const confirmDelete = window.confirm(`"${feed.sourceName}" 피드를 삭제하시겠습니까?`);
      if (!confirmDelete) return;

      // 7️⃣ 삭제 요청 진행
      const toastId = toast.loading("삭제 중...");
      await deleteFeedApi(feed.id); // DELETE 요청

      // 8️⃣ 상태를 UI에서 바로 제거
      setRssFeeds(prevFeeds => prevFeeds.filter(f => f.id !== feed.id));

      // 9️⃣ toast 성공 메시지
      toast.success(`피드 삭제 완료: ${feed.sourceName}`, { id: toastId });

      // 🔟 서버 동기화 (필요 시 fetch)
      fetchFeeds();

    } catch (err: any) {
      toast.error("삭제 실패: " + (err.response?.data || err.message), { duration: 3000 });
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col"
             style={{ height: "calc(100vh - 64px)" }}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          {/* 좌측 제목 */}
          <h3 className="font-bold text-white text-lg md:text-xl">RSS 피드 목록</h3>

          {/* 우측 버튼 그룹 */}
          <div className="flex gap-2"> {/* gap-2로 버튼 간격 조절 */}
            {/* 전체 수집 버튼 */}
            <Button
              className="bg-green-600 hover:bg-green-700 text-white text-sm flex items-center"
              onClick={handleCollectAllFeeds}
            >
              <Download className="w-4 h-4 mr-1" /> 전체 수집
            </Button>

            {/* 피드 추가 버튼 */}
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm flex items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2"/> 피드 추가
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">출처</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">기사 수</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">마지막 수집</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {Object.entries(groupedFeeds).map(([source, feeds]) => {
                const isCollapsed = collapsedSources[source];

                return (
                  <React.Fragment key={source}>
                    <tr
                      className="bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => toggleCollapse(source)}
                    >
                      <td className="px-6 py-2 text-lg font-semibold text-white text-center">
                        {source}
                      </td>
                      <td >{isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleCollectSource(source); }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {!isCollapsed && feeds.map(feed => (
                      <tr key={feed.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"></td>

                        {/* ✔ 카테고리 배열 join */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {feed.categories.join(", ")}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{feed.url}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">{feed.articleCount}</td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            {feed.lastFetched?.slice(0, 19).replace('T', ' ') ?? '-'}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(feed.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2">

                            {/* 다운로드 버튼 */}
                            <button
                              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                              onClick={() => handleCollectFeed(feed)}
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* 수정 버튼 */}
                            <button
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                              onClick={() => setSelectedFeed(feed)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => handleDelete(feed)} // feed 객체를 전달
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
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
      {showCreateModal && (
        <CreateRssFeedModal
          onClose={() => setShowCreateModal(false)}
          onAddSuccess={() => {
            fetchFeeds(); // 목록 새로고침
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
