import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "../../components/ui/button";

export function VoteHeader({
  onBack,
  isAIVote,
}: {
  onBack: () => void;
  isAIVote: boolean;
}) {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </Button>

            <div className="h-6 w-px bg-white/20" />

            <span className="text-white font-semibold">Mak'gora</span>
            <span className="text-xs text-gray-400 ml-2">
              {isAIVote ? "AI 마켓" : "설문형 일반투표"}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
}
