import { InventoryItem, StockLog, LabelPrintConfig } from '../types/inventory';
import { INITIAL_ITEMS, INITIAL_LOGS, generate5000DummyItems } from './sampleData';

const STORAGE_KEYS = {
  ITEMS: 'smartrack_inventory_items_v5',
  LOGS: 'smartrack_stock_logs_v1',
  CONFIG: 'smartrack_label_config_v1',
};

export const DEFAULT_LABEL_CONFIG: LabelPrintConfig = {
  presetId: 'any_v3310', // 기본 애니라벨 V3310 (24칸)
  widthMm: 63.5,
  heightMm: 33.9,
  cols: 3,
  rows: 8,
  marginTopMm: 12.9,
  marginLeftMm: 7.2,
  gapXMm: 2.5,
  gapYMm: 0.0,
  layout: 'portrait',
  showNotes: true,
  showLocationBadge: false, // 창고/랙 위치 표기 비활성화
  showPrice: false,
  showSupplier: true,
  showBorderCutGuide: false, // 초기 실행 시 재단 가이드 실선 OFF
  showDate: true,
  showItemCodeBarcode: true,
  showCompanyName: false,   // 초기 실행 시 상단 회사명 표기 체크 해제
  companyName: 'SMART RACK SYSTEM',
  fontSize: 'large',
  qrIncludeDetails: true,
};

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If user had previous small sample data (< 50 items), upgrade to full 5,000 items
      if (parsed.length < 50) {
        saveItems(INITIAL_ITEMS);
        return INITIAL_ITEMS;
      }
      return parsed;
    }
    saveItems(INITIAL_ITEMS);
    return INITIAL_ITEMS;
  } catch (err) {
    console.error('Failed to load items from storage:', err);
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to storage:', err);
  }
}

export function resetTo5000DummyItems(): InventoryItem[] {
  const fresh5000 = generate5000DummyItems();
  saveItems(fresh5000);
  return fresh5000;
}

export function loadLogs(): StockLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      saveLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LOGS;
  } catch (err) {
    console.error('Failed to load logs from storage:', err);
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: StockLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to storage:', err);
  }
}

export function loadLabelConfig(): LabelPrintConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_LABEL_CONFIG;
    return { ...DEFAULT_LABEL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LABEL_CONFIG;
  }
}

export function saveLabelConfig(config: LabelPrintConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save label config:', err);
  }
}
