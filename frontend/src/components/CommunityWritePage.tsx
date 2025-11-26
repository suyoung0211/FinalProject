import {
  ArrowLeft,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  DollarSign,
  Zap,
  Flame,
  MessageSquare,
  Plus,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import api from '../api/api';

interface CommunityWritePageProps {
  onBack: () => void;
  onSubmit: () => void;
  mode?: 'create' | 'edit';
  initialPost?: {
    postId: number;
    title: string;
    content: string;
    postType: string;   // 백엔드 기준: '일반' | '이슈추천' | '포인트자랑'
    tags: string[];
  };
}

export function CommunityWritePage({
  onBack,
  onSubmit,
  mode = 'create',
  initialPost,
}: CommunityWritePageProps) {
  console.log('현재 모드:', mode);

  /** 🔁 postType(백엔드 문자열) → 프론트 카테고리 id 매핑 */
  const mapPostTypeToCategory = (postType: string): string => {
    switch (postType) {
      case '이슈추천':
        return 'prediction';
      case '포인트자랑':
        return 'strategy';
      default:
        return 'free';
    }
  };

  /** 🔁 프론트 카테고리 id → postType(백엔드 문자열) 매핑
   *
   * 프론트: 'free', 'prediction', 'strategy', ...
   * 백엔드: '일반', '이슈추천', '포인트자랑'
   */
  const mapCategoryToPostType = (category: string): string => {
    const categoryMap: Record<string, string> = {
      prediction: '이슈추천', // 예측 분석 → 이슈추천
      strategy: '포인트자랑', // 전략 공유 → 포인트자랑
      // 나머지는 일반
      free: '일반',
      politics: '일반',
      business: '일반',
      crypto: '일반',
      sports: '일반',
      entertainment: '일반',
    };
    return categoryMap[category] || '일반';
  };

  // ----------------- 상태 초기값 (수정 모드면 initialPost로 채우기) -----------------
  const [newPostTitle, setNewPostTitle] = useState(initialPost?.title ?? '');
  const [newPostContent, setNewPostContent] = useState(initialPost?.content ?? '');
  const [newPostCategory, setNewPostCategory] = useState(
    initialPost ? mapPostTypeToCategory(initialPost.postType) : 'free',
  );
  const [newPostTags, setNewPostTags] = useState(
    initialPost?.tags?.join(', ') ?? '',
  );

  // 수정 모드에서 initialPost가 나중에 도착할 수도 있으니 한 번 더 동기화
  useEffect(() => {
    if (initialPost) {
      setNewPostTitle(initialPost.title);
      setNewPostContent(initialPost.content);
      setNewPostCategory(mapPostTypeToCategory(initialPost.postType));
      setNewPostTags(initialPost.tags ? initialPost.tags.join(', ') : '');
    }
  }, [initialPost]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadTab, setImageUploadTab] = useState<'url' | 'file'>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'prediction', label: '예측 분석', icon: TrendingUp },
    { id: 'strategy', label: '전략 공유', icon: Award },
    { id: 'politics', label: '정치', icon: Users },
    { id: 'business', label: '경제', icon: Briefcase },
    { id: 'crypto', label: '크립토', icon: DollarSign },
    { id: 'sports', label: '스포츠', icon: Zap },
    { id: 'entertainment', label: '엔터', icon: Flame },
    { id: 'free', label: '자유', icon: MessageSquare },
  ];

  // ====== 마크다운 유틸 ======
  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPostContent.substring(start, end);

    const newText =
      newPostContent.substring(0, start) +
      before +
      selectedText +
      after +
      newPostContent.substring(end);

    setNewPostContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const insertLink = () => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertAtCursor(linkMarkdown);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    if (imageUploadTab === 'url' && imageUrl) {
      const imageMarkdown = `![이미지](${imageUrl})`;
      insertAtCursor(imageMarkdown);
      setShowImageModal(false);
      setImageUrl('');
    } else if (imageUploadTab === 'file' && imagePreview) {
      const imageMarkdown = `![${selectedImageFile?.name || '이미지'}](${imagePreview})`;
      insertAtCursor(imageMarkdown);
      setShowImageModal(false);
      setSelectedImageFile(null);
      setImagePreview('');
    }
  };

  // ====== 작성 / 수정 submit ======
  const handleSubmit = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 토큰 확인 (프론트에서 한 번 더 체크)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/login';
      return;
    }

    try {
      setIsSubmitting(true);

      const postType = mapCategoryToPostType(newPostCategory);

      const requestBody = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        postType,
        // TODO: tags를 백엔드에 저장하게 되면 여기서 같이 전송
        // tags: newPostTags
        //   .split(',')
        //   .map((t) => t.trim())
        //   .filter((t) => t.length > 0),
      };

      let res;
      if (mode === 'edit') {
        if (!initialPost?.postId) {
          alert('수정할 게시글 ID가 없습니다.');
          return;
        }
        console.log('✏️ 게시글 수정 요청:', {
          url: `/community/posts/${initialPost.postId}`,
          body: requestBody,
        });
        res = await api.put(`/community/posts/${initialPost.postId}`, requestBody);
      } else {
        console.log('📝 게시글 작성 요청:', {
          url: '/community/posts',
          body: requestBody,
        });
        res = await api.post('/community/posts', requestBody);
      }

      console.log('✅ 성공 응답:', res.data);

      // 부모 콜백 호출 (ex. 커뮤니티 목록으로 이동)
      onSubmit();

      // 새 글 작성 모드일 때만 폼 리셋
      if (mode === 'create') {
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('free');
        setNewPostTags('');
      }
    } catch (error: any) {
  console.error('❌ 게시글 작성/수정 실패:', error);

  let errorMessage = '게시글 처리에 실패했습니다.';

  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data;

    if (status === 401) {
      errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      // ✅ 401일 때만 토큰 삭제 + 로그인 이동
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else if (status === 403) {
      // ✅ 403에서는 토큰 삭제/리다이렉트 하지 말고 메시지만
      errorMessage =
        message || '이 게시글을 수정할 권한이 없습니다. (작성자만 수정 가능)';
    } else if (status === 400) {
      errorMessage = message || '입력한 정보를 확인해주세요.';
    } else {
      errorMessage = message || `서버 오류가 발생했습니다. (${status})`;
    }
  } else if (error.request) {
    errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
  }

  alert(errorMessage);
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-white">
              {mode === 'edit' ? '게시글 수정' : '새 게시글 작성'}
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            {/* 제목 */}
            <div className="space-y-6">
              <div>
                <label className="block font-medium text-white mb-3">제목</label>
                <Input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block font-medium text-white mb-3">
                  카테고리
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewPostCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                          newPostCategory === category.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="block font-medium text-white mb-3">내용</label>

                {/* 툴바 */}
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-t-xl flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertAtCursor('**', '**')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="굵게"
                  >
                    <Bold className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor('*', '*')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="기울임"
                  >
                    <Italic className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor('<u>', '</u>')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="밑줄"
                  >
                    <Underline className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-white/20" />
                  <button
                    type="button"
                    onClick={() => insertAtCursor('- ', '')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="목록"
                  >
                    <List className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor('1. ', '')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="번호 목록"
                  >
                    <ListOrdered className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor('> ', '')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="인용"
                  >
                    <Quote className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-white/20" />
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="링크"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="이미지"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                {/* Textarea */}
                <Textarea
                  ref={textareaRef}
                  placeholder="내용을 입력하세요..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[300px] resize-none rounded-t-none rounded-b-xl"
                  rows={12}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">
                    {newPostContent.length}자
                  </span>
                </div>
              </div>

              {/* 태그 */}
              <div>
                <label className="block font-medium text-white mb-3">태그</label>
                <Input
                  type="text"
                  placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 비트코인, 분석, 크립토)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
                {newPostTags && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {newPostTags
                      .split(',')
                      .map((tag, index) =>
                        tag.trim() ? (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium"
                          >
                            #{tag.trim()}
                          </span>
                        ) : null,
                      )}
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  💡 <strong>TIP:</strong> 작성 중인 내용은 자동으로 저장되지 않습니다.
                  중요한 내용은 주기적으로 복사해 두세요.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
              <Button
                onClick={onBack}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 px-8"
              >
                취소
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    console.log('임시 저장 (TODO)');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 px-6"
                >
                  임시 저장
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newPostTitle || !newPostContent || isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 px-8 shadow-lg shadow-purple-500/50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {isSubmitting
                    ? mode === 'edit'
                      ? '수정 중...'
                      : '작성 중...'
                    : mode === 'edit'
                    ? '수정 완료'
                    : '작성 완료'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 링크 삽입 모달 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">링크 삽입</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  링크 텍스트 (선택사항)
                </label>
                <Input
                  type="text"
                  placeholder="표시할 텍스트"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                취소
              </Button>
              <Button
                onClick={insertLink}
                disabled={!linkUrl}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white"
              >
                삽입
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 삽입 모달 */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">이미지 삽입</h3>
            <div className="space-y-4">
              {/* 탭 */}
              <div className="flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setImageUploadTab('url')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    imageUploadTab === 'url'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => setImageUploadTab('file')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    imageUploadTab === 'file'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  파일
                </button>
              </div>

              {/* URL 입력 */}
              {imageUploadTab === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    이미지 URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}

              {/* 파일 업로드 */}
              {imageUploadTab === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    이미지 파일
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    파일 선택
                  </Button>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setSelectedImageFile(null);
                  setImagePreview('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                취소
              </Button>
              <Button
                onClick={insertImage}
                disabled={imageUploadTab === 'url' ? !imageUrl : !imagePreview}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white"
              >
                삽입
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
