import { X, Calendar, Tag, FileText, Clock, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { createNormalVote } from "../../api/normalVoteApi";

interface CreateVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: () => void;
}

export function CreateVoteModal({ isOpen, onClose, onCreate }: CreateVoteModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("politics");
  const [endDateTime, setEndDateTime] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 옵션 그룹 목록
  const [options, setOptions] = useState<
    { optionTitle: string; type: "YESNO" | "YESNODRAW" }[]
  >([]);

  const categories = [
    { value: "politics", label: "정치", color: "from-red-500 to-orange-500" },
    { value: "business", label: "경제", color: "from-blue-500 to-cyan-500" },
    { value: "crypto", label: "크립토", color: "from-yellow-500 to-orange-500" },
    { value: "sports", label: "스포츠", color: "from-green-500 to-emerald-500" },
    { value: "entertainment", label: "엔터테인먼트", color: "from-pink-500 to-purple-500" },
    { value: "technology", label: "기술", color: "from-indigo-500 to-purple-500" },
  ];

  // 🔥 옵션 그룹 추가 (최대 5개)
const addOptionGroup = () => {
  if (options.length >= 5) {
    alert("옵션은 최대 5개까지만 추가할 수 있습니다.");
    return;
  }
  setOptions([...options, { optionTitle: "", type: "YESNO" }]);
};

  // 🔥 옵션 그룹 삭제
  const removeOptionGroup = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // 🔥 옵션 제목 변경
  const updateOptionTitle = (index: number, title: string) => {
    const updated = [...options];
    updated[index].optionTitle = title;
    setOptions(updated);
  };

  // 🔥 옵션 타입 변경
  const updateOptionType = (index: number, type: "YESNO" | "YESNODRAW") => {
    const updated = [...options];
    updated[index].type = type;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !endDateTime) {
      alert("질문과 종료일시를 모두 입력해주세요.");
      return;
    }

    if (options.length === 0) {
      alert("옵션을 최소 1개 이상 추가해주세요.");
      return;
    }

    const payload = {
      title,
      description,
      category: category.toUpperCase(),
      endAt: endDateTime,
      options: options.map((opt) => ({
        optionTitle: opt.optionTitle,
        choices: opt.type === "YESNO" ? ["YES", "NO"] : ["YES", "NO", "DRAW"],
      })),
    };

    try {
      setLoading(true);
      console.log("📌 [FRONT] Normal Vote 생성 요청:", payload);

      await createNormalVote(payload);

      alert("투표가 성공적으로 생성되었습니다!");
      onCreate?.();

      // reset
      setTitle("");
      setDescription("");
      setCategory("politics");
      setEndDateTime("");
      setOptions([]);

      onClose();
    } catch (err) {
      console.error("❌ Normal Vote 생성 실패:", err);
      alert("투표 생성 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white">새로운 투표 생성</h2>
          <p className="text-purple-100 text-sm mt-1">옵션 및 선택지까지 커스터마이징 가능</p>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

          {/* 📌 질문 입력 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-purple-400" />
              질문
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2025년 비트코인이 15만 달러를 돌파할까요?"
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          {/* 📌 설명 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-purple-400" />
              설명 (선택사항)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              rows={3}
              placeholder="투표에 대한 추가 정보를 입력하세요."
            />
          </div>

          {/* 📌 카테고리 */}
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
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 📌 종료 시간 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <Calendar className="w-4 h-4 text-purple-400" />
              종료 날짜 및 시간
            </label>
            <Input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="bg-white/10 border-white/30 text-white"
            />
          </div>

          {/* 📌 옵션 그룹들 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
  <h3 className="text-white font-medium">
    옵션 그룹 <span className="text-purple-300 text-sm ml-1">({options.length}/5)</span>
  </h3>

  <Button
    onClick={addOptionGroup}
    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
  >
    <Plus className="w-4 h-4" /> 옵션 추가
  </Button>
</div>

            {options.map((opt, index) => (
              <div key={index} className="p-4 bg-purple/5 border border-white/10 rounded-xl space-y-3">
                
                {/* 🔥 옵션 제목 */}
                <Input
                  value={opt.optionTitle}
                  onChange={(e) => updateOptionTitle(index, e.target.value)}
                  placeholder="옵션 제목 (예: 승리팀 예측)"
                  className="bg-purple/10 border-white/20 text-white"
                />

                {/* 🔥 선택지 타입 선택 */}
                <select
  value={opt.type}
  onChange={(e) => updateOptionType(index, e.target.value as any)}
  className="w-full bg-purple-700/40 border-purple-400/30 text-white p-2 rounded-lg placeholder-purple-200"
>
  <option className="text-black" value="YESNO">YES / NO</option>
  <option className="text-black" value="YESNODRAW">YES / NO / DRAW</option>
</select>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeOptionGroup(index)}
                  className="text-red-400 flex items-center gap-1 text-sm"
                >
                  <Trash className="w-4 h-4" /> 삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 border-white/20 hover:bg-white/10">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? "생성 중..." : "투표 생성"}
          </Button>
        </div>
      </div>
    </div>
  );
}
