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
  // ✅ Access Token에서 가져옴
  id?: number;                // ✅추가 Access Token의 "id"
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
  // 앱이 새로 켜질 때는 localStorage에 있는 accessToken만 믿을 수 있다.
  // 그래서 토큰을 먼저 디코딩해서 최소한의 id/nickname/role만 세팅한다.
  // 나머지 상세 정보는 /api/users/me 같은 API로 가져와서 user에 덮어쓴다.
  // --------------------------------------------------
  useEffect(() => {
    const savedAccess = localStorage.getItem("accessToken");

    if (!savedAccess) return;
      setToken(savedAccess);

      try {
        // 1) 토큰 디코딩해서 유저 정보 세팅
        const decoded: any = jwtDecode(savedAccess); // JWT payload 디코딩
        
        // 1차: 토큰 기반 최소 정보 (id, nickname, role)
        const baseUser: UserType = {
          id: decoded.id,                       // ✅ 토큰에 있는 id
          nickname: decoded.nickname || "",
          role: decoded.role || "USER",
          level: 1,   // 임시값
          points: 0,  // 임시값
        };

        setUser(baseUser);

      // 2차: 서버에서 상세 프로필 가져와 덮어쓰기
      getMyInfoApi()
        .then((res: any) => {
          setUser({
            ...res.data,        // loginId, level, points, avatarIcon, ...
            id: decoded.id,     // ✅ id는 여전히 토큰 것 유지
          });
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("accessToken");
        });

    } catch (err) {
      console.error("AccessToken decode 실패", err);
      setUser(null);
      setToken(null);
      localStorage.removeItem("accessToken");
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

    // 서버에서 최신 유저 정보 가져오기
    const userRes = await getMyInfoApi();

    setUser({
      ...userRes.data,   // 여전히 id는 없음
      id: decoded.id,    // ✅ 토큰에서 가져온 id만 합쳐줌
    });
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
