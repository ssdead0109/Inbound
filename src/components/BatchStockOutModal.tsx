import React, { useState, useMemo } from 'react';
import { 
  X, 
  PackageMinus, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  FileText, 
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { InventoryItem, StockLog } from '../types/inventory';

export interface BatchStockOutRecord {
  itemId: string;
  quantity: number;
  manager: string;
  reason: string;
}

interface BatchStockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  onConfirm?: (records: BatchStockOutRecord[]) => void;
  onConfirmBatchOut?: (records: BatchStockOutRecord[]) => void;
}

export const BatchStockOutModal: React.FC<BatchStockOutModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onConfirm,
  onConfirmBatchOut,
}) => {
  // Global defaults for the batch
  const [commonManager, setCommonManager] = useState('현장 담당자');
  const [commonReason, setCommonReason] = useState('생산라인 불출');
  const [uniformQty, setUniformQty] = useState<number>(1);

  // Per-item quantities & reasons
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or update item quantities when selected items change
  React.useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      const initialQtys: Record<string, number> = {};
      const initialReasons: Record<string, string> = {};
      selectedItems.forEach((item) => {
        initialQtys[item.id] = 1;
        initialReasons[item.id] = commonReason;
      });
      setItemQuantities(initialQtys);
      setItemReasons(initialReasons);
      setErrorMsg(null);
    }
  }, [selectedItems, isOpen]);

  // Apply uniform quantity to all items
  const handleApplyUniformQty = (qty: number) => {
    const val = Math.max(1, qty);
    setUniformQty(val);
    setItemQuantities((prev) => {
      const updated: Record<string, number> = {};
      selectedItems.forEach((item) => {
        updated[item.id] = val;
      });
      return updated;
    });
  };

  // Apply common reason to all items
  const handleApplyCommonReason = (reason: string) => {
    setCommonReason(reason);
    setItemReasons((prev) => {
      const updated: Record<string, string> = {};
      selectedItems.forEach((item) => {
        updated[item.id] = reason;
      });
      return updated;
    });
  };

  const handleUpdateItemQty = (id: string, qty: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, qty),
    }));
  };

  // Check if any item will result in negative stock
  const hasDeficit = useMemo(() => {
    return selectedItems.some((item) => {
      const outQty = itemQuantities[item.id] || 0;
      return outQty > item.quantity;
    });
  }, [selectedItems, itemQuantities]);

  // Total quantity being issued
  const totalOutQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (itemQuantities[item.id] || 0), 0);
  }, [selectedItems, itemQuantities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonManager.trim()) {
      setErrorMsg('출고 담당자명을 입력해주세요.');
      return;
    }

    if (totalOutQuantity <= 0) {
      setErrorMsg('출고할 수량을 1개 이상 입력해주세요.');
      return;
    }

    const records: BatchStockOutRecord[] = selectedItems.map((item) => ({
      itemId: item.id,
      quantity: itemQuantities[item.id] || 0,
      manager: commonManager.trim(),
      reason: (itemReasons[item.id] || commonReason).trim() || '일괄 출고',
    })).filter((rec) => rec.quantity > 0);

    if (records.length === 0) {
      setErrorMsg('출고 수량이 0보다 큰 품목이 없습니다.');
      return;
    }

    if (onConfirm) {
      onConfirm(records);
    } else if (onConfirmBatchOut) {
      onConfirmBatchOut(records);
    }
    onClose();
  };

  if (!isOpen || selectedItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                선택한 {selectedItems.length}개 품목 일괄 출고 (불출)
              </h3>
              <p className="text-2xs text-rose-200">
                여러 개 품목의 출고 수량을 확인하고 일괄 차감 처리합니다
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Batch Options */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Manager */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>출고 담당자 <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={commonManager}
                onChange={(e) => setCommonManager(e.target.value)}
                placeholder="예: 김철수 대리, 생산1팀"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>

            {/* Common Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>공통 출고 사유</span>
              </label>
              <input
                type="text"
                value={commonReason}
                onChange={(e) => handleApplyCommonReason(e.target.value)}
                placeholder="예: 생산라인 긴급 투입, 현장 불출"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-2xs font-bold text-slate-500 mr-1">사유 빠른선택:</span>
              {['생산라인 불출', '정기 출고', '현장 긴급 투입', '고객사 납품', '불량 반품'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleApplyCommonReason(r)}
                  className={`px-2 py-0.5 rounded text-2xs font-medium transition-colors cursor-pointer ${
                    commonReason === r
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Uniform Quantity Control */}
            <div className="flex items-center space-x-2">
              <span className="text-2xs font-bold text-slate-500">전체 동일수량 지정:</span>
              <div className="inline-flex items-center space-x-1 bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleApplyUniformQty(Math.max(1, uniformQty - 1))}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={uniformQty}
                  onChange={(e) => handleApplyUniformQty(parseInt(e.target.value) || 1)}
                  className="w-12 text-center text-xs font-bold font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyUniformQty(uniformQty + 1)}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selected Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>출고 대상 품목 목록 ({selectedItems.length}건)</span>
            <span>총 출고 예정 수량: <strong className="text-rose-600 font-mono text-sm">{totalOutQuantity.toLocaleString()}</strong> 개</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
            {selectedItems.map((item) => {
              const outQty = itemQuantities[item.id] || 0;
              const remainingQty = item.quantity - outQty;
              const isOverStock = remainingQty < 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isOverStock ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Item Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {item.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-2xs text-slate-500 mt-1">
                      <span>랙위치: <strong className="text-slate-700 font-mono">{item.rackLocation || '미입력'}</strong></span>
                      <span>•</span>
                      <span>현재고: <strong className="text-slate-900 font-mono">{item.quantity} {item.unit}</strong></span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>출고 후 잔여:</span>
                        <strong className={`font-mono ${isOverStock ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                          {remainingQty} {item.unit}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input for this item */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.id, Math.max(0, outQty - 1))}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={outQty}
                        onChange={(e) => handleUpdateItemQty(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded py-1 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.id, outQty + 1)}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-8">{item.unit || 'EA'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasDeficit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>일부 품목의 출고 수량이 현재고를 초과하여 음수(-) 재고가 발생할 수 있습니다. 수량을 확인해 주세요.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>출고 처리 시 모든 품목에 출고 로그 및 시간이 자동 기록됩니다.</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <PackageMinus className="w-4 h-4" />
              <span>{selectedItems.length}개 품목 일괄 출고 실행</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
