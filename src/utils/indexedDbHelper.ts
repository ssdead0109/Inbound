import { ErpMaterial, ErpUser } from '../api/erpApi';
import { InboundSlip } from '../types/inbound';
import { isDummySlip } from './dummyHelper';

const DB_NAME = 'SmartRack_IndexedDB';
const DB_VERSION = 2;

export const STORE_MATERIALS = 'erp_materials';
export const STORE_META = 'sync_meta';
export const STORE_SLIPS = 'erp_slips';
export const STORE_QUEUE = 'sync_queue';
export const STORE_AUTH = 'cached_auth';

export interface SyncQueueItem {
  id: string; // sync-${Date.now()}-${uuid}
  type: 'INBOUND_RECEIVE' | 'HOLD_SLIP';
  slipNo: string;
  title: string;
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'SUCCESS' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
  operator: string;
}

export interface CachedAuthUser {
  code: string;
  name: string;
  dept?: string;
  role?: string;
  isAdmin: boolean;
  hidePrice?: boolean;
  passwordHash?: string;
  plainPassword?: string;
  lastLoginAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openIndexedDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Materials Object Store (인덱스DB - 자재 정보)
      if (!db.objectStoreNames.contains(STORE_MATERIALS)) {
        const materialStore = db.createObjectStore(STORE_MATERIALS, { keyPath: 'code' });
        materialStore.createIndex('name', 'name', { unique: false });
        materialStore.createIndex('spec', 'spec', { unique: false });
        materialStore.createIndex('supplierName', 'supplierName', { unique: false });
      }

