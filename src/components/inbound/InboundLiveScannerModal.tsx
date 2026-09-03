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
  const [scanSuccess, setScanSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Multi-lens & Zoom Control State
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number>(0);
  const [hasZoom, setHasZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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
        setHasZoom(false);
      }
    }
  }, []);

  // Handle successful code detection -> Beep, Haptic, Visual feedback, Close modal, Launch inspection
  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      const clean = decodedText.trim();
      if (!clean) return;

      setScanSuccess(true);
      soundHelper.playScanBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // 120ms instant visual feedback, then immediate stop and callback
      setTimeout(async () => {
        await stopScanner();
        onClose();
        setTimeout(() => {
          onScan(clean);
        }, 30);
      }, 120);
    },
    [onScan, onClose, stopScanner]
  );

  /**
   * 스마트폰의 여러 렌즈(0.5x 초광각, 1.0x 표준 메인, 망원, 전면) 중
   * 초광각을 피해 가장 선명한 '표준 메인(1.0x)' 카메라를 지능적으로 찾아냅니다.
   */
  const pickMainStandardCameraIndex = (cameras: Array<{ id: string; label: string }>): number => {
    if (!cameras || cameras.length === 0) return 0;
    if (cameras.length === 1) return 0;

    // 1. 후면 카메라 인덱스만 추출
    const backIndices: number[] = [];
    cameras.forEach((cam, idx) => {
      const lbl = cam.label.toLowerCase();
      if (!/front|user|전면|앞|selfie/i.test(lbl)) {
        backIndices.push(idx);
      }
    });

    const candidates = backIndices.length > 0 ? backIndices : cameras.map((_, i) => i);
    if (candidates.length === 1) return candidates[0];

    // 2. 명시적으로 "main", "primary", "standard", "1x", "기본"이 있는 렌즈
    const explicitMain = candidates.find((i) =>
      /main|primary|standard|기본|1x|normal/i.test(cameras[i].label)
    );
    if (explicitMain !== undefined) return explicitMain;

    // 3. 초광각(ultra, 0.5, super) 및 망원 제외
    const nonUltra = candidates.filter((i) =>
      !/ultra|0\.5|tele|zoom|depth|macro|wide 0/i.test(cameras[i].label)
    );
    if (nonUltra.length === 1) return nonUltra[0];
    if (nonUltra.length >= 2) {
      // 안드로이드 Galaxy 등에서는 0번이 초광각, 1번이 표준 1x 메인인 경우가 90% 이상
      return nonUltra[1];
    }

    // 4. 안드로이드 일반 후면 카메라: 0번(초광각) 대신 1번(표준 1x) 우선 선택
    if (candidates.length >= 2) {
      return candidates[1];
    }

    return candidates[0];
  };

  // Start real-time live camera stream
  const startScanner = useCallback(async (forcedCameraId?: string) => {
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

      const scanConfig = {
        fps: 24, // Optimized frame rate (24 FPS) for fast barcode acquisition
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const boxEdge = Math.max(200, Math.floor(minEdge * 0.7));
          return { width: boxEdge, height: boxEdge };
        },
        aspectRatio: 1.0,
      };

      // 2. 전체 카메라 목록 조회 및 '표준 메인(1.0x)' 카메라 선택
      let cameraDeviceSelected: string | { facingMode: string } = { facingMode };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setAvailableCameras(cameras);

          if (forcedCameraId) {
            cameraDeviceSelected = forcedCameraId;
          } else {
            const bestIndex = pickMainStandardCameraIndex(cameras);
            setActiveCameraIndex(bestIndex);
            cameraDeviceSelected = cameras[bestIndex].id;
          }
        }
      } catch (camListErr) {
        console.warn('[InboundScanner] getCameras fallback to facingMode:', camListErr);
      }

      try {
        await scannerRef.current.start(
          cameraDeviceSelected,
          scanConfig,
          (decodedText) => {
            handleDecoded(decodedText);
          },
          () => {
            // ignore scan frame errors (continues scanning automatically at 24fps)
          }
        );
      } catch (streamErr) {
        console.warn('Camera ID start failed, fallback to generic facingMode:', streamErr);
        await scannerRef.current.start(
          { facingMode },
          scanConfig,
          (decodedText) => {
            handleDecoded(decodedText);
          },
          () => {}
        );
      }

      setIsScanning(true);

      // 3. 카메라 Capabilities(플래시, 디지털 줌) 확인
      try {
        const capabilities: any = scannerRef.current.getRunningTrackCapabilities?.();
        if (capabilities) {
          setHasTorch(Boolean(capabilities.torch));
          if (capabilities.zoom && capabilities.zoom.max > 1) {
            setHasZoom(true);
          }
        }
      } catch {
        setHasTorch(false);
        setHasZoom(false);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsScanning(false);
      let msg = '카메라를 실행할 수 없습니다. 스마트폰 앱 설정에서 카메라 접근 권한을 확인해주세요.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        msg = '카메라 접근 권한이 거부되었습니다. 스마트폰 앱 설정에서 카메라 권한을 허용해주세요.';
      } else if (err?.name === 'NotFoundError') {
        msg = '사용 가능한 카메라 장치를 찾을 수 없습니다.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = '카메라가 다른 앱에서 사용 중이거나 하드웨어 접근이 지연되고 있습니다. 앱을 재실행해주세요.';
      } else if (err?.message) {
        msg = `카메라 실행 오류: ${err.message}`;
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

  // 렌즈 순환 전환 (1x 표준 ➔ 0.5x 광각 ➔ 망원 등)
  const handleSwitchNextLens = async () => {
    if (availableCameras.length <= 1) {
      await stopScanner();
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
      return;
    }

    const nextIndex = (activeCameraIndex + 1) % availableCameras.length;
    setActiveCameraIndex(nextIndex);
    await stopScanner();
    const nextCamId = availableCameras[nextIndex].id;
    startScanner(nextCamId);
  };

  // 디지털 줌 토글 (1.0x <-> 2.0x)
  const handleToggleZoom = async () => {
    if (!scannerRef.current) return;
    try {
      const nextZoom = zoomLevel === 1 ? 2 : 1;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ zoom: nextZoom } as any],
      });
      setZoomLevel(nextZoom);
    } catch (err) {
      console.warn('Zoom toggle failed:', err);
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

  // Mount/Unmount logic: starts rear-camera instantly with zero redundant delay
  useEffect(() => {
    if (isOpen) {
      hasScannedRef.current = false;
      setScanSuccess(false);
      const timer = setTimeout(() => {
        startScanner();
      }, 60);
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              scanSuccess
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-indigo-600/30 border-indigo-500/40 text-indigo-400'
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>입고확인 QR 실시간 스캔</span>
                {isScanning && !scanSuccess && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {scanSuccess ? '✓ QR 인식 완료! 검수창으로 이동합니다...' : 'QR을 프레임 안에 맞추면 즉시 자동 인식됩니다'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Video Viewfinder */}
        <div className="p-3 sm:p-4 space-y-2">
          <div className="relative w-full aspect-square max-h-[340px] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
            
            {/* The Live Video Container Element */}
            <div id={VIEWFINDER_ID} className="w-full h-full object-cover"></div>
            <style>{`
              #${VIEWFINDER_ID} video {
                object-fit: cover !important;
                width: 100% !important;
                height: 100% !important;
                border-radius: 1rem;
              }
            `}</style>

            {/* Viewfinder Target Framing with Dark Mask Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {/* Central Targeting Box with 68% viewport ratio & Dark surrounding mask */}
                <div
                  className={`w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] rounded-2xl border-2 relative transition-all duration-150 ${
                    scanSuccess
                      ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.95)] scale-102 bg-emerald-500/10'
                      : 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                  }`}
                  style={{
                    boxShadow: scanSuccess
                      ? '0 0 35px rgba(52,211,153,0.95), 0 0 0 9999px rgba(2, 6, 23, 0.65)'
                      : '0 0 15px rgba(99,102,241,0.5), 0 0 0 9999px rgba(2, 6, 23, 0.60)',
                  }}
                >
                  {/* 4 Corner L-Bracket Accents */}
                  <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg transition-colors ${scanSuccess ? 'border-emerald-300' : 'border-indigo-400'}`} />
                  <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg transition-colors ${scanSuccess ? 'border-emerald-300' : 'border-indigo-400'}`} />
                  <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg transition-colors ${scanSuccess ? 'border-emerald-300' : 'border-indigo-400'}`} />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg transition-colors ${scanSuccess ? 'border-emerald-300' : 'border-indigo-400'}`} />
                  
                  {/* Animated Red Laser Scan Line (while scanning) */}
                  {!scanSuccess && (
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-scan-line" />
                  )}

                  {/* Scan Success Visual Badge */}
                  {scanSuccess && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 animate-in zoom-in-90 duration-100">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                        ✓ 인식 완료!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top Quick Action Controls (Lens switcher & Zoom) */}
            {isScanning && !scanSuccess && (
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto z-10">
                <span className="bg-slate-950/80 backdrop-blur-xs text-indigo-200 text-[10px] px-2.5 py-1 rounded-full border border-indigo-500/30 font-semibold shadow-sm">
                  🎯 QR을 사각형에 맞추세요
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Digital Zoom Toggle */}
                  {hasZoom && (
                    <button
                      type="button"
                      onClick={handleToggleZoom}
                      className="bg-slate-950/80 hover:bg-slate-800 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full border border-amber-400/40 shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="화면 확대/축소"
                    >
                      {zoomLevel > 1 ? '🔍 2x' : '🔍 1x'}
                    </button>
                  )}

                  {/* Multi-Lens Switch Button */}
                  {availableCameras.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSwitchNextLens}
                      className="bg-slate-950/85 hover:bg-slate-800 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      title="카메라 렌즈 전환 (1x 표준 / 0.5x 광각)"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{activeCameraIndex === 0 ? '0.5x' : '1x 표준'}</span>
                    </button>
                  )}
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
          </div>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-semibold">{cameraError}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 스마트폰 기본 카메라로 촬영하기</span>
                </button>
                <button
                  type="button"
                  onClick={() => startScanner()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>다시 시도</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
          
          {/* File Upload / Direct Camera Alternative */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>사진/앨범</span>
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

            {/* Switch Camera Lens */}
            <button
              type="button"
              onClick={handleSwitchNextLens}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer active:scale-95"
              title="카메라 렌즈 변경 (1x 표준 / 0.5x 광각)"
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
