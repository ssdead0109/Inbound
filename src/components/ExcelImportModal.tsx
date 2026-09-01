import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  Printer, 
  Download, 
  HelpCircle,
  Eye,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Layers,
  ArrowRight,
  Plus,
  Building2,
  MapPin,
  Clipboard,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { 
  parseExcelFileSmart, 
  parsePastedText,
  analyzeExcelData, 
  analyzeParsedRows,
  downloadExcelTemplate, 
  ParsedExcelRow, 
  ExcelImportAnalysis,
  getMockExcelData,
  parseWarehouseAndRack,
  cleanSupplierDisplayName
} from '../utils/excelHelper';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: InventoryItem[];
  onImportComplete: (itemsToInsert: InventoryItem[], itemsToUpdate: InventoryItem[]) => void;
  onPrintDirect?: (items: InventoryItem[]) => void;
}

// Helper to extract warehouse prefix or name from rack location string
function extractWarehouseName(rackLoc: string, explicitWh?: string): string {
  const parsed = parseWarehouseAndRack(rackLoc, explicitWh);
  return parsed.warehouse && parsed.warehouse !== '-' ? parsed.warehouse : '미입력';
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingItems,
  onImportComplete,
  onPrintDirect,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste' | 'sample'>('file');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis & Data
  const [analysis, setAnalysis] = useState<ExcelImportAnalysis | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<{ rowIndex: number; raw: any; reason: string }[]>([]);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Row inline editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ParsedExcelRow>>({});

  // Filtering & View state
  const [activeTab, setActiveTab] = useState<'all' | 'unprinted' | 'printed' | 'duplicates'>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [globalDuplicateAction, setGlobalDuplicateAction] = useState<'skip' | 'overwrite' | 'add_qty'>('skip');

  // Warehouse Management State
  const [isWarehousePanelOpen, setIsWarehousePanelOpen] = useState(false);
  const [newWarehouseInput, setNewWarehouseInput] = useState('');
  const [newWarehouseScope, setNewWarehouseScope] = useState<'unassigned' | 'selected' | 'all'>('unassigned');
  const [customWarehouses, setCustomWarehouses] = useState<string[]>([]);
  const [sourceWarehouseToMap, setSourceWarehouseToMap] = useState<string>('');
  const [targetWarehouseToMap, setTargetWarehouseToMap] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute existing warehouses from system DB
  const existingWarehouses = useMemo(() => {
    const set = new Set<string>();
    existingItems.forEach((i) => {
      const wh = extractWarehouseName(i.rackLocation, i.warehouse);
      if (wh && wh !== '미입력') set.add(wh);
    });
    // Include user-added custom warehouses in this session
    customWarehouses.forEach((w) => set.add(w));
    return Array.from(set);
  }, [existingItems, customWarehouses]);

  // Compute detected warehouses in current parsedRows
  const detectedWarehouses = useMemo(() => {
    const map = new Map<string, number>();
    parsedRows.forEach((r) => {
      const wh = extractWarehouseName(r.rackLocation, r.warehouse);
      map.set(wh, (map.get(wh) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      isNew: name !== '미입력' && !existingWarehouses.includes(name),
      isUnassigned: name === '미입력',
    }));
  }, [parsedRows, existingWarehouses]);

  // Process File
  const handleFileSelect = async (selectedFile: File, sheetName?: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setFile(selectedFile);

      const { rawRows, sheetNames, currentSheet } = await parseExcelFileSmart(selectedFile, sheetName);
      
      setAvailableSheets(sheetNames);
      setSelectedSheet(currentSheet);

      if (!rawRows || rawRows.length === 0) {
        setErrorMessage(`선택한 시트('${currentSheet}')에 유효한 데이터 행이 없습니다. 양식을 확인해 주세요.`);
        setParsedRows([]);
        setInvalidRows([]);
        setAnalysis(null);
        return;
      }

      const result = analyzeExcelData(rawRows, existingItems, sheetNames, currentSheet);
      setAnalysis(result);
      setParsedRows(result.allParsedRows);
      setInvalidRows(result.invalidRows);
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setErrorMessage(
        `파일을 읽는 중 오류가 발생했습니다: ${err?.message || '알 수 없는 형식입니다. .xlsx, .xls, .csv 파일을 확인해주세요.'}`
      );
      setParsedRows([]);
      setInvalidRows([]);
      setAnalysis(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Change Sheet
  const handleSheetChange = async (newSheet: string) => {
    if (!file) return;
    await handleFileSelect(file, newSheet);
  };

  // Process Pasted Text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('붙여넣을 엑셀 또는 텍스트 데이터를 입력해주세요.');
      return;
    }
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const rawRows = parsePastedText(pastedText);
      if (rawRows.length === 0) {
        setErrorMessage('유효한 데이터 행을 찾을 수 없습니다. 표 데이터를 복사했는지 확인해주세요.');
        return;
      }

      const result = analyzeExcelData(rawRows, existingItems);
      setFile(new File([pastedText], '클립보드_붙여넣기_데이터.txt', { type: 'text/plain' }));
      setAnalysis(result);
      setParsedRows(result.allParsedRows);
      setInvalidRows(result.invalidRows);
      setAvailableSheets([]);
    } catch (err: any) {
      console.error('Paste parse error:', err);
      setErrorMessage(`데이터 분석 중 오류가 발생했습니다: ${err?.message || ''}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Sample Data
  const handleLoadSampleData = () => {
    setErrorMessage(null);
    const mockData = getMockExcelData();
    const result = analyzeParsedRows(mockData, existingItems);
    setFile(new File([], '스마트랙_테스트_샘플데이터.xlsx'));
    setAnalysis(result);
    setParsedRows(mockData);
    setInvalidRows([]);
    setAvailableSheets(['샘플시트']);
    setSelectedSheet('샘플시트');
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Re-run duplicate analysis when parsedRows change
  const refreshAnalysis = (updatedRows: ParsedExcelRow[]) => {
    const updated = analyzeParsedRows(updatedRows, existingItems, invalidRows);
    setAnalysis(updated);
  };

  // Row selection toggle
  const handleToggleSelectRow = (id: string) => {
    const next = parsedRows.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r));
    setParsedRows(next);
  };

  const handleSelectAll = (select: boolean) => {
    const next = parsedRows.map((r) => ({ ...r, selected: select }));
    setParsedRows(next);
  };

  const handleSelectUnprintedOnly = () => {
    const next = parsedRows.map((r) => ({ ...r, selected: !r.isPrinted }));
    setParsedRows(next);
  };

  // Toggle printed status for selected rows
  const handleTogglePrintedStatus = (ids: string[], isPrinted: boolean) => {
    const now = new Date().toISOString();
    const next = parsedRows.map((r) => {
      if (ids.includes(r.id)) {
        return {
          ...r,
          isPrinted,
          lastPrintedAt: isPrinted ? now : undefined,
          printCount: isPrinted ? (r.printCount || 0) + 1 : r.printCount,
        };
      }
      return r;
    });
    setParsedRows(next);
    refreshAnalysis(next);
  };

  // Inline Editing
  const handleStartEdit = (row: ParsedExcelRow) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleSaveEdit = (id: string) => {
    if (!editFormData.name || !editFormData.name.trim()) {
      alert('품목명은 필수 입력 항목입니다.');
      return;
    }
    const next = parsedRows.map((r) => {
      if (r.id !== id) return r;
      const wh = (editFormData.warehouse !== undefined ? editFormData.warehouse : (r.warehouse || '')).trim();
      const rk = (editFormData.rackLocation !== undefined ? editFormData.rackLocation : r.rackLocation).trim();
      const parsedLoc = parseWarehouseAndRack(rk, wh);
      return {
        ...r,
        ...editFormData,
        code: (editFormData.code || r.code || '').trim(),
        name: (editFormData.name || '').trim(),
        spec: (editFormData.spec || '').trim(),
        category: (editFormData.category || '기타').trim(),
        warehouse: parsedLoc.warehouse,
        rackLocation: parsedLoc.displayString,
        quantity: Number(editFormData.quantity) || 0,
        unit: (editFormData.unit || 'EA').trim(),
        safetyStock: Number(editFormData.safetyStock) || 0,
        price: Number(editFormData.price) || 0,
        supplier: (editFormData.supplier || '').trim(),
        notes: (editFormData.notes || '').trim(),
      } as ParsedExcelRow;
    });
    setParsedRows(next);
    refreshAnalysis(next);
    setEditingRowId(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleDeleteRow = (id: string) => {
    const next = parsedRows.filter((r) => r.id !== id);
    setParsedRows(next);
    refreshAnalysis(next);
  };

  const handleAddNewRow = () => {
    const newRowIndex = parsedRows.length > 0 ? Math.max(...parsedRows.map((r) => r.rowIndex)) + 1 : 2;
    const newRow: ParsedExcelRow = {
      id: `excel-row-new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `ITEM-${Date.now().toString().slice(-4)}`,
      name: '신규 품목',
      spec: '',
      category: '기타',
      warehouse: '본관창고',
      rackLocation: '본관창고',
      quantity: 1,
      unit: 'EA',
      safetyStock: 0,
      price: 0,
      supplier: '',
      notes: '',
      rowIndex: newRowIndex,
      isPrinted: false,
      selected: true,
      printCount: 1,
    };
    const next = [newRow, ...parsedRows];
    setParsedRows(next);
    refreshAnalysis(next);
    handleStartEdit(newRow);
  };

  // Global duplicate strategy change
  const handleGlobalActionChange = (action: 'skip' | 'overwrite' | 'add_qty') => {
    setGlobalDuplicateAction(action);
  };

  // Warehouse Management Actions
  const handleAddNewWarehouseAndApply = (e: React.FormEvent) => {
    e.preventDefault();
    const wh = newWarehouseInput.trim();
    if (!wh) return;

    if (!customWarehouses.includes(wh)) {
      setCustomWarehouses((prev) => [...prev, wh]);
    }

    // Apply to target scope
    const next = parsedRows.map((r) => {
      let shouldApply = false;
      if (newWarehouseScope === 'all') shouldApply = true;
      else if (newWarehouseScope === 'selected' && r.selected) shouldApply = true;
      else if (newWarehouseScope === 'unassigned' && (r.rackLocation === '미입력' || r.rackLocation === '미지정' || !r.rackLocation)) shouldApply = true;

      if (shouldApply) {
        let updatedRack = wh;
        if (r.rackLocation && r.rackLocation !== '미입력' && r.rackLocation !== '미지정') {
          // If rack already had details like A-01-1, combine as "신규창고 A-01-1"
          const parts = r.rackLocation.split(' ');
          if (parts.length > 1) {
            updatedRack = `${wh} ${parts.slice(1).join(' ')}`;
          } else {
            updatedRack = `${wh} ${r.rackLocation}`;
          }
        }
        return { ...r, rackLocation: updatedRack };
      }
      return r;
    });

    setParsedRows(next);
    refreshAnalysis(next);
    setNewWarehouseInput('');
  };

  // Map / Rename Warehouse across parsed rows
  const handleMapWarehouse = (sourceWh: string, targetWh: string) => {
    if (!sourceWh || !targetWh || sourceWh === targetWh) return;

    const next = parsedRows.map((r) => {
      const currentWh = extractWarehouseName(r.rackLocation);
      if (currentWh === sourceWh) {
        let updatedLoc = targetWh;
        if (r.rackLocation.includes(' ')) {
          const detail = r.rackLocation.slice(sourceWh.length).trim();
          updatedLoc = `${targetWh} ${detail}`;
        }
        return { ...r, rackLocation: updatedLoc };
      }
      return r;
    });

    setParsedRows(next);
    refreshAnalysis(next);
    setSourceWarehouseToMap('');
    setTargetWarehouseToMap('');
  };

  // Convert ParsedExcelRow to InventoryItem format
  const convertRowToInventoryItem = (row: ParsedExcelRow): InventoryItem => {
    const now = new Date().toISOString();
    const parsedLoc = parseWarehouseAndRack(row.rackLocation, row.warehouse);
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: row.code.trim(),
      name: row.name.trim(),
      spec: row.spec.trim(),
      category: row.category.trim() || 'A등급',
      warehouse: parsedLoc.warehouse,
      rackLocation: parsedLoc.displayString,
      quantity: row.quantity,
      unit: row.unit.trim() || 'EA',
      safetyStock: row.safetyStock,
      price: row.price,
      supplier: row.supplier.trim(),
      notes: row.notes.trim(),
      createdAt: now,
      updatedAt: now,
      isPrinted: row.isPrinted || false,
      lastPrintedAt: row.lastPrintedAt,
      printCount: row.printCount || 1,
    };
  };

  // Direct 80x60 Label Print from Selected Rows
  const handlePrintSelected = () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      alert('출력할 품목을 선택해주세요.');
      return;
    }

    const itemsToPrint = selectedRows.map(convertRowToInventoryItem);

    // Auto mark as printed
    const selectedIds = selectedRows.map((r) => r.id);
    handleTogglePrintedStatus(selectedIds, true);

    if (onPrintDirect) {
      onPrintDirect(itemsToPrint);
    }
  };

  const handlePrintSingleRow = (row: ParsedExcelRow) => {
    handleTogglePrintedStatus([row.id], true);
    if (onPrintDirect) {
      onPrintDirect([convertRowToInventoryItem(row)]);
    }
  };

  // Final Import Confirmation
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) {
      alert('등록할 품목 데이터가 없습니다.');
      return;
    }

    const itemsToInsert: InventoryItem[] = [];
    const itemsToUpdate: InventoryItem[] = [];

    const existingByCode = new Map<string, InventoryItem>();
    const existingByNameRack = new Map<string, InventoryItem>();

    existingItems.forEach((it) => {
      if (it.code) existingByCode.set(it.code.trim().toUpperCase(), it);
      const nrKey = `${it.name.trim().toLowerCase()}_${(it.rackLocation || '').trim().toLowerCase()}`;
      existingByNameRack.set(nrKey, it);
    });

    parsedRows.forEach((row) => {
      const codeUpper = row.code.trim().toUpperCase();
      const nrKey = `${row.name.trim().toLowerCase()}_${(row.rackLocation || '').trim().toLowerCase()}`;

      const matchedExisting = existingByCode.get(codeUpper) || existingByNameRack.get(nrKey);

      if (matchedExisting) {
        const isSameSupplier = (matchedExisting.supplier || '').trim().toLowerCase() === (row.supplier || '').trim().toLowerCase();

        if (isSameSupplier) {
          // 중복 품목 & 동일 입고업체인 경우: 제외(기본), 덮어쓰기, 수량합산
          if (globalDuplicateAction === 'skip') {
            return;
          } else if (globalDuplicateAction === 'overwrite') {
            const parsedLoc = parseWarehouseAndRack(row.rackLocation, row.warehouse);
            itemsToUpdate.push({
              ...matchedExisting,
              name: row.name.trim(),
              spec: row.spec.trim(),
              category: row.category.trim() || matchedExisting.category,
              warehouse: parsedLoc.warehouse,
              rackLocation: parsedLoc.displayString,
              quantity: row.quantity,
              unit: row.unit.trim() || matchedExisting.unit,
              safetyStock: row.safetyStock,
              price: row.price,
              supplier: row.supplier.trim() || matchedExisting.supplier,
              notes: row.notes.trim() || matchedExisting.notes,
              updatedAt: new Date().toISOString(),
              isPrinted: row.isPrinted !== undefined ? row.isPrinted : matchedExisting.isPrinted,
              lastPrintedAt: row.lastPrintedAt || matchedExisting.lastPrintedAt,
              printCount: row.printCount || matchedExisting.printCount,
            });
          } else if (globalDuplicateAction === 'add_qty') {
            itemsToUpdate.push({
              ...matchedExisting,
              quantity: (matchedExisting.quantity || 0) + row.quantity,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // 입고업체(supplier)가 다른 경우에는 신규 품목으로 추가!
          itemsToInsert.push(convertRowToInventoryItem(row));
        }
      } else {
        itemsToInsert.push(convertRowToInventoryItem(row));
      }
    });

    onImportComplete(itemsToInsert, itemsToUpdate);
    onClose();
  };

  // Filter parsed rows for table display
  const displayedRows = useMemo(() => {
    let list = parsedRows;

    if (activeTab === 'unprinted') {
      list = list.filter((r) => !r.isPrinted);
    } else if (activeTab === 'printed') {
      list = list.filter((r) => r.isPrinted);
    } else if (activeTab === 'duplicates') {
      const dupRowIndices = new Set((analysis?.duplicates || []).map((d) => d.rowIndex));
      list = list.filter((r) => dupRowIndices.has(r.rowIndex));
    }

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.spec.toLowerCase().includes(q) ||
          r.rackLocation.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q)
      );
    }

    return list;
  }, [parsedRows, activeTab, tableSearch, analysis]);

  const selectedCount = parsedRows.filter((r) => r.selected).length;
  const printedCount = parsedRows.filter((r) => r.isPrinted).length;
  const unprintedCount = parsedRows.filter((r) => !r.isPrinted).length;
  const duplicateCount = analysis?.duplicateCount || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  엑셀 일괄 등록 및 80×60mm 라벨 출력
                </h3>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-500/40 text-indigo-100 border border-indigo-300/30">
                  창고 자동 감지 & 신규 창고 추가 지원
                </span>
              </div>
              <p className="text-2xs text-indigo-200 mt-0.5">
                대용량 엑셀 파일 업로드, 창고명 매핑, 중복 검증, 수정 및 라벨 인쇄를 한 번에 처리합니다
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          
          {/* Upload Method Selector (If no file uploaded yet) */}
          {!file ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    uploadMethod === 'file'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-4 h-4 mx-auto mb-1 opacity-90" />
                  <span>엑셀 파일 직접 업로드</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMethod('paste')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    uploadMethod === 'paste'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clipboard className="w-4 h-4 mx-auto mb-1 opacity-90" />
                  <span>클립보드 붙여넣기 (Ctrl+V)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMethod('sample')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    uploadMethod === 'sample'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 opacity-90" />
                  <span>샘플 데이터 즉시 불러오기</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Method 1: File Drag & Drop */}
              {uploadMethod === 'file' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    엑셀 파일 (.xlsx, .xls, .csv)을 끌어다 놓거나 클릭하여 선택하세요
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
                    창고명, 품목코드, 품명, 규격, 수량, 안전재고 등 다양한 컬럼 양식을 자동으로 감지하여 스마트하게 파싱합니다.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              )}

              {/* Method 2: Paste Clipboard Text */}
              {uploadMethod === 'paste' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clipboard className="w-4 h-4 text-indigo-600" />
                      <span>엑셀/스프레드시트에서 복사한 텍스트 붙여넣기</span>
                    </label>
                    <span className="text-2xs text-slate-400">
                      엑셀 시트에서 범위를 선택하고 Ctrl+C 한 뒤 아래에 Ctrl+V 하세요
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="창고&#9;품목코드&#9;품목명&#9;규격&#9;수량&#9;랙위치&#10;1창고&#9;ITEM-01&#9;인버터 3.7kW&#9;380V&#9;15&#9;A-01-1"
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      내용 지우기
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      disabled={!pastedText.trim() || isProcessing}
                      className="px-5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>붙여넣은 데이터 분석 및 등록</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Method 3: Instant Sample Data */}
              {uploadMethod === 'sample' && (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">준비된 엑셀 파일이 없으신가요?</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                      전자부품, 기계부품, 원자재 등 다양한 실제 품목 데이터 5건을 1초 만에 불러와서 엑셀 일괄 등록과 라벨 출력 기능을 바로 테스트해보실 수 있습니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>샘플 엑셀 데이터 즉시 불러오기</span>
                  </button>
                </div>
              )}

              {/* Standard Template Download Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 gap-2 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>SmartRack 표준 엑셀 서식을 내려받아 작성하시면 가장 완벽하게 매핑됩니다.</span>
                </div>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="flex items-center space-x-1.5 font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>표준 엑셀 서식 다운로드</span>
                </button>
              </div>
            </div>
          ) : (
            /* Uploaded Excel Review & Edit & Print Workspace */
            <div className="space-y-3.5">
              {/* File & Sheet Top Bar */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-2 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{file.name}</span>
                  <span className="text-2xs text-slate-400 font-mono">({parsedRows.length}개 품목 감지)</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Multi-sheet selector */}
                  {availableSheets.length > 1 && (
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="font-semibold text-slate-500 text-2xs">시트 선택:</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        {availableSheets.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                      setInvalidRows([]);
                      setEditingRowId(null);
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>다른 파일 선택</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">총 엑셀 품목</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{parsedRows.length}건</p>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl shadow-2xs">
                  <p className="text-2xs font-bold text-indigo-700 uppercase tracking-wider">출력 선택됨</p>
                  <p className="text-xl font-bold text-indigo-700 mt-0.5">{selectedCount}건</p>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-2xs">
                  <p className="text-2xs font-bold text-emerald-700 uppercase tracking-wider">✅ 출력 완료</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{printedCount}건</p>
                </div>

                <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-2xs font-bold text-slate-500 uppercase tracking-wider">🏷️ 미출력</p>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">{unprintedCount}건</p>
                </div>

                <div className={`p-3 rounded-xl border shadow-2xs ${
                  duplicateCount > 0 ? 'bg-amber-50/70 border-amber-300 text-amber-900 ring-1 ring-amber-300' : 'bg-white border-slate-200'
                }`}>
                  <p className="text-2xs font-bold uppercase tracking-wider text-amber-800">⚠️ 중복 감지</p>
                  <p className="text-xl font-bold text-amber-900 mt-0.5">{duplicateCount}건</p>
                </div>
              </div>

              {/* 🌟 New Warehouse Detection & Warehouse Addition Panel */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-md border border-indigo-900/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">
                      창고명 감지 & 신규 창고 추가 관리
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-2xs text-slate-300">
                    <span>감지된 창고:</span>
                    {detectedWarehouses.map((wh) => (
                      <span
                        key={wh.name}
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          wh.isNew
                            ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300 font-bold'
                            : wh.isUnassigned
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                        title={wh.isNew ? '신규 감지된 창고명' : ''}
                      >
                        {wh.name} ({wh.count}건) {wh.isNew && '✨신규'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add New Warehouse or Assign Form */}
                <form
                  onSubmit={handleAddNewWarehouseAndApply}
                  className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-800/60 text-xs"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-2xs text-indigo-200 font-semibold">신규 창고명 추가/지정:</span>
                    <input
                      type="text"
                      value={newWarehouseInput}
                      onChange={(e) => setNewWarehouseInput(e.target.value)}
                      placeholder="예: 2공장 창고, A동 창고"
                      className="px-2.5 py-1 bg-slate-800 border border-indigo-700/80 rounded-lg text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-2xs text-indigo-200">적용 대상:</span>
                    <select
                      value={newWarehouseScope}
                      onChange={(e) => setNewWarehouseScope(e.target.value as any)}
                      className="px-2 py-1 bg-slate-800 border border-indigo-700/80 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="unassigned">미입력 품목에만 지정</option>
                      <option value="selected">선택된 품목에만 지정</option>
                      <option value="all">파일 전체 품목에 지정</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!newWarehouseInput.trim()}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white rounded-lg font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>창고명 등록 및 일괄 적용</span>
                  </button>
                </form>
              </div>

              {/* Duplicate Strategy Banner (if any) */}
              {duplicateCount > 0 && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-amber-900">
                        기존 재고와 중복되는 품목이 {duplicateCount}건 발견되었습니다. 일괄 처리 방식을 선택하세요:
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGlobalActionChange('skip')}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        globalDuplicateAction === 'skip'
                          ? 'bg-white border-amber-500 ring-2 ring-amber-400 font-bold shadow-2xs text-amber-900'
                          : 'bg-white/80 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <p className="text-xs">1. 중복 데이터 제외 (건너뛰기)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGlobalActionChange('overwrite')}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        globalDuplicateAction === 'overwrite'
                          ? 'bg-white border-amber-500 ring-2 ring-amber-400 font-bold shadow-2xs text-amber-900'
                          : 'bg-white/80 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <p className="text-xs">2. 기존 데이터 덮어쓰기 (수정)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGlobalActionChange('add_qty')}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        globalDuplicateAction === 'add_qty'
                          ? 'bg-white border-amber-500 ring-2 ring-amber-400 font-bold shadow-2xs text-amber-900'
                          : 'bg-white/80 border-amber-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <p className="text-xs">3. 현재고에 수량 합산 (+추가)</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar & Filters */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                  {/* Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'all'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      전체 ({parsedRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('unprinted')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'unprinted'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      🏷️ 미출력 ({unprintedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('printed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'printed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      ✅ 출력완료 ({printedCount})
                    </button>
                    {duplicateCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('duplicates')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'duplicates'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        ⚠️ 중복 ({duplicateCount})
                      </button>
                    )}
                  </div>

                  {/* Search inside Excel table */}
                  <div className="relative max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="품목코드, 품명, 랙위치 검색..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Sub-toolbar: Selection controls & Print button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-500 mr-1">
                      선택 {selectedCount}건:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-2xs transition-colors cursor-pointer"
                    >
                      전체 선택
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-2xs transition-colors cursor-pointer"
                    >
                      선택 해제
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectUnprintedOnly}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-2xs border border-indigo-200 transition-colors cursor-pointer"
                    >
                      🏷️ 미출력 품목만 선택
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewRow}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md font-semibold text-2xs border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      <span>+ 품목 행 추가</span>
                    </button>
                  </div>

                  {/* Print & Status Mark Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const selectedIds = parsedRows.filter((r) => r.selected).map((r) => r.id);
                        handleTogglePrintedStatus(selectedIds, true);
                      }}
                      disabled={selectedCount === 0}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                      title="선택한 품목을 '출력 완료' 상태로 표시"
                    >
                      ✓ 출력완료로 표시
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedIds = parsedRows.filter((r) => r.selected).map((r) => r.id);
                        handleTogglePrintedStatus(selectedIds, false);
                      }}
                      disabled={selectedCount === 0}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                      title="선택한 품목을 '미출력' 상태로 초기화"
                    >
                      미출력으로 초기화
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintSelected}
                      disabled={selectedCount === 0}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>선택 품목 ({selectedCount}건) 80×60 라벨 바로 출력</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Excel Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 text-2xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={displayedRows.length > 0 && displayedRows.every((r) => r.selected)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const displayedIds = new Set(displayedRows.map((r) => r.id));
                            const next = parsedRows.map((r) =>
                              displayedIds.has(r.id) ? { ...r, selected: isChecked } : r
                            );
                            setParsedRows(next);
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 w-12 text-center">NO</th>
                      <th className="p-3 w-28">출력상태</th>
                      <th className="p-3 w-32">품목코드</th>
                      <th className="p-3">품목명</th>
                      <th className="p-3 w-36">규격/사양</th>
                      <th className="p-3 w-32">창고</th>
                      <th className="p-3 w-28">랙위치</th>
                      <th className="p-3 w-24 text-right">수량</th>
                      <th className="p-3 w-24">분류</th>
                      <th className="p-3 w-28">공급처</th>
                      <th className="p-3 w-24 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-slate-400 text-xs">
                          조건에 맞는 엑셀 품목이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((row) => {
                        const isEditing = editingRowId === row.id;
                        const loc = parseWarehouseAndRack(row.rackLocation, row.warehouse);

                        return (
                          <tr
                            key={row.id}
                            className={`hover:bg-indigo-50/40 transition-colors ${
                              row.selected ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={!!row.selected}
                                onChange={() => handleToggleSelectRow(row.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Row Index */}
                            <td className="p-3 text-center text-slate-400 font-mono text-2xs">
                              {row.rowIndex}
                            </td>

                            {/* Print Status Badge & Toggle */}
                            <td className="p-3 whitespace-nowrap">
                              {row.isPrinted ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePrintedStatus([row.id], false)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                                  title="클릭하여 '미출력' 상태로 변경"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>출력완료</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePrintedStatus([row.id], true)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
                                  title="클릭하여 '출력완료' 상태로 변경"
                                >
                                  <span>미출력</span>
                                </button>
                              )}
                            </td>

                            {/* Item Code (Editable) */}
                            <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.code || ''}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, code: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-indigo-500 rounded font-mono text-xs focus:outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-slate-800">{row.code}</span>
                              )}
                            </td>

                            {/* Name (Editable) */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.name || ''}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, name: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-indigo-500 rounded font-medium text-xs focus:outline-none"
                                />
                              ) : (
                                <span className="font-bold text-slate-900">{row.name}</span>
                              )}
                            </td>

                            {/* Spec (Editable) */}
                            <td className="p-3 text-slate-600">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.spec || ''}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, spec: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-indigo-500 rounded text-xs focus:outline-none"
                                />
                              ) : (
                                <span>{row.spec || '-'}</span>
                              )}
                            </td>

                            {/* Warehouse (Editable) */}
                            <td className="p-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.warehouse !== undefined ? editFormData.warehouse : loc.warehouse}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, warehouse: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-indigo-500 rounded text-xs focus:outline-none"
                                  placeholder="예: 특장자재창고-화성"
                                />
                              ) : (
                                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-2xs border border-slate-200">
                                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{loc.warehouse}</span>
                                </div>
                              )}
                            </td>

                            {/* Rack Location (Editable) */}
                            <td className="p-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.rackLocation !== undefined ? editFormData.rackLocation : (loc.isUnassigned ? '' : loc.rack)}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, rackLocation: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-indigo-500 rounded font-mono text-xs focus:outline-none"
                                  placeholder="예: A-01-1 또는 미입력"
                                />
                              ) : loc.isUnassigned ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-2xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                  <span>미입력</span>
                                </span>
                              ) : (
                                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold font-mono text-2xs">
                                  <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  <span>{loc.rack}</span>
                                </div>
                              )}
                            </td>

                            {/* Quantity & Unit (Editable) */}
                            <td className="p-3 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center space-x-1 justify-end">
                                  <input
                                    type="number"
                                    value={editFormData.quantity ?? 0}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        quantity: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 px-1.5 py-1 bg-white border border-indigo-500 rounded font-mono text-xs text-right focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={editFormData.unit || 'EA'}
                                    onChange={(e) =>
                                      setEditFormData({ ...editFormData, unit: e.target.value })
                                    }
                                    className="w-12 px-1 py-1 bg-white border border-indigo-500 rounded text-2xs uppercase text-center focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <span className="font-bold font-mono text-slate-900">
                                  {row.quantity.toLocaleString()} <span className="font-normal text-slate-500 text-2xs">{row.unit}</span>
                                </span>
                              )}
                            </td>

                            {/* Category (Editable) */}
                            <td className="p-3 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.category || ''}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, category: e.target.value })
                                  }
                                  className="w-20 px-2 py-1 bg-white border border-indigo-500 rounded text-xs focus:outline-none"
                                />
                              ) : (
                                <span className="text-2xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                  {row.category || '기타'}
                                </span>
                              )}
                            </td>

                            {/* Supplier (Editable) */}
                            <td className="p-3 text-slate-600 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.supplier || ''}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, supplier: e.target.value })
                                  }
                                  className="w-24 px-2 py-1 bg-white border border-indigo-500 rounded text-xs focus:outline-none"
                                />
                              ) : (
                                <span className="text-2xs text-slate-500" title={row.supplier || ''}>
                                  {cleanSupplierDisplayName(row.supplier) || '-'}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-center whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(row.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-2xs font-bold shadow-2xs cursor-pointer"
                                  >
                                    저장
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-2xs font-medium cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(row)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="이 행 내용 직접 수정"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePrintSingleRow(row)}
                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="이 품목 80x60 라벨 바로 출력"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="이 행 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {file ? (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setParsedRows([]);
                setInvalidRows([]);
                setEditingRowId(null);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>다른 파일 / 다른 방식으로 다시 불러오기</span>
            </button>
          ) : (
            <div className="text-2xs text-slate-400">
              * 품목코드가 누락되어도 시스템이 표준 코드를 자동 발급하여 안전하게 등록됩니다.
            </div>
          )}

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              닫기
            </button>

            {file && (
              <>
                <button
                  type="button"
                  onClick={handlePrintSelected}
                  disabled={selectedCount === 0}
                  className="px-4 py-2 text-xs font-bold rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>선택 라벨 출력 ({selectedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>재고 데이터베이스에 최종 등록</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
