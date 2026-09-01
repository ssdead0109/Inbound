import fs from 'fs';
import path from 'path';
import { InboundSlip, InboundItem, InboundReceivePayload, InboundStats } from '../types/inbound';
import { getItemByCode, updateItem, createItem, createLog, getAllItems } from '../db';
import { StockLog } from '../types';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const INBOUND_FILE = path.join(DATA_DIR, 'inbound_slips.json');
// Real Inbound Slips Storage (샘플 데이터 완전 삭제됨)
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
      inboundCache = JSON.parse(raw);
      console.log(`[Inbound DB] Loaded ${inboundCache.length} inbound slips from file.`);
    } catch (err) {
      console.error('[Inbound DB] Failed reading file, resetting to sample slips:', err);
      inboundCache = [...INITIAL_INBOUND_SLIPS];
      saveInboundToDisk();
    }
  } else {
    console.log(`[Inbound DB] Initializing with ${INITIAL_INBOUND_SLIPS.length} sample inbound slips...`);
    inboundCache = [...INITIAL_INBOUND_SLIPS];
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

// Inbound Slip Queries
export function getAllInboundSlips(filter?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
  query?: string;
}): InboundSlip[] {
  let list = [...inboundCache];

  if (filter) {
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

export function getInboundSlipByNo(slipNo: string): InboundSlip | undefined {
  const clean = slipNo.trim().toUpperCase();
  return inboundCache.find(
    (s) =>
      s.slipNo.toUpperCase() === clean ||
      (s.poNumber && s.poNumber.toUpperCase() === clean)
  );
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

  return {
    success: true,
    slip,
    updatedStockCount,
    logs: createdLogs,
    message: `납품확인서 [${slip.slipNo}] 입고 처리가 완료되었습니다. (재고 ${updatedStockCount}건 반영)`,
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

export function getInboundStats(): InboundStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySlips = inboundCache.filter((s) => s.deliveryDate === todayStr || (s.inboundDate && s.inboundDate.startsWith(todayStr)));

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
