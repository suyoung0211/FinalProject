import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyInfoApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { token, logout } = useContext(AuthContext);
  const [myInfo, setMyInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        if (!token) return;  // 토큰 없으면 중단

        const data = await getMyInfoApi(token);  // ⭐ 토큰 전달
        setMyInfo(data);
      } catch (e) {
        console.log("⚠ myInfo load error:", e);
      }
    }
    load();
  }, [token]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>홈페이지</h1>

      {/* 로그인 상태 */}
      {token ? (
        <>
          <h2>{myInfo ? `${myInfo.nickname}님 환영합니다` : "로딩 중..."}</h2>

          <button
            onClick={() => {
              logout();
              navigate("/login"); // ⭐ 로그아웃 후 로그인 페이지로 이동
            }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          {/* 로그아웃 상태일 때 보여줄 부분 */}
          <h2>로그인이 필요합니다</h2>
          <button onClick={() => navigate("/login")}>
            로그인 페이지로 이동
          </button>
        </>
      )}
    </div>
  );
}
