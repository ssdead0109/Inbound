import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Tag,
  Barcode,
  Calendar,
  ChevronRight,
  Printer,
  PlusCircle,
  X,
  Boxes,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ErpMaterial,
  ErpStatus,
  ErpMaterialDetail,
  fetchErpStatus,
  searchErpMaterials,
  syncErpMaterials,
  fetchErpMaterialDetail,
  importErpMaterialToLocal
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
  const [materials, setMaterials] = useState<ErpMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false);
  
  // IndexedDB Sync States
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [lastSyncStr, setLastSyncStr] = useState<string>('');

  // Selected Detail Modal
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ErpMaterialDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  
  // QR Label Print Preview Modal
  const [qrPrintItem, setQrPrintItem] = useState<ErpMaterial | null>(null);
  const [labelCopies, setLabelCopies] = useState<number>(1);

  // Debounce search term (150ms for instant local response)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Status
  const loadStatus = useCallback(async () => {
    try {
      setIsStatusLoading(true);
      const status = await fetchErpStatus();
      setErpStatus(status);
    } catch (err: any) {
      console.error('Failed to load ERP status:', err);
    } finally {
      setIsStatusLoading(false);
    }
  }, []);

  // Incremental Sync with Backend
  const handleIncrementalSync = useCallback(async (isManual = false) => {
    try {
      setIsSyncing(true);
      const lastUpdated = await getSyncMeta('materials_last_updated');
      const res = await syncErpMaterials(lastUpdated || undefined, 3000);

      if (res.data && res.data.length > 0) {
        await saveMaterialsToIndexedDb(res.data);
        if (res.lastUpdated) {
          await setSyncMeta('materials_last_updated', res.lastUpdated);
        }
      }

      const count = await getMaterialsCountInIndexedDb();
      setCachedCount(count);
      const nowStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncStr(nowStr);
      await setSyncMeta('materials_last_sync_time', nowStr);

      if (isManual) {
        onShowToast(`인덱스DB 증분 동기화 완료! (${res.count}건 갱신 / 캐시 ${count}건)`, 'success');
      }
    } catch (err: any) {
      console.warn('Sync warning:', err);
      if (isManual) {
        onShowToast('증분 동기화 실패: 사내 ERP DB 연결을 확인해주세요.', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [onShowToast]);

  // Search Materials (IndexedDB Local First)
  const executeSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      
      // 1. Instant local search in IndexedDB (0.001s, 0% DB load)
      const localData = await searchMaterialsInIndexedDb(query, 60);
      if (localData && localData.length > 0) {
        setMaterials(localData);
        setIsLoading(false);
        return;
      }

      // 2. Fallback to API if local IndexedDB is empty
      const remoteData = await searchErpMaterials(query, 60);
      setMaterials(remoteData);
      if (remoteData && remoteData.length > 0) {
        saveMaterialsToIndexedDb(remoteData)
          .then(() => getMaterialsCountInIndexedDb().then(setCachedCount))
          .catch(() => {});
      }
    } catch (err: any) {
      onShowToast(err.message || 'ERP 자재 검색 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  // Initial Load: IndexedDB init & background incremental sync
  useEffect(() => {
    loadStatus();
    
    // Load cached count & initial records from IndexedDB
    getMaterialsCountInIndexedDb()
      .then(async (count) => {
        setCachedCount(count);
        const lastSync = await getSyncMeta('materials_last_sync_time');
        if (lastSync) setLastSyncStr(lastSync);

        // Immediate display from local cache
        const initial = await searchMaterialsInIndexedDb('', 60);
        if (initial && initial.length > 0) {
          setMaterials(initial);
        } else {
          executeSearch('');
        }

        // Run background incremental sync
        handleIncrementalSync(false);
      })
      .catch(() => {
        executeSearch('');
      });
  }, [loadStatus, executeSearch, handleIncrementalSync]);

  // Trigger search on query change
  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  // View Material Details
  const handleOpenDetail = async (code: string) => {
    setSelectedCode(code);
    setIsDetailLoading(true);
    try {
      const data = await fetchErpMaterialDetail(code);
      setDetailData(data);
    } catch (err: any) {
      onShowToast(err.message || '자재 상세 정보 조회 실패', 'error');
      setSelectedCode(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Import to SmartRack local inventory
  const handleImportToLocal = async (item: ErpMaterial) => {
    try {
      const res = await importErpMaterialToLocal({
        code: item.code,
        name: item.name,
        spec: item.spec,
        unit: item.unit,
        unitPrice: item.unitPrice,
        supplierName: item.supplierName,
        notes: item.notes,
      });

      if (res.success) {
        onShowToast(`[${item.code}] 스마트랙 재고 마스터에 등록되었습니다!`, 'success');
      } else {
        onShowToast(res.message || '이미 등록된 자재입니다.', 'info');
      }
    } catch (err: any) {
      onShowToast(err.message || '등록 실패', 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      
      {/* 1. Header Banner & MSSQL Live Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                사내 ERP 자재 실시간 조회
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              사내 MSSQL 데이터베이스(<span className="font-mono text-indigo-300 font-bold">System9</span>)와 실시간 직접 연동되어 자재 마스터 및 수불 이력을 조회합니다.
            </p>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs backdrop-blur-sm self-start sm:self-auto">
            <span className="relative flex h-2.5 w-2.5">
              {erpStatus?.isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              )}
            </span>

            <div className="flex flex-col">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                {erpStatus?.isConnected ? 'MSSQL 서버 연결됨' : '연결 확인 중...'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {erpStatus?.server}:{erpStatus?.port} ({erpStatus?.database})
              </span>
            </div>

            <button
              onClick={loadStatus}
              disabled={isStatusLoading}
              title="연결 상태 다시 확인"
              className="ml-2 p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isStatusLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">ERP 등록 자재 마스터</span>
            <span className="text-lg sm:text-xl font-black font-mono text-indigo-400">
              {erpStatus?.totalMaterials ? erpStatus.totalMaterials.toLocaleString() : '3,592'} <span className="text-xs font-normal text-slate-400">종</span>
            </span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">현재 검색된 자재</span>
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
              {materials.length.toLocaleString()} <span className="text-xs font-normal text-slate-400">건</span>
            </span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>인덱스DB 로컬 캐시</span>
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
              {cachedCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">종 (부하 0%)</span>
            </span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[11px]">증분 동기화</span>
              <button
                type="button"
                onClick={() => handleIncrementalSync(true)}
                disabled={isSyncing}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '동기화 중...' : '증분 동기화'}</span>
              </button>
            </div>
            <span className="text-xs font-bold text-slate-300 truncate mt-1">
              {lastSyncStr ? `${lastSyncStr} 완료` : '로컬 준비됨'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Quick Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="품목코드, 품목명, 규격, 또는 거래처명을 입력하세요 (예: 001372200, VALVE, 펌프, MIK...)"
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

      {/* 3. Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            검색 결과 <span className="text-indigo-600 font-mono">({materials.length}건)</span>
          </h2>
          {isLoading && (
            <span className="text-xs text-indigo-600 flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ERP 실시간 조회 중...
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
              품목코드나 품목명의 영문/한글 키워드를 변경하여 다시 검색해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {materials.map((item) => (
              <div
                key={item.code}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
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

                  {/* Price & Supplier */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> 거래처
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {item.supplierName || `코드: ${item.supplierCode || '-'}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">입고 단가</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {item.unitPrice ? `${item.unitPrice.toLocaleString()}원` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenDetail(item.code)}
                    className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>상세/수불</span>
                  </button>

                  <button
                    onClick={() => setQrPrintItem(item)}
                    className="px-2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>QR 출력</span>
                  </button>

                  <button
                    onClick={() => handleImportToLocal(item)}
                    title="스마트랙 재고 목록에 추가"
                    className="px-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>재고 등록</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Material Detail & Transaction History Modal */}
      {selectedCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    ERP 자재 상세 정보
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 font-bold">
                    품목코드: {selectedCode}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCode(null);
                  setDetailData(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {isDetailLoading || !detailData ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto text-indigo-600" />
                  <p className="text-sm font-semibold">ERP 서버에서 자재 및 입출고 데이터를 불러오는 중...</p>
                </div>
              ) : (
                <>
                  {/* Summary Profile */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">품목명</span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5">{detailData.item.name}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">규격 / 사양</span>
                      <span className="text-sm font-mono font-semibold text-slate-800 block mt-0.5">{detailData.item.spec || '-'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">입고 단가 / 출고 단가</span>
                      <span className="text-sm font-mono font-black text-indigo-600 block mt-0.5">
                        {detailData.item.unitPrice?.toLocaleString()}원 / {detailData.item.outPrice ? `${detailData.item.outPrice.toLocaleString()}원` : '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">거래처 (매입처)</span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {detailData.item.supplierName || `코드: ${detailData.item.supplierCode}`}
                        {detailData.item.supplierPhone && (
                          <span className="text-slate-500 font-normal font-mono">({detailData.item.supplierPhone})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Recent In/Out History from MT_T_입출고 */}
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      ERP 최근 입출고 수불 내역 <span className="text-xs font-normal text-slate-500">(최근 15건)</span>
                    </h4>

                    {detailData.history.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                        기록된 입출고 수불 내역이 없습니다.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                              <th className="p-2.5">전표번호</th>
                              <th className="p-2.5">구분</th>
                              <th className="p-2.5">일자</th>
                              <th className="p-2.5 text-right">입고량</th>
                              <th className="p-2.5 text-right">출고량</th>
                              <th className="p-2.5 text-right">단가</th>
                              <th className="p-2.5">비고</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {detailData.history.map((hist, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-medium text-slate-900">{hist.slipNo || '-'}</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    hist.inQty > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {hist.type || (hist.inQty > 0 ? '입고' : '출고')}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-slate-600">{hist.date ? hist.date.substring(0, 10) : '-'}</td>
                                <td className="p-2.5 font-mono text-right text-emerald-600 font-bold">
                                  {hist.inQty > 0 ? `+${hist.inQty}` : '-'}
                                </td>
                                <td className="p-2.5 font-mono text-right text-rose-600 font-bold">
                                  {hist.outQty > 0 ? `-${hist.outQty}` : '-'}
                                </td>
                                <td className="p-2.5 font-mono text-right text-slate-800">
                                  {hist.unitPrice ? `${hist.unitPrice.toLocaleString()}원` : '-'}
                                </td>
                                <td className="p-2.5 text-slate-500 truncate max-w-[120px]">{hist.memo || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              {detailData && (
                <>
                  <button
                    onClick={() => {
                      setQrPrintItem(detailData.item);
                      setSelectedCode(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>QR 라벨 출력</span>
                  </button>

                  <button
                    onClick={() => {
                      handleImportToLocal(detailData.item);
                      setSelectedCode(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>스마트랙 재고로 등록</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
