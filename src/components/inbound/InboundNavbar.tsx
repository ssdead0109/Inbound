import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  History,
  FileText,
  User,
  Database,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { InboundViewTab } from '../../types/inbound';
import { ErpUser, fetchErpStatus } from '../../api/erpApi';
import { CloudUpload } from 'lucide-react';
import { getPendingQueueCount, subscribeToQueueChanges, isQueueSyncing } from '../../utils/syncQueueHelper';
import { FontSizeModal } from '../common/FontSizeModal';
import { FontSizeLevel, getSavedFontSize, subscribeToFontSizeChange } from '../../utils/fontSizeHelper';

interface InboundNavbarProps {
  currentTab: InboundViewTab;
  onSelectTab: (tab: InboundViewTab) => void;
  pendingCount: number;
  operator: string;
  onChangeOperator: (operator: string) => void;
  currentUser?: ErpUser | null;
  onLogout?: () => void;
  onRefreshData?: () => void;
  onOpenSyncQueue?: () => void;
  onOpenServerConfig?: () => void;
  isErpOnline?: boolean;
}

export const InboundNavbar: React.FC<InboundNavbarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  operator,
  onChangeOperator,
  currentUser,
  onLogout,
  onRefreshData,
  onOpenSyncQueue,
  onOpenServerConfig,
  isErpOnline: externalIsOnline,
}) => {
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [customOpInput, setCustomOpInput] = useState(operator);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isErpOnline, setIsErpOnline] = useState<boolean>(externalIsOnline ?? true);
  const [fontSizeLevel, setFontSizeLevel] = useState<FontSizeLevel>(getSavedFontSize);
  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState<boolean>(false);
  const isNativeApp = Capacitor.isNativePlatform();

  // Load and subscribe to font size changes and update header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.getElementById('app-header');
      if (headerEl) {
        document.documentElement.style.setProperty('--app-header-h', `${headerEl.offsetHeight}px`);
      }
    };

    const unsubscribe = subscribeToFontSizeChange((level) => {
      setFontSizeLevel(level);
      setTimeout(updateHeaderHeight, 60);
    });
    return unsubscribe;
  }, []);

  // Load and subscribe to queue count & syncing state
  useEffect(() => {
    getPendingQueueCount().then(setQueueCount);
    setIsSyncing(isQueueSyncing());
    return subscribeToQueueChanges(() => {
      getPendingQueueCount().then(setQueueCount);
      setIsSyncing(isQueueSyncing());
    });
  }, []);

  // Periodically check ERP DB status
  useEffect(() => {
    if (externalIsOnline !== undefined) {
      setIsErpOnline(externalIsOnline);
      return;
    }
    const check = () => {
      fetchErpStatus().then(st => setIsErpOnline(Boolean(st?.isConnected))).catch(() => setIsErpOnline(false));
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, [externalIsOnline]);

  // Dynamically update --app-header-h CSS custom property so sticky search bars stick pixel-perfectly
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.getElementById('app-header');
      if (headerEl) {
        document.documentElement.style.setProperty('--app-header-h', `${headerEl.offsetHeight}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isNativeApp]);

  const handleSaveCustomOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOpInput.trim()) {
      onChangeOperator(customOpInput.trim());
      setIsEditingOperator(false);
    }
  };

  const handleRefreshClick = async () => {
    if (!onRefreshData || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 select-none shadow-2xs w-full max-w-full"
      style={{
        paddingTop: isNativeApp ? 'max(env(safe-area-inset-top, 0px), 28px)' : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          
          {/* Logo & Brand Title: "KCP 자재관리" */}
          <div
            className="flex items-center space-x-2 cursor-pointer shrink-0"
            onClick={() => onSelectTab('SCANNER')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs shrink-0 border border-slate-200 bg-white p-0.5">
              <img src="/wma-icon.png" alt="WMA" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                KCP <span className="text-indigo-600 font-bold ml-0.5">자재</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs: 입고확인, 입고 내역, 발주 조회, ERP 자재조회 */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectTab('SCANNER')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'SCANNER'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>입고확인</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('HISTORY')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'HISTORY'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>입고내역</span>
            </button>

            <button
              onClick={() => onSelectTab('PURCHASE_ORDERS')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'PURCHASE_ORDERS'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>발주조회</span>
            </button>

            <button
              onClick={() => onSelectTab('ERP_SEARCH')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'ERP_SEARCH'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>자재조회</span>
            </button>
          </nav>

          {/* Right User Status, Refresh, Sync Queue & Logout */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">

            {/* Font Size (큰글씨 모드) Setting Button */}
            <button
              type="button"
              onClick={() => setIsFontSizeModalOpen(true)}
              title={
                fontSizeLevel === 'xlarge'
                  ? '글씨 크기: 아주 크게 (클릭하여 변경)'
                  : fontSizeLevel === 'large'
                  ? '글씨 크기: 크게 (클릭하여 변경)'
                  : '글씨 크기 설정 (큰글씨 모드)'
              }
              className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 border flex items-center gap-1 font-bold ${
                fontSizeLevel !== 'normal'
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
              }`}
            >
              <span className="text-xs sm:text-sm font-black tracking-tighter">가A</span>
              {fontSizeLevel !== 'normal' ? (
                <span className="px-1 py-0.2 rounded-md text-[10px] font-bold bg-indigo-600 text-white leading-none">
                  {fontSizeLevel === 'xlarge' ? '아주크게' : '크게'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 hidden xl:inline">
                  글씨
                </span>
              )}
            </button>

            
            {/* Sync Queue Button (오프라인: 빨간색, 정상: 하얀색, 동기화중: 파란색) */}
            {onOpenSyncQueue && (
              <button
                type="button"
                onClick={onOpenSyncQueue}
                title={
                  isSyncing
                    ? 'ERP 동기화 진행 중...'
                    : !isErpOnline
                    ? `사내 DB 미연결 (오프라인) - 클릭하여 대기 큐 확인${queueCount > 0 ? ` (${queueCount}건)` : ''}`
                    : queueCount > 0
                    ? `동기화 대기 ${queueCount}건 (클릭하여 열기)`
                    : '동기화 대기 큐 열기 (ERP 정상 연결)'
                }
                className={`relative p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 font-medium ${
                  !isErpOnline
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-sm animate-pulse'
                    : isSyncing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                }`}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
                ) : (
                  <CloudUpload className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isErpOnline ? 'text-white' : 'text-slate-700'}`} />
                )}

                {/* Status or Queue Count Badge */}
                {isSyncing ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white text-blue-700">
                    동기화중
                  </span>
                ) : queueCount > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      !isErpOnline
                        ? 'bg-white text-rose-700'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {queueCount}
                  </span>
                ) : !isErpOnline ? (
                  <span className="text-[10px] font-bold tracking-tight hidden sm:inline">
                    오프라인
                  </span>
                ) : null}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs shrink-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isErpOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-900 truncate max-w-[65px] sm:max-w-none">{currentUser.name}</span>
                </div>

                {/* Refresh Data Button */}
                {onRefreshData && (
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    title="전표 및 상태 새로고침"
                    className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200 hover:border-indigo-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                )}

                {/* Logout Button */}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="로그아웃"
                    className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200 hover:border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            ) : isEditingOperator ? (
              <form onSubmit={handleSaveCustomOp} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={customOpInput}
                  onChange={(e) => setCustomOpInput(e.target.value)}
                  className="w-20 sm:w-32 px-2 py-1 text-xs bg-white border border-indigo-500 rounded-lg text-slate-900 font-medium focus:outline-none ring-2 ring-indigo-500/20"
                  autoFocus
                  placeholder="담당자명"
                />
                <button type="submit" className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg font-bold">
                  저장
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate max-w-[70px] sm:max-w-none">{operator}</span>
                </div>

                {onRefreshData && (
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    title="전표 및 상태 새로고침"
                    className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200 hover:border-indigo-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Font Size Setting Modal (큰글씨 모드) */}
      <FontSizeModal
        isOpen={isFontSizeModalOpen}
        onClose={() => setIsFontSizeModalOpen(false)}
        onChanged={(lvl) => setFontSizeLevel(lvl)}
      />
    </header>
  );
};
