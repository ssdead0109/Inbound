import React, { useState } from 'react';
import {
  QrCode,
  Clock,
  History,
  User,
  RotateCcw,
  Database
} from 'lucide-react';
import { InboundViewTab } from '../../types/inbound';

interface InboundNavbarProps {
  currentTab: InboundViewTab;
  onSelectTab: (tab: InboundViewTab) => void;
  pendingCount: number;
  operator: string;
  onChangeOperator: (operator: string) => void;
  onResetSamples: () => void;
}

const DEFAULT_OPERATORS = [
  '홍길동 (자재과장)',
  '김철수 (자재담당)',
  '이영희 (수입검수원)',
  '박민수 (물류관리)',
];

export const InboundNavbar: React.FC<InboundNavbarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  operator,
  onChangeOperator,
  onResetSamples,
}) => {
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [customOpInput, setCustomOpInput] = useState(operator);

  const handleSaveCustomOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOpInput.trim()) {
      onChangeOperator(customOpInput.trim());
      setIsEditingOperator(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 select-none shadow-2xs w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Brand Title: "KCP 자재입고" */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => onSelectTab('SCANNER')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 whitespace-nowrap">
                KCP <span className="text-indigo-600 font-bold ml-1">자재입고</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectTab('SCANNER')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'SCANNER'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR 스캔</span>
            </button>

            <button
              onClick={() => onSelectTab('PENDING')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                currentTab === 'PENDING'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>입고 대기</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('HISTORY')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'HISTORY'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>입고 내역</span>
            </button>

            <button
              onClick={() => onSelectTab('ERP_SEARCH')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'ERP_SEARCH'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>ERP 자재조회</span>
            </button>
          </nav>

          {/* Right Operator Simple Selector & Reset */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {isEditingOperator ? (
              <form onSubmit={handleSaveCustomOp} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={customOpInput}
                  onChange={(e) => setCustomOpInput(e.target.value)}
                  className="w-24 sm:w-32 px-2 py-1 text-xs bg-white border border-indigo-500 rounded-lg text-slate-900 font-medium focus:outline-none ring-2 ring-indigo-500/20"
                  autoFocus
                  placeholder="담당자명"
                />
                <button type="submit" className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg font-bold">
                  저장
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={DEFAULT_OPERATORS.includes(operator) ? operator : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsEditingOperator(true);
                    } else {
                      onChangeOperator(e.target.value);
                    }
                  }}
                  className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer pr-1 max-w-[110px] sm:max-w-none truncate"
                >
                  {DEFAULT_OPERATORS.map((op) => (
                    <option key={op} value={op} className="bg-white text-slate-900">
                      {op}
                    </option>
                  ))}
                  {!DEFAULT_OPERATORS.includes(operator) && (
                    <option value="custom" className="bg-white text-slate-900">
                      {operator}
                    </option>
                  )}
                  <option value="custom" className="bg-white text-indigo-600 font-bold">
                    ✏️ 직접 입력...
                  </option>
                </select>
              </div>
            )}

            {/* Quick Reset Sample Button */}
            <button
              type="button"
              onClick={onResetSamples}
              title="샘플 납품확인서 데이터 복원"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
