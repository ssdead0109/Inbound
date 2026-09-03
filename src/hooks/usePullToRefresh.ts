import { useState, useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  pullThreshold?: number; // px required to trigger refresh (default 60)
  maxPull?: number; // max visual drag distance (default 85)
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  pullThreshold = 60,
  maxPull = 85,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);

  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollY <= 1) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshingRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollY > 1) {
        isPullingRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 5) {
        const distance = Math.min(deltaY * 0.42, maxPull);
        pullDistanceRef.current = distance;
        setPullDistance(distance);
        setIsPulling(true);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshingRef.current) return;
      isPullingRef.current = false;
      setIsPulling(false);

      const currentDistance = pullDistanceRef.current;

      if (currentDistance >= pullThreshold) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(48); // Pin at loading position
        try {
          await onRefresh();
        } catch (err) {
          console.warn('[PullToRefresh] Refresh failed:', err);
        } finally {
          setTimeout(() => {
            pullDistanceRef.current = 0;
            setPullDistance(0);
            setIsRefreshing(false);
            isRefreshingRef.current = false;
          }, 400);
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [disabled, onRefresh, pullThreshold, maxPull]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    isReady: pullDistance >= pullThreshold,
  };
}
