import { ArrowLeft, Globe, TrendingUp, Award, Users, Briefcase, DollarSign, Zap, Flame, MessageSquare, Plus, Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote, Code, Type, Palette, AlignLeft, AlignCenter, AlignRight, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import api from '../api/api';

interface CommunityWritePageProps {
  onBack: () => void;
  onSubmit?: () => void;
  mode?: 'create' | 'edit';
  initialPost?: {
    postId: number;
    title: string;
    content: string;
    postType: string;
    tags?: string[];
  };
}

export function CommunityWritePage({ onBack, onSubmit, mode = 'create', initialPost }: CommunityWritePageProps) {
  // 초기값 설정 (수정 모드일 경우 initialPost 사용)
  const [newPostTitle, setNewPostTitle] = useState(initialPost?.title || '');
  const [newPostContent, setNewPostContent] = useState(initialPost?.content || '');
  
  // postType → category 매핑
  const mapPostTypeToCategory = (postType: string): string => {
    if (postType === '이슈추천') return 'prediction';
    if (postType === '포인트자랑') return 'strategy';
    return 'free';
  };
  
  const [newPostCategory, setNewPostCategory] = useState(
    initialPost ? mapPostTypeToCategory(initialPost.postType) : 'free'
  );
  const [newPostTags, setNewPostTags] = useState(initialPost?.tags?.join(', ') || '');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageUploadTab, setImageUploadTab] = useState<'url' | 'file'>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Insert formatting at cursor position
  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newPostContent.substring(start, end);
    const newText = newPostContent.substring(0, start) + before + selectedText + after + newPostContent.substring(end);
    
    setNewPostContent(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
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
      // Use base64 data URL for file upload
      const imageMarkdown = `![${selectedImageFile?.name || '이미지'}](${imagePreview})`;
      insertAtCursor(imageMarkdown);
      setShowImageModal(false);
      setSelectedImageFile(null);
      setImagePreview('');
    }
  };

  // category → postType 매핑
  const mapCategoryToPostType = (category: string): string => {
    if (category === 'prediction') return '이슈추천';
    if (category === 'strategy') return '포인트자랑';
    return '일반';
  };

  const handleSubmit = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 토큰 확인
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
      if (onSubmit) {
        onSubmit();
      } else {
        onBack();
      }

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
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        } else if (status === 403) {
          errorMessage = message || '이 게시글을 수정할 권한이 없습니다. (작성자만 수정 가능)';
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
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Write Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block font-medium text-white mb-3">
                  제목
                </label>
                <Input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14"
                />
              </div>

              {/* Category Selection */}
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

              {/* Content */}
              <div>
                <label className="block font-medium text-white mb-3">
                  내용
                </label>
                
                {/* Formatting Toolbar */}
                <div className="bg-white/5 border border-white/10 rounded-t-xl p-3 flex flex-wrap items-center gap-2">
                  {/* Text Formatting */}
                  <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('**', '**')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="볼드"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('*', '*')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="이탤릭"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('<u>', '</u>')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="밑줄"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('~~', '~~')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="취소선"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                    <Type className="w-4 h-4 text-gray-400" />
                    <select
                      value={fontSize}
                      onChange={(e) => {
                        setFontSize(e.target.value);
                        const size = e.target.value;
                        let tag = '';
                        switch(size) {
                          case '12': tag = '<small>'; break;
                          case '20': tag = '<big>'; break;
                          case '24': tag = '## '; break;
                          case '32': tag = '# '; break;
                          default: tag = '';
                        }
                        if (tag) insertAtCursor(tag, size === '12' || size === '20' ? '</small>' : size === '24' || size === '32' ? '\n' : '');
                      }}
                      className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 hover:bg-white/10 transition-colors"
                    >
                      <option value="12">작게</option>
                      <option value="16">보통</option>
                      <option value="20">크게</option>
                      <option value="24">제목2</option>
                      <option value="32">제목1</option>
                    </select>
                  </div>

                  {/* Text Color */}
                  <div className="flex items-center gap-1 border-r border-white/10 pr-2 relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex items-center gap-1 p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="텍스트 색상"
                    >
                      <Palette className="w-4 h-4" />
                      <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: textColor }} />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-white/20 rounded-lg p-3 shadow-xl z-50">
                        <div className="grid grid-cols-6 gap-2 mb-2">
                          {['#FFFFFF', '#FF0000', '#FF6B00', '#FFD700', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF1493', '#8B00FF', '#00FF7F', '#FF4500'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setTextColor(color);
                                insertAtCursor(`<span style="color:${color}">`, '</span>');
                                setShowColorPicker(false);
                              }}
                              className="w-6 h-6 rounded border-2 border-white/20 hover:border-white transition-colors"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Lists */}
                  <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('- ')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="불릿 리스트"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('1. ')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="번호 리스트"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quote & Code */}
                  <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('> ')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="인용구"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('`', '`')}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="코드"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Link & Image */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowLinkModal(true)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="링크 추가"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="이미지 추가"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  placeholder="내용을 입력하세요"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-white/5 border border-white/10 border-t-0 rounded-t-none text-white placeholder:text-gray-500 min-h-[400px] resize-none"
                  rows={15}
                />
                <div className="mt-2 text-sm text-gray-400">
                  {newPostContent.length} / 10000 자
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-medium text-white mb-3">
                  태그
                </label>
                <Input
                  type="text"
                  placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 비트코인, 분석, 크립토)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
                {newPostTags && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {newPostTags.split(',').map((tag, index) => (
                      tag.trim() && (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium"
                        >
                          #{tag.trim()}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Notice */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  💡 <strong>TIP:</strong> 작성 중인 내용은 자동으로 저장되지 않습니다. 주기적으로 임시 저장을 해주세요.
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
                  onClick={() => {
                    // TODO: Implement save draft
                    console.log('Save draft');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 px-6"
                >
                  임시 저장
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 px-8 shadow-lg shadow-purple-500/50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {isSubmitting 
                    ? (mode === 'edit' ? '수정 중...' : '작성 중...')
                    : (mode === 'edit' ? '수정 완료' : '작성 완료')}
                </Button>
              </div>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">✍️ 좋은 게시글 작성 팁</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 명확하고 간결한 제목을 작성하세요</li>
                <li>• 적절한 카테고리를 선택하세요</li>
                <li>• 논리적으로 내용을 구성하세요</li>
                <li>• 관련 태그를 추가하여 검색성을 높이세요</li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="font-bold text-white mb-2">⚠️ 커뮤니티 규칙</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 욕설, 비방, 혐오 표현 금지</li>
                <li>• 허위 정보 유포 금지</li>
                <li>• 개인정보 노출 금지</li>
                <li>• 상업적 광고 금지</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-white mb-4">링크 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">링크 텍스트</label>
                <Input
                  type="text"
                  placeholder="링크 텍스트를 입력하세요"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
              </div>
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4"
                >
                  취소
                </Button>
                <Button
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-10 px-4"
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-white mb-4">이미지 추가</h3>
            <div className="space-y-4">
              {/* Tab Buttons */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setImageUploadTab('url');
                    setSelectedImageFile(null);
                    setImagePreview('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    imageUploadTab === 'url' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔗 URL 입력
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageUploadTab('file');
                    setImageUrl('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    imageUploadTab === 'file' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📁 파일 업로드
                </button>
              </div>
              {imageUploadTab === 'url' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">이미지 URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                  />
                  <p className="text-xs text-gray-400 mt-2">이미지 URL을 입력하세요</p>
                </div>
              )}
              {imageUploadTab === 'file' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">이미지 파일 선택</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="파일 선택"
                      value={selectedImageFile ? selectedImageFile.name : ''}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-10 px-4"
                    >
                      파일 선택
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImageFile(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImagePreview(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => {
                    setShowImageModal(false);
                    setImageUrl('');
                    setSelectedImageFile(null);
                    setImagePreview('');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4"
                >
                  취소
                </Button>
                <Button
                  onClick={insertImage}
                  disabled={!imageUrl && !selectedImageFile}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-10 px-4"
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}