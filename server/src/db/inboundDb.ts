import fs from 'fs';
import path from 'path';
import { InboundSlip, InboundItem, InboundReceivePayload, InboundStats } from '../types/inbound';
import { getItemByCode, updateItem, createItem, createLog, getAllItems } from '../db';
import { StockLog } from '../types';
import { isDummySlip } from '../utils/dummyHelper';
import {
  isSupabaseConfigured,
  fetchSlipsFromSupabase,
  fetchSlipByNoFromSupabase,
  upsertSlipToSupabase,
  processInboundReceiveInSupabase,
  cancelInboundReceiveInSupabase,
} from './supabaseAdapter';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const INBOUND_FILE = path.join(DATA_DIR, 'inbound_slips.json');
// Real Inbound Slips Storage (오프라인/더미 모드용 기본 현장 전표 탑재)
export const INITIAL_INBOUND_SLIPS: InboundSlip[] = [];

let inboundCache: InboundSlip[] = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initInboundDatabase() {
  ensureDataDir();
  if (fs.existsSync(INBOUND_FILE)) {
    try {
      const raw = fs.readFileSync(INBOUND_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      inboundCache = Array.isArray(parsed) ? parsed.filter((s) => !isDummySlip(s)) : [];
      saveInboundToDisk();
      console.log(`[Inbound DB] Loaded ${inboundCache.length} real inbound slips from file.`);
    } catch (err) {
      console.error('[Inbound DB] Failed reading file, resetting to clean state:', err);
      inboundCache = [];
      saveInboundToDisk();
    }
  } else {
    inboundCache = [];
    saveInboundToDisk();
  }
}

export function saveInboundToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(INBOUND_FILE, JSON.stringify(inboundCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Inbound DB] Failed saving to disk:', err);
  }
}

/**
 * ERP 또는 외부에서 조회된 전표를 로컬 캐시 및 디스크, Supabase에 병합 보존
 */
export function upsertInboundSlips(slips: InboundSlip[]): void {
  if (!slips || slips.length === 0) return;
  const map = new Map<string, InboundSlip>();
  for (const s of inboundCache) {
    if (s && s.slipNo) map.set(s.slipNo, s);
  }
  let hasNew = false;
  for (const s of slips) {
    if (s && s.slipNo) {
      map.set(s.slipNo, s);
      hasNew = true;
      if (isSupabaseConfigured()) {
        upsertSlipToSupabase(s).catch(() => {});
      }
    }
  }
  if (hasNew) {
    inboundCache = Array.from(map.values());
    saveInboundToDisk();
  }
}

/**
 * Supabase 클라우드 DB가 구성된 경우 Supabase에서 최신 전표 목록을 가져와 로컬 캐시와 병합
 */
export async function getInboundSlipsWithSupabaseFallback(filter?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
  query?: string;
}): Promise<InboundSlip[]> {
  if (isSupabaseConfigured()) {
    try {
      const supaSlips = await fetchSlipsFromSupabase(filter?.query);
      if (supaSlips.length > 0) {
        // Merge into local cache
        const map = new Map<string, InboundSlip>();
        for (const s of inboundCache) map.set(s.slipNo, s);
        for (const s of supaSlips) map.set(s.slipNo, s);
        inboundCache = Array.from(map.values());
        saveInboundToDisk();
        return supaSlips;
      }
    } catch (err) {
      console.warn('[inboundDb] Supabase fetch fallback to local cache:', err);
    }
  }
  return getAllInboundSlips(filter);
}

// Inbound Slip Queries
export function getAllInboundSlips(filter?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
  query?: string;
  excludeDummy?: boolean;
}): InboundSlip[] {
  let list = [...inboundCache];

  if (filter) {
    if (filter.excludeDummy) {
      list = list.filter((s) => !isDummySlip(s));
    }
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((s) => s.status === filter.status);
    }
    if (filter.supplier) {
      const q = filter.supplier.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.supplierCode.toLowerCase().includes(q)
      );
    }
    if (filter.startDate) {
      list = list.filter((s) => s.deliveryDate >= filter.startDate!);
    }
    if (filter.endDate) {
      list = list.filter((s) => s.deliveryDate <= filter.endDate!);
    }
    if (filter.query) {
      const q = filter.query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.slipNo.toLowerCase().includes(q) ||
          (s.poNumber && s.poNumber.toLowerCase().includes(q)) ||
          s.supplierName.toLowerCase().includes(q) ||
          s.items.some(
            (it) =>
              it.itemCode.toLowerCase().includes(q) ||
              it.itemName.toLowerCase().includes(q)
          )
      );
    }
  }

  // Sort by updatedAt descending
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getInboundSlipByNo(slipNo: string, excludeDummy = false): InboundSlip | undefined {
  const clean = slipNo.trim().toUpperCase();
  const found = inboundCache.find(
    (s) =>
      s.slipNo.toUpperCase() === clean ||
      (s.poNumber && s.poNumber.toUpperCase() === clean)
  );
  if (found && excludeDummy && isDummySlip(found)) {
    return undefined;
  }
  return found;
}

