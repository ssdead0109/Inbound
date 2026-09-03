import { InboundSlip, InboundReceivePayload } from '../types/inbound';
import { StockLog } from '../types/inventory';
import { getServerBaseUrl } from '../utils/serverConfig';

export interface ErpStatus {
  isConnected: boolean;
  isDummyMode?: boolean;
  server: string;
  port: number;
  database: string;
  user: string;
  totalMaterials: number;
}

export interface ErpWarehouse {
  code: string;
  name: string;
  itemCount?: number;
}

export interface ErpMaterial {
  code: string;
  name: string;
  spec: string;
  unit: string;
  unitPrice: number;
  safetyStock: number;
  basicStock?: number;
  zone?: string; // 랙/구역 위치
  category: string;
  grade?: string;
  supplierCode: string;
  supplierName: string;
  notes: string;
  updatedAt: string;
  whCode?: string;
  whName?: string;
  currentStock: number; // 현재고 수량
}

export interface ErpHistoryItem {
  slipNo: string;
  seq?: number;
  type: string;
  subType: string;
  date: string;
  inQty: number;
  outQty: number;
  totalQty: number;
  unitPrice: number;
  totalAmount?: number;
  memo: string;
  warehouseCode?: string;
  supplierCode: string;
  supplierName?: string;
  managerCode?: string;
}

export interface ErpMaterialDetail {
  item: ErpMaterial & {
    outPrice?: number;
    supplierPhone?: string;
  };
  warehouseStocks: {
    whCode: string;
    whName: string;
    stockQty: number;
  }[];
  history: ErpHistoryItem[];
}

export interface ErpUser {
  code: string;
  name: string;
  dept?: string;
  role?: string;
  email?: string;
  isAdmin?: boolean;
  hidePrice?: boolean;
  hasPassword?: boolean;
  isOffline?: boolean;
}

// 동적 API Base URL (사용자 설정 서버 IP/포트 또는 기본 베이스 URL)
const API_BASE = {
  toString: () => `${getServerBaseUrl()}/api/erp`,
};

/**
 * HTML 반환 시 Unexpected token < 방어 및 안전한 JSON 파싱 헬퍼
 */
export async function safeJsonParse(res: Response): Promise<any> {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    throw new Error(
      '서버에서 API 응답(JSON) 대신 웹페이지(HTML)를 반환했습니다. 스마트폰 앱의 [서버 주소 설정]에 올바른 Render 서버 주소(https://...onrender.com)가 입력되어 있는지 확인해주세요.'
    );
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`서버 응답 파싱 실패: ${trimmed.slice(0, 80)}`);
  }
}

export interface ErpSyncResult {
  success: boolean;
  isIncremental: boolean;
  count: number;
  totalCount: number;
  syncTimestamp: number;
  lastUpdated: string;
  data: ErpMaterial[];
}

export async function fetchErpStatus(): Promise<ErpStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('ERP 상태 조회 실패');
  const json = await safeJsonParse(res);
  return json.data;
}

export async function fetchErpWarehouses(): Promise<ErpWarehouse[]> {
  const res = await fetch(`${API_BASE}/warehouses`);
  if (!res.ok) throw new Error('ERP 창고 목록 조회 실패');
  const json = await res.json();
  return json.data || [];
}

export async function syncErpMaterials(since?: string, whCode: string = 'ALL', limit: number = 3000): Promise<ErpSyncResult> {
  const params = new URLSearchParams();
  if (since) params.set('since', since);
  if (whCode) params.set('whCode', whCode);
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/materials/sync?${params.toString()}`);
  if (!res.ok) throw new Error('ERP 증분 동기화 실패');
  const json = await res.json();
  return json;
}

export async function searchErpMaterials(
  query: string = '',
  whCode: string = 'ALL',
  limit: number = 60,
  offset: number = 0
): Promise<ErpMaterial[]> {
  const result = await searchErpMaterialsWithTotal(query, whCode, limit, offset);
  return result.data;
}

export async function searchErpMaterialsWithTotal(
  query: string = '',
  whCode: string = 'ALL',
  limit: number = 60,
  offset: number = 0
): Promise<{ data: ErpMaterial[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (whCode) params.set('whCode', whCode);
  params.set('limit', limit.toString());
  if (offset > 0) params.set('offset', offset.toString());

  const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
  if (!res.ok) throw new Error('ERP 자재 검색 실패');
  const json = await res.json();
  const data = json.data || [];
  const total = typeof json.total === 'number' ? json.total : data.length;
  const hasMore = Boolean(json.hasMore ?? (offset + limit < total));
  return { data, total, hasMore };
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

/**
 * ERP MSSQL '미입고현황' 실시간 미입고 전표 목록 조회
 */
export async function fetchErpPendingSlips(query?: string, limit: number = 50): Promise<InboundSlip[]> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/inbound/pending-slips?${params.toString()}`);
  if (!res.ok) throw new Error('ERP 미입고 전표 목록 조회 실패');
  const json = await res.json();
  return json.data || [];
}

/**
 * ERP MSSQL 단건 전표 조회 (QR 스캔 실시간 매칭)
 */
