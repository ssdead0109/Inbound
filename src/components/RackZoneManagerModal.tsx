import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Check, 
  ArrowRight, 
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface RackZoneManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  selectedItemIds?: string[];
  onBatchUpdateRackLocation: (itemIds: string[], newLocation: string) => void;
  onRenameRackZone: (oldZonePrefix: string, newZonePrefix: string) => void;
  onResetAllToUnassigned?: () => void;
}

export const RackZoneManagerModal: React.FC<RackZoneManagerModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedItemIds = [],
  onBatchUpdateRackLocation,
  onRenameRackZone,
  onResetAllToUnassigned,
}) => {
  // Mode: 'overview' | 'rename_zone' | 'batch_assign'
  const [activeTab, setActiveTab] = useState<'batch_assign' | 'rename_zone' | 'overview'>('overview');

  // Rename Zone state
  const [sourceZone, setSourceZone] = useState<string>('');
  const [targetZone, setTargetZone] = useState<string>('');
  
  // Batch Assign state
  const [customLocation, setCustomLocation] = useState('');
  const [selectedTargetItemIds, setSelectedTargetItemIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Group items by Rack Zone
  const zoneStats = useMemo(() => {
    const stats: Record<string, { count: number; items: InventoryItem[] }> = {};
    
    items.forEach((item) => {
      let zone = '미입력';
      if (item.rackLocation && item.rackLocation !== '미입력' && item.rackLocation !== '미지정') {
        const parts = item.rackLocation.split(/[\-\s\/]/);
        zone = parts[0] || item.rackLocation;
      }
      if (!stats[zone]) {
        stats[zone] = { count: 0, items: [] };
      }
      stats[zone].count += 1;
      stats[zone].items.push(item);
    });

    return stats;
  }, [items]);

  const zoneNames = useMemo(() => Object.keys(zoneStats).sort((a, b) => a.localeCompare(b, 'ko')), [zoneStats]);

  // Sync initial selected items
  React.useEffect(() => {
    if (selectedItemIds && selectedItemIds.length > 0) {
      setSelectedTargetItemIds(selectedItemIds);
      setActiveTab('batch_assign');
    }
  }, [selectedItemIds, isOpen]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handle Zone Rename
  const handleExecuteRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceZone || !targetZone.trim()) {
      alert('변경할 대상 구역과 새 구역명을 모두 입력해주세요.');
      return;
    }
    if (sourceZone === targetZone.trim()) {
      alert('기존 구역명과 새 구역명이 동일합니다.');
      return;
    }

    onRenameRackZone(sourceZone, targetZone.trim());
    showNotification(`'${sourceZone}' 구역이 '${targetZone.trim()}'(으)로 일괄 변경되었습니다.`);
    setSourceZone('');
    setTargetZone('');
  };

  // Handle Batch Assign
  const handleExecuteBatchAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTargetItemIds.length === 0) {
      alert('랙 위치를 변경할 품목을 1개 이상 선택해주세요.');
      return;
    }
    const finalLoc = customLocation.trim() || '미입력';
    onBatchUpdateRackLocation(selectedTargetItemIds, finalLoc);
    showNotification(`선택한 ${selectedTargetItemIds.length}개 품목의 랙 위치가 '${finalLoc}'(으)로 변경되었습니다.`);
    setCustomLocation('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                RACK ZONE (랙 구역) 편집 및 관리
              </h3>
              <p className="text-2xs text-slate-400">
                창고 및 랙 로케이션 구역을 일괄 편집하고 위치를 재배치합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📊 구역별 현황 ({zoneNames.length}개)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rename_zone')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'rename_zone'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ✏️ 구역명 일괄 변경
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('batch_assign')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'batch_assign'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📍 선택 품목 위치 일괄 배치 {selectedTargetItemIds.length > 0 && `(${selectedTargetItemIds.length})`}
            </button>
          </div>

          {onResetAllToUnassigned && (
            <button
              type="button"
              onClick={() => {
                onResetAllToUnassigned();
                showNotification('모든 품목의 랙 위치가 [미입력]으로 초기화되었습니다.');
              }}
              className="mb-2 text-2xs text-rose-600 hover:text-rose-800 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              title="전체 품목 랙 위치를 미입력으로 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>전체 랙위치 미입력 초기화</span>
            </button>
          )}
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  현재 등록된 품목의 랙 구역 분포
                </span>
                <span className="text-2xs text-slate-400 font-medium">총 {items.length}개 품목</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zoneNames.map((zone) => {
                  const stat = zoneStats[zone];
                  const isUnassigned = zone === '미입력' || zone === '미지정';
                  return (
                    <div
                      key={zone}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isUnassigned
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                              isUnassigned
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {zone}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {stat.count}개 품목
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSourceZone(zone);
                            setActiveTab('rename_zone');
                          }}
                          className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                        >
                          구역 수정
                        </button>
                      </div>

                      {/* Sample items in zone */}
                      <div className="mt-2.5 text-2xs text-slate-500 space-y-1">
                        {stat.items.slice(0, 2).map((it) => (
                          <div key={it.id} className="truncate">
                            • <span className="font-mono font-medium">{it.code}</span> ({it.name})
                          </div>
                        ))}
                        {stat.count > 2 && (
                          <div className="text-slate-400 font-medium italic">
                            외 {stat.count - 2}건...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Rename Zone */}
          {activeTab === 'rename_zone' && (
            <form onSubmit={handleExecuteRename} className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <strong>💡 랙 구역명 일괄 변경 안내</strong>
                <p className="mt-1 text-slate-600">
                  특정 랙 구역(예: <code className="font-mono bg-white px-1 py-0.5 rounded border">미입력</code> 또는 <code className="font-mono bg-white px-1 py-0.5 rounded border">A</code>)에 속한 모든 품목의 위치를 새로운 구역명(예: <code className="font-mono bg-white px-1 py-0.5 rounded border">1공장-A</code>)으로 한 번에 변경합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. 변경할 기존 랙 구역 선택 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sourceZone}
                    onChange={(e) => setSourceZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                    required
                  >
                    <option value="">-- 기존 랙 구역을 선택하세요 --</option>
                    {zoneNames.map((z) => (
                      <option key={z} value={z}>
                        {z} ({zoneStats[z]?.count || 0}개 품목 보유)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. 새로운 랙 구역명 입력 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value)}
                    placeholder="예: 1공장-A, B동 랙, 원자재구역 또는 미입력"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                    required
                  />
                  <p className="text-2xs text-slate-400 mt-1">
                    * 기존 세부 랙 번호가 있다면 앞자리 접두사만 안전하게 치환됩니다.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  구역명 일괄 변경 실행
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Batch Assign Selected Items */}
          {activeTab === 'batch_assign' && (
            <form onSubmit={handleExecuteBatchAssign} className="space-y-4">
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  선택된 변경 대상 품목: <strong className="text-indigo-600 font-mono">{selectedTargetItemIds.length}</strong>개
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTargetItemIds(items.map((i) => i.id))}
                  className="text-2xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  전체 {items.length}개 품목 선택
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  지정할 랙 위치 (또는 '미입력') <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="예: A-01-1, 1공장 랙B, 소모품보관함 또는 미입력"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  빠른 프리셋 선택:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['미입력', 'A동-01-1', 'A동-02-1', 'B동-01-1', 'C동-01-1', '자재창고 A', '소모품 랙'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCustomLocation(p)}
                      className="px-2.5 py-1 rounded-md text-2xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={selectedTargetItemIds.length === 0}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs cursor-pointer"
                >
                  선택 품목 랙 위치 일괄 적용
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
