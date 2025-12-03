interface Props {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
  searchQuery,
  setSearchQuery,
}: Props) {
  return (
    <div className="mb-8 mt-6 flex justify-between items-center">

      {/* 카테고리 버튼 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-[70%]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selected === cat
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold"
                : "text-gray-300 hover:text-white bg-white/10 border border-white/10"
            }`}
          >
            {cat === "all" ? "전체" : cat}
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="검색어 입력"
        className="px-4 py-2 w-48 rounded-full bg-white/10 text-white border border-white/20
                   focus:outline-none focus:border-purple-400 transition"
      />
    </div>
  );
}
