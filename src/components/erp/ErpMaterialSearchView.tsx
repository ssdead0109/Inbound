import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  Building2,
  Tag,
  ChevronRight,
  Printer,
  X,
  Boxes,
  FileSpreadsheet,
  Warehouse,
  ArrowLeft,
  Filter,
  Phone,
  Clock,
  Layers,
  MapPin,
  CheckCircle2,
  DollarSign
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
  searchMaterialsInIndexedDb,
  getMaterialsCountInIndexedDb,
  getSyncMeta,
  setSyncMeta
} from '../../utils/indexedDbHelper';

interface ErpMaterialSearchViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const QUICK_SEARCH_CHIPS = [
  'VALVE',
  'PUMP',
  'CYLINDER',
  'MOTOR',
  'SENSOR',
  'FILTER',
  '호스',
  '볼트',
  '스위치',
  '릴레이'
];

export const ErpMaterialSearchView: React.FC<ErpMaterialSearchViewProps> = ({ onShowToast }) => {
  // State
  const [erpStatus, setErpStatus] = useState<ErpStatus | null>(null);
  const [warehouses, setWarehouses] = useState<ErpWarehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>('ALL');
  const [materials, setMaterials] = useState<ErpMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // IndexedDB Sync States
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Full Screen Detail View
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ErpMaterialDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [subulFilter, setSubulFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  
  // QR Label Print Modal
  const [qrPrintItem, setQrPrintItem] = useState<ErpMaterial | null>(null);
  const [labelCopies, setLabelCopies] = useState<number>(1);

  // Debounce search term (150ms for instant response)
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
      // Fetch directly from server with warehouse and query filter
      const serverResults = await searchErpMaterials(query, whCode, 80);
      setMaterials(serverResults);

      // Background cache to IndexedDB if searching 'ALL'
      if (whCode === 'ALL' && !query) {
        saveMaterialsToIndexedDb(serverResults).catch(() => {});
      }
    } catch (err: any) {
      console.warn('ERP search failed, fallback to IndexedDB:', err);
      try {
        const local = await searchMaterialsInIndexedDb(query, 80);
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
        setMaterials(res.data.slice(0, 80));
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
      <div className="max-w-full sm:max-w-5xl lg:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 w-full">
        
        {/* Full Screen Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCode(null);
                setDetailData(null);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>목록으로</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-200">
                  {selectedCode}
                </span>
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  {detailData?.item.name || '자재 상세 정보'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                규격: {detailData?.item.spec || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {detailData && (
              <>
                <div className="text-right mr-2 hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-semibold">총 현재고</span>
                  <span className="font-mono font-black text-emerald-600 text-base">
                    {(detailData.item.currentStock || 0).toLocaleString()} {detailData.item.unit || 'EA'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQrPrintItem(detailData.item)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>QR 라벨 인쇄</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isDetailLoading || !detailData ? (
          <div className="py-24 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-sm font-semibold">ERP MSSQL 서버에서 자재 마스터 및 실시간 수불 내역을 조회 중입니다...</p>
          </div>
        ) : (
          <>
            {/* 1. Item Master Information Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Database className="w-4 h-4 text-indigo-600" />
                자재 마스터 기본 정보
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">품목명</span>
                  <span className="text-sm font-bold text-slate-900 block mt-1">{detailData.item.name}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">규격 / 사양</span>
                  <span className="text-sm font-mono font-semibold text-slate-800 block mt-1">{detailData.item.spec || '-'}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">창고 구역 / 랙 위치</span>
                  <span className="text-sm font-mono font-black text-indigo-600 block mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {detailData.item.zone ? `구역 [ ${detailData.item.zone} ]` : '미지정'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">단위 / 안전재고</span>
                  <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                    {detailData.item.unit || 'EA'} (안전재고: {(detailData.item.safetyStock || 0).toLocaleString()})
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">입고 단가 / 출고 단가</span>
                  <span className="text-sm font-mono font-black text-slate-900 block mt-1">
                    {detailData.item.unitPrice ? `${detailData.item.unitPrice.toLocaleString()}원` : '-'}
                    {detailData.item.outPrice ? ` / ${detailData.item.outPrice.toLocaleString()}원` : ''}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">주 매입 거래처</span>
                  <span className="text-sm font-bold text-slate-900 block mt-1 truncate">
                    {detailData.item.supplierName || detailData.item.supplierCode || '-'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">거래처 연락처</span>
                  <span className="text-sm font-mono font-semibold text-slate-700 block mt-1">
                    {detailData.item.supplierPhone || '-'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">비고 / 특이사항</span>
                  <span className="text-xs text-slate-600 block mt-1 truncate">
                    {detailData.item.notes || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Warehouse Stock Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-indigo-600" />
                  창고별 현재고 보유 현황
                </h2>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  총 현재고: {(detailData.item.currentStock || 0).toLocaleString()} {detailData.item.unit || 'EA'}
                </span>
              </div>

              {detailData.warehouseStocks && detailData.warehouseStocks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {detailData.warehouseStocks.map((ws) => (
                    <div
                      key={ws.whCode}
                      className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{ws.whName}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          {ws.whCode}
                        </span>
                      </div>
                      <div className="text-right pt-1">
                        <span className="font-mono font-black text-lg text-indigo-600">
                          {Number(ws.stockQty).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-bold ml-1">{detailData.item.unit || 'EA'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  사내 창고에 기록된 현재고 수량이 없습니다.
                </div>
              )}
            </div>

            {/* 3. Comprehensive Subul History Full Screen Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-black text-slate-900">
                    전체 입출고 상세 수불 내역
                  </h2>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    ({filteredHistory.length}건)
                  </span>
                </div>

                {/* In/Out Filter Tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSubulFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      subulFilter === 'ALL' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    전체 수불
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
                <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  해당 조건의 입출고 수불 내역이 없습니다.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 whitespace-nowrap">
                        <th className="p-3">일자</th>
                        <th className="p-3">전표번호</th>
                        <th className="p-3 text-center">구분</th>
                        <th className="p-3 text-center">세부구분</th>
                        <th className="p-3 text-right">수량</th>
                        <th className="p-3 text-right">단가</th>
                        <th className="p-3 text-right">금액</th>
                        <th className="p-3">거래처명</th>
                        <th className="p-3">비고</th>
                        <th className="p-3">담당자</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredHistory.map((hist, idx) => {
                        const isIn = hist.inQty > 0 || hist.type === '입고' || hist.type === '매입';
                        const isOut = hist.outQty > 0 || hist.type === '출고' || hist.type === '매출';
                        const qty = isIn ? hist.inQty || hist.totalQty : isOut ? hist.outQty || hist.totalQty : hist.totalQty;

                        return (
                          <tr key={idx} className="hover:bg-indigo-50/30 transition-colors whitespace-nowrap">
                            <td className="p-3 font-mono text-slate-600">{hist.date ? hist.date.substring(0, 10) : '-'}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">{hist.slipNo || '-'}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {hist.type || (isIn ? '입고' : '출고')}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-600">{hist.subType || '-'}</td>
                            <td className={`p-3 font-mono text-right font-bold ${
                              isIn ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isIn ? `+${qty?.toLocaleString()}` : `-${qty?.toLocaleString()}`}
                            </td>
                            <td className="p-3 font-mono text-right text-slate-700">
                              {hist.unitPrice ? `${hist.unitPrice.toLocaleString()}원` : '-'}
                            </td>
                            <td className="p-3 font-mono text-right text-slate-900 font-bold">
                              {hist.totalAmount ? `${hist.totalAmount.toLocaleString()}원` : '-'}
                            </td>
                            <td className="p-3 text-slate-800 max-w-[140px] truncate">
                              {hist.supplierName || hist.supplierCode || '-'}
                            </td>
                            <td className="p-3 text-slate-500 max-w-[160px] truncate">{hist.memo || '-'}</td>
                            <td className="p-3 text-slate-600 text-[11px]">{hist.managerCode || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                  {qrPrintItem.zone && (
                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100 mt-1">
                      랙 위치: {qrPrintItem.zone}
                    </span>
                  )}
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
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 w-full">
      
      {/* 1. Header: Clean Title & Refresh Button (설명글 제거 완료) */}
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

      {/* 2. Warehouse Filter Bar (창고별 선택 기능) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-indigo-600" />
            창고 선택:
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            현재 선택: <strong className="text-indigo-600 font-bold">{warehouses.find(w => w.code === selectedWh)?.name || '전체 창고'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {warehouses.length > 0 ? (
            warehouses.map((wh) => (
              <button
                key={wh.code}
                type="button"
                onClick={() => handleSelectWarehouse(wh.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  selectedWh === wh.code
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {wh.name} {wh.itemCount !== undefined && wh.code !== 'ALL' ? `(${wh.itemCount})` : ''}
              </button>
            ))
          ) : (
            <div className="flex gap-1.5">
              {['ALL', '10013', '10014', '40001', '10024'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectWarehouse(code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border ${
                    selectedWh === code ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {code === 'ALL' ? '전체 창고' : code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Search & Quick Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="품목코드, 품목명, 규격, 랙위치, 또는 거래처명을 입력하세요 (예: 001372200, VALVE, 펌프, MIK...)"
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Keyword Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-bold shrink-0 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" /> 빠른 검색:
          </span>
          {QUICK_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setSearchTerm(chip)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                searchTerm === chip
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              #{chip}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer whitespace-nowrap"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 4. Results Section (현재고 및 창고 위치 강조, 재고등록 버튼 제거) */}
      <div className="space-y-3">
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
              선택한 창고 또는 검색어 조건을 변경하여 다시 검색해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {materials.map((item) => (
              <div
                key={item.code}
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

                  {/* Warehouse Location & Current Stock (요청 사항 반영) */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    {/* 창고 위치 및 랙 구역 */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> 창고 위치
                      </span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                        {item.whName || (selectedWh !== 'ALL' ? warehouses.find(w => w.code === selectedWh)?.name : '전체 창고')}
                        {item.zone ? ` [구역: ${item.zone}]` : ''}
                      </span>
                    </div>

                    {/* 현재고 수량 (눈에 띄는 뱃지) */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5 text-emerald-500" /> 현재고 수량
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
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

                {/* Card Action Buttons (재고등록 버튼 제거 완료) */}
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

      {/* 5. Printable QR Code Label Preview Modal */}
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
                {qrPrintItem.zone && (
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100 mt-1">
                    랙 위치: {qrPrintItem.zone}
                  </span>
                )}
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
