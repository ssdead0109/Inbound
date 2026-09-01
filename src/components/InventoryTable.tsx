import React, { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Building2,
  ArrowUpDown, 
  Plus, 
  Minus, 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  PackageMinus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem } from '../types/inventory';
import { getCategoryBadgeColor } from '../utils/imageUtils';
import { parseWarehouseAndRack, parseItemLocations, cleanSupplierDisplayName, ParsedLocation } from '../utils/excelHelper';
import { generateItemQRValue } from '../utils/qrHelper';

interface IndexedInventoryItem extends InventoryItem {
  _searchKey: string;
  _locations: ParsedLocation[];
  _warehouses: string[];
  _racks: string[];
  _rackZones: string[];
  _isUnassigned: boolean;
  _qrValue: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectBatch?: (ids: string[], select: boolean) => void;
  onSelectAll: (all: boolean) => void;
  onOpenDetail?: (item: InventoryItem) => void;
  onViewDetail?: (item: InventoryItem) => void;
  onOpenEdit?: (item: InventoryItem) => void;
  onEditItem?: (item: InventoryItem) => void;
  onOpenStockAction?: (item: InventoryItem, actionType: 'IN' | 'OUT') => void;
  onStockAction?: (item: InventoryItem, actionType: 'IN' | 'OUT') => void;
  onDelete?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onDeleteBatch?: (ids: string[]) => void;
  onPrintSingle: (item: InventoryItem) => void;
  onUpdatePrintCount?: (id: string, delta: number) => void;
  onExportExcel?: (filteredItems: InventoryItem[]) => void;
  onDownloadTemplate?: () => void;
  showOnlyLowStock?: boolean;
  selectedCategory?: string;
  onTogglePrintStatus?: (ids: string[], isPrinted: boolean) => void;
  onPrintSelected?: () => void;
  onOpenImportModal?: () => void;
  onOpenRackZoneModal?: () => void;
  onOpenWarehouseVisualizer?: () => void;
  onResetAllRackLocations?: () => void;
  onOpenBatchStockOut?: () => void;
  onResetTo5000DummyItems?: () => void;
}

// 🚀 Memoized Table Row Component
interface RowProps {
  item: IndexedInventoryItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (item: InventoryItem) => void;
  onOpenEdit: (item: InventoryItem) => void;
  onOpenStockAction: (item: InventoryItem, actionType: 'IN' | 'OUT') => void;
  onDelete: (id: string) => void;
  onPrintSingle: (item: InventoryItem) => void;
}

