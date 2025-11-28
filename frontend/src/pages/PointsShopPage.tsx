import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Gem,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getItems, getMyItems, purchaseItem } from "../api/storeApi";

/** 🔥 아이템 타입 정의 */
interface ShopItem {
  id: number;
  name: string;
  price: number;
  description: string;
  emoji: string;
  category: "icons" | "badges" | "banners";
  rarity: "common" | "rare" | "epic" | "legendary";
}
export interface UserType {
  id: number;
  loginId: string;
  nickname: string;
  points: number;   // 🔥 추가
  level: number;    // 있으면 추가
  profileImage?: string;
}


/** 🔥 서버에서 받아오는 원본 아이템 타입 */
interface StoreItemResponse {
  itemId: number;
  name: string;
  price: number;
  image: string | null;
  category: "AVATAR" | "BADGE" | "BACKGROUND" | "SKIN";
}

interface MyItemResponse {
  itemId: number;
}

export function PointsShopPage({ onBack }: any) {

  const { user } = useAuth();
  useEffect(() => {
  console.log("🧪 현재 user:", user);
  console.log("🧪 userPoints 초기값:", userPoints);
}, [user]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [myItems, setMyItems] = useState<number[]>([]);
  const [userPoints, setUserPoints] = useState<number>(user?.points || 50000);

  /** 🔥 백엔드 카테고리 → 프론트 카테고리 매핑 */
  const mapCategory = (backendCategory: StoreItemResponse["category"]): ShopItem["category"] => {
    switch (backendCategory) {
      case "AVATAR":
        return "icons";
      case "BADGE":
        return "badges";
      case "BACKGROUND":
      case "SKIN":
        return "banners";
      default:
        return "icons";
    }
  };

  /** 🔥 가격 기반 희귀도 계산 */
  const getRarityFromPrice = (price: number): ShopItem["rarity"] => {
    if (price >= 1500) return "legendary";
    if (price >= 900) return "epic";
    if (price >= 500) return "rare";
    return "common";
  };

  /** 🔥 서버에서 아이템 목록 로딩 */
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
          emoji: i.image || "🌹",
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

  /** 내 아이템인지 확인 */
  const isOwned = (itemId: number) => myItems.includes(itemId);

  /** 🔥 구매 처리 */
  const confirmPurchase = async () => {
    if (!selectedItem) return;
    try {
      await purchaseItem(selectedItem.id);
      alert("구매 완료!");

      setUserPoints(prev => prev - selectedItem.price);
      setMyItems(prev => [...prev, selectedItem.id]);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    } catch (e) {
      alert("포인트 부족 또는 오류 발생!");
    }
  };

  /** 🔥 카테고리 필터링 */
  const filteredItems = shopItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  /** 🔥 희귀도 색상 */
  const getRarityColor = (rarity: ShopItem["rarity"]) => {
    switch (rarity) {
      case "rare":
        return "text-blue-400 border-blue-500/30";
      case "epic":
        return "text-purple-400 border-purple-500/30";
      case "legendary":
        return "text-yellow-400 border-yellow-500/30";
      default:
        return "text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Mak'gora</span>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="container mx-auto px-4 pt-24">

        {/* Category Tabs */}
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

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/5 border rounded-2xl overflow-hidden hover:scale-105 transition ${getRarityColor(item.rarity)}`}
            >
              <div className="aspect-square flex items-center justify-center text-8xl">
                {item.emoji}
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
                    className={`${isOwned(item.id)
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

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">구매 확인</h2>

            <div className="aspect-square flex items-center justify-center text-8xl mb-6">
              {selectedItem.emoji}
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
