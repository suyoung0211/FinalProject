import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyInfoApi } from "../api/authApi";

export default function HomePage() {
  const { token, logout } = useContext(AuthContext);  // ⭐ token 가져오기
  const [myInfo, setMyInfo] = useState(null);

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

      <h2>{myInfo ? `${myInfo.nickname}님 환영합니다` : "로딩 중..."}</h2>

      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
