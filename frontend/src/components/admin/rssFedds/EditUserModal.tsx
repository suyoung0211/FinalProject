import { useState } from "react";
import ReactDOM from "react-dom";
import { updateAdminRssFeedApi } from "../../../api/adminAPI"; // 실제 API로 교체

interface Props {
  feedId: number;
  feedData: {
    id: number;
    sourceName: string;
    url: string;
    category: string; // 문자열
    status: 'active' | 'inactive';
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditRssFeedModal({ feedId, feedData, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    sourceName: feedData.sourceName,
    url: feedData.url,
    category: feedData.category,
    status: feedData.status,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateAdminRssFeedApi(feedId, form); // API 호출
      onUpdate(); // 부모에서 리스트 갱신
      onClose();  // 모달 닫기
    } catch (err) {
      console.error(err);
      alert("RSS 피드 수정 실패");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[40] bg-black/40" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 막기
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 w-[420px] shadow-2xl animate-scaleIn">
          <h2 className="text-white text-lg font-semibold mb-5 border-b border-white/10 pb-3">
            RSS 피드 수정
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-gray-200 text-sm font-medium">출처 이름</label>
              <input
                name="name"
                value={form.sourceName}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">URL</label>
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">카테고리</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

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