export interface ErpStatus {
  isConnected: boolean;
  server: string;
  port: number;
  database: string;
  user: string;
  totalMaterials: number;
}

export interface ErpMaterial {
  code: string;
  name: string;
  spec: string;
  unit: string;
  unitPrice: number;
  safetyStock: number;
  category: string;
  supplierCode: string;
  supplierName: string;
  notes: string;
  updatedAt: string;
}

export interface ErpHistoryItem {
  slipNo: string;
  type: string;
  subType: string;
  date: string;
  inQty: number;
  outQty: number;
  totalQty: number;
  unitPrice: number;
  memo: string;
  supplierCode: string;
}

export interface ErpMaterialDetail {
  item: ErpMaterial & {
    outPrice?: number;
    supplierPhone?: string;
  };
  history: ErpHistoryItem[];
}

const API_BASE = '/api/erp';

export async function fetchErpStatus(): Promise<ErpStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('ERP 상태 조회 실패');
  const json = await res.json();
  return json.data;
}

export async function searchErpMaterials(query: string = '', limit: number = 50): Promise<ErpMaterial[]> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
  if (!res.ok) throw new Error('ERP 자재 검색 실패');
  const json = await res.json();
  return json.data || [];
}

export async function fetchErpMaterialDetail(code: string): Promise<ErpMaterialDetail> {
  const res = await fetch(`${API_BASE}/materials/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('ERP 자재 상세 조회 실패');
  const json = await res.json();
  return json.data;
}

export async function importErpMaterialToLocal(payload: {
  code: string;
  name: string;
  spec?: string;
  unit?: string;
  unitPrice?: number;
  supplierName?: string;
  notes?: string;
  warehouse?: string;
  rackLocation?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/import-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok && res.status !== 409) {
    throw new Error(json.message || '스마트랙 자재 등록 실패');
  }
  return json;
}
