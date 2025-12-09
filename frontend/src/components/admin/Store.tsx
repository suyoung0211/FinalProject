import { useEffect, useState } from "react";
import api from "../../api/api";

export function Store() {
  const [items, setItems] = useState<any[]>([]);
  const [cloudImages, setCloudImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [badgeEmoji, setBadgeEmoji] = useState<string>("");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "FRAME",
    type: "POINT",
    price: 100,
    stock: 100,
  });

  // ----------------------------
  // 🔥 1) Cloudinary 이미지 로드
  // ----------------------------
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

  // ----------------------------
  // 🔥 2) 기존 아이템 로드
  // ----------------------------
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

  // ----------------------------
  // 🔥 3) 아이템 생성
  // ----------------------------
  const createItem = async () => {

    // FRAME → 이미지 필수
    if (newItem.category === "FRAME" && !selectedImage) {
      alert("프레임 이미지를 선택해주세요!");
      return;
    }

    // BADGE → emoji 필수
    if (newItem.category === "BADGE" && badgeEmoji.trim() === "") {
      alert("뱃지 이모지를 입력해주세요!");
      return;
    }

    try {
      const data =
        newItem.category === "FRAME"
          ? { ...newItem, image: selectedImage }
          : { ...newItem, image: badgeEmoji }; // BADGE = emoji 저장

      await api.post("/admin/store/items", data);

      alert("아이템이 생성되었습니다!");

      // Reset Form
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

  return (
    <div className="space-y-8 text-white">

      <h2 className="text-2xl font-bold">상점 아이템 관리</h2>

      {/* ===================================================== */}
      {/* 🔥 FRAME일 때만 보여주는 Cloudinary 이미지 선택 섹션 */}
      {/* ===================================================== */}
      {newItem.category === "FRAME" && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Cloudinary 이미지 (frames 폴더)</h3>

          <div className="grid grid-cols-6 gap-4 bg-white/5 p-4 rounded-xl max-h-64 overflow-y-auto">
            {cloudImages.map((img) => (
              <div
                key={img.asset_id}
                onClick={() => setSelectedImage(img.secure_url)}
                className={`p-1 border rounded-xl cursor-pointer ${
                  selectedImage === img.secure_url ? "border-pink-400" : "border-white/20"
                }`}
              >
                <img src={img.secure_url} className="w-full h-20 object-contain" />
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="mt-4">
              <p className="text-gray-300 mb-2">선택된 이미지 미리보기</p>
              <img
                src={selectedImage}
                className="w-32 h-32 object-contain border rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {/* ===================================================== */}
      {/* 🔥 BADGE 선택 시 보여주는 Emoji 입력 UI */}
      {/* ===================================================== */}
      {newItem.category === "BADGE" && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-3">뱃지 이모지 입력</h3>

          <input
            type="text"
            maxLength={4}
            placeholder="예: 🔥 ⭐ 👑"
            className="w-full p-2 bg-black/20 border border-white/20 rounded text-2xl"
            value={badgeEmoji}
            onChange={(e) => setBadgeEmoji(e.target.value)}
          />

          {badgeEmoji && (
            <div className="mt-3 text-5xl">
              미리보기: <span>{badgeEmoji}</span>
            </div>
          )}
        </div>
      )}

      {/* ======================== */}
      {/* 🔥 아이템 생성 폼 */}
      {/* ======================== */}
      <div className="bg-white/5 p-6 rounded-xl space-y-4">
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
          className="w-full p-2 bg-black/20 border border-white/20 rounded"
          value={newItem.price}
          placeholder="가격"
          onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
        />

        <button
          onClick={createItem}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          아이템 생성
        </button>
      </div>

      {/* ======================== */}
      {/* 🔥 기존 아이템 리스트 */}
      {/* ======================== */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold mb-3">등록된 아이템 목록</h3>

        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
            
            {/* BADGE → emoji 표시 / FRAME → 이미지 표시 */}
            {item.category === "BADGE" ? (
              <div className="w-16 h-16 rounded bg-white/10 flex items-center justify-center text-4xl">
                {item.image}
              </div>
            ) : (
              <img src={item.image} className="w-16 h-16 rounded" />
            )}

            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-400">{item.category} / {item.price}P</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
