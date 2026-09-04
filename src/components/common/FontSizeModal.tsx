import React, { useEffect, useState } from 'react';
import { Type, Check, X, Sparkles, Eye, ShieldCheck } from 'lucide-react';
import {
  FontSizeLevel,
  FONT_SIZE_OPTIONS,
  getSavedFontSize,
  setFontSize,
} from '../../utils/fontSizeHelper';
import { registerBackHandler } from '../../utils/backHandler';

interface FontSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: (level: FontSizeLevel) => void;
}

export const FontSizeModal: React.FC<FontSizeModalProps> = ({
  isOpen,
  onClose,
  onChanged,
}) => {
  const [currentLevel, setCurrentLevel] = useState<FontSizeLevel>(getSavedFontSize);

  // Register Android back button
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler('fontSizeModal', 90, () => {
      onClose();
      return true;
    });
  }, [isOpen, onClose]);

  // Keep state in sync when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentLevel(getSavedFontSize());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (level: FontSizeLevel) => {
    setCurrentLevel(level);
    setFontSize(level);
    if (onChanged) onChanged(level);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs border border-indigo-200">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <span>글씨 크기 설정</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                  큰글씨 모드
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                공장 현장 가독성에 맞춰 화면 글씨를 키웁니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Options List */}
          <div className="space-y-2.5">
            {FONT_SIZE_OPTIONS.map((opt) => {
              const isSelected = currentLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => handleSelect(opt.level)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[64px] ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-base sm:text-lg font-black tracking-tight ${
                        isSelected ? 'text-indigo-900' : 'text-slate-900'
                      }`}>
                        {opt.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {opt.badge}
                      </span>
                      {opt.level === 'large' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          추천
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${
                      isSelected ? 'text-indigo-700 font-semibold' : 'text-slate-500'
                    }`}>
                      {opt.desc}
                    </p>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'border-2 border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>실시간 화면 미리보기</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                즉시 적용 중
              </span>
            </div>

            {/* Sample ERP Material Item Box */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                  WMA-VALVE-01
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  A등급 · 제작자재
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900 truncate">
                유압 컨트롤 밸브 어셈블리 (KCP 메인)
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">
                  특장자재창고 [1층-A2]
                </span>
                <div className="font-mono font-black text-slate-900">
                  재고: <span className="text-indigo-600 font-black">1,450</span> EA
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>글씨가 커져도 레이아웃이 깨지지 않도록 정밀 보호됩니다.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
