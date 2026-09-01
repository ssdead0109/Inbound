import { InventoryItem, StockActionType, StockLog } from '../types/inventory';

export interface StockInOutPayload {
  itemId: string;
  type: StockActionType;
  quantity: number;
  manager: string;
  reason: string;
  date?: string;
}

export interface StockInOutResponse {
  item: InventoryItem;
  log: StockLog;
}

export async function processStockInOut(payload: StockInOutPayload): Promise<StockInOutResponse> {
  const res = await fetch('/api/stock/in-out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '입출고 처리에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export interface BatchStockOutItemPayload {
  id: string;
  stockOutQty: number;
}

export interface BatchStockOutPayload {
  items: BatchStockOutItemPayload[];
  manager: string;
  reason: string;
  date?: string;
}

export interface BatchStockOutResponse {
  updatedCount: number;
  items: InventoryItem[];
  logs: StockLog[];
}

export async function processBatchStockOut(payload: BatchStockOutPayload): Promise<BatchStockOutResponse> {
  const res = await fetch('/api/stock/batch-out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '일괄 출고 처리에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}
