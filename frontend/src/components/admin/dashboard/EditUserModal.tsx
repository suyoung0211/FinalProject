// EditUserModal.tsx

import { useState } from "react";
import { updateAdminUserApi } from "../../../api/adminAPI";
import ReactDOM from "react-dom";

interface Props {
  userId: number;
  userData: {
    id: number;
    loginId: string;
    nickname: string;
    level: number;
    points: number;
    role: string;
    status: string;
    verificationEmail: string;
    createdAt: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditUserModal({ userId, userData, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    userid: userId,
    nickname: userData.nickname,
    level: userData.level,
    points: userData.points,
    role: userData.role,
    status: userData.status,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateAdminUserApi(userId, form);
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[40]" // 화면 전체 덮는 투명 레이어
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="fixed top-1/2 left-[calc(50%+128px)] transform -translate-x-1/2 -translate-y-1/2 z-[50]"
        onClick={onClose} // 배경 클릭 시 모달 닫기
      >
        <div
          className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 w-[420px] shadow-2xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 방지
        >
          <h2 className="text-white text-lg font-semibold mb-5 border-b border-white/10 pb-3">
            사용자 정보 수정
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-gray-200 text-sm font-medium">닉네임</label>
              <input
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">레벨</label>
              <input
                name="level"
                type="number"
                value={form.level}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">포인트</label>
              <input
                name="points"
                type="number"
                value={form.points}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">역할</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              >
                <option value="USER">사용자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

            <div>
              <label className="text-gray-200 text-sm font-medium">상태</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800/60 text-white border border-white/10 focus:border-purple-400 transition"
              >
                <option value="ACTIVE">활성화</option>
                <option value="INACTIVE">비활정화</option>
                <option value="DELETED">정지</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white border border-white/20 hover:bg-white/10 transition"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
            >
              {loading ? "저장중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
