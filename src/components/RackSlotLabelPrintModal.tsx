import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Settings, 
  Layers, 
  LayoutGrid, 
  Check, 
  Building2, 
  QrCode, 
  Filter,
  Eye,
  Sliders
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LabelPrintConfig, LabelPreset } from '../types/inventory';
import { DEFAULT_LABEL_CONFIG } from '../utils/storage';
import { ALL_LABEL_PRESETS, findPresetById, getPresetGroups } from '../utils/labelPresets';
import { generateRackSlotQRValue } from '../utils/qrHelper';

export interface RackSlotItem {
  warehouse: string;
  zone: string;
  slotCode: string;
  itemCount: number;
  totalQty: number;
}

interface RackSlotLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: string;
  slots: RackSlotItem[];
}

export const RackSlotLabelPrintModal: React.FC<RackSlotLabelPrintModalProps> = ({
  isOpen,
  onClose,
  warehouse,
  slots = [],
}) => {
  // Config state
  const [config, setConfig] = useState<LabelPrintConfig>({
    ...DEFAULT_LABEL_CONFIG,
    presetId: 'any_v3310', // 24칸 표준
    widthMm: 63.5,
    heightMm: 33.9,
    cols: 3,
    rows: 8,
    marginTopMm: 12.9,
    marginLeftMm: 7.2,
    gapXMm: 2.5,
    gapYMm: 0.0,
  });

  // Filter state
  const [targetFilter, setTargetFilter] = useState<'ALL' | 'ACTIVE_ONLY' | string>('ALL');

  // Selected Zone options
  const zones = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.zone));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko', { numeric: true }));
  }, [slots]);

  // Filtered slots for printing
  const slotsToPrint = useMemo(() => {
    if (targetFilter === 'ACTIVE_ONLY') {
      return slots.filter((s) => s.itemCount > 0);
    }
    if (targetFilter !== 'ALL') {
      return slots.filter((s) => s.zone === targetFilter);
    }
    return slots;
  }, [slots, targetFilter]);

  // Handle Preset Selection
  const handlePresetSelect = (presetId: string) => {
    const preset = findPresetById(presetId);
    if (!preset) return;

    setConfig((prev) => ({
      ...prev,
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
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const totalSlotsCount = slotsToPrint.length;
  const labelsPerPage = (config.cols || 3) * (config.rows || 8);
  const totalPages = Math.max(1, Math.ceil(totalSlotsCount / (labelsPerPage || 1)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-xs">
      <div className="bg-slate-900 text-white rounded-2xl max-w-6xl w-full h-[95vh] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                랙 슬롯 QR 라벨 A4 일괄 인쇄
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {warehouse}
                </span>
              </h3>
              <p className="text-2xs text-slate-400">
                A4 스티커 라벨지 규격에 맞춰 창고 랙 슬롯 QR 바코드 라벨을 일괄 출력합니다
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 라벨 인쇄하기 ({totalSlotsCount}칸)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Preset Selector */}
        <div className="px-5 py-2.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Target Filter Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold text-slate-400">인쇄 대상:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setTargetFilter('ALL')}
                className={`px-2.5 py-1 text-2xs rounded-md transition-all cursor-pointer ${
                  targetFilter === 'ALL'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                전체 슬롯 ({slots.length})
              </button>
              <button
                type="button"
                onClick={() => setTargetFilter('ACTIVE_ONLY')}
                className={`px-2.5 py-1 text-2xs rounded-md transition-all cursor-pointer ${
                  targetFilter === 'ACTIVE_ONLY'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                자재 보관 슬롯만 ({slots.filter((s) => s.itemCount > 0).length})
              </button>
              {zones.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setTargetFilter(z)}
                  className={`px-2 py-1 text-2xs rounded-md transition-all cursor-pointer font-mono ${
                    targetFilter === z
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z}랙
                </button>
              ))}
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold text-slate-400">A4 라벨지 서식:</span>
            <select
              value={config.presetId || 'any_v3310'}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="px-2.5 py-1 text-2xs bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <optgroup label="AnyLabel 표준 라벨지">
                <option value="any_v3310">AnyLabel V3310 (24칸 - 63.5×33.9mm)</option>
                <option value="any_v3320">AnyLabel V3320 (16칸 - 99.1×34mm)</option>
                <option value="any_v3330">AnyLabel V3330 (12칸 - 99.1×42.3mm)</option>
                <option value="any_v3340">AnyLabel V3340 (8칸 - 99.1×67.7mm)</option>
              </optgroup>
              <optgroup label="폼텍 (Formtec) 라벨지">
                <option value="formtec_3105">폼텍 3105 (24칸 - 70×36mm)</option>
                <option value="formtec_3108">폼텍 3108 (16칸 - 99.1×34mm)</option>
                <option value="formtec_3107">폼텍 3107 (12칸 - 99.1×42.3mm)</option>
                <option value="formtec_3104">폼텍 3104 (8칸 - 99.1×67.7mm)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Print Preview Workspace */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center">
          {/* Printable Sheet Container */}
          <div className="space-y-8 w-full flex flex-col items-center">
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const startIdx = pageIdx * labelsPerPage;
              const pageSlots = slotsToPrint.slice(startIdx, startIdx + labelsPerPage);

              return (
                <div
                  key={pageIdx}
                  className="bg-white text-slate-900 rounded-lg shadow-2xl p-6 border border-slate-300 w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between"
                  style={{
                    paddingTop: `${config.marginTopMm || 12}mm`,
                    paddingLeft: `${config.marginLeftMm || 7}mm`,
                    paddingRight: `${config.marginLeftMm || 7}mm`,
                    paddingBottom: `${config.marginTopMm || 12}mm`,
                  }}
                >
                  {/* Grid of Slot Labels */}
                  <div
                    className="grid gap-2 flex-1"
                    style={{
                      gridTemplateColumns: `repeat(${config.cols || 3}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${config.rows || 8}, minmax(0, 1fr))`,
                      gap: `${config.gapYMm || 2}mm ${config.gapXMm || 2}mm`,
                    }}
                  >
                    {pageSlots.map((slot, sIdx) => {
                      const qrValue = generateRackSlotQRValue(slot.warehouse, slot.slotCode);

                      return (
                        <div
                          key={sIdx}
                          className="border border-slate-300 rounded-lg p-2 flex flex-col justify-between bg-white overflow-hidden text-center relative hover:border-indigo-500 transition-all"
                          style={{
                            minHeight: `${config.heightMm || 33.9}mm`,
                          }}
                        >
                          {/* Top: Warehouse & System Name */}
                          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 text-[9px] text-slate-500">
                            <span className="font-semibold truncate max-w-[120px]">{slot.warehouse}</span>
                            <span className="font-mono text-[8px] text-indigo-600 font-bold">SMART RACK</span>
                          </div>

                          {/* Center: Slot Code & QR */}
                          <div className="flex items-center justify-between gap-1 my-1 px-1">
                            <div className="text-left">
                              <span className="text-[8px] text-slate-400 uppercase font-mono block">LOCATION</span>
                              <span className="font-mono font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                                {slot.slotCode}
                              </span>
                              {slot.itemCount > 0 && (
                                <span className="text-[8px] text-emerald-600 font-semibold block mt-0.5">
                                  {slot.itemCount}개 품목 적재
                                </span>
                              )}
                            </div>

                            <div className="p-1 bg-white rounded border border-slate-200 shrink-0">
                              <QRCodeSVG
                                value={qrValue}
                                size={44}
                                level="M"
                              />
                            </div>
                          </div>

                          {/* Bottom: Barcode Style Stripe */}
                          <div className="border-t border-dashed border-slate-200 pt-0.5 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                            <span>ZONE: {slot.zone}</span>
                            <span>SCAN TO LOCATE</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Page Footer */}
                  <div className="text-center pt-2 text-[9px] text-slate-400 font-mono">
                    Page {pageIdx + 1} / {totalPages} — SMART RACK LOCATION LABELS
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
