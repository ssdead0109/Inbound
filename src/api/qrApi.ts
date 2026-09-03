import { getServerBaseUrl } from '../utils/serverConfig';

export type QrType = 'INBOUND' | 'ITEM' | 'RACK' | 'VEHICLE' | 'WORK_ORDER';

export interface QrTokenRecord {
  token: string;
  type: QrType;
  targetId: string;
  active: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_TOKEN_CACHE_KEY = 'kcp_qr_token_cache_v1';

// In-memory cache
const memoryTokenCache = new Map<string, QrTokenRecord>();
const memoryTargetCache = new Map<string, string>(); // `${type}:${targetId}` -> token

// Initialize from LocalStorage
function initLocalCache() {
  if (memoryTokenCache.size > 0) return;
  try {
    const raw = localStorage.getItem(LOCAL_TOKEN_CACHE_KEY);
    if (raw) {
      const list: QrTokenRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.token) {
            memoryTokenCache.set(item.token, item);
            if (item.active) {
              memoryTargetCache.set(`${item.type}:${item.targetId}`, item.token);
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

function persistCacheToStorage() {
  try {
    const list = Array.from(memoryTokenCache.values()).slice(-500); // keep last 500
    localStorage.setItem(LOCAL_TOKEN_CACHE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * Generate a local client-side token when server is offline
 */
const TOKEN_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
function generateLocalToken(length = 6): string {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return res;
}

/**
 * Synchronous local token lookup for instant UI rendering
 */
export function getCachedQrToken(token: string): QrTokenRecord | null {
  initLocalCache();
  return memoryTokenCache.get(token.trim()) || null;
}

/**
 * Synchronous local token lookup by target
 */
export function getCachedQrTokenByTarget(type: QrType, targetId: string): string | null {
  initLocalCache();
  return memoryTargetCache.get(`${type}:${targetId.trim()}`) || null;
}

/**
 * Cache token record locally
 */
export function cacheQrTokenLocally(record: QrTokenRecord): void {
  initLocalCache();
  memoryTokenCache.set(record.token, record);
  if (record.active) {
    memoryTargetCache.set(`${record.type}:${record.targetId}`, record.token);
  }
  persistCacheToStorage();
}

/**
 * Look up token details from Backend API with local fallback
 */
export async function resolveQrTokenApi(token: string): Promise<QrTokenRecord> {
  const clean = token.trim();
  initLocalCache();

  // 1. Check local cache first
  const cached = memoryTokenCache.get(clean);
  if (cached && cached.active) {
    // Background refresh without blocking
    refreshQrTokenInBackground(clean).catch(() => {});
    return cached;
  }

  // 2. Query backend
  try {
    const baseUrl = getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/qr/${encodeURIComponent(clean)}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `QR 토큰 [${clean}]을 조회할 수 없습니다.`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      cacheQrTokenLocally(json.data);
      return json.data;
    }
    throw new Error('올바르지 않은 QR 토큰 응답 형식입니다.');
  } catch (err: any) {
    // Fallback to cached even if inactive or error
    if (cached) return cached;
    throw err;
  }
}

async function refreshQrTokenInBackground(token: string) {
  try {
    const baseUrl = getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/qr/${encodeURIComponent(token)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        cacheQrTokenLocally(json.data);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Get or create QR token for a target from Backend API
 */
export async function getOrCreateQrTokenApi(
  type: QrType,
  targetId: string,
  metadata?: Record<string, any>
): Promise<QrTokenRecord> {
  const cleanTarget = targetId.trim();
  initLocalCache();

  // Check cache
  const cachedToken = memoryTargetCache.get(`${type}:${cleanTarget}`);
  if (cachedToken) {
    const record = memoryTokenCache.get(cachedToken);
    if (record && record.active) return record;
  }

  // Request from Backend
  try {
    const baseUrl = getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/qr/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        type,
        targetId: cleanTarget,
        metadata,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        cacheQrTokenLocally(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[qrApi] Server token creation failed, using offline fallback token:', err);
  }

  // Offline fallback: generate token locally
  let offlineToken = generateLocalToken(6);
  const now = new Date().toISOString();
  const offlineRecord: QrTokenRecord = {
    token: offlineToken,
    type,
    targetId: cleanTarget,
    active: true,
    metadata: metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  cacheQrTokenLocally(offlineRecord);
  return offlineRecord;
}

/**
 * Batch get or create QR tokens
 */
export async function batchGetOrCreateQrTokensApi(
  items: { type: QrType; targetId: string; metadata?: Record<string, any> }[]
): Promise<QrTokenRecord[]> {
  if (!items || items.length === 0) return [];
  initLocalCache();

  try {
    const baseUrl = getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/qr/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        for (const rec of json.data) {
          cacheQrTokenLocally(rec);
        }
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[qrApi] Batch token creation failed, falling back to individual/local:', err);
  }

  // Fallback sequentially
  const results: QrTokenRecord[] = [];
  for (const it of items) {
    const rec = await getOrCreateQrTokenApi(it.type, it.targetId, it.metadata);
    results.push(rec);
  }
  return results;
}