      // 2. Metadata Object Store (e.g. lastSyncTime, count)
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }

      // 3. Inbound Slips Store (전표 캐시)
      if (!db.objectStoreNames.contains(STORE_SLIPS)) {
        const slipStore = db.createObjectStore(STORE_SLIPS, { keyPath: 'slipNo' });
        slipStore.createIndex('status', 'status', { unique: false });
        slipStore.createIndex('deliveryDate', 'deliveryDate', { unique: false });
        slipStore.createIndex('supplierName', 'supplierName', { unique: false });
      }

      // 4. Sync Queue Store (오프라인 동기화 대기 큐)
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        queueStore.createIndex('slipNo', 'slipNo', { unique: false });
      }

      // 5. Cached Auth Store (오프라인 인증 캐시)
      if (!db.objectStoreNames.contains(STORE_AUTH)) {
        db.createObjectStore(STORE_AUTH, { keyPath: 'code' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/* =========================================================
   1. ERP Materials (인덱스DB) Operations
   ========================================================= */

let clientMaterialsCache: ErpMaterial[] | null = null;
let clientMaterialsCacheTime = 0;

export async function saveMaterialsToIndexedDb(materials: ErpMaterial[]): Promise<number> {
  if (!materials || materials.length === 0) return 0;
  const db = await openIndexedDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS], 'readwrite');
    const store = tx.objectStore(STORE_MATERIALS);

    let count = 0;
    for (const item of materials) {
      if (item && item.code) {
        store.put(item);
        count++;
      }
    }

    tx.oncomplete = () => {
      // 캐시 갱신
      clientMaterialsCache = null;
      resolve(count);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 인덱스DB 전체 자재 목록 고속 조회 (브라우저 네이티브 getAll 및 인메모리 캐시 적용)
 */
export async function getAllMaterialsFromIndexedDb(): Promise<ErpMaterial[]> {
  const now = Date.now();
  if (clientMaterialsCache && now - clientMaterialsCacheTime < 180000) {
    return clientMaterialsCache;
  }

  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS], 'readonly');
    const store = tx.objectStore(STORE_MATERIALS);
    const req = store.getAll();

    req.onsuccess = () => {
      const items = req.result || [];
      if (items.length > 0) {
        clientMaterialsCache = items;
        clientMaterialsCacheTime = Date.now();
      }
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * 인덱스DB 초고속 필터링 (openCursor 제거 -> 네이티브 getAll 인메모리 필터 < 1ms)
 */
export async function searchMaterialsInIndexedDb(
  query: string = '',
  limit: number = 80,
  offset: number = 0,
  whCode: string = 'ALL'
): Promise<ErpMaterial[]> {
  const result = await searchMaterialsInIndexedDbWithTotal(query, limit, offset, whCode);
  return result.data;
}

/**
 * 인덱스DB 초고속 필터링 (결과 데이터와 전체 일치 건수 total 동시 반환)
 */
export async function searchMaterialsInIndexedDbWithTotal(
  query: string = '',
  limit: number = 80,
  offset: number = 0,
  whCode: string = 'ALL'
): Promise<{ data: ErpMaterial[]; total: number }> {
  const allItems = await getAllMaterialsFromIndexedDb().catch(() => []);
  if (!allItems || allItems.length === 0) return { data: [], total: 0 };

  const cleanQ = query.trim().toLowerCase();
  const cleanWh = (whCode || 'ALL').trim();

  let filtered = allItems;

  // 1. 창고 필터링 (< 0.2ms)
  if (cleanWh && cleanWh !== 'ALL') {
    filtered = filtered.filter((item) => item.whCode === cleanWh || item.whName === cleanWh);
  }

  // 2. 검색어 필터링 (< 0.5ms)
  if (cleanQ) {
    filtered = filtered.filter(
      (val) =>
        (val.code && val.code.toLowerCase().includes(cleanQ)) ||
        (val.name && val.name.toLowerCase().includes(cleanQ)) ||
        (val.spec && val.spec.toLowerCase().includes(cleanQ)) ||
        (val.zone && val.zone.toLowerCase().includes(cleanQ)) ||
        (val.supplierName && val.supplierName.toLowerCase().includes(cleanQ))
    );
  }

  return {
    data: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

/**
 * 인덱스DB에 저장된 자재 데이터들로부터 고유 창고 목록(whCode, whName) 동적 추출
 */
export async function getUniqueWarehousesFromIndexedDb(): Promise<{ code: string; name: string }[]> {
  const allItems = await getAllMaterialsFromIndexedDb().catch(() => []);
  const whMap = new Map<string, string>();
  for (const val of allItems) {
    if (val) {
      const code = (val.whCode || '').trim();
      const name = (val.whName || val.whCode || '').trim();
      if (code && code !== 'ALL') {
        whMap.set(code, name || code);
      }
    }
  }
  const list = Array.from(whMap.entries()).map(([code, name]) => ({ code, name }));
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export async function getMaterialsCountInIndexedDb(): Promise<number> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS], 'readonly');
    const store = tx.objectStore(STORE_MATERIALS);
    const countReq = store.count();

    countReq.onsuccess = () => resolve(countReq.result);
    countReq.onerror = () => reject(countReq.error);
  });
}

export async function getMaterialByCodeInIndexedDb(code: string): Promise<ErpMaterial | null> {
  if (!code) return null;
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS], 'readonly');
    const store = tx.objectStore(STORE_MATERIALS);
    const req = store.get(code.trim().toUpperCase());

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/* =========================================================
   2. Inbound Slips Cache Operations
   ========================================================= */

export async function saveSlipsToIndexedDb(slips: InboundSlip[]): Promise<number> {
  if (!slips || slips.length === 0) return 0;
  const db = await openIndexedDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SLIPS], 'readwrite');
    const store = tx.objectStore(STORE_SLIPS);

    let count = 0;
    for (const s of slips) {
      if (s && s.slipNo) {
        store.put(s);
        count++;
      }
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveSlipToIndexedDb(slip: InboundSlip): Promise<void> {
  if (!slip || !slip.slipNo) return;
  const db = await openIndexedDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SLIPS], 'readwrite');
    const store = tx.objectStore(STORE_SLIPS);
    store.put(slip);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSlipsFromIndexedDb(query: string = '', excludeDummy = false): Promise<InboundSlip[]> {
  const db = await openIndexedDb();
  const cleanQ = query.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SLIPS], 'readonly');
    const store = tx.objectStore(STORE_SLIPS);
    const results: InboundSlip[] = [];

    const cursorReq = store.openCursor();

    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        // Sort descending by deliveryDate or createdAt
        results.sort((a, b) => new Date(b.deliveryDate || b.createdAt || 0).getTime() - new Date(a.deliveryDate || a.createdAt || 0).getTime());
        resolve(results);
        return;
      }

      const slip: InboundSlip = cursor.value;
      if (excludeDummy && isDummySlip(slip)) {
        cursor.continue();
        return;
      }

      if (!cleanQ) {
        results.push(slip);
      } else {
        const slipMatch = slip.slipNo.toLowerCase().includes(cleanQ);
        const supMatch = (slip.supplierName || '').toLowerCase().includes(cleanQ);
        const itemMatch = slip.items?.some(
          it => it.itemCode.toLowerCase().includes(cleanQ) || it.itemName.toLowerCase().includes(cleanQ)
        );
        if (slipMatch || supMatch || itemMatch) {
          results.push(slip);
        }
      }

      cursor.continue();
    };

    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/**
 * DB 연결 시 IndexedDB에 남아있던 더미 전표들을 일괄 정리 삭제
 */
