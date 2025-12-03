import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "../styles/cropper.css";

import { Button } from "../components/ui/button";
import { X, Save, Image as ImageIcon } from "lucide-react";

export function ProfileImageEditor({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImageURL(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!imageURL || !imageRef.current) return;

    if (cropperRef.current) cropperRef.current.destroy();

    cropperRef.current = new Cropper(imageRef.current, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 1,
      background: false,
      movable: true,
      zoomable: true,
      dragMode: "move",
    });
  }, [imageURL]);

  const handleSave = () => {
    if (!cropperRef.current) return;

    const canvas = cropperRef.current.getCroppedCanvas({
      width: 500,
      height: 500,
      fillColor: "#fff",
    });

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], selectedFile?.name || "profile.jpg", {
        type: "image/jpeg",
      });
      onSave(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-6xl border border-white/10">
        <h2 className="text-lg font-bold text-white mb-4">프로필 사진 수정</h2>

        <label className="flex items-center gap-2 bg-white/10 text-white p-3 rounded-md cursor-pointer hover:bg-white/20">
          <ImageIcon className="w-5 h-5 text-purple-300" />
          <span>{selectedFile ? selectedFile.name : "파일 선택"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </label>

        {/* 이미지 영역 */}
        <div className="w-full h-[600px] bg-black/30 rounded-md mt-4 overflow-hidden border border-white/10">justify-center border border-white/10">
          {imageURL ? (
            <img
                ref={imageRef}
                src={imageURL}
                className="w-full h-full object-contain"
              />
          ) : (
            <span className="text-gray-400">이미지 선택해주세요</span>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <Button onClick={onCancel} className="bg-red-500/40 hover:bg-red-500/60 text-white">
            <X className="w-4 h-4" /> 취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageURL}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-4 h-4" /> 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
