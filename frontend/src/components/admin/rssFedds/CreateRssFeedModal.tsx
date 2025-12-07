// CreateRssFeedModal.tsx
import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { createAdminRssFeed, getCategories } from "../../../api/adminAPI";

// Props 정의
interface Props {
  onClose: () => void;         // 모달 닫기 함수
  onAddSuccess: () => void;    // 성공 후 리스트 갱신 콜백
}

export default function CreateRssFeedModal({ onClose, onAddSuccess }: Props) {
  // 입력 상태 관리
  const [sourceName, setSourceName] = useState("");           // 피드 이름
  const [url, setUrl] = useState("");                         // RSS URL
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]); // 카테고리 목록
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);     // 선택된 카테고리 ID

  const modalRef = useRef<HTMLDivElement>(null); // 모달 DOM 참조 (클릭 이벤트용)

  // 카테고리 목록 가져오기
  useEffect(() => {
    getCategories()
      .then(res => {
        console.log("카테고리 데이터:", res.data);
        setCategories(res.data);
      })
      .catch(err => {
        console.error("카테고리 조회 실패:", err);
      });
  }, []);

  // 체크박스 선택 처리
  const handleCategorySelect = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id) // 이미 선택된 경우 제거
        : [...prev, id]                 // 선택되지 않은 경우 추가
    );
  };

  // 제출 처리
  const handleSubmit = async () => {
    try {
      await createAdminRssFeed({
        sourceName,
        url,
        categoryIds: selectedCategoryIds,
      });
      alert("RSS 피드가 추가되었습니다.");
      onAddSuccess();
      onClose();
    } catch (error) {
      alert("추가 실패. 입력값을 확인해주세요.");
      console.error(error);
    }
  };

  // React Portal 사용하여 body에 렌더링 (모달 레이어)
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[40] bg-black/30"  // 전체 배경, 반투명 검정
      onClick={onClose}                             // 배경 클릭 시 모달 닫기
    >
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={e => e.stopPropagation()}         // 모달 내부 클릭 시 이벤트 전파 방지
      >
        <div
          ref={modalRef}
          className="bg-white/10 border border-white/20 backdrop-blur-xl p-6 rounded-2xl w-96 shadow-2xl overflow-x-hidden overflow-y-auto max-h-[90vh]"
        >
          {/* 모달 제목 */}
          <h2 className="text-lg font-semibold mb-4 text-white">RSS 피드 추가</h2>

          {/* Source Name 입력 */}
          <input
            name="sourceName"
            placeholder="Source Name"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-3"
          />

          {/* RSS URL 입력 */}
          <input
            name="url"
            placeholder="RSS Feed URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-3"
          />

          {/* 카테고리 선택 영역 */}
          <div className="mb-3">
            <p className="font-medium mb-2 text-white text-base">카테고리 선택</p>

            {/* 카테고리 버튼 */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (!isSelected) {
                        setSelectedCategoryIds(prev => [...prev, cat.id]);
                      }
                    }}
                    className={`flex items-center px-4 py-2 rounded-full text-base transition
                      ${isSelected
                        ? "bg-purple-600 text-white cursor-default" // 선택됨
                        : "bg-white/10 text-white hover:bg-white/20" // 미선택
                      }`}
                  >
                    {cat.name}
                    {isSelected && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation(); // 버튼 클릭 이벤트 방지
                          setSelectedCategoryIds(prev =>
                            prev.filter(cid => cid !== cat.id)
                          );
                        }}
                        className="ml-2 w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-white font-bold text-base cursor-pointer leading-none -translate-y-px"
                      >
                        ×
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2">
            {/* 취소 버튼 */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition"
            >
              취소
            </button>

            {/* 저장 버튼 */}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
