import { ErpMaterial } from '../api/erpApi';

const DB_NAME = 'SmartRack_IndexedDB';
const DB_VERSION = 1;
const STORE_MATERIALS = 'erp_materials';
const STORE_META = 'sync_meta';

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

      // 1. Materials Object Store
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
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Bulk save or update materials into IndexedDB
 */
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

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Search materials in IndexedDB locally (Instant sub-millisecond search without DB load)
 */
export async function searchMaterialsInIndexedDb(query: string = '', limit: number = 80): Promise<ErpMaterial[]> {
  const db = await openIndexedDb();
  const cleanQ = query.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MATERIALS], 'readonly');
    const store = tx.objectStore(STORE_MATERIALS);
    const results: ErpMaterial[] = [];

    const cursorReq = store.openCursor();

    cursorReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        resolve(results);
        return;
      }

      const val: ErpMaterial = cursor.value;

      if (!cleanQ) {
        results.push(val);
        if (results.length >= limit) {
          resolve(results);
          return;
        }
      } else {
        const codeMatch = val.code?.toLowerCase().includes(cleanQ);
        const nameMatch = val.name?.toLowerCase().includes(cleanQ);
        const specMatch = val.spec?.toLowerCase().includes(cleanQ);
        const supplierMatch = val.supplierName?.toLowerCase().includes(cleanQ);

        if (codeMatch || nameMatch || specMatch || supplierMatch) {
          results.push(val);
          if (results.length >= limit) {
            resolve(results);
            return;
          }
        }
      }

      cursor.continue();
    };

    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/**
 * Get total count of materials cached in IndexedDB
 */
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

/**
 * Sync Metadata (Last Sync Timestamp, version, etc.)
 */
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

/**
 * Clear all materials from IndexedDB (e.g. for full resync)
 */
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
