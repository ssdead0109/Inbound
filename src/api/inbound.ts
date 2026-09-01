import { InboundSlip, InboundReceivePayload, InboundStats } from '../types/inbound';

const API_BASE = '/api/inbound';

export async function fetchWarehouses(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/warehouses`);
  if (!res.ok) throw new Error('창고 목록 조회 실패');
  const json = await res.json();
  return json.data || [];
}

export async function fetchInboundStats(): Promise<InboundStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('입고 통계 조회 실패');
  const json = await res.json();
  return json.data;
}

export async function fetchInboundSlips(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
  query?: string;
}): Promise<InboundSlip[]> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.supplier) searchParams.set('supplier', params.supplier);
  if (params?.query) searchParams.set('query', params.query);

  const url = `${API_BASE}/slips${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('납품확인서 목록 조회 실패');
  const json = await res.json();
  return json.data;
}

export async function fetchInboundSlipByNo(slipNo: string): Promise<InboundSlip> {
  const res = await fetch(`${API_BASE}/slips/${encodeURIComponent(slipNo)}`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `납품확인서 [${slipNo}]를 찾을 수 없습니다.`);
  }
  const json = await res.json();
  return json.data;
}

export async function processInboundReceive(payload: InboundReceivePayload): Promise<{
  slip: InboundSlip;
  updatedStockCount: number;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || '입고 처리에 실패했습니다.');
  }

  return {
    slip: json.data.slip,
    updatedStockCount: json.data.updatedStockCount,
    message: json.message,
  };
}

export async function createInboundSlipApi(slip: Partial<InboundSlip>): Promise<InboundSlip> {
  const res = await fetch(`${API_BASE}/slips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slip),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || '납품확인서 등록에 실패했습니다.');
  }

  return json.data;
}

export async function updateInboundSlipStatusApi(slipNo: string, status: string, memo?: string): Promise<InboundSlip> {
  const res = await fetch(`${API_BASE}/slips/${encodeURIComponent(slipNo)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, memo }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || '상태 변경에 실패했습니다.');
  }

  return json.data;
}

export async function resetInboundSamplesApi(): Promise<InboundSlip[]> {
  const res = await fetch(`${API_BASE}/reset-samples`, { method: 'POST' });
  if (!res.ok) throw new Error('샘플 데이터 초기화 실패');
  const json = await res.json();
  return json.data;
}
