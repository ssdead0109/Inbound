import React, { useState, useEffect, useRef } from 'react';
import {
  PackageCheck,
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Plus,
  Minus,
  ArrowLeft,
  Warehouse,
  Check,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Eye,
  Upload,
  ZoomIn,
  Database
} from 'lucide-react';
import { InboundSlip, InboundItem, InboundReceivePayload } from '../../types/inbound';
import { soundHelper } from '../../utils/soundHelper';

interface InboundReceivingViewProps {
  slip: InboundSlip;
  operator: string;
  warehouses: string[];
  onConfirmReceiving: (payload: InboundReceivePayload) => Promise<void>;
  onHoldSlip: (slipNo: string, memo: string) => Promise<void>;
  onBackToScanner: () => void;
}

const COMMON_DEFECT_REASONS = [
  '외관 스크래치 / 파손',
  '치수 규격 불일치',
  '포장 훼손 및 오염',
  '수량 부족 / 누락',
  '도면 사양 상이',
  '부식 / 녹 발생',
];

// Helper to compress image files to high-quality lightweight base64
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const InboundReceivingView: React.FC<InboundReceivingViewProps> = ({
  slip,
  operator,
  warehouses,
  onConfirmReceiving,
  onHoldSlip,
  onBackToScanner,
}) => {
  const [items, setItems] = useState<InboundItem[]>(slip.items || []);
  const [memo, setMemo] = useState<string>(slip.memo || '');
  const [photos, setPhotos] = useState<string[]>(slip.photos || []);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [targetWarehouse, setTargetWarehouse] = useState<string>(() => {
    return slip.items?.[0]?.warehouse || warehouses[0] || '특장자재창고';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [selectedDefectItem, setSelectedDefectItem] = useState<InboundItem | null>(null);
  const [defectQtyInput, setDefectQtyInput] = useState<number>(0);
  const [defectReasonInput, setDefectReasonInput] = useState<string>('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(slip.items || []);
    setMemo(slip.memo || '');
    setPhotos(slip.photos || []);
    const firstItemWh = slip.items?.[0]?.warehouse;
    if (firstItemWh) {
      setTargetWarehouse(firstItemWh);
    }
  }, [slip]);

  // Adjust received quantity for an item
  const handleQuantityChange = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const newQty = Math.max(0, (it.receivedQty || 0) + delta);
        return {
          ...it,
          receivedQty: newQty,
          status: newQty >= it.orderQty && it.defectQty === 0 ? 'CHECKED' : 'WAITING',
        };
      })
    );
  };

  // Set direct received quantity with 0 clearing support
  const handleDirectQuantitySet = (itemId: string, rawVal: string) => {
    const parsed = rawVal.trim() === '' ? 0 : parseInt(rawVal, 10);
    const qty = Math.max(0, isNaN(parsed) ? 0 : parsed);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          receivedQty: qty,
          status: qty >= it.orderQty && it.defectQty === 0 ? 'CHECKED' : 'WAITING',
        };
      })
    );
  };

  // Match 100% order quantity for one item
  const handleMatchOrderQty = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          receivedQty: it.orderQty,
          defectQty: 0,
          defectReason: '',
          status: 'CHECKED',
        };
      })
    );
  };

  // Match all items 100%
  const handleMatchAllItems = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        receivedQty: it.orderQty,
        defectQty: 0,
        defectReason: '',
        status: 'CHECKED',
      }))
    );
  };

  // Open Defect Modal
  const handleOpenDefectModal = (item: InboundItem) => {
    setSelectedDefectItem(item);
    setDefectQtyInput(item.defectQty || 1);
    setDefectReasonInput(item.defectReason || COMMON_DEFECT_REASONS[0]);
  };

  // Save Defect info
  const handleSaveDefect = () => {
    if (!selectedDefectItem) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== selectedDefectItem.id) return it;
        const defQty = Math.max(0, defectQtyInput);
        const newReceivedQty = Math.max(0, it.orderQty - defQty);
        return {
          ...it,
          defectQty: defQty,
          defectReason: defQty > 0 ? defectReasonInput : '',
          receivedQty: newReceivedQty,
          status: defQty > 0 ? 'DEFECT' : 'CHECKED',
        };
      })
    );
    setSelectedDefectItem(null);
  };

  // Photo Upload Handler (Supports Multi-Upload and Compression)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        newPhotos.push(compressed);
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('이미지 파일을 압축 및 변환하는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (previewPhotoUrl && photos[index] === previewPhotoUrl) {
      setPreviewPhotoUrl(null);
    }
  };

  // Totals
  const totalOrdered = items.reduce((sum, it) => sum + (it.orderQty || 0), 0);
  const totalReceived = items.reduce((sum, it) => sum + (it.receivedQty || 0), 0);
  const totalDefects = items.reduce((sum, it) => sum + (it.defectQty || 0), 0);

  // Process Confirm Receiving
  const handleSubmitReceiving = async (completeAll: boolean) => {
    setIsSubmitting(true);
    try {
      const payload: InboundReceivePayload = {
        slipNo: slip.slipNo,
        items: items.map((it) => ({
          id: it.id,
          itemCode: it.itemCode,
          receivedQty: completeAll ? it.orderQty : it.receivedQty,
          defectQty: completeAll ? 0 : it.defectQty,
          defectReason: completeAll ? '' : it.defectReason,
          warehouse: targetWarehouse,
        })),
        manager: operator,
        warehouse: targetWarehouse,
        memo,
        photos: photos.length > 0 ? photos : undefined,
        completeAll,
      };

      await onConfirmReceiving(payload);
    } catch (err: any) {
      alert(`입고 처리 실패: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-20 w-full overflow-x-hidden">
      
      {/* Top Return Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToScanner}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QR 스캔으로 돌아가기</span>
        </button>

        {(slip.supplierCode?.startsWith('SUP-ERP') || slip.slipNo.length === 11 || !slip.slipNo.startsWith('DN-')) && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>ERP(MSSQL) 실시간 입고 모드</span>
          </span>
        )}
      </div>

      {/* Slip Master Overview Card (Simplified with small, balanced typography) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-sm sm:text-base font-bold text-indigo-600">
                {slip.slipNo}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                slip.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : slip.status === 'PARTIAL'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {slip.status === 'COMPLETED' ? '입고 완료' : slip.status === 'PARTIAL' ? '부분 입고' : '입고 대기'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>발주: <strong className="text-slate-700 font-mono text-xs">{slip.poNumber || '미지정'}</strong></span>
              <span>•</span>
              <span>납품일: <strong className="text-slate-700 font-mono text-xs">{slip.deliveryDate}</strong></span>
            </p>
          </div>

          {/* Supplier Info with harmonized font */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium leading-tight">납품업체</span>
              <span className="font-semibold text-slate-800 text-xs truncate block max-w-[180px] sm:max-w-[240px]">
                {slip.supplierName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Inspection List (Directly beneath Supplier Info) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            납품 품목 리스트 ({items.length}건)
          </h3>
          <button
            type="button"
            onClick={handleMatchAllItems}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            전체 수량 일치
          </button>
        </div>

        {/* Item Cards */}
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isMatch = item.receivedQty === item.orderQty && item.defectQty === 0;
            const isDefect = item.defectQty > 0;
            const isPartial = item.receivedQty < item.orderQty;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-3.5 shadow-xs ${
                  isDefect
                    ? 'border-rose-300 bg-rose-50/20'
                    : isMatch
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                  
                  {/* Item Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-indigo-700 border border-slate-200">
                        #{idx + 1} {item.itemCode}
                      </span>
                      {isMatch && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 정상 일치
                        </span>
                      )}
                      {isDefect && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 불량 {item.defectQty}{item.unit}
                        </span>
                      )}
                      {isPartial && !isDefect && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          수량 부족 ({item.receivedQty}/{item.orderQty})
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 tracking-tight truncate">
                      {item.itemName}
                    </h4>
                    
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-normal truncate">
                      규격: <span className="text-slate-700 font-medium">{item.spec || '표준'}</span> • 단위: <span className="text-slate-700 font-bold">{item.unit}</span>
                      {item.unitPrice ? ` • 단가: ${item.unitPrice.toLocaleString()}원` : ''}
                    </p>

                    {item.defectReason && (
                      <p className="text-[10px] sm:text-[11px] font-semibold text-rose-600 mt-1 bg-rose-50 px-2 py-0.5 rounded-md inline-block border border-rose-200">
                        ⚠️ 불량 사유: {item.defectReason}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between lg:justify-end space-x-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Delivery Qty (납품수량 - Harmonized Font Size) */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium leading-tight">납품수량</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {item.orderQty.toLocaleString()} {item.unit}
                      </span>
                    </div>

                    {/* Stepper Controls with 0-clearing support */}
                    <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-300">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200"
                        title="1개 감소"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={item.receivedQty === 0 ? '' : item.receivedQty}
                        placeholder="0"
                        onChange={(e) => handleDirectQuantitySet(item.id, e.target.value)}
                        className="w-12 text-center bg-transparent text-slate-900 font-mono font-bold text-xs focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200"
                        title="1개 증가"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Match Button (1 line fixed) */}
                    <button
                      type="button"
                      onClick={() => handleMatchOrderQty(item.id)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isMatch
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300'
                      }`}
                      title="납품 수량과 동일하게 맞춤"
                    >
                      전량
                    </button>

                    {/* Defect Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDefectModal(item)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        isDefect
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-500 hover:text-rose-600 border-slate-300 hover:bg-rose-50'
                      }`}
                      title="불량/파손 등록"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receiving Memo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          입고 검수 메모 (선택사항)
        </label>
        <textarea
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="특이사항(예: 포장 양호, 1차 긴급 입고분 등)을 입력하세요"
          className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
        ></textarea>
      </div>

      {/* Inbound Action Card (Placed directly under Memo) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Warehouse Selector & Hold Button Row */}
        <div className="flex items-center justify-between gap-2.5">
          
          {/* Target Warehouse Selector */}
          <div className="flex items-center space-x-2 bg-indigo-50/80 border border-indigo-200 px-3.5 py-2.5 rounded-xl flex-1 min-w-0">
            <Warehouse className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs text-indigo-900 font-bold whitespace-nowrap">입고창고:</span>
            <select
              value={targetWarehouse}
              onChange={(e) => setTargetWarehouse(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer pr-1 flex-1 truncate"
            >
              {warehouses.map((wh) => (
                <option key={wh} value={wh} className="bg-white text-slate-900">
                  {wh}
                </option>
              ))}
              {!warehouses.includes(targetWarehouse) && (
                <option value={targetWarehouse} className="bg-white text-slate-900">
                  {targetWarehouse}
                </option>
              )}
            </select>
          </div>

          {/* Hold Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onHoldSlip(slip.slipNo, memo || '자재과 보류 요청')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
          >
            입고 보류
          </button>
        </div>

        {/* Partial Inbound Confirm (if quantities are partially inspected) */}
        {totalReceived < totalOrdered && totalReceived > 0 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmitReceiving(false)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>검수 수량만 부분 입고 ({totalReceived} / {totalOrdered}개)</span>
          </button>
        )}

        {/* Inbound Confirm - Full Width Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmitReceiving(true)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
        >
          <PackageCheck className="w-4 h-4" />
          <span>
            {isSubmitting ? '입고 처리중...' : '입고 확정'}
          </span>
        </button>

      </div>

      {/* Inbound Photo Attachment Card (Placed below Inbound Confirm Button) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-indigo-600" />
            현장 입고 / 검수 사진 첨부 (선택사항)
            {photos.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {photos.length}장 등록됨
              </span>
            )}
          </label>
          <span className="text-[11px] text-slate-400">포장/파손/현장 실물 증빙</span>
        </div>

        {/* Upload Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-2xs"
          >
            <Camera className="w-4 h-4" />
            <span>현장 사진 촬영</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>앨범에서 선택</span>
          </button>

          {isProcessingPhotos && (
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1 animate-pulse">
              <div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
              사진 압축 중...
            </span>
          )}
        </div>

        {/* Photos Thumbnail Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
              >
                <img
                  src={url}
                  alt={`입고 사진 ${idx + 1}`}
                  onClick={() => setPreviewPhotoUrl(url)}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                />

                {/* View Overlay */}
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(url)}
                  className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                  title="사진 크게 보기"
                >
                  <Eye className="w-4 h-4 drop-shadow" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-all shadow-xs cursor-pointer z-10"
                  title="사진 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/70 text-white text-[9px] font-mono">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Defect Modal */}
      {selectedDefectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">불량 / 파손 수량 등록</h3>
            </div>

            <p className="text-xs text-slate-600">
              <strong className="text-slate-900">{selectedDefectItem.itemName}</strong> ({selectedDefectItem.itemCode})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">불량 수량 ({selectedDefectItem.unit})</label>
                <input
                  type="number"
                  min="0"
                  max={selectedDefectItem.orderQty}
                  value={defectQtyInput}
                  onChange={(e) => setDefectQtyInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white text-slate-900 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">불량 사유 선택</label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {COMMON_DEFECT_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDefectReasonInput(r)}
                      className={`px-2.5 py-1.5 text-2xs font-semibold rounded-lg text-left transition-all border cursor-pointer ${
                        defectReasonInput === r
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={defectReasonInput}
                  onChange={(e) => setDefectReasonInput(e.target.value)}
                  placeholder="직접 사유 입력"
                  className="w-full px-3 py-2 bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDefectItem(null)}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl border border-slate-300 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveDefect}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                불량 정보 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Preview Modal */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">현장 입고 사진 확대보기</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[65vh] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={previewPhotoUrl}
                alt="확대 사진"
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                입고 전표: <strong className="font-mono text-indigo-600">{slip.slipNo}</strong>
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={previewPhotoUrl}
                  download={`inbound-photo-${slip.slipNo}.jpg`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>다운로드</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
