import { Button } from "../../components/ui/button";

export function VoteCompleteModal({ amount, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-white text-2xl font-bold mb-6">투표 완료 🎉</h2>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-gray-400 text-sm">배팅 포인트</div>
          <div className="text-white text-3xl font-bold">{amount}pt</div>
        </div>

        <Button className="w-full bg-purple-600 text-white" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
