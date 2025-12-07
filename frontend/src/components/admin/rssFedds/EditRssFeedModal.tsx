import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { updateAdminRssFeedApi, getCategories } from "../../../api/adminAPI"; // API 호출

interface Props {
  feedId: number;
  feedData: {
    id: number;
    sourceName: string;
    url: string;
    categories: string[]; // 문자열 배열
    status: "active" | "inactive";
  };
  onClose: () => void;
  onUpdate: () => void;
}

interface Category {
  id: number;
  name: string;
}

export default function EditRssFeedModal({ feedId, feedData, onClose, onUpdate }: Props) {
  // --- 모달 내 입력 상태 ---
  const [form, setForm] = useState({
    sourceName: feedData.sourceName,
    url: feedData.url,
    categoryNames: feedData.categories, // 선택된 카테고리 이름 배열
    status: feedData.status,
  });

  const [categories, setCategories] = useState<Category[]>([]); // 전체 카테고리 목록
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); // 선택된 카테고리 ID 배열
  const [loading, setLoading] = useState(false);

  // --- 초기 카테고리 데이터 가져오기 ---
  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data);
        // feedData.categories 이름과 일치하는 카테고리 ID를 초기 선택
        const initialSelectedIds = res.data
          .filter((c: Category) => feedData.categories.includes(c.name))
          .map((c: Category) => c.id);
        setSelectedCategoryIds(initialSelectedIds);
      })
      .catch((err) => console.error("카테고리 조회 실패:", err));
  }, [feedData.categories]);

  // --- 입력 필드 변경 처리 ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- 카테고리 선택/삭제 처리 ---
  const handleCategorySelect = (id: number) => {
    if (!selectedCategoryIds.includes(id)) {
      setSelectedCategoryIds((prev) => [...prev, id]);
    }
  };

  const handleCategoryRemove = (id: number) => {
    setSelectedCategoryIds((prev) => prev.filter((cid) => cid !== id));
  };

  // 선택된 ID를 form.categoryNames 배열로 동기화
  useEffect(() => {
    const selectedNames = categories
      .filter((c) => selectedCategoryIds.includes(c.id))
      .map((c) => c.name);
    setForm((prev) => ({ ...prev, categoryNames: selectedNames }));
  }, [selectedCategoryIds, categories]);

  // --- 저장 버튼 ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateAdminRssFeedApi(feedId, {
        sourceName: form.sourceName,
        url: form.url,
        status: form.status,
        categoryNames: form.categoryNames,
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert("RSS 피드 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 모달 렌더 ---
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[40] bg-black/40" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫히지 않도록
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 w-[420px] shadow-2xl animate-scaleIn">
          <h2 className="text-white text-lg font-semibold mb-5 border-b border-white/10 pb-3">
            RSS 피드 수정
          </h2>

          <div className="space-y-3">
            {/* 출처명 */}
            <div>
              <label className="text-gray-200 text-sm font-medium">출처 이름</label>
              <input
                name="sourceName"
                value={form.sourceName}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            {/* URL */}
            <div>
              <label className="text-gray-200 text-sm font-medium">URL</label>
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label className="text-gray-200 text-sm font-medium mb-2 block">
                카테고리 선택
              </label>

              {/* 버튼형 카테고리 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`flex items-center px-4 py-2 rounded-full text-base transition
                        ${isSelected
                          ? "bg-purple-600 text-white cursor-default"
                          : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                    >
                      {cat.name}
                      {isSelected && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryRemove(cat.id);
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

            {/* 상태 */}
            <div>
              <label className="text-gray-200 text-sm font-medium">상태</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              >
                <option value="active">활성화</option>
                <option value="inactive">비활성화</option>
              </select>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white border border-white/20 hover:bg-white/10 transition"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
            >
              {loading ? "저장중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
