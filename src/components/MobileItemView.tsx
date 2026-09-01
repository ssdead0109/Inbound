import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Plus, 
  Minus, 
  Camera, 
  Share2, 
  AlertCircle, 
  History, 
  CheckCircle, 
  Printer, 
  Edit3,
  Image as ImageIcon,
  QrCode,
  LayoutDashboard,
  Calendar,
  Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem, StockLog } from '../types/inventory';
import { getCategoryBadgeColor, compressAndFormatImage } from '../utils/imageUtils';
import { parseWarehouseAndRack, cleanSupplierDisplayName } from '../utils/excelHelper';
import { generateItemQRValue } from '../utils/qrHelper';

interface MobileItemViewProps {
  item: InventoryItem;
  onClose: () => void;
  onQuickStockChange: (itemId: string, delta: number, reason: string) => void;
  onOpenEdit: (item: InventoryItem) => void;
  onOpenPrint: (item: InventoryItem) => void;
  onOpenScanner: () => void;
  onUpdatePhoto: (itemId: string, photoBase64: string) => void;
  logs: StockLog[];
}

export const MobileItemView: React.FC<MobileItemViewProps> = ({
  item,
  onClose,
  onQuickStockChange,
  onOpenEdit,
  onOpenPrint,
  onOpenScanner,
  onUpdatePhoto,
  logs,
}) => {
  const [customQty, setCustomQty] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [managerName, setManagerName] = useState(
    localStorage.getItem('smartrack_last_manager') || '현장담당자'
  );
  const [copiedToast, setCopiedToast] = useState(false);
  const [isPhotoUpdating, setIsPhotoUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isLowStock = item.quantity <= (item.safetyStock || 0);
  const catBadge = getCategoryBadgeColor(item.category);
  const loc = parseWarehouseAndRack(item.rackLocation, item.warehouse);
  const qrUrl = generateItemQRValue(item);

  // Filter audit logs for this item
  const itemLogs = logs
    .filter((l) => l.itemId === item.id || l.itemCode === item.code)
    .slice(0, 15);

  const handleApplyDelta = (delta: number) => {
    const reason =
      actionReason.trim() || (delta > 0 ? '현장 QR 모바일 입고' : '현장 QR 모바일 출고');
    localStorage.setItem('smartrack_last_manager', managerName);
    onQuickStockChange(item.id, delta, `${managerName}: ${reason}`);
    setActionReason('');
  };

  const handleCustomSubmit = (type: 'IN' | 'OUT') => {
    const qty = parseInt(customQty, 10);
    if (!qty || qty <= 0) return;
    const delta = type === 'IN' ? qty : -qty;
    handleApplyDelta(delta);
    setCustomQty('');
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsPhotoUpdating(true);
        const base64 = await compressAndFormatImage(e.target.files[0], 800, 800, 0.82);
        onUpdatePhoto(item.id, base64);
      } catch (err) {
        console.error(err);
        alert('사진 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsPhotoUpdating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. Standalone Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Left: Back to Main Dashboard */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="메인 대시보드 / 전체 재고 목록으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>메인 대시보드</span>
          </button>

          {/* Center: Title / Breadcrumb */}
          <div className="text-center truncate px-2">
            <div className="flex items-center justify-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                QR 품목 상세정보
              </span>
            </div>
            <p className="text-2xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-md mx-auto">
              {item.code} • {item.name}
            </p>
          </div>

          {/* Right: Quick Tools */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShareLink}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="QR 공유 링크 복사"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint(item)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="80×60mm 랙 라벨 인쇄"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit(item)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="품목 정보 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Toast Notification */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>모바일 접속 링크가 클립보드에 복사되었습니다!</span>
        </div>
      )}

      {/* 3. Standalone Detail Page Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Prominent High-Impact Warehouse & Rack Location Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-md">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Building2 className="w-3.5 h-3.5" />
                <span>보관 창고: <strong className="text-slate-950 font-black text-sm">{loc.warehouse}</strong></span>
              </div>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-xs font-bold text-slate-800 uppercase">랙 위치:</span>
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  loc.isUnassigned ? 'text-amber-900' : 'text-slate-950'
                }`}>
                  {loc.rack}
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-amber-500/40 pt-2.5 sm:pt-0">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-800">
              품목코드 (SKU)
            </span>
            <div className="text-sm font-black font-mono bg-white/95 px-3 py-1 rounded-lg text-slate-950 shadow-2xs border border-amber-400/80">
              {item.code}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Photo, Specifications & QR Label (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Photo Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  품목 사진
                </h2>
                {isPhotoUpdating && (
                  <span className="text-2xs font-semibold text-indigo-600 animate-pulse">
                    사진 저장 중...
                  </span>
                )}
              </div>

              <div className="relative w-full h-56 rounded-xl bg-slate-50 overflow-hidden border border-slate-200 flex items-center justify-center group">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-1.5" />
                    <p className="text-xs font-medium">등록된 사진이 없습니다</p>
                    <p className="text-2xs text-slate-400">아래 버튼으로 현장에서 바로 촬영하세요</p>
                  </div>
                )}

                {/* Photo Upload & Camera Action Controls */}
                <div className="absolute bottom-3 right-3 flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>현장 촬영</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>앨범 선택</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Item Basic Information Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${catBadge}`}>
                  {item.category}
                </span>
                {item.supplier && (
                  <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    공급사: {cleanSupplierDisplayName(item.supplier)}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-xl font-black text-slate-900 leading-snug">
                  {item.name}
                </h1>
                {item.spec && (
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    규격: <strong className="text-slate-700">{item.spec}</strong>
                  </p>
                )}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold block">단가</span>
                  <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                    ₩{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold block">재고 평가액</span>
                  <span className="font-bold text-indigo-600 mt-0.5 block font-mono">
                    ₩{(item.quantity * item.price).toLocaleString()}
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 text-xs text-amber-900">
                  <strong className="text-amber-950 mr-1.5">비고:</strong>
                  {item.notes}
                </div>
              )}
            </div>

            {/* Standard 80×60mm QR Label Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                  <QRCodeSVG value={qrUrl} size={64} level="M" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">80×60mm 랙 라벨</h3>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    {item.isPrinted ? `✓ ${item.printCount || 1}회 출력됨` : '현재 미출력 상태'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenPrint(item)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>라벨 인쇄</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Stock Controller & Audit History (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Real-time Current Stock Display Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block">
                    현재고 수량
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                        isLowStock ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {item.quantity.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-500">{item.unit || 'EA'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block">
                    안전재고
                  </span>
                  <p className="text-sm font-bold font-mono text-slate-700 mt-1">
                    {item.safetyStock} {item.unit || 'EA'}
                  </p>
                  {isLowStock ? (
                    <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md mt-1.5 shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      안전재고 부족 (발주요망)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md mt-1.5">
                      ✓ 재고 정상
                    </span>
                  )}
                </div>
              </div>

              {/* Fast One-Touch In/Out Touch Pad */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    현장 원터치 빠른 입출고
                  </h3>
                  <span className="text-2xs text-slate-400 font-medium">터치 즉시 수량 반영</span>
                </div>

                {/* Quick Touch Delta Buttons */}
                <div className="grid grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyDelta(-10)}
                    disabled={item.quantity < 10}
                    className="py-2.5 text-xs font-extrabold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl border border-rose-200 disabled:opacity-30 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDelta(-5)}
                    disabled={item.quantity < 5}
                    className="py-2.5 text-xs font-extrabold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl border border-rose-200 disabled:opacity-30 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDelta(-1)}
                    disabled={item.quantity < 1}
                    className="py-2.5 text-xs font-extrabold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl border border-rose-200 disabled:opacity-30 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    -1
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyDelta(1)}
                    className="py-2.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDelta(5)}
                    className="py-2.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDelta(10)}
                    className="py-2.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    +10
                  </button>
                </div>

                {/* Custom Quantity Input & Manager Details */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="담당자명"
                      className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                    />
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="사유 (예: 1라인 생산불출)"
                      className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={customQty}
                      onChange={(e) => setCustomQty(e.target.value)}
                      placeholder="수량 직접 입력..."
                      className="flex-1 px-3 py-2 text-sm font-bold font-mono bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCustomSubmit('OUT')}
                      disabled={!customQty || parseInt(customQty) <= 0 || item.quantity < parseInt(customQty)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>출고 처리</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCustomSubmit('IN')}
                      disabled={!customQty || parseInt(customQty) <= 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>입고 처리</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Audit History Log Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>해당 품목 실시간 입출고 이력</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {itemLogs.length}건 기록
                </span>
              </div>

              {itemLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p>최근 입출고 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {itemLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-2xs font-bold ${
                              log.type === 'IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.type === 'IN' ? '입고' : log.type === 'OUT' ? '출고' : '조정'}
                          </span>
                          <span className="font-extrabold font-mono text-slate-900 text-sm">
                            {log.type === 'IN' ? '+' : '-'}{log.quantity} {item.unit || 'EA'}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500">
                          {log.manager} • {log.reason}
                        </p>
                      </div>
                      <span className="text-2xs text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Standalone Navigation Toolbar */}
        <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            <span>메인 대시보드 (전체 목록)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEdit(item)}
              className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>정보 수정</span>
            </button>
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>다음 QR 바코드 스캔</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
