import React from 'react';
import { 
  Package, 
  QrCode, 
  Printer, 
  Upload, 
  Plus, 
  Download, 
  History, 
  AlertTriangle,
  Layers,
  Search,
  Camera,
  Smartphone,
  MapPin,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

export interface NavbarProps {
  items?: InventoryItem[];
  totalItemsCount?: number;
  selectedCount?: number;
  onOpenAdd?: () => void;
  onOpenAddModal?: () => void;
  onOpenImport?: () => void;
  onOpenImportModal?: () => void;
  onOpenPrintAll?: () => void;
  onOpenPrintModal?: () => void;
  onOpenPrintSelected?: () => void;
  onOpenScanner?: () => void;
  onOpenScannerModal?: () => void;
  onOpenHistory?: () => void;
  onOpenHistoryModal?: () => void;
  onOpenRackZoneManager?: () => void;
  onOpenWarehouseVisualizer?: () => void;
  onOpenBatchStockOut?: () => void;
  onResetTo5000Items?: () => void;
  onExportExcel?: () => void;
  onDownloadTemplate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  items = [],
  totalItemsCount,
  selectedCount = 0,
  onOpenAdd,
  onOpenAddModal,
  onOpenImport,
  onOpenImportModal,
  onOpenPrintAll,
  onOpenPrintModal,
  onOpenPrintSelected,
  onOpenScanner,
  onOpenScannerModal,
  onOpenHistory,
  onOpenHistoryModal,
  onOpenRackZoneManager,
  onOpenWarehouseVisualizer,
  onOpenBatchStockOut,
  onResetTo5000Items,
  onExportExcel,
  onDownloadTemplate,
}) => {
  const handleAdd = onOpenAdd || onOpenAddModal;
  const handleImport = onOpenImport || onOpenImportModal;
  const handlePrint = onOpenPrintAll || onOpenPrintModal;
  const handleScanner = onOpenScanner || onOpenScannerModal;
  const handleHistory = onOpenHistory || onOpenHistoryModal;

  const totalCount = totalItemsCount ?? items.length;
  const lowStockCount = items.filter(
    (item) => item && item.quantity <= (item.safetyStock || 0)
  ).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors shadow-2xs">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xs">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center">
              SmartRack <span className="text-indigo-600 font-semibold text-xs sm:text-sm ml-1.5 font-mono">v0.2</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center/Right Status & Action Group */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Sync Status Pill / QR Scanner */}
        {handleScanner && (
          <button 
            onClick={handleScanner}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 cursor-pointer transition-all"
            title="스마트폰 모바일 동기화 & QR 스캐너"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR 스캔 / 모바일</span>
          </button>
        )}

        {/* Warehouse Rack Visualizer Button */}
        {onOpenWarehouseVisualizer && (
          <button
            onClick={onOpenWarehouseVisualizer}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            title="창고별 랙 배치도 및 랙 위치 시각화 관리"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>창고 랙 배치도</span>
          </button>
        )}

        {/* Rack Zone Manager */}
        {onOpenRackZoneManager && (
          <button
            onClick={onOpenRackZoneManager}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="랙 위치 및 구역 일괄 관리"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>구역 관리</span>
          </button>
        )}

        {/* Excel Import Button */}
        {handleImport && (
          <button
            onClick={handleImport}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="엑셀 파일 불러오기 & 중복 자동검증"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>엑셀 가져오기</span>
          </button>
        )}

        {/* History Button */}
        {handleHistory && (
          <button
            onClick={handleHistory}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="입출고 및 변동 이력"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">재고 이력</span>
          </button>
        )}

        {/* Print Labels Button */}
        {selectedCount > 0 ? (
          <button
            onClick={onOpenPrintSelected}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm ring-2 ring-indigo-300/50"
            title={`선택된 ${selectedCount}개 품목 라벨 인쇄`}
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>선택 인쇄 ({selectedCount})</span>
          </button>
        ) : handlePrint ? (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            title="애니라벨 및 랙 라벨 인쇄 모드"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
            <span className="hidden sm:inline">전체 라벨 인쇄</span>
            <span className="sm:hidden">인쇄</span>
          </button>
        ) : null}

        {/* Add New Item Button */}
        {handleAdd && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">신규 품목</span>
            <span className="sm:hidden">추가</span>
          </button>
        )}
      </div>
    </header>
  );
};


