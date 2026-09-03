import { InboundSlip, InboundItem } from '../types/inbound';
import { extractTokenFromScannedText } from './qrHelper';
import { resolveQrTokenApi, QrType } from '../api/qrApi';

export interface ParsedQrResult {
  type: 'SHORT_TOKEN' | 'SLIP_NO' | 'FULL_SLIP_JSON' | 'DELIMITED_SLIP' | 'ITEM_CODE' | 'URL';
  token?: string;
  tokenType?: QrType;
  slipNo?: string;
  itemCode?: string;
  directSlipData?: InboundSlip;
  rawText: string;
}

/**
 * Parses any QR code scanned in the warehouse and determines the payload type.
 * Prioritizes Short URL / Token (/q/:token) for ultra-fast recognition.
 */
export function parseInboundQrCode(rawScannedText: string): ParsedQrResult {
  const text = rawScannedText.trim();

  // 0. PRIORITY 1: Check if it's a Short URL / Token (e.g. /q/A83K29 or TOKEN:A83K29)
  const token = extractTokenFromScannedText(text);
  if (token) {
    return {
      type: 'SHORT_TOKEN',
      token,
      rawText: text,
      // Default guess fallback before server resolution
      slipNo: token,
    };
  }

  // 1. Check if it's a JSON string
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.slipNo || parsed.slip_no || parsed.inboundNo) {
        const slipNo = parsed.slipNo || parsed.slip_no || parsed.inboundNo;
        const supplierName = parsed.supplierName || parsed.supplier || parsed.vendor || '납품업체';
        const supplierCode = parsed.supplierCode || 'SUP-QR';
        const deliveryDate = parsed.deliveryDate || parsed.date || new Date().toISOString().slice(0, 10);
        const poNumber = parsed.poNumber || parsed.po;

        const rawItems: any[] = Array.isArray(parsed.items) ? parsed.items : [];
        const items: InboundItem[] = rawItems.map((it, idx) => ({
          id: it.id || `qr-item-${idx + 1}`,
          itemCode: it.itemCode || it.code || it.sku || `ITEM-${idx + 1}`,
          itemName: it.itemName || it.name || '품목명',
          spec: it.spec || it.model || '',
          unit: it.unit || 'EA',
          orderQty: Number(it.orderQty || it.qty || it.quantity || 1),
          receivedQty: Number(it.receivedQty || it.qty || it.quantity || 1),
          defectQty: 0,
          warehouse: it.warehouse || '특장자재창고',
          unitPrice: Number(it.unitPrice || it.price || 0),
          status: 'WAITING',
          barcode: it.barcode || it.itemCode || it.code,
          notes: it.notes || '',
        }));

        const totalOrderedQty = items.reduce((sum, i) => sum + i.orderQty, 0);

        const directSlipData: InboundSlip = {
          slipNo: String(slipNo).trim(),
          supplierCode,
          supplierName,
          poNumber,
          deliveryDate,
          status: 'WAITING',
          totalItems: items.length,
          totalOrderedQty,
          totalReceivedQty: 0,
          totalDefectQty: 0,
          memo: parsed.memo || 'QR 코드 직접 로드 납품서',
          items,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          type: 'FULL_SLIP_JSON',
          slipNo: directSlipData.slipNo,
          directSlipData,
          rawText: text,
        };
      }
    } catch {
      // Not valid JSON, continue to other checks
    }
  }

  // 2. Check if it's Delimited format: SLIP_NO|SUPPLIER|DATE|ITEM1:NAME:QTY;ITEM2:NAME:QTY
  if (text.includes('|')) {
    const parts = text.split('|');
    if (parts.length >= 2) {
      const slipNo = parts[0].trim();
      const supplierName = parts[1].trim();
      const deliveryDate = parts[2]?.trim() || new Date().toISOString().slice(0, 10);
      const itemsSection = parts[3]?.trim();

      const items: InboundItem[] = [];
      if (itemsSection) {
        const itemRows = itemsSection.split(';');
        itemRows.forEach((row, idx) => {
          const cols = row.split(':');
          if (cols.length >= 1 && cols[0].trim()) {
            items.push({
              id: `del-item-${idx + 1}`,
              itemCode: cols[0].trim(),
              itemName: cols[1]?.trim() || cols[0].trim(),
              spec: '',
              unit: 'EA',
              orderQty: Number(cols[2]?.trim() || 1),
              receivedQty: Number(cols[2]?.trim() || 1),
              defectQty: 0,
              warehouse: '특장자재창고',
              status: 'WAITING',
            });
          }
        });
      }

      if (items.length > 0) {
        const totalOrderedQty = items.reduce((sum, i) => sum + i.orderQty, 0);
        const directSlipData: InboundSlip = {
          slipNo,
          supplierCode: 'SUP-DELIM',
          supplierName,
          deliveryDate,
          status: 'WAITING',
          totalItems: items.length,
          totalOrderedQty,
          totalReceivedQty: 0,
          totalDefectQty: 0,
          memo: 'QR 구분자 포맷 직접 로드 납품서',
          items,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          type: 'DELIMITED_SLIP',
          slipNo,
          directSlipData,
          rawText: text,
        };
      }

      return {
        type: 'SLIP_NO',
        slipNo,
        rawText: text,
      };
    }
  }

  // 3. Check if it's a URL (Deep link or QR URL)
  if (text.startsWith('http://') || text.startsWith('https://') || text.includes('?slipNo=') || text.includes('#slipNo=')) {
    try {
      const urlObj = new URL(text, window.location.origin);
      const slipParam =
        urlObj.searchParams.get('slipNo') ||
        urlObj.searchParams.get('slip') ||
        urlObj.searchParams.get('docNo') ||
        urlObj.searchParams.get('no');
      const itemParam = urlObj.searchParams.get('item') || urlObj.searchParams.get('code');

      if (slipParam) {
        return {
          type: 'SLIP_NO',
          slipNo: slipParam.trim(),
          rawText: text,
        };
      }
      if (itemParam) {
        return {
          type: 'ITEM_CODE',
          itemCode: itemParam.trim(),
          rawText: text,
        };
      }
    } catch {
      const slipMatch = text.match(/[?&#](?:slipNo|slip|docNo|no)=([^&]+)/i);
      if (slipMatch && slipMatch[1]) {
        return {
          type: 'SLIP_NO',
          slipNo: decodeURIComponent(slipMatch[1]),
          rawText: text,
        };
      }
    }
  }

  // 4. Standard Slip Number pattern (DN-..., PO-..., etc.)
  const isSlipPattern = /^(DN|PO|INB|REC|SLIP|D)-\d+/i.test(text);
  if (isSlipPattern) {
    return {
      type: 'SLIP_NO',
      slipNo: text,
      rawText: text,
    };
  }

  // 5. Default fallback
  return {
    type: 'SLIP_NO',
    slipNo: text,
    itemCode: text,
    rawText: text,
  };
}

/**
 * Asynchronously resolves token-based QR results into full business entities.
 * If the parsed QR is a SHORT_TOKEN, resolves the token via Backend API / local cache.
 */
export async function resolveInboundQrResult(parsed: ParsedQrResult): Promise<ParsedQrResult> {
  if (parsed.type !== 'SHORT_TOKEN' || !parsed.token) {
    return parsed;
  }

  try {
    const record = await resolveQrTokenApi(parsed.token);
    return {
      ...parsed,
      tokenType: record.type,
      slipNo: record.type === 'INBOUND' ? record.targetId : parsed.slipNo || record.targetId,
      itemCode: record.type === 'ITEM' ? record.targetId : parsed.itemCode,
    };
  } catch (err) {
    console.warn(`[inboundQrParser] Failed to resolve token ${parsed.token}, fallback to raw target:`, err);
    return parsed;
  }
}

