import { LabelPrintConfig } from '../types/inventory';

export async function fetchLabelConfig(): Promise<LabelPrintConfig> {
  const res = await fetch('/api/config/label');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '라벨 설정을 불러오는데 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}

export async function saveLabelConfigApi(config: LabelPrintConfig): Promise<LabelPrintConfig> {
  const res = await fetch('/api/config/label', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '라벨 설정 저장에 실패했습니다.');
  }
  const json = await res.json();
  return json.data;
}
