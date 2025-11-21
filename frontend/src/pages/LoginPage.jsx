import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { loginApi } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginApi(email, password);
      login(data.user, data.accessToken, data.refreshToken);
      navigate("/");
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>로그인</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          로그인
        </button>
      </form>

      {/* ⭐ 회원가입 버튼 */}
      <button
        onClick={() => navigate("/register")}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10,
          background: "#ccc",
        }}
      >
        회원가입
      </button>
    </div>
  );
}
