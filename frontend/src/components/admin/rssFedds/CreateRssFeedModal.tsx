// CreateRssFeedModal.tsx
import { useEffect, useState } from "react";
import { createAdminRssFeed, getCategories } from "../../../api/adminAPI";

interface Props {
  onClose: () => void;
  onAddSuccess: () => void;
}

export default function CreateRssFeedModal({ onClose, onAddSuccess }: Props) {
  const [sourceName, setSourceName] = useState("");
  const [url, setUrl] = useState("");
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  // 카테고리 목록 가져오기
  useEffect(() => {
    getCategories().then(res => {
        console.log("카테고리 데이터:", res.data); // 여기에 찍어보기
        setCategories(res.data);
    }).catch(err => {
        console.error("카테고리 조회 실패:", err);
    });
    }, []);

  // 체크박스 선택 처리
  const handleCategorySelect = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  // 제출
  const handleSubmit = async () => {
    await createAdminRssFeed({
      sourceName,
      url,
      categoryIds: selectedCategoryIds,
    });
    onAddSuccess();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[9999]">
      <div className="rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-auto z-[10000]">
        <h2 className="text-lg font-bold mb-4">RSS 피드 추가</h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Source Name"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="RSS Feed URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="mb-3">
          <p className="font-medium mb-2">카테고리 선택</p>
          <div className="max-h-32 overflow-auto border p-2 rounded">
            {categories.map(cat => (
              <label key={cat.id} className="block text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => handleCategorySelect(cat.id)}
                />
                <span className="ml-2">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
}