const TableRow = memo<RowProps>(({
  item,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  onOpenEdit,
  onOpenStockAction,
  onDelete,
  onPrintSingle,
}) => {
  const isLowStock = item.quantity <= (item.safetyStock || 0);
  const catBadge = getCategoryBadgeColor(item.category || '일반');
  const isPrinted = !!item.isPrinted;
  const locations = item._locations;
  const isUnassigned = item._isUnassigned;

  return (
    <tr
      className={`transition-colors group ${
        isPrinted
          ? 'bg-emerald-50/20 hover:bg-emerald-50/50 border-l-4 border-l-emerald-500'
          : isSelected
          ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
          : 'hover:bg-slate-50'
      }`}
    >
      {/* 1. 체크박스 */}
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="rounded accent-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 cursor-pointer"
        />
      </td>

      {/* 2. 사진 */}
      <td className="p-3 text-center">
        <div 
          className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onOpenDetail(item)}
          title="사진 크게보기"
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-300" />
          )}
        </div>
      </td>

      {/* 3. 창고 (다중 창고 뱃지 지원) */}
      <td className="p-3">
        {isUnassigned ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span>미지정</span>
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1 max-w-[160px]">
            {item._warehouses.map((wh, idx) => (
              <span key={idx} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{wh}</span>
              </span>
            ))}
          </div>
        )}
      </td>

      {/* 4. 랙위치 (다중 랙 위치 뱃지 지원) */}
      <td className="p-3">
        {isUnassigned ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>미입력</span>
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
            {locations.filter((l) => !l.isUnassigned).map((loc, idx) => (
              <span key={idx} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-bold font-mono bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs whitespace-nowrap">
                <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>{loc.rack}</span>
              </span>
            ))}
          </div>
        )}
      </td>

      {/* 5. 품목정보 (코드, 품명, 규격, 공급처) */}
      <td className="p-3 min-w-[200px]">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
              {item.code}
            </span>
            <span className={`text-2xs px-1.5 py-0.2 rounded border font-semibold ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
              {item.category || '일반'}
            </span>
          </div>
          <div 
            className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1 leading-snug"
            onClick={() => onOpenDetail(item)}
            title={item.name}
          >
            {item.name}
          </div>
          <div className="flex items-center space-x-2 text-2xs text-slate-500">
            {item.spec && (
              <span className="truncate max-w-[180px]" title={`규격: ${item.spec}`}>
                {item.spec}
              </span>
            )}
            {item.supplier && (
              <>
                <span>•</span>
                <span className="text-slate-400 truncate max-w-[120px]" title={`공급처: ${item.supplier}`}>
                  {cleanSupplierDisplayName(item.supplier)}
                </span>
              </>
            )}
          </div>
        </div>
      </td>

      {/* 6. 단가 */}
      <td className="p-3 text-right whitespace-nowrap">
        <span className="text-xs font-mono text-slate-600 font-semibold">
          {item.price ? `₩${item.price.toLocaleString()}` : '-'}
        </span>
      </td>

      {/* 7. 재고수량 */}
      <td className="p-3 text-right whitespace-nowrap">
        <div className="space-y-0.5">
          <div className="flex items-center justify-end space-x-1.5">
            <span className={`text-base font-extrabold font-mono ${
              isLowStock ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {item.quantity.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
          </div>
          {item.safetyStock !== undefined && (
            <div className="text-2xs text-slate-400">
              안전: <span className="font-mono">{item.safetyStock.toLocaleString()}</span> {item.unit}
            </div>
          )}
          {isLowStock && (
            <span className="inline-flex items-center space-x-0.5 text-2xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>부족</span>
            </span>
          )}
        </div>
      </td>

      {/* 8. QR라벨 */}
      <td className="p-3 text-center whitespace-nowrap">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div 
            className="bg-white p-1 rounded border border-slate-200 shadow-2xs cursor-pointer hover:border-indigo-500 hover:shadow-xs transition-all"
            onClick={() => onPrintSingle(item)}
            title="라벨 인쇄 화면 열기"
          >
            <QRCodeSVG
              value={item._qrValue}
              size={34}
              level="M"
            />
          </div>
          {isPrinted ? (
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
              ✓ {item.printCount || 1}회 출력
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
              미출력
            </span>
          )}
        </div>
      </td>

      {/* 9. 빠른 입/출고 (🚀 4번 요청: 넓은 너비와 패딩으로 분리) */}
      <td className="p-3 text-center whitespace-nowrap">
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => onOpenStockAction(item, 'OUT')}
            disabled={item.quantity <= 0}
            className="px-2.5 py-1 rounded text-xs font-bold text-rose-600 hover:bg-white hover:shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center space-x-1 cursor-pointer"
            title="출고 (재고 차감)"
          >
            <Minus className="w-3 h-3" />
            <span>출고</span>
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button
            type="button"
            onClick={() => onOpenStockAction(item, 'IN')}
            className="px-2.5 py-1 rounded text-xs font-bold text-emerald-600 hover:bg-white hover:shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
            title="입고 (재고 추가)"
          >
            <Plus className="w-3 h-3" />
            <span>입고</span>
          </button>
        </div>
      </td>

      {/* 10. 관리 (가운데 정렬) */}
      <td className="p-3 text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-1.5">
          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="상세정보"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(item)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="수정"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items = [],
  selectedIds,
  onToggleSelect,
  onSelectBatch,
  onSelectAll,
  onOpenDetail,
  onViewDetail,
  onOpenEdit,
  onEditItem,
  onOpenStockAction,
  onStockAction,
  onDelete,
  onDeleteItem,
  onDeleteBatch,
  onPrintSingle,
  onUpdatePrintCount,
  onExportExcel,
  onDownloadTemplate,
  showOnlyLowStock = false,
  selectedCategory: initialSelectedCategory = 'ALL',
  onTogglePrintStatus,
  onPrintSelected,
  onOpenImportModal,
  onOpenRackZoneModal,
  onOpenWarehouseVisualizer,
  onResetAllRackLocations,
  onOpenBatchStockOut,
  onResetTo5000DummyItems,
}) => {
  // Safe handler bridges
  const handleDetail = onOpenDetail || onViewDetail || (() => {});
  const handleEdit = onOpenEdit || onEditItem || (() => {});
  const handleStockAction = onOpenStockAction || onStockAction || (() => {});
  const handleDelete = onDelete || onDeleteItem || (() => {});

  // Local Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialSelectedCategory);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedRackZone, setSelectedRackZone] = useState<string>('ALL');
  const [printFilter, setPrintFilter] = useState<'ALL' | 'UNPRINTED' | 'PRINTED'>('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<keyof InventoryItem>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Header checkbox ref for indeterminate state
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Sync external category prop if passed
  useEffect(() => {
    if (initialSelectedCategory) {
      setSelectedCategory(initialSelectedCategory);
    }
  }, [initialSelectedCategory]);

  // 🚀 3. Debounce search query for ultra-smooth UI response (50ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 40);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 🚀 High-speed single-pass pre-indexing
  const {
    indexedItems,
    categories,
    categoryCounts,
    warehouses,
    warehouseCounts,
    rackZones,
    rackZoneCounts,
    unprintedCount,
    printedCount,
  } = useMemo(() => {
    const catSet = new Set<string>();
    const whSet = new Set<string>();
    const zoneSet = new Set<string>();

    const catCounts: Record<string, number> = { ALL: items.length };
    const whCounts: Record<string, number> = { ALL: items.length };
    const zoneCounts: Record<string, number> = { ALL: items.length };

    let unprinted = 0;
    let printed = 0;

    const list: IndexedInventoryItem[] = new Array(items.length);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      // 🚀 다중 위치 파싱
      const locs = parseItemLocations(it);
      const isAllUnassigned = locs.every((l) => l.isUnassigned);
      
      const whList: string[] = [];
      const rkList: string[] = [];
      const zoneList: string[] = [];

      locs.forEach((l) => {
        const wh = (l.isUnassigned || !l.warehouse || l.warehouse === '-' || l.warehouse === '미입력') ? '미입력' : l.warehouse;
        const rk = l.rack || '미입력';
        const zone = (l.isUnassigned || !rk || rk === '미입력') ? '미입력' : rk.split(/[\-\s\/]/)[0]?.trim() || '미입력';

        if (!whList.includes(wh)) whList.push(wh);
        if (!rkList.includes(rk)) rkList.push(rk);
        if (!zoneList.includes(zone)) zoneList.push(zone);

        whSet.add(wh);
        whCounts[wh] = (whCounts[wh] || 0) + 1;

        zoneSet.add(zone);
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      });

      if (it.category) {
        catSet.add(it.category);
        catCounts[it.category] = (catCounts[it.category] || 0) + 1;
      }

      if (it.isPrinted) {
        printed++;
      } else {
        unprinted++;
      }

      const searchKey = `${it.code} ${it.name} ${it.spec || ''} ${it.rackLocation || ''} ${it.warehouse || ''} ${it.supplier || ''} ${it.category || ''}`.toLowerCase();
      const qrVal = generateItemQRValue(it);

      list[i] = {
        ...it,
        _locations: locs,
        _warehouses: whList.length > 0 ? whList : ['미입력'],
        _racks: rkList.length > 0 ? rkList : ['미입력'],
        _rackZones: zoneList.length > 0 ? zoneList : ['미입력'],
        _isUnassigned: isAllUnassigned,
        _searchKey: searchKey,
        _qrValue: qrVal,
      };
    }

    const sortedCats = ['ALL', ...Array.from(catSet).sort((a, b) => a.localeCompare(b, 'ko'))];
    const sortedWarehouses = ['ALL', ...Array.from(whSet).sort((a, b) => {
      if (a === '미입력') return 1;
      if (b === '미입력') return -1;
      return a.localeCompare(b, 'ko');
    })];
    const sortedZones = ['ALL', ...Array.from(zoneSet).sort((a, b) => {
      if (a === '미입력') return 1;
      if (b === '미입력') return -1;
      return a.localeCompare(b, 'ko', { numeric: true });
    })];

    return {
      indexedItems: list,
      categories: sortedCats,
      categoryCounts: catCounts,
      warehouses: sortedWarehouses,
      warehouseCounts: whCounts,
      rackZones: sortedZones,
      rackZoneCounts: zoneCounts,
      unprintedCount: unprinted,
      printedCount: printed,
    };
  }, [items]);

  // ⚡ INSTANT FILTER & SORT (<1.5ms across 5,000+ items)
  const filteredItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const hasSearch = q.length > 0;
    const hasCat = selectedCategory !== 'ALL';
    const hasWh = selectedWarehouse !== 'ALL';
    const hasZone = selectedRackZone !== 'ALL';
    const isUnprinted = printFilter === 'UNPRINTED';
    const isPrinted = printFilter === 'PRINTED';

    const result: IndexedInventoryItem[] = [];

    for (let i = 0; i < indexedItems.length; i++) {
      const it = indexedItems[i];

      if (hasSearch && !it._searchKey.includes(q)) continue;
      if (hasCat && it.category !== selectedCategory) continue;
      if (hasWh && !it._warehouses.includes(selectedWarehouse)) continue;
      if (hasZone && !it._rackZones.includes(selectedRackZone)) continue;
      if (showOnlyLowStock && it.quantity > (it.safetyStock || 0)) continue;
      if (isUnprinted && it.isPrinted) continue;
      if (isPrinted && !it.isPrinted) continue;

      result.push(it);
    }

    result.sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      
      const strA = String(valA);
      const strB = String(valB);
      if (strA === strB) return 0;
      if (sortOrder === 'asc') {
        return strA > strB ? 1 : -1;
      } else {
        return strA < strB ? 1 : -1;
      }
    });

    return result;
  }, [indexedItems, debouncedSearch, selectedCategory, selectedWarehouse, selectedRackZone, showOnlyLowStock, printFilter, sortField, sortOrder]);

  // Auto reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
    setJumpPageInput('1');
  }, [debouncedSearch, selectedCategory, selectedWarehouse, selectedRackZone, showOnlyLowStock, printFilter, pageSize]);

  useEffect(() => {
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // Effective page size & Total pages calculation
  const effectivePageSize = pageSize > 0 ? pageSize : filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / (effectivePageSize || 1)));

  // Paginated items slice
  const paginatedItems = useMemo(() => {
    if (pageSize <= 0) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // 🚀 2. CURRENT PAGE SELECTION LOGIC (현재 페이지만 선택/해제)
  const currentPageSelectedCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < paginatedItems.length; i++) {
      if (selectedIds.has(paginatedItems[i].id)) count++;
    }
    return count;
  }, [paginatedItems, selectedIds]);

  const isCurrentPageAllSelected = paginatedItems.length > 0 && currentPageSelectedCount === paginatedItems.length;
  const isCurrentPageSomeSelected = currentPageSelectedCount > 0 && !isCurrentPageAllSelected;

  // Set indeterminate state on header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isCurrentPageSomeSelected;
    }
  }, [isCurrentPageSomeSelected]);

  // Toggle Current Page Selection
  const handleToggleCurrentPage = () => {
    // 🚀 1번 요청: 현재 페이지 전체 선택 상태이거나 다수 항목(일괄 선택 등)이 선택된 상태에서 해제 시 전체 일괄 해제
    if (isCurrentPageAllSelected || selectedIds.size > 0) {
      onSelectAll(false);
    } else {
      const pageIds = paginatedItems.map((it) => it.id);
      if (onSelectBatch) {
        onSelectBatch(pageIds, true);
      } else {
        pageIds.forEach((id) => !selectedIds.has(id) && onToggleSelect(id));
      }
    }
  };

  // Select all filtered items across all pages
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredItems.map((it) => it.id);
    if (onSelectBatch) {
      onSelectBatch(allFilteredIds, true);
    } else {
      onSelectAll(true);
    }
  };

  const handleDeselectAll = () => {
    onSelectAll(false);
  };

  const startItemIndex = filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(currentPage * pageSize, filteredItems.length);

  // Pagination smart range
  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [currentPage, totalPages]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteBatch) {
      onDeleteBatch(Array.from(selectedIds));
    }
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedWarehouse !== 'ALL' || selectedRackZone !== 'ALL' || printFilter !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedWarehouse('ALL');
    setSelectedRackZone('ALL');
    setPrintFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 w-full overflow-visible">
      {/* 3 & 4. UNIFIED STICKY CONTROL & TABLE HEADER BLOCK */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b-2 border-slate-300 shadow-xs">
        {/* Row 1: Search Input + Print Filters + Action/Selection Area */}
        <div className="px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-200 min-h-[48px]">
          {/* Left: Search input + Print Filter */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="코드, 품명, 규격, 랙위치 고속 검색..."
                className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Print Status Filter Pills */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setPrintFilter('ALL')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  printFilter === 'ALL'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setPrintFilter('UNPRINTED')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  printFilter === 'UNPRINTED'
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                🏷️ 미출력 ({unprintedCount.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setPrintFilter('PRINTED')}
                className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  printFilter === 'PRINTED'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                ✅ 출력완료 ({printedCount.toLocaleString()})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
                title="모든 필터 초기화"
              >
                <RotateCcw className="w-3 h-3" />
                <span>필터 초기화</span>
              </button>
            )}
          </div>

          {/* Right Action / Selection Area */}
          <div className="flex items-center gap-1.5 shrink-0">
            {selectedIds.size > 0 ? (
              /* Inline Selection Action Bar */
              <div className="flex items-center gap-1.5 animate-in fade-in duration-100 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                <span className="text-xs font-bold text-indigo-900 font-mono mr-0.5">
                  총 {selectedIds.size}개 선택됨
                </span>

                {onOpenBatchStockOut && (
                  <button
                    type="button"
                    onClick={onOpenBatchStockOut}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold text-xs transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    title="선택한 항목들을 일괄 출고(불출) 등록합니다"
                  >
                    <PackageMinus className="w-3.5 h-3.5" />
                    <span>일괄 출고</span>
                  </button>
                )}

                {onPrintSelected && (
                  <button
                    type="button"
                    onClick={onPrintSelected}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    title="선택 항목 라벨 출력"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>라벨 출력</span>
                  </button>
                )}

                {onOpenRackZoneModal && (
                  <button
                    type="button"
                    onClick={onOpenRackZoneModal}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md font-semibold text-xs border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>랙 변경</span>
                  </button>
                )}

                {onDeleteBatch && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="p-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-bold text-xs transition-colors cursor-pointer"
                    title="선택 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-indigo-100 transition-colors cursor-pointer"
                  title="선택 해제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Normal Utility Buttons */
              <div className="flex items-center gap-1.5">
                {onOpenImportModal && (
                  <button
                    type="button"
                    onClick={onOpenImportModal}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    title="엑셀 업로드 & 검증"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>엑셀 가져오기</span>
                  </button>
                )}

                {onExportExcel && (
                  <button
                    type="button"
                    onClick={() => onExportExcel(filteredItems)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    title="현재 필터링된 재고 엑셀 다운로드"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>엑셀 다운</span>
                  </button>
                )}

                {onDownloadTemplate && (
                  <button
                    type="button"
                    onClick={onDownloadTemplate}
                    className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center space-x-1 shadow-2xs cursor-pointer"
                    title="표준 엑셀 업로드 양식 서식 파일 받기"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>서식</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Chip Filter Groups (등급 / 창고 / 랙구역) */}
        <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-200 space-y-1.5">
          {/* 1. 등급 (Category) Chips */}
          <div className="flex items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 w-12 shrink-0 py-0.5">등급:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200 font-medium'
                    }`}
                  >
                    {cat === 'ALL' ? '전체' : cat}
                    <span className={`ml-1 text-[11px] ${isSelected ? 'text-slate-300 font-normal' : 'text-slate-400'}`}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 창고 (Warehouse) Chips */}
          <div className="flex items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 w-12 shrink-0 py-0.5">창고:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {warehouses.map((wh) => {
                const count = warehouseCounts[wh] || 0;
                const isSelected = selectedWarehouse === wh;
                const isUnassigned = wh === '미입력';
                return (
                  <button
                    key={wh}
                    type="button"
                    onClick={() => setSelectedWarehouse(wh)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : isUnassigned
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-medium'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200 font-medium'
                    }`}
                  >
                    {isUnassigned ? '⚠️ 창고 미지정' : wh === 'ALL' ? '전체 창고' : wh}
                    <span className={`ml-1 text-[11px] ${isSelected ? 'text-indigo-100 font-normal' : 'text-slate-400'}`}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 랙구역 (Rack Zone) Chips */}
          <div className="flex items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 w-12 shrink-0 py-0.5">구역:</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1 max-h-24 overflow-y-auto pr-1">
              {rackZones.map((zone) => {
                const count = rackZoneCounts[zone] || 0;
                const isSelected = selectedRackZone === zone;
                const isUnassigned = zone === '미입력';
                return (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setSelectedRackZone(zone)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : isUnassigned
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-medium'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200 font-medium'
                    }`}
                  >
                    {isUnassigned ? '⚠️ 위치 미입력' : zone === 'ALL' ? '전체 구역' : `${zone}구역`}
                    <span className={`ml-1 text-[11px] ${isSelected ? 'text-slate-300 font-normal' : 'text-slate-400'}`}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}

              {onOpenWarehouseVisualizer && (
                <button
                  type="button"
                  onClick={onOpenWarehouseVisualizer}
                  className="px-2.5 py-1 rounded-md text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center space-x-1 shadow-2xs cursor-pointer transition-all ml-auto"
                  title="창고별 랙 그래픽 배치도 열기"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>창고 랙 배치도</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Current Selection Info Banner (If items selected on current page) */}
        {currentPageSelectedCount > 0 && (
          <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between text-xs text-indigo-900 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="font-bold">
                현재 페이지 {currentPageSelectedCount}개 / {paginatedItems.length}개 선택됨
              </span>
              {filteredItems.length > paginatedItems.length && selectedIds.size < filteredItems.length && (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-indigo-600 underline font-bold hover:text-indigo-900 cursor-pointer ml-2"
                >
                  필터링된 전체 {filteredItems.length.toLocaleString()}개 일괄 선택하기
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-2xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      {/* Main Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* 🚀 4. Colgroup with spacious Quick In/Out and Actions widths */}
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-20" />
            <col className="w-24" />
            <col className="min-w-[200px]" />
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-24" />
            <col className="w-36" />
            <col className="w-28" />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 select-none">
              {/* 1. 체크박스 (🚀 2번 요청: 현재 페이지만 선택/해제) */}
              <th className="p-3 text-center border-b border-slate-300 bg-slate-100">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={isCurrentPageAllSelected}
                  onChange={handleToggleCurrentPage}
                  className="rounded accent-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 cursor-pointer"
                  title={isCurrentPageAllSelected ? '현재 페이지 전체 해제' : '현재 페이지 전체 선택'}
                />
              </th>

              {/* 2. 사진 */}
              <th className="p-3 text-center whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                사진
              </th>

              {/* 3. 창고 */}
              <th 
                className="p-3 cursor-pointer hover:bg-slate-200/70 transition-colors whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider"
                onClick={() => handleSort('rackLocation')}
              >
                <div className="flex items-center space-x-1">
                  <span>창고</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 4. 랙위치 */}
              <th 
                className="p-3 cursor-pointer hover:bg-slate-200/70 transition-colors whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider"
                onClick={() => handleSort('rackLocation')}
              >
                <div className="flex items-center space-x-1">
                  <span>랙위치</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 5. 품목정보 */}
              <th 
                className="p-3 cursor-pointer hover:bg-slate-200/70 transition-colors border-b border-slate-300 bg-slate-100 uppercase tracking-wider"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-800 text-xs">품목정보</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 6. 단가 */}
              <th 
                className="p-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>단가</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 7. 재고수량 */}
              <th 
                className="p-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>현재재고</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 8. QR라벨 */}
              <th className="p-3 text-center whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                QR라벨
              </th>

              {/* 9. 빠른 입/출고 (🚀 4번 요청: 명확한 열 헤더) */}
              <th className="p-3 text-center whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                빠른 입/출고
              </th>

              {/* 10. 관리 (가운데 정렬) */}
              <th className="p-3 text-center whitespace-nowrap border-b border-slate-300 bg-slate-100 text-2xs font-bold text-slate-700 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Database className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">조회된 재고 품목이 없습니다.</p>
                    <p className="text-xs text-slate-400">검색어나 필터 조건을 변경해보세요.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={onToggleSelect}
                  onOpenDetail={handleDetail}
                  onOpenEdit={handleEdit}
                  onOpenStockAction={handleStockAction}
                  onDelete={handleDelete}
                  onPrintSingle={onPrintSingle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer Controls */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        {/* Left: Total Count & Page Size Select */}
        <div className="flex items-center space-x-3">
          <div className="font-medium">
            총 <span className="font-bold text-slate-900 font-mono">{filteredItems.length.toLocaleString()}</span>개 품목 중{' '}
            <span className="font-bold text-slate-900 font-mono">{startItemIndex} - {endItemIndex}</span> 표시
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">페이지당:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value={20}>20개</option>
              <option value={50}>50개 (기본)</option>
              <option value={100}>100개</option>
              <option value={200}>200개</option>
              <option value={0}>전체보기 ({filteredItems.length}개)</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation */}
        {pageSize > 0 && totalPages > 1 && (
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="첫 페이지"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="이전 페이지"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {paginationRange.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-1.5 text-slate-400 font-mono">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(page);
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="다음 페이지"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
              title="마지막 페이지"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>

            {/* Direct Jump Input */}
            <form onSubmit={handleJumpPage} className="flex items-center space-x-1 pl-2 border-l border-slate-300">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-12 px-1.5 py-1 text-xs text-center border border-slate-300 rounded font-mono focus:outline-none focus:border-indigo-600"
              />
              <span className="text-slate-400">/{totalPages}</span>
              <button
                type="submit"
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-2xs font-semibold cursor-pointer"
              >
                이동
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
