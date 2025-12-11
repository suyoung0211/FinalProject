// ProfilePage.tsx
import {
  ArrowLeft,
  User,
  Mail,
  Coins,
  Calendar,
  Edit2,
  FileText,
  MessageSquare,
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

  const [editForm, setEditForm] = useState({
    nickname: "",
    email: "",
  });

  const [communityActivities, setCommunityActivities] = useState<
    RecentCommunityActivity[]
  >([]);

  const [voteActivities, setVoteActivities] = useState<RecentVoteActivity[]>([]);

  //===============================
  // 1) 프로필 정보 불러오기
  //===============================
  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.get("/profile/me");

      setUser({
        ...res.data,
        email: res.data.loginId, // 이메일로 사용
      });
    };
    loadProfile();
  }, []);

  //===============================
  // 2) 활동 내역 불러오기
  //===============================
  useEffect(() => {
    api
      .get("/profile/activities/community", { params: { limit: 10 } })
      .then((res) => setCommunityActivities(res.data));

    api
      .get("/profile/activities/votes", { params: { limit: 10 } })
      .then((res) => setVoteActivities(res.data));
  }, []);

  //===============================
  // 3) 편집 모드일 때 form에 초기값 넣기
  //===============================
  useEffect(() => {
    if (isEditingProfile && user) {
      setEditForm({
        nickname: user.nickname,
        email: user.email ?? "",
      });
    }
  }, [isEditingProfile, user]);

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
  // 프로필 정보 저장
  //===============================
  const handleProfileUpdate = async (updated: {
    nickname: string;
    email?: string;
  }) => {
    try {
      await api.post("/profile/update", {
        nickname: updated.nickname,
        loginId: updated.email,
      });

      setUser((prev) =>
        prev ? { ...prev, nickname: updated.nickname, email: updated.email } : prev
      );

      setIsEditingProfile(false);
    } catch (e) {
      console.error("프로필 업데이트 실패", e);
    }
  };

  //-------------------------------------
  // 렌더링
  //-------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ---------------------- HEADER ---------------------- */}
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
        {/* user가 아직 로딩 중일 때 */}
        {!user ? (
          <div className="text-white p-8 text-lg">불러오는 중...</div>
        ) : (
          <>
            {/* ---------------------- 프로필 영역 ---------------------- */}
            <div className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-3xl p-8 mb-6">
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
                      onClick={() =>
                        handleProfileUpdate({
                          nickname: editForm.nickname,
                          email: editForm.email,
                        })
                      }
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

              {/* -------------------- 보기 모드 -------------------- */}
              {!isEditingProfile && (
                <div className="flex items-start gap-6 translate-x-[20px]">
                  <div className="relative mt-4">
                    <ProfileAvatar
                      avatarUrl={resolveImage(user.avatarIcon)}
                      frameUrl={resolveImage(user.profileFrame)}
                      size={100}
                    />
                  </div>

                  <div className="flex-1 translate-x-5">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {user.nickname}
                      </h1>

                      {user.profileBadge &&
                        (user.profileBadge.startsWith("http") ? (
                          <img
                            src={resolveImage(user.profileBadge)}
                            alt="badge"
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-5xl leading-none -translate-y-[4px] inline-block">
                            {user.profileBadge}
                          </span>
                        ))}
                    </div>

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

              {/* -------------------- 편집 모드 -------------------- */}
              {isEditingProfile && (
                <div className="flex items-start gap-6">
                  <div className="relative translate-x-9 translate-y-9 gap-1">
                    <ProfileAvatar
                      avatarUrl={resolveImage(user.avatarIcon)}
                      frameUrl={resolveImage(user.profileFrame)}
                      size={150}
                    />
                  </div>

                  <div className="flex-1 space-y-4 max-w-md ml-20">
                    <div>
                      <label className="text-gray-300 text-sm">닉네임</label>
                      <input
                        type="text"
                        className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 mt-[6px]"
                        value={editForm.nickname}
                        onChange={(e) =>
                          setEditForm({ ...editForm, nickname: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 text-sm">이메일</label>
                      <input
                        type="email"
                        className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 mt-[6px] mb-[16px]"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-5">
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

            {/* ---------------------- 활동 섹션 ---------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  최근 커뮤니티 활동
                </h2>

                {communityActivities.length === 0 ? (
                  <p className="text-gray-400">아직 활동이 없어요.</p>
                ) : (
                  communityActivities.map((a) => (
                    <div
                      key={a.activityId}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* 타입 아이콘 */}
                        <div className={`flex-shrink-0 mt-1 ${
                          a.type === "POST" 
                            ? "text-blue-400" 
                            : "text-purple-400"
                        }`}>
                          {a.type === "POST" ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <MessageSquare className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* 타입 배지 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              a.type === "POST"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}>
                              {a.type === "POST" ? "게시글" : "댓글"}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(a.createdAt).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          
                          {/* 게시글 제목 */}
                          <p className="text-white font-medium mb-1">
                            {a.postTitle}
                          </p>
                          
                          {/* 내용 미리보기 */}
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {a.contentPreview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  최근 투표 활동
                </h2>

                {voteActivities.length === 0 ? (
                  <p className="text-gray-400">아직 투표 기록이 없어요.</p>
                ) : (
                  voteActivities.map((v) => (
                    <div
                      key={v.voteUserId}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3"
                    >
                      <p className="text-white font-medium">{v.voteTitle}</p>
                      <p className="text-gray-400 text-sm">{v.choiceText} 선택</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 모달들 */}
      {isEditingPhoto && (
        <ProfileImageEditor
          onCancel={() => setIsEditingPhoto(false)}
          onSave={handleSaveProfileImage}
        />
      )}

      {isEditingAppearance && user && (
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
