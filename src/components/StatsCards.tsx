import React from 'react';
import { Package, AlertCircle, MapPin, DollarSign, Layers } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface StatsCardsProps {
  items: InventoryItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  showOnlyLowStock: boolean;
  onToggleLowStock: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  showOnlyLowStock,
  onToggleLowStock,
}) => {
  const totalSKUs = items.length;
  const totalQuantity = items.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
  const lowStockItems = items.filter((item) => item.quantity <= (item.safetyStock || 0));
  const lowStockCount = lowStockItems.length;

  const rackLocations = new Set(items.map((item) => item.rackLocation || '미지정'));
  const totalValuation = items.reduce((acc, cur) => acc + (cur.quantity || 0) * (cur.price || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total SKUs */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center justify-between transition-all hover:border-slate-300">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total SKUs</p>
          <div className="flex items-baseline space-x-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalSKUs}</span>
            <span className="text-xs font-medium text-slate-400">품목</span>
          </div>
          <p className="text-2xs text-slate-400 mt-1 font-mono">총 재고 {totalQuantity.toLocaleString()} EA</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Low Stock Alert Card (Clickable to Filter) */}
      <div 
        onClick={onToggleLowStock}
        className={`rounded-xl p-4 cursor-pointer transition-all border ${
          showOnlyLowStock
            ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/40'
            : lowStockCount > 0
            ? 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safety Stock</p>
            <div className="flex items-baseline space-x-1.5 mt-1.5">
              <span className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {lowStockCount}
              </span>
              <span className="text-xs font-medium text-slate-400">부족</span>
            </div>
            <p className="text-2xs font-semibold mt-1 flex items-center gap-1">
              {lowStockCount > 0 ? (
                <span className="text-rose-600">{showOnlyLowStock ? '● 필터 적용중' : '부족 품목만 보기'}</span>
              ) : (
                <span className="text-emerald-600 font-medium">모든 재고 정상</span>
              )}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            lowStockCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rack Locations */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center justify-between transition-all hover:border-slate-300">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rack Zones</p>
          <div className="flex items-baseline space-x-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{rackLocations.size}</span>
            <span className="text-xs font-medium text-slate-400">개 구역</span>
          </div>
          <p className="text-2xs text-slate-400 mt-1 font-mono">보관 구역 현황</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
          <MapPin className="w-5 h-5" />
        </div>
      </div>

      {/* Total Valuation */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center justify-between transition-all hover:border-slate-300">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Value</p>
          <div className="flex items-baseline space-x-1.5 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {(totalValuation / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-medium text-slate-400">만원</span>
          </div>
          <p className="text-2xs text-slate-400 mt-1 font-mono">₩{totalValuation.toLocaleString()}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

