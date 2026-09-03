import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  ChevronDown,
  Warehouse,
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
import { parseInboundQrCode, resolveInboundQrResult, ParsedQrResult } from '../../utils/inboundQrParser';
import { InboundSlip } from '../../types/inbound';
import { InboundLiveScannerModal } from './InboundLiveScannerModal';
import { scanWithNativeBarcodeScanner } from '../../utils/nativeBarcodeScanner';

interface InboundScannerProps {
  onScanSuccess: (result: ParsedQrResult) => void;
  pendingSlips: InboundSlip[];
  onSelectPendingSlip: (slipNo: string, directSlip?: InboundSlip) => void;
}

const InboundScannerComponent: React.FC<InboundScannerProps> = ({
  onScanSuccess,
  pendingSlips,
  onSelectPendingSlip,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);

  // Remember selected warehouse in localStorage
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(() => {
    return localStorage.getItem('kcp_inbound_selected_wh') || 'ALL';
  });
  const isNativeApp = Capacitor.isNativePlatform();

  const barcodeBufferRef = useRef<{ buffer: string; lastKeyTime: number }>({
    buffer: '',
    lastKeyTime: 0,
  });

  // Handle scanned raw text
  const handleScannedText = useCallback(
    async (decodedText: string) => {
      setIsLiveScannerOpen(false);
      if (isProcessing) return;
      setIsProcessing(true);
      soundHelper.playScanBeep();

      try {
        const parsed = parseInboundQrCode(decodedText);
        // Asynchronously resolve short token into slipNo / itemCode if needed
        const resolved = await resolveInboundQrResult(parsed);
        onScanSuccess(resolved);
      } catch (err: any) {
        soundHelper.playErrorBuzzer();
        setCameraError(err.message || 'QR 코드 해석에 실패했습니다.');
      } finally {
        setTimeout(() => setIsProcessing(false), 500);
      }
    },
    [isProcessing, onScanSuccess]
  );

  // Helper to crop center 65% for high-accuracy QR decoding
  const createCenterCropBlob = (dataUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height) * 0.65;
          canvas.width = 600;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 600, 600);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

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

      // 2. Open Native Android Camera Viewfinder (Optimized resolution for instant QR decoding)
      const image = await CapCamera.getPhoto({
        quality: 90,
        width: 1280,
        height: 1280,
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

      // 3. Scan QR from captured native image (Full + Center Crop Fallback)
      const html5Qr = new Html5Qrcode('file-qr-temp', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      let decodedText: string | null = null;
      try {
        const fetchRes = await fetch(image.dataUrl);
        const blob = await fetchRes.blob();
        const file = new File([blob], 'captured_qr.jpg', { type: 'image/jpeg' });
        decodedText = await html5Qr.scanFile(file, true);
      } catch {
        const cropBlob = await createCenterCropBlob(image.dataUrl);
        if (cropBlob) {
          const cropFile = new File([cropBlob], 'crop_qr.jpg', { type: 'image/jpeg' });
          decodedText = await html5Qr.scanFile(cropFile, true);
        }
      }

      if (decodedText) {
        setIsProcessing(false);
        soundHelper.playScanBeep();
        try {
          const parsed = parseInboundQrCode(decodedText);
          onScanSuccess(parsed);
        } catch (err: any) {
          soundHelper.playErrorBuzzer();
          setCameraError(err.message || 'QR 코드 해석에 실패했습니다.');
        }
      } else {
        soundHelper.playErrorBuzzer();
        setCameraError('QR 코드를 감지하지 못했습니다. 조명이 밝은 곳에서 QR 코드가 정면에 오도록 다시 촬영해주세요.');
      }
    } catch (err: any) {
      console.warn('Native camera scan error:', err);
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('canceled')) {
        soundHelper.playErrorBuzzer();
        setCameraError('QR 코드 촬영 중 오류가 발생했습니다: ' + (err.message || ''));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Camera File Input change handler (Fallback for mobile web browsers on plain HTTP)
  const directCameraInputRef = useRef<HTMLInputElement>(null);

  const handleDirectCameraFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setCameraError(null);

      const html5Qr = new Html5Qrcode('file-qr-temp', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      let decodedText: string | null = null;
      try {
        decodedText = await html5Qr.scanFile(file, true);
      } catch {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const cropBlob = await createCenterCropBlob(dataUrl);
        if (cropBlob) {
          const cropFile = new File([cropBlob], 'crop.jpg', { type: 'image/jpeg' });
          decodedText = await html5Qr.scanFile(cropFile, true);
        }
      }

      if (decodedText) {
        setIsProcessing(false);
        soundHelper.playScanBeep();
        try {
          const parsed = parseInboundQrCode(decodedText);
          onScanSuccess(parsed);
        } catch (err: any) {
          soundHelper.playErrorBuzzer();
          setCameraError(err.message || 'QR 코드 해석에 실패했습니다.');
        }
      } else {
        soundHelper.playErrorBuzzer();
        setCameraError('QR 코드를 감지하지 못했습니다. 조명이 밝은 곳에서 QR 코드가 정면에 오도록 다시 촬영해주세요.');
      }
    } catch (err: any) {
      soundHelper.playErrorBuzzer();
      setCameraError('사진 처리 중 오류가 발생했습니다: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  // High-speed real-time scan entrypoint:
  // 1) Capacitor Native App: Prioritizes Google ML Kit continuous live camera scan overlay!
  //    (Zero button clicks: points camera at QR -> beeps -> auto-dismisses).
  //    Falls back to InboundLiveScannerModal if ML Kit plugin is not available.
  // 2) Web Browsers (Mobile & PC): Instantly opens InboundLiveScannerModal with continuous video stream!
  const handleStartScan = async () => {
    if (isProcessing) return;
    setCameraError(null);

    // 1. Capacitor Native App Environment
    if (isNativeApp) {
      try {
        const nativeRes = await scanWithNativeBarcodeScanner();
        if (nativeRes.hasScanned && nativeRes.content) {
          await handleScannedText(nativeRes.content);
          return;
        }
        // User closed or dismissed the scanner
        if (nativeRes.isCancelled) {
          return;
        }
      } catch (err) {
        console.warn('Native ML Kit scanner error, falling back to LiveScannerModal:', err);
      }
      // If ML Kit not installed or failed, open real-time LiveScannerModal
      setIsLiveScannerOpen(true);
      return;
    }

    // 2. Web Browser Environment (Mobile & Desktop):
    // Instantly launch continuous real-time camera viewfinder without requiring manual photo snapping!
    setIsLiveScannerOpen(true);
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

  // Extract unique warehouses from pending slips
  const availableWarehouses = useMemo(() => {
    const set = new Set<string>();
    pendingSlips.forEach((s) => {
      s.items.forEach((it) => {
        if (it.warehouse && it.warehouse.trim()) {
          set.add(it.warehouse.trim());
        }
      });
    });
    if (set.size === 0) {
      return ['특장자재창고', '함안자재창고', '화성자재창고', '본관 자재1창고', '본관 자재2창고'];
    }
    return Array.from(set).sort();
  }, [pendingSlips]);

  // Filtered Pending Slips (창고 선택 필터 + 통합 검색 지원)
  const filteredSlips = pendingSlips.filter((slip) => {
    // 1. Warehouse dropdown filter
    if (selectedWarehouse !== 'ALL') {
      const hasWh = slip.items.some((it) => it.warehouse === selectedWarehouse);
      if (!hasWh) return false;
    }
    // 2. Search query filter (matches slipNo, supplierName, itemCode, itemName, AND warehouse!)
    const q = (manualInput || filterText).trim().toLowerCase();
    if (!q) return true;
    return (
      slip.slipNo.toLowerCase().includes(q) ||
      slip.supplierName.toLowerCase().includes(q) ||
      slip.items.some(
        (it) =>
          it.itemName.toLowerCase().includes(q) ||
          it.itemCode.toLowerCase().includes(q) ||
          (it.warehouse && it.warehouse.toLowerCase().includes(q))
      )
    );
  });

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 w-full">
      
      {/* Hidden container for file scan & Direct Camera capture input */}
      <div id="file-qr-temp" className="hidden"></div>
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleDirectCameraFileChange}
      />

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

      {/* 2. Unified Sticky Search, Warehouse Filter & Camera Bar */}
      <div
        style={{ top: 'var(--app-header-h, 56px)' }}
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Main Action: Continuous Live Camera QR Scanner (ML Kit on Native -> html5-qrcode Fallback) */}
          <button
            type="button"
            onClick={handleStartScan}
            disabled={isProcessing}
            className="w-full sm:w-auto h-11 sm:h-12 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/25 shrink-0 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            title="실시간 고속 QR 카메라 스캐너 시작"
          >
            <Camera className="w-4 h-4 shrink-0 text-indigo-200" />
            <span>📷 QR 카메라 스캔</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Native Fallback Photo Snap Button (네이티브 앱에서 사진 촬영 방식이 필요할 때 보조 수단) */}
          {isNativeApp && (
            <button
              type="button"
              onClick={handleNativeCameraScan}
              disabled={isProcessing}
              title="사진 촬영으로 QR 스캔"
              className="hidden sm:flex h-11 sm:h-12 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold items-center justify-center border border-slate-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>사진촬영</span>
            </button>
          )}

          {/* Warehouse Dropdown Listbox (창고 선택 기억 기능) */}
          <div className="w-full sm:w-52 shrink-0 relative">
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedWarehouse(val);
                localStorage.setItem('kcp_inbound_selected_wh', val);
              }}
              className="w-full h-11 sm:h-12 pl-3.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">🏢 전체 창고</option>
              {availableWarehouses.map((wh) => (
                <option key={wh} value={wh}>
                  🏢 {wh}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Unified Search Input (창고명으로도 검색 가능) */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2 flex-1 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="전표번호, 공급처, 품목명, 창고명 검색..."
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
                onClick={() => onSelectPendingSlip(slip.slipNo, slip)}
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

                  {/* Delivery Date & Right-Aligned Warehouse */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1 gap-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">납기일: {slip.deliveryDate || '미지정'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-semibold text-[11px] shrink-0 truncate max-w-[150px]">
                      <Warehouse className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate">{slip.items[0]?.warehouse || '특장자재창고'}</span>
                    </div>
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
                  <span>입고확인</span>
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
              {selectedWarehouse !== 'ALL' && pendingSlips.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-slate-700 font-bold text-sm">
                    '{selectedWarehouse}' 창고에 대기 중인 전표가 없습니다
                  </p>
                  <p className="text-slate-500 text-xs">
                    다른 창고에 총 <span className="font-bold text-indigo-600 font-mono">{pendingSlips.length}건</span>의 대기 전표가 있습니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWarehouse('ALL');
                      localStorage.setItem('kcp_inbound_selected_wh', 'ALL');
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Warehouse className="w-3.5 h-3.5" />
                    <span>전체 창고 전표 보기</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-700 font-bold text-sm">입고 대기 중인 전표가 없습니다</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    사내 ERP '미입고현황' 또는 '발주원장'에서 대기 중인 발주 내역이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Real-time Live Camera QR Scanner Modal */}
      <InboundLiveScannerModal
        isOpen={isLiveScannerOpen}
        onClose={() => setIsLiveScannerOpen(false)}
        onScan={(scanned) => handleScannedText(scanned)}
      />

    </div>
  );
};

export const InboundScanner = React.memo(InboundScannerComponent);
