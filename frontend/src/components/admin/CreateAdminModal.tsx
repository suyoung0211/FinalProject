import { useState, useRef, useEffect } from "react";
import { createAdminApi } from "../../api/authApi";
import { CreateAdminRequest } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateAdminModal({ open, onClose }: Props) {
  const [form, setForm] = useState<CreateAdminRequest>({
    loginId: "",
    nickname: "",
    password: "",
    verificationEmail: ""
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("전송 데이터:", form);
    try {
      await createAdminApi(form);
      alert("관리자가 추가되었습니다.");
      onClose();
    } catch (error) {
      alert("추가 실패. 권한 또는 입력값을 확인해주세요.");
    }
  };

  return (
    // main 기준 중앙 정렬
    <div className="fixed inset-0 flex justify-center items-center">
      <div
        ref={modalRef}
        className="bg-white/10 border border-white/20 backdrop-blur-xl p-6 rounded-2xl w-96 shadow-2xl"
      >
        <h2 className="text-lg font-semibold mb-4 text-white">관리자 추가</h2>

        {/* 로그인 ID */}
        <input
          name="loginId"
          placeholder="로그인 ID"
          value={form.loginId}
          onChange={handleChange}
          className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-2"
        />

        {/* 비밀번호 */}
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-2"
        />

        {/* 닉네임 */}
        <input
          name="nickname"
          placeholder="닉네임"
          value={form.nickname}
          onChange={handleChange}
          className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-2"
        />

        {/* 인증 이메일 */}
        <input
          name="verificationEmail"
          type="email"
          placeholder="인증 이메일"
          value={form.verificationEmail}
          onChange={handleChange}
          className="w-full border border-white/20 bg-white/5 text-white rounded px-3 py-2 mb-4"
        />

        <div className="flex gap-2 justify-end">
          {/* 등록 버튼 */}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            등록
          </button>

          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
