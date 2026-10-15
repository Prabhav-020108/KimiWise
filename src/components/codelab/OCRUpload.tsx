import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import type { OcrResponse } from '../../services/aiService';

interface OCRUploadProps {
  onExtracted: (result: OcrResponse) => void;
  onClose?: () => void;
}

export const OCRUpload: React.FC<OCRUploadProps> = ({ onExtracted, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (base64Image: string) => {
      setIsProcessing(true);
      setError(null);
      setProgressStep(1);

      // Simulation steps for user visual feedback while vision model runs
      const stepTimer1 = setTimeout(() => setProgressStep(2), 1200);
      const stepTimer2 = setTimeout(() => setProgressStep(3), 2600);

      try {
        const result = await aiService.performOcr(base64Image);
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        if (result.extractedCode && result.extractedCode.trim()) {
          onExtracted(result);
        } else {
          setError('No legible code was detected in the photo. Please take a clearer, well-lit photo.');
        }
      } catch (err: any) {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setError(err?.message || 'Vision OCR processing failed. Please check AI connection.');
      } finally {
        setIsProcessing(false);
        setProgressStep(0);
      }
    },
    [onExtracted]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, HEIC).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      setPreview(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      setPreview(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close OCR"
        >
          <X size={16} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <Camera size={16} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800">Vision OCR — Handwritten Code Scanner</h3>
          <p className="text-[11px] text-slate-400">
            Photograph your notebook or homework — Gemma 4 Vision reads and digitizes your code
          </p>
        </div>
      </div>

      {/* Dropzone / Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
          isProcessing
            ? 'border-blue-400 bg-blue-50/30 cursor-wait'
            : preview
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2.5 py-2">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800">
                {progressStep === 1 && '1. Enhancing handwriting contrast...'}
                {progressStep === 2 && '2. Detecting characters and structure...'}
                {progressStep >= 3 && '3. Gemma 4 Vision converting to code...'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Please wait a moment</span>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={preview}
              alt="Handwritten code preview"
              className="max-h-36 rounded-lg object-contain border border-slate-200 shadow-xs"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Photo uploaded
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setError(null);
                }}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                Click to upload or drag & drop handwritten code image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WebP • Works best with clear handwriting and good lighting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-600 p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
