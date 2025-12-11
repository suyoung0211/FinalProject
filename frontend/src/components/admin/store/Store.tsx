import { useEffect, useState } from "react";
import api from "../../../api/api";

export function Store() {
  const [items, setItems] = useState<any[]>([]);
  const [cloudImages, setCloudImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [badgeEmoji, setBadgeEmoji] = useState<string>("");

  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "FRAME",
    type: "POINT",
    price: 100,
    stock: 100,
  });

  // ===============================
  // 🔥 Cloudinary 이미지 목록 로드
  // ===============================
  const loadCloudImages = async () => {
    try {
      const res = await api.get("/admin/store/images", {
        params: { folder: "frames" },
      });
      setCloudImages(res.data);
    } catch (err) {
      console.error("이미지 불러오기 실패:", err);
    }
  };

  // ===============================
  // 🔥 기존 아이템 로드
  // ===============================
  const loadItems = async () => {
    try {
      const res = await api.get("/admin/store/items");
      setItems(res.data);
    } catch (err) {
      console.error("아이템 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadItems();
    loadCloudImages();
  }, []);

  // ===============================
  // 🔥 Cloudinary 이미지 업로드
  // ===============================
  const uploadImage = async () => {
    if (!uploadFile) {
      alert("파일을 선택해주세요!");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await api.post("/admin/store/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data.url;

      alert("업로드 완료!");

      // 업로드된 이미지 목록 자동 갱신
      loadCloudImages();
      setUploadPreview(null);
      setUploadFile(null);

    } catch (err) {
      console.error("업로드 실패:", err);
      alert("업로드 실패!");
    } finally {
      setUploading(false);
    }
  };

  const deleteCloudImage = async (publicId: string) => {
  if (!window.confirm("이 이미지를 정말 삭제할까요?")) return;

  try {
    await api.delete("/admin/store/delete-image", {
      params: { publicId },
    });

    alert("이미지가 삭제되었습니다.");
    loadCloudImages(); // 목록 갱신
  } catch (err) {
    console.error("이미지 삭제 실패:", err);
    alert("삭제 실패!");
  }
};

  // ===============================
  // 🔥 아이템 생성
  // ===============================
  const createItem = async () => {
    if (newItem.category === "FRAME" && !selectedImage) {
      alert("프레임 이미지를 선택해주세요!");
      return;
    }

    if (newItem.category === "BADGE" && badgeEmoji.trim() === "") {
      alert("뱃지 이모지를 입력해주세요!");
      return;
    }

    try {
      const data =
        newItem.category === "FRAME"
          ? { ...newItem, image: selectedImage }
          : { ...newItem, image: badgeEmoji };

      await api.post("/admin/store/items", data);

      alert("아이템이 생성되었습니다!");
      setSelectedImage(null);
      setBadgeEmoji("");

      setNewItem({
        name: "",
        category: "FRAME",
        type: "POINT",
        price: 100,
        stock: 100,
      });

      loadItems();
    } catch (err) {
      console.error("아이템 생성 실패:", err);
    }
  };

  // ===============================
  // 🔥 아이템 삭제
  // ===============================
  const deleteItem = async (itemId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/admin/store/items/${itemId}`);
      alert("삭제 완료!");
      loadItems();
    } catch (err) {
      console.error("아이템 삭제 실패:", err);
      alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="space-y-10 text-white">

      {/* ================================================================= */}
      {/* 🔥 상단 제목 */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">상점 관리</h2>
      </div>

      {/* ================================================================= */}
      {/* 🔥 Cloudinary 이미지 업로드 섹션 */}
      {/* ================================================================= */}
      <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-white/10">
        <h3 className="text-xl font-semibold">Cloudinary 이미지 업로드</h3>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setUploadFile(file);
            if (file) {
              setUploadPreview(URL.createObjectURL(file));
            }
          }}
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
        />

        {uploadPreview && (
          <img
            src={uploadPreview}
            className="w-32 h-32 object-contain rounded border my-2"
          />
        )}

        <button
          onClick={uploadImage}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "이미지 업로드"}
        </button>
      </div>

      {/* ================================================================= */}
      {/* 🔥 아이템 생성 */}
      {/* ================================================================= */}
      <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-white/10">
        <h3 className="text-xl font-semibold">아이템 생성</h3>

        <input
          type="text"
          placeholder="아이템 이름"
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />

        <select
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
          value={newItem.category}
          onChange={(e) => {
            setNewItem({ ...newItem, category: e.target.value });
            setSelectedImage(null);
            setBadgeEmoji("");
          }}
        >
          <option value="FRAME">FRAME</option>
          <option value="BADGE">BADGE</option>
        </select>

        {/* 🔥 FRAME — Cloudinary 이미지 선택 */}
        {newItem.category === "FRAME" && (
          <div>
            <div className="grid grid-cols-6 gap-4 bg-white/5 p-4 rounded-xl max-h-64 overflow-y-auto">
              {cloudImages.map((img) => (
                <div
                  key={img.asset_id}
                  className="p-1 border rounded-xl cursor-pointer relative group"
                >
                  {/* 이미지 표시 */}
                  <img
                    src={img.secure_url}
                    className="w-full h-20 object-contain"
                    onClick={() => setSelectedImage(img.secure_url)}
                  />

                  {/* 삭제 버튼 - Hover 시 표시 */}
                  <button
                    onClick={() => deleteCloudImage(img.public_id)}
                    className="absolute top-1 right-1 px-2 py-1 text-xs bg-red-600/80 hover:bg-red-700 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {selectedImage && (
              <div className="mt-4">
                <p className="text-gray-300 mb-2">선택된 이미지</p>
                <img
                  src={selectedImage}
                  className="w-32 h-32 object-contain border rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {/* 🔥 BADGE — 이모지 입력 */}
        {newItem.category === "BADGE" && (
          <div>
            <h3 className="text-lg mb-2">뱃지 이모지 입력</h3>
            <input
              type="text"
              maxLength={4}
              placeholder="예: ⭐ 🔥 👑"
              className="w-full p-2 bg-black/20 border border-white/20 rounded text-2xl"
              value={badgeEmoji}
              onChange={(e) => setBadgeEmoji(e.target.value)}
            />
            {badgeEmoji && (
              <p className="text-5xl mt-2">미리보기: {badgeEmoji}</p>
            )}
          </div>
        )}

        <select
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
          value={newItem.type}
          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
        >
          <option value="POINT">POINT</option>
          <option value="CASH">CASH</option>
        </select>

        <input
          type="number"
          placeholder="가격"
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: Number(e.target.value) })
          }
        />

        <button
          onClick={createItem}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          아이템 생성
        </button>
      </div>

      {/* ================================================================= */}
      {/* 🔥 아이템 목록 */}
      {/* ================================================================= */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">
                아이템명
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">
                이미지
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">
                관리
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 text-white">{item.name}</td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs">
                    {item.category}
                  </span>
                </td>

                <td className="px-6 py-4 text-yellow-400 font-bold">
                  {item.price.toLocaleString()}P
                </td>

                <td className="px-6 py-4">
                  {item.category === "BADGE" ? (
                    <span className="text-3xl">{item.image}</span>
                  ) : (
                    <img src={item.image} className="w-12 h-12 rounded" />
                  )}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
