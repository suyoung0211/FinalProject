// src/context/AuthContext.tsx
import { 
  createContext, 
  useState, 
  useEffect, 
  ReactNode, 
  Dispatch,
  SetStateAction
} from "react";
import { logoutApi, getMyInfoApi, refreshTokenApi } from "../api/authApi"; // refreshTokenApi 추가
import { jwtDecode } from "jwt-decode"; // 액세스 토큰 디코딩용

// --------------------------------------------------
// 🔹 유저 정보 타입
// --------------------------------------------------
export interface UserType {
  loginId?: string;           // 토큰에 있을 경우
  nickname: string;
  level: number;
  points: number;
  profileImage?: string;
  profileBackground?: string;
  avatarIcon?: string;        // 추가: 로그인 응답 기준
  profileFrame?: string;
  profileBadge?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}

// --------------------------------------------------
// 🔹 AuthContext 타입 정의
// --------------------------------------------------
export interface AuthContextType {
  user: UserType | null;
  token: string | null;

  setUser: Dispatch<SetStateAction<UserType | null>>;
  setToken: Dispatch<SetStateAction<string | null>>;

  login: (user: UserType, access: string) => void;
  logout: () => void;

  refreshUser: () => Promise<void>; // 액세스 토큰 재발급 + 유저 정보 갱신
}

// --------------------------------------------------
// 🔹 Context 생성
// --------------------------------------------------
export const AuthContext = createContext<AuthContextType | null>(null);

// --------------------------------------------------
// 🔹 Provider 컴포넌트
// --------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --------------------------------------------------
  // ⭐ 초기 로드: localStorage Access Token 기반 유저 세팅
  // --------------------------------------------------
  useEffect(() => {
  const savedAccess = localStorage.getItem("accessToken");

  if (savedAccess) {
    setToken(savedAccess);

    try {
      const decoded: any = jwtDecode(savedAccess);

      const newUser = {
        loginId: decoded.loginId,
        nickname: decoded.nickname,
        level: decoded.level || 1,
        points: decoded.points || 0,
        avatarIcon: decoded.avatarIcon,
        profileFrame: decoded.profileFrame,
        profileBadge: decoded.profileBadge,
        role: decoded.role,
      };

      console.log("Initial user from token:", newUser);

      // 🔹 1) 일단 토큰 기반으로 기본 정보 넣고
      setUser(newUser);

      // 🔹 2) 서버에서 최신 프로필 정보를 가져와서 갱신
      getMyInfoApi()
        .then((res: any) => {
          console.log("서버 최신 프로필:", res.data);
          setUser(res.data);
        })
        .catch(() => console.error("초기 프로필 불러오기 실패"));

    } catch (err) {
      console.error("AccessToken decode 실패 → 서버에서 유저 정보 요청", err);

      getMyInfoApi()
        .then((res: any) => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("accessToken");
        });
    }
  }
}, []);

  // --------------------------------------------------
  // ⭐ 로그인 처리
  // --------------------------------------------------
  const login = (userData: UserType, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
  };

  // --------------------------------------------------
  // ⭐ 로그아웃 처리
  // --------------------------------------------------
  const logout = async () => {
    try {
      await logoutApi(); // 서버 세션/refresh token 제거
    } catch (_) {}

    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  // --------------------------------------------------
  // ⭐ 토큰 재발급 + 유저 정보 갱신
  // --------------------------------------------------
  const refreshUser = async () => {
  try {
    const res = await refreshTokenApi();
    const newAccessToken = res.data.accessToken;

    localStorage.setItem("accessToken", newAccessToken);
    setToken(newAccessToken);

    const decoded: any = jwtDecode(newAccessToken);

    setUser({
      loginId: decoded.loginId,
      nickname: decoded.nickname,
      level: decoded.level || 1,
      points: decoded.points || 0,
      avatarIcon: decoded.avatarIcon,
      profileFrame: decoded.profileFrame,
      profileBadge: decoded.profileBadge,
      role: decoded.role,
    });

    // ⭐ 프레임/뱃지/포인트 등 최신 정보 DB에서 다시 가져오기
    const profile = await getMyInfoApi();
    setUser(profile.data);

  } catch (err) {
    console.error("토큰 갱신 실패", err);
    logout();
  }
};
  // --------------------------------------------------
  // 🔹 Context 제공
  // --------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,   // 외부에서 직접 업데이트 가능
        setToken,
        login,
        logout,
        refreshUser, // 외부에서 호출 가능
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
