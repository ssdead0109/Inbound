import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Tag,
  Package
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ErpMaterial,
  ErpStatus,
  ErpMaterialDetail,
  ErpWarehouse,
  fetchErpStatus,
  searchErpMaterials,
  searchErpMaterialsWithTotal,
  syncErpMaterials,
  fetchErpMaterialDetail,
  fetchErpWarehouses
} from '../../api/erpApi';
import {
  saveMaterialsToIndexedDb,
  searchMaterialsInIndexedDb,
  searchMaterialsInIndexedDbWithTotal,
  getUniqueWarehousesFromIndexedDb,
  getMaterialsCountInIndexedDb,
  getUniqueCategoriesFromIndexedDb
} from '../../utils/indexedDbHelper';
import { registerBackHandler } from '../../utils/backHandler';
import { VirtualGrid } from '../common/VirtualScrollContainer';

import { usePersistedState } from '../../hooks/usePersistedState';
import { getMaterialGrade, getGradeBadgeStyle } from '../../utils/gradeHelper';

interface ErpMaterialSearchViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ErpMaterialSearchViewComponent: React.FC<ErpMaterialSearchViewProps> = ({ onShowToast }) => {
  // State with persistence across tab switches
  const [erpStatus, setErpStatus] = useState<ErpStatus | null>(null);
  const [warehouses, setWarehouses] = useState<ErpWarehouse[]>([]);
  const [selectedWh, setSelectedWh] = usePersistedState<string>('filter_materials_wh', 'ALL');
  const [selectedGrade, setSelectedGrade] = usePersistedState<string>('filter_materials_grade', 'ALL');
  const [selectedCategory, setSelectedCategory] = usePersistedState<string>('filter_materials_category', 'ALL');
  const [sortBy, setSortBy] = usePersistedState<string>('filter_materials_sort', 'NAME_ASC');
  const [isFilterExpanded, setIsFilterExpanded] = usePersistedState<boolean>('filter_materials_expanded', true);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [materials, setMaterials] = useState<ErpMaterial[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = usePersistedState<string>('filter_materials_search', '');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('filter_materials_search');
      return saved ? JSON.parse(saved) : '';
    } catch {
      return '';
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const PAGE_SIZE = 60;
  const searchSeqRef = useRef<number>(0);

  // Full Screen Detail View
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ErpMaterialDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [subulFilter, setSubulFilter] = usePersistedState<'ALL' | 'IN' | 'OUT'>('filter_materials_subul', 'ALL');
  
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

  // Handle Android back button when viewing detail or print modal
  useEffect(() => {
    if (qrPrintItem) {
      return registerBackHandler('erpQrModal', 100, () => {
        setQrPrintItem(null);
        return true;
      });
    }
    if (selectedCode) {
      return registerBackHandler('erpDetailView', 60, () => {
        setSelectedCode(null);
        setDetailData(null);
        return true;
      });
    }
  }, [selectedCode, qrPrintItem]);

  // Load Status, Warehouses, Categories, and initial background warm-up on mount
  useEffect(() => {
    loadStatus();
    loadWarehouses();
    loadCategories();

    const initWarmup = async () => {
      try {
        const count = await getMaterialsCountInIndexedDb().catch(() => 0);
        if (count < 50) {
          const res = await syncErpMaterials(undefined, 'ALL', 5000).catch(() => null);
          if (res && res.data && res.data.length > 0) {
            await saveMaterialsToIndexedDb(res.data).catch(() => {});
            loadWarehouses();
            loadCategories();
          }
        }
      } catch {
        // silent
      }
    };
    initWarmup();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await fetchErpStatus();
      setErpStatus(status);
    } catch (err: any) {
      console.error('Failed to load ERP status:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getUniqueCategoriesFromIndexedDb().catch(() => []);
      setDbCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadWarehouses = async () => {
    try {
      const serverWh = await fetchErpWarehouses().catch(() => []);
      const localWh = await getUniqueWarehousesFromIndexedDb().catch(() => []);

      const map = new Map<string, { code: string; name: string; itemCount?: number }>();
      for (const w of serverWh) {
        if (w.code && w.code !== 'ALL') {
          map.set(w.code, { code: w.code, name: w.name || w.code, itemCount: w.itemCount });
        }
      }
      for (const w of localWh) {
        if (w.code && w.code !== 'ALL') {
          if (!map.has(w.code)) {
            map.set(w.code, { code: w.code, name: w.name || w.code, itemCount: w.itemCount });
          } else if (w.itemCount && !map.get(w.code)?.itemCount) {
            map.get(w.code)!.itemCount = w.itemCount;
          }
        }
      }

      setWarehouses(Array.from(map.values()));
    } catch (err: any) {
      console.error('Failed to load warehouses:', err);
    }
  };

  // API 및 인덱스DB 창고 정보로부터 고유 창고 목록 추출
  const dynamicWarehouses = useMemo(() => {
    const map = new Map<string, { code: string; name: string; itemCount?: number }>();

    for (const w of warehouses) {
      if (w.code && w.code !== 'ALL') {
        const code = String(w.code).trim();
        const name = String(w.name || w.code).trim();
        map.set(code, {
          code,
          name: name === code ? `${code} 창고` : name,
          itemCount: w.itemCount,
        });
      }
    }

    const list = Array.from(map.values());
    return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [warehouses]);

  // 제품분류 목록 동적 구성 (기본 사용자 요구 분류 + DB 저장 분류 병합)
  const dynamicCategories = useMemo(() => {
    const primary = ['완제품', '제작자재', '소모품'];
    const set = new Set<string>(primary);
    for (const c of dbCategories) {
      if (c && c.trim()) set.add(c.trim());
    }
    for (const m of materials) {
      if (m.category && m.category.trim()) set.add(m.category.trim());
    }
    return Array.from(set);
  }, [dbCategories, materials]);

  // Execute Search (Local-First 즉시 표출 + 서버 초고속 동기화 + 다차원 필터/정렬)
  const executeSearch = useCallback(async (
    query: string,
    whCode: string,
    grade: string,
    category: string,
    sort: string
  ) => {
    const currentSeq = ++searchSeqRef.current;

    // 1. FAST LOCAL-FIRST: 즉시 인덱스DB/인메모리 캐시에서 0.01초 만에 화면에 먼저 표출 (랙 완벽 차단)
    try {
      const local = await searchMaterialsInIndexedDbWithTotal(query, PAGE_SIZE, 0, whCode, grade, category, sort);
      if (local && local.data.length > 0 && currentSeq === searchSeqRef.current) {
        setMaterials(local.data);
        setTotalCount(local.total);
        setHasMore(local.data.length >= PAGE_SIZE);
      }
    } catch {
      // 무시 (서버에서 최신 데이터 가져옴)
    }

    // 2. 서버 캐시 조회 및 최신화 (< 1ms 응답)
    try {
      setIsLoading(true);
      const serverResults = await searchErpMaterialsWithTotal(query, whCode, PAGE_SIZE, 0, grade, category, sort);
      if (currentSeq === searchSeqRef.current) {
        setMaterials(serverResults.data);
        setTotalCount(serverResults.total);
        setHasMore(serverResults.hasMore);

        if (serverResults.data.length > 0) {
          saveMaterialsToIndexedDb(serverResults.data).catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('ERP search failed, kept local data if available:', err);
    } finally {
      if (currentSeq === searchSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load more on scroll to bottom
  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextOffset = materials.length;
      let nextBatch: ErpMaterial[] = [];

      try {
        const res = await searchErpMaterialsWithTotal(
          searchTerm,
          selectedWh,
          PAGE_SIZE,
          nextOffset,
          selectedGrade,
          selectedCategory,
          sortBy
        );
        nextBatch = res.data;
        if (res.total > 0) setTotalCount(res.total);
      } catch {
        const local = await searchMaterialsInIndexedDbWithTotal(
          searchTerm,
          PAGE_SIZE,
          nextOffset,
          selectedWh,
          selectedGrade,
          selectedCategory,
          sortBy
        );
        nextBatch = local.data;
        if (local.total > 0) setTotalCount(local.total);
      }

      if (nextBatch && nextBatch.length > 0) {
        setMaterials((prev) => {
          const existing = new Set(prev.map((p) => `${p.code}_${p.whCode}`));
          const newItems = nextBatch.filter((n) => !existing.has(`${n.code}_${n.whCode}`));
          return [...prev, ...newItems];
        });
        setHasMore(nextBatch.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Load more failed:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoading,
    isLoadingMore,
    hasMore,
    materials.length,
    searchTerm,
    selectedWh,
    selectedGrade,
    selectedCategory,
    sortBy
  ]);

  // Handle warehouse change
  const handleSelectWarehouse = (whCode: string) => {
    setSelectedWh(whCode);
  };

  // Trigger search on query, warehouse, grade, category, or sort change
  useEffect(() => {
    executeSearch(debouncedQuery, selectedWh, selectedGrade, selectedCategory, sortBy);
  }, [debouncedQuery, selectedWh, selectedGrade, selectedCategory, sortBy, executeSearch]);

  // Listen to global top navbar refresh event
  useEffect(() => {
    const handleGlobalRefresh = () => {
      executeSearch(searchTerm, selectedWh, selectedGrade, selectedCategory, sortBy);
      loadWarehouses();
      loadCategories();
    };
    window.addEventListener('app:refresh-data', handleGlobalRefresh);
    return () => window.removeEventListener('app:refresh-data', handleGlobalRefresh);
  }, [executeSearch, searchTerm, selectedWh, selectedGrade, selectedCategory, sortBy]);

  // Active filter status check & reset helper
  const hasActiveFilters =
    selectedWh !== 'ALL' ||
    selectedGrade !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    sortBy !== 'NAME_ASC';

  const activeFilterCount =
    (selectedWh !== 'ALL' ? 1 : 0) +
    (selectedGrade !== 'ALL' ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (sortBy !== 'NAME_ASC' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedWh('ALL');
    setSelectedGrade('ALL');
    setSelectedCategory('ALL');
    setSortBy('NAME_ASC');
  };

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
            <p className="text-sm font-semibold">자재 마스터 및 수불 내역을 조회 중입니다...</p>
          </div>
        ) : (
          <>
            {/* 1. Item Master Information Summary (랙 위치 제거 완료) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Database className="w-4 h-4 text-indigo-600" />
                자재 마스터 기본 정보
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">품목명</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 truncate">{detailData.item.name}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">규격 / 사양</span>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-slate-800 block mt-0.5 truncate">{detailData.item.spec || '-'}</span>
                </div>

                <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200/80">
                  <span className="text-indigo-800 font-bold block flex items-center justify-between">
                    <span>자재 관리 등급</span>
                    <span className="text-[10px] text-indigo-500 font-medium">ABC 분석</span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-indigo-950 block mt-0.5">
                    {getMaterialGrade(detailData.item)}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">자재 구분 / 품목분류</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 truncate">
                    {detailData.item.category || '일반부품'}
                  </span>
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

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
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
                자재 조회
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Sticky Search & Multi-Filter Listbox Bar */}
      <div
        style={{ top: 'var(--app-header-h, 56px)' }}
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 shadow-xs"
      >
        <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-2">
          
          {/* Row 1: Search Input + Mobile Filter Toggle + Desktop Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="품목코드, 품목명, 규격, 거래처명 검색..."
                className="w-full h-10 sm:h-11 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Expand/Collapse Button (with active count badge) */}
            <button
              type="button"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`sm:hidden h-10 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                hasActiveFilters
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              title="상세 필터 토글"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-[11px]">필터</span>
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset Filters button on Desktop */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:flex h-11 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold items-center gap-1 shrink-0 cursor-pointer transition-all"
                title="모든 필터 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>초기화</span>
              </button>
            )}
          </div>

          {/* Row 2: 4 Listboxes (창고별, 제품분류별, 등급별, 정렬기준) */}
          {/* Mobile: Ultra-compact 2x2 grid (h-8 text-[11px], only ~68px), Desktop: 4 columns inline */}
          <div className={`${!isFilterExpanded ? 'hidden sm:grid' : 'grid'} grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2`}>
            
            {/* 1. 창고별 (Warehouse) */}
            <div className="relative">
              <select
                value={selectedWh}
                onChange={(e) => handleSelectWarehouse(e.target.value)}
                className={`w-full h-8 sm:h-9.5 pl-2.5 sm:pl-3 pr-6 bg-slate-50 border rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer truncate ${
                  selectedWh !== 'ALL' ? 'border-indigo-400 text-indigo-700 bg-indigo-50/50' : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">🏢 전체 창고</option>
                {dynamicWarehouses.map((wh) => (
                  <option key={wh.code} value={wh.code}>
                    {wh.name} {wh.itemCount ? `(${wh.itemCount}종)` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. 제품분류별 (Category) */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full h-8 sm:h-9.5 pl-2.5 sm:pl-3 pr-6 bg-slate-50 border rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer truncate ${
                  selectedCategory !== 'ALL' ? 'border-indigo-400 text-indigo-700 bg-indigo-50/50' : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">📦 전체 분류</option>
                <option value="완제품">완제품</option>
                <option value="제작자재">제작자재 (가공/원자재)</option>
                <option value="소모품">소모품 (부자재)</option>
                {dynamicCategories
                  .filter((c) => !['완제품', '제작자재', '소모품'].includes(c))
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. 등급별 (Grade) */}
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className={`w-full h-8 sm:h-9.5 pl-2.5 sm:pl-3 pr-6 bg-slate-50 border rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer truncate ${
                  selectedGrade !== 'ALL' ? 'border-indigo-400 text-indigo-700 bg-indigo-50/50' : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">🏷️ 전체 등급</option>
                <option value="A등급">⭐ A등급 (핵심/고가)</option>
                <option value="B등급">🟢 B등급 (주요부품)</option>
                <option value="C등급">🟡 C등급 (일반부품)</option>
                <option value="D등급">⚪ D등급 (소모/부자재)</option>
                <option value="O등급">🔵 O등급 (기타)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 4. 정렬기준 (Sort) */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full h-8 sm:h-9.5 pl-2.5 sm:pl-3 pr-6 bg-slate-50 border rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer truncate ${
                  sortBy !== 'NAME_ASC' ? 'border-indigo-400 text-indigo-700 bg-indigo-50/50' : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="NAME_ASC">🔤 품명순 (가나다)</option>
                <option value="NAME_DESC">🔤 품명 역순 (하파타)</option>
                <option value="CODE_ASC">🔢 품목코드순</option>
                <option value="STOCK_DESC">📈 재고 많은순</option>
                <option value="STOCK_ASC">📉 재고 적은순 (부족)</option>
                <option value="PRICE_DESC">💰 단가 높은순</option>
                <option value="PRICE_ASC">🏷️ 단가 낮은순</option>
                <option value="GRADE_ASC">⭐ 자재등급순 (A→D)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

          {/* Mobile Active Filter Reset Bar */}
          {hasActiveFilters && (
            <div className="sm:hidden flex items-center justify-between pt-0.5 px-0.5 text-[11px]">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                필터 {activeFilterCount}개 적용됨
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>필터 초기화</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. Results Section (창고별로 따로 표시, 랙 위치 제외 완료) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            자재 목록 <span className="text-indigo-600 font-mono">({totalCount > 0 ? `총 ${totalCount.toLocaleString()}건` : `${materials.length}건`}{totalCount > materials.length ? ` • ${materials.length}개 로드됨` : ''})</span>
          </h2>
          {isLoading && (
            <span className="text-xs text-indigo-600 flex items-center gap-1 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> 조회 중...
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
          <VirtualGrid<ErpMaterial>
            items={materials}
            itemHeight={280}
            cols={{ sm: 2, md: 2, lg: 3, xl: 4 }}
            onEndReached={handleLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            renderItem={(item, idx) => {
              const grade = getMaterialGrade(item);
              const gradeStyle = getGradeBadgeStyle(grade);
              const isSpecificCategory =
                item.category &&
                !['일반', '기타', 'ERP연동자재', '납품자재', 'ERP입고자재'].includes(item.category) &&
                !item.category.includes('등급');

              return (
                <div
                  key={`${item.code}_${item.whCode || idx}_${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Bar: Item Code & True Grade (A/B/C/D) & Unit */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-xs border border-indigo-100">
                          {item.code}
                        </span>
                        {/* 자재 등급 뱃지 (A등급, B등급, C등급, D등급) */}
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
                          {grade}
                        </span>
                        {/* 자재 구분 / 품목분류 (실린더, 밸브 등) */}
                        {isSpecificCategory && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                            {item.category}
                          </span>
                        )}
                      </div>
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
            );
          }}
        />
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
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-mono font-black text-lg text-slate-900 tracking-wider">
                    {qrPrintItem.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${getGradeBadgeStyle(getMaterialGrade(qrPrintItem)).bg} ${getGradeBadgeStyle(getMaterialGrade(qrPrintItem)).text} ${getGradeBadgeStyle(getMaterialGrade(qrPrintItem)).border}`}>
                    {getMaterialGrade(qrPrintItem)}
                  </span>
                </div>
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

export const ErpMaterialSearchView = React.memo(ErpMaterialSearchViewComponent);
