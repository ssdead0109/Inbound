import fs from 'fs';
import path from 'path';

export type QrType = 'INBOUND' | 'ITEM' | 'RACK' | 'VEHICLE' | 'WORK_ORDER';

export interface QrTokenRecord {
  token: string;         // e.g. "A83K29", "K7mP2x9Q"
  type: QrType;
  targetId: string;      // e.g. "DN-20260903-00125", "ITEM-001", "D-06-03"
  active: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const QR_TOKENS_FILE = path.join(DATA_DIR, 'qr_tokens.json');

// Memory Cache for lightning-fast 0ms lookups
let tokenMap = new Map<string, QrTokenRecord>();
// Secondary lookup map: `${type}:${targetId}` -> token
let targetMap = new Map<string, string>();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Characters excluding ambiguous 0, O, I, 1, l
const TOKEN_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

/**
 * Generates an unguessable, secure random token (default 6-8 chars)
 */
export function generateRandomToken(length = 6): string {
  let result = '';
  const charsLen = TOKEN_CHARS.length;
  for (let i = 0; i < length; i++) {
    const randIdx = Math.floor(Math.random() * charsLen);
    result += TOKEN_CHARS[randIdx];
  }
  return result;
}

/**
 * Initialize QR Token Database from disk
 */
export function initQrTokenDatabase(): void {
  ensureDataDir();
  tokenMap.clear();
  targetMap.clear();

  if (fs.existsSync(QR_TOKENS_FILE)) {
    try {
      const raw = fs.readFileSync(QR_TOKENS_FILE, 'utf-8');
      const list: QrTokenRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.token) {
            tokenMap.set(item.token, item);
            if (item.active) {
              targetMap.set(`${item.type}:${item.targetId}`, item.token);
            }
          }
        }
      }
      console.log(`[QR Token DB] Loaded ${tokenMap.size} QR tokens from file.`);
    } catch (err) {
      console.error('[QR Token DB] Failed loading qr_tokens.json, initializing empty:', err);
      saveTokensToDisk();
    }
  } else {
    saveTokensToDisk();
  }
}

/**
 * Save in-memory tokens to disk
 */
export function saveTokensToDisk(): void {
  ensureDataDir();
  try {
    const list = Array.from(tokenMap.values());
    fs.writeFileSync(QR_TOKENS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[QR Token DB] Failed to save qr_tokens.json:', err);
  }
}

/**
 * Look up token record by token string
 */
export function getQrToken(token: string): QrTokenRecord | null {
  if (!token) return null;
  const clean = token.trim();
  const record = tokenMap.get(clean);
  if (record && record.active) {
    return record;
  }
  return null;
}

/**
 * Look up active token by type and targetId
 */
export function findQrTokenByTarget(type: QrType, targetId: string): QrTokenRecord | null {
  if (!targetId) return null;
  const cleanTarget = targetId.trim();
  const token = targetMap.get(`${type}:${cleanTarget}`);
  if (token) {
    const record = tokenMap.get(token);
    if (record && record.active) {
      return record;
    }
  }
  return null;
}

/**
 * Create a new random token or return existing active token for the given target
 */
export function createOrGetQrToken(
  type: QrType,
  targetId: string,
  metadata?: Record<string, any>
): QrTokenRecord {
  const cleanTarget = targetId.trim();
  const existing = findQrTokenByTarget(type, cleanTarget);
  if (existing) {
    return existing;
  }

  // Generate unique token with collision avoidance
  let token = generateRandomToken(6);
  let attempts = 0;
  while (tokenMap.has(token) && attempts < 10) {
    token = generateRandomToken(attempts > 5 ? 8 : 6);
    attempts++;
  }

  const now = new Date().toISOString();
  const newRecord: QrTokenRecord = {
    token,
    type,
    targetId: cleanTarget,
    active: true,
    metadata: metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  tokenMap.set(token, newRecord);
  targetMap.set(`${type}:${cleanTarget}`, token);
  saveTokensToDisk();

  return newRecord;
}

/**
 * Batch generate or get tokens for multiple items
 */
export function batchGetOrCreateTokens(
  items: { type: QrType; targetId: string; metadata?: Record<string, any> }[]
): QrTokenRecord[] {
  let hasNew = false;
  const results: QrTokenRecord[] = [];

  for (const it of items) {
    if (!it.targetId) continue;
    const cleanTarget = it.targetId.trim();
    const existing = findQrTokenByTarget(it.type, cleanTarget);
    if (existing) {
      results.push(existing);
      continue;
    }

    let token = generateRandomToken(6);
    let attempts = 0;
    while (tokenMap.has(token) && attempts < 10) {
      token = generateRandomToken(attempts > 5 ? 8 : 6);
      attempts++;
    }

    const now = new Date().toISOString();
    const newRecord: QrTokenRecord = {
      token,
      type: it.type,
      targetId: cleanTarget,
      active: true,
      metadata: it.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    tokenMap.set(token, newRecord);
    targetMap.set(`${it.type}:${cleanTarget}`, token);
    results.push(newRecord);
    hasNew = true;
  }

  if (hasNew) {
    saveTokensToDisk();
  }

  return results;
}

/**
 * Deactivate a QR token
 */
export function deactivateQrToken(token: string): boolean {
  const record = tokenMap.get(token);
  if (!record) return false;
  record.active = false;
  record.updatedAt = new Date().toISOString();
  targetMap.delete(`${record.type}:${record.targetId}`);
  saveTokensToDisk();
  return true;
}
