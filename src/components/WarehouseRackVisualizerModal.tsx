import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Search, 
  Plus, 
  Minus,
  Layers, 
  Box, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Edit3, 
  ChevronRight, 
  Eye, 
  RotateCcw,
  Sparkles,
  PackageCheck,
  Check,
  Package,
  QrCode,
  Printer,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem } from '../types/inventory';
import { parseWarehouseAndRack, cleanSupplierDisplayName } from '../utils/excelHelper';
import { getCategoryBadgeColor } from '../utils/imageUtils';
import { generateRackSlotQRValue } from '../utils/qrHelper';
import { RackSlotLabelPrintModal, RackSlotItem } from './RackSlotLabelPrintModal';

interface WarehouseRackVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onBatchUpdateRackLocation: (itemIds: string[], newLocation: string) => Promise<void> | void;
  onUpdateItemRackLocation: (itemId: string, newLocation: string) => Promise<void> | void;
  onOpenDetailModal?: (item: InventoryItem) => void;
  onOpenStockModal?: (item: InventoryItem, actionType: 'IN' | 'OUT') => void;
}

// 랙 구조 인터페이스
interface RackStructure {
  zone: string;           // e.g. "A", "B", "C", "D"
  warehouse: string;      // e.g. "특장자재창고-화성"
  maxBay: number;         // 가로 열 수 (예: 6열)
  maxLevel: number;       // 세로 단 수 (예: 4단)
}

/**
 * 랙 위치 문자열 파싱 (다양한 패딩 및 정규화 키 생성)
 */
function parseRackSlotTokens(rawRackStr: string): {
  zone: string;
  bay: number;
  level: number;
  keys: string[];
  canonical: string;
} | null {
  if (!rawRackStr || rawRackStr === '미입력' || rawRackStr === '미지정' || rawRackStr === '-') {
    return null;
  }

  const cleanStr = rawRackStr.replace(/\([^\)]*\)/g, '').trim();
  const parts = cleanStr.split(/[-_\s\/]/).filter(Boolean);
  if (parts.length === 0) return null;

  const zone = parts[0].toUpperCase();
  const bay = parts.length >= 2 ? parseInt(parts[1], 10) || 1 : 1;
  const level = parts.length >= 3 ? parseInt(parts[2], 10) || 1 : 1;

  const bay2 = String(bay).padStart(2, '0');
  const level2 = String(level).padStart(2, '0');

  const keys = Array.from(
    new Set([
      `${zone}-${bay2}-${level2}`,
      `${zone}-${bay2}-${level}`,
      `${zone}-${bay}-${level2}`,
      `${zone}-${bay}-${level}`,
      `${zone}${bay2}-${level2}`,
      `${zone}${bay}-${level}`,
      cleanStr,
    ])
  );

  return {
    zone,
    bay,
    level,
    keys,
    canonical: `${zone}-${bay2}-${level2}`,
  };
}

/**
 * 다중 랙 위치 분리 (한 품목이 여러 슬롯에 보관된 경우 완벽 대응)
 */
function extractAllLocations(item: InventoryItem): { warehouse: string; rack: string; slotParsed: ReturnType<typeof parseRackSlotTokens> }[] {
  const locStr = item.rackLocation || '';
  const itemWh = item.warehouse || '';

  if (!locStr || locStr === '미입력' || locStr === '미지정') {
    return [
      {
        warehouse: itemWh || '미지정 창고',
        rack: '미입력',
        slotParsed: null,
      },
    ];
  }

  const subLocations = locStr
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (subLocations.length === 0) {
    const parsed = parseWarehouseAndRack(locStr, itemWh);
    const wh = parsed.isUnassigned || !parsed.warehouse || parsed.warehouse === '-' || parsed.warehouse === '미입력'
      ? '미지정 창고'
      : parsed.warehouse;
    return [
      {
        warehouse: wh,
        rack: parsed.rack,
        slotParsed: parseRackSlotTokens(parsed.rack),
      },
    ];
  }

  return subLocations.map((subLoc) => {
    const parsed = parseWarehouseAndRack(subLoc, itemWh);
    const wh = parsed.isUnassigned || !parsed.warehouse || parsed.warehouse === '-' || parsed.warehouse === '미입력'
      ? '미지정 창고'
      : parsed.warehouse;
    return {
      warehouse: wh,
      rack: parsed.rack,
      slotParsed: parseRackSlotTokens(parsed.rack),
    };
  });
}

