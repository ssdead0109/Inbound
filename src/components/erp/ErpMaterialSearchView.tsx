import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  Building2,
  ChevronDown,
  Printer,
  X,
  Boxes,
  FileSpreadsheet,
  Warehouse,
  ArrowLeft,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ErpMaterial,
  ErpStatus,
  ErpMaterialDetail,
  ErpWarehouse,
  fetchErpStatus,
  searchErpMaterials,
  syncErpMaterials,
  fetchErpMaterialDetail,
  fetchErpWarehouses
} from '../../api/erpApi';
import {
  saveMaterialsToIndexedDb,
  searchMaterialsInIndexedDb
} from '../../utils/indexedDbHelper';

interface ErpMaterialSearchViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ErpMaterialSearchView: React.FC<ErpMaterialSearchViewProps> = ({ onShowToast }) => {
  // State
  const [erpStatus, setErpStatus] = useState<ErpStatus | null>(null);
  const [warehouses, setWarehouses] = useState<ErpWarehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>('ALL');
  const [materials, setMaterials] = useState<ErpMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Full Screen Detail View
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ErpMaterialDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [subulFilter, setSubulFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  
  // QR Label Print Modal
  const [qrPrintItem, setQrPrintItem] = useState<ErpMaterial | null>(null);
  const [labelCopies, setLabelCopies] = useState<number>(1);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Status and Warehouses on mount
  useEffect(() => {
    loadStatus();
    loadWarehouses();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await fetchErpStatus();
      setErpStatus(status);
    } catch (err: any) {
      console.error('Failed to load ERP status:', err);
    }
  };

  const loadWarehouses = async () => {
    try {
      const whList = await fetchErpWarehouses();
      setWarehouses(whList);
    } catch (err: any) {
      console.error('Failed to load warehouses:', err);
    }
  };

  // Execute Search
  const executeSearch = useCallback(async (query: string, whCode: string = selectedWh) => {
    try {
      setIsLoading(true);
      const serverResults = await searchErpMaterials(query, whCode, 120);
      setMaterials(serverResults);

      if (whCode === 'ALL' && !query) {
        saveMaterialsToIndexedDb(serverResults).catch(() => {});
      }
    } catch (err: any) {
      console.warn('ERP search failed, fallback to IndexedDB:', err);
      try {
        const local = await searchMaterialsInIndexedDb(query, 120);
        setMaterials(local);
      } catch (localErr) {
        setMaterials([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedWh]);

  // Handle warehouse change
  const handleSelectWarehouse = (whCode: string) => {
    setSelectedWh(whCode);
    executeSearch(searchTerm, whCode);
  };

  // Trigger search on query change or warehouse change
  useEffect(() => {
    executeSearch(debouncedQuery, selectedWh);
  }, [debouncedQuery, selectedWh, executeSearch]);

  // Handle manual sync refresh
  const handleRefresh = async () => {
    try {
      setIsSyncing(true);
      const res = await syncErpMaterials(undefined, selectedWh, 3000);
      if (res.data && res.data.length > 0) {
        setMaterials(res.data.slice(0, 120));
        await saveMaterialsToIndexedDb(res.data);
      }
      onShowToast(`사내 ERP 자재 ${res.data.length}건이 최신화되었습니다.`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'ERP 동기화 실패', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Material Full Screen Detail
  const handleOpenDetail = async (code: string) => {
    try {
      setSelectedCode(code);
      setIsDetailLoading(true);
      setSubulFilter('ALL');
      const detail = await fetchErpMaterialDetail(code);
      setDetailData(detail);
    } catch (err: any) {
      onShowToast(err.message || '자재 상세 조회 실패', 'error');
      setSelectedCode(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Filter detail transactions
  const filteredHistory = (detailData?.history || []).filter((hist) => {
    if (subulFilter === 'IN') return hist.inQty > 0 || hist.type === '입고' || hist.type === '매입';
    if (subulFilter === 'OUT') return hist.outQty > 0 || hist.type === '출고' || hist.type === '매출';
    return true;
  });

  /* ------------------------------------------------------------- */
  /* FULL SCREEN DETAIL & SUBUL VIEW                               */
  /* ------------------------------------------------------------- */
  if (selectedCode) {
    return (
      <div className="max-w-full sm:max-w-5xl lg:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-4 w-full">
        
        {/* Sticky Top Header Bar (QR 라벨 인쇄 상단 고정) */}
        <div
          style={{ top: 'var(--app-header-h, 56px)' }}
          className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs"
        >
          <div className="flex items-center justify-between gap-3 max-w-full sm:max-w-5xl lg:max-w-7xl mx-auto">
            
            {/* Back Button & Title */}
            <div className="flex items-center space-x-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedCode(null);
                  setDetailData(null);
                }}
                className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-200 shrink-0">
                    {selectedCode}
                  </span>
                  <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                    {detailData?.item.name || '자재 상세'}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {detailData?.item.spec || '-'}
                </p>
              </div>
            </div>

            {/* Total Stock & Print Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {detailData && (
                <>
                  <div className="text-right mr-1 hidden sm:block">
                    <span className="text-[10px] text-slate-400 block font-semibold leading-none">총 현재고</span>
                    <span className="font-mono font-black text-emerald-600 text-base leading-snug">
                      {(detailData.item.currentStock || 0).toLocaleString()} {detailData.item.unit || 'EA'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQrPrintItem(detailData.item)}
                    className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>QR 라벨 인쇄</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {isDetailLoading || !detailData ? (
          <div className="py-24 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-sm font-semibold">ERP MSSQL 서버에서 자재 마스터 및 실시간 수불 내역을 조회 중입니다...</p>
          </div>
        ) : (
          <>
            {/* 1. Item Master Information Summary (랙 위치 제거 완료) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Database className="w-4 h-4 text-indigo-600" />
                자재 마스터 기본 정보
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">품목명</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 truncate">{detailData.item.name}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">규격 / 사양</span>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-slate-800 block mt-0.5 truncate">{detailData.item.spec || '-'}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">단위 / 안전재고</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 block mt-0.5">
                    {detailData.item.unit || 'EA'} (안전: {(detailData.item.safetyStock || 0).toLocaleString()})
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">입고 단가 / 출고 단가</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-slate-900 block mt-0.5">
                    {detailData.item.unitPrice ? `${detailData.item.unitPrice.toLocaleString()}원` : '-'}
                    {detailData.item.outPrice ? ` / ${detailData.item.outPrice.toLocaleString()}원` : ''}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">주 매입 거래처</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 truncate">
                    {detailData.item.supplierName || detailData.item.supplierCode || '-'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">비고 / 특이사항</span>
                  <span className="text-xs text-slate-600 block mt-0.5 truncate">
                    {detailData.item.notes || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Warehouse Stock Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-indigo-600" />
                  창고별 현재고 현황
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                  총 현재고: {(detailData.item.currentStock || 0).toLocaleString()} {detailData.item.unit || 'EA'}
                </span>
              </div>

              {detailData.warehouseStocks && detailData.warehouseStocks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {detailData.warehouseStocks.map((ws) => (
                    <div
                      key={ws.whCode}
                      className="p-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[100px]">{ws.whName}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1 py-0.2 rounded">
                          {ws.whCode}
                        </span>
                      </div>
                      <div className="text-right pt-0.5">
                        <span className="font-mono font-black text-base text-indigo-600">
                          {Number(ws.stockQty).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-bold ml-1">{detailData.item.unit || 'EA'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  사내 창고에 기록된 현재고 수량이 없습니다.
                </div>
              )}
            </div>

            {/* 3. Comprehensive Subul History (전표번호 제거, 가로 스크롤 없이 한눈에 보기) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-black text-slate-900">
                    입출고 상세 수불 내역
                  </h2>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    ({filteredHistory.length}건)
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSubulFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      subulFilter === 'ALL' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubulFilter('IN')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      subulFilter === 'IN' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    입고만
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubulFilter('OUT')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      subulFilter === 'OUT' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    출고만
                  </button>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  해당 조건의 입출고 수불 내역이 없습니다.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  
                  {/* Desktop / Tablet Table View (가로 스크롤 없음, 100% 한눈에) */}
                  <table className="hidden md:table w-full text-left text-xs border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3 w-[15%]">일자</th>
                        <th className="p-3 w-[12%] text-center">구분</th>
                        <th className="p-3 w-[18%] text-right">수량</th>
                        <th className="p-3 w-[25%] text-right">단가 / 금액</th>
                        <th className="p-3 w-[30%]">거래처 / 비고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredHistory.map((hist, idx) => {
                        const isIn = hist.inQty > 0 || hist.type === '입고' || hist.type === '매입';
                        const isOut = hist.outQty > 0 || hist.type === '출고' || hist.type === '매출';
                        const qty = isIn ? hist.inQty || hist.totalQty : isOut ? hist.outQty || hist.totalQty : hist.totalQty;
                        const mainType = hist.type || (isIn ? '입고' : '출고');
                        const showSubType = hist.subType && hist.subType.trim() !== '' && hist.subType.trim() !== mainType.trim();

                        return (
                          <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-3 font-mono text-slate-600 font-medium">
                              {hist.date ? hist.date.substring(0, 10) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {mainType}
                              </span>
                              {showSubType && (
                                <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">
                                  {hist.subType}
                                </span>
                              )}
                            </td>
                            <td className={`p-3 font-mono text-right font-black text-sm ${
                              isIn ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isIn ? `+${qty?.toLocaleString()}` : `-${qty?.toLocaleString()}`}
                              <span className="text-[10px] text-slate-400 font-normal ml-0.5">{detailData.item.unit || 'EA'}</span>
                            </td>
                            <td className="p-3 font-mono text-right">
                              <span className="text-slate-700 font-bold block">
                                {hist.unitPrice ? `${hist.unitPrice.toLocaleString()}원` : '-'}
                              </span>
                              {hist.totalAmount ? (
                                <span className="text-[11px] text-slate-400 block font-normal">
                                  합계: {hist.totalAmount.toLocaleString()}원
                                </span>
                              ) : null}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block truncate" title={hist.supplierName || hist.supplierCode || '-'}>
                                {hist.supplierName || hist.supplierCode || '-'}
                              </span>
                              {(hist.memo || hist.managerCode) && (
                                <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                                  {hist.memo ? hist.memo : ''} {hist.managerCode ? `[${hist.managerCode}]` : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Stream View (가로 스크롤 완전 제거, 2열 카드 스트림) */}
                  <div className="md:hidden divide-y divide-slate-100 bg-white">
                    {filteredHistory.map((hist, idx) => {
                      const isIn = hist.inQty > 0 || hist.type === '입고' || hist.type === '매입';
                      const isOut = hist.outQty > 0 || hist.type === '출고' || hist.type === '매출';
                      const qty = isIn ? hist.inQty || hist.totalQty : isOut ? hist.outQty || hist.totalQty : hist.totalQty;
                      const mainType = hist.type || (isIn ? '입고' : '출고');
                      const showSubType = hist.subType && hist.subType.trim() !== '' && hist.subType.trim() !== mainType.trim();

                      return (
                        <div key={idx} className="p-3 hover:bg-slate-50 transition-colors space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-semibold text-slate-500">
                                {hist.date ? hist.date.substring(0, 10) : '-'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {mainType}{showSubType ? ` · ${hist.subType}` : ''}
                              </span>
                            </div>
                            <div className="font-mono font-black text-sm">
                              <span className={isIn ? 'text-emerald-600' : 'text-rose-600'}>
                                {isIn ? `+${qty?.toLocaleString()}` : `-${qty?.toLocaleString()}`}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal ml-0.5">{detailData.item.unit || 'EA'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="font-bold text-slate-800 truncate max-w-[55%]">
                              {hist.supplierName || hist.supplierCode || '-'}
                            </span>
                            <div className="text-right font-mono text-xs">
                              <span className="font-bold text-slate-700">
                                {hist.unitPrice ? `${hist.unitPrice.toLocaleString()}원` : '-'}
                              </span>
                              {hist.totalAmount ? (
                                <span className="text-[11px] text-slate-400 ml-1">({hist.totalAmount.toLocaleString()}원)</span>
                              ) : null}
                            </div>
                          </div>

                          {hist.memo && (
                            <p className="text-[11px] text-slate-400 truncate">
                              비고: {hist.memo} {hist.managerCode ? `(담당: ${hist.managerCode})` : ''}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          </>
        )}

        {/* Printable QR Code Label Preview Modal */}
        {qrPrintItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  자재 QR 라벨 인쇄 미리보기
                </h3>
                <button
                  onClick={() => setQrPrintItem(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Label Card Preview */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center space-y-3 text-center">
                <QRCodeSVG
                  value={`KCP:${qrPrintItem.code}`}
                  size={140}
                  level="M"
                  includeMargin={true}
                />
                <div className="space-y-1">
                  <span className="font-mono font-black text-lg text-slate-900 tracking-wider block">
                    {qrPrintItem.code}
                  </span>
                  <span className="font-bold text-sm text-slate-800 block line-clamp-1">
                    {qrPrintItem.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono block line-clamp-1">
                    {qrPrintItem.spec || 'KCP 자재표준규격'}
                  </span>
                </div>
              </div>

              {/* Print Quantity Control */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="font-semibold text-slate-700">출력 매수:</span>
                <div className="flex items-center space-x-2">
                  {[1, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setLabelCopies(num)}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                        labelCopies === num
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {num}장
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setQrPrintItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    window.print();
                    onShowToast(`${qrPrintItem.name} (${labelCopies}장) 인쇄 명령 전송 완료`, 'success');
                    setQrPrintItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>라벨 인쇄하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* MAIN MATERIALS SEARCH & WAREHOUSE LIST VIEW                   */
  /* ------------------------------------------------------------- */
  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 w-full">
      
      {/* 1. Top Header: Clean Title & Refresh Button */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                사내 ERP 자재 실시간 조회
              </h1>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isSyncing}
                title="사내 ERP 자재 새로고침"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Sticky Search & Warehouse Listbox Bar */}
      <div
        style={{ top: 'var(--app-header-h, 56px)' }}
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Warehouse Dropdown Listbox */}
          <div className="w-full sm:w-56 shrink-0 relative">
            <select
              value={selectedWh}
              onChange={(e) => handleSelectWarehouse(e.target.value)}
              className="w-full h-11 sm:h-12 pl-3.5 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">🏢 전체 창고 (통합)</option>
              {warehouses.filter(w => w.code !== 'ALL').map((wh) => (
                <option key={wh.code} value={wh.code}>
                  {wh.name} {wh.itemCount ? `(${wh.itemCount}종)` : ''}
                </option>
              ))}
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
              placeholder="품목코드, 품목명, 규격, 거래처명을 검색하세요..."
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

      {/* 3. Results Section (창고별로 따로 표시, 랙 위치 제외 완료) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            자재 목록 <span className="text-indigo-600 font-mono">({materials.length}건)</span>
          </h2>
          {isLoading && (
            <span className="text-xs text-indigo-600 flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 실시간 조회 중...
            </span>
          )}
        </div>

        {materials.length === 0 && !isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">일치하는 ERP 자재가 없습니다</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              선택한 창고 조건 또는 검색어를 변경하여 다시 조회해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {materials.map((item, idx) => (
              <div
                key={`${item.code}_${item.whCode || idx}_${idx}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Item Code & Unit */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-100">
                      {item.code}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                      {item.unit || 'EA'}
                    </span>
                  </div>

                  {/* Name & Spec */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">
                      {item.spec || '-'}
                    </p>
                  </div>

                  {/* Warehouse & Stock Details (같은 물품이라도 창고별 개별 표시, 랙 위치 제외) */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    
                    {/* 보관 창고 (개별 창고 명시) */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 shrink-0">
                        <Warehouse className="w-3.5 h-3.5 text-indigo-600" /> 보관 창고
                      </span>
                      <span className="font-bold text-slate-900 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-md truncate max-w-[190px]">
                        {item.whName || (selectedWh !== 'ALL' ? warehouses.find(w => w.code === selectedWh)?.name : '재고창고 없음')}
                      </span>
                    </div>

                    {/* 해당 창고 현재고 수량 */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-500 flex items-center gap-1 shrink-0">
                        <Boxes className="w-3.5 h-3.5 text-emerald-500" /> 현재고 수량
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                        {(item.currentStock || 0).toLocaleString()} {item.unit || 'EA'}
                      </span>
                    </div>

                    {/* 입고 단가 */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-400">입고 단가</span>
                      <span className="font-mono font-bold text-slate-700">
                        {item.unitPrice ? `${item.unitPrice.toLocaleString()}원` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item.code)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                    <span>상세 수불내역</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrPrintItem(item)}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-100 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>QR 출력</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Printable QR Code Label Preview Modal */}
      {qrPrintItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                자재 QR 라벨 인쇄 미리보기
              </h3>
              <button
                onClick={() => setQrPrintItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Label Card Preview */}
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center space-y-3 text-center">
              <QRCodeSVG
                value={`KCP:${qrPrintItem.code}`}
                size={140}
                level="M"
                includeMargin={true}
              />
              <div className="space-y-1">
                <span className="font-mono font-black text-lg text-slate-900 tracking-wider block">
                  {qrPrintItem.code}
                </span>
                <span className="font-bold text-sm text-slate-800 block line-clamp-1">
                  {qrPrintItem.name}
                </span>
                <span className="text-xs text-slate-500 font-mono block line-clamp-1">
                  {qrPrintItem.spec || 'KCP 자재표준규격'}
                </span>
              </div>
            </div>

            {/* Print Quantity Control */}
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="font-semibold text-slate-700">출력 매수:</span>
              <div className="flex items-center space-x-2">
                {[1, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLabelCopies(num)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                      labelCopies === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {num}장
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setQrPrintItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  window.print();
                  onShowToast(`${qrPrintItem.name} (${labelCopies}장) 인쇄 명령 전송 완료`, 'success');
                  setQrPrintItem(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>라벨 인쇄하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
