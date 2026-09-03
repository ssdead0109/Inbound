/**
 * KCP 자재입고 시스템
 * QR코드 기반 실시간 납품확인서 검수 및 입고처리 (PC & Mobile PWA)
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  InboundSlip,
  InboundViewTab,
  InboundStats,
  InboundReceivePayload,
} from './types/inbound';
import * as inboundApi from './api/inbound';
import * as erpApi from './api/erpApi';
import { ParsedQrResult, resolveInboundQrResult } from './utils/inboundQrParser';
import { resolveQrTokenApi } from './api/qrApi';
import { soundHelper } from './utils/soundHelper';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { registerBackHandler, triggerBack } from './utils/backHandler';

import { InboundNavbar } from './components/inbound/InboundNavbar';
import { InboundScanner } from './components/inbound/InboundScanner';
import { InboundReceivingView } from './components/inbound/InboundReceivingView';
import { InboundPendingList } from './components/inbound/InboundPendingList';
import { InboundHistoryView } from './components/inbound/InboundHistoryView';
import { InboundSimulatorModal } from './components/inbound/InboundSimulatorModal';
import { InboundSlipPrintModal } from './components/inbound/InboundSlipPrintModal';
import { InboundSyncQueueModal } from './components/inbound/InboundSyncQueueModal';
import { ErpMaterialSearchView } from './components/erp/ErpMaterialSearchView';
import { InboundPurchaseOrderView } from './components/inbound/InboundPurchaseOrderView';
import { InboundLoginModal } from './components/auth/InboundLoginModal';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import { ErpUser } from './api/erpApi';
import {
  saveSlipsToIndexedDb,
  saveSlipToIndexedDb,
  getSlipsFromIndexedDb,
  getSlipByNoFromIndexedDb,
  getMaterialByCodeInIndexedDb,
  cleanDummySlipsFromIndexedDb,
} from './utils/indexedDbHelper';
import { isDummySlip } from './utils/dummyHelper';
import {
  queueInboundReceive,
  processSyncQueue,
  getPendingQueueCount,
} from './utils/syncQueueHelper';

import {
  ClipboardCheck,
  History,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

export default function App() {
  // Main Navigation Tab & Tab History Stack (전에 작업하던 곳으로 뒤로가기)
  const [currentTab, setCurrentTab] = useState<InboundViewTab>('SCANNER');
  const [tabHistory, setTabHistory] = useState<InboundViewTab[]>(['SCANNER']);
  const lastBackPressRef = useRef<number>(0);

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

  // Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [slipToPrint, setSlipToPrint] = useState<InboundSlip | null>(null);
  const [isSyncQueueOpen, setIsSyncQueueOpen] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const ignoreBackUntilRef = useRef<number>(0);
  const receivingEnteredAtRef = useRef<number>(0);

  // Unified Tab Navigation (Pushes to History Stack & window.history)
  const navigateToTab = useCallback((nextTab: InboundViewTab, slip?: InboundSlip | null) => {
    ignoreBackUntilRef.current = Date.now() + 1500; // Ignore accidental back events for 1.5s after navigation

    if (slip) {
      setActiveSlip(slip);
    } else if (nextTab !== 'RECEIVING') {
      setActiveSlip(null);
    }
    setTabHistory((prev) => {
      if (prev[prev.length - 1] === nextTab) return prev;
      return [...prev, nextTab];
    });
    setCurrentTab(nextTab);
    try {
      window.history.pushState({ tab: nextTab }, '', '');
    } catch { /* ignore */ }
  }, []);

  // Return from inspection to previous screen
  const handleBackFromReceiving = useCallback(() => {
    setActiveSlip(null);
    setTabHistory((prev) => {
      const copy = [...prev];
      if (copy[copy.length - 1] === 'RECEIVING') copy.pop();
      return copy.length > 0 ? copy : ['SCANNER'];
    });
    setCurrentTab('SCANNER');
  }, []);

  // Register Back Handler for Simulator Modal (Priority 100)
  useEffect(() => {
    if (!isSimulatorOpen) return;
    return registerBackHandler('simulatorModal', 100, () => {
      setIsSimulatorOpen(false);
      return true;
    });
  }, [isSimulatorOpen]);

  // Register Back Handler for Sync Queue Modal (Priority 90)
  useEffect(() => {
    if (!isSyncQueueOpen) return;
    return registerBackHandler('syncQueueModal', 90, () => {
      setIsSyncQueueOpen(false);
      return true;
    });
  }, [isSyncQueueOpen]);

  // Register Back Handler for Inspection Screen (Priority 50)
  useEffect(() => {
    if (currentTab !== 'RECEIVING') return;
    receivingEnteredAtRef.current = Date.now();
    return registerBackHandler('receivingScreen', 50, () => {
      // Guard: Do not allow closing inspection screen within 1.5 seconds of entry (prevents camera activity return bounce)
      if (Date.now() - receivingEnteredAtRef.current < 1500) {
        console.log('[BackHandler] Guarded against premature exit from RECEIVING screen');
        return true;
      }
      handleBackFromReceiving();
      return true;
    });
  }, [currentTab, handleBackFromReceiving]);

  // Register Back Handler for Tab History (Priority 20: "전에 작업하던 곳으로 이동")
  useEffect(() => {
    return registerBackHandler('tabHistory', 20, () => {
      if (tabHistory.length > 1) {
        const copy = [...tabHistory];
        copy.pop(); // remove current tab
        const prevTab = copy[copy.length - 1] || 'SCANNER';
        setTabHistory(copy);
        setCurrentTab(prevTab);
        if (prevTab !== 'RECEIVING') {
          setActiveSlip(null);
        }
        return true;
      }
      return false; // at root level
    });
  }, [tabHistory]);

  // Global Back Trigger Handler
  // Returns true if handled by modal/subview/tabHistory, false if at root level
  const handleGlobalBack = useCallback((): boolean => {
    if (Date.now() < ignoreBackUntilRef.current) {
      console.log('[BackHandler] Ignored back event within cooldown period');
      return true;
    }
    return triggerBack();
  }, []);

  // Expose to window for Android native MainActivity.java callback
  useEffect(() => {
    (window as any).handleNativeBackButton = () => {
      return handleGlobalBack();
    };
    return () => {
      delete (window as any).handleNativeBackButton;
    };
  }, [handleGlobalBack]);

  // Wire into Android Capacitor native back button AND Web popstate
  useEffect(() => {
    let capListener: any = null;

    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        const handled = handleGlobalBack();
        if (!handled) {
          // At root screen: require two presses within 2000ms to exit app
          const now = Date.now();
          if (now - lastBackPressRef.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPressRef.current = now;
            showToast('뒤로가기 버튼을 한 번 더 누르면 종료됩니다.', 'info');
          }
        }
      }).then((l) => {
        capListener = l;
      });
    }

    // Web browser popstate handling with guard state to prevent browser exit
    try {
      window.history.pushState({ appRoot: true }, '', '');
    } catch { /* ignore */ }

    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      // In native Capacitor app, physical back button is handled by CapApp.addListener('backButton') and MainActivity.
      // PopState in native app is triggered by external Activity resumes (Camera, Gallery) and must be ignored.
      if (Capacitor.isNativePlatform()) {
        return;
      }

      const handled = handleGlobalBack();
      if (handled) {
        try {
          window.history.pushState({ appRoot: true }, '', '');
        } catch { /* ignore */ }
      } else {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          if (Capacitor.isNativePlatform()) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        } else {
          lastBackPressRef.current = now;
          showToast('뒤로가기 버튼을 한 번 더 누르면 종료됩니다.', 'info');
          try {
            window.history.pushState({ appRoot: true }, '', '');
          } catch { /* ignore */ }
        }
      }
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      if (capListener) capListener.remove();
      window.removeEventListener('popstate', onPopState);
    };
  }, [handleGlobalBack, showToast]);

  // Load Slips, Stats and Warehouses from Backend (통합 ERP 실시간 미입고 & 입고내역 연동 + IndexedDB 오프라인 캐시)
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [erpStatus, fetchedLocal, fetchedErpPending, fetchedErpHistory, fetchedStats, fetchedWh] = await Promise.all([
        erpApi.fetchErpStatus().catch(() => null),
        inboundApi.fetchInboundSlips().catch(() => []),
        erpApi.fetchErpPendingSlips('', 200).catch(() => []),
        erpApi.fetchErpInboundHistory(300).catch(() => []),
        inboundApi.fetchInboundStats().catch(() => null),
        inboundApi.fetchWarehouses().catch(() => []),
      ]);

      const isRealDbConnected = Boolean(erpStatus?.isConnected && !erpStatus?.isDummyMode);

      let combined = [...fetchedLocal];
      for (const es of [...fetchedErpPending, ...fetchedErpHistory]) {
        if (!combined.some((s) => s.slipNo === es.slipNo)) {
          combined.push(es);
        }
      }

      // 더미데이터 완전 배제 & 브라우저 IndexedDB 더미 청소
      combined = combined.filter((s) => !isDummySlip(s));
      cleanDummySlipsFromIndexedDb().catch(() => {});

      // If ERP data could not be fetched (offline), fallback to clean IndexedDB cached slips
      if (fetchedErpPending.length === 0 && fetchedErpHistory.length === 0 && !isRealDbConnected) {
        try {
          const idbSlips = await getSlipsFromIndexedDb('', true);
          for (const s of idbSlips) {
            if (!combined.some((c) => c.slipNo === s.slipNo)) {
              combined.push(s);
            }
          }
        } catch (idbErr) {
          console.warn('Failed loading from IndexedDB slips cache:', idbErr);
        }
      } else {
        // Save real slips to IndexedDB cache
        saveSlipsToIndexedDb(combined).catch(() => {});
      }

      setSlips(combined);
      if (fetchedStats) setStats(fetchedStats);
      if (fetchedWh && fetchedWh.length > 0) setWarehouses(fetchedWh);
    } catch (err: any) {
      console.warn('Failed fetching inbound data:', err);
      try {
        const idbSlips = await getSlipsFromIndexedDb('', false);
        if (idbSlips.length > 0) {
          setSlips(idbSlips);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 통합 새로고침 (상단바 버튼 클릭 시 전체 데이터 및 활성 탭 일괄 새로고침)
  const handleRefreshData = useCallback(async () => {
    try {
      await loadInitialData();
      window.dispatchEvent(new CustomEvent('app:refresh-data'));
      showToast('데이터가 최신 상태로 새로고침되었습니다.', 'success');
    } catch (err: any) {
      showToast(err.message || '새로고침 실패', 'error');
    }
  }, [loadInitialData, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadInitialData();
    };
    window.addEventListener('app:refresh-data', handleRefresh);
    return () => window.removeEventListener('app:refresh-data', handleRefresh);
  }, [loadInitialData]);

  // Auto-sync worker: triggers when network/DB recovers
  useEffect(() => {
    let timer: any = null;
    const runAutoSync = async () => {
      try {
        const queueCount = await getPendingQueueCount();
        if (queueCount > 0) {
          const st = await erpApi.fetchErpStatus();
          if (st?.isConnected) {
            console.log('[AutoSync] ERP DB restored! Auto syncing pending tasks:', queueCount);
            const res = await processSyncQueue();
            if (res.succeeded > 0) {
              showToast(`🔄 [자동 동기화] ${res.succeeded}건의 입고 작업이 사내 ERP에 반영되었습니다!`, 'success');
              await loadInitialData();
            }
          }
        }
      } catch {
        // ignore background poll errors
      }
    };

    timer = setInterval(runAutoSync, 15000);
    const onOnline = () => { runAutoSync(); };
    window.addEventListener('online', onOnline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', onOnline);
    };
  }, [loadInitialData, showToast]);

  // Check URL query / hash / path for deep link and /q/:token Short URLs
  useEffect(() => {
    const handleUrlHash = async () => {
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      // 1. Check for Short URL Token (/q/:token, ?q=:token, #q/:token)
      let tokenCandidate = urlParams.get('q');
      if (!tokenCandidate && pathname.includes('/q/')) {
        const match = pathname.match(/\/q\/([A-Za-z0-9_-]+)/);
        if (match && match[1]) tokenCandidate = match[1];
      }
      if (!tokenCandidate && hash.includes('q/')) {
        const match = hash.match(/q\/([A-Za-z0-9_-]+)/);
        if (match && match[1]) tokenCandidate = match[1];
      }

      if (tokenCandidate) {
        try {
          const rec = await resolveQrTokenApi(tokenCandidate);
          if (rec && rec.type === 'INBOUND' && rec.targetId) {
            const slip = await inboundApi.fetchInboundSlipByNo(rec.targetId);
            setActiveSlip(slip);
            setCurrentTab('RECEIVING');
            showToast(`QR 전표 [${slip.slipNo}] 연결 완료! 검수를 시작합니다.`, 'success');
            return;
          }
        } catch {
          // Continue to legacy check
        }
      }

      // 2. Legacy query param ?slipNo=... or hash #DN-...
      const slipParam = urlParams.get('slipNo') || urlParams.get('slip') || hash.replace('#', '');
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

  // Handle QR Scan Result (초고속 전표 매칭 및 자동 검수 시작)
  const handleScanSuccess = async (rawResult: ParsedQrResult) => {
    const result = await resolveInboundQrResult(rawResult);
    soundHelper.playScanBeep();

    const raw = (result.slipNo || result.rawText || '').trim();
    const cleanRaw = raw.replace(/\s+/g, '');
    const alphanumeric = cleanRaw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. If QR contains full JSON slip data or Delimited format
    if (result.directSlipData) {
      try {
        const registered = await inboundApi.createInboundSlipApi(result.directSlipData);
        await loadInitialData();
        setActiveSlip(registered);
        navigateToTab('RECEIVING', registered);
        showToast(`납품확인서 [${registered.slipNo}] 스캔 성공! 검수를 시작합니다.`, 'success');
        return;
      } catch {
        // Offline fallback: save to IndexedDB directly
        try {
          await saveSlipToIndexedDb(result.directSlipData);
        } catch { /* ignore */ }
        setSlips((prev) => [result.directSlipData!, ...prev.filter((s) => s.slipNo !== result.directSlipData!.slipNo)]);
        setActiveSlip(result.directSlipData);
        navigateToTab('RECEIVING', result.directSlipData);
        showToast(`납품확인서 [${result.directSlipData.slipNo}] 확인! 즉시 검수를 시작합니다.`, 'success');
        return;
      }
    }

    // 2. Immediate in-memory slips matching (0ms latency!)
    const matchedMemorySlip = slips.find((s) => {
      const sNo = s.slipNo.trim();
      const sNoClean = sNo.replace(/\s+/g, '');
      const sNoAlpha = sNoClean.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const poClean = (s.poNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      return (
        sNo === raw ||
        sNo.toLowerCase() === raw.toLowerCase() ||
        (alphanumeric.length >= 4 && (sNoAlpha.includes(alphanumeric) || alphanumeric.includes(sNoAlpha))) ||
        (poClean && (poClean === alphanumeric || poClean === raw.toLowerCase())) ||
        s.items.some((it) => it.itemCode.toLowerCase() === raw.toLowerCase() || (it.barcode && it.barcode === raw))
      );
    });

    if (matchedMemorySlip) {
      setActiveSlip(matchedMemorySlip);
      navigateToTab('RECEIVING', matchedMemorySlip);
      showToast(`전표 [${matchedMemorySlip.slipNo}] 확인! 즉시 검수를 시작합니다.`, 'success');
      return;
    }

    // 3. Match against IndexedDB cached slips (Offline mode)
    try {
      const idbSlips = await getSlipsFromIndexedDb();
      const matchedIdbSlip = idbSlips.find((s) => {
        const sNo = s.slipNo.trim();
        const sNoAlpha = sNo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return (
          sNo.toLowerCase() === raw.toLowerCase() ||
          (alphanumeric.length >= 4 && (sNoAlpha.includes(alphanumeric) || alphanumeric.includes(sNoAlpha))) ||
          s.items.some((it) => it.itemCode.toLowerCase() === raw.toLowerCase())
        );
      });

      if (matchedIdbSlip) {
        setActiveSlip(matchedIdbSlip);
        navigateToTab('RECEIVING', matchedIdbSlip);
        showToast(`캐시 전표 [${matchedIdbSlip.slipNo}] 확인! 즉시 검수를 시작합니다.`, 'info');
        return;
      }
    } catch (idbErr) {
      console.warn('IDB lookup error:', idbErr);
    }

    // 4. If online, check Backend / ERP API
    if (result.slipNo) {
      try {
        const slip = await inboundApi.fetchInboundSlipByNo(result.slipNo);
        setActiveSlip(slip);
        navigateToTab('RECEIVING', slip);
        showToast(`납품확인서 [${slip.slipNo}] 조회 완료! 검수를 시작합니다.`, 'success');
        return;
      } catch {
        try {
          const erpSlip = await erpApi.fetchErpSlipByNo(result.slipNo);
          setActiveSlip(erpSlip);
          navigateToTab('RECEIVING', erpSlip);
          showToast(`사내 ERP 미입고 전표 [${erpSlip.slipNo}] 조회 완료! 실시간 입고 검수를 시작합니다.`, 'success');
          return;
        } catch { /* ignore */ }
      }
    }

    // 5. If Item Code is scanned, check local IndexedDB materials (인덱스DB)
    if (result.itemCode) {
      try {
        const mat = await getMaterialByCodeInIndexedDb(result.itemCode);
        if (mat) {
          const nowStr = new Date().toISOString();
          const adHocSlip: InboundSlip = {
            slipNo: `INB-${mat.code}-${Date.now().toString().slice(-4)}`,
            supplierCode: mat.supplierCode || 'SUP-LOCAL',
            supplierName: mat.supplierName || '현장 입고',
            poNumber: `PO-${mat.code}`,
            deliveryDate: nowStr.slice(0, 10),
            status: 'WAITING',
            totalItems: 1,
            totalOrderedQty: 1,
            totalReceivedQty: 1,
            totalDefectQty: 0,
            manager: operator,
            items: [{
              id: `adhoc-${mat.code}-${Date.now()}`,
              itemCode: mat.code,
              itemName: mat.name,
              spec: mat.spec || '',
              unit: mat.unit || 'EA',
              orderQty: 1,
              receivedQty: 1,
              defectQty: 0,
              warehouse: mat.whName || '특장자재창고',
              unitPrice: mat.unitPrice || 0,
              status: 'WAITING',
              barcode: mat.code,
              notes: '인덱스DB 자재 현장 QR 스캔',
            }],
            createdAt: nowStr,
            updatedAt: nowStr,
          };
          try {
            await saveSlipToIndexedDb(adHocSlip);
          } catch { /* ignore */ }
          setSlips((prev) => [adHocSlip, ...prev]);
          setActiveSlip(adHocSlip);
          navigateToTab('RECEIVING', adHocSlip);
          showToast(`인덱스DB 품목 [${mat.name}] 확인! 현장 입고 검수를 진행합니다.`, 'info');
          return;
        }
      } catch (matErr) {
        console.warn('Material scan lookup error:', matErr);
      }
    }

    // 6. Automatic Ad-hoc Slip Creation for Any Scanned QR (검수 시작 자동 진입 보장)
    const fallbackSlipNo = result.slipNo || (raw.length > 25 ? `QR-${Date.now().toString().slice(-6)}` : raw);
    const newAdHocSlip: InboundSlip = {
      slipNo: fallbackSlipNo,
      supplierCode: 'SUP-QR',
      supplierName: '현장 스캔 전표',
      poNumber: fallbackSlipNo,
      deliveryDate: new Date().toISOString().slice(0, 10),
      status: 'WAITING',
      totalItems: 1,
      totalOrderedQty: 1,
      totalReceivedQty: 1,
      totalDefectQty: 0,
      memo: `QR 스캔 전표 (${raw})`,
      items: [{
        id: `adhoc-${Date.now()}`,
        itemCode: result.itemCode || fallbackSlipNo,
        itemName: '현장 스캔 자재',
        spec: '규격 확인 요망',
        unit: 'EA',
        orderQty: 1,
        receivedQty: 1,
        defectQty: 0,
        warehouse: '특장자재창고',
        status: 'WAITING',
        unitPrice: 0,
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSlipToIndexedDb(newAdHocSlip);
    } catch { /* ignore */ }
    setSlips((prev) => [newAdHocSlip, ...prev.filter((s) => s.slipNo !== newAdHocSlip.slipNo)]);
    setActiveSlip(newAdHocSlip);
    navigateToTab('RECEIVING', newAdHocSlip);
    showToast(`스캔 코드 [${fallbackSlipNo}] 확인! 즉시 검수를 시작합니다.`, 'success');
  };

  // Select Pending Slip to Inspect (supports direct ERP slip object)
  const handleSelectPendingSlip = useCallback(async (slipNo: string, directSlip?: InboundSlip) => {
    if (directSlip) {
      navigateToTab('RECEIVING', directSlip);
      return;
    }

    try {
      const slip = await inboundApi.fetchInboundSlipByNo(slipNo);
      navigateToTab('RECEIVING', slip);
    } catch {
      try {
        const erpSlip = await erpApi.fetchErpSlipByNo(slipNo);
        navigateToTab('RECEIVING', erpSlip);
      } catch (err: any) {
        // Check IndexedDB cached slips
        try {
          const cached = await getSlipByNoFromIndexedDb(slipNo);
          if (cached) {
            navigateToTab('RECEIVING', cached);
            showToast(`오프라인 캐시 전표 [${cached.slipNo}]를 불러왔습니다.`, 'info');
            return;
          }
        } catch { /* ignore */ }
        showToast(err.message || '전표 조회 실패', 'error');
      }
    }
  }, [navigateToTab, showToast]);

  // Confirm Inbound Receiving Transaction (supports real-time MSSQL insert + offline queue fallback)
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
        // Attempt real-time ERP MSSQL Inbound Receive
        try {
          const erpRes = await erpApi.processErpInboundReceive(receivePayload);
          soundHelper.playSuccessChime();
          showToast(erpRes.message || '사내 ERP(MSSQL) 입고 처리가 완료되었습니다!', 'success');
          resultSlip = erpRes.slip;
        } catch (erpErr: any) {
          console.warn('[Offline Fallback] Real-time ERP receive failed, queueing transaction:', erpErr);
          // Queue offline transaction
          const { localSlip } = await queueInboundReceive(receivePayload, managerName, activeSlip || undefined);
          soundHelper.playSuccessChime();
          showToast('📴 오프라인 입고 확정: 로컬에 저장되었으며 동기화 대기 큐에 등록되었습니다. (DB 복구 시 자동 동기화)', 'info');
          resultSlip = localSlip;
        }
      } else {
        // Standard Local Inbound Receive
        const localRes = await inboundApi.processInboundReceive(receivePayload);
        soundHelper.playSuccessChime();
        showToast(localRes.message || '입고 처리가 완료되었습니다!', 'success');
        resultSlip = localRes.slip;
      }

      await loadInitialData();
      navigateToTab('HISTORY', resultSlip);
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
      navigateToTab('PENDING', updated);
    } catch (err: any) {
      showToast(err.message || '보류 처리 실패', 'error');
    }
  };

  // Open Print Modal (if opened from History)
  const handleOpenPrintModal = useCallback((slip: InboundSlip) => {
    setSlipToPrint(slip);
    setIsPrintModalOpen(true);
  }, []);

  const pendingSlips = useMemo(() => {
    return slips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING' || s.status === 'HOLD');
  }, [slips]);

  const pendingCount = pendingSlips.length;

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
        onSelectTab={navigateToTab}
        pendingCount={pendingCount}
        operator={operator}
        onChangeOperator={handleOperatorChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onRefreshData={handleRefreshData}
        onOpenSyncQueue={() => setIsSyncQueueOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pb-32 md:pb-8 w-full max-w-full">
        <div
          style={currentTab === 'SCANNER' || currentTab === 'PENDING' ? undefined : { display: 'none', contain: 'content' }}
          className={currentTab === 'SCANNER' || currentTab === 'PENDING' ? 'block' : 'hidden'}
        >
          <InboundScanner
            onScanSuccess={handleScanSuccess}
            pendingSlips={pendingSlips}
            onSelectPendingSlip={handleSelectPendingSlip}
          />
        </div>

        {currentTab === 'RECEIVING' && activeSlip && (
          <InboundReceivingView
            slip={activeSlip}
            operator={operator}
            warehouses={warehouses}
            onConfirmReceiving={handleConfirmReceiving}
            onHoldSlip={handleHoldSlip}
            onBackToScanner={handleBackFromReceiving}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        <div
          style={currentTab === 'HISTORY' ? undefined : { display: 'none', contain: 'content' }}
          className={currentTab === 'HISTORY' ? 'block' : 'hidden'}
        >
          <InboundHistoryView
            slips={slips}
            onOpenPrintModal={handleOpenPrintModal}
            onSelectSlip={handleSelectPendingSlip}
            onRefresh={loadInitialData}
          />
        </div>

        <div
          style={currentTab === 'PURCHASE_ORDERS' ? undefined : { display: 'none', contain: 'content' }}
          className={currentTab === 'PURCHASE_ORDERS' ? 'block' : 'hidden'}
        >
          <InboundPurchaseOrderView onShowToast={showToast} />
        </div>

        <div
          style={currentTab === 'ERP_SEARCH' ? undefined : { display: 'none', contain: 'content' }}
          className={currentTab === 'ERP_SEARCH' ? 'block' : 'hidden'}
        >
          <ErpMaterialSearchView onShowToast={showToast} />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar with Safe Area Inset Support */}
      <div
        style={{ paddingBottom: 'max(20px, calc(0.6rem + env(safe-area-inset-bottom, 20px)))' }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-2 px-2.5 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => navigateToTab('SCANNER')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all relative cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'SCANNER' || currentTab === 'PENDING' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>입고확인</span>
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-xs">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('HISTORY')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'HISTORY' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <History className="w-5 h-5" />
          <span>입고내역</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('PURCHASE_ORDERS')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'PURCHASE_ORDERS' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <FileText className="w-5 h-5 text-blue-500" />
          <span>발주조회</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTab('ERP_SEARCH')}
          className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer py-1.5 px-3 rounded-xl min-h-[46px] ${
            currentTab === 'ERP_SEARCH' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'hover:text-slate-900 active:scale-95'
          }`}
        >
          <Database className="w-5 h-5 text-emerald-600" />
          <span>자재조회</span>
        </button>
      </div>

      {/* Floating Scroll-to-Top Action Button */}
      <ScrollToTopButton />

      {/* Printable Inbound Receipt Modal (for History tab) */}
      <InboundSlipPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        slip={slipToPrint}
      />

      {/* Offline Sync Queue Modal */}
      <InboundSyncQueueModal
        isOpen={isSyncQueueOpen}
        onClose={() => setIsSyncQueueOpen(false)}
        onShowToast={showToast}
      />

    </div>
  );
}
