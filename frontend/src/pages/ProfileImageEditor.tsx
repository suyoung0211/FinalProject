import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "../components/ui/button";
import { X, Save, Image as ImageIcon } from "lucide-react";

interface ProfileImageEditorProps {
  onCancel: () => void;
  onSave: (file: File) => void;
}

export function ProfileImageEditor({ onCancel, onSave }: ProfileImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 크롭 영역 계산 콜백
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // dataURL -> HTMLImageElement
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  // 저장 클릭
  const handleSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) {
        alert("이미지를 선택하고 크롭 영역을 지정해 주세요.");
        return;
      }

      const image = await createImage(imageSrc);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("이미지 편집을 할 수 없습니다.");
        return;
      }

      // 정사각형으로 잘라서 저장
      const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        size,
        size,
        0,
        0,
        size,
        size
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );

      if (!blob) {
        alert("이미지 저장에 실패했습니다.");
        return;
      }

      const file = new File(
        [blob],
        fileName || "avatar.png",
        { type: "image/png" }
      );
      onSave(file);
    } catch (err) {
      console.error(err);
      alert("이미지 편집 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">프로필 사진 수정</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4 space-y-4">
          {/* 파일 선택 */}
          <label className="block">
            <span className="block text-sm text-gray-300 mb-1">파일 선택</span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <span>이미지 업로드</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-400 truncate max-w-xs">
                {fileName || "선택된 파일이 없습니다."}
              </span>
            </div>
          </label>

          {/* 크롭 영역 (큰 뷰포트) */}
          <div className="mt-2 w-full h-[420px] bg-black/60 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
            {imageSrc ? (
              <div className="relative w-full h-full">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={false}
                  cropShape="round"      // 동그란 프로필 미리보기
                  objectFit="cover"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <ImageIcon className="w-8 h-8 text-gray-500" />
                이미지를 업로드하면 여기에서 미리 볼 수 있어요.
              </div>
            )}
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <Button
            onClick={onCancel}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!imageSrc}
          >
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