export async function cleanDummySlipsFromIndexedDb(): Promise<number> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SLIPS], 'readwrite');
    const store = tx.objectStore(STORE_SLIPS);
    let deletedCount = 0;

    const cursorReq = store.openCursor();
    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve(deletedCount);
        return;
      }
      const slip: InboundSlip = cursor.value;
      if (isDummySlip(slip)) {
        cursor.delete();
        deletedCount++;
      }
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function getSlipByNoFromIndexedDb(slipNo: string): Promise<InboundSlip | null> {
  if (!slipNo) return null;
  const db = await openIndexedDb();
  const clean = slipNo.trim().toUpperCase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SLIPS], 'readonly');
    const store = tx.objectStore(STORE_SLIPS);
    const req = store.get(clean);

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result);
      } else {
        // Try scanning all for partial match
        const scanReq = store.openCursor();
        let found: InboundSlip | null = null;
        scanReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (!cursor || found) {
            resolve(found);
            return;
          }
          const s: InboundSlip = cursor.value;
          if (s.slipNo.toUpperCase() === clean || (s.poNumber && s.poNumber.toUpperCase() === clean)) {
            found = s;
            resolve(found);
            return;
          }
          cursor.continue();
        };
        scanReq.onerror = () => resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/* =========================================================
   3. Sync Queue Operations (대기 큐)
   ========================================================= */

export async function enqueueSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueueItems(): Promise<SyncQueueItem[]> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readonly');
    const store = tx.objectStore(STORE_QUEUE);
    const items: SyncQueueItem[] = [];

    const cursorReq = store.openCursor();
    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        // Sort oldest first (FIFO) for sequential processing
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(items);
        return;
      }
      items.push(cursor.value);
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function updateQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCompletedQueueItems(): Promise<number> {
  const items = await getQueueItems();
  const completed = items.filter(it => it.status === 'SUCCESS');
  if (completed.length === 0) return 0;

  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    completed.forEach(it => store.delete(it.id));

    tx.oncomplete = () => resolve(completed.length);
    tx.onerror = () => reject(tx.error);
  });
}

/* =========================================================
   4. Cached Auth Operations (오프라인 로그인 인증 정보)
   ========================================================= */

export async function saveCachedUserAuth(authUser: CachedAuthUser): Promise<void> {
  if (!authUser || !authUser.code) return;
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_AUTH], 'readwrite');
    const store = tx.objectStore(STORE_AUTH);
    // 보안 강화: 타인 계정 정보는 모두 삭제하고 본인 계정 1개만 단독 저장
    store.clear();
    store.put(authUser);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedUserAuth(code: string): Promise<CachedAuthUser | null> {
  if (!code) return null;
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_AUTH], 'readonly');
    const store = tx.objectStore(STORE_AUTH);
    const req = store.get(code.trim());

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedUsers(): Promise<CachedAuthUser[]> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_AUTH], 'readonly');
    const store = tx.objectStore(STORE_AUTH);
    const list: CachedAuthUser[] = [];

    const cursorReq = store.openCursor();
    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve(list);
        return;
      }
      list.push(cursor.value);
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/* =========================================================
   5. Metadata & Reset
   ========================================================= */

export async function getSyncMeta(key: string): Promise<any> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readonly');
    const store = tx.objectStore(STORE_META);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

export async function setSyncMeta(key: string, value: any): Promise<void> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readwrite');
    const store = tx.objectStore(STORE_META);
    const req = store.put({ key, value, updatedAt: Date.now() });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearMaterialsIndexedDb(): Promise<void> {
  const db = await openIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS, STORE_META], 'readwrite');
    tx.objectStore(STORE_MATERIALS).clear();
    tx.objectStore(STORE_META).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
