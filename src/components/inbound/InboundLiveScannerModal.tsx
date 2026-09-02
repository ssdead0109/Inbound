import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, Zap, ZapOff, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera } from '@capacitor/camera';
import { soundHelper } from '../../utils/soundHelper';
import { registerBackHandler } from '../../utils/backHandler';

interface InboundLiveScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

const VIEWFINDER_ID = 'inbound-live-qr-reader';

export const InboundLiveScannerModal: React.FC<InboundLiveScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasScannedRef = useRef(false);

  // Stop camera stream cleanly
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        setIsScanning(false);
        setTorchOn(false);
        setHasTorch(false);
      }
    }
  }, []);

  // Handle successful code detection -> Beep, Haptic, Close modal, Launch inspection
  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      const clean = decodedText.trim();
      if (!clean) return;

      soundHelper.playScanBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      await stopScanner();
      onClose();

      setTimeout(() => {
        onScan(clean);
      }, 50);
    },
    [onScan, onClose, stopScanner]
  );

  // Start real-time live camera stream
  const startScanner = useCallback(async () => {
    if (hasScannedRef.current) return;
    setCameraError(null);

    try {
      // 1. In native app, request Android OS camera permission first
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await CapCamera.checkPermissions();
          if (perm.camera !== 'granted') {
            const req = await CapCamera.requestPermissions({ permissions: ['camera'] });
            if (req.camera !== 'granted') {
              setCameraError('스마트폰 앱 설정에서 카메라 권한을 허용해주세요.');
              return;
            }
          }
        } catch (pErr) {
          console.warn('Native permission check warning:', pErr);
        }
      }

      const el = document.getElementById(VIEWFINDER_ID);
      if (!el) return;

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(VIEWFINDER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        { facingMode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {
          // ignore scan frame errors (continues scanning automatically at 15fps)
        }
      );

      setIsScanning(true);

      // Check for torch capability
      try {
        const capabilities: any = scannerRef.current.getRunningTrackCapabilities?.();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsScanning(false);
      let msg = '카메라를 실행할 수 없습니다. 브라우저/앱 설정에서 카메라 접근 권한을 확인해주세요.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        msg = '카메라 접근 권한이 거부되었습니다. 스마트폰 설정에서 카메라 권한을 허용해주세요.';
      } else if (err?.name === 'NotFoundError') {
        msg = '사용 가능한 카메라 장치를 찾을 수 없습니다.';
      }
      setCameraError(msg);
    }
  }, [facingMode, handleDecoded]);

  // Toggle torch / flash
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Toggle front/back camera
  const handleToggleFacingMode = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Static image file upload scan fallback
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCameraError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(VIEWFINDER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      handleDecoded(decodedText);
    } catch (err: any) {
      console.warn('Image file scan error:', err);
      soundHelper.playErrorBuzzer();
      setCameraError('선택한 사진에서 선명한 QR 코드를 감지하지 못했습니다. 조명이 밝은 곳에서 촬영한 이미지를 선택해주세요.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Mount/Unmount logic: waits 300ms for modal DOM to finish mounting with non-zero dimensions
  useEffect(() => {
    if (isOpen) {
      hasScannedRef.current = false;
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // Register smartphone hardware back button
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler('inboundLiveScannerModal', 95, () => {
      onClose();
      return true;
    });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>QR 코드 실시간 스캔</span>
                {isScanning && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                QR을 비추면 자동으로 인식되어 검수가 시작됩니다
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Video Viewfinder */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="relative w-full aspect-square max-h-[320px] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
            
            {/* The Live Video Container Element */}
            <div id={VIEWFINDER_ID} className="w-full h-full object-cover"></div>

            {/* Targeting Box Graphic & Moving Laser Line */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] overflow-hidden relative">
                  {/* 4 Corner Accents */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-indigo-400" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-indigo-400" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-indigo-400" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-indigo-400" />
                  
                  {/* Animated Red Laser Scan Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-scan-line" />
                </div>
              </div>
            )}

            {/* Camera Connecting Spinner */}
            {!isScanning && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-slate-300 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-xs font-semibold">카메라를 연결하고 있습니다...</p>
              </div>
            )}

            {/* Bottom Hint Overlay */}
            {isScanning && (
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full border border-slate-700 font-medium shadow-xs">
                  ⚡ QR 코드를 사각형 안에 비추면 즉시 인식됩니다
                </span>
              </div>
            )}
          </div>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-semibold">{cameraError}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>카메라 재시작</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  사진 선택
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Toolbar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
          
          {/* File Upload Alternative */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span>사진/앨범 선택</span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Flashlight / Torch Toggle (if supported) */}
            {hasTorch && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  torchOn
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="조명 플래시 켜기/끄기"
              >
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {/* Switch Camera (Front/Back) */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer active:scale-95"
              title="전면/후면 카메라 전환"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>카메라 전환</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
