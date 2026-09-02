import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface UseVirtualScrollOptions {
  totalCount: number;
  itemHeight: number;
  overscan?: number;
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * 윈도우 스크롤 시 리스트의 시작 위치(Y 오프셋)를 자동 보정하기 위한 리스트 요소 Ref
   */
  listRef?: React.RefObject<HTMLElement | null>;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  topPadding: number;
  bottomPadding: number;
  virtualIndices: number[];
}

/**
 * 고성능 버츄얼 스크롤 훅 (Window 또는 Container 스크롤 지원)
 * 화면에 표시되는 항목과 오버스캔 버퍼만 계산하여 렌더링함으로써
 * 수천 건의 데이터도 60fps로 매끄럽게 스크롤합니다.
 */
export function useVirtualScroll({
  totalCount,
  itemHeight,
  overscan = 4,
  containerRef,
  listRef,
}: UseVirtualScrollOptions): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const animationFrameRef = useRef<number | null>(null);

  // 스크롤 이벤트 리스너 (requestAnimationFrame 최적화)
  useEffect(() => {
    const handleScroll = () => {
      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;
        if (containerRef && containerRef.current) {
          setScrollTop(containerRef.current.scrollTop);
        } else {
          // Window scroll 시 리스트 요소의 문서 내 절대 Top 위치를 고려하여 상대 스크롤 계산
          let relativeTop = window.scrollY;
          if (listRef && listRef.current) {
            const rect = listRef.current.getBoundingClientRect();
            const listAbsoluteTop = rect.top + window.scrollY;
            relativeTop = Math.max(0, window.scrollY - listAbsoluteTop);
          }
          setScrollTop(relativeTop);
        }
      });
    };

    const handleResize = () => {
      if (containerRef && containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      } else {
        setViewportHeight(window.innerHeight);
      }
      handleScroll();
    };

    handleResize();

    if (containerRef && containerRef.current) {
      const el = containerRef.current;
      el.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      return () => {
        el.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [containerRef, listRef]);

  return useMemo(() => {
    if (totalCount === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        totalHeight: 0,
        topPadding: 0,
        bottomPadding: 0,
        virtualIndices: [],
      };
    }

    const totalHeight = totalCount * itemHeight;

    // 항목 수가 적을 때는 가상화 언마운트 없이 전체를 안전하게 렌더링
    if (totalCount <= 15) {
      const virtualIndices: number[] = [];
      for (let i = 0; i < totalCount; i++) {
        virtualIndices.push(i);
      }
      return {
        startIndex: 0,
        endIndex: totalCount,
        totalHeight,
        topPadding: 0,
        bottomPadding: 0,
        virtualIndices,
      };
    }

    // 현재 뷰포트에 걸쳐있는 시작/끝 인덱스 계산
    const rawStart = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);

    const startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(totalCount, Math.max(startIndex + 1, rawStart + visibleCount + overscan));

    const topPadding = startIndex * itemHeight;
    const bottomPadding = Math.max(0, (totalCount - endIndex) * itemHeight);

    const virtualIndices: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      virtualIndices.push(i);
    }

    return {
      startIndex,
      endIndex,
      totalHeight,
      topPadding,
      bottomPadding,
      virtualIndices,
    };
  }, [totalCount, itemHeight, overscan, scrollTop, viewportHeight]);
}

/**
 * 반응형 브레이크포인트에 따른 열(Column) 개수 감지 훅
 */
export function useResponsiveCols(
  breakpoints: { sm?: number; md?: number; lg?: number; xl?: number } = {
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  }
): number {
  const getCols = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const w = window.innerWidth;
    if (w >= 1280 && breakpoints.xl) return breakpoints.xl;
    if (w >= 1024 && breakpoints.lg) return breakpoints.lg;
    if (w >= 768 && breakpoints.md) return breakpoints.md;
    if (w >= 640 && breakpoints.sm) return breakpoints.sm;
    return 1;
  }, [breakpoints]);

  const [cols, setCols] = useState(getCols);

  useEffect(() => {
    const onResize = () => setCols(getCols());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getCols]);

  return cols;
}
