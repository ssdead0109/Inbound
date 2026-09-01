import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Building2,
  Printer, 
  QrCode, 
  Edit3, 
  Share2, 
  Layers, 
  AlertCircle, 
  History, 
  Camera, 
  CheckCircle,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem, StockLog } from '../types/inventory';
import { getCategoryBadgeColor, compressAndFormatImage } from '../utils/imageUtils';
import { parseWarehouseAndRack, parseItemLocations, cleanSupplierDisplayName } from '../utils/excelHelper';
import { generateItemQRValue } from '../utils/qrHelper';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEdit?: (item: InventoryItem) => void;
  onOpenEdit?: (item: InventoryItem) => void;
  onPrintSingle?: (item: InventoryItem) => void;
  onOpenPrint?: (item: InventoryItem) => void;
  onStockIn?: (item: InventoryItem) => void;
  onStockOut?: (item: InventoryItem) => void;
  onOpenStockAction?: (item: InventoryItem, action: 'IN' | 'OUT') => void;
  onUpdatePhoto?: (itemId: string, photoBase64: string) => void;
  logs?: StockLog[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onOpenEdit,
  onPrintSingle,
  onOpenPrint,
  onStockIn,
  onStockOut,
  onOpenStockAction,
  onUpdatePhoto,
  logs = [],
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !item) return null;

  // Safe handler bridges
  const handleEdit = onEdit || onOpenEdit || (() => {});
  const handlePrint = onPrintSingle || onOpenPrint || (() => {});

  const handleStockIn = () => {
    if (onStockIn) {
      onStockIn(item);
    } else if (onOpenStockAction) {
      onOpenStockAction(item, 'IN');
    }
  };

  const handleStockOut = () => {
    if (onStockOut) {
      onStockOut(item);
    } else if (onOpenStockAction) {
      onOpenStockAction(item, 'OUT');
    }
  };

  const qrValue = generateItemQRValue(item);
  const isLowStock = item.quantity <= (item.safetyStock || 0);
  const catBadge = getCategoryBadgeColor(item.category || '일반');
  const itemLogs = (logs || []).filter((l) => l.itemId === item.id || l.itemCode === item.code);
  const locations = parseItemLocations(item);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdatePhoto) {
      try {
        const base64 = await compressAndFormatImage(e.target.files[0], 800, 800, 0.82);
        onUpdatePhoto(item.id, base64);
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
              {locations.map((loc, idx) => (
                <div key={idx} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>{loc.warehouse}</span>
                  {!loc.isUnassigned && (
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded ml-1 border border-indigo-200">
                      {loc.rack}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                {item.code}
              </span>
              <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-tight mt-0.5" title={item.name}>
                {item.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 🚀 2번 요청: 80x60 라벨 인쇄 -> 라벨 인쇄로 변경 */}
            <button
              type="button"
              onClick={() => handlePrint(item)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="라벨 인쇄 화면 열기"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>라벨 인쇄</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                handleEdit(item);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="품목 정보 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body (🚀 4번 요청: 일관된 폰트 계층 규칙 적용) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top Row: Photo + QR Code Card + Stock Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Photo */}
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 min-h-[170px] flex items-center justify-center group">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                  <p className="text-xs">사진 없음</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1 shadow-md opacity-90 group-hover:opacity-100 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-emerald-400" /> 사진 변경
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* QR Code & Mobile Scan Link */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <QRCodeSVG value={qrValue} size={90} level="M" />
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile QR</p>
                <p className="text-[11px] text-slate-400">카메라로 비추면 바로 열림</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-1 flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>{copied ? '복사 완료!' : '모바일 링크 복사'}</span>
              </button>
            </div>

            {/* Stock Level Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Current Stock
                </span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span
                    className={`text-3xl font-extrabold font-mono tracking-tight ${
                      isLowStock ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {item.quantity.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{item.unit || 'EA'}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  안전재고: <span className="font-semibold text-slate-800">{item.safetyStock} {item.unit || 'EA'}</span>
                </div>
                {isLowStock && (
                  <div className="mt-2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> 안전재고 미달 (발주 필요)
                  </div>
                )}
              </div>

              {/* In/Out Quick Action Buttons (🚀 3번 요청: 빠른입고/빠른출고 정상 작동) */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleStockIn}
                  className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>＋ 빠른 입고</span>
                </button>
                <button
                  type="button"
                  onClick={handleStockOut}
                  disabled={item.quantity <= 0}
                  className="py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>－ 빠른 출고</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details Specification Grid (🚀 4번 요청: 일관된 폰트 크기 규칙 적용) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              품목 상세 속성
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 p-px">
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">보관 창고</span>
                <span className="font-bold text-slate-800 mt-1 block text-xs">
                  {locations.map((l) => l.warehouse).filter(Boolean).join(', ') || '-'}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">랙 위치</span>
                <span className="mt-1 font-bold font-mono text-xs block text-indigo-700">
                  {locations.map((l) => l.rack).filter(Boolean).join(', ') || '미입력'}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">등급 (카테고리)</span>
                <span className={`inline-block mt-1 font-semibold text-xs px-2 py-0.5 rounded-full border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                  {item.category || '일반'}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">규격 / 사양</span>
                <span className="font-semibold text-slate-800 mt-1 block text-xs">{item.spec || '-'}</span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">단가 (원)</span>
                <span className="font-bold text-slate-800 mt-1 block text-xs font-mono">
                  {item.price ? `₩${item.price.toLocaleString()}` : '-'}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">재고 평가액</span>
                <span className="font-bold text-indigo-600 mt-1 block text-xs font-mono">
                  ₩{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">공급업체 / 입고처</span>
                <span className="font-semibold text-slate-800 mt-1 block text-xs truncate" title={item.supplier || ''}>
                  {cleanSupplierDisplayName(item.supplier) || '-'}
                </span>
              </div>
              <div className="bg-white p-3">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">최종 수정일시</span>
                <span className="text-slate-600 mt-1 block font-mono text-[11px]">
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : '-'}
                </span>
              </div>
            </div>
            {item.notes && (
              <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-700 mr-2">비고:</span>
                <span className="text-slate-600">{item.notes}</span>
              </div>
            )}
          </div>

          {/* Item Specific Stock History */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700">
                <History className="w-3.5 h-3.5 text-slate-400" /> 해당 품목 입출고 내역
              </span>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">{itemLogs.length}건 기록</span>
            </div>
            {itemLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                입출고 이력이 없습니다.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">구분</th>
                      <th className="p-2.5">변동수량</th>
                      <th className="p-2.5">담당자</th>
                      <th className="p-2.5">사유</th>
                      <th className="p-2.5 text-right">일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {itemLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold text-[11px] ${
                              log.type === 'IN'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.type === 'OUT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {log.type === 'IN' ? '입고' : log.type === 'OUT' ? '출고' : '조정'}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold font-mono">
                          {log.type === 'IN' ? `+${log.quantity}` : log.type === 'OUT' ? `-${log.quantity}` : log.quantity} {item.unit || 'EA'}
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium">{log.manager}</td>
                        <td className="p-2.5 text-slate-500">{log.reason}</td>
                        <td className="p-2.5 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
