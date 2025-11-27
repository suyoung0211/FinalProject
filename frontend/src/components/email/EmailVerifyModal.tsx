import { useState } from "react";
import { sendEmailCodeApi, verifyEmailCodeApi } from "../../api/emailApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface EmailVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedEmail: string) => void;
}

export default function EmailVerifyModal({
  isOpen,
  onClose,
  onVerified,
}: EmailVerifyModalProps) {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const sendCode = async () => {
    try {
      await sendEmailCodeApi(email);
      alert("인증 코드가 발송되었습니다!");
      setSent(true);
    } catch {
      alert("이메일 전송 실패");
    }
  };

  const verifyCode = async () => {
  try {
    await verifyEmailCodeApi(email, code);  // code=token
    alert("인증 성공!");
    onVerified(email);
    onClose();
  } catch {
    alert("인증 실패");
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black rounded-xl p-6 w-96 space-y-4">

        <h2 className="text-xl font-semibold text-center">이메일 인증</h2>

        <Input
          placeholder="인증용 이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button className="w-full bg-purple-600" onClick={sendCode}>
          인증코드 보내기
        </Button>

        {sent && (
          <>
            <Input
              placeholder="인증코드 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Button className="w-full bg-pink-600" onClick={verifyCode}>
              인증 확인
            </Button>
          </>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
