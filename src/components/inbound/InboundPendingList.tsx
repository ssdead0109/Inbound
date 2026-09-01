import React, { useState } from 'react';
import {
  Clock,
  Building2,
  Boxes,
  ArrowRight,
  Search,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';

interface InboundPendingListProps {
  slips: InboundSlip[];
  onSelectSlip: (slipNo: string) => void;
  onOpenScanner: () => void;
}

export const InboundPendingList: React.FC<InboundPendingListProps> = ({
  slips,
  onSelectSlip,
  onOpenScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'INSPECTING' | 'HOLD'>('ALL');

  const pendingList = slips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING' || s.status === 'HOLD');

  const filtered = pendingList.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchNo = s.slipNo.toLowerCase().includes(q);
      const matchSupplier = s.supplierName.toLowerCase().includes(q);
      const matchPo = s.poNumber?.toLowerCase().includes(q);
      const matchItem = s.items.some(
        (it) => it.itemCode.toLowerCase().includes(q) || it.itemName.toLowerCase().includes(q)
      );
      return matchNo || matchSupplier || matchPo || matchItem;
    }
    return true;
  });

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 w-full overflow-x-hidden">
      
      {/* Header Banner (Spacious PC layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              입고 대기 납품확인서
              <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {pendingList.length}건
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              납품업체에서 발행된 미입고 전표 목록입니다. 선택하거나 QR을 스캔하여 검수하세요.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenScanner}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
        >
          <PackageCheck className="w-4 h-4" />
          <span>카메라 QR 스캔</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="전표번호, 공급처, 품목명 검색..."
            className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-end sm:self-auto text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            전체 ({pendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('WAITING')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'WAITING'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            대기중 ({pendingList.filter((s) => s.status === 'WAITING').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INSPECTING')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'INSPECTING'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            검수중 ({pendingList.filter((s) => s.status === 'INSPECTING').length})
          </button>
        </div>
      </div>

      {/* Slip Cards Grid (PC: 3 Columns) */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">입고 대기 전표가 없습니다</h3>
          <p className="text-xs text-slate-500 font-normal">
            새로운 납품확인서 QR을 스캔하여 검수를 시작하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((slip) => (
            <div
              key={slip.slipNo}
              onClick={() => onSelectSlip(slip.slipNo)}
              className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-indigo-600">
                      {slip.slipNo}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      slip.status === 'WAITING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : slip.status === 'INSPECTING'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {slip.status === 'WAITING' ? '입고 대기' : slip.status === 'INSPECTING' ? '검수중' : '보류'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{slip.deliveryDate}</span>
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">{slip.supplierName}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
                    <Boxes className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      품목 <strong className="text-slate-900">{slip.totalItems}종</strong> • 총 납품수량{' '}
                      <strong className="text-slate-900 font-mono">{slip.totalOrderedQty.toLocaleString()} EA</strong>
                    </span>
                  </div>

                  {slip.memo && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 truncate mt-2">
                      메모: {slip.memo}
                    </p>
                  )}
                </div>

                {/* Items Preview Chips */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {slip.items.slice(0, 3).map((it) => (
                    <span
                      key={it.id}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[160px]"
                    >
                      {it.itemName} ({it.orderQty}{it.unit})
                    </span>
                  ))}
                  {slip.items.length > 3 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium">
                      +{slip.items.length - 3}건
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-600">
                <span>검수 및 입고 진행</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
