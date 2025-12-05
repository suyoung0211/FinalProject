// ProfilePage.tsx
import {
  ArrowLeft,
  User,
  Mail,
  Coins,
  Calendar,
  Edit2,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import api from "../api/api";
import ProfileAvatar from "./ProfileAvatar";
import { ProfileImageEditor } from "./ProfileImageEditor";
import { ProfileEditorModal } from "./ProfileEditorModal";

interface UserProfile {
  nickname: string;
  points: number;
  avatarIcon?: string | null;
  profileFrame?: string | null;
  profileBadge?: string | null;
  email?: string;
  role: string;
  level: number;
}

interface ProfileAvatarProps {
  avatarUrl?: string;
  frameUrl?: string;
  size?: number; // px 크기 (32, 48, 96 등)
}

interface RecentCommunityActivity {
  activityId: number;
  type: "POST" | "COMMENT";
  postId: number;
  postTitle: string;
  contentPreview: string;
  createdAt: string;
}

interface RecentVoteActivity {
  voteUserId: number;
  voteId: number;
  voteTitle: string;
  issueTitle?: string | null;
  choiceId: number;
  choiceText: string;
  pointsBet: number;
  rewardAmount: number | null;
  result: "WIN" | "LOSE" | "PENDING" | "CANCELLED";
  voteCreatedAt: string;
  voteEndAt: string;
  createdAt: string;
}


export function ProfilePage({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditingAppearance, setIsEditingAppearance] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [communityActivities, setCommunityActivities] = useState<
    RecentCommunityActivity[]
  >([]);

  const [voteActivities, setVoteActivities] = useState<RecentVoteActivity[]>([]);

  //===============================
  // 프로필 정보 불러오기
  //===============================
  useEffect(() => {
  const loadProfile = async () => {
    const res = await api.get("/profile/me");

    setUser({
      ...res.data,
      email: res.data.loginId, // ← 이메일로 쓰기 위해 매핑
    });
  };
  loadProfile();
}, []);

  //===============================
  // 활동 내역
  //===============================
  useEffect(() => {
    api
      .get("/profile/activities/community", { params: { limit: 10 } })
      .then((res) => setCommunityActivities(res.data));

    api
      .get("/profile/activities/votes", { params: { limit: 10 } })
      .then((res) => setVoteActivities(res.data));
  }, []);

  if (!user) return <div className="text-white p-8">불러오는 중...</div>;

  //===============================
  // 이미지 경로 처리
  //===============================
  const resolveImage = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:8080/${path}`;
  };

  //===============================
  // 프로필 사진 저장
  //===============================
  const handleSaveProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/profile/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setUser((prev) => (prev ? { ...prev, avatarIcon: res.data } : prev));
    setIsEditingPhoto(false);
  };

  //===============================
  // 프로필 정보 저장 (모달에서 호출)
  //===============================
  const handleProfileUpdate = async (updated: { nickname: string; email?: string }) => {
  try {
    await api.post("/profile/update", {
      nickname: updated.nickname,
      loginId: updated.email, 
    });

    setIsEditingProfile(false);
  } catch (e) {
    console.error("프로필 업데이트 실패", e);
  }
};

  //------------------------------
  // JSX 렌더링
  //------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">

        {/*============== 프로필 섹션 ==============*/}
        {/*======================================
    프로필 섹션 (보기 모드 / 편집 모드 전환)
=======================================*/}
<div className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-3xl p-8 mb-6">

  {/* ===================== 제목 + 버튼 ===================== */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
      <User className="w-6 h-6 text-purple-400" />
      프로필 정보
    </h2>

    {!isEditingProfile ? (
      <Button
        onClick={() => setIsEditingProfile(true)}
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
      >
        <Edit2 className="w-4 h-4 mr-2" />
        편집
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button
          onClick={() => handleProfileUpdate({ nickname: user.nickname, email: user.email })}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          저장
        </Button>

        <Button
          onClick={() => setIsEditingProfile(false)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        >
          취소
        </Button>
      </div>
    )}
  </div>

  {/* ===================== 보기 모드 ===================== */}
  {!isEditingProfile && (
    <div className="flex items-start gap-6">

      {/* 프로필 이미지 */}
      <ProfileAvatar
        avatarUrl={resolveImage(user.avatarIcon)}
        frameUrl={resolveImage(user.profileFrame)}
        size={100}
      />

      {/* 텍스트 정보 */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">
          {user.nickname}
        </h1>

        {user.email && (
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
            <Coins className="w-5 h-5 text-white" />
            <span className="text-white font-bold">
              {user.points.toLocaleString()} P
            </span>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ===================== 편집 모드 ===================== */}
  {isEditingProfile && (
    <div className="flex items-start gap-6">

      {/* 이미지 + 프레임 편집 버튼 */}
      <div className="relative">
        <div className="relative flex items-center justify-center">
          <ProfileAvatar
            avatarUrl={resolveImage(user.avatarIcon)}
            frameUrl={resolveImage(user.profileFrame)}
            size={96}
          />
        
          
        </div>
      </div>

      {/* 편집 입력창 */}
      <div className="flex-1 space-y-4 max-w-md ml-6">

        {/* 닉네임 */}
        <div>
          <label className="text-gray-300 text-sm">닉네임</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 mt-[6px]"
            value={user.nickname}
            onChange={(e) =>
              setUser(prev => prev ? { ...prev, nickname: e.target.value } : prev)
            }
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="text-gray-300 text-sm">이메일</label>
          <input
            type="email"
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 mt-[6px] mb-[16px]"
            value={user.email ?? ""}
            onChange={(e) =>
              setUser(prev => prev ? { ...prev, email: e.target.value } : prev)
            }
          />
        </div>
            {/* 프레임 & 뱃지 편집 버튼 */}

        <div className="mt-4 flex items-center gap-5" >
          {/* 테두리 & 뱃지 설정 */}
          {/* 프로필 사진 변경 */}
          <Button
            onClick={() => setIsEditingPhoto(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg"
          >
            프로필 사진 변경
          </Button>
          <Button
            onClick={() => setIsEditingAppearance(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
          >
            프로필 테두리 & 뱃지 설정하기
          </Button>
                  
        </div>
      </div>
    </div>
  )}
</div>

        {/*============== 활동 섹션 ==============*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* community */}
          <div className="bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              최근 커뮤니티 활동
            </h2>

            {communityActivities.length === 0 && (
              <p className="text-gray-400">아직 활동이 없어요.</p>
            )}

            {communityActivities.map((a) => (
              <div
                key={a.activityId}
                className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3"
              >
                <p className="text-white font-medium">{a.postTitle}</p>
                <p className="text-gray-400 text-sm">{a.contentPreview}</p>
              </div>
            ))}
          </div>

          {/* vote */}
          <div className="bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              최근 투표 활동
            </h2>

            {voteActivities.length === 0 && (
              <p className="text-gray-400">아직 투표 기록이 없어요.</p>
            )}

            {voteActivities.map((v) => (
              <div
                key={v.voteUserId}
                className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3"
              >
                <p className="text-white font-medium">{v.voteTitle}</p>
                <p className="text-gray-400 text-sm">{v.choiceText} 선택</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*============== 모달 ==============*/}


      {/* 프로필 이미지 편집 */}
      {isEditingPhoto && (
        <ProfileImageEditor
          onCancel={() => setIsEditingPhoto(false)}
          onSave={handleSaveProfileImage}
        />
      )}

      {isEditingAppearance && (
        <ProfileEditorModal
          user={user}
          onClose={() => setIsEditingAppearance(false)}
          onUpdated={(updated) => {
            setUser(updated);
            setIsEditingAppearance(false);
          }}
        />
      )}

    </div>
  );
}