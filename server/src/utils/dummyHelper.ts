import { InboundSlip } from '../types/inbound';

export const DUMMY_SLIP_NUMBERS = new Set([
  '20080400002',
  'DN-20260902-001',
  'DN-20260902-002',
  'IN-20260902-001',
  'IN-20260902-002',
  'IN-20260901-003',
  'IN-20260901-004',
  'IN-20260831-007',
]);

export function isDummySlip(slip: InboundSlip | null | undefined): boolean {
  if (!slip) return false;
  if (slip.isDummy) return true;
  const slipNo = (slip.slipNo || '').trim();
  if (DUMMY_SLIP_NUMBERS.has(slipNo)) return true;
  if (
    slipNo.startsWith('DN-20260902-') ||
    slipNo.startsWith('IN-20260902-') ||
    slipNo.startsWith('IN-20260901-') ||
    slipNo.startsWith('IN-20260831-')
  ) {
    return true;
  }
  if (
    slip.memo &&
    (slip.memo.includes('더미') ||
      slip.memo.includes('DU-BUSH 정기 납품 건') ||
      slip.memo.includes('광학센서 및 베어링 납품 건') ||
      slip.memo.includes('유압 밸브 납품 건'))
  ) {
    return true;
  }
  if (slip.items && slip.items.some((i) => i.notes && i.notes.includes('더미'))) {
    return true;
  }
  return false;
}
