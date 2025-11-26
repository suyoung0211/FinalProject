import { useNavigate } from "react-router-dom";
import { CommunityPage } from "../components/CommunityPage";
import { useAuth } from "../hooks/useAuth";

export function CommunityPageContainer() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <CommunityPage
      // 뒤로가기
      onBack={() => navigate("/")}

      // 헤더 우측 유저 정보
      user={
        user
          ? {
              id: user.id?.toString() || "",
              name: user.name || user.username || "",
              email: user.email || "",
              points: 0, // TODO: 실제 포인트 필드 생기면 교체
            }
          : null
      }

      // 글쓰기 버튼 → 글쓰기 페이지로 이동
      onWriteClick={() => navigate("/community/write")}
      onPostClick={(postId) => navigate(`/community/posts/${postId}`)}

      // (원하면 나중에 게시글 상세도 이렇게 연결)
      // onPostClick={(postId) => navigate(`/community/posts/${postId}`)}

      // 로그인/회원가입/로그아웃
      onLogin={() => navigate("/login")}
      onSignup={() => navigate("/login?mode=signup")}
      onLogout={() => {
        logout();
        navigate("/"); // 로그아웃 후 메인으로 보내고 싶으면 추가
      }}

      // 상단 네비게이션
      onNews={() => navigate("/")}
      onLeaderboard={() => navigate("/leaderboard")} // 나중에 구현
      onPointsShop={() => navigate("/shop")}         // 나중에 구현
      onProfile={() => navigate("/profile")}         // 나중에 구현
    />
  );
}
