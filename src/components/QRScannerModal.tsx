import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, Zap, Search, AlertCircle, ArrowRight, CheckCircle2, MapPin, Package, QrCode } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { decodeItemPayload, parseRackSlotFromScannedText, extractTokenFromScannedText } from '../utils/qrHelper';
import { resolveQrTokenApi } from '../api/qrApi';
import { Capacitor } from '@capacitor/core';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (item: InventoryItem) => void;
  onRelocateItem?: (itemId: string, newLocation: string) => Promise<void> | void;
  items: InventoryItem[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
  onRelocateItem,
  items,
}) => {
  // Mode: 'single' | 'relocate_workflow'
  const [scanMode, setScanMode] = useState<'single' | 'relocate_workflow'>('relocate_workflow');

  // Relocation 2-Step State
  const [relocateStep, setRelocateStep] = useState<1 | 2>(1);
  const [targetItem, setTargetItem] = useState<InventoryItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'smartrack-qr-reader';

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Play audio beep when QR is detected
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880; // 880Hz beep
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
      if (navigator.vibrate) navigator.vibrate(100);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleDetectedCode = async (decodedText: string) => {
    playBeep();
    setCameraError(null);

    let raw = decodedText.trim();
    let targetCode = raw;
    let payloadItem: InventoryItem | null = null;

    // 🚀 2단계 스캔 모드에서 Step 2 (슬롯 QR 스캔) 처리
    if (scanMode === 'relocate_workflow' && relocateStep === 2 && targetItem) {
      const slotParsed = parseRackSlotFromScannedText(raw);
      if (slotParsed) {
        const finalLoc = slotParsed.warehouse
          ? `${slotParsed.warehouse} ${slotParsed.rack}`
          : slotParsed.rack;

        if (onRelocateItem) {
          await onRelocateItem(targetItem.id, finalLoc);
        }
        showNotification(`🎉 '${targetItem.name}' 위치가 '${finalLoc}'(으)로 즉시 지정되었습니다!`);
        setTargetItem(null);
        setRelocateStep(1);
        return;
      } else {
        setCameraError(`스캔된 코드 [${raw}]은(는) 랙 슬롯 QR 형식이 아닙니다. 슬롯 QR을 비춰주세요.`);
        return;
      }
    }

    // Check if it's a Short URL / Token
    const detectedToken = extractTokenFromScannedText(raw);
    if (detectedToken) {
      try {
        const tokenRec = await resolveQrTokenApi(detectedToken);
        if (tokenRec) {
          if (tokenRec.type === 'RACK' && scanMode === 'relocate_workflow' && relocateStep === 2) {
            raw = tokenRec.targetId; // replace with target rack
          } else {
            targetCode = tokenRec.targetId;
          }
        }
      } catch {
        targetCode = detectedToken;
      }
    }

    // Check if it's a URL
    if (raw.includes('http') || raw.includes('item=') || raw.includes('d=')) {
      try {
        const urlObj = new URL(raw, window.location.origin);
        const pItem = urlObj.searchParams.get('item') || urlObj.searchParams.get('code') || urlObj.searchParams.get('sku');
        const pData = urlObj.searchParams.get('d');
        if (pItem) targetCode = pItem;
        if (pData) payloadItem = decodeItemPayload(pData);
      } catch {
        // Fallback regex match
        const itemMatch = raw.match(/[?&#]item=([^&]+)/);
        if (itemMatch && itemMatch[1]) targetCode = decodeURIComponent(itemMatch[1]);
        const dataMatch = raw.match(/[?&#]d=([^&]+)/);
        if (dataMatch && dataMatch[1]) payloadItem = decodeItemPayload(dataMatch[1]);
      }
    }

    // Try finding the item in inventory
    const matchedItem = items.find(
      (it) =>
        it.code.trim().toUpperCase() === targetCode.toUpperCase() ||
        it.id === targetCode ||
        it.name.trim().toLowerCase() === targetCode.toLowerCase()
    );

    const finalItem = matchedItem || payloadItem;

    if (finalItem) {
      if (scanMode === 'relocate_workflow') {
        // Step 1 완료 -> Step 2로 전환
        setTargetItem(finalItem);
        setRelocateStep(2);
        showNotification(`📦 '${finalItem.name}' 선택됨! 이제 랙 슬롯 QR을 비춰주세요.`);
      } else {
        // 단일 스캔 조회 모드
        stopScanner();
        onScanResult(finalItem);
        onClose();
      }
    } else {
      setCameraError(`스캔된 코드 [${targetCode}]에 해당하는 품목을 찾을 수 없습니다.`);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      // 1. Capacitor 모바일 네이티브 환경인 경우 카메라 권한 사전 확인 및 요청
      if (Capacitor.isNativePlatform()) {
        try {
          const { Camera } = await import('@capacitor/camera');
          const status = await Camera.checkPermissions();
          if (status.camera !== 'granted') {
            await Camera.requestPermissions({ permissions: ['camera'] });
          }
        } catch (capErr) {
          console.warn('[QRScanner] Capacitor camera permission pre-check failed:', capErr);
        }
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const scanConfig = {
        fps: 20,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const boxEdge = Math.max(200, Math.floor(minEdge * 0.7));
          return { width: boxEdge, height: boxEdge };
        },
        aspectRatio: 1.0,
      };

      // 2. 사용 가능한 카메라 장치 목록을 조회하여 후면 카메라 디바이스 ID 우선 바인딩
      let cameraDeviceSelected: string | { facingMode: string } = { facingMode: 'environment' };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const backCam = cameras.find((c) =>
            /back|rear|environment|후면|뒤/i.test(c.label)
          );
          cameraDeviceSelected = backCam ? backCam.id : cameras[cameras.length - 1].id;
        }
      } catch (camListErr) {
        console.warn('[QRScanner] getCameras fallback to facingMode environment:', camListErr);
      }

      await scannerRef.current.start(
        cameraDeviceSelected,
        scanConfig,
        (decodedText) => {
          handleDetectedCode(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      let msg = '카메라를 실행할 수 없습니다. 스마트폰 설정에서 카메라 권한을 확인해주세요.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        msg = '카메라 접근 권한이 차단되었습니다. 스마트폰 앱 설정에서 카메라 권한을 허용해주세요.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        msg = '사용 가능한 카메라 장치를 찾을 수 없습니다.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = '카메라가 다른 앱에서 사용 중이거나 하드웨어 접근이 지연되고 있습니다. 앱을 재실행해주세요.';
      } else if (err?.name === 'OverconstrainedError') {
        msg = '카메라 해상도 제약 조건 오류입니다. 기본 모드로 다시 시도해주세요.';
      } else if (err?.message) {
        msg = `카메라 실행 오류: ${err.message}`;
      }
      setCameraError(msg);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Failed to stop scanner:', err);
      } finally {
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRelocateStep(1);
      setTargetItem(null);
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
  }, [isOpen]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                스마트 QR 스캐너
              </h3>
              <p className="text-2xs text-slate-400">
                실시간 카메라로 품목 및 랙 슬롯 바코드를 스캔합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Mode Selector */}
        <div className="px-5 pt-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setScanMode('relocate_workflow');
                setRelocateStep(1);
                setTargetItem(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                scanMode === 'relocate_workflow'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📍 자재 ➔ 랙 위치 자동 지정 (2단계)
            </button>
            <button
              type="button"
              onClick={() => {
                setScanMode('single');
                setTargetItem(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                scanMode === 'single'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🔍 단일 품목 조회
            </button>
          </div>
        </div>

        {/* 2-Step Workflow Guide Banner (요청 4: 자재 QR 스캔 후 슬롯 QR 스캔 시 위치 지정) */}
        {scanMode === 'relocate_workflow' && (
          <div className="px-5 py-2.5 bg-slate-850 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg flex-1 border ${
                relocateStep === 1
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}>
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono shrink-0">1</span>
                <span className="truncate">1단계: 자재 QR 스캔</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

              <div className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg flex-1 border ${
                relocateStep === 2
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold animate-pulse'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-mono shrink-0">2</span>
                <span className="truncate">2단계: 랙 슬롯 QR 스캔</span>
              </div>
            </div>

            {targetItem && relocateStep === 2 && (
              <div className="mt-2 p-2 bg-indigo-950/60 border border-indigo-700/50 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center space-x-2 truncate">
                  <Package className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-white">{targetItem.name}</span>
                    <span className="text-2xs text-indigo-300 ml-1 font-mono">[{targetItem.code}]</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTargetItem(null);
                    setRelocateStep(1);
                  }}
                  className="text-2xs text-slate-400 hover:text-white underline shrink-0 cursor-pointer"
                >
                  다시 선택
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successToast && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Camera Viewfinder */}
        <div className="p-5 space-y-4">
          <div className="relative w-full aspect-square max-h-[300px] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
            <div id={readerElementId} className="w-full h-full object-cover"></div>
            
            {/* Viewfinder Target Graphic */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-48 h-48 rounded-2xl border-2 border-dashed transition-all ${
                scanMode === 'relocate_workflow' && relocateStep === 2
                  ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
              }`}></div>
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full border border-slate-700 font-medium">
                {scanMode === 'relocate_workflow' && relocateStep === 2
                  ? '📍 랙 슬롯 QR 라벨을 사각형 안에 맞춰주세요'
                  : '📦 자재 라벨의 QR 코드를 사각형 안에 맞춰주세요'}
              </span>
            </div>
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSearch} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={
                  scanMode === 'relocate_workflow' && relocateStep === 2
                    ? '슬롯 코드 직접 입력 (예: D-06-03)'
                    : '품목코드/품명 직접 입력'
                }
                className="flex-1 px-3.5 py-2 text-xs bg-slate-800 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                입력
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-2xs text-slate-400">
          <span>💡 조명이 밝은 곳에서 QR을 스캔하면 인식이 더 빠릅니다</span>
          <button
            type="button"
            onClick={startScanner}
            className="text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>카메라 재시작</span>
          </button>
        </div>

      </div>
    </div>
  );
};
