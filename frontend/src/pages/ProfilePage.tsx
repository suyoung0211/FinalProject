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
import { ProfileImageEditor } from "./ProfileImageEditor";

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

  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [communityActivities, setCommunityActivities] = useState<
    RecentCommunityActivity[]
  >([]);
  const [voteActivities, setVoteActivities] = useState<RecentVoteActivity[]>([]);

  // ================================
  // 🔹 프로필 정보
  // ================================
  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.get("/profile/me");
      setUser(res.data);
    };
    loadProfile();
  }, []);

  // ================================
  // 🔹 최근 활동
  // ================================
  useEffect(() => {
    api
      .get("/profile/activities/community", { params: { limit: 10 } })
      .then((res) => setCommunityActivities(res.data));

    api
      .get("/profile/activities/votes", { params: { limit: 10 } })
      .then((res) => setVoteActivities(res.data));
  }, []);

  if (!user) return <div className="text-white p-8">불러오는 중...</div>;

  // ================================
  // 🔹 프로필 사진 저장
  // ================================
  const handleSaveProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/profile/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 백엔드에서 업로드된 URL 반환
    setUser((prev) => (prev ? { ...prev, avatarIcon: res.data } : prev));
    setIsEditingPhoto(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-purple-400" />
              프로필 정보
            </h2>

            <Button
              onClick={() => setIsEditingPhoto(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              사진 수정
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <div className="relative">
              {/* 프로필 이미지 + 프레임 */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={
                    user.avatarIcon ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  className="object-cover w-full h-full"
                />

                {user.profileFrame && (
                  <img
                    src={user.profileFrame}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                )}
              </div>

              {/* 닉네임 배지 */}
              {user.profileBadge && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <img src={user.profileBadge} className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* 정보 */}
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

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                    <Coins className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">
                      {user.points.toLocaleString()} P
                    </span>
                  </div>
                </div>

                {user.role === "ADMIN" && (
                  <div className="px-4 py-2 bg-red-500/20 rounded-full border border-red-500/40 text-red-300">
                    관리자
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
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

          {/* Vote */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
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
          </div>
        </div>
      </div>

      {/* 🔥 프로필 사진 편집 모달 */}
      {isEditingPhoto && (
        <ProfileImageEditor
          onCancel={() => setIsEditingPhoto(false)}
          onSave={handleSaveProfileImage}
        />
      )}
    </div>
  );
}
