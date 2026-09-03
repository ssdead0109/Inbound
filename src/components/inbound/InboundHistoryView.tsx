import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Search,
  Building2,
  Boxes,
  Calendar,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  List,
  Camera,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  Printer,
  RefreshCw,
  RotateCcw,
  WifiOff,
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';
import { fetchErpStatus } from '../../api/erpApi';
import { registerBackHandler } from '../../utils/backHandler';
import { cancelInboundReceipt } from '../../utils/syncQueueHelper';
import { soundHelper } from '../../utils/soundHelper';
import { matchesMultiKeyword } from '../../utils/searchHelper';

interface InboundHistoryViewProps {
  slips: InboundSlip[];
  onOpenPrintModal: (slip: InboundSlip) => void;
  onSelectSlip: (slipNo: string) => void;
  onRefresh?: () => void;
}

import { usePersistedState } from '../../hooks/usePersistedState';

const InboundHistoryViewComponent: React.FC<InboundHistoryViewProps> = ({
  slips,
  onOpenPrintModal,
  onSelectSlip,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = usePersistedState<string>('filter_history_search', '');
  const [statusFilter, setStatusFilter] = usePersistedState<'ALL' | 'COMPLETED' | 'PARTIAL'>('filter_history_status', 'ALL');
  const [viewMode, setViewMode] = usePersistedState<'BY_SLIP' | 'BY_ITEM'>('filter_history_view_mode', 'BY_SLIP');
  const [collapsedSlips, setCollapsedSlips] = useState<Record<string, boolean>>({});
  const [displayLimit, setDisplayLimit] = useState(50);
  const [isErpOnline, setIsErpOnline] = useState(true);
  const historySentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchErpStatus()
      .then((st) => setIsErpOnline(Boolean(st?.isConnected && !st?.isDummyMode)))
      .catch(() => setIsErpOnline(false));
  }, []);

  useEffect(() => {
    setDisplayLimit(50);
  }, [searchTerm, statusFilter, viewMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 30);
        }
      },
      { rootMargin: '600px 0px', threshold: 0.01 }
    );

    if (historySentinelRef.current) {
      observer.observe(historySentinelRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 700;
      if (scrollBottom >= threshold) {
        setDisplayLimit((prev) => prev + 30);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightbox Photo Viewer State
  const [photoViewer, setPhotoViewer] = useState<{
    isOpen: boolean;
    photos: string[];
    slipNo: string;
    currentIndex: number;
  }>({
    isOpen: false,
    photos: [],
    slipNo: '',
    currentIndex: 0,
  });

  const openPhotoViewer = (photos: string[], slipNo: string, startIndex: number = 0) => {
    setPhotoViewer({
      isOpen: true,
      photos,
      slipNo,
      currentIndex: startIndex,
    });
  };

  const closePhotoViewer = () => {
    setPhotoViewer((prev) => ({ ...prev, isOpen: false }));
  };

  const [cancellingSlipNo, setCancellingSlipNo] = useState<string | null>(null);

  const handleCancelInbound = async (slip: InboundSlip) => {
    const isErp =
      slip.supplierCode.startsWith('SUP-ERP') ||
      slip.slipNo.length === 11 ||
      Boolean(slip.memo && slip.memo.includes('ERP'));

    const confirmMsg = `납품확인서 [${slip.slipNo}]의 입고 처리를 취소하시겠습니까?\n\n• 로컬 자재 재고가 입고 전 수량으로 원복됩니다.\n• 전표가 '입고 대기' 목록으로 복구됩니다.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setCancellingSlipNo(slip.slipNo);
      const res = await cancelInboundReceipt(slip.slipNo, isErp);
      soundHelper.playSuccessChime();
      alert(res.message || `납품확인서 [${slip.slipNo}]의 입고가 취소되었습니다.`);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      soundHelper.playErrorBuzzer();
      alert(err.message || '입고 취소 중 오류가 발생했습니다.');
    } finally {
      setCancellingSlipNo(null);
    }
  };

  const touchStartXRef = useRef<number>(0);

  // Register Back Handler: Close photo viewer on smartphone back button
  useEffect(() => {
    if (!photoViewer.isOpen) return;
    return registerBackHandler('photoViewer', 100, () => {
      closePhotoViewer();
      return true;
    });
  }, [photoViewer.isOpen]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!photoViewer.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setPhotoViewer((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.photos.length,
        }));
      } else if (e.key === 'ArrowLeft') {
        setPhotoViewer((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
        }));
      } else if (e.key === 'Escape') {
        closePhotoViewer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoViewer.isOpen]);

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhotoViewer((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length,
    }));
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhotoViewer((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
    }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        // Swipe Left -> Next
        handleNextPhoto();
      } else {
        // Swipe Right -> Prev
        handlePrevPhoto();
      }
    }
  };

  const historySlips = slips.filter((s) => s.status === 'COMPLETED' || s.status === 'PARTIAL');

  // Filter Slips
  const filteredSlips = historySlips.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const itemFields = s.items.flatMap((it) => [it.itemCode, it.itemName, it.spec, it.warehouse, it.defectReason]);
      return matchesMultiKeyword(searchTerm, [
        s.slipNo,
        s.supplierName,
        s.poNumber,
        s.manager,
        s.memo,
        ...itemFields,
      ]);
    }
    return true;
  });

  // Flattened items for "BY_ITEM" view
  const flattenedItems = filteredSlips.flatMap((slip) =>
    slip.items.map((item) => ({
      ...item,
      slipNo: slip.slipNo,
      supplierName: slip.supplierName,
      deliveryDate: slip.deliveryDate,
      inboundDate: slip.inboundDate,
      manager: slip.manager || '자재과',
      photos: slip.photos,
    }))
  );

  const toggleCollapse = (slipNo: string) => {
    setCollapsedSlips((prev) => ({
      ...prev,
      [slipNo]: !prev[slipNo],
    }));
  };

  const totalItemsCount = historySlips.reduce((acc, s) => acc + s.items.length, 0);
  const totalReceivedCount = historySlips.reduce((acc, s) => acc + (s.totalReceivedQty || 0), 0);

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3.5 w-full">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2 min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white truncate">
                입고 완료 내역
              </h1>
            </div>
          </div>

          {/* View Mode Toggle: 전표별 / 품목별 (동일 라인 우측 정렬) */}
          <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl border border-white/10 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('BY_SLIP')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'BY_SLIP'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>전표별</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('BY_ITEM')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'BY_ITEM'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>품목별</span>
            </button>
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
              <option value="ALL">📦 전체 상태</option>
              <option value="COMPLETED">✅ 입고 완료</option>
              <option value="PARTIAL">⚠️ 부분 입고</option>
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
              placeholder="전표번호, 공급처, 품목코드, 품목명을 검색하세요..."
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


      {/* No Data State */}
      {filteredSlips.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3 shadow-xs">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
            !isErpOnline ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
          }`}>
            {!isErpOnline ? (
              <WifiOff className="w-6 h-6" />
            ) : (
              <History className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            {!isErpOnline ? '사내 ERP DB 서버가 현재 오프라인 상태입니다' : '조회된 입고 완료 내역이 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {!isErpOnline
              ? '사내 DB 서버(192.168.2.209:6611)의 전원이 켜져 있는지 확인해주세요. 상단 [서버 설정]에서 실시간 접속 테스트를 실행할 수 있습니다.'
              : '검색 조건을 변경하거나 신규 입고를 진행해주세요.'}
          </p>
        </div>
      )}

      {/* 1. BY_SLIP: Progressive Infinite Stream */}
      {viewMode === 'BY_SLIP' && (
        <div className="space-y-3">
          {filteredSlips.slice(0, displayLimit).map((slip) => {
            const isCompleted = slip.status === 'COMPLETED';
            const hasDefects = (slip.totalDefectQty || 0) > 0;
            const isCollapsed = collapsedSlips[slip.slipNo] || false;
            const targetWarehouse = slip.items[0]?.warehouse || '특장자재창고';
            const hasPhotos = slip.photos && slip.photos.length > 0;

            return (
              <div
                key={slip.slipNo}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Clean Structured Slip Header */}
                <div
                  onClick={() => toggleCollapse(slip.slipNo)}
                  className="p-3.5 sm:p-4 bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-200 cursor-pointer transition-colors space-y-2"
                >
                  {/* Top Line: Slip No + Status Badge + Photos + Right Total Qty + Chevron */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-xs sm:text-sm font-bold text-indigo-600">
                        {slip.slipNo}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isCompleted ? '입고 완료' : '부분 입고'}
                      </span>

                      {/* Photo Badge Button */}
                      {hasPhotos && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPhotoViewer(slip.photos!, slip.slipNo, 0);
                          }}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs shadow-indigo-600/30"
                          title="현장 입고 사진 보기"
                        >
                          <Camera className="w-3.5 h-3.5 text-white" />
                          <span>사진 {slip.photos!.length}장 보기</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPrintModal(slip);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-2xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="인쇄"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>인쇄</span>
                      </button>

                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {slip.totalReceivedQty.toLocaleString()} EA
                      </span>
                      <button type="button" className="p-0.5 text-slate-400 hover:text-slate-700">
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Line: Supplier Name + Warehouse + Inbound Date */}
                  <div className="flex items-center space-x-2 text-xs text-slate-600 flex-wrap gap-y-1">
                    <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-[240px]">
                      {slip.supplierName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 whitespace-nowrap">
                      {targetWarehouse}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-bold font-mono text-[11px] whitespace-nowrap flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      <span>입고일시: {slip.inboundDate ? slip.inboundDate.slice(0, 16).replace('T', ' ') : (slip.updatedAt ? slip.updatedAt.slice(0, 16).replace('T', ' ') : slip.deliveryDate)}</span>
                    </span>
                  </div>
                </div>

                {/* Slip Items Breakdown */}
                {!isCollapsed && (
                  <div className="p-3.5 sm:p-4 space-y-3">
                    
                    {/* Attached Photos Gallery Section (전표 클릭 시 입고 사진 최우선 표시) */}
                    {hasPhotos && (
                      <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-indigo-600" />
                            <span>현장 입고 사진 ({slip.photos!.length}장)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => openPhotoViewer(slip.photos!, slip.slipNo, 0)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-200/60 shadow-2xs"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>크게보기</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                          {slip.photos!.map((url, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => openPhotoViewer(slip.photos!, slip.slipNo, pIdx)}
                              className="group relative w-18 h-18 sm:w-22 sm:h-22 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 cursor-pointer hover:border-indigo-500 transition-all hover:scale-105 bg-slate-100"
                            >
                              <img
                                src={url}
                                alt={`입고 사진 ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <ZoomIn className="w-4 h-4 drop-shadow" />
                              </div>
                              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                                #{pIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
                      <span>세부 품목 내역 ({slip.items.length}건)</span>
                      <span>담당: <strong className="text-slate-700">{slip.manager || '자재과'}</strong></span>
                    </div>

                    <div className="space-y-1.5">
                      {slip.items.map((item, idx) => {
                        const itemMatch = item.receivedQty >= item.orderQty && item.defectQty === 0;
                        const itemDefect = item.defectQty > 0;

                        return (
                          <div
                            key={item.id || idx}
                            onClick={() => {
                              if (hasPhotos) {
                                openPhotoViewer(slip.photos!, slip.slipNo, 0);
                              }
                            }}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
                              hasPhotos ? 'cursor-pointer hover:border-indigo-300' : ''
                            } ${
                              itemDefect
                                ? 'bg-rose-50/40 border-rose-200'
                                : itemMatch
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-amber-50/40 border-amber-200'
                            }`}
                            title={hasPhotos ? '클릭 시 입고 사진 보기' : undefined}
                          >
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                <span className="font-mono font-bold text-indigo-700 text-xs">
                                  [{item.itemCode}]
                                </span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {item.itemName}
                                </span>
                                {item.spec && (
                                  <span className="text-2xs text-slate-500 font-normal">
                                    • {item.spec}
                                  </span>
                                )}
                                {hasPhotos && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPhotoViewer(slip.photos!, slip.slipNo, 0);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                    title="입고 현장 사진 보기"
                                  >
                                    <Camera className="w-3 h-3 text-indigo-600" />
                                    <span>사진 {slip.photos!.length}장 보기</span>
                                  </button>
                                )}
                              </div>

                              {item.defectReason && (
                                <p className="text-2xs font-semibold text-rose-600 mt-0.5 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  불량 사유: {item.defectReason}
                                </p>
                              )}
                            </div>

                            {/* Quantity Breakdown Badge */}
                            <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                              <div className="text-right">
                                <span className="text-2xs text-slate-400 block font-medium leading-tight">실입고 / 납품</span>
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  <strong className="text-emerald-600">{item.receivedQty.toLocaleString()}</strong>
                                  <span className="text-slate-400"> / {item.orderQty.toLocaleString()} {item.unit}</span>
                                </span>
                              </div>

                              {itemDefect ? (
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-2xs flex items-center gap-1">
                                  불량 {item.defectQty}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-2xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> 정상
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {slip.memo && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        메모: {slip.memo}
                      </p>
                    )}

                    {/* 세부품목내역 하단: 발주일시 + 발주번호 및 입고취소 액션 바 */}
                    <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>발주일시: <strong className="font-mono text-slate-900">{slip.deliveryDate || '미지정'}</strong></span>
                        </span>
                        {slip.poNumber && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>발주번호: <strong className="font-mono text-indigo-700">{slip.poNumber}</strong></span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={cancellingSlipNo === slip.slipNo}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelInbound(slip);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
                        title="입고 처리를 취소하고 입고 대기 목록으로 복원합니다"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${cancellingSlipNo === slip.slipNo ? 'animate-spin' : ''}`} />
                        <span>{cancellingSlipNo === slip.slipNo ? '취소 처리 중...' : '입고 취소'}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. BY_ITEM: Progressive Infinite Stream */}
      {viewMode === 'BY_ITEM' && (
        <div className="space-y-2.5">
          {flattenedItems.slice(0, displayLimit * 2).map((item, idx) => {
            const itemMatch = item.receivedQty >= item.orderQty && item.defectQty === 0;
            const itemDefect = item.defectQty > 0;
            const hasPhotos = item.photos && item.photos.length > 0;

            return (
              <div
                key={`${item.slipNo}-${item.id || idx}`}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-xs">
                      {item.slipNo}
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {item.supplierName}
                    </span>
                    <span className="text-2xs text-slate-400 font-mono">
                      {item.deliveryDate}
                    </span>
                    <span className="text-2xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {item.warehouse || '특장자재창고'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    <span className="font-mono text-indigo-700">[{item.itemCode}]</span> {item.itemName}
                  </h4>
                  
                  {item.spec && (
                    <p className="text-2xs text-slate-500 mt-0.5">{item.spec}</p>
                  )}

                  {item.defectReason && (
                    <p className="text-2xs font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 불량 사유: {item.defectReason}
                    </p>
                  )}

                  {hasPhotos && (
                    <button
                      type="button"
                      onClick={() => openPhotoViewer(item.photos!, item.slipNo, 0)}
                      className="mt-1.5 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>현장 사진 {item.photos!.length}장 보기</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-2xs text-slate-400 block font-medium leading-tight">실입고 / 납품수량</span>
                    <span className="font-mono font-bold text-xs">
                      <strong className="text-emerald-600">{item.receivedQty.toLocaleString()}</strong>
                      <span className="text-slate-400"> / {item.orderQty.toLocaleString()} {item.unit}</span>
                    </span>
                  </div>

                  {itemDefect ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                      불량 {item.defectQty}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 정상 입고
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Indicator */}
      <div ref={historySentinelRef} className="h-6 w-full" aria-hidden="true" />

      {((viewMode === 'BY_SLIP' && displayLimit < filteredSlips.length) ||
        (viewMode === 'BY_ITEM' && displayLimit * 2 < flattenedItems.length)) && (
        <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>스크롤하여 추가 내역 불러오는 중...</span>
        </div>
      )}

      {/* Interactive Photo Lightbox Modal */}
      {photoViewer.isOpen && photoViewer.photos.length > 0 && (
        <div
          onClick={closePhotoViewer}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 text-white rounded-3xl max-w-3xl w-full p-4 sm:p-5 shadow-2xl space-y-3 overflow-hidden border border-slate-800 animate-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>현장 입고 사진</span>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-900/80 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                      {photoViewer.currentIndex + 1} / {photoViewer.photos.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    전체 <strong className="text-indigo-400">{photoViewer.photos.length}장</strong> 중 <strong className="text-white">{photoViewer.currentIndex + 1}번째</strong> 사진 (좌우 버튼 또는 화면을 쓸어넘겨 전환)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={photoViewer.photos[photoViewer.currentIndex]}
                  download={`inbound-${photoViewer.slipNo}-${photoViewer.currentIndex + 1}.jpg`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="사진 다운로드"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={closePhotoViewer}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                  title="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image Stage with Touch Swipe & Navigation */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-h-[65vh] min-h-[280px] bg-black/60 rounded-2xl flex items-center justify-center overflow-hidden touch-pan-y"
            >
              <img
                src={photoViewer.photos[photoViewer.currentIndex]}
                alt={`입고 사진 ${photoViewer.currentIndex + 1}`}
                className="max-w-full max-h-[65vh] object-contain select-none transition-all duration-200"
              />

              {/* Floating Center-Top Indicator Badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-xl pointer-events-none flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>{photoViewer.currentIndex + 1} / {photoViewer.photos.length}</span>
              </div>

              {/* Prev Button */}
              {photoViewer.photos.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-2xl flex items-center justify-center active:scale-95 group"
                  title="이전 사진 (키보드 ← 또는 왼쪽 스와이프)"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Next Button */}
              {photoViewer.photos.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-2xl flex items-center justify-center active:scale-95 group"
                  title="다음 사진 (키보드 → 또는 오른쪽 스와이프)"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Footer: Slip Info & Thumbnails Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>전표번호: <strong className="font-mono text-indigo-400">{photoViewer.slipNo}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-bold">{photoViewer.currentIndex + 1}번째 사진</span>
              </div>

              {/* Thumbnails strip with numbered badges */}
              {photoViewer.photos.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto py-1 px-0.5">
                  {photoViewer.photos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoViewer((prev) => ({ ...prev, currentIndex: idx }))}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        photoViewer.currentIndex === idx
                          ? 'border-indigo-400 scale-105 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                      title={`${idx + 1}번째 사진 보기`}
                    >
                      <img src={url} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[9px] font-mono text-white px-1 rounded font-bold">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const InboundHistoryView = React.memo(InboundHistoryViewComponent);
