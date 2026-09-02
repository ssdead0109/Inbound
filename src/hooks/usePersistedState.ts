import { useState, useCallback } from 'react';

/**
 * 탭 전환이나 페이지 이동 시에도 검색 필터 및 입력 상태를 보존하는 커스텀 훅
 * sessionStorage를 기반으로 동작하여 현재 세션 동안 상태를 안전하게 유지합니다.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`[usePersistedState] Failed to parse sessionStorage for key "${key}":`, e);
    }
    return defaultValue;
  });

  const setPersistedState = useCallback((val: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val;
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.warn(`[usePersistedState] Failed to set sessionStorage for key "${key}":`, e);
      }
      return next;
    });
  }, [key]);

  return [state, setPersistedState];
}