export async function fetchErpSlipByNo(slipNo: string): Promise<InboundSlip> {
  const res = await fetch(`${API_BASE}/inbound/slips/${encodeURIComponent(slipNo.trim())}`);
  if (!res.ok) throw new Error('사내 ERP에서 전표를 찾을 수 없습니다.');
  const json = await res.json();
  return json.data;
}

export interface ErpPrintResponse {
  success: boolean;
  slip: InboundSlip;
  rawRows: any[];
  executedQuery: string;
  source: 'MMB202_PRINT' | 'FALLBACK_PENDING' | 'LOCAL';
  message: string;
}

/**
 * 사내 ERP MMB202_Print 입하증 출력 데이터 조회
 * EXEC MMB202_Print N'전표번호', 101, N'34661'
 */
export async function fetchErpPrintData(
  slipNo: string,
  companyCode: number = 101,
  subCode: string = '34661'
): Promise<ErpPrintResponse> {
  const params = new URLSearchParams({
    companyCode: companyCode.toString(),
    subCode,
  });
  const res = await fetch(`${API_BASE}/inbound/print/${encodeURIComponent(slipNo.trim())}?${params.toString()}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || json.message || 'ERP MMB202_Print 데이터 조회 실패');
  }
  return res.json();
}

/**
 * ERP MSSQL 실시간 입고 확정 및 MT_T_입출고 INSERT
 */
export async function processErpInboundReceive(payload: InboundReceivePayload): Promise<{
  success: boolean;
  insertedCount: number;
  slip: InboundSlip;
  logs: StockLog[];
  message: string;
}> {
  const res = await fetch(`${API_BASE}/inbound/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'ERP 실시간 입고 처리 실패');
  }
  return json;
}

/**
 * ERP MSSQL 실시간 입고 확정 취소 및 MT_T_입출고 레코드 삭제
 */
export async function cancelErpInboundReceive(slipNo: string): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/inbound/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slipNo }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'ERP 입고 취소 실패');
  }
  return json;
}

/**
 * 사내 ERP 담당자코드 & 패스워드 로그인 인증
 */
export async function loginErpUser(code: string, password?: string): Promise<ErpUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, password }),
  });
  const json = await safeJsonParse(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || '로그인에 실패했습니다.');
  }
  const user: ErpUser = {
    ...json.user,
    isOffline: Boolean(json.offlineMode),
  };
  return user;
}

/**
 * 오프라인 대기 큐 일괄 동기화 실행
 */
export async function syncQueueBatch(items: any[]): Promise<{
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  results: any[];
}> {
  const res = await fetch(`${API_BASE}/sync-queue/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || '대기 큐 일괄 동기화 실패');
  }
  return json;
}

/**
 * 활성 사원 목록 조회 (빠른 선택용)
 */
export async function fetchErpUsers(): Promise<ErpUser[]> {
  const res = await fetch(`${API_BASE}/auth/users`);
  if (!res.ok) throw new Error('사원 목록 조회 실패');
  const json = await res.json();
  return json.data || [];
}

/**
 * 사내 ERP 'MT_T_입출고' 실시간 입고 완료 내역 조회
 */
export async function fetchErpInboundHistory(limit: number = 100): Promise<InboundSlip[]> {
  const res = await fetch(`${API_BASE}/inbound/history?limit=${limit}`);
  if (!res.ok) throw new Error('ERP 입고 내역 조회 실패');
  const json = await res.json();
  return json.data || [];
}

/**
 * 사내 ERP 'MMB100 + MMB150' 실시간 발주 내역 인터페이스
 */
export interface ErpPurchaseOrder {
  poNo: string;           // 발주번호
  poDate: string;         // 발주일자 (YYYY-MM-DD)
  deliveryDate: string;   // 납기일자 (YYYY-MM-DD)
  supplierCode: string;   // 공급처코드
  supplierName: string;   // 공급처명
  warehouseName: string;  // 입고예정 창고명
  itemCode: string;       // 품목코드
  itemName: string;       // 품목명
  itemSpec: string;       // 규격
  unit: string;           // 단위
  poQty: number;          // 발주수량
  receivedQty: number;    // 기입고수량
  remainQty: number;      // 미입고 잔량
  unitPrice: number;      // 발주단가
  totalAmount: number;    // 발주금액
  remarks: string;        // 비고
  status: 'WAITING' | 'PARTIAL' | 'COMPLETED'; // 발주상태
}

/**
 * 사내 ERP 'MMB100 + MMB150' 실시간 발주 내역 목록 조회
 */
export async function fetchErpPurchaseOrders(
  query: string = '',
  status: string = 'ALL',
  limit: number = 60,
  offset: number = 0
): Promise<ErpPurchaseOrder[]> {
  const params = new URLSearchParams({
    query,
    status,
    limit: limit.toString(),
  });
  if (offset > 0) params.set('offset', offset.toString());

  const res = await fetch(`${API_BASE}/purchase-orders?${params.toString()}`);
  if (!res.ok) throw new Error('ERP 발주 내역 조회 실패');
  const json = await res.json();
  return json.data || [];
}

