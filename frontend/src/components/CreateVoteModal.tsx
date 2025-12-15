import { X, Calendar, Tag, FileText, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface CreateVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (voteData: {
    question: string;
    description: string;
    category: string;
    endDate: string;
  }) => void;
}

export function CreateVoteModal({ isOpen, onClose, onCreate }: CreateVoteModalProps) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('politics');
  const [endDateTime, setEndDateTime] = useState('');

  const categories = [
    { value: 'politics', label: '정치', color: 'from-red-500 to-orange-500' },
    { value: 'business', label: '경제', color: 'from-blue-500 to-cyan-500' },
    { value: 'crypto', label: '크립토', color: 'from-yellow-500 to-orange-500' },
    { value: 'sports', label: '스포츠', color: 'from-green-500 to-emerald-500' },
    { value: 'entertainment', label: '엔터테인먼트', color: 'from-pink-500 to-purple-500' },
    { value: 'tech', label: '기술', color: 'from-indigo-500 to-purple-500' },
  ];

  const handleSubmit = () => {
    if (!question.trim() || !endDateTime) {
      alert('질문과 종료일시를 모두 입력해주세요.');
      return;
    }

    onCreate?.({
      question,
      description,
      category,
      endDate: endDateTime,
    });

    // Reset form
    setQuestion('');
    setDescription('');
    setCategory('politics');
    setEndDateTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white">새로운 투표 생성</h2>
          <p className="text-purple-100 text-sm mt-1">이슈에 대한 예측 마켓을 개설하세요</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-purple-400" />
              질문
            </label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 2025년 비트코인이 15만 달러를 돌파할까요?"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-400">
              명확하고 YES/NO로 답할 수 있는 질문을 작성하세요
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-purple-400" />
              설명 (선택사항)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="투표에 대한 추가 정보나 배경 설명을 작성하세요..."
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
              rows={4}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <Tag className="w-4 h-4 text-purple-400" />
              카테고리
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    category === cat.value
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* End Date and Time */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <Calendar className="w-4 h-4 text-purple-400" />
              종료 날짜 및 시간
            </label>
            <Input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <p className="text-xs text-gray-400">
              투표가 종료되는 날짜와 시간을 선택하세요
            </p>
          </div>

          {/* Preview Card */}
          {question && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">미리보기</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                    categories.find(c => c.value === category)?.color
                  } text-white`}>
                    {categories.find(c => c.value === category)?.label}
                  </span>
                  {endDateTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(endDateTime).toLocaleDateString('ko-KR')}
                      {endDateTime && ` ${new Date(endDateTime).toLocaleTimeString('ko-KR')}`} 종료
                    </span>
                  )}
                </div>
                <h3 className="text-white font-medium">{question}</h3>
                {description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <div className="flex-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-green-400 font-bold">YES</div>
                    <div className="text-xs text-gray-400 mt-1">0%</div>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                    <div className="text-red-400 font-bold">NO</div>
                    <div className="text-xs text-gray-400 mt-1">0%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 hover:bg-white/10"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            투표 생성
          </Button>
        </div>
      </div>
    </div>
  );
}