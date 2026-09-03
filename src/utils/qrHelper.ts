import { InventoryItem } from '../types/inventory';
import { getCachedQrTokenByTarget, getOrCreateQrTokenApi } from '../api/qrApi';

/**
 * QR Code Error Correction Level 권장 표준
 * - 'M' (15% 복원): 일반 라벨 및 생산현장 표준 (기본 권장값)
 * - 'Q' (25% 복원): 오염/훼손 가능성이 높은 대형 라벨
 * - 'L' (7% 복원): 초소형(15mm 이하) 마이크로 라벨
 */
export const RECOMMENDED_QR_LEVEL = 'M' as const;
export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Build Short QR URL: https://[domain]/q/[token]
 */
export function buildShortQrUrl(token: string): string {
  if (!token) return '';
  const clean = token.trim();
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';
  return `${origin}/q/${clean}`;
}

/**
 * Extract token string from URL or raw scanned text
 * Supports:
 * - https://erp.company.com/q/A83K29
 * - /q/A83K29
 * - ?q=A83K29
 * - TOKEN:A83K29
 */
export function extractTokenFromScannedText(text: string): string | null {
  if (!text) return null;
  const t = text.trim();

  // 1. /q/:token pattern in URL or path
  const pathMatch = t.match(/\/q\/([A-Za-z0-9_-]{4,16})/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // 2. Query param ?q=:token
  const queryMatch = t.match(/[?&#]q=([A-Za-z0-9_-]{4,16})/);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1];
  }

  // 3. Prefix TOKEN:A83K29
  if (t.toUpperCase().startsWith('TOKEN:')) {
    const rawTok = t.substring(6).trim();
    if (/^[A-Za-z0-9_-]{4,16}$/.test(rawTok)) {
      return rawTok;
    }
  }

  return null;
}

/**
 * Encodes basic inventory item data into a compact base64 string for legacy QR URLs.
 * (Preserved for full backward compatibility)
 */
export function encodeItemPayload(item: InventoryItem): string {
  try {
    const compactObj: Record<string, any> = {
      c: item.code,
      n: item.name,
    };
    if (item.id) compactObj.i = item.id;
    if (item.spec && item.spec.trim()) compactObj.s = item.spec.trim();
    if (item.category && item.category.trim() && item.category !== '기타' && item.category !== '일반') {
      compactObj.cat = item.category.trim();
    }
    if (item.warehouse && item.warehouse.trim()) compactObj.w = item.warehouse.trim();
    if (item.rackLocation && item.rackLocation.trim() && item.rackLocation !== '미입력') {
      compactObj.r = item.rackLocation.trim();
    }
    if (typeof item.quantity === 'number' && item.quantity > 0) compactObj.q = item.quantity;
    if (item.unit && item.unit !== 'EA') compactObj.u = item.unit.trim();
    if (typeof item.safetyStock === 'number' && item.safetyStock !== 5 && item.safetyStock > 0) {
      compactObj.ss = item.safetyStock;
    }
    if (item.supplier && item.supplier.trim()) compactObj.sup = item.supplier.trim();
    if (item.notes && item.notes.trim()) compactObj.nt = item.notes.trim();

    const json = JSON.stringify(compactObj);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch (err) {
    console.error('Failed to encode item payload:', err);
    return '';
  }
}

/**
 * Decodes compact base64 string back into an InventoryItem
 * (Preserved for full backward compatibility)
 */
export function decodeItemPayload(encodedStr: string): InventoryItem | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encodedStr))));
    const p = JSON.parse(jsonStr);
    if (!p || (!p.c && !p.n)) return null;

    const now = new Date().toISOString();
    return {
      id: p.i || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: p.c || 'UNKNOWN',
      name: p.n || '미등록 품목',
      spec: p.s || '',
      category: p.cat || '기타',
      warehouse: p.w || undefined,
      rackLocation: p.r || '미입력',
      quantity: typeof p.q === 'number' ? p.q : 0,
      unit: p.u || 'EA',
      safetyStock: typeof p.ss === 'number' ? p.ss : 5,
      price: 0,
      supplier: p.sup || '',
      notes: p.nt || '',
      createdAt: now,
      updatedAt: now,
    };
  } catch (err) {
    console.error('Failed to decode item payload:', err);
    return null;
  }
}

/**
 * Generates QR code value for an item.
 * Prioritizes Short URL + Token (e.g. https://[domain]/q/K7mP2x9Q) for minimal density and instant scanning!
 * Fallback to standard URL with legacy query params if offline.
 */
