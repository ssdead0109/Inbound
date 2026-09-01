import React, { useState, useMemo, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { 
  X, 
  Printer, 
  Settings, 
  Layers, 
  Eye, 
  LayoutGrid, 
  Check, 
  Plus, 
  Minus, 
  Sliders, 
  Info, 
  ChevronDown, 
  ChevronRight, 
  CircleDot,
  Building,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem, LabelPrintConfig, LabelPreset } from '../types/inventory';
import { DEFAULT_LABEL_CONFIG, saveLabelConfig } from '../utils/storage';
import { ALL_LABEL_PRESETS, findPresetById, getPresetGroups } from '../utils/labelPresets';
import { getCategoryBadgeColor } from '../utils/imageUtils';
import { cleanSupplierDisplayName } from '../utils/excelHelper';
import { generateItemQRValue } from '../utils/qrHelper';

interface LabelPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  initialConfig?: LabelPrintConfig;
  onSaveConfig?: (config: LabelPrintConfig) => void;
  onPrinted?: (items: InventoryItem[]) => void;
  onUpdatePrintCount?: (id: string, delta: number) => void;
}

// 🛡️ Safe card wrapper to prevent any render crash
const SafeAdaptiveLabelCard: React.FC<AdaptiveLabelCardProps> = (props) => {
  try {
    return <AdaptiveLabelCard {...props} />;
  } catch (err: any) {
    console.error('Render error in AdaptiveLabelCard:', err);
    return null;
  }
};

// 🚀 Adaptive Label Card: Optimized layout without warehouse/rack info & label size text
interface AdaptiveLabelCardProps {
  item: InventoryItem;
  config: LabelPrintConfig;
  labelIdx: number;
  shape?: 'rectangle' | 'circle';
}

