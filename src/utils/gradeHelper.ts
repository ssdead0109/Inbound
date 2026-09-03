/**
 * 자재 등급(A/B/C/D) 산출 및 디자인 스타일 헬퍼
 */

export type MaterialGrade = 'A등급' | 'B등급' | 'C등급' | 'D등급' | 'O등급';

export function getMaterialGrade(item: {
  grade?: string;
  category?: string;
  unitPrice?: number;
  code?: string;
}): string {
  // 1. 이미 명시적인 등급이 설정된 경우 (A, B, C, D, O, S 등급)
  if (item.grade) {
    const g = item.grade.trim();
    if (['A등급', 'B등급', 'C등급', 'D등급', 'O등급', 'S등급'].includes(g)) return g;
    if (['A', 'B', 'C', 'D', 'O', 'S'].includes(g.toUpperCase())) return `${g.toUpperCase()}등급`;
  }

  // 2. 만약 category에 'A등급', 'A', 'B' 등이 저장되어 있는 경우
  if (item.category) {
    const c = item.category.trim();
    if (['A등급', 'B등급', 'C등급', 'D등급', 'O등급', 'S등급'].includes(c)) return c;
    if (['A', 'B', 'C', 'D', 'O', 'S'].includes(c.toUpperCase())) return `${c.toUpperCase()}등급`;
  }

  // 3. 자재 단가(unitPrice) 및 중요도 기준 ABC 분석 지능형 등급 산출
  // - 50만원 이상: 고가 / 핵심 전략 자재 -> A등급
  // - 5만원 ~ 50만원: 중가 / 주요 부품 -> B등급
  // - 5천원 ~ 5만원: 일반 기능 부품 -> C등급
  // - 5천원 미만: 소모품 / 표준 부자재 -> D등급
  const price = item.unitPrice || 0;
  if (price >= 500000) return 'A등급';
  if (price >= 50000) return 'B등급';
  if (price >= 5000) return 'C등급';
  return 'D등급';
}

export function getGradeBadgeStyle(grade: string): { bg: string; text: string; border: string } {
  const g = grade.toUpperCase();
  if (g.startsWith('A') || g.startsWith('S')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  }
  if (g.startsWith('B')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (g.startsWith('C')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
  }
  if (g.startsWith('D')) {
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
  if (g.startsWith('O')) {
    return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
}
