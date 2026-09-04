/**
 * KCP 자재 시스템 글씨 크기(큰글씨 모드) 헬퍼
 * 공장 현장 어르신 및 작업자를 위한 3단계 폰트 스케일링 관리
 */

export type FontSizeLevel = 'normal' | 'large' | 'xlarge';

const FONT_SIZE_STORAGE_KEY = 'kcp_font_size_level';
const FONT_SIZE_CHANGE_EVENT = 'kcp:font-size-changed';

export interface FontSizeOption {
  level: FontSizeLevel;
  name: string;
  badge: string;
  desc: string;
  scalePercent: number;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  {
    level: 'normal',
    name: '보통',
    badge: '100%',
    desc: '스마트폰 기본 표준 크기',
    scalePercent: 100,
  },
  {
    level: 'large',
    name: '크게',
    badge: '115%',
    desc: '공장 현장 추천 · 주요 글씨가 시원하게 보임',
    scalePercent: 115,
  },
  {
    level: 'xlarge',
    name: '아주 크게',
    badge: '128%',
    desc: '시니어 / 노안 최적화 · 최대 크기로 확대',
    scalePercent: 128,
  },
];

/**
 * 현재 저장된 글씨 크기 레벨 조회
 */
export function getSavedFontSize(): FontSizeLevel {
  try {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizeLevel;
    if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
  } catch {}
  return 'normal';
}

/**
 * 글씨 크기 레벨을 DOM 및 localStorage에 저장
 */
export function setFontSize(level: FontSizeLevel): void {
  try {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, level);
  } catch {}

  applyFontSizeToDom(level);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(FONT_SIZE_CHANGE_EVENT, { detail: { level } })
    );
  }
}

/**
 * HTML 루트 요소에 data-font-size 속성 적용
 */
export function applyFontSizeToDom(level: FontSizeLevel): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (level === 'normal') {
    root.removeAttribute('data-font-size');
  } else {
    root.setAttribute('data-font-size', level);
  }
}

/**
 * 글씨 크기 변경 이벤트 리스너 구독
 */
export function subscribeToFontSizeChange(
  callback: (level: FontSizeLevel) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ level: FontSizeLevel }>;
    callback(customEvent.detail.level);
  };

  window.addEventListener(FONT_SIZE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(FONT_SIZE_CHANGE_EVENT, handler);
}

// 앱 초기화 시 저장된 폰트 크기 즉시 DOM에 바인딩
if (typeof window !== 'undefined') {
  applyFontSizeToDom(getSavedFontSize());
}
