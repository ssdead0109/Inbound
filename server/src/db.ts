import fs from 'fs';
import path from 'path';
import { InventoryItem, StockLog, LabelPrintConfig } from './types';
import { INITIAL_ITEMS, INITIAL_LOGS } from './sampleData';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export const DEFAULT_LABEL_CONFIG: LabelPrintConfig = {
  presetId: 'any_v3310',
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
  showLocationBadge: false,
  showPrice: false,
  showSupplier: true,
  showBorderCutGuide: false,
  showDate: true,
  showItemCodeBarcode: true,
  showCompanyName: false,
  companyName: 'SMART RACK SYSTEM',
  fontSize: 'large',
  qrIncludeDetails: true,
};

// In-memory caches for maximum read/write performance
let itemsCache: InventoryItem[] = [];
let logsCache: StockLog[] = [];
let configCache: LabelPrintConfig = DEFAULT_LABEL_CONFIG;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initDatabase() {
  ensureDataDir();

  // Load items
  if (fs.existsSync(ITEMS_FILE)) {
    try {
      const data = fs.readFileSync(ITEMS_FILE, 'utf-8');
      itemsCache = JSON.parse(data);
      console.log(`[DB] Loaded ${itemsCache.length} items from ${ITEMS_FILE}`);
    } catch (err) {
      console.error('[DB] Failed reading items file, initializing sample data:', err);
      itemsCache = [...INITIAL_ITEMS];
      saveItemsToDisk();
    }
  } else {
    itemsCache = [...INITIAL_ITEMS];
    saveItemsToDisk();
  }

  // If itemsCache is empty, auto-populate from real ERP inbound slips
  if (itemsCache.length === 0) {
    try {
      const slipsFile = path.join(DATA_DIR, 'inbound_slips.json');
      if (fs.existsSync(slipsFile)) {
        const slips = JSON.parse(fs.readFileSync(slipsFile, 'utf-8'));
        const map = new Map<string, InventoryItem>();
        for (const s of slips) {
          if (!Array.isArray(s.items)) continue;
          for (const it of s.items) {
            if (!it.itemCode || map.has(it.itemCode)) continue;
            map.set(it.itemCode, {
              id: `item-${it.itemCode}`,
              code: it.itemCode,
              name: it.itemName,
              spec: it.spec || '',
              category: it.itemName.includes('CYLINDER') ? '실린더' : it.itemName.includes('VALVE') ? '밸브' : '일반',
              warehouse: it.warehouse || '특장자재창고',
              rackLocation: 'A-01-01',
              quantity: it.orderQty || 10,
              unit: it.unit || 'EA',
              safetyStock: 5,
              price: it.unitPrice || 0,
              supplier: s.supplierName || '',
              notes: s.memo || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        itemsCache = Array.from(map.values());
        saveItemsToDisk();
        console.log(`[DB] Auto-populated ${itemsCache.length} real ERP items from inbound slips.`);
      }
    } catch (err) {
      console.warn('[DB] Failed auto-populating items:', err);
    }
  }

  // Load logs
  if (fs.existsSync(LOGS_FILE)) {
    try {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      logsCache = JSON.parse(data);
      console.log(`[DB] Loaded ${logsCache.length} logs from ${LOGS_FILE}`);
    } catch (err) {
      console.error('[DB] Failed reading logs file, initializing sample data:', err);
      logsCache = [...INITIAL_LOGS];
      saveLogsToDisk();
    }
  } else {
    logsCache = [...INITIAL_LOGS];
    saveLogsToDisk();
  }

  // Load config
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      configCache = { ...DEFAULT_LABEL_CONFIG, ...JSON.parse(data) };
      console.log(`[DB] Loaded label config`);
    } catch (err) {
      configCache = DEFAULT_LABEL_CONFIG;
      saveConfigToDisk();
    }
  } else {
    configCache = DEFAULT_LABEL_CONFIG;
    saveConfigToDisk();
  }
}

export function saveItemsToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(itemsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save items to disk:', err);
  }
}

export function saveLogsToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save logs to disk:', err);
  }
}

export function saveConfigToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save config to disk:', err);
  }
}

// Item Operations
export function getAllItems(): InventoryItem[] {
  return itemsCache;
}

export function getItemById(id: string): InventoryItem | undefined {
  return itemsCache.find((it) => it.id === id);
}

export function getItemByCode(code: string): InventoryItem | undefined {
  const clean = code.trim().toLowerCase();
  return itemsCache.find((it) => it.code.trim().toLowerCase() === clean);
}

export function createItem(item: InventoryItem): InventoryItem {
  itemsCache.unshift(item);
  saveItemsToDisk();
  return item;
}

export function updateItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
  const index = itemsCache.findIndex((it) => it.id === id);
  if (index === -1) return null;

  itemsCache[index] = {
    ...itemsCache[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveItemsToDisk();
  return itemsCache[index];
}

export function deleteItem(id: string): boolean {
  const initialLen = itemsCache.length;
  itemsCache = itemsCache.filter((it) => it.id !== id);
  if (itemsCache.length !== initialLen) {
    saveItemsToDisk();
    return true;
  }
  return false;
}

export function deleteItemsBatch(ids: string[]): number {
  const idSet = new Set(ids);
  const initialLen = itemsCache.length;
  itemsCache = itemsCache.filter((it) => !idSet.has(it.id));
  const deletedCount = initialLen - itemsCache.length;
  if (deletedCount > 0) {
    saveItemsToDisk();
  }
  return deletedCount;
}

export function bulkUpsertItems(newItems: InventoryItem[], mode: 'overwrite' | 'skip' | 'add_qty' = 'overwrite'): { added: number; updated: number } {
  let added = 0;
  let updated = 0;
  const existingMap = new Map<string, number>();
  itemsCache.forEach((it, idx) => {
    existingMap.set(it.code.trim().toLowerCase(), idx);
  });

  for (const item of newItems) {
    const key = item.code.trim().toLowerCase();
    if (existingMap.has(key)) {
      const idx = existingMap.get(key)!;
      if (mode === 'overwrite') {
        itemsCache[idx] = { ...itemsCache[idx], ...item, updatedAt: new Date().toISOString() };
        updated++;
      } else if (mode === 'add_qty') {
        itemsCache[idx] = {
          ...itemsCache[idx],
          quantity: itemsCache[idx].quantity + item.quantity,
          updatedAt: new Date().toISOString(),
        };
        updated++;
      }
    } else {
      itemsCache.push(item);
      existingMap.set(key, itemsCache.length - 1);
      added++;
    }
  }

  saveItemsToDisk();
  return { added, updated };
}

export function resetItemsToSample(): InventoryItem[] {
  itemsCache = [...INITIAL_ITEMS];
  saveItemsToDisk();
  return itemsCache;
}

// Log Operations
export function getAllLogs(): StockLog[] {
  return logsCache;
}

export function createLog(log: StockLog): StockLog {
  logsCache.unshift(log);
  saveLogsToDisk();
  return log;
}

export function deleteLog(id: string): boolean {
  const initialLen = logsCache.length;
  logsCache = logsCache.filter((l) => l.id !== id);
  if (logsCache.length !== initialLen) {
    saveLogsToDisk();
    return true;
  }
  return false;
}

// Config Operations
export function getLabelConfig(): LabelPrintConfig {
  return configCache;
}

export function updateLabelConfig(newConfig: LabelPrintConfig): LabelPrintConfig {
  configCache = { ...configCache, ...newConfig };
  saveConfigToDisk();
  return configCache;
}
