import React, { useRef, useEffect } from 'react';
import { useResponsiveCols } from '../../hooks/useVirtualScroll';
import { RefreshCw } from 'lucide-react';

export interface VirtualGridProps<T> {
  items: T[];
  itemHeight?: number; // 하위 호환용 (더 이상 빈 여백 스페이서를 생성하지 않음)
  cols?: { sm?: number; md?: number; lg?: number; xl?: number };
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyPlaceholder?: React.ReactNode;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

/**
 * 고성능 반응형 카드 그리드 컴포넌트
 * 가짜 높이 패딩(Spacer Div)으로 인한 빈 화면(Blank Screen) 및 스크롤 튐 현상을 원천 차단하고,
 * IntersectionObserver를 통해 하단 도달 시 끊김 없이 무한 스크롤(Infinite Scroll)로 추가 데이터를 덧붙여 렌더링합니다.
 */
export function VirtualGrid<T>({
  items,
  cols = { sm: 2, md: 2, lg: 3, xl: 4 },
  renderItem,
  className = '',
  emptyPlaceholder,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
}: VirtualGridProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveCols(cols);

  // IntersectionObserver로 하단 도달 시 추가 데이터 로드 (무한 스크롤)
  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          onEndReached();
        }
      },
      { rootMargin: '600px 0px', threshold: 0.01 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onEndReached, hasMore, isLoadingMore]);

  // Window scroll fallback 감지 (하단 700px 이내 접근 시)
  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;

    const handleWindowScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 700;
      if (scrollPos >= threshold) {
        onEndReached();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [onEndReached, hasMore, isLoadingMore]);

  if (items.length === 0) {
    return emptyPlaceholder ? <>{emptyPlaceholder}</> : null;
  }

  // 동적 Tailwind grid-cols 클래스
  const gridColClass =
    columnCount === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : columnCount === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columnCount === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className="w-full">
      <div className={`grid ${gridColClass} gap-3 sm:gap-4 ${className}`}>
        {items.map((item, index) => renderItem(item, index))}
      </div>

      {/* 무한 스크롤 감지 센티넬 */}
      <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

      {/* 추가 로딩 스피너 */}
      {isLoadingMore && (
        <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>추가 데이터 불러오는 중...</span>
        </div>
      )}

      {/* 데이터 끝 도달 안내 */}
      {!hasMore && items.length > 20 && !isLoadingMore && (
        <div className="py-6 text-center text-xs text-slate-400 font-medium">
          모든 데이터를 불러왔습니다 (총 {items.length}건)
        </div>
      )}
    </div>
  );
}

export interface VirtualListProps<T> {
  items: T[];
  itemHeight?: number; // 하위 호환용
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyPlaceholder?: React.ReactNode;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

/**
 * 단일 열 리스트용 고성능 무한 스크롤 컴포넌트
 */
export function VirtualList<T>({
  items,
  renderItem,
  className = 'space-y-3',
  emptyPlaceholder,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
}: VirtualListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          onEndReached();
        }
      },
      { rootMargin: '600px 0px', threshold: 0.01 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onEndReached, hasMore, isLoadingMore]);

  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;

    const handleWindowScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 700;
      if (scrollPos >= threshold) {
        onEndReached();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [onEndReached, hasMore, isLoadingMore]);

  if (items.length === 0) {
    return emptyPlaceholder ? <>{emptyPlaceholder}</> : null;
  }

  return (
    <div className={`w-full ${className}`}>
      {items.map((item, index) => renderItem(item, index))}

      {/* 무한 스크롤 감지 센티넬 */}
      <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

      {/* 추가 로딩 스피너 */}
      {isLoadingMore && (
        <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>추가 데이터 불러오는 중...</span>
        </div>
      )}

      {/* 데이터 끝 도달 안내 */}
      {!hasMore && items.length > 20 && !isLoadingMore && (
        <div className="py-6 text-center text-xs text-slate-400 font-medium">
          모든 데이터를 불러왔습니다 (총 {items.length}건)
        </div>
      )}
    </div>
  );
}
