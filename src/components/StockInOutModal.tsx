import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { InventoryItem, StockActionType } from '../types/inventory';

interface StockInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  initialType?: StockActionType;
  defaultType?: StockActionType;
  onConfirm?: (
    itemId: string,
    type: StockActionType,
    quantity: number,
    manager: string,
    reason: string
  ) => void;
  onSubmit?: (
    itemId: string,
    type: StockActionType,
    quantity: number,
    manager: string,
    reason: string
  ) => void;
}

export const StockInOutModal: React.FC<StockInOutModalProps> = ({
  isOpen,
  onClose,
  item,
  initialType,
  defaultType,
  onConfirm,
  onSubmit,
}) => {
  const targetType = initialType || defaultType || 'IN';
  const [type, setType] = useState<StockActionType>(targetType);
  const [qty, setQty] = useState<number>(1);
  const [manager, setManager] = useState(localStorage.getItem('smartrack_last_manager') || '');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 🚀 Synchronize type tab and reset inputs whenever modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      setType(initialType || defaultType || 'IN');
      setQty(1);
      setErrorMsg('');
      setReason('');
      const savedManager = localStorage.getItem('smartrack_last_manager');
      if (savedManager) setManager(savedManager);
    }
  }, [isOpen, initialType, defaultType]);

  if (!isOpen || !item) return null;

  const currentQty = item.quantity || 0;
  const newQty =
    type === 'IN'
      ? currentQty + qty
      : type === 'OUT'
      ? currentQty - qty
      : qty; // ADJUST

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) {
      setErrorMsg('1 이상의 수량을 입력해주세요.');
      return;
    }

    if (type === 'OUT' && qty > currentQty) {
      setErrorMsg(`현재고(${currentQty} ${item.unit || 'EA'})보다 많은 수량을 출고할 수 없습니다.`);
      return;
    }

    if (!manager.trim()) {
      setErrorMsg('작업 담당자명을 입력해주세요.');
      return;
    }

    localStorage.setItem('smartrack_last_manager', manager.trim());
    
    const finalReason = reason.trim() || (type === 'IN' ? '정기 입고' : type === 'OUT' ? '생산/출고 불출' : '재고 실사 조정');
    
    if (onConfirm) {
      onConfirm(item.id, type, qty, manager.trim(), finalReason);
    } else if (onSubmit) {
      onSubmit(item.id, type, qty, manager.trim(), finalReason);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              재고 {type === 'IN' ? '입고' : type === 'OUT' ? '출고' : '수량조정'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">[{item.code}] {item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Type Toggle */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('IN');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'IN'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ＋ 입고 (추가)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('OUT');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'OUT'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              － 출고 (차감)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('ADJUST');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'ADJUST'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✎ 실사조정
            </button>
          </div>

          {/* Calculation Display */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-center">
              <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">현재고</span>
              <p className="text-base font-bold text-slate-800">
                {currentQty} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300" />

            <div className="text-center">
              <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">
                {type === 'IN' ? '입고' : type === 'OUT' ? '출고' : '조정 수량'}
              </span>
              <p className={`text-base font-bold ${
                type === 'IN' ? 'text-emerald-600' : type === 'OUT' ? 'text-rose-600' : 'text-indigo-600'
              }`}>
                {type === 'IN' ? `+${qty}` : type === 'OUT' ? `-${qty}` : qty}{' '}
                <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300" />

            <div className="text-center">
              <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">반영 후</span>
              <p className="text-lg font-bold text-slate-900">
                {newQty} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </p>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              수량 입력 ({item.unit || 'EA'}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => {
                  setQty(Math.max(1, Number(e.target.value) || 0));
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 text-base font-bold bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
              />
              <div className="flex gap-1">
                {[5, 10, 50].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setQty((prev) => prev + step)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manager Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              작업 담당자 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="예: 김철수 대리"
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              처리 사유 / 비고
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'IN' ? '예: 정기 발주 입고 검수 완료' : '예: 2공정 생산라인 투입'}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-xs transition-colors ${
                type === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : type === 'OUT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {type === 'IN' ? '입고 완료' : type === 'OUT' ? '출고 완료' : '조정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
