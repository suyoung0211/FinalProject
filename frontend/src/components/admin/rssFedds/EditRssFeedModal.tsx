import { useState } from "react";
import ReactDOM from "react-dom";
import { updateAdminRssFeedApi } from "../../../api/adminAPI"; // 실제 API 호출

interface Props {
  feedId: number;
  feedData: {
    id: number;
    sourceName: string;
    url: string;
    categories: string[]; // ✔ 문자열 배열로 변경
    status: "active" | "inactive";
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditRssFeedModal({
  feedId,
  feedData,
  onClose,
  onUpdate,
}: Props) {
  /**
   * 프론트 상태 관리
   * categoryNames는 문자열 배열로 관리
   */
  const [form, setForm] = useState({
    sourceName: feedData.sourceName,
    url: feedData.url,
    categoryNames: feedData.categories, // ✔ 변경 포인트
    status: feedData.status,
  });

  const [loading, setLoading] = useState(false);

  /**
   * 일반 입력 필드 변경 처리
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 저장 버튼 눌렀을 때 API 호출
   */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        sourceName: form.sourceName,
        url: form.url,
        status: form.status,
        categoryNames: form.categoryNames, // ✔ 백엔드에서 기대하는 이름
      };

      await updateAdminRssFeedApi(feedId, payload);

      onUpdate(); // 수정 후 리스트 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      console.error(err);
      alert("RSS 피드 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[40] bg-black/40" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={(e) => e.stopPropagation()}
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

            {/* 카테고리 입력 필드 */}
            <div>
              <label className="text-gray-200 text-sm font-medium">카테고리 (콤마 구분)</label>
              <input
                value={form.categoryNames.join(", ")} // 리스트 → 문자열
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryNames: e.target.value.split(",").map((v) => v.trim()), // 문자열 → 리스트
                  }))
                }
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            {/* 상태 처리 */}
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
