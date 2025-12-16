import { Button } from "../../ui/button";

export function ConfirmModal({
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[420px] space-y-4">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <p className="text-sm text-gray-300">{description}</p>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="bg-white/10 text-white"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            className="bg-red-600"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}