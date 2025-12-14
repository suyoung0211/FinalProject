// CommunityPostModal.tsx

import { CommunityPostDetailPage } from "../../../pages/CommunityPostDetailPage";

interface CommunityPostModalProps {
  postId: number;
  onClose: () => void;
}

export function CommunityPostModal({ postId, onClose }: CommunityPostModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 overflow-y-auto pt-20">
      <div className="relative w-4/5 bg-black/80 rounded-xl p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl font-bold"
        >
          ✕
        </button>

        {/* 상세페이지 컴포넌트 렌더링 */}
        <CommunityPostDetailPage postId={postId} modalMode onClose={onClose} />
      </div>
    </div>
  );
}
