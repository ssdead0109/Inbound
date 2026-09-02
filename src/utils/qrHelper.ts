import { InventoryItem } from '../types/inventory';

/**
 * QR Code Error Correction Level 권장 표준
 * - 'M' (15% 복원): 일반 라벨 및 데이터 라벨에 최적의 격자 물리 크기와 복원력 균형 제공
 * - 'L' (7% 복원): 초소형(15mm 이하) 마이크로 라벨에 최적화하여 격자 물리 크기 극대화
 */
export const RECOMMENDED_QR_LEVEL = 'M' as const;

/**
 * Encodes basic inventory item data into a compact base64 string for QR URLs.
 * Omit empty or default values to minimize QR matrix density, maximizing scan speed and recognition distance.
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
