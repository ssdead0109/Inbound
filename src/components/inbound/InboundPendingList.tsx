import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Building2,
  Boxes,
  ArrowRight,
  Search,
  PackageCheck,
  AlertCircle,
  Database,
  RefreshCw,
  Tag,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';
import { fetchErpPendingSlips } from '../../api/erpApi';

interface InboundPendingListProps {
  slips: InboundSlip[];
  onSelectSlip: (slipNo: string, erpSlip?: InboundSlip) => void;
  onOpenScanner: () => void;
  onOpenPrintModal?: (slip: InboundSlip) => void;
}

export const InboundPendingList: React.FC<InboundPendingListProps> = ({
  slips,
  onSelectSlip,
  onOpenScanner,
  onOpenPrintModal,
}) => {
  // Mode: 'LOCAL' vs 'ERP'
  const [sourceMode, setSourceMode] = useState<'LOCAL' | 'ERP'>('ERP');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'INSPECTING' | 'HOLD'>('ALL');

  // ERP Pending Slips State
  const [erpSlips, setErpSlips] = useState<InboundSlip[]>([]);
  const [isErpLoading, setIsErpLoading] = useState(false);

  // Load ERP Slips from MSSQL '미입고현황'
  const loadErpSlips = useCallback(async (query?: string) => {
    try {
      setIsErpLoading(true);
      const data = await fetchErpPendingSlips(query, 60);
      setErpSlips(data);
    } catch (err: any) {
      console.error('Failed to load ERP pending slips:', err);
    } finally {
      setIsErpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sourceMode === 'ERP') {
      loadErpSlips(searchTerm);
    }
  }, [sourceMode, loadErpSlips, searchTerm]);

  // Local pending list
  const localPendingList = slips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING' || s.status === 'HOLD');

  const filteredLocal = localPendingList.filter((s) => {
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

  const currentDisplayList = sourceMode === 'ERP' ? erpSlips : filteredLocal;

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 w-full overflow-x-hidden">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              입고 대기 납품확인서
              <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {currentDisplayList.length}건
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              사내 ERP(MSSQL <span className="font-mono text-indigo-600 font-semibold">미입고현황</span>) 및 로컬 전표를 실시간 검수하여 즉시 입고처리합니다.
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

      {/* Source Selector Tab (ERP vs Local) */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setSourceMode('ERP')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sourceMode === 'ERP'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>사내 ERP 미입고 전표 (MSSQL 실시간)</span>
          {isErpLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
        </button>

        <button
          onClick={() => setSourceMode('LOCAL')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sourceMode === 'LOCAL'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Boxes className="w-4 h-4 text-slate-500" />
          <span>로컬 샘플 전표 ({localPendingList.length}건)</span>
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

        {sourceMode === 'ERP' ? (
          <button
            onClick={() => loadErpSlips(searchTerm)}
            disabled={isErpLoading}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isErpLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>ERP 새로고침</span>
          </button>
        ) : (
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
              전체 ({localPendingList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('WAITING')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'WAITING'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              대기
            </button>
          </div>
        )}
      </div>

      {/* Slips Cards Grid */}
      {currentDisplayList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {sourceMode === 'ERP' ? 'ERP 미입고 전표가 없거나 검색 결과가 없습니다.' : '대기 중인 납품확인서가 없습니다.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {sourceMode === 'ERP' ? '검색어를 변경하거나 새로고침 버튼을 눌러보세요.' : '새로운 납품확인서를 카메라로 스캔하여 검수를 시작할 수 있습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDisplayList.map((slip) => {
            const isErpSlip = sourceMode === 'ERP' || slip.supplierCode.startsWith('SUP-ERP') || slip.slipNo.length === 11;
            return (
              <div
                key={slip.slipNo}
                onClick={() => onSelectSlip(slip.slipNo, slip)}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Slip No & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isErpSlip ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <Database className="w-3 h-3" /> ERP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          로컬
                        </span>
                      )}
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                        {slip.slipNo}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {onOpenPrintModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPrintModal(slip);
                          }}
                          className="p-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                          title="입하증(MMB202_Print) 미리보기 및 인쇄"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        검수대기
                      </span>
                    </div>
                  </div>

                  {/* Supplier & Delivery Date */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-bold">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{slip.supplierName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>납품/납기일: <span className="font-mono font-semibold text-slate-700">{slip.deliveryDate}</span></span>
                      {slip.manager && <span>담당: {slip.manager}</span>}
                    </div>
                  </div>

                  {/* Items Preview Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>품목 수 / 총 수량</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {slip.totalItems}개 품목 ({slip.totalOrderedQty.toLocaleString()}개)
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-200/60">
                      {slip.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate max-w-[170px] font-medium">• {item.itemName}</span>
                          <span className="font-mono text-slate-800 font-bold shrink-0">{item.orderQty}{item.unit || 'EA'}</span>
                        </div>
                      ))}
                      {slip.items.length > 2 && (
                        <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                          외 {slip.items.length - 2}개 품목 더보기...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:text-indigo-700">
                  <span>실시간 검수 및 입고처리</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
