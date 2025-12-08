import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Gem,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getItems, getMyItems, purchaseItem } from "../api/storeApi";
import { Header } from "../components/layout/Header";

/** 🔥 아이템 타입 정의 */
interface ShopItem {
  id: number;
  name: string;
  price: number;
  description: string;
  emoji: string;
  category: "icons" | "badges" | "frame";
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
  category: "AVATAR" | "BADGE" | "FRAME" ;
}

interface MyItemResponse {
  itemId: number;
}

export function PointsShopPage({ onBack }: any) {

  const { user, setUser } = useAuth();
  useEffect(() => {
  console.log("🧪 현재 user:", user);
  console.log("🧪 userPoints 초기값:", userPoints);
}, [user]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [myItems, setMyItems] = useState<number[]>([]);
  const [userPoints, setUserPoints] = useState<number>(user?.points ?? 0);

useEffect(() => {
  if (user?.points !== undefined) {
    setUserPoints(user.points);
  }
}, [user]);

  /** 🔥 백엔드 카테고리 → 프론트 카테고리 매핑 */
  const resolveImage = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:8080/${path}`;
};

const mapCategory = (backendCategory: StoreItemResponse["category"]): ShopItem["category"] => {
  switch (backendCategory) {
    case "AVATAR":
      return "icons";

    case "FRAME":
      return "frame"; // 프레임은 꾸미기(배너) 쪽 UI에 들어가는 게 자연스러움

    case "BADGE":
      return "badges";

    default:
      return "icons";
  }
};

  /** 🔥 가격 기반 희귀도 계산 */
  const getRarityFromPrice = (price: number): ShopItem["rarity"] => {
    if (price >= 500000) return "legendary";
    if (price >= 100000) return "epic";
    if (price >= 50000) return "rare";
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
          emoji: i.image
            ? (i.image.length <= 3 ? i.image : resolveImage(i.image))
            : "",
          category: mapCategory(i.category),
          rarity: getRarityFromPrice(i.price),
        }));
        
        // 🔥🔥 가격 높은 순으로 정렬
        items.sort((a, b) => b.price - a.price);
        
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

    // 상점 페이지 로컬 포인트 갱신
    setUserPoints(prev => prev - selectedItem.price);

    // 내 아이템 추가
    setMyItems(prev => [...prev, selectedItem.id]);

    // ⭐ 헤더 포인트 업데이트 (가장 중요!!)
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

  /** 🔥 카테고리 필터링 */
  const filteredItems = shopItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  /** 🔥 희귀도 색상 */
  const getRarityStyle = (rarity: ShopItem["rarity"]) => {
  switch (rarity) {
    case "rare":
      return "border-blue-400 bg-blue-500/10 shadow-[0_0_12px_#60a5fa55]";
    case "epic":
      return "border-purple-400 bg-purple-500/10 shadow-[0_0_15px_#c084fc66]";
    case "legendary":
      return `
        border-yellow-400 
        bg-yellow-500/10 
        shadow-[0_0_20px_#facc1588] 
        animate-pulse-slow
      `;
    default:
      return "border-gray-400/30 bg-white/5";
  }
};

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* HEADER */}
      <Header activeMenu="store" />

      {/* CONTENT */}
      <div className="container mx-auto px-24 pt-36">

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {["all", "frame" ,"badges" ].map((c) => (
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
                frame: "프레임",
                badges: "뱃지",
              }[c]}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={`${item.id}-${item.category}`} 
              className={`
                bg-white/5 
                border rounded-2xl 
                overflow-hidden 
                hover:scale-105 
                transition 
                ${getRarityStyle(item.rarity)}
                ${item.rarity === "legendary" ? "legendary-glow" : ""}
                ${item.rarity === "epic" ? "epic-shine" : ""}
              `}
            >
              <div className="aspect-square flex items-center justify-center bg-black/20">
                {item.emoji.startsWith("http") ? (
                  <img
                    src={item.emoji}
                    alt={item.name}
                    className={`
                      object-contain
                      ${item.category === "frame" ? "w-48 h-48" : "w-48 h-48"}
                    `}
                  />
                ) : (
                  <span className="text-6xl">{item.emoji}</span>
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

            <div className="aspect-square flex items-center justify-center mb-6">
              {selectedItem.emoji.startsWith("http") ? (
                <img
                  src={selectedItem.emoji}
                  alt={selectedItem.name}
                  className="w-54 h-54 object-contain"
                />
              ) : (
                <span className="text-8xl">{selectedItem.emoji}</span>
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
