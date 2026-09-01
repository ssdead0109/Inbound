import { InventoryItem } from '../types/inventory';

/**
 * Encodes basic inventory item data into a compact base64 string for QR URLs.
 * This allows mobile devices scanning the QR to open the item page even if
 * their mobile browser LocalStorage doesn't already have this item.
 */
export function encodeItemPayload(item: InventoryItem): string {
  try {
    const compactObj = {
      i: item.id,
      c: item.code,
      n: item.name,
      s: item.spec || '',
      cat: item.category || '',
      w: item.warehouse || '',
      r: item.rackLocation || '미입력',
      q: item.quantity || 0,
      u: item.unit || 'EA',
      ss: item.safetyStock || 0,
      sup: item.supplier || '',
      nt: item.notes || '',
    };
    const json = JSON.stringify(compactObj);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch (err) {
    console.error('Failed to encode item payload:', err);
    return '';
  }
}

/**
 * Decodes compact base64 string back into an InventoryItem
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
 * Generates the full universal QR URL for an item.
 * Supports both query parameter (?item=...) and fallback payload (&d=...)
 * Works seamlessly across mobile camera QR scanners, in-app browsers (Kakao, Line, etc.)
 */
export function generateItemQRValue(item: InventoryItem): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const payload = encodeItemPayload(item);
  
  if (payload) {
    return `${origin}${pathname}?item=${encodeURIComponent(item.code)}&d=${payload}`;
  }
  return `${origin}${pathname}?item=${encodeURIComponent(item.code)}`;
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
 * 랙 슬롯 전용 QR 코드 값 생성 (URL 및 RACK: 프로토콜 호환)
 */
export function generateRackSlotQRValue(warehouse: string, slotCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return `${origin}${pathname}?rack=${encodeURIComponent(slotCode)}&wh=${encodeURIComponent(warehouse)}`;
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
