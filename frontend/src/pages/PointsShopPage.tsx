import { useEffect, useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Trophy,
  Star,
  Crown,
  Flame,
  Zap,
  Heart,
  Shield,
  Gem,
  Award,
  Check,
  User,
  Coins,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getItems, getMyItems, purchaseItem } from "../api/storeApi";

export function PointsShopPage({
  onBack,
  onCommunity,
  onNews,
  onLeaderboard,
  onProfile,
  onVote,
  user,
  onLogin,
  onLogout,
  onSignup,
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [shopItems, setShopItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [userPoints, setUserPoints] = useState(user?.points || 0);

  // 🔥 Backend category → Front category 매핑
  const mapCategory = (backendCategory) => {
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

  // 🔥 rarity 계산
  const getRarityFromPrice = (price) => {
    if (price >= 1500) return "legendary";
    if (price >= 900) return "epic";
    if (price >= 500) return "rare";
    return "common";
  };

  // 🔥 서버에서 목록 로딩
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await getItems();
        console.log("🔥 서버에서 받은 아이템:", res.data);
        const items = res.data.map((i) => ({
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
        setMyItems(res.data.map((m) => m.itemId));
      } catch (e) {
        console.error("내 아이템 불러오기 실패:", e);
      }
    };

    loadItems();
    loadMyItems();
  }, []);

  const filteredItems = shopItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const getRarityColor = (rarity) => {
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

  const getRarityName = (rarity) => {
    switch (rarity) {
      case "rare":
        return "레어";
      case "epic":
        return "에픽";
      case "legendary":
        return "전설";
      default:
        return "일반";
    }
  };

  

  const isOwned = (itemId) => myItems.includes(itemId);

  // 구매 기능
  const confirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      await purchaseItem(selectedItem.id);
      alert("구매 완료!");

      setUserPoints(userPoints - selectedItem.price);
      setMyItems([...myItems, selectedItem.id]);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    } catch (e) {
      alert("포인트 부족 또는 오류 발생!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* 🔥 Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Mak'gora</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 Banner */}
      <div className="container mx-auto px-4 pt-24">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-white" />
              <span className="text-white/80 font-medium">신규 아이템</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">프로필을 꾸며보세요!</h1>
            <p className="text-white/90">
              다양한 아이콘, 뱃지, 배너로 나만의 개성을 표현하세요
            </p>
          </div>
        </div>

        {/* 🔥 Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "icons", "badges", "banners"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
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
      </div>

      {/* 🔥 Items Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/5 border rounded-2xl overflow-hidden hover:scale-105 transition-all ${getRarityColor(
                item.rarity
              )}`}
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
                    className={`${
                      isOwned(item.id)
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
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

      {/* 🔥 Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                취소
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={userPoints < selectedItem.price}
                className={`flex-1 ${
                  userPoints < selectedItem.price
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
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
