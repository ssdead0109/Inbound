import { StockLog } from '../types/inventory';

export async function fetchLogs(params?: {
  itemId?: string;
  itemCode?: string;
  type?: string;
}): Promise<StockLog[]> {
  const query = new URLSearchParams();
  if (params?.itemId) query.set('itemId', params.itemId);
  if (params?.itemCode) query.set('itemCode', params.itemCode);
  if (params?.type && params.type !== 'ALL') query.set('type', params.type);

  const res = await fetch(`/api/logs?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '입출고 이력을 불러오는데 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function createLog(log: Partial<StockLog>): Promise<StockLog> {
  const res = await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '이력 저장에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteLog(id: string): Promise<void> {
  const res = await fetch(`/api/logs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '이력 삭제에 실패했습니다.');
  }
}
