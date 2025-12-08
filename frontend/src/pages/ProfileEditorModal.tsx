import { useEffect, useState } from "react";
import api from "../api/api";
import { Button } from "../components/ui/button";

interface ProfileEditorModalProps {
  user: any;
  onClose: () => void;
  onUpdated: (user: any) => void;
}

interface OwnedItem {
  userStoreId: number;
  itemId: number;
  name: string;
  image: string;
  category: "FRAME" | "BADGE" | string;
  type: string;
}

export function ProfileEditorModal({
  user,
  onClose,
  onUpdated,
}: ProfileEditorModalProps) {
  const [items, setItems] = useState<OwnedItem[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<OwnedItem | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<OwnedItem | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmoji = (v: string) => {
  // 이모지는 4바이트 문자라 정규식으로 구분 가능
  return /\p{Emoji}/u.test(v);
};

  const resolveImage = (p?: string | null) =>
    !p ? "" : p.startsWith("http") ? p : `http://localhost:8080/${p}`;

  // 🔥 내가 구매한 아이템 불러오기 (FRAME / BADGE 포함)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/profile/my-items");
        setItems(res.data);

        // 현재 적용 중인 프레임/뱃지에 맞춰 기본 선택 세팅
        const currentFrame = res.data.find(
          (it: OwnedItem) =>
            it.category === "FRAME" && it.image === user.profileFrame
        );
        const currentBadge = res.data.find(
          (it: OwnedItem) =>
            it.category === "BADGE" && it.image === user.profileBadge
        );
        if (currentFrame) setSelectedFrame(currentFrame);
        if (currentBadge) setSelectedBadge(currentBadge);
      } catch (e) {
        console.error("내 아이템 로딩 실패", e);
      }
    };
    fetchItems();
  }, [user.profileFrame, user.profileBadge]);

  const frames = items.filter((i) => i.category === "FRAME");
  const badges = items.filter((i) => i.category === "BADGE");

  // 🔥 선택한 프레임/뱃지 적용
  const handleApply = async () => {
  try {
    // 프레임 적용 또는 해제
    if (selectedFrame === null) {
      await api.post("/profile/clear-frame");
    } else {
      await api.post("/profile/apply-item", {
        userStoreId: selectedFrame.userStoreId,
      });
    }

    // 뱃지 적용 또는 해제
    if (selectedBadge === null) {
      await api.post("/profile/clear-badge");
    } else {
      await api.post("/profile/apply-item", {
        userStoreId: selectedBadge.userStoreId,
      });
    }

    onUpdated({
      ...user,
      profileFrame: selectedFrame ? selectedFrame.image : null,
      profileBadge: selectedBadge ? selectedBadge.image : null,
    });

    alert("프로필이 업데이트되었습니다!");
    onClose();
  } catch (err) {
    alert("적용 실패");
  }
};


  // ✨ 라이브 미리보기 (현재 아바타 + 선택된 프레임/뱃지)
  const previewFrameSrc = selectedFrame?.image || user.profileFrame;
  const previewBadgeSrc = selectedBadge?.image || user.profileBadge;

  return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
    <div className="bg-slate-900 border border-white/20 rounded-3xl px-24 py-32 max-w-[1600px] w-full">
      <h2 className="text-3xl font-bold text-white mb-20 -ml-6 -mt-8">
      프로필 꾸미기
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-32 mb-16">

        {/* 🔥 왼쪽: 라이브 미리보기 */}
        <div className="flex flex-col items-center gap-14 -ml-6 mt-12">

          {/* 아바타 + 프레임 */}
          <div className="relative w-60 h-60">
            <img
              src={resolveImage(user.avatarIcon)}
              className="w-full h-full rounded-full object-cover"
            />
            {previewFrameSrc && (
              <img
                src={resolveImage(previewFrameSrc)}
               className="absolute inset-0 w-full h-full scale-[1.5] pointer-events-none"
              />
            )}
          </div>

          {/* 닉네임 + 뱃지 */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">
                {user.nickname}
              </span>
                      
              {/* BADGE는 무조건 이모지 출력 */}
              {selectedBadge ? (
  isEmoji(selectedBadge.image) ? (
    <span className="text-4xl">{selectedBadge.image}</span>
  ) : (
    <img
      src={resolveImage(selectedBadge.image)}
      className="w-8 h-8 object-contain"
    />
  )
) : previewBadgeSrc ? (
  isEmoji(previewBadgeSrc) ? (
    <span className="text-4xl">{previewBadgeSrc}</span>
  ) : (
    <img
      src={resolveImage(previewBadgeSrc)}
      className="w-8 h-8 object-contain"
    />
  )
) : null}
            </div>

          <p className="text-sm text-gray-400">
            적용될 프로필 미리보기
          </p>
        </div>

          {/* 가운데: 프로필 테두리 선택 */}
          <div className="md:col-span-1">
            <p className="text-white mb-3 font-semibold">프로필 테두리</p>
            {frames.length === 0 ? (
              <p className="text-gray-400 text-sm">구매한 테두리가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {frames.map((f) => (
                  <button
                    type="button"
                    key={f.userStoreId}
                    onClick={() => setSelectedFrame(f)}
                    className={`p-2 border rounded-xl cursor-pointer transition-all bg-black/40 ${
                      selectedFrame?.userStoreId === f.userStoreId
                        ? "border-pink-400 shadow-lg shadow-pink-500/30"
                        : "border-white/20 hover:border-pink-300"
                    }`}
                  >
                    <img
                      src={resolveImage(f.image)}
                      className="w-full h-16 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 뱃지 선택 */}
          <div className="md:col-span-1">
            <p className="text-white mb-3 font-semibold">닉네임 뱃지</p>
            {badges.length === 0 ? (
              <p className="text-gray-400 text-sm">구매한 뱃지가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto pr-1">
                {badges.map((b) => (
                  <button
                    type="button"
                    key={b.userStoreId}
                    onClick={() => setSelectedBadge(b)}
                    className={`flex items-center justify-center 
                      w-20 h-19  /* 🔥 버튼 크기 커짐 */
                      text-6xl   /* 🔥 이모지 크기 커짐 */
                      border rounded-xl cursor-pointer bg-black/40 transition-all ${
                        selectedBadge?.userStoreId === b.userStoreId
                          ? "border-yellow-400 shadow-lg shadow-yellow-400/30"
                          : "border-white/20 hover:border-yellow-300"
                }`}
                  >
                    {/* 뱃지는 이모지로 렌더링 */}
                    <span className="text-4xl">{b.image || b.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-4 justify-end mt-20 pr-10">

  <Button
    className="bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-base"
    onClick={onClose}
    type="button"
  >
    취소
  </Button>

  <Button
    className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-8 py-6 text-lg rounded-base"
    onClick={handleApply}
    disabled={loading}
    type="button"
  >
    {loading ? "적용 중..." : "저장하기"}
  </Button>

        </div>
      </div>
    </div>
  );
}
