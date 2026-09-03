import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  isReady: boolean;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isPulling,
  isRefreshing,
  isReady,
}) => {
  if (!isPulling && !isRefreshing && pullDistance <= 0) return null;

  return (
    <div
      className="fixed left-1/2 z-50 pointer-events-none transition-all"
      style={{
        top: 'calc(var(--app-header-h, 56px) + 8px)',
        transform: `translate(-50%, ${Math.max(0, pullDistance - 15)}px)`,
        transition: isPulling ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out',
        opacity: pullDistance > 12 || isRefreshing ? 1 : 0,
      }}
    >
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-indigo-200 text-indigo-700 shadow-xl shadow-indigo-900/10 backdrop-blur-md text-xs font-bold select-none">
        {isRefreshing ? (
          <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
        ) : isReady ? (
          <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0 transform rotate-180 transition-transform duration-200" />
        ) : (
          <ArrowDown className="w-4 h-4 text-indigo-600 shrink-0 animate-bounce" />
        )}
        <span className={isReady ? 'text-emerald-700' : 'text-indigo-700'}>
          {isRefreshing
            ? '데이터 새로고침 중...'
            : isReady
            ? '손을 놓으면 새로고침'
            : '아래로 당겨서 새로고침'}
        </span>
      </div>
    </div>
  );
};
