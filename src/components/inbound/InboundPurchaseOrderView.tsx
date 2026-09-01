import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  ChevronDown,
  X,
  Building2,
  Calendar,
  Warehouse,
  Boxes,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ErpPurchaseOrder, fetchErpPurchaseOrders } from '../../api/erpApi';

interface InboundPurchaseOrderViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const InboundPurchaseOrderView: React.FC<InboundPurchaseOrderViewProps> = ({ onShowToast }) => {
  const [orders, setOrders] = useState<ErpPurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'PARTIAL' | 'COMPLETED'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadOrders = async (query: string = '') => {
    try {
      setIsLoading(true);
      const data = await fetchErpPurchaseOrders(query, 'ALL', 200);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load purchase orders:', err);
      onShowToast(err.message || 'ERP 발주 내역을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadOrders(searchTerm);
      onShowToast('사내 ERP 발주 내역이 최신화되었습니다.', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter orders by status and search term
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
      // Search term filter
      if (!term) return true;
      return (
        order.poNo.toLowerCase().includes(term) ||
        order.supplierName.toLowerCase().includes(term) ||
        order.itemCode.toLowerCase().includes(term) ||
        order.itemName.toLowerCase().includes(term) ||
        order.itemSpec.toLowerCase().includes(term) ||
        order.warehouseName.toLowerCase().includes(term) ||
        order.remarks.toLowerCase().includes(term)
      );
    });
  }, [orders, statusFilter, searchTerm]);

  // Clean unit string (e.g. DM150EA -> EA)
  const formatUnit = (rawUnit: string) => {
    if (!rawUnit) return 'EA';
    const match = rawUnit.match(/[A-Z]{2,}|EA|MTR|SET|BOX|KG|L|PCS/i);
    return match ? match[0].toUpperCase() : rawUnit;
  };

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 w-full">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                사내 ERP 발주 내역 실시간 조회
              </h1>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="사내 ERP 발주 내역 새로고침"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Sticky Search & Status Filter Bar */}
      <div
        style={{ top: 'var(--app-header-h, 56px)' }}
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Status Dropdown Listbox */}
          <div className="w-full sm:w-52 shrink-0 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-11 sm:h-12 pl-3.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">📦 전체 발주 상태</option>
              <option value="WAITING">⏳ 납품 대기 (미입고)</option>
              <option value="PARTIAL">⚠️ 부분 입고</option>
              <option value="COMPLETED">✅ 입고 완료</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Unified Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="발주번호, 공급처, 품목코드, 품목명을 검색하세요..."
              className="w-full h-11 sm:h-12 pl-10 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Results Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            발주 품목 목록 <span className="text-indigo-600 font-mono">({filteredOrders.length}건)</span>
          </h2>
          {isLoading && (
            <span className="text-xs text-indigo-600 flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 실시간 조회 중...
            </span>
          )}
        </div>

        {filteredOrders.length === 0 && !isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">조회된 발주 내역이 없습니다</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              상태 필터 또는 검색 조건을 변경하여 다시 확인해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredOrders.map((order, idx) => {
              const isCompleted = order.status === 'COMPLETED';
              const isPartial = order.status === 'PARTIAL';
              const isWaiting = order.status === 'WAITING';
              const unit = formatUnit(order.unit);

              return (
                <div
                  key={`${order.poNo}_${order.itemCode}_${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    
                    {/* Top Row: PO Number + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-100 truncate">
                          #{order.poNo}
                        </span>
                        {order.itemCode && (
                          <span className="font-mono text-slate-500 font-bold text-xs truncate">
                            {order.itemCode}
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isCompleted ? '입고 완료' : isPartial ? '부분 입고' : '납품 대기'}
                      </span>
                    </div>

                    {/* Item Name & Spec */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {order.itemName || '품목명 미지정'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">
                        {order.itemSpec || '-'}
                      </p>
                    </div>

                    {/* Dates & Supplier Info */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      
                      {/* Supplier */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1 shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> 공급처
                        </span>
                        <span className="font-bold text-slate-900 truncate max-w-[190px]">
                          {order.supplierName || order.supplierCode}
                        </span>
                      </div>

                      {/* Warehouse */}
                      {order.warehouseName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1 shrink-0">
                            <Warehouse className="w-3.5 h-3.5 text-indigo-500" /> 입고창고
                          </span>
                          <span className="font-semibold text-slate-800">
                            {order.warehouseName}
                          </span>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-slate-400 flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> 발주일 / 납기
                        </span>
                        <span className="font-mono text-xs text-slate-700">
                          {order.poDate} ➔ <strong className="text-indigo-600 font-bold">{order.deliveryDate}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quantity Summary Card */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">발주 수량</span>
                        <span className="font-mono font-bold text-slate-800">
                          {order.poQty.toLocaleString()} {unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">기입고 수량</span>
                        <span className="font-mono font-bold text-slate-600">
                          {order.receivedQty.toLocaleString()} {unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-800">미입고 잔량</span>
                        <span className={`font-mono font-black text-sm ${
                          order.remainQty > 0 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {order.remainQty.toLocaleString()} {unit}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    {order.totalAmount > 0 && (
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-slate-400">발주 금액</span>
                        <div className="text-right font-mono">
                          <span className="text-slate-500 text-[11px]">@{order.unitPrice.toLocaleString()}원 · </span>
                          <span className="font-bold text-slate-800">{order.totalAmount.toLocaleString()}원</span>
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {order.remarks && (
                      <p className="text-[11px] text-slate-400 truncate bg-slate-50/80 px-2 py-1 rounded">
                        비고: {order.remarks}
                      </p>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