export async function getInboundSlipByNoAsync(slipNo: string): Promise<InboundSlip | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supaSlip = await fetchSlipByNoFromSupabase(slipNo);
      if (supaSlip) {
        // Upsert into memory cache
        const idx = inboundCache.findIndex((s) => s.slipNo === supaSlip.slipNo);
        if (idx >= 0) inboundCache[idx] = supaSlip;
        else inboundCache.unshift(supaSlip);
        return supaSlip;
      }
    } catch {
      // ignore
    }
  }
  return getInboundSlipByNo(slipNo);
}

export function createInboundSlip(slip: InboundSlip): InboundSlip {
  // Check if slipNo already exists
  const existingIdx = inboundCache.findIndex((s) => s.slipNo === slip.slipNo);
  if (existingIdx >= 0) {
    inboundCache[existingIdx] = {
      ...inboundCache[existingIdx],
      ...slip,
      updatedAt: new Date().toISOString(),
    };
  } else {
    inboundCache.unshift(slip);
  }
  saveInboundToDisk();
  return slip;
}

export function updateInboundSlipStatus(slipNo: string, status: InboundSlip['status'], memo?: string): InboundSlip | null {
  const slip = getInboundSlipByNo(slipNo);
  if (!slip) return null;

  slip.status = status;
  if (memo) slip.memo = memo;
  slip.updatedAt = new Date().toISOString();
  saveInboundToDisk();
  return slip;
}

