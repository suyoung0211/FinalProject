import { useState } from 'react';
import { LogIn, Mail, Lock, ArrowLeft, User, Sparkles, TrendingUp, Eye, EyeOff, Chrome, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (userData?: { username?: string; name?: string; email?: string; avatar?: string }) => void;
}

export function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 임시 로그인 (실제 구현 시 백엔드 연동 필요)
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        username: username,
        name: isSignup ? name : username,
        email: email,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">VoteMarket</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              미래를 예측하는<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                투표 플랫폼
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              집단 지성의 힘으로 미래를 예측하고,<br />
              포인트를 획득하세요
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">다양한 이슈</h3>
                <p className="text-gray-400 text-sm">정치, 경제, 스포츠, 엔터 등 모든 분야</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">실시간 예측</h3>
                <p className="text-gray-400 text-sm">실시간으로 변화하는 예측 확률</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">포인트 리워드</h3>
                <p className="text-gray-400 text-sm">정확한 예측으로 포인트 획득</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-500/50">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignup ? '회원가입' : '로그인'}
              </h1>
              <p className="text-gray-400">
                {isSignup ? '새로운 계정을 만들어보세요' : '투표 플랫폼에 오신 것을 환영합니다'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4" />
                      이름
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignup}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4" />
                      아이디
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="user123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={isSignup}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </>
              )}

              {!isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    아이디
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="user123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              )}

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={isSignup}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-300">
                  <Lock className="w-4 h-4" />
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300">
                    <input type="checkbox" className="rounded border-gray-600 text-purple-600 focus:ring-purple-500" />
                    <span>로그인 상태 유지</span>
                  </label>
                  <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                    비밀번호 찾기
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    처리중...
                  </div>
                ) : (
                  isSignup ? '회원가입' : '로그인'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">또는</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Github className="w-5 h-5 mr-2" />
                Github
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-center text-gray-500">
                계속 진행하면 <span className="text-purple-400 hover:underline cursor-pointer">이용약관</span> 및{' '}
                <span className="text-purple-400 hover:underline cursor-pointer">개인정보 처리방침</span>에 동의하게 됩니다.
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-purple-500/10 backdrop-blur border border-purple-500/30 rounded-xl">
            <p className="text-sm text-purple-200 text-center">
              💡 <strong>임시 데모:</strong> 아무 이메일/비밀번호로 로그인 가능
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}