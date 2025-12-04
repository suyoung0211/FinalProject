import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { Gem } from "lucide-react";
import { Button } from "../components/ui/button";
import { getItems, getMyItems, purchaseItem } from "../api/storeApi";
import { Header } from "../components/layout/Header";

/** 이미지 URL 보정 */
const resolveImage = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080/${path}`;
};

/** 🔥 아이템 타입 정의 */
interface ShopItem {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;  // << 변경됨
  category: "icons" | "badges" | "banners";
  rarity: "common" | "rare" | "epic" | "legendary";
}

/** 🔥 서버에서 받아오는 원본 타입 */
interface StoreItemResponse {
  itemId: number;
  name: string;
  price: number;
  image: string | null;
  category: "AVATAR" | "BADGE" | "BACKGROUND" | "FRAME";
}

interface MyItemResponse {
  itemId: number;
}

export function PointsShopPage({ onBack }: any) {
  const { user, setUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [myItems, setMyItems] = useState<number[]>([]);
  const [userPoints, setUserPoints] = useState<number>(user?.points || 50000);

  /** 🔥 백엔드 카테고리 → 프론트 카테고리 매핑 */
  const mapCategory = (backendCategory: string): ShopItem["category"] => {
  switch (backendCategory) {
    case "FRAME":
      return "icons";   // 프레임 아이템 → 아이콘 탭에서 표시
    case "BADGE":
      return "badges";  // 뱃지는 뱃지 탭에서 표시
    default:
      return "icons";   // 혹시 모를 예외 대비
  }
};

  /** 🔥 가격 기준 희귀도 */
  const getRarityFromPrice = (price: number): ShopItem["rarity"] =>
    price >= 1500 ? "legendary" : price >= 900 ? "epic" : price >= 500 ? "rare" : "common";

  /** 🔥 서버에서 아이템 목록 가져오기 */
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await getItems();
        console.log("🔥 서버에서 받은 아이템:", res.data);

        const items: ShopItem[] = res.data.map((i: StoreItemResponse) => ({
          id: i.itemId,
          name: i.name,
          price: i.price,
          description: `${i.category} 카테고리`,
          imageUrl: resolveImage(i.image),   // << 여기서 변환!
          category: mapCategory(i.category),
          rarity: getRarityFromPrice(i.price),
        }));

        setShopItems(items);
      } catch (e) {
        console.error("아이템 불러오기 실패:", e);
      }
    };

    const loadMyItems = async () => {
      try {
        const res = await getMyItems();
        const ids = res.data.map((m: MyItemResponse) => m.itemId);
        setMyItems(ids);
      } catch (e) {
        console.error("내 아이템 불러오기 실패:", e);
      }
    };

    loadItems();
    loadMyItems();
  }, []);

  /** 내 아이템인지 체크 */
  const isOwned = (itemId: number) => myItems.includes(itemId);

  /** 🔥 구매 처리 */
  const confirmPurchase = async () => {
    if (!selectedItem) return;
    try {
      await purchaseItem(selectedItem.id);
      alert("구매 완료!");

      setUserPoints((prev) => prev - selectedItem.price);
      setMyItems((prev) => [...prev, selectedItem.id]);

      setUser((prev) => ({
        ...prev,
        points: prev.points - selectedItem.price,
      }));

      setShowPurchaseModal(false);
      setSelectedItem(null);
    } catch (e) {
      alert("포인트 부족 또는 오류 발생!");
    }
  };

  const filteredItems = shopItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const getRarityColor = (rarity: ShopItem["rarity"]) => {
    switch (rarity) {
      case "rare":
        return "border-blue-500/30";
      case "epic":
        return "border-purple-500/30";
      case "legendary":
        return "border-yellow-500/30";
      default:
        return "border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="store" />

      <div className="container mx-auto px-24 pt-36">
        {/* 카테고리 */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {["all", "icons", "badges", "banners"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-6 py-3 rounded-xl font-medium ${
                selectedCategory === c
                  ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-white/5 text-gray-400"
              }`}
            >
              {{
                all: "전체",
                icons: "프로필 아이콘",
                badges: "뱃지",
                banners: "배너",
              }[c]}
            </button>
          ))}
        </div>

        {/* 아이템 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/5 border rounded-2xl overflow-hidden hover:scale-105 transition ${getRarityColor(
                item.rarity
              )}`}
            >
              <div className="aspect-square flex items-center justify-center bg-black/20">
                {item.imageUrl ? (
                  <img src={item.imageUrl} className="w-24 h-24 object-contain" />
                ) : (
                  <span className="text-6xl">🌟</span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-bold">{item.price}pt</span>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowPurchaseModal(true);
                    }}
                    disabled={isOwned(item.id)}
                    className={`${
                      isOwned(item.id)
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-linear-to-r from-purple-600 to-pink-600"
                    } text-white text-sm px-4`}
                  >
                    {isOwned(item.id) ? "보유중" : "구매"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 구매 모달 */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">구매 확인</h2>

            <div className="aspect-square flex items-center justify-center mb-6">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  className="w-32 h-32 object-contain"
                />
              ) : (
                <span className="text-8xl">🌟</span>
              )}
            </div>

            <p className="text-white mb-4 text-center">
              <strong>{selectedItem.price}</strong> pt로 구매하시겠습니까?
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 border-white/20 text-white bg-white/10"
              >
                취소
              </Button>

              <Button
                onClick={confirmPurchase}
                disabled={userPoints < selectedItem.price}
                className={`flex-1 ${
                  userPoints < selectedItem.price
                    ? "bg-gray-600"
                    : "bg-linear-to-r from-purple-600 to-pink-600"
                } text-white`}
              >
                구매하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
