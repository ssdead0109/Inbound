import { InboundSlip } from '../types/inbound';

export interface DummyMaterial {
  code: string;
  name: string;
  spec: string;
  unit: string;
  unitPrice: number;
  safetyStock: number;
  basicStock: number;
  zone: string;
  category: string;
  supplierCode: string;
  supplierName: string;
  notes: string;
  updatedAt: string;
  whCode: string;
  whName: string;
  currentStock: number;
}

export interface DummyPurchaseOrder {
  poNo: string;
  poDate: string;
  deliveryDate: string;
  supplierCode: string;
  supplierName: string;
  warehouseName: string;
  itemCode: string;
  itemName: string;
  itemSpec: string;
  unit: string;
  poQty: number;
  receivedQty: number;
  remainQty: number;
  unitPrice: number;
  totalAmount: number;
  remarks: string;
  status: 'WAITING' | 'PARTIAL' | 'COMPLETED';
}

export const DUMMY_WAREHOUSES: { code: string; name: string; itemCount: number }[] = [];

export function getDummyMaterials(): DummyMaterial[] {
  return [];
}

export function getDummyPurchaseOrders(
  _query: string = '',
  _status: string = 'ALL',
  _limit: number = 60,
  _offset: number = 0
): { rows: DummyPurchaseOrder[]; total: number } {
  return { rows: [], total: 0 };
}

export function getDummyInboundHistory(): InboundSlip[] {
  return [];
}
