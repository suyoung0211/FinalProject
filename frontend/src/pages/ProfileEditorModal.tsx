import { useEffect, useState } from "react";
import api from "../api/api";
import { Button } from "../components/ui/button";

interface Props {
  user: any;
  onClose: () => void;
  onUpdated: (user: any) => void;
}

export function ProfileEditorModal({ user, onClose, onUpdated }: Props) {
  const [frames, setFrames] = useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = useState(user.profileFrame || null);

  const resolveImage = (p?: string | null) =>
    !p ? "" : p.startsWith("http") ? p : `http://localhost:8080/${p}`;

  // 🔥 보유 프레임 불러오기
  useEffect(() => {
    api.get("/store/my-frames").then((res) => setFrames(res.data));
  }, []);

  const handleImageUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await api.post("/profile/upload-photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    onUpdated({ ...user, avatarIcon: res.data });
  };

  const handleApplyFrame = async () => {
    if (!selectedFrame) return;

    const res = await api.post("/profile/apply-frame", {
      itemId: selectedFrame.itemId,
    });

    onUpdated({ ...user, profileFrame: selectedFrame.image });
    alert("테두리 적용 완료!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6">프로필 편집</h2>

        {/* --------------------- */}
        {/* 🔹 프로필 사진 업로드 */}
        {/* --------------------- */}
        <div className="mb-8">
          <p className="text-white mb-3 font-semibold">프로필 사진</p>

          <input
            type="file"
            accept="image/*"
            className="text-white"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
          />

          <img
            src={resolveImage(user.avatarIcon)}
            className="w-24 h-24 rounded-full mt-4"
          />
        </div>

        {/* --------------------- */}
        {/* 🔹 프레임 선택 */}
        {/* --------------------- */}
        <div className="mb-8">
          <p className="text-white mb-3 font-semibold">프로필 테두리</p>

          <div className="grid grid-cols-3 gap-4">
            {frames.map((f) => (
              <div
                key={f.itemId}
                onClick={() => setSelectedFrame(f)}
                className={`p-2 border rounded-xl cursor-pointer ${
                  selectedFrame?.itemId === f.itemId
                    ? "border-pink-400"
                    : "border-white/20"
                }`}
              >
                <img
                  src={resolveImage(f.image)}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <Button className="bg-white/10 text-white" onClick={onClose}>
            취소
          </Button>

          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            onClick={handleApplyFrame}
          >
            적용하기
          </Button>
        </div>
      </div>
    </div>
  );
}
