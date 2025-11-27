// src/pages/LoginPage.tsx
import { useState } from "react";
import {
  LogIn,
  Mail,
  Lock,
  ArrowLeft,
  User,
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";

import { loginApi, signupApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import EmailVerifyModal from "../components/email/EmailVerifyModal";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");       // 사이트 로그인용 email (ID)
  const [password, setPassword] = useState("");

  // ⭐ fix : URL 파라미터로 회원가입 모드 설정
  const [isSignup, setIsSignup] = useState(new URLSearchParams(location.search).get("mode") === "signup");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 이메일 인증 관련 상태
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // 🔹 회원가입 폼 데이터 임시 저장
  const [pendingSignup, setPendingSignup] = useState<{
    email: string;
    password: string;
    nickname: string;
  } | null>(null);

  // ⭐ 회원가입 + 로그인 공통 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) 회원가입 모드
    if (isSignup) {
      // 아직 이메일 인증 안 했으면 → 회원가입 API 호출 대신 모달 오픈
      if (!emailVerified) {
        // 현재 폼 데이터 저장해두기
        setPendingSignup({ email, password, nickname });
        setVerifyModalOpen(true);
        return;
      }

      // 이메일 인증이 끝난 상태라면 → 실제 회원가입 요청
      if (!pendingSignup || !verifiedEmail) {
        alert("이메일 인증 정보가 올바르지 않습니다. 다시 시도해주세요.");
        setEmailVerified(false);
        setVerifyModalOpen(true);
        return;
      }

      setIsLoading(true);
      try {
        await signupApi({
          email: pendingSignup.email,
          password: pendingSignup.password,
          nickname: pendingSignup.nickname,
          verificationEmail: verifiedEmail, // 백엔드에 인증용 이메일도 넘길 수 있음
        });

        alert("회원가입 완료! 이제 로그인해주세요.");
        setIsSignup(false);
        setEmailVerified(false);
        setVerifiedEmail(null);
        setPendingSignup(null);
      } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || "회원가입에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2) 로그인 모드
    setIsLoading(true);
    try {
      const res = await loginApi({ email, password });

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      const userData = res.data.user;

      login(userData, accessToken);

      // ✅ 유저 역할 확인 후 이동
      if (userData.role === "ADMIN") {
        navigate("/admin"); // 관리자 페이지
      } else {
        navigate("/"); // 일반 사용자 홈
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모달에서 인증 성공했을 때
  const handleEmailVerified = (verified: string) => {
    setEmailVerified(true);
    setVerifiedEmail(verified);
    // 인증 끝났으면 바로 회원가입 API 호출 시도
    if (pendingSignup) {
      // 폼 submit을 다시 트리거하는 대신 여기에서 직접 호출해도 됨
      (async () => {
        try {
          setIsLoading(true);
          await signupApi({
            email: pendingSignup.email,
            password: pendingSignup.password,
            nickname: pendingSignup.nickname,
            verificationEmail: verified,
          });
          alert("회원가입 완료! 이제 로그인해주세요.");
          setIsSignup(false);
          setPendingSignup(null);
          setVerifiedEmail(null);
          setEmailVerified(false);
        } catch (error: any) {
          console.error(error);
          alert(error.response?.data?.message || "회원가입에 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      })();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 메인 컨테이너 */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10">
        {/* 왼쪽 소개 영역 (생략: 네 기존 코드 그대로) */}
        {/* ... 그대로 두면 됨 */}

        {/* 오른쪽 로그인/회원가입 폼 */}
        <div className="flex flex-col justify-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>

          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-500/50">
                <LogIn className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignup ? "회원가입" : "로그인"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <Field label="닉네임" icon={<User className="w-4 h-4" />}>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </Field>
              )}

              <Field label="이메일 (로그인 ID)" icon={<Mail className="w-4 h-4" />}>
                <Input
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field label="비밀번호" icon={<Lock className="w-4 h-4" />}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </Field>

              {isSignup && (
                <div className="text-xs text-gray-300">
                  * 회원가입 시, 추가로 인증용 이메일을 통해 본인인증을 진행합니다.
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
              >
                {isLoading
                  ? "처리 중..."
                  : isSignup
                  ? emailVerified
                    ? "회원가입 완료"
                    : "회원가입 (이메일 인증 필요)"
                  : "로그인"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setEmailVerified(false);
                  setVerifiedEmail(null);
                  setPendingSignup(null);
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                {isSignup
                  ? "이미 계정이 있으신가요? 로그인"
                  : "계정이 없으신가요? 회원가입"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 이메일 인증 모달 */}
      <EmailVerifyModal
  isOpen={verifyModalOpen}
  onClose={() => setVerifyModalOpen(false)}
  onVerified={handleEmailVerified}
/>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-gray-300">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
