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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nickname, setNickname] = useState(""); // 회원가입용 닉네임
  const [email, setEmail] = useState("");       // 로그인/회원가입 공통 이메일
  const [password, setPassword] = useState(""); // 로그인/회원가입 공통 비밀번호

  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ⭐ 회원가입 + 로그인 공통 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        // ⭐ 회원가입 요청
        await signupApi({
          email,
          password,
          nickname, // RegisterRequest에 맞춤
        });

        alert("회원가입 완료! 이제 로그인해주세요.");
        setIsSignup(false);
        setIsLoading(false);
        return;
      }

      // ⭐ 로그인 요청 (email/password)
      const res = await loginApi({ email, password });

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      const userData = res.data.user;

      // AuthContext 로그인 처리
      login(userData, accessToken, refreshToken);

      navigate("/");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10">
        {/* 왼쪽 소개 화면 */}
        <div className="hidden lg:flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">VoteMarket</span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              미래를 예측하는 <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                투표 플랫폼
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8">
              집단 지성으로 미래를 분석하고  
              <br />정확한 예측으로 포인트를 획득하세요!
            </p>
          </div>

          <div className="space-y-4">
            <Feature icon={<Sparkles className="w-5 h-5 text-purple-400" />} title="다양한 이슈" desc="정치 · 경제 · 엔터테인먼트 · 스포츠" />
            <Feature icon={<TrendingUp className="w-5 h-5 text-pink-400" />} title="실시간 확률" desc="실시간 업데이트되는 예측 시장" />
            <Feature icon={<LogIn className="w-5 h-5 text-indigo-400" />} title="보상 시스템" desc="정확한 예측 시 포인트 지급" />
          </div>
        </div>

        {/* 오른쪽 로그인/회원가입 */}
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
                <>
                  {/* nickname */}
                  <Field label="닉네임" icon={<User className="w-4 h-4" />}>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                    />
                  </Field>
                </>
              )}

              {/* 로그인/회원가입 공통 – email */}
              <Field label="이메일" icon={<Mail className="w-4 h-4" />}>
                <Input
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              {/* PW */}
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
              >
                {isLoading ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
              </Button>
            </form>

            {/* 회원가입/로그인 토글 */}
            <div className="text-center mt-6">
              <button
                onClick={() => setIsSignup(!isSignup)}
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

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/10 border border-purple-500/30 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
