import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, RefreshCw, Check, Plus, Trash2, X, Zap, ZapOff, AlertCircle } from 'lucide-react';
import { registerBackHandler } from '../../utils/backHandler';

interface InboundCameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: (photos: string[]) => void;
}

export const InboundCameraCaptureModal: React.FC<InboundCameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddPhotos,
}) => {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch { /* ignore */ }
      });
      streamRef.current = null;
    }
    setIsStreaming(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Start live camera stream (Prefer 1.0x standard main rear camera)
  const startStream = useCallback(async () => {
    stopStream();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);

      // Check flash/torch capability
      try {
        const track = stream.getVideoTracks()[0];
        const caps: any = track?.getCapabilities?.();
        if (caps && caps.torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('[CameraCapture] Camera start failed:', err);
      let msg = '카메라를 실행할 수 없습니다.';
      if (err?.name === 'NotAllowedError') {
        msg = '스마트폰 설정에서 앱의 카메라 권한을 허용해주세요.';
      } else if (err?.name === 'NotReadableError') {
        msg = '카메라가 다른 앱에서 사용 중입니다.';
      } else if (err?.message) {
        msg = err.message;
      }
      setCameraError(msg);
      setIsStreaming(false);
    }
  }, [stopStream]);

  // Toggle flash torch
  const handleToggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch failed:', err);
    }
  };

  // Shutter Click -> Take Snapshot from live video canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Scale to max 1600px width for high quality + reasonable memory size
    const maxDim = 1600;
    let w = video.videoWidth || 1280;
    let h = video.videoHeight || 720;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Audio/Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(60);
    }

    setCurrentSnapshot(dataUrl);
  };

  // Action 1: Retake photo (Discard current preview and resume live camera)
  const handleRetake = () => {
    setCurrentSnapshot(null);
  };

  // Action 2: Next Photo (Save current snapshot and resume live camera for continuous snapping!)
  const handleNextPhoto = () => {
    if (currentSnapshot) {
      setCapturedPhotos((prev) => [...prev, currentSnapshot]);
      setCurrentSnapshot(null);
    }
  };

  // Action 3: Done & Save all photos
  const handleFinish = () => {
    const finalPhotos = [...capturedPhotos];
    if (currentSnapshot) {
      finalPhotos.push(currentSnapshot);
    }
    if (finalPhotos.length > 0) {
      onAddPhotos(finalPhotos);
    }
    handleClose();
  };

  // Remove one photo from captured list
  const handleRemovePhoto = (idx: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClose = () => {
    stopStream();
    setCapturedPhotos([]);
    setCurrentSnapshot(null);
    onClose();
  };

  // Mount/Unmount lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhotos([]);
      setCurrentSnapshot(null);
      const timer = setTimeout(() => {
        startStream();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopStream();
      };
    } else {
      stopStream();
    }
  }, [isOpen, startStream, stopStream]);

  // Android hardware back button
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler('cameraCaptureModal', 98, () => {
      if (currentSnapshot) {
        handleRetake();
        return true;
      }
      handleClose();
      return true;
    });
  }, [isOpen, currentSnapshot]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in text-white select-none">
      
      {/* Top Navigation Bar */}
      <div className="px-4 py-3 bg-slate-950/80 backdrop-blur-md flex items-center justify-between border-b border-slate-800/80 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>현장 연속 사진촬영</span>
              {capturedPhotos.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] px-2 py-0.5 rounded-full font-black">
                  {capturedPhotos.length}장 보관 중
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasTorch && !currentSnapshot && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                torchOn
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="플래시 조명"
            >
              {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder / Snapshot Preview Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* Mode A: Live Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            currentSnapshot ? 'hidden' : 'block'
          }`}
        />

        {/* Mode B: Just Captured Snapshot Preview */}
        {currentSnapshot && (
          <div className="w-full h-full relative flex items-center justify-center bg-black animate-in fade-in zoom-in-95 duration-150">
            <img
              src={currentSnapshot}
              alt="촬영된 사진 미리보기"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 inset-x-0 text-center pointer-events-none">
              <span className="bg-slate-950/80 backdrop-blur-xs text-amber-300 text-xs px-3.5 py-1.5 rounded-full border border-amber-400/30 font-bold shadow-md">
                📸 방금 찍은 사진입니다. 확인할까요?
              </span>
            </div>
          </div>
        )}

        {/* Camera Connecting Spinner */}
        {!isStreaming && !cameraError && !currentSnapshot && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-slate-300">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs font-semibold">카메라를 켜고 있습니다...</p>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="p-4 mx-4 bg-rose-950/90 border border-rose-700 text-rose-200 rounded-2xl flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs font-semibold">{cameraError}</p>
            <button
              type="button"
              onClick={startStream}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              카메라 다시 연결
            </button>
          </div>
        )}
      </div>

      {/* Mini Thumbnails Strip (Shows photos captured in current session) */}
      {capturedPhotos.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar z-20">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">
            담긴 사진 ({capturedPhotos.length}):
          </span>
          {capturedPhotos.map((photoUrl, idx) => (
            <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0 group">
              <img src={photoUrl} alt={`촬영 ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-0 right-0 p-0.5 bg-rose-600/90 text-white rounded-bl transition-all cursor-pointer"
                title="삭제"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
              <span className="absolute bottom-0 left-0 bg-black/70 text-white text-[8px] font-mono px-1">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Control Toolbar */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 z-20">
        
        {/* CASE 1: Snapshot Just Taken (Review Mode: [재촬영] vs [다음장 촬영] vs [완료]) */}
        {currentSnapshot ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Retake Button */}
            <button
              type="button"
              onClick={handleRetake}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>🔄 재촬영 (버리기)</span>
            </button>

            {/* Next Photo (Continuous Capture) */}
            <button
              type="button"
              onClick={handleNextPhoto}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>➕ 다음장 계속 촬영</span>
            </button>

            {/* Done Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-indigo-600/40 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>✓ 이대로 완료 ({capturedPhotos.length + 1}장)</span>
            </button>
          </div>
        ) : (
          /* CASE 2: Live Viewfinder Mode (Big Shutter Button & Finish button) */
          <div className="flex items-center justify-between">
            {/* Left Spacer or Cancel */}
            <div className="w-20">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded cursor-pointer"
              >
                취소
              </button>
            </div>

            {/* Center: Big Shutter Button */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleSnap}
                disabled={!isStreaming}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white flex items-center justify-center p-1 cursor-pointer transition-all active:scale-90 disabled:opacity-50 shadow-xl"
                title="사진 촬영"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-slate-200 transition-colors" />
              </button>
              <span className="text-[11px] text-slate-400 font-medium mt-1.5">터치하여 찰칵 촬영</span>
            </div>

            {/* Right: Done Button (if already has captured photos) */}
            <div className="w-20 flex justify-end">
              {capturedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>완료({capturedPhotos.length})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
