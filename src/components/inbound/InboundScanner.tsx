import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  ClipboardCheck,
  Search,
  AlertCircle,
  Clock,
  Building2,
  Package,
  Calendar,
  ChevronRight,
  Boxes,
  Sparkles,
  Filter,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
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
  const [manualInput, setManualInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const isNativeApp = Capacitor.isNativePlatform();

  const barcodeBufferRef = useRef<{ buffer: string; lastKeyTime: number }>({
    buffer: '',
    lastKeyTime: 0,
  });

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

  // Native Android/iOS Camera Scan (Uses native CAMERA permission, completely HTTPS-free!)
  const handleNativeCameraScan = async () => {
    try {
      setCameraError(null);
      setIsProcessing(true);

      // 1. Check & Request Native Android Camera Permission
      const check = await CapCamera.checkPermissions();
      if (check.camera !== 'granted') {
        const req = await CapCamera.requestPermissions({ permissions: ['camera'] });
        if (req.camera !== 'granted') {
          setCameraError('스마트폰 앱 설정에서 카메라 권한을 허용해주세요.');
          setIsProcessing(false);
          return;
        }
      }

      // 2. Open Native Android Camera Viewfinder
      const image = await CapCamera.getPhoto({
        quality: 95,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'QR 코드 촬영',
        promptLabelPhoto: '앨범에서 선택',
        promptLabelPicture: '카메라 촬영',
      });

      if (!image.dataUrl) {
        setIsProcessing(false);
        return;
      }

      // 3. Scan QR from captured native image
      const html5Qr = new Html5Qrcode('file-qr-temp');
      const fetchRes = await fetch(image.dataUrl);
      const blob = await fetchRes.blob();
      const file = new File([blob], 'captured_qr.jpg', { type: 'image/jpeg' });
      const decodedText = await html5Qr.scanFile(file, true);
      handleScannedText(decodedText);
    } catch (err: any) {
      console.warn('Native camera scan error:', err);
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('canceled')) {
        soundHelper.playErrorBuzzer();
        setCameraError('QR 코드를 인식하지 못했습니다. QR 코드가 정면에서 선명하게 보이도록 다시 촬영해주세요.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual Form Search
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScannedText(manualInput.trim());
    setManualInput('');
  };

  // Physical Barcode Scanner Keystroke Listener (USB / Bluetooth scanner guns)
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

  // Filtered Pending Slips (uses unified search bar)
  const filteredSlips = pendingSlips.filter((slip) => {
    const q = (manualInput || filterText).trim().toLowerCase();
    if (!q) return true;
    return (
      slip.slipNo.toLowerCase().includes(q) ||
      slip.supplierName.toLowerCase().includes(q) ||
      slip.items.some((it) => it.itemName.toLowerCase().includes(q) || it.itemCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 w-full">
      
      {/* Hidden container for file scan */}
      <div id="file-qr-temp" className="hidden"></div>

      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              입고확인 (납품서 검수)
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Unified Sticky Search & Camera Bar */}
      <div
        style={{ top: 'var(--app-header-h, 56px)' }}
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Main Action: Smartphone Camera Scan Button (앱 환경에서만 노출, 웹에서는 숨김) */}
          {isNativeApp && (
            <button
              type="button"
              onClick={handleNativeCameraScan}
              disabled={isProcessing}
              className="w-full sm:w-auto h-11 sm:h-12 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-xs shrink-0 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>📷 스마트폰 카메라 촬영</span>
            </button>
          )}

          {/* Unified Search Input */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2 flex-1 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="납품전표번호, 공급처, 품목명을 검색하세요..."
                className="w-full h-11 sm:h-12 pl-10 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition-all"
              />
              {manualInput && (
                <button
                  type="button"
                  onClick={() => setManualInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 sm:h-12 px-4 sm:px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              조회
            </button>
          </form>
        </div>
      </div>

      {/* Camera or Scan Error Notification */}
      {cameraError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 space-y-0.5">
            <p className="font-bold">알림</p>
            <p className="text-rose-700 leading-relaxed text-xs">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center space-x-2 text-indigo-700 text-xs font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>QR 코드를 분석하고 전표를 조회하고 있습니다...</span>
        </div>
      )}

      {/* 2. Pending Inbound Slips List (입고 대기 내역) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                입고 대기 내역
              </h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full font-mono">
                {filteredSlips.length}건
              </span>
            </div>
          </div>
        </div>

        {/* Slips Card Grid */}
        {filteredSlips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSlips.map((slip) => (
              <div
                key={slip.slipNo}
                onClick={() => onSelectPendingSlip(slip.slipNo)}
                className="group p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Card Header: Slip No & Status */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs sm:text-sm font-black text-indigo-600">
                      {slip.slipNo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slip.status === 'WAITING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {slip.status === 'WAITING' ? '입고 대기' : '검수중'}
                    </span>
                  </div>

                  {/* Supplier Name */}
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-sm truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{slip.supplierName}</span>
                  </div>

                  {/* Delivery Date & Memo */}
                  <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>납기일: {slip.deliveryDate || '미지정'}</span>
                  </div>

                  {/* Items Summary Preview */}
                  <div className="mt-2.5 p-2.5 bg-white group-hover:bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Package className="w-3 h-3 text-indigo-500" />
                        <span>{slip.items[0]?.itemName || '자재'}</span>
                        {slip.items.length > 1 && (
                          <span className="text-slate-400 font-normal">외 {slip.items.length - 1}건</span>
                        )}
                      </span>
                      <span className="font-mono font-bold text-indigo-600">
                        {slip.totalOrderedQty.toLocaleString()}개
                      </span>
                    </div>
                    {slip.memo && (
                      <p className="text-[11px] text-slate-400 truncate italic">
                        "{slip.memo}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-indigo-600 font-bold">
                  <span>검수 시작</span>
                  <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>이동</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-sm">입고 대기 중인 전표가 없습니다</p>
              <p className="text-slate-400 text-xs mt-0.5">
                사내 ERP '미입고현황'에서 대기 중인 발주 내역이 없거나 필터 조건에 맞는 전표가 없습니다.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