// Inbound Receiving Processing Transaction (입고 확정 트랜잭션 - 랙 로직 배제)
export function processInboundReceiving(payload: InboundReceivePayload): {
  success: boolean;
  slip?: InboundSlip;
  updatedStockCount: number;
  logs: StockLog[];
  message?: string;
} {
  const { slipNo, items: receivedItems, manager, memo, completeAll } = payload;
  const slip = getInboundSlipByNo(slipNo);

  if (!slip) {
    return {
      success: false,
      updatedStockCount: 0,
      logs: [],
      message: `납품확인서 [${slipNo}]를 찾을 수 없습니다.`,
    };
  }

  const now = new Date().toISOString();
  const createdLogs: StockLog[] = [];
  let updatedStockCount = 0;
  let totalReceivedSum = 0;
  let totalDefectSum = 0;

  // 1. Process each item in the delivery slip
  for (const receivedItem of receivedItems) {
    const slipItem = slip.items.find((it) => it.id === receivedItem.id || it.itemCode === receivedItem.itemCode);
    if (!slipItem) continue;

    const actualQty = completeAll ? slipItem.orderQty : Math.max(0, receivedItem.receivedQty ?? slipItem.orderQty);
    const defectQty = receivedItem.defectQty ?? 0;
    const defectReason = receivedItem.defectReason || '';
    const warehouse = receivedItem.warehouse || slipItem.warehouse;

    slipItem.receivedQty = actualQty;
    slipItem.defectQty = defectQty;
    slipItem.defectReason = defectReason;
    slipItem.warehouse = warehouse;

    if (defectQty > 0) {
      slipItem.status = 'DEFECT';
    } else if (actualQty >= slipItem.orderQty) {
      slipItem.status = 'COMPLETED';
    } else {
      slipItem.status = 'CHECKED';
    }

    totalReceivedSum += actualQty;
    totalDefectSum += defectQty;

    // 2. Increase Inventory Stock in Main System (실제 자재창고 재고 수량 가산)
    if (actualQty > 0) {
      let invItem = getItemByCode(slipItem.itemCode);
      let prevQty = 0;
      let newQty = actualQty;

      if (invItem) {
        prevQty = invItem.quantity;
        newQty = prevQty + actualQty;

        updateItem(invItem.id, {
          quantity: newQty,
          warehouse: warehouse || invItem.warehouse,
        });
      } else {
        // Auto-register new item into master if not existing
        invItem = createItem({
          id: `item-inb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: slipItem.itemCode,
          name: slipItem.itemName,
          spec: slipItem.spec || '',
          category: '납품자재',
          warehouse: warehouse || '특장자재창고',
          rackLocation: '미지정',
          quantity: actualQty,
          unit: slipItem.unit || 'EA',
          safetyStock: 10,
          price: slipItem.unitPrice || 0,
          supplier: slip.supplierName,
          createdAt: now,
          updatedAt: now,
        });
      }
      updatedStockCount++;

      // 3. Create Stock IN Transaction Log
      const log: StockLog = {
        id: `log-inbound-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: invItem.id,
        itemCode: invItem.code,
        itemName: invItem.name,
        type: 'IN',
        quantity: actualQty,
        previousQty: prevQty,
        newQty: newQty,
        manager: manager || '자재과 담당자',
        reason: `납품확인서 입고 [전표: ${slip.slipNo}, 거래처: ${slip.supplierName}]${defectQty > 0 ? ` (불량 ${defectQty}${slipItem.unit} 별도)` : ''}`,
        timestamp: now,
      };
      createdLogs.push(createLog(log));
    }
  }

  // 4. Update Slip Overall Status
  slip.totalReceivedQty = totalReceivedSum;
  slip.totalDefectQty = totalDefectSum;
  slip.manager = manager || slip.manager || '자재과';
  slip.inboundDate = now;
  slip.updatedAt = now;
  if (memo) slip.memo = memo;
  if (payload.photos && payload.photos.length > 0) {
    slip.photos = payload.photos;
  }

  if (totalReceivedSum >= slip.totalOrderedQty && totalDefectSum === 0) {
    slip.status = 'COMPLETED';
  } else if (totalReceivedSum > 0 || totalDefectSum > 0) {
    slip.status = 'PARTIAL';
  }

  saveInboundToDisk();

  if (isSupabaseConfigured()) {
    processInboundReceiveInSupabase(payload).catch((err) => {
      console.warn('[inboundDb] Supabase receive sync warning:', err);
    });
  }

  return {
    success: true,
    slip,
    updatedStockCount,
    logs: createdLogs,
    message: `납품확인서 [${slip.slipNo}] 입고 처리가 완료되었습니다. (재고 ${updatedStockCount}건 반영)`,
  };
}

/**
 * 입고 확정 취소 및 재고 롤백 트랜잭션
 */
export function cancelInboundReceiving(slipNo: string): {
  success: boolean;
  slip?: InboundSlip;
  message: string;
} {
  const slip = getInboundSlipByNo(slipNo);
  if (!slip) {
    return {
      success: false,
      message: `납품확인서 [${slipNo}]를 찾을 수 없습니다.`,
    };
  }

  const now = new Date().toISOString();

  // 1. 재고 롤백 (가산되었던 입고 수량만큼 차감)
  for (const item of slip.items) {
    const receivedQty = item.receivedQty || 0;
    if (receivedQty > 0) {
      const invItem = getItemByCode(item.itemCode);
      if (invItem) {
        const revertedQty = Math.max(0, invItem.quantity - receivedQty);
        updateItem(invItem.id, { quantity: revertedQty });

        createLog({
          id: `log-cancel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          itemId: invItem.id,
          itemCode: invItem.code,
          itemName: invItem.name,
          type: 'OUT',
          quantity: receivedQty,
          previousQty: invItem.quantity,
          newQty: revertedQty,
          timestamp: now,
          manager: slip.manager || '관리자',
          reason: `입고 취소 [전표: ${slipNo}]`,
        });
      }
    }

    // 품목 상태 및 수량 초기화 (대기 상태로 복구)
    item.receivedQty = 0;
    item.defectQty = 0;
    item.defectReason = undefined;
    item.status = 'WAITING';
  }

  // 2. 전표 상태를 대기(WAITING)로 복원
  slip.status = 'WAITING';
  slip.totalReceivedQty = 0;
  slip.totalDefectQty = 0;
  slip.inboundDate = undefined;
  slip.updatedAt = now;

  saveInboundToDisk();

  if (isSupabaseConfigured()) {
    cancelInboundReceiveInSupabase(slipNo).catch((err) => {
      console.warn('[inboundDb] Supabase cancel sync warning:', err);
    });
  }

  return {
    success: true,
    slip,
    message: `납품확인서 [${slip.slipNo}]의 입고 처리가 취소되고 입고 대기 목록으로 복원되었습니다.`,
  };
}

export const DEFAULT_WAREHOUSES: string[] = [
  '특장자재창고',
  '본관 자재1창고',
  '본관 자재2창고',
  '외주 가공자재창고',
  '원자재 야적장',
];

export function getWarehouses(): string[] {
  return DEFAULT_WAREHOUSES;
}

export function getInboundStats(excludeDummy = false): InboundStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  let todaySlips = inboundCache.filter((s) => s.deliveryDate === todayStr || (s.inboundDate && s.inboundDate.startsWith(todayStr)));

  if (excludeDummy) {
    todaySlips = todaySlips.filter((s) => !isDummySlip(s));
  }

  const completed = todaySlips.filter((s) => s.status === 'COMPLETED').length;
  const pending = todaySlips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING').length;
  const todayTotalReceivedQty = todaySlips.reduce((acc, s) => acc + (s.totalReceivedQty || 0), 0);
  const totalDefectsToday = todaySlips.reduce((acc, s) => acc + (s.totalDefectQty || 0), 0);

  return {
    todayTotalSlips: todaySlips.length,
    todayCompletedSlips: completed,
    todayPendingSlips: pending,
    todayTotalReceivedQty,
    totalDefectsToday,
  };
}
