import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemsToDelete: InventoryItem[];
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemsToDelete,
}) => {
  if (!isOpen || itemsToDelete.length === 0) return null;

  const isBatch = itemsToDelete.length > 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBatch ? `선택한 ${itemsToDelete.length}개 품목 삭제` : '품목 삭제 확인'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                삭제된 데이터는 복구할 수 없습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-3 bg-slate-50 border-y border-slate-100 max-h-48 overflow-y-auto text-xs space-y-1.5">
          <p className="font-semibold text-slate-700 mb-2">
            삭제 대상 품목 목록:
          </p>
          {itemsToDelete.map((item) => (
            <div
              key={item.id}
              className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="font-mono font-bold text-slate-800 mr-1.5">{item.code}</span>
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="text-2xs font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 shrink-0">
                재고: {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-white flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBatch ? `${itemsToDelete.length}개 일괄 삭제` : '삭제하기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
