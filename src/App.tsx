/**
 * KCP 자재입고 시스템
 * QR코드 기반 실시간 납품확인서 검수 및 입고처리 (PC & Mobile PWA)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  InboundSlip,
  InboundViewTab,
  InboundStats,
  InboundReceivePayload,
} from './types/inbound';
import * as inboundApi from './api/inbound';
import * as erpApi from './api/erpApi';
import { ParsedQrResult } from './utils/inboundQrParser';
import { soundHelper } from './utils/soundHelper';

import { InboundNavbar } from './components/inbound/InboundNavbar';
import { InboundScanner } from './components/inbound/InboundScanner';
import { InboundReceivingView } from './components/inbound/InboundReceivingView';
import { InboundPendingList } from './components/inbound/InboundPendingList';
import { InboundHistoryView } from './components/inbound/InboundHistoryView';
import { InboundSimulatorModal } from './components/inbound/InboundSimulatorModal';
import { InboundSlipPrintModal } from './components/inbound/InboundSlipPrintModal';
import { ErpMaterialSearchView } from './components/erp/ErpMaterialSearchView';
import { InboundLoginModal } from './components/auth/InboundLoginModal';
import { ErpUser } from './api/erpApi';

import {
  QrCode,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

export default function App() {
  // Main Navigation Tab
  const [currentTab, setCurrentTab] = useState<InboundViewTab>('SCANNER');

  // Slips, Stats & Warehouses State
  const [slips, setSlips] = useState<InboundSlip[]>([]);
  const [stats, setStats] = useState<InboundStats | null>(null);
  const [warehouses, setWarehouses] = useState<string[]>(['특장자재창고', '본관 자재1창고', '본관 자재2창고', '외주 가공자재창고', '원자재 야적장']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Slip currently being inspected
  const [activeSlip, setActiveSlip] = useState<InboundSlip | null>(null);

  // Active User / Operator Session (ERP MT_TC_담당자코드 / scu100)
  const [currentUser, setCurrentUser] = useState<ErpUser | null>(() => {
    const isAutoLogin = localStorage.getItem('kcp_auto_login') === 'true';
    if (!isAutoLogin) return null;

    const saved = localStorage.getItem('kcp_erp_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Operator display string
  const [operator, setOperator] = useState<string>(() => {
    const savedUser = localStorage.getItem('kcp_erp_user');
    if (savedUser) {
      try {
        const u: ErpUser = JSON.parse(savedUser);
        return `${u.name} (${u.dept || (u.isAdmin ? '관리자' : '자재')})`;
      } catch { /* fallback */ }
    }
    return localStorage.getItem('kcp_operator') || '홍길동 (자재과장)';
  });

  // Modal States
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [slipToPrint, setSlipToPrint] = useState<InboundSlip | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Slips, Stats and Warehouses from Backend (통합 ERP 실시간 미입고 & 입고내역 연동)
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedLocal, fetchedErpPending, fetchedErpHistory, fetchedStats, fetchedWh] = await Promise.all([
        inboundApi.fetchInboundSlips().catch(() => []),
        erpApi.fetchErpPendingSlips('', 100).catch(() => []),
        erpApi.fetchErpInboundHistory(100).catch(() => []),
        inboundApi.fetchInboundStats().catch(() => null),
        inboundApi.fetchWarehouses().catch(() => []),
      ]);

      const combined = [...fetchedLocal];
      for (const es of [...fetchedErpPending, ...fetchedErpHistory]) {
        if (!combined.some((s) => s.slipNo === es.slipNo)) {
          combined.push(es);
        }
      }

      setSlips(combined);
      if (fetchedStats) setStats(fetchedStats);
      if (fetchedWh && fetchedWh.length > 0) setWarehouses(fetchedWh);
    } catch (err: any) {
      console.warn('Failed fetching inbound data:', err);
      showToast(err.message || '서버 데이터 조회에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Check URL query / hash for deep link
  useEffect(() => {
    const handleUrlHash = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slipParam = urlParams.get('slipNo') || urlParams.get('slip') || window.location.hash.replace('#', '');

      if (slipParam && slipParam.startsWith('DN-')) {
        try {
          const slip = await inboundApi.fetchInboundSlipByNo(slipParam);
          setActiveSlip(slip);
          setCurrentTab('RECEIVING');
          showToast(`납품확인서 [${slip.slipNo}]를 불러왔습니다.`, 'success');
        } catch {
          // Ignore
        }
      }
    };
    handleUrlHash();
  }, []);

  // Save operator change
  const handleOperatorChange = (newOp: string) => {
    setOperator(newOp);
    localStorage.setItem('kcp_operator', newOp);
    showToast(`담당자가 '${newOp}'(으)로 변경되었습니다.`, 'info');
  };

  // Login Success
  const handleLoginSuccess = (user: ErpUser) => {
    setCurrentUser(user);
    const opTitle = `${user.name} (${user.dept || (user.isAdmin ? '관리자' : '자재')})`;
    setOperator(opTitle);
    localStorage.setItem('kcp_operator', opTitle);
    localStorage.setItem('kcp_erp_user', JSON.stringify(user));
    showToast(`${user.name}님 로그인 완료! 현장 입고 검수를 시작합니다.`, 'success');
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kcp_erp_user');
    localStorage.removeItem('kcp_auto_login');
    showToast('로그아웃되었습니다.', 'info');
  };

  // Handle QR Scan Result
  const handleScanSuccess = async (result: ParsedQrResult) => {
    soundHelper.playScanBeep();

    // 1. If QR contains full JSON slip data or Delimited format
    if (result.directSlipData) {
      try {
        const registered = await inboundApi.createInboundSlipApi(result.directSlipData);
        await loadInitialData();
        setActiveSlip(registered);
        setCurrentTab('RECEIVING');
        showToast(`납품확인서 [${registered.slipNo}] 스캔 성공! 검수를 시작합니다.`, 'success');
        return;
      } catch (err: any) {
        console.warn('Error saving direct slip:', err);
      }
    }

    // 2. If it's a Slip Number
    if (result.slipNo) {
      // Try local slip first
      try {
        const slip = await inboundApi.fetchInboundSlipByNo(result.slipNo);
        setActiveSlip(slip);
        setCurrentTab('RECEIVING');
        showToast(`납품확인서 [${slip.slipNo}] 조회 완료! 검수를 시작합니다.`, 'success');
        return;
      } catch {
        // Fallback to ERP '미입고현황' real-time search
        try {
          const erpSlip = await erpApi.fetchErpSlipByNo(result.slipNo);
          setActiveSlip(erpSlip);
          setCurrentTab('RECEIVING');
          showToast(`사내 ERP 미입고 전표 [${erpSlip.slipNo}] 조회 완료! 실시간 입고 검수를 시작합니다.`, 'success');
          return;
        } catch (erpErr: any) {
          soundHelper.playErrorBuzzer();
          showToast(`전표 [${result.slipNo}]를 로컬 및 사내 ERP에서 찾을 수 없습니다.`, 'error');
          return;
        }
      }
    }

    showToast(`스캔된 코드 [${result.rawText}]에 해당하는 정보를 찾을 수 없습니다.`, 'error');
  };

  // Select Pending Slip to Inspect (supports direct ERP slip object)
  const handleSelectPendingSlip = async (slipNo: string, directSlip?: InboundSlip) => {
    if (directSlip) {
      setActiveSlip(directSlip);
      setCurrentTab('RECEIVING');
      return;
    }

    try {
      const slip = await inboundApi.fetchInboundSlipByNo(slipNo);
      setActiveSlip(slip);
      setCurrentTab('RECEIVING');
    } catch {
      try {
        const erpSlip = await erpApi.fetchErpSlipByNo(slipNo);
        setActiveSlip(erpSlip);
        setCurrentTab('RECEIVING');
      } catch (err: any) {
        showToast(err.message || '전표 조회 실패', 'error');
      }
    }
  };

  // Confirm Inbound Receiving Transaction (supports real-time MSSQL MT_T_입출고 insert)
  const handleConfirmReceiving = async (payload: InboundReceivePayload) => {
    try {
      const isErpSlip = activeSlip?.supplierCode?.startsWith('SUP-ERP') ||
                        (activeSlip && activeSlip.slipNo.length === 11) ||
                        (activeSlip && !activeSlip.slipNo.startsWith('DN-'));

      const managerName = currentUser ? `${currentUser.name} [${currentUser.code}]` : operator;
      const receivePayload: InboundReceivePayload = {
        ...payload,
        manager: payload.manager || managerName,
      };

      let resultSlip: InboundSlip;

      if (isErpSlip) {
        // Real-time ERP MSSQL Inbound Receive
        const erpRes = await erpApi.processErpInboundReceive(receivePayload);
        soundHelper.playSuccessChime();
        showToast(erpRes.message || '사내 ERP(MSSQL) 입고 처리가 완료되었습니다!', 'success');
        resultSlip = erpRes.slip;
      } else {
        // Standard Local Inbound Receive
        const localRes = await inboundApi.processInboundReceive(receivePayload);
        soundHelper.playSuccessChime();
        showToast(localRes.message || '입고 처리가 완료되었습니다!', 'success');
        resultSlip = localRes.slip;
      }

      await loadInitialData();
      setActiveSlip(resultSlip);
      setCurrentTab('HISTORY');
    } catch (err: any) {
      soundHelper.playErrorBuzzer();
      showToast(err.message || '입고 처리 중 오류가 발생했습니다.', 'error');
      throw err;
    }
  };

  // Hold Slip
  const handleHoldSlip = async (slipNo: string, memo: string) => {
    try {
      const updated = await inboundApi.updateInboundSlipStatusApi(slipNo, 'HOLD', memo);
      showToast(`납품확인서 [${slipNo}]가 보류 처리되었습니다.`, 'info');
      await loadInitialData();
      setActiveSlip(updated);
      setCurrentTab('PENDING');
    } catch (err: any) {
      showToast(err.message || '보류 처리 실패', 'error');
    }
  };

  // Open Print Modal (if opened from History)
  const handleOpenPrintModal = (slip: InboundSlip) => {
    setSlipToPrint(slip);
    setIsPrintModalOpen(true);
  };

  const pendingCount = slips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING').length;

  if (!currentUser) {
    return (
      <>
        {toast && (
          <div className="fixed top-6 right-3 sm:right-6 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className={`px-4 py-2.5 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-white text-emerald-700 border-emerald-300 shadow-emerald-100/50'
                : toast.type === 'error'
                ? 'bg-white text-rose-700 border-rose-300 shadow-rose-100/50'
                : 'bg-white text-indigo-700 border-indigo-300 shadow-indigo-100/50'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        <InboundLoginModal onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div
      style={{ backgroundColor: '#f8fafc', color: '#0f172a', colorScheme: 'light' }}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased w-full max-w-full overflow-x-hidden"
    >
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-white text-emerald-700 border-emerald-300 shadow-emerald-100/50'
              : toast.type === 'error'
              ? 'bg-white text-rose-700 border-rose-300 shadow-rose-100/50'
              : 'bg-white text-indigo-700 border-indigo-300 shadow-indigo-100/50'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Navbar (KCP 자재입고) */}
      <InboundNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
        operator={operator}
        onChangeOperator={handleOperatorChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onRefreshData={loadInitialData}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pb-32 md:pb-8 w-full max-w-full overflow-x-hidden">
        {currentTab === 'SCANNER' && (
          <InboundScanner
            onScanSuccess={handleScanSuccess}
            pendingSlips={slips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING')}
            onSelectPendingSlip={handleSelectPendingSlip}
          />
        )}

        {currentTab === 'RECEIVING' && activeSlip && (
          <InboundReceivingView
            slip={activeSlip}
            operator={operator}
            warehouses={warehouses}
            onConfirmReceiving={handleConfirmReceiving}
            onHoldSlip={handleHoldSlip}
            onBackToScanner={() => setCurrentTab('SCANNER')}
          />
        )}

        {currentTab === 'PENDING' && (
          <InboundPendingList
            slips={slips}
            onSelectSlip={handleSelectPendingSlip}
            onOpenScanner={() => setCurrentTab('SCANNER')}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {currentTab === 'HISTORY' && (
          <InboundHistoryView
            slips={slips}
            onOpenPrintModal={handleOpenPrintModal}
            onSelectSlip={handleSelectPendingSlip}
            onRefresh={loadInitialData}
          />
        )}

        {currentTab === 'ERP_SEARCH' && (
          <ErpMaterialSearchView onShowToast={showToast} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar with Safe Area Inset Support */}
      <div
        style={{ paddingBottom: 'max(20px, calc(0.6rem + env(safe-area-inset-bottom, 20px)))' }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-2 px-2 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setCurrentTab('SCANNER')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'SCANNER' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>QR 스캔</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('PENDING')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all relative cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'PENDING' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>입고 대기</span>
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-xs">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('HISTORY')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'HISTORY' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <History className="w-5 h-5" />
          <span>입고 내역</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('ERP_SEARCH')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'ERP_SEARCH' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <Database className="w-5 h-5 text-emerald-600" />
          <span>ERP 자재</span>
        </button>
      </div>

      {/* Printable Inbound Receipt Modal (for History tab) */}
      <InboundSlipPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        slip={slipToPrint}
      />

    </div>
  );
}
