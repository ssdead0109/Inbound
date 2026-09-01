import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import {
  Scan,
  Zap,
  RotateCw,
  Upload,
  Search,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Camera,
  ShieldAlert
} from 'lucide-react';
import { soundHelper } from '../../utils/soundHelper';
import { parseInboundQrCode, ParsedQrResult } from '../../utils/inboundQrParser';
import { InboundSlip } from '../../types/inbound';

interface InboundScannerProps {
  onScanSuccess: (result: ParsedQrResult) => void;
  pendingSlips: InboundSlip[];
  onSelectPendingSlip: (slipNo: string) => void;
}

export const InboundScanner: React.FC<InboundScannerProps> = ({
  onScanSuccess,
  pendingSlips,
  onSelectPendingSlip,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecureCtx, setIsSecureCtx] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'inbound-qr-reader';
  const barcodeBufferRef = useRef<{ buffer: string; lastKeyTime: number }>({
    buffer: '',
    lastKeyTime: 0,
  });

  // Check Secure Context on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const secure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsSecureCtx(secure);
    }
  }, []);

  // Handle scanned raw text
  const handleScannedText = useCallback(
    async (decodedText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      soundHelper.playScanBeep();

      try {
        const parsed = parseInboundQrCode(decodedText);
        onScanSuccess(parsed);
      } catch (err: any) {
        soundHelper.playErrorBuzzer();
        setCameraError(err.message || 'QR 코드 해석에 실패했습니다.');
      } finally {
        setTimeout(() => setIsProcessing(false), 800);
      }
    },
    [isProcessing, onScanSuccess]
  );

  // Stop Camera helper
  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn('Failed to stop camera:', err);
      } finally {
        setCameraActive(false);
      }
    }
  };

  // Start Camera with full-bleed frame & zero duplicate guidelines
  const startCameraWithId = async (cameraId?: string) => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      // Enumerate cameras if not already done
      let cameras = availableCameras;
      if (cameras.length === 0) {
        try {
          cameras = await Html5Qrcode.getCameras();
          setAvailableCameras(cameras);
        } catch (e) {
          console.warn('Could not enumerate cameras:', e);
        }
      }

      let targetCameraConfig: any = { facingMode: 'environment' };

      if (cameraId) {
        targetCameraConfig = { deviceId: { exact: cameraId } };
        setSelectedCameraId(cameraId);
      } else if (cameras.length > 0) {
        const rearCam = cameras.find((c) =>
          /back|rear|environment|후면|뒤|0/i.test(c.label)
        ) || cameras[cameras.length - 1];

        targetCameraConfig = { deviceId: { exact: rearCam.id } };
        setSelectedCameraId(rearCam.id);
      }

      // Start full-frame scan without built-in qrbox borders
      await scannerRef.current.start(
        targetCameraConfig,
        {
          fps: 25,
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          handleScannedText(decodedText);
        },
        () => {}
      );

      setCameraActive(true);

      // Check torch capability
      try {
        const videoTrack = (scannerRef.current as any).getRunningTrackCameraCapabilities?.();
        if (videoTrack && videoTrack.torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);

      if (cameraId) {
        try {
          await scannerRef.current?.start(
            { facingMode: 'environment' },
            { fps: 25, aspectRatio: 1.333333 },
            (decodedText) => handleScannedText(decodedText),
            () => {}
          );
          setCameraActive(true);
          return;
        } catch (fallbackErr) {
          console.warn('Fallback camera also failed:', fallbackErr);
        }
      }

      let msg = '카메라를 실행할 수 없습니다.';
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        msg = '카메라 접근 권한이 차단되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        msg = '모바일 브라우저는 보안(HTTPS) 연결에서만 카메라가 작동합니다. 아래 파일 업로드 또는 전표번호 직접 조회를 이용해주세요.';
      } else if (err.name === 'OverconstrainedError') {
        msg = '후면 카메라 요구조건과 일치하는 장치를 찾지 못했습니다. 아래 카메라 선택 목록에서 다른 카메라를 선택해주세요.';
      }

      setCameraError(msg);
      setCameraActive(false);
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Switch to next available camera
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1) {
      await stopCamera();
      const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextFacing);
      startCameraWithId();
      return;
    }

    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCam = availableCameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await startCameraWithId(nextCam.id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startCameraWithId();
    }, 250);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Physical Barcode Scanner Keystroke Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputTarget =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      const currentTime = Date.now();
      const timeDiff = currentTime - barcodeBufferRef.current.lastKeyTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.buffer.length > 2) {
          e.preventDefault();
          const scanned = barcodeBufferRef.current.buffer.trim();
          barcodeBufferRef.current.buffer = '';
          handleScannedText(scanned);
          return;
        }
      }

      if (e.key.length === 1) {
        if (timeDiff > 120) {
          barcodeBufferRef.current.buffer = isInputTarget ? '' : e.key;
        } else {
          barcodeBufferRef.current.buffer += e.key;
        }
        barcodeBufferRef.current.lastKeyTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScannedText]);

  // Manual Form Search
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScannedText(manualInput.trim());
    setManualInput('');
  };

  // Photo File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCameraError(null);
      const html5Qr = new Html5Qrcode('file-qr-temp');
      const result = await html5Qr.scanFile(file, true);
      handleScannedText(result);
    } catch (err: any) {
      soundHelper.playErrorBuzzer();
      setCameraError('선택한 이미지에서 QR 코드를 인식하지 못했습니다. 선명한 사진을 업로드해주세요.');
    }
  };

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 w-full overflow-x-hidden">
      
      {/* Hidden container for file scan */}
      <div id="file-qr-temp" className="hidden"></div>

      {/* Insecure Context (HTTP) Mobile Guide Alert */}
      {!isSecureCtx && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start space-x-2.5 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-xs text-amber-950">💡 모바일 브라우저 카메라 보안(HTTPS) 안내</p>
            <p className="leading-relaxed text-2xs">
              모바일 Chrome/Safari는 보안 정책상 <strong>HTTPS</strong>에서만 카메라가 열립니다. 아래 <strong>[QR 사진 찍기 / 업로드]</strong> 버튼을 이용하시거나 Chrome 플래그 설정을 이용해주세요.
            </p>
          </div>
        </div>
      )}

      {/* Main Scanner Card (Pure Bright White) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs overflow-hidden">
        
        {/* Header: Title & Camera Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-3.5 gap-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Scan className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              납품확인서 QR 스캐너
            </h2>
          </div>

          {/* Camera Selection Controls */}
          <div className="flex items-center space-x-1.5 self-end sm:self-auto flex-wrap gap-y-1">
            {availableCameras.length > 1 && (
              <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedCameraId}
                  onChange={(e) => startCameraWithId(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {availableCameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id} className="bg-white text-slate-900">
                      {cam.label || `카메라 ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  torchOn
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="조명 플래시"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSwitchCamera}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="카메라 전환"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full-Frame Viewfinder Viewport with QR Guide & Animated Scanning Line */}
        <div className="relative w-full aspect-[4/3] max-h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
          <div
            id={readerElementId}
            className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:rounded-2xl [&_img]:hidden [&_#inbound-qr-reader__scan_region]:min-h-full [&_#inbound-qr-reader__dashboard_section]:hidden"
          ></div>

          {/* QR Target Frame & Laser Scanning Line Overlay */}
          {cameraActive && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 z-5">
              {/* Reticle Target Area with Vignette Shadow */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-indigo-400/70 shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] flex items-center justify-center overflow-hidden">
                {/* 4 Corner Markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-indigo-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-indigo-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-indigo-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-indigo-400 rounded-br-lg"></div>

                {/* Animated Horizontal Laser Scan Line */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8] animate-scan-line"></div>
              </div>

              {/* Guide Hint */}
              <p className="mt-3 text-white text-[11px] sm:text-xs font-semibold drop-shadow-md bg-slate-900/70 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                QR 코드를 사각 영역 안에 맞춰주세요
              </p>
            </div>
          )}

          {/* Fallback & Error Action in Viewport */}
          {(!cameraActive || cameraError) && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="text-white text-xs sm:text-sm font-bold">실시간 카메라 연결 불가 시</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  스마트폰 카메라로 사진을 찍거나 HTTPS(<strong className="text-indigo-400">https://192.168.2.29:3005</strong>)로 접속하세요.
                </p>
              </div>

              <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/40 active:scale-95 transition-all">
                <Camera className="w-4 h-4" />
                <span>📷 카메라로 즉시 촬영하여 QR 인식</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 animate-in fade-in duration-100">
              <div className="w-9 h-9 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mb-2"></div>
              <p className="text-slate-900 font-bold text-xs">QR 분석 및 전표 조회중...</p>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {cameraError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="flex-1 space-y-0.5">
              <p className="font-bold">카메라 안내</p>
              <p className="text-amber-700/90 leading-relaxed text-2xs">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Input Bar (Manual Search & Photo Upload) */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
          
          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="sm:col-span-8 flex items-center space-x-1.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="납품전표번호 (예: DN-20260831-001) 입력"
                className="w-full pl-8 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              조회
            </button>
          </form>

          {/* Photo File Upload Scan */}
          <div className="sm:col-span-4">
            <label className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 cursor-pointer transition-all text-xs font-semibold shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>QR 사진 찍기 / 업로드</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>

      </div>

      {/* 1-Click Test Scenarios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center space-x-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">테스트용 납품확인서 즉시 검수</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {pendingSlips.slice(0, 3).map((slip) => (
            <button
              key={slip.slipNo}
              type="button"
              onClick={() => onSelectPendingSlip(slip.slipNo)}
              className="group p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {slip.slipNo}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slip.status === 'WAITING'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {slip.status === 'WAITING' ? '입고 대기' : '검수중'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{slip.supplierName}</p>
                <p className="text-2xs text-slate-500 mt-0.5 truncate">
                  품목 {slip.totalItems}종 • 총 {slip.totalOrderedQty.toLocaleString()}개
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                <span>검수 시작</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
