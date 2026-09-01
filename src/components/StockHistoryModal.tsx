import React, { useState, useMemo } from 'react';
import { X, History, Filter, Download, ArrowUpDown, Search, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { StockLog, StockActionType } from '../types/inventory';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: StockLog[];
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterType !== 'ALL' && log.type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = log.itemCode.toLowerCase().includes(q);
        const matchName = log.itemName.toLowerCase().includes(q);
        const matchMgr = log.manager.toLowerCase().includes(q);
        const matchReason = log.reason.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchMgr && !matchReason) return false;
      }
      return true;
    });
  }, [logs, filterType, search]);

  if (!isOpen) return null;

  const handleExportHistory = () => {
    const data = filteredLogs.map((l, idx) => ({
      'No': idx + 1,
      '일시': new Date(l.timestamp).toLocaleString('ko-KR'),
      '구분': l.type === 'IN' ? '입고' : l.type === 'OUT' ? '출고' : '조정',
      '품목코드': l.itemCode,
      '품목명': l.itemName,
      '변동수량': l.type === 'IN' ? `+${l.quantity}` : `-${l.quantity}`,
      '변동전재고': l.previousQty,
      '변동후재고': l.newQty,
      '담당자': l.manager,
      '사유': l.reason,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '입출고이력');
    XLSX.writeFile(wb, `SmartRack_입출고이력_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">전체 입출고 및 재고 변동 이력</h3>
              <p className="text-xs text-slate-400">모바일 현장 처리 및 관리자 입출고 내역 추적</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>이력 엑셀 다운로드</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="품목코드, 품명, 담당자, 사유 검색..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">구분:</span>
            {['ALL', 'IN', 'OUT', 'ADJUST'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' ? '전체' : t === 'IN' ? '입고' : t === 'OUT' ? '출고' : '조정'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-4 bg-slate-50/50">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-2xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3">일시</th>
                  <th className="p-3">구분</th>
                  <th className="p-3">품목 정보</th>
                  <th className="p-3 text-right">변동수량</th>
                  <th className="p-3 text-right">변동 후 재고</th>
                  <th className="p-3">담당자</th>
                  <th className="p-3">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      해당하는 입출고 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap text-2xs">
                        {new Date(log.timestamp).toLocaleString('ko-KR')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-2xs ${
                            log.type === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.type === 'OUT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {log.type === 'IN' ? '입고' : log.type === 'OUT' ? '출고' : '실사조정'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-indigo-600 mr-1.5 text-2xs">
                          {log.itemCode}
                        </span>
                        <span className="font-medium text-slate-900">{log.itemName}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap font-bold font-mono">
                        <span
                          className={log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}
                        >
                          {log.type === 'IN' ? '+' : '-'}{log.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap font-mono text-slate-700 font-bold">
                        {log.newQty}
                      </td>
                      <td className="p-3 text-slate-700 whitespace-nowrap font-medium">
                        {log.manager}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{log.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white text-xs text-slate-500 flex justify-between items-center">
          <span className="font-mono text-slate-400">총 {filteredLogs.length}건 기록</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
