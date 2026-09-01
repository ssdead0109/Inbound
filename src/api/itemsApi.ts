import { InventoryItem } from '../types/inventory';

export async function fetchItems(params?: {
  category?: string;
  search?: string;
  lowStock?: boolean;
}): Promise<InventoryItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'ALL') {
    query.set('category', params.category);
  }
  if (params?.search) {
    query.set('search', params.search);
  }
  if (params?.lowStock) {
    query.set('lowStock', 'true');
  }

  const res = await fetch(`/api/items?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '품목 목록을 불러오는데 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchItemById(id: string): Promise<InventoryItem> {
  const res = await fetch(`/api/items/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '품목 정보를 불러오는데 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function findItemByCodeOrId(target: string): Promise<InventoryItem | null> {
  const res = await fetch(`/api/items/find?code=${encodeURIComponent(target)}&id=${encodeURIComponent(target)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('품목 조회 실패');
  }
  const json = await res.json();
  return json.data || null;
}

export async function createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '품목 등록에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function updateItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '품목 수정에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '품목 삭제에 실패했습니다.');
  }
}

export async function deleteItemsBatch(ids: string[]): Promise<number> {
  const res = await fetch('/api/items/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '일괄 삭제에 실패했습니다.');
  }
  const json = await res.json();
  return json.deletedCount;
}

export async function bulkUpsertItems(
  items: InventoryItem[],
  mode: 'overwrite' | 'skip' | 'add_qty' = 'overwrite'
): Promise<{ added: number; updated: number; total: number }> {
  const res = await fetch('/api/items/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '대량 데이터 저장에 실패했습니다.');
  }
  return res.json();
}

export async function resetItemsToSample(): Promise<InventoryItem[]> {
  const res = await fetch('/api/items/reset-sample', {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '샘플 데이터 초기화에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}
