// ------------------------------------------------------------
// src/components/articles/CategoryFilter.tsx
// ------------------------------------------------------------
interface Props {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="mb-6 border-b border-white/10">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
    </div>
  );
}
