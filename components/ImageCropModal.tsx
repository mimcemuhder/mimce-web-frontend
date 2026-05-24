import React, { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { getCroppedImageFile } from '../utils/cropImage';

type ImageCropModalProps = {
  imageSrc: string;
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onComplete: (file: File, previewUrl: string) => void;
};

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  aspect = 16 / 9,
  title = 'Görseli kırp',
  onCancel,
  onComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(file);
      onComplete(file, previewUrl);
    } catch {
      alert('Kırpma başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Kapat"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative h-[min(50vh,360px)] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-5 py-4 space-y-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <ZoomIn size={16} className="text-gray-400 shrink-0" />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={processing || !croppedAreaPixels}
              className="px-4 py-2 rounded-lg bg-primary text-navy text-sm font-bold flex items-center gap-2 hover:bg-primary-dark disabled:opacity-60"
            >
              <Check size={16} />
              {processing ? 'Hazırlanıyor...' : 'Kırp ve kullan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
