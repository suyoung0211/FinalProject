import { useNavigate } from "react-router-dom";
import { CommunityPage } from "../components/CommunityPage";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";

export function CommunityPageContainer() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <>
      {/* 🔥 공통 헤더 */}
      <Header activeMenu="community" />

      {/* 🔥 헤더 때문에 전체 페이지 여백 확보 */}
      <div className="pt-24">
        <CommunityPage
          // 유저 정보 전달
          user={user
            ? {
              id: user.loginId?.toString() || "",
              name: user.nickname || "",
              email: user.email || "",
              points: user.points ?? 0,
            }
            : null}

          // 글쓰기 → 이동
          onWriteClick={() => navigate("/community/write")}

          // 게시글 클릭 → 이동
          onPostClick={(postId) => navigate(`/community/posts/${postId}`)}

          // 로그인 / 회원가입
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/login?mode=signup")}

          // 로그아웃
          onLogout={() => {
            logout();
            navigate("/");
          } } onBack={function (): void {
            throw new Error("Function not implemented.");
          } }        />
      </div>
    </>
  );
}
