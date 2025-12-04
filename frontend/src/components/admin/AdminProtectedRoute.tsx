// src/components/admin/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { refreshTokenApi } from "../../api/authApi";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // 허용할 role 배열
}

export function AdminProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, setUser, token, logout } = useAuth();
  const [loading, setLoading] = useState(true); // role 검사 완료 여부
  const [allowed, setAllowed] = useState(false); // 접근 허용 여부

  useEffect(() => {
    const checkRole = async () => {
      // console.log("🔹 ProtectedRoute: role 검사 시작");
      // console.log("현재 user 상태:", user);

      // 현재 role이 있으면 바로 체크
      let currentRole = user?.role;

      // localStorage에서 토큰 가져오기
      let accessToken = token || localStorage.getItem("accessToken");
      // console.log("토큰 확인:", accessToken);

      // 액세스 토큰 갱신 함수
      const refreshAccessToken = async () => {
        try {
          // console.log("🔄 토큰 만료, refresh 시도");
          const res = await refreshTokenApi();
          const newAccessToken = res.data.accessToken;
          // console.log("🔹 새로 발급된 토큰:", newAccessToken);
          localStorage.setItem("accessToken", newAccessToken);
          return newAccessToken;
        } catch (err) {
          console.error("❌ 토큰 갱신 실패", err);
          logout();
          return null;
        }
      };

      // 1️⃣ user가 없거나 role이 없는 경우 → 토큰으로 확인
      if (!currentRole && accessToken) {
        try {
          const decoded = JSON.parse(atob(accessToken.split(".")[1]));
          // console.log("🔹 토큰 디코딩 결과:", decoded);

          const now = Math.floor(Date.now() / 1000);

          // 토큰 만료 확인
          if (decoded.exp && decoded.exp < now) {
            // console.log("⏳ 토큰 만료됨, refresh 필요");
            const newToken = await refreshAccessToken();
            if (!newToken) {
              // console.log("❌ refresh 실패 → 접근 불가");
              return; // refresh 실패 시 함수 종료
            }

            accessToken = newToken;
            const newDecoded = JSON.parse(atob(newToken.split(".")[1]));
            currentRole = newDecoded.role;

            // user state 갱신
            setUser({ ...newDecoded });
            // console.log("🔹 갱신 후 user:", newDecoded);

          } else {
            // 토큰 만료되지 않음 → user 세팅
            currentRole = decoded.role;
            setUser({ ...decoded });
            // console.log("✅ 토큰 유효 → user 설정:", decoded);
          }
        } catch (err) {
          console.error("❌ AccessToken decode 실패", err);
          logout();
          return; // decode 실패 시 접근 불가
        }
      }

      // 2️⃣ role 체크
      if (!roles || (currentRole && roles.includes(currentRole))) {
        // console.log("✅ role 허용됨:", currentRole);
        setAllowed(true);
      } else {
        // console.log("❌ role 허용되지 않음:", currentRole);
      }

      setLoading(false);
    };

    checkRole();
  }, [user, token, setUser, logout, roles]);

  // 🔄 role 검사 완료 전까지 렌더링 안함
  if (loading) {
    // console.log("🔄 ProtectedRoute: 로딩 중...");
    return null;
  }

  // ❌ 접근 허용되지 않으면 홈으로 이동
  if (!allowed) {
    // console.log("🚫 ProtectedRoute: 접근 불가 → 홈으로 이동");
    return <Navigate to="/" replace />;
  }

  // 🎯 접근 허용 시 자식 컴포넌트 렌더링
  // console.log("🎯 ProtectedRoute: 접근 허용, 자식 컴포넌트 렌더링");
  return <>{children}</>;
}