export const WarehouseRackVisualizerModal: React.FC<WarehouseRackVisualizerModalProps> = ({
  isOpen,
  onClose,
  items,
  onBatchUpdateRackLocation,
  onUpdateItemRackLocation,
  onOpenDetailModal,
  onOpenStockModal,
}) => {
  // 1. 창고 목록 및 창고별 데이터 그룹핑
  const { warehouses, itemsByWarehouse } = useMemo(() => {
    const whMap: Record<string, InventoryItem[]> = {};

    items.forEach((item) => {
      const locs = extractAllLocations(item);
      locs.forEach((loc) => {
        const wh = loc.warehouse;
        if (!whMap[wh]) {
          whMap[wh] = [];
        }
        if (!whMap[wh].some((it) => it.id === item.id)) {
          whMap[wh].push(item);
        }
      });
    });

    const sortedWhList = Object.keys(whMap).sort((a, b) => {
      if (a === '미지정 창고') return 1;
      if (b === '미지정 창고') return -1;
      return a.localeCompare(b, 'ko');
    });

    return {
      warehouses: sortedWhList.length > 0 ? sortedWhList : ['기본 창고'],
      itemsByWarehouse: whMap,
    };
  }, [items]);

  // Selected Warehouse Tab
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0] || '미지정 창고');

  // Search inside Rack Visualizer (하이라이트 기능)
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Slot for detail slide-over / drawer
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // 🚀 아이디어 1: 스마트 플로팅 퀵 프리뷰 Hover Popover 상태
  const [hoveredSlotInfo, setHoveredSlotInfo] = useState<{
    canonicalSlotCode: string;
    warehouse: string;
    items: InventoryItem[];
    x: number;
    y: number;
  } | null>(null);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Single Slot QR Modal State
  const [qrModalSlot, setQrModalSlot] = useState<{ warehouse: string; slotCode: string } | null>(null);

  // Batch Slot QR Label Print Modal State (요청 3)
  const [isBatchSlotPrintOpen, setIsBatchSlotPrintOpen] = useState(false);

  // 랙별 열/단 커스텀 설정 State
  const [customRackSizes, setCustomRackSizes] = useState<Record<string, { maxBay: number; maxLevel: number }>>({});

  // Quick Move Item state
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [targetSlotInput, setTargetSlotInput] = useState<string>('');

  // Unassigned Items drawer
  const [showUnassignedDrawer, setShowUnassignedDrawer] = useState<boolean>(false);
  const [selectedUnassignedItemIds, setSelectedUnassignedItemIds] = useState<string[]>([]);
  const [batchTargetLocation, setBatchTargetLocation] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync selected warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !warehouses.includes(selectedWarehouse)) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse]);

  // Current Warehouse Items
  const currentWarehouseItems = useMemo(() => {
    return itemsByWarehouse[selectedWarehouse] || [];
  }, [itemsByWarehouse, selectedWarehouse]);

  // Group items by rack location in current warehouse
  const { slotItemsMap, rackZonesData, unassignedInCurrentWh } = useMemo(() => {
    const slotMap: Record<string, InventoryItem[]> = {};
    const zoneBayMax: Record<string, number> = {};
    const zoneLevelMax: Record<string, number> = {};
    const zonesSet = new Set<string>();
    const unassignedList: InventoryItem[] = [];

    currentWarehouseItems.forEach((item) => {
      const locs = extractAllLocations(item);
      let matchedInThisWh = false;

      locs.forEach((loc) => {
        if (loc.warehouse === selectedWarehouse) {
          if (!loc.slotParsed) {
            matchedInThisWh = true;
            if (!unassignedList.some((it) => it.id === item.id)) {
              unassignedList.push(item);
            }
            return;
          }

          matchedInThisWh = true;
          const { zone, bay, level, keys } = loc.slotParsed;
          zonesSet.add(zone);

          zoneBayMax[zone] = Math.max(zoneBayMax[zone] || 4, bay);
          zoneLevelMax[zone] = Math.max(zoneLevelMax[zone] || 3, level);

          keys.forEach((k) => {
            if (!slotMap[k]) {
              slotMap[k] = [];
            }
            if (!slotMap[k].some((it) => it.id === item.id)) {
              slotMap[k].push(item);
            }
          });
        }
      });

      if (!matchedInThisWh && !unassignedList.some((it) => it.id === item.id)) {
        unassignedList.push(item);
      }
    });

    if (zonesSet.size === 0) {
      zonesSet.add('A');
      zonesSet.add('B');
      zoneBayMax['A'] = 4;
      zoneLevelMax['A'] = 3;
      zoneBayMax['B'] = 4;
      zoneLevelMax['B'] = 3;
    }

    const zonesList = Array.from(zonesSet).sort((a, b) => a.localeCompare(b, 'ko', { numeric: true }));

    const zoneStructures: RackStructure[] = zonesList.map((z) => {
      const custom = customRackSizes[`${selectedWarehouse}_${z}`];
      return {
        zone: z,
        warehouse: selectedWarehouse,
        maxBay: custom ? custom.maxBay : Math.max(zoneBayMax[z] || 4, 4),
        maxLevel: custom ? custom.maxLevel : Math.max(zoneLevelMax[z] || 3, 3),
      };
    });

    return {
      slotItemsMap: slotMap,
      rackZonesData: zoneStructures,
      unassignedInCurrentWh: unassignedList,
    };
  }, [currentWarehouseItems, selectedWarehouse, customRackSizes]);

  // Helper to find items for any slot code format
  const getItemsForSlot = (zone: string, bayNum: number, levelNum: number): InventoryItem[] => {
    const bay2 = String(bayNum).padStart(2, '0');
    const level2 = String(levelNum).padStart(2, '0');

    const candidateKeys = [
      `${zone}-${bay2}-${level2}`,
      `${zone}-${bay2}-${levelNum}`,
      `${zone}-${bayNum}-${level2}`,
      `${zone}-${bayNum}-${levelNum}`,
      `${zone}${bay2}-${level2}`,
      `${zone}${bayNum}-${levelNum}`,
    ];

    for (const key of candidateKeys) {
      if (slotItemsMap[key] && slotItemsMap[key].length > 0) {
        return slotItemsMap[key];
      }
    }
    return [];
  };

  // Search filter matches
  const matchedSlotIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.trim().toLowerCase();
    const set = new Set<string>();

    (Object.entries(slotItemsMap) as [string, InventoryItem[]][]).forEach(([slotId, slotItems]) => {
      if (slotId.toLowerCase().includes(q)) {
        set.add(slotId);
        return;
      }
      const hasMatch = slotItems.some(
        (it) =>
          it.code.toLowerCase().includes(q) ||
          it.name.toLowerCase().includes(q) ||
          (it.spec && it.spec.toLowerCase().includes(q)) ||
          (it.supplier && it.supplier.toLowerCase().includes(q)) ||
          (it.category && it.category.toLowerCase().includes(q))
      );
      if (hasMatch) {
        set.add(slotId);
      }
    });

    return set;
  }, [slotItemsMap, searchQuery]);

  const isSlotMatched = (zone: string, bayNum: number, levelNum: number): boolean => {
    const bay2 = String(bayNum).padStart(2, '0');
    const level2 = String(levelNum).padStart(2, '0');

    const candidateKeys = [
      `${zone}-${bay2}-${level2}`,
      `${zone}-${bay2}-${levelNum}`,
      `${zone}-${bayNum}-${level2}`,
      `${zone}-${bayNum}-${levelNum}`,
      `${zone}${bay2}-${level2}`,
      `${zone}${bayNum}-${levelNum}`,
    ];

    return candidateKeys.some((k) => matchedSlotIds.has(k));
  };

  // 🚀 Generate all Rack Slot Items for Batch Printing (요청 3)
  const allCurrentRackSlotItems = useMemo<RackSlotItem[]>(() => {
    const list: RackSlotItem[] = [];

    rackZonesData.forEach((rack) => {
      for (let level = rack.maxLevel; level >= 1; level--) {
        for (let bay = 1; bay <= rack.maxBay; bay++) {
          const bayStr = String(bay).padStart(2, '0');
          const levelStr = String(level).padStart(2, '0');
          const slotCode = `${rack.zone}-${bayStr}-${levelStr}`;
          const slotItems = getItemsForSlot(rack.zone, bay, level);

          list.push({
            warehouse: selectedWarehouse,
            zone: rack.zone,
            slotCode,
            itemCount: slotItems.length,
            totalQty: slotItems.reduce((sum, it) => sum + (it.quantity || 0), 0),
          });
        }
      }
    });

    return list;
  }, [rackZonesData, selectedWarehouse, slotItemsMap]);

  // Update Rack Bay/Level Size
  const handleUpdateRackDimension = (zone: string, deltaBay: number, deltaLevel: number) => {
    const key = `${selectedWarehouse}_${zone}`;
    const current = customRackSizes[key] || {
      maxBay: rackZonesData.find((r) => r.zone === zone)?.maxBay || 4,
      maxLevel: rackZonesData.find((r) => r.zone === zone)?.maxLevel || 3,
    };

    const newBay = Math.max(1, Math.min(12, current.maxBay + deltaBay));
    const newLevel = Math.max(1, Math.min(8, current.maxLevel + deltaLevel));

    setCustomRackSizes((prev) => ({
      ...prev,
      [key]: { maxBay: newBay, maxLevel: newLevel },
    }));
  };

  // Quick Move Item
  const handleExecuteMove = async (itemId: string, newLocation: string) => {
    if (!newLocation.trim()) {
      alert('이동할 랙 위치(예: D-06-03)를 입력해주세요.');
      return;
    }
    const finalLoc = `${selectedWarehouse === '미지정 창고' ? '' : selectedWarehouse + ' '}${newLocation.trim()}`;
    await onUpdateItemRackLocation(itemId, finalLoc);
    showToast(`품목 위치가 '${newLocation.trim()}'(으)로 이동되었습니다.`);
    setMovingItemId(null);
    setTargetSlotInput('');
  };

  // Batch Assign for unassigned items
  const handleExecuteBatchAssign = async () => {
    if (selectedUnassignedItemIds.length === 0) {
      alert('배치할 품목을 1개 이상 선택해주세요.');
      return;
    }
    if (!batchTargetLocation.trim()) {
      alert('배치할 랙 위치(예: D-06-03)를 입력해주세요.');
      return;
    }
    const finalLoc = `${selectedWarehouse === '미지정 창고' ? '' : selectedWarehouse + ' '}${batchTargetLocation.trim()}`;
    await onBatchUpdateRackLocation(selectedUnassignedItemIds, finalLoc);
    showToast(`${selectedUnassignedItemIds.length}개 품목이 '${batchTargetLocation.trim()}'에 일괄 배치되었습니다.`);
    setSelectedUnassignedItemIds([]);
    setBatchTargetLocation('');
    setShowUnassignedDrawer(false);
  };

  // 🚀 Hover handlers for Smart Floating Preview
  const handleSlotMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    canonicalSlotCode: string,
    slotItems: InventoryItem[]
  ) => {
    if (slotItems.length === 0) {
      setHoveredSlotInfo(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    
    setHoveredSlotInfo({
      canonicalSlotCode,
      warehouse: selectedWarehouse,
      items: slotItems,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleSlotMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredSlotInfo(null);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-xs">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-7xl w-full h-[95vh] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* 1. TOP HEADER */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  스마트 랙 시각화 배치도
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    Rack Visualizer
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                슬롯에 마우스를 올리면 품목 정보가 즉시 표시되며, 클릭 시 상세 작업창이 열립니다
              </p>
            </div>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="코드, 품명, 위치 검색..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-800 text-white placeholder:text-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 🚀 랙 슬롯 QR 라벨 일괄 인쇄 버튼 (요청 3) */}
            <button
              type="button"
              onClick={() => setIsBatchSlotPrintOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all shrink-0"
              title="A4 규격 스티커 라벨지로 전체 슬롯 QR 바코드 일괄 인쇄"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>QR 라벨 일괄인쇄</span>
            </button>

            {/* Unassigned Items Button */}
            <button
              type="button"
              onClick={() => setShowUnassignedDrawer(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
                unassignedInCurrentWh.length > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>미배치 ({unassignedInCurrentWh.length})</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. STATS & LEGEND BAR */}
        <div className="px-5 py-2.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Warehouse Selection Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto py-0.5 max-w-full">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
              <Building2 className="w-4 h-4 text-indigo-400" />
              창고:
            </span>
            <div className="flex items-center space-x-2">
              {warehouses.map((wh) => {
                const count = itemsByWarehouse[wh]?.length || 0;
                const isSelected = selectedWarehouse === wh;
                const isUnassigned = wh === '미지정 창고';

                return (
                  <button
                    key={wh}
                    type="button"
                    onClick={() => {
                      setSelectedWarehouse(wh);
                      setSelectedSlot(null);
                      setHoveredSlotInfo(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold border border-indigo-400'
                        : isUnassigned
                        ? 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/60 border border-amber-700/50'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>{isUnassigned ? '⚠️ 미지정' : wh}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : isUnassigned
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Independent Legend Frame */}
          <div className="flex items-center space-x-3 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 shrink-0 font-medium">
            <span className="font-bold text-slate-400">범례:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block shadow-xs"></span>
              <span>적재 정상</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block shadow-xs"></span>
              <span>재고 부족</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block shadow-xs"></span>
              <span>검색 일치</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 border border-slate-600 inline-block"></span>
              <span>빈 슬롯</span>
            </div>
          </div>
        </div>

        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="mx-6 mt-2.5 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 3. MAIN VISUALIZER WORKSPACE (2열 100% 핏 그리드) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* RACK ZONES GRID (A랙, B랙, C랙...) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {rackZonesData.map((rack) => {
              return (
                <div 
                  key={rack.zone}
                  className="bg-slate-850 rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg flex flex-col"
                >
                  {/* Rack Header */}
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-xs shrink-0">
                        {rack.zone}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm sm:text-base text-white truncate">
                            {rack.zone} 랙
                          </span>
                          <span className="text-xs text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-800/60 font-mono font-semibold">
                            {rack.maxBay}열 × {rack.maxLevel}단 ({rack.maxBay * rack.maxLevel}칸)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 열/단 조절 컨트롤러 */}
                    <div className="flex items-center space-x-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-xs shrink-0">
                      {/* Bay Controls */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-300 font-bold text-xs">열:</span>
                        <span className="font-extrabold font-mono text-white w-4 text-center text-xs sm:text-sm">{rack.maxBay}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRackDimension(rack.zone, -1, 0)}
                          disabled={rack.maxBay <= 1}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white flex items-center justify-center font-bold cursor-pointer text-xs"
                          title="열 줄이기"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRackDimension(rack.zone, 1, 0)}
                          disabled={rack.maxBay >= 12}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white flex items-center justify-center font-bold cursor-pointer text-xs"
                          title="열 늘리기"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-px h-3.5 bg-slate-700"></div>

                      {/* Level Controls */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-300 font-bold text-xs">단:</span>
                        <span className="font-extrabold font-mono text-white w-4 text-center text-xs sm:text-sm">{rack.maxLevel}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRackDimension(rack.zone, 0, -1)}
                          disabled={rack.maxLevel <= 1}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white flex items-center justify-center font-bold cursor-pointer text-xs"
                          title="단 줄이기"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRackDimension(rack.zone, 0, 1)}
                          disabled={rack.maxLevel >= 8}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white flex items-center justify-center font-bold cursor-pointer text-xs"
                          title="단 늘리기"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🚀 랙 선반 스마트 히트맵 타일 렌더링 (아이디어 1: 100% 핏 & 절대 깨짐 없음) */}
                  <div className="p-3.5 bg-slate-900/60 flex-1 flex flex-col justify-end space-y-2.5">
                    {Array.from({ length: rack.maxLevel }, (_, levelIdx) => {
                      const levelNum = rack.maxLevel - levelIdx;
                      const levelStr = String(levelNum).padStart(2, '0');

                      return (
                        <div key={levelNum} className="space-y-1.5">
                          {/* Level indicator & Shelf Line */}
                          <div className="flex items-center space-x-2">
                            <span className="w-8 text-xs sm:text-sm font-mono font-extrabold text-slate-300 text-right shrink-0">
                              {levelNum}단
                            </span>
                            
                            {/* Slots in this Level (🚀 100% 너비 핏 & 스마트 히트맵 셀) */}
                            <div 
                              className="grid gap-1.5 flex-1 w-full" 
                              style={{ gridTemplateColumns: `repeat(${rack.maxBay}, minmax(0, 1fr))` }}
                            >
                              {Array.from({ length: rack.maxBay }, (_, bayIdx) => {
                                const bayNum = bayIdx + 1;
                                const bayStr = String(bayNum).padStart(2, '0');
                                const canonicalSlotCode = `${rack.zone}-${bayStr}-${levelStr}`;
                                
                                const slotItems = getItemsForSlot(rack.zone, bayNum, levelNum);
                                const itemCount = slotItems.length;
                                const totalQty = slotItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
                                const hasLowStock = slotItems.some((it) => it.quantity <= (it.safetyStock || 0));
                                
                                const isMatchedBySearch = isSlotMatched(rack.zone, bayNum, levelNum);
                                const isSelected = selectedSlot === canonicalSlotCode;

                                return (
                                  <div
                                    key={canonicalSlotCode}
                                    onClick={() => setSelectedSlot(canonicalSlotCode)}
                                    onMouseEnter={(e) => handleSlotMouseEnter(e, canonicalSlotCode, slotItems)}
                                    onMouseLeave={handleSlotMouseLeave}
                                    className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer select-none group flex flex-col justify-between h-[64px] ${
                                      isSelected
                                        ? 'bg-indigo-600/40 border-indigo-400 ring-2 ring-indigo-400 shadow-lg'
                                        : isMatchedBySearch
                                        ? 'bg-amber-500/35 border-amber-400 ring-2 ring-amber-400 shadow-lg shadow-amber-500/30 animate-pulse'
                                        : itemCount > 0
                                        ? hasLowStock
                                          ? 'bg-rose-950/50 border-rose-600/80 hover:border-rose-300 hover:bg-rose-900/60 shadow-xs'
                                          : 'bg-indigo-950/50 border-indigo-600/80 hover:border-indigo-300 hover:bg-indigo-900/60 shadow-xs'
                                        : 'bg-slate-800/40 border-slate-700/60 border-dashed hover:border-slate-500 hover:bg-slate-800/70'
                                    }`}
                                  >
                                    {/* Slot Header: Bay No & QR button */}
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-mono font-bold text-slate-300 group-hover:text-white text-[11px] sm:text-xs">
                                        {bayStr}열
                                      </span>
                                      
                                      {itemCount > 0 && (
                                        <span
                                          className={`text-[10px] sm:text-xs font-extrabold px-1.5 py-0.2 rounded-md font-mono shrink-0 shadow-2xs ${
                                            hasLowStock
                                              ? 'bg-rose-600 text-white'
                                              : 'bg-indigo-600 text-white'
                                          }`}
                                        >
                                          {itemCount}건
                                        </span>
                                      )}
                                    </div>

                                    {/* Slot Body: Total Quantity or Empty */}
                                    <div className="text-center my-auto">
                                      {itemCount > 0 ? (
                                        <div className="flex flex-col items-center justify-center">
                                          <span className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${hasLowStock ? 'text-rose-300' : 'text-slate-100'}`}>
                                            {totalQty.toLocaleString()}
                                            <span className="text-[10px] font-normal text-slate-400 ml-0.5">EA</span>
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-500 font-medium">
                                          빈 슬롯
                                        </span>
                                      )}
                                    </div>

                                    {/* Search Match Neon Pin */}
                                    {isMatchedBySearch && (
                                      <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-extrabold rounded-full shadow-md animate-bounce">
                                        일치
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Industrial Metal Shelf Beam */}
                          <div className="h-1.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full shadow-inner ml-9"></div>
                        </div>
                      );
                    })}

                    {/* Shelf Base Frame Legs */}
                    <div className="flex justify-between px-12 pt-0.5 text-slate-600">
                      <div className="w-3 h-2 bg-slate-700 rounded-b"></div>
                      <div className="w-3 h-2 bg-slate-700 rounded-b"></div>
                      <div className="w-3 h-2 bg-slate-700 rounded-b"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* 🚀 4. SMART FLOATING QUICK PREVIEW POPOVER (아이디어 1: 마우스 오버 시 시원하고 정밀한 정보 표시) */}
        {hoveredSlotInfo && (
          <div
            onMouseEnter={() => {
              if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            }}
            onMouseLeave={() => {
              setHoveredSlotInfo(null);
            }}
            className="fixed z-55 pointer-events-auto w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-indigo-500/40 text-white animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: Math.max(16, Math.min(window.innerWidth - 340, hoveredSlotInfo.x - 160)),
              top: Math.max(60, hoveredSlotInfo.y > 280 ? hoveredSlotInfo.y - 230 : hoveredSlotInfo.y + 70),
            }}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="font-mono font-extrabold text-sm text-indigo-300">
                    {hoveredSlotInfo.canonicalSlotCode}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {hoveredSlotInfo.warehouse}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                {hoveredSlotInfo.items.length}개 품목
              </span>
            </div>

            {/* Items Preview List (Max 2 items) */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {hoveredSlotInfo.items.slice(0, 2).map((it) => {
                const isLow = it.quantity <= (it.safetyStock || 0);
                return (
                  <div key={it.id} className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1 py-0.2 rounded">
                        {it.code}
                      </span>
                      <span className={`font-mono font-extrabold text-xs ${isLow ? 'text-rose-400' : 'text-white'}`}>
                        {it.quantity.toLocaleString()} {it.unit}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-100 truncate" title={it.name}>
                      {it.name}
                    </p>
                    {it.spec && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {it.spec}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Extra items notice */}
            {hoveredSlotInfo.items.length > 2 && (
              <p className="text-[10px] text-indigo-300 text-center font-semibold pt-1">
                + 외 {hoveredSlotInfo.items.length - 2}개 품목 더 있음 (클릭 시 전체보기)
              </p>
            )}

            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
              💡 슬롯을 클릭하면 위치 이동/출고 관리창이 열립니다
            </div>
          </div>
        )}

        {/* 5. SELECTED SLOT DETAIL DRAWER (클릭 시 우측에서 슬라이드 오픈) */}
        {selectedSlot && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="font-mono text-indigo-400 text-base">{selectedSlot}</span>
                    <span className="text-2xs text-slate-400">보관 품목 목록</span>
                  </h3>
                  <p className="text-2xs text-slate-400">
                    {selectedWarehouse} / {(slotItemsMap[selectedSlot] || []).length}개 품목 보관 중
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setQrModalSlot({ warehouse: selectedWarehouse, slotCode: selectedSlot })}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-700 cursor-pointer"
                  title="슬롯 QR 코드 인쇄"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>QR 출력</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items List in this Slot */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {(slotItemsMap[selectedSlot] || []).length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Box className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">이 슬롯에 보관 중인 품목이 없습니다.</p>
                  <p className="text-2xs text-slate-500">
                    미배치 품목을 이 슬롯으로 할당하거나, 품목 수정 화면에서 위치를 지정하세요.
                  </p>
                </div>
              ) : (
                (slotItemsMap[selectedSlot] || []).map((item) => {
                  const isLowStock = item.quantity <= (item.safetyStock || 0);
                  const isMovingThis = movingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2.5 hover:border-slate-600 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/50">
                              {item.code}
                            </span>
                            <span className="text-2xs px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-semibold">
                              {item.category || '일반'}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white leading-snug">
                            {item.name}
                          </h5>
                          {item.spec && (
                            <p className="text-2xs text-slate-400">
                              규격: {item.spec}
                            </p>
                          )}
                          <p className="text-2xs text-slate-400">
                            전체 등록 위치: <span className="text-indigo-300 font-mono">{item.rackLocation || '미입력'}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold font-mono ${isLowStock ? 'text-rose-400' : 'text-white'}`}>
                            {item.quantity.toLocaleString()} {item.unit}
                          </span>
                          {isLowStock && (
                            <div className="text-[10px] text-rose-400 font-bold">
                              ⚠️ 재고부족
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                        {isMovingThis ? (
                          <div className="flex items-center space-x-1.5 w-full">
                            <input
                              type="text"
                              value={targetSlotInput}
                              onChange={(e) => setTargetSlotInput(e.target.value)}
                              placeholder="새 위치 (예: D-06-03)"
                              className="px-2 py-1 text-xs bg-slate-900 text-white rounded border border-indigo-500 focus:outline-none flex-1 font-mono"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleExecuteMove(item.id, targetSlotInput)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded cursor-pointer"
                            >
                              이동
                            </button>
                            <button
                              type="button"
                              onClick={() => setMovingItemId(null)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMovingItemId(item.id);
                                setTargetSlotInput(selectedSlot || '');
                              }}
                              className="text-2xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 hover:underline cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>다른 랙으로 위치 변경</span>
                            </button>

                            <div className="flex items-center space-x-1">
                              {onOpenDetailModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenDetailModal(item)}
                                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                                  title="상세보기"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onOpenStockModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenStockModal(item, 'OUT')}
                                  className="px-2 py-0.5 text-2xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded border border-rose-800/40 cursor-pointer"
                                  title="출고"
                                >
                                  출고
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 6. UNASSIGNED ITEMS BATCH ALLOCATOR DRAWER */}
        {showUnassignedDrawer && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/30 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    랙 위치 미배치 품목 ({unassignedInCurrentWh.length}건)
                  </h3>
                  <p className="text-2xs text-slate-400">
                    품목을 선택하여 원하는 랙 위치로 한 번에 배치합니다
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnassignedDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Batch Destination Input */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  선택된 품목: {selectedUnassignedItemIds.length}개
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedUnassignedItemIds.length === unassignedInCurrentWh.length) {
                      setSelectedUnassignedItemIds([]);
                    } else {
                      setSelectedUnassignedItemIds(unassignedInCurrentWh.map((it) => it.id));
                    }
                  }}
                  className="text-2xs text-indigo-400 hover:underline cursor-pointer"
                >
                  {selectedUnassignedItemIds.length === unassignedInCurrentWh.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={batchTargetLocation}
                  onChange={(e) => setBatchTargetLocation(e.target.value)}
                  placeholder="배치할 랙 위치 입력 (예: D-06-03)"
                  className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={handleExecuteBatchAssign}
                  disabled={selectedUnassignedItemIds.length === 0 || !batchTargetLocation.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0"
                >
                  일괄 배치
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {unassignedInCurrentWh.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <PackageCheck className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="text-xs font-semibold text-slate-300">모든 품목이 랙에 정상 배치되었습니다!</p>
                </div>
              ) : (
                unassignedInCurrentWh.map((item) => {
                  const isChecked = selectedUnassignedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedUnassignedItemIds((prev) =>
                          prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        );
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded accent-indigo-600 h-4 w-4"
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-2xs font-bold text-indigo-400">
                              {item.code}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {item.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                        {item.quantity.toLocaleString()} {item.unit}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 7. SINGLE SLOT QR MODAL */}
        {qrModalSlot && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">랙 슬롯 QR 라벨</h4>
                    <p className="text-2xs text-slate-500">{qrModalSlot.warehouse}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalSlot(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div id="slot-qr-printable" className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-center space-y-3">
                <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                  SMART RACK LOCATION
                </div>
                <div className="font-mono font-extrabold text-2xl text-indigo-700 tracking-tight">
                  {qrModalSlot.slotCode}
                </div>
                
                <div className="flex justify-center py-2">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 inline-block">
                    <QRCodeSVG
                      value={generateRackSlotQRValue(qrModalSlot.warehouse, qrModalSlot.slotCode)}
                      size={160}
                      level="H"
                    />
                  </div>
                </div>

                <div className="text-2xs text-slate-500 font-mono">
                  {qrModalSlot.warehouse}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>라벨 인쇄하기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalSlot(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. BATCH SLOT QR LABEL PRINT MODAL */}
        {isBatchSlotPrintOpen && (
          <RackSlotLabelPrintModal
            isOpen={isBatchSlotPrintOpen}
            onClose={() => setIsBatchSlotPrintOpen(false)}
            warehouse={selectedWarehouse}
            slots={allCurrentRackSlotItems}
          />
        )}

      </div>
    </div>
  );
};