const AdaptiveLabelCard: React.FC<AdaptiveLabelCardProps> = ({ item, config, labelIdx, shape = 'rectangle' }) => {
  if (!item) return null;

  const qrValue = generateItemQRValue(item);
  const catBadge = getCategoryBadgeColor(item.category || '일반') || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  };
  const cleanSupplier = cleanSupplierDisplayName(item.supplier);
  const printDateStr = new Date().toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  const widthMm = config.widthMm || 63.5;
  const heightMm = config.heightMm || 33.9;
  const isCircle = shape === 'circle';
  const showCompany = Boolean(config.showCompanyName);
  const companyNameText = (config.companyName || 'SMART RACK').trim();

  // Determine layout mode based on height
  const isLarge = heightMm >= 75;                           // Mode 1: 1칸, 2칸 (대형)
  const isMedium = heightMm >= 30 && heightMm < 75;         // Mode 2: 4~24칸, 80x60mm
  const isSmall = heightMm >= 15 && heightMm < 30;          // Mode 3: 40~65칸
  const isMicro = heightMm < 15;                            // Mode 4: 81~189칸 (초슬림 10~14mm)

  // Cut corner guides
  const renderCutGuides = () => {
    if (!config.showBorderCutGuide || isCircle) return null;
    return (
      <>
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-slate-600 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-slate-600 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-600 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-slate-600 pointer-events-none" />
      </>
    );
  };

  // ==========================================
  // MODE CIRCLE: 원형 라벨 (예: 폼텍 3640 원형 63.5mm)
  // ==========================================
  if (isCircle) {
    const qrSize = Math.max(32, Math.min(50, Math.floor(heightMm * 0.44)));
    return (
      <div
        className={`relative overflow-hidden bg-white text-slate-900 rounded-full flex flex-col items-center justify-between p-3 text-center select-none ${
          config.showBorderCutGuide ? 'border-2 border-slate-400 border-dashed' : 'border border-slate-200'
        }`}
        style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, boxSizing: 'border-box' }}
      >
        {/* Top: Code & Category */}
        <div className="flex items-center justify-center space-x-1 shrink-0 mt-0.5">
          <span className="text-[8.5px] font-black font-mono bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-2xs">
            {item.code || '-'}
          </span>
        </div>

        {/* Center: QR Code */}
        <div className="my-auto p-1 bg-white rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center shrink-0">
          <QRCodeSVG value={qrValue} size={qrSize} level="M" marginSize={0} />
        </div>

        {/* Bottom: Name & Spec */}
        <div className="w-full shrink-0 mb-0.5 space-y-0.5">
          <div className="text-[10.5px] font-black text-slate-950 truncate max-w-[135px] mx-auto leading-tight" title={item.name}>
            {item.name || '-'}
          </div>
          {item.spec && (
            <div className="text-[8px] text-slate-500 truncate max-w-[120px] mx-auto">
              {item.spec}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 1: 대형 라벨 (1칸 3130/V3110, 2칸 3120/V3120 등)
  // ==========================================
  if (isLarge) {
    return (
      <div
        className={`relative overflow-hidden bg-white text-slate-900 flex flex-col justify-between p-4 select-none ${
          config.showBorderCutGuide ? 'border border-slate-400 border-dashed' : 'border border-slate-200'
        }`}
        style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, boxSizing: 'border-box' }}
      >
        {renderCutGuides()}

        {/* Top Header (Optional Company Name) */}
        {showCompany && (
          <div className="flex items-center justify-between border-b-2 border-slate-300 pb-1.5 mb-2">
            <span className="text-sm font-black tracking-wider text-indigo-900 uppercase">
              {companyNameText}
            </span>
          </div>
        )}

        {/* Code & Category Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between shadow-sm">
          <div className="text-lg font-black font-mono tracking-tight">{item.code || '-'}</div>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
            {item.category || '일반'}
          </span>
        </div>

        {/* Body: Large QR + Item Info */}
        <div className="flex items-start space-x-6 flex-1 my-3">
          <div className="p-3 bg-white rounded-xl border-2 border-slate-300 flex flex-col items-center justify-center shadow-sm shrink-0">
            <QRCodeSVG value={qrValue} size={Math.min(130, heightMm * 1.5)} level="M" />
            <span className="text-[10px] font-bold text-indigo-700 mt-1">스캔하여 모바일 입출고</span>
          </div>

          <div className="flex-1 space-y-2.5">
            <h2 className="text-2xl font-black text-slate-950 leading-snug break-words">{item.name || '-'}</h2>
            {item.spec && (
              <div className="text-sm font-extrabold text-slate-800 bg-slate-100 p-2 rounded border border-slate-200">
                규격: {item.spec}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div><span className="text-slate-400">현재재고:</span> <span className="font-bold text-slate-900">{item.quantity ?? 0} {item.unit || 'EA'}</span></div>
              <div><span className="text-slate-400">안전재고:</span> <span className="font-bold text-slate-900">{item.safetyStock ?? 0} {item.unit || 'EA'}</span></div>
              {config.showSupplier && cleanSupplier && (
                <div className="col-span-2"><span className="text-slate-400">공급처:</span> <span className="font-semibold text-slate-800">{cleanSupplier}</span></div>
              )}
            </div>
            {config.showNotes && item.notes && (
              <div className="text-xs text-slate-700 bg-amber-50 p-2 rounded border border-amber-200">
                <span className="font-bold text-amber-900">비고: </span>{item.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-1.5">
          <span>SmartRack Inventory System</span>
          {config.showDate && <span>출력일자: {printDateStr}</span>}
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 2: 중형 라벨 (4~24칸, 63.5×33.9mm V3310 등)
  // ==========================================
  if (isMedium) {
    const qrSize = Math.max(38, Math.min(64, Math.floor(heightMm * 0.94)));

    return (
      <div
        className={`relative overflow-hidden bg-white text-slate-900 flex flex-col justify-between p-1.5 select-none ${
          config.showBorderCutGuide ? 'border border-slate-400 border-dashed' : 'border border-slate-200'
        }`}
        style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, boxSizing: 'border-box' }}
      >
        {renderCutGuides()}

        {/* Optional Header (Company Name) */}
        {showCompany && (
          <div className="flex items-center justify-start border-b border-slate-200 pb-0.5 shrink-0 mb-0.5">
            <span className="text-[8px] font-bold tracking-wider text-slate-600 uppercase truncate max-w-full">
              {companyNameText}
            </span>
          </div>
        )}

        {/* 1. Item Code Bar */}
        <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shrink-0 mb-0.5">
          <span className="text-[9px] font-black font-mono text-slate-950 truncate max-w-[130px]">
            {item.code || '-'}
          </span>
          <span className={`text-[7px] font-extrabold px-1.5 py-0.1 rounded border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
            {item.category || '일반'}
          </span>
        </div>

        {/* 2. QR + Name & Details */}
        <div className="flex items-stretch space-x-1.5 flex-1 min-h-0">
          <div className="shrink-0 bg-white p-0.5 rounded border border-slate-300 flex flex-col items-center justify-center shadow-2xs">
            <QRCodeSVG value={qrValue} size={qrSize} level="M" marginSize={0} />
            <span className="text-[6px] font-bold text-indigo-700 mt-0.5 tracking-tighter">
              QR 스캔
            </span>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0">
            <div className="space-y-0.5 min-h-0">
              <div className="text-[13px] leading-[1.2] font-black text-slate-950 line-clamp-2 tracking-tight break-words">
                {item.name || '-'}
              </div>
              {item.spec && (
                <div className="text-[10px] font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-slate-200/90 break-words whitespace-normal line-clamp-1">
                  {item.spec}
                </div>
              )}
              {config.showNotes && item.notes && (
                <div className="text-[7.5px] text-slate-700 bg-amber-50/80 border border-amber-200/80 rounded px-1 py-0.2 break-words line-clamp-1">
                  <span className="font-bold text-amber-900 mr-0.5">비고:</span>{item.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[7.5px] border-t border-slate-200 pt-0.5 mt-0.5">
              <div>
                <span className="text-slate-400">안전재고:</span> <span className="font-bold text-slate-800">{item.safetyStock ?? 0} {item.unit || 'EA'}</span>
              </div>
              {config.showSupplier && cleanSupplier ? (
                <div className="truncate max-w-[100px] text-right">
                  <span className="text-slate-600 font-medium">{cleanSupplier}</span>
                </div>
              ) : (
                <div className="text-right text-slate-400 font-mono">{item.unit || 'EA'}</div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Footer (Date only, No label size text) */}
        {config.showDate && (
          <div className="flex items-center justify-end text-[6.5px] text-slate-400 border-t border-slate-100 pt-0.2 shrink-0 mt-0.5">
            <span className="font-mono">{printDateStr}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // MODE 3: 소형 라벨 (40~65칸, 높이 15~29mm)
  // ==========================================
  if (isSmall) {
    const qrSize = Math.max(28, Math.min(38, Math.floor(heightMm * 0.84)));
    return (
      <div
        className={`relative overflow-hidden bg-white text-slate-900 flex items-center justify-between p-1 select-none ${
          config.showBorderCutGuide ? 'border border-slate-400 border-dashed' : 'border border-slate-200'
        }`}
        style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, boxSizing: 'border-box' }}
      >
        {renderCutGuides()}

        {/* Left: Mini QR */}
        <div className="shrink-0 bg-white p-0.5 rounded border border-slate-300 flex items-center justify-center mr-1">
          <QRCodeSVG value={qrValue} size={qrSize} level="M" marginSize={0} />
        </div>

        {/* Right: Condensed Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0">
          {/* Line 1: Code & Category */}
          <div className="flex items-center justify-between gap-1 leading-none">
            <span className="text-[8px] font-black font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200 truncate max-w-[90px]">
              {item.code || '-'}
            </span>
            <span className="text-[7px] text-slate-400 truncate">
              {item.category || item.unit || 'EA'}
            </span>
          </div>

          {/* Line 2: Name */}
          <div className="text-[9.5px] font-black text-slate-950 truncate leading-tight mt-0.5" title={item.name}>
            {item.name || '-'}
          </div>

          {/* Line 3: Spec or Stock */}
          <div className="flex items-center justify-between text-[7px] text-slate-500 leading-none pt-0.5 border-t border-slate-100">
            <span className="truncate max-w-[95px]">{item.spec || '-'}</span>
            <span className="font-bold text-slate-700 shrink-0">{item.quantity ?? 0}{item.unit || 'EA'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 4: 초소형/초슬림 라벨 (81~189칸, 36칸 인덱스 등 높이 < 15mm)
  // ==========================================
  const miniQrSize = Math.max(18, Math.min(24, Math.floor(heightMm * 0.85)));
  return (
    <div
      className={`relative overflow-hidden bg-white text-slate-900 flex items-center justify-between px-1 py-0.5 select-none ${
        config.showBorderCutGuide ? 'border border-slate-400 border-dashed' : 'border border-slate-200'
      }`}
      style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, boxSizing: 'border-box' }}
    >
      {renderCutGuides()}

      {/* Mini QR */}
      <div className="shrink-0 flex items-center mr-1">
        <QRCodeSVG value={qrValue} size={miniQrSize} level="L" marginSize={0} />
      </div>

      {/* 1 or 2 Lines Compact */}
      <div className="flex-1 min-w-0 flex flex-col justify-center leading-none">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8.5px] font-black text-slate-950 truncate max-w-[130px]" title={item.name}>
            {item.name || '-'}
          </span>
          <span className="text-[7px] font-mono font-bold text-slate-600 truncate shrink-0">
            {item.code || '-'}
          </span>
        </div>
        {heightMm >= 11 && (
          <div className="flex items-center justify-between text-[6.5px] text-slate-500 mt-0.5">
            <span className="truncate max-w-[90px]">{item.spec || item.category || '-'}</span>
            <span className="font-bold shrink-0">{item.quantity ?? 0}{item.unit || 'EA'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const LabelPrintView: React.FC<LabelPrintViewProps> = ({
  isOpen,
  onClose,
  items = [],
  initialConfig = DEFAULT_LABEL_CONFIG,
  onSaveConfig,
  onPrinted,
  onUpdatePrintCount,
}) => {
  const [config, setConfig] = useState<LabelPrintConfig>(() => ({
    ...DEFAULT_LABEL_CONFIG,
    ...initialConfig,
  }));

  const [brandFilter, setBrandFilter] = useState<'ALL' | 'AnyLabel' | 'Formtec' | 'General'>('ALL');

  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialConfig?.presetId || DEFAULT_LABEL_CONFIG.presetId || 'any_v3310'
  );

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // 🚀 2. 품목별 출력 매수는 초기값을 무조건 1로 고정
  const [itemMultipliers, setItemMultipliers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (items || []).forEach((it) => {
      if (it?.id) initial[it.id] = 1;
    });
    return initial;
  });

  // Re-sync multipliers on modal open/items change (always reset to 1)
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      (items || []).forEach((it) => {
        if (it?.id) initial[it.id] = 1;
      });
      setItemMultipliers(initial);
    }
  }, [items, isOpen]);

  // Sync config changes with local state and localStorage without triggering parent re-render crash
  const handleConfigChange = useCallback((newConfig: LabelPrintConfig) => {
    setConfig(newConfig);
    try {
      saveLabelConfig(newConfig);
    } catch {
      // ignore
    }
  }, []);

  // Handle Preset Change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      const updated: LabelPrintConfig = { ...config, presetId: 'custom' };
      handleConfigChange(updated);
      return;
    }

    const preset = findPresetById(presetId);
    if (preset) {
      const updated: LabelPrintConfig = {
        ...config,
        presetId: preset.id,
        widthMm: preset.widthMm,
        heightMm: preset.heightMm,
        cols: preset.cols,
        rows: preset.rows,
        marginTopMm: preset.marginTopMm,
        marginLeftMm: preset.marginLeftMm,
        gapXMm: preset.gapXMm,
        gapYMm: preset.gapYMm,
        layout: preset.layout,
      };
      handleConfigChange(updated);
    }
  };

  const handleResetAllTo1 = () => {
    const reset: Record<string, number> = {};
    (items || []).forEach((it) => {
      if (it?.id) reset[it.id] = 1;
    });
    setItemMultipliers(reset);
  };

  const updateMultiplier = (id: string, delta: number) => {
    setItemMultipliers((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      if (onUpdatePrintCount) {
        onUpdatePrintCount(id, delta);
      }
      return { ...prev, [id]: next };
    });
  };

  // 🚀 Inject @page size & zero-margin rules directly into document.head
  useEffect(() => {
    if (!isOpen) return;

    let styleEl = document.getElementById('smartrack-print-page-style') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'smartrack-print-page-style';
      document.head.appendChild(styleEl);
    }

    const isLand = config.layout === 'landscape';
    styleEl.textContent = `
      @page {
        size: A4 ${config.layout};
        margin: 0mm !important;
      }
      @media print {
        @page {
          size: A4 ${config.layout};
          margin: 0mm !important;
        }
        html, body {
          width: ${isLand ? '297mm' : '210mm'} !important;
          min-width: ${isLand ? '297mm' : '210mm'} !important;
          height: auto !important;
          margin: 0mm !important;
          padding: 0mm !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    return () => {
      const el = document.getElementById('smartrack-print-page-style');
      if (el) {
        el.remove();
      }
    };
  }, [isOpen, config.layout]);

  // Flatten items by copies
  const printableItems = useMemo(() => {
    const list: InventoryItem[] = [];
    (items || []).forEach((item) => {
      if (!item) return;
      const count = itemMultipliers[item.id] || 1;
      for (let i = 0; i < count; i++) {
        list.push(item);
      }
    });
    return list;
  }, [items, itemMultipliers]);

  // Number of labels per sheet
  const labelsPerPage = Math.max(1, (config.cols || 3) * (config.rows || 8));
  const pageCount = Math.max(1, Math.ceil(printableItems.length / labelsPerPage));

  // Partition into pages
  const pages = useMemo(() => {
    const p: InventoryItem[][] = [];
    for (let i = 0; i < printableItems.length; i += labelsPerPage) {
      p.push(printableItems.slice(i, i + labelsPerPage));
    }
    return p;
  }, [printableItems, labelsPerPage]);

  const presetGroups = useMemo(() => getPresetGroups(), []);
  const currentPreset = useMemo(() => findPresetById(selectedPresetId), [selectedPresetId]);

  // Filtered preset categories by selected brand
  const filteredPresetGroups = useMemo(() => {
    if (brandFilter === 'ALL') return presetGroups;
    const filtered: Record<string, LabelPreset[]> = {};
    (Object.entries(presetGroups) as [string, LabelPreset[]][]).forEach(([cat, presets]) => {
      const matched = (presets || []).filter((p) => p.brand === brandFilter);
      if (matched.length > 0) {
        filtered[cat] = matched;
      }
    });
    return filtered;
  }, [presetGroups, brandFilter]);

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      saveLabelConfig(config);
      if (onSaveConfig) {
        onSaveConfig(config);
      }
    } catch {
      // ignore
    }
    if (onPrinted) {
      onPrinted(items);
    }
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleMarkAsPrintedOnly = () => {
    if (onPrinted) {
      onPrinted(items);
    }
    alert(`선택된 ${items.length}개 품목이 '출력 완료'로 기록되었습니다.`);
  };

  const isLandscape = config.layout === 'landscape';

  return (
    <div 
      className="label-print-modal fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Keep open
        }
      }}
    >
        {/* 🚀 Dynamic Print Stylesheet for exact millimeter output */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @page {
                size: A4 ${config.layout};
                margin: 0mm !important;
              }
              @media print {
                @page {
                  size: A4 ${config.layout};
                  margin: 0mm !important;
                }
                html, body {
                  width: ${isLandscape ? '297mm' : '210mm'} !important;
                  min-width: ${isLandscape ? '297mm' : '210mm'} !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }
                .label-print-modal {
                  position: static !important;
                  display: block !important;
                  background: #ffffff !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: visible !important;
                }
                .print-canvas-area {
                  background: #ffffff !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: block !important;
                  overflow: visible !important;
                }
                .print-page-container {
                  width: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: block !important;
                }
                .print-page {
                  width: ${isLandscape ? '297mm' : '210mm'} !important;
                  height: ${isLandscape ? '210mm' : '297mm'} !important;
                  min-height: ${isLandscape ? '210mm' : '297mm'} !important;
                  max-height: ${isLandscape ? '210mm' : '297mm'} !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  page-break-after: always !important;
                  break-after: page !important;
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 auto !important;
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                }
                .print-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }
              }
            `,
          }}
        />

        {/* Top Navbar */}
        <div className="no-print sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  라벨 인쇄 및 A4 규격 출력기
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentPreset ? currentPreset.modelName : `${config.widthMm}×${config.heightMm}mm 커스텀`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                총 {printableItems.length}개 라벨 출력 예정 (페이지당 {labelsPerPage}칸 • 총 {pageCount} 페이지)
              </p>
            </div>
          </div>

          {/* Top Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleMarkAsPrintedOnly}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-500/40 transition-colors cursor-pointer"
              title="인쇄 대화상자 없이 바로 '출력 완료' 상태로 등록"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">출력 완료로 기록</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄하기 (Ctrl+P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar: Presets & Sizing Controls */}
          <div className="no-print w-full lg:w-96 bg-slate-900 border-r border-slate-800 p-5 text-slate-200 overflow-y-auto space-y-5 shrink-0 text-xs">
            {/* Preset Selector Header */}
            <div>
              <h4 className="font-bold text-sm text-white mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> 라벨지 규격 선택 (애니라벨 17종 & 폼텍 18종)
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                기본값: 애니라벨 V3310 (24칸) • 이전에 사용한 설정이 자동 저장됩니다.
              </p>
            </div>

            {/* Brand Filter Tabs */}
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setBrandFilter('ALL')}
                className={`flex-1 py-1 text-center font-bold text-[11px] rounded-md transition-all cursor-pointer ${
                  brandFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setBrandFilter('AnyLabel')}
                className={`flex-1 py-1 text-center font-bold text-[11px] rounded-md transition-all cursor-pointer ${
                  brandFilter === 'AnyLabel'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                애니라벨(17종)
              </button>
              <button
                type="button"
                onClick={() => setBrandFilter('Formtec')}
                className={`flex-1 py-1 text-center font-bold text-[11px] rounded-md transition-all cursor-pointer ${
                  brandFilter === 'Formtec'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                폼텍(18종)
              </button>
            </div>

            {/* Preset Dropdown Select */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block text-xs">라벨 모델 규격 프리셋</label>
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                {(Object.entries(filteredPresetGroups) as [string, LabelPreset[]][]).map(([category, presets]) => (
                  <optgroup key={category} label={category} className="bg-slate-900 text-slate-300 font-bold">
                    {presets.map((p) => (
                      <option key={p.id} value={p.id} className="text-white">
                        {p.modelName} ({p.widthMm}×{p.heightMm}mm) - {p.description}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="⚙️ 직접 설정 (커스텀)" className="bg-slate-900 text-slate-300 font-bold">
                  <option value="custom">사용자 직접 입력 (가로/세로 mm 지정)</option>
                </optgroup>
              </select>
            </div>

            {/* Selected Preset Summary Card */}
            {currentPreset && (
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span className="text-indigo-300 flex items-center gap-1">
                    {currentPreset.shape === 'circle' && <CircleDot className="w-3.5 h-3.5 text-amber-400" />}
                    {currentPreset.modelName}
                  </span>
                  <span className="font-mono text-emerald-400">{currentPreset.widthMm} × {currentPreset.heightMm} mm</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-tight">{currentPreset.description}</p>
                <div className="grid grid-cols-2 gap-1 pt-1.5 text-[10px] text-slate-400 border-t border-indigo-900/50">
                  <div>배치: <span className="font-semibold text-slate-300">{currentPreset.cols}열 × {currentPreset.rows}행 ({currentPreset.labelsCount}칸)</span></div>
                  <div>방향: <span className="font-semibold text-slate-300">{currentPreset.layout === 'landscape' ? 'A4 가로' : 'A4 세로'}</span></div>
                  <div>여백: <span className="font-semibold text-slate-300">상하 {currentPreset.marginTopMm}mm / 좌우 {currentPreset.marginLeftMm}mm</span></div>
                  <div>간격: <span className="font-semibold text-slate-300">좌우 {currentPreset.gapXMm}mm / 상하 {currentPreset.gapYMm}mm</span></div>
                </div>
              </div>
            )}

            {/* Dimension Adjustments (Editable for fine-tuning) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 block text-xs flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" /> 라벨 크기 및 배치 상세 조정
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-2xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  {showAdvancedSettings ? '접기' : '상세 여백 조절'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Width and Height input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">라벨 가로 (mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={config.widthMm}
                    onChange={(e) => handleConfigChange({ ...config, widthMm: parseFloat(e.target.value) || 10, presetId: 'custom' })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">라벨 세로 (mm)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={config.heightMm}
                    onChange={(e) => handleConfigChange({ ...config, heightMm: parseFloat(e.target.value) || 10, presetId: 'custom' })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Advanced Grid & Margin Settings */}
              {showAdvancedSettings && (
                <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700 space-y-2.5 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">열 수 (Cols)</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={config.cols || 2}
                        onChange={(e) => handleConfigChange({ ...config, cols: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">행 수 (Rows)</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={config.rows || 7}
                        onChange={(e) => handleConfigChange({ ...config, rows: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">상단 여백 (mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={config.marginTopMm ?? 10}
                        onChange={(e) => handleConfigChange({ ...config, marginTopMm: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">좌측 여백 (mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={config.marginLeftMm ?? 5}
                        onChange={(e) => handleConfigChange({ ...config, marginLeftMm: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">가로 간격 (GapX mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={config.gapXMm ?? 0}
                        onChange={(e) => handleConfigChange({ ...config, gapXMm: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-0.5">세로 간격 (GapY mm)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={config.gapYMm ?? 0}
                        onChange={(e) => handleConfigChange({ ...config, gapYMm: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block mb-1">용지 방향</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfigChange({ ...config, layout: 'portrait' })}
                        className={`py-1.5 px-2 rounded border text-center text-xs font-semibold cursor-pointer ${
                          config.layout === 'portrait'
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        A4 세로 (기본)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfigChange({ ...config, layout: 'landscape' })}
                        className={`py-1.5 px-2 rounded border text-center text-xs font-semibold cursor-pointer ${
                          config.layout === 'landscape'
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        A4 가로
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Switches (라벨 표시 항목 설정) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="font-semibold text-slate-300 block">라벨 표시 항목 설정</label>
              
              {/* 6. 재단 가이드 실선 표시 (초기값 OFF, localStorage 저장) */}
              <button
                type="button"
                onClick={() => handleConfigChange({ ...config, showBorderCutGuide: !config.showBorderCutGuide })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-300">재단 가이드 실선 표시</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.showBorderCutGuide)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-700 border-slate-600 pointer-events-none"
                />
              </button>

              {/* 1. 상단 회사명/시스템 표기 (초기값 OFF, localStorage 저장) */}
              <button
                type="button"
                onClick={() => handleConfigChange({ ...config, showCompanyName: !config.showCompanyName })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>상단 회사명/시스템 표기</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(config.showCompanyName)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-700 border-slate-600 pointer-events-none"
                />
              </button>

              {/* 회사명 입력창 (체크 시에만 노출) */}
              {Boolean(config.showCompanyName) && (
                <div className="p-2.5 bg-slate-800/90 rounded-lg border border-indigo-700/50 space-y-1 animate-in fade-in">
                  <span className="text-[11px] text-indigo-300 font-semibold block">회사명 / 시스템명 텍스트</span>
                  <input
                    type="text"
                    value={config.companyName || ''}
                    onChange={(e) => handleConfigChange({ ...config, companyName: e.target.value })}
                    placeholder="SMART RACK"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => handleConfigChange({ ...config, showNotes: !config.showNotes })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-300">비고사항(메모) 출력</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.showNotes ?? true)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-700 border-slate-600 pointer-events-none"
                />
              </button>

              <button
                type="button"
                onClick={() => handleConfigChange({ ...config, showSupplier: !config.showSupplier })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-300">공급처(제조사) 표시</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.showSupplier)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-700 border-slate-600 pointer-events-none"
                />
              </button>

              <button
                type="button"
                onClick={() => handleConfigChange({ ...config, showDate: !config.showDate })}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <span className="text-xs text-slate-300">출력 일자 표기</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.showDate)}
                  readOnly
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-700 border-slate-600 pointer-events-none"
                />
              </button>
            </div>

            {/* Individual Multipliers */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 block text-xs">
                  품목별 출력 매수 ({items.length}개)
                </label>
                <button
                  type="button"
                  onClick={handleResetAllTo1}
                  className="text-2xs text-indigo-300 hover:text-white bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700/50 transition-colors cursor-pointer"
                  title="모든 품목의 출력 매수를 1매로 재설정"
                >
                  전체 1매로
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {items.map((item) => (
                  <div
                    key={item?.id || Math.random()}
                    className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-2xs"
                  >
                    <div className="truncate max-w-[150px]">
                      <div className="font-bold text-white truncate">{item?.name || '-'}</div>
                      <div className="text-slate-400 font-mono">{item?.code || '-'}</div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => item?.id && updateMultiplier(item.id, -1)}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-bold w-5 text-center text-white">
                        {(item?.id && itemMultipliers[item.id]) || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => item?.id && updateMultiplier(item.id, 1)}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Printing Tip */}
            <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-700 text-2xs text-indigo-200 leading-relaxed space-y-1.5 shadow-sm">
              <p className="font-bold text-indigo-100 flex items-center gap-1.5 text-xs">
                <span className="text-sm">🖨️</span> 프린터 인쇄 대화상자 설정 가이드
              </p>
              <div className="space-y-1 text-slate-300">
                <p>• <strong>여백:</strong> <span className="text-amber-300 font-bold">없음(None / 0)</span> 선택 (CSS로 공식 규격 여백 자동 적용)</p>
                <p>• <strong>배율:</strong> <span className="text-amber-300 font-bold">100% 또는 기본값</span> (페이지에 맞춤 해제)</p>
                <p>• <strong>머리글/바닥글:</strong> <span className="text-amber-300 font-bold">체크 해제</span></p>
                <p>• <strong>배경 그래픽:</strong> <span className="text-emerald-300 font-bold">체크 활성화</span> (배너/색상 선명 출력)</p>
              </div>
              <p className="text-[10px] text-indigo-300/80 pt-1 border-t border-indigo-800">
                ※ 브라우저에서 '여백: 없음'을 1회 선택해두면 다음 인쇄부터 자동으로 기억됩니다.
              </p>
            </div>
          </div>

          {/* Right Area: Printable Canvas Preview */}
          <div className="print-canvas-area flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto flex flex-col items-center">
            <div className="print-page-container space-y-8 flex flex-col items-center">
              {pages.map((pageItems, pageIndex) => {
                const cols = config.cols || 3;
                const rows = config.rows || 8;
                const marginTop = config.marginTopMm ?? 12.9;
                const marginLeft = config.marginLeftMm ?? 7.2;
                const gapX = config.gapXMm ?? 2.5;
                const gapY = config.gapYMm ?? 0;

                return (
                  <div
                    key={pageIndex}
                    className={`print-page bg-white text-slate-900 shadow-2xl relative ${
                      isLandscape
                        ? 'w-[297mm] h-[210mm] min-h-[210mm] max-h-[210mm]'
                        : 'w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm]'
                    }`}
                    style={{
                      boxSizing: 'border-box',
                      paddingTop: `${marginTop}mm`,
                      paddingLeft: `${marginLeft}mm`,
                    }}
                  >
                    {/* Non-printed Page Number Badge */}
                    <div className="no-print absolute -top-6 left-2 text-xs font-mono text-slate-400">
                      PAGE {pageIndex + 1} / {pageCount} ({currentPreset?.modelName || '커스텀'} • {labelsPerPage}칸/장)
                    </div>

                    {/* Grid of Labels */}
                    <div
                      className="grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, ${config.widthMm}mm)`,
                        gridAutoRows: `${config.heightMm}mm`,
                        columnGap: `${gapX}mm`,
                        rowGap: `${gapY}mm`,
                        width: 'max-content',
                      }}
                    >
                      {pageItems.map((item, labelIdx) => (
                        <SafeAdaptiveLabelCard
                          key={`${item?.id || labelIdx}-${labelIdx}`}
                          item={item}
                          config={config}
                          labelIdx={labelIdx}
                          shape={currentPreset?.shape}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
};
