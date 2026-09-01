import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  AlertTriangle, 
  Check, 
  MapPin, 
  Building2, 
  Image as ImageIcon,
  Trash2,
  Tag,
  Plus
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { compressAndFormatImage } from '../utils/imageUtils';
import { parseWarehouseAndRack, parseItemLocations } from '../utils/excelHelper';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  existingItem?: InventoryItem | null;
  allItems: InventoryItem[];
}

export interface LocationEntry {
  id: string;
  warehouse: string;
  customWarehouse: string;
  rack: string;
}

const GRADE_PRESETS = [
  'A등급',
  'B등급',
  'C등급',
  'S등급',
  '양품',
  '신품',
  '중고',
  '재작업품',
  '보류',
  '불량',
  '기타'
];

const WAREHOUSE_PRESETS = [
  '본관창고',
  '제1창고',
  '제2창고',
  'A동',
  'B동',
  '자재창고',
  '부품창고',
  '완제품창고'
];

const UNIT_PRESETS = ['EA', 'BOX', 'SET', 'KG', 'M', '롤', '개', 'PCS'];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItem,
  allItems,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [spec, setSpec] = useState('');
  
  // 🚀 다중 창고 & 랙 보관 위치 목록 상태
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: 'loc-1', warehouse: '본관창고', customWarehouse: '', rack: '' }
  ]);

  // 등급 (기존 분류 대체)
  const [grade, setGrade] = useState('A등급');
  const [customGrade, setCustomGrade] = useState('');

  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('EA');
  const [safetyStock, setSafetyStock] = useState<number>(5);
  const [price, setPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imageLoading, setImageLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Existing warehouses list from DB
  const existingWarehouses = useMemo(() => {
    const set = new Set<string>(WAREHOUSE_PRESETS);
    allItems.forEach((i) => {
      const parsed = parseWarehouseAndRack(i.rackLocation, i.warehouse);
      if (parsed.warehouse && parsed.warehouse !== '-') {
        set.add(parsed.warehouse);
      }
    });
    return Array.from(set);
  }, [allItems]);

  // Existing grades list from DB
  const existingGrades = useMemo(() => {
    const set = new Set<string>(GRADE_PRESETS);
    allItems.forEach((i) => {
      if (i.category && i.category.trim()) {
        set.add(i.category.trim());
      }
    });
    return Array.from(set);
  }, [allItems]);

  // Initialize or populate form
  useEffect(() => {
    if (existingItem) {
      setCode(existingItem.code || '');
      setName(existingItem.name || '');
      setSpec(existingItem.spec || '');

      // 🚀 Parse multiple warehouses & racks
      const parsedLocs = parseItemLocations(existingItem);
      const locEntries: LocationEntry[] = parsedLocs.map((l, idx) => {
        const wh = (l.warehouse && l.warehouse !== '-' && l.warehouse !== '미입력') ? l.warehouse : '';
        const isCustom = wh && !existingWarehouses.includes(wh);
        return {
          id: `loc-${idx + 1}-${Date.now()}`,
          warehouse: isCustom ? 'DIRECT' : (wh || ''),
          customWarehouse: isCustom ? wh : '',
          rack: l.isUnassigned ? '' : l.rack,
        };
      });

      setLocations(locEntries.length > 0 ? locEntries : [
        { id: `loc-${Date.now()}`, warehouse: '', customWarehouse: '', rack: '' }
      ]);

      // Grade (category)
      const currentGrade = existingItem.category || 'A등급';
      if (existingGrades.includes(currentGrade)) {
        setGrade(currentGrade);
        setCustomGrade('');
      } else {
        setGrade('DIRECT');
        setCustomGrade(currentGrade);
      }

      setQuantity(existingItem.quantity ?? 0);
      setUnit(existingItem.unit || 'EA');
      setSafetyStock(existingItem.safetyStock ?? 5);
      setPrice(existingItem.price ?? 0);
      setSupplier(existingItem.supplier || '');
      setNotes(existingItem.notes || '');
      setImage(existingItem.image || existingItem.imageUrl);
    } else {
      // Auto-generate clean item code SKU
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setCode(`SKU-${randomSuffix}`);
      setName('');
      setSpec('');
      setLocations([
        { id: `loc-${Date.now()}`, warehouse: '본관창고', customWarehouse: '', rack: '' }
      ]);
      setGrade('A등급');
      setCustomGrade('');
      setQuantity(10);
      setUnit('EA');
      setSafetyStock(5);
      setPrice(0);
      setSupplier('');
      setNotes('');
      setImage(undefined);
    }
    setErrorMsg('');
  }, [existingItem, isOpen, existingWarehouses, existingGrades]);

  // Real-time duplicate check (Advisory only)
  const duplicateMatch = allItems.find((item) => {
    if (existingItem && item.id === existingItem.id) return false;
    const isSameCode = item.code.trim().toUpperCase() === code.trim().toUpperCase();
    return isSameCode;
  });

  const handleImageFile = async (file: File) => {
    try {
      setImageLoading(true);
      const base64 = await compressAndFormatImage(file, 800, 800, 0.82);
      setImage(base64);
    } catch (err) {
      console.error(err);
      setErrorMsg('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!code.trim()) {
      setErrorMsg('품목코드를 입력해주세요.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('품목명을 입력해주세요.');
      return;
    }

    // 🚀 다중 보관 위치 결합
    const locStrings = locations
      .map((l) => {
        const wh = l.warehouse === 'DIRECT' ? l.customWarehouse.trim() : l.warehouse.trim();
        const rk = l.rack.trim();
        if (wh && rk) return `${wh} ${rk}`;
        if (wh) return wh;
        if (rk) return rk;
        return '';
      })
      .filter(Boolean);

    const finalRackLocation = locStrings.length > 0 ? locStrings.join(', ') : '미입력';
    const primaryWarehouse = locations[0]?.warehouse === 'DIRECT' 
      ? locations[0]?.customWarehouse.trim() 
      : locations[0]?.warehouse.trim();

    // Determine final Grade
    const finalGrade = grade === 'DIRECT' 
      ? (customGrade.trim() || '기타') 
      : (grade.trim() || 'A등급');

    const now = new Date().toISOString();
    const itemToSave: InventoryItem = {
      id: existingItem ? existingItem.id : `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      spec: spec.trim(),
      category: finalGrade,
      warehouse: primaryWarehouse || undefined,
      rackLocation: finalRackLocation,
      quantity: Number(quantity) || 0,
      unit: unit.trim() || 'EA',
      safetyStock: Number(safetyStock) || 0,
      price: Number(price) || 0,
      supplier: supplier.trim(),
      notes: notes.trim(),
      image,
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
      printCount: existingItem?.printCount || 1,
      isPrinted: existingItem?.isPrinted,
      lastPrintedAt: existingItem?.lastPrintedAt,
    };

    onSave(itemToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 text-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {existingItem ? '✎' : '＋'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                {existingItem ? '품목 정보 수정' : '신규 재고 품목 등록'}
              </h3>
              {/* 🚀 2번 요청: 80*60mm 삭제 및 문구 정돈 */}
              <p className="text-xs text-slate-500 mt-0.5">
                창고, 랙위치, 등급 및 라벨 출력 정보 관리
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (🚀 2번 요청: 통일된 폰트 크기 규칙 적용) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Duplicate advisory warning banner */}
          {duplicateMatch && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">⚠️ 동일한 품목코드가 이미 등록되어 있습니다.</p>
                <p className="mt-0.5">
                  기존 품목: <span className="font-semibold">[{duplicateMatch.code}] {duplicateMatch.name}</span> (위치: {duplicateMatch.rackLocation})
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top Section: Photo & Core Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Photo Upload Area */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                품목 사진
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropImage}
                className="relative border-2 border-dashed border-slate-200 rounded-xl p-2 text-center hover:border-indigo-300 bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[160px]"
              >
                {image ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden group">
                    <img
                      src={image}
                      alt="품목 사진"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 bg-white text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100 shadow-xs cursor-pointer"
                      >
                        변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage(undefined)}
                        className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 flex flex-col items-center">
                    <ImageIcon className="w-7 h-7 text-slate-300 mb-1.5" />
                    <p className="text-xs font-semibold text-slate-600">사진 드래그 또는 선택</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG 자동 최적화</p>

                    <div className="flex items-center space-x-1.5 mt-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                      >
                        파일 찾기
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" /> 촬영
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            {/* Core Code & Name & Spec */}
            <div className="md:col-span-2 space-y-2.5">
              {/* Item Code (SKU) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  품목코드 (SKU) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="예: ELEC-001"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  품목명 (제품명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: SMPS 산업용 전원공급장치 24V 10A"
                  className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                />
              </div>

              {/* Spec */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  규격 / 모델명 / 사양
                </label>
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  placeholder="예: 24V DC / 240W / DIN-Rail"
                  className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 🚀 Warehouse & Multi-Rack Locations Section (다중 보관 위치 관리) */}
          <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>보관 위치 관리 (다중 창고 & 랙 지원)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocations((prev) => [
                    ...prev,
                    { id: `loc-${Date.now()}`, warehouse: '본관창고', customWarehouse: '', rack: '' },
                  ]);
                }}
                className="px-2.5 py-1 text-2xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>보관 위치 추가</span>
              </button>
            </div>

            <div className="space-y-2">
              {locations.map((loc, idx) => {
                return (
                  <div key={loc.id} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-2xs text-slate-500">
                      <span className="font-bold text-indigo-700">위치 #{idx + 1}</span>
                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocations((prev) => prev.filter((l) => l.id !== loc.id));
                          }}
                          className="text-rose-500 hover:text-rose-700 flex items-center space-x-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Warehouse (창고) */}
                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-0.5">
                          창고 선택
                        </label>
                        <select
                          value={loc.warehouse}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocations((prev) =>
                              prev.map((l) => (l.id === loc.id ? { ...l, warehouse: val } : l))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:border-indigo-600 focus:outline-none cursor-pointer"
                        >
                          <option value="">미지정</option>
                          {existingWarehouses.map((wh) => (
                            <option key={wh} value={wh}>
                              {wh}
                            </option>
                          ))}
                          <option value="DIRECT">직접 입력...</option>
                        </select>

                        {loc.warehouse === 'DIRECT' && (
                          <input
                            type="text"
                            value={loc.customWarehouse}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocations((prev) =>
                                prev.map((l) => (l.id === loc.id ? { ...l, customWarehouse: val } : l))
                              );
                            }}
                            placeholder="신규 창고명 입력"
                            className="mt-1 w-full px-2.5 py-1 text-xs bg-white rounded-lg border border-indigo-300 focus:border-indigo-600 focus:outline-none"
                          />
                        )}
                      </div>

                      {/* Rack Location (랙 위치) */}
                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-0.5">
                          랙 세부위치 (예: D-06-03)
                        </label>
                        <div className="relative">
                          <MapPin className="w-3 h-3 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={loc.rack}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocations((prev) =>
                                prev.map((l) => (l.id === loc.id ? { ...l, rack: val } : l))
                              );
                            }}
                            placeholder="예: D-06-03 (선택)"
                            className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold font-mono bg-slate-50 rounded-lg border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grade (등급) & Quantity & Unit & Safety Stock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
            {/* Grade (등급) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-indigo-500" />
                <span>등급</span>
              </label>
              <div className="space-y-1">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  {existingGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="DIRECT">직접 입력...</option>
                </select>

                {grade === 'DIRECT' && (
                  <input
                    type="text"
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value)}
                    placeholder="등급 직접 입력"
                    className="w-full px-2.5 py-1 text-xs bg-white rounded-lg border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                )}
              </div>
            </div>

            {/* Current Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                현재고 수량
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 font-bold focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                재고 단위
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all font-medium cursor-pointer"
              >
                {UNIT_PRESETS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Safety Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                안전재고
              </label>
              <input
                type="number"
                min="0"
                value={safetyStock}
                onChange={(e) => setSafetyStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Price & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-100">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                단가 (원 / KRW)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="예: 35000"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                공급처 / 제조사
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="예: 명지전자(주)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              비고 / 보관 특이사항
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="보관 시 주의사항, 발주처 메모, 인증 내역 등"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{existingItem ? '수정사항 저장' : '품목 등록 완료'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
