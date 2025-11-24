import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";

export default function EmailVerifyModal({
  email,
  onSuccess,
  onClose,
}: {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const verifyCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/email/verify", {
        email,
        token: code,
      });

      if (res.data.success) {
        alert("이메일 인증 완료!");
        onSuccess();
      } else {
        setMessage(res.data.message);
      }
    } catch (e: any) {
      setMessage(e.response?.data?.message || "인증 실패");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/email/resend?email=${email}`
      );
      alert("인증번호가 재발송되었습니다.");
    } catch (e) {
      alert("재발송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-96 border border-white/20">
        <h2 className="text-white text-xl font-bold mb-4">이메일 인증</h2>
        <p className="text-gray-300 mb-4">
          <strong>{email}</strong>로 전송된 인증번호를 입력하세요.
        </p>

        <Input
          placeholder="6자리 인증번호"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="mb-3"
        />

        {message && <p className="text-red-400 text-sm mb-2">{message}</p>}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={verifyCode} disabled={loading}>
            인증하기
          </Button>
          <Button
            className="flex-1 bg-gray-600"
            onClick={resend}
            disabled={loading}
          >
            재전송
          </Button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-300 hover:text-white text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