export function generateItemQRValue(item: InventoryItem): string {
  if (!item) return '';
  const itemCode = (item.code || item.id || '').trim();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // 1. Check if we already have a cached token for this item
  const cachedToken = getCachedQrTokenByTarget('ITEM', itemCode);
  if (cachedToken) {
    return buildShortQrUrl(cachedToken);
  }

  // 2. Trigger asynchronous server token registration in background
  if (itemCode) {
    getOrCreateQrTokenApi('ITEM', itemCode, { name: item.name, spec: item.spec }).catch(() => {});
  }

  // 3. Generate clean short universal URL
  return `${origin}/?item=${encodeURIComponent(itemCode)}`;
}

/**
 * Generates QR code value for an inbound slip (납품확인서/입고전표)
 * Format: https://[domain]/?slipNo=[slipNo]
 * 전표 번호 직결 포맷: 서버 토큰 매핑 손실이나 네트워크 두절과 무관하게 100% 영구 정확 보장!
 */
export function generateInboundQRValue(slipNo: string): string {
  if (!slipNo) return '';
  const cleanSlip = slipNo.trim();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?slipNo=${encodeURIComponent(cleanSlip)}`;
}

/**
 * Parses the current browser URL (Search Query & Hash) to extract the scanned item target
 */
export function parseItemTargetFromUrl(): {
  targetCode: string | null;
  fallbackItem: InventoryItem | null;
} {
  const search = window.location.search;
  const hash = window.location.hash;

  const searchParams = new URLSearchParams(search);
  let targetCode = searchParams.get('item') || searchParams.get('code') || searchParams.get('sku') || searchParams.get('id');
  let dataParam = searchParams.get('d');

  // Check hash if search params didn't have it
  if (!targetCode && hash) {
    const rawHash = hash.replace(/^[#\/?]+/, '');
    if (rawHash.includes('=')) {
      const hashParams = new URLSearchParams(rawHash);
      targetCode = hashParams.get('item') || hashParams.get('code') || hashParams.get('sku') || hashParams.get('id');
      if (!dataParam) dataParam = hashParams.get('d');
    } else if (rawHash) {
      targetCode = decodeURIComponent(rawHash);
    }
  }

  let fallbackItem: InventoryItem | null = null;
  return {
    targetCode: targetCode ? targetCode.trim() : null,
    fallbackItem: dataParam ? decodeItemPayload(dataParam) : null,
  };
}

/**
 * 랙 슬롯 전용 QR 코드 값 생성 (Short URL 및 RACK: 프로토콜 호환)
 */
export function generateRackSlotQRValue(warehouse: string, slotCode: string): string {
  const targetId = `${warehouse}/${slotCode}`.trim();
  const cachedToken = getCachedQrTokenByTarget('RACK', targetId);
  if (cachedToken) {
    return buildShortQrUrl(cachedToken);
  }

  // Background registration
  getOrCreateQrTokenApi('RACK', targetId, { warehouse, slotCode }).catch(() => {});

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?rack=${encodeURIComponent(slotCode)}&wh=${encodeURIComponent(warehouse)}`;
}

/**
 * 스캔된 QR 텍스트에서 랙 슬롯 정보 추출
 */
export function parseRackSlotFromScannedText(text: string): { warehouse?: string; rack: string } | null {
  if (!text) return null;
  const t = text.trim();

  // 1. URL 형태: ?rack=D-06-03&wh=A동
  if (t.includes('rack=')) {
    try {
      const url = new URL(t.startsWith('http') ? t : `http://dummy.com/${t}`);
      const rack = url.searchParams.get('rack');
      const wh = url.searchParams.get('wh') || undefined;
      if (rack) {
        return { warehouse: wh, rack };
      }
    } catch {
      // ignore
    }
  }

  // 2. RACK: 접두사 형태 (예: RACK:특장자재창고/D-06-03 or RACK:D-06-03)
  if (t.toUpperCase().startsWith('RACK:')) {
    const content = t.substring(5).trim();
    if (content.includes('/')) {
      const parts = content.split('/');
      return { warehouse: parts[0].trim(), rack: parts.slice(1).join('/').trim() };
    }
    return { rack: content };
  }

  // 3. 순수 랙 코드 패턴 (예: D-06-03, A-01-2, B-3-1)
  if (/^[A-Za-z]?\d{1,4}[-_]\d{1,4}([-_]\d{1,4})?$/i.test(t) || /^[A-Za-z]{1,3}[-_]?\d{1,4}([-_]\d{1,4})?$/i.test(t)) {
    return { rack: t };
  }

  return null;
}

