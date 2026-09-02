import React, { useState, useEffect } from 'react';
import {
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Database,
  ArrowRight,
  RotateCcw,
  Monitor,
  HardDrive,
  Save,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  getAllServerConfigs,
  saveAllServerConfigs,
  resetAllServerConfigs,
  testBackendConnection,
  testFrontendConnection,
  testDbConnection,
  getDefaultBackendHost,
  getDefaultBackendPort,
  getDefaultFrontendHost,
  getDefaultFrontendPort,
  getDefaultDbHost,
  getDefaultDbPort,
  setOfflineModePreferred,
  FullServerConfig
} from '../../utils/serverConfig';
import { registerBackHandler } from '../../utils/backHandler';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOfflineMode: () => void;
  onReconnectSuccess: () => void;
}

interface ServerTestStatus {
  backend: { tested: boolean; success: boolean; latencyMs: number; error?: string };
  frontend: { tested: boolean; success: boolean; latencyMs: number; error?: string };
  db: { tested: boolean; success: boolean; latencyMs: number; error?: string };
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({
  isOpen,
  onClose,
  onSelectOfflineMode,
  onReconnectSuccess,
}) => {
  // 3 Server States
  const [backendHost, setBackendHost] = useState<string>('');
  const [backendPort, setBackendPort] = useState<string>('');
  const [frontendHost, setFrontendHost] = useState<string>('');
  const [frontendPort, setFrontendPort] = useState<string>('');
  const [dbHost, setDbHost] = useState<string>('');
  const [dbPort, setDbPort] = useState<string>('');

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<ServerTestStatus>({
    backend: { tested: false, success: false, latencyMs: 0 },
    frontend: { tested: false, success: false, latencyMs: 0 },
    db: { tested: false, success: false, latencyMs: 0 },
  });
  const [autoSavedNotice, setAutoSavedNotice] = useState<boolean>(false);

  // Initialize values when opened
  useEffect(() => {
    if (isOpen) {
      const cfg = getAllServerConfigs();
      setBackendHost(cfg.backendHost);
      setBackendPort(cfg.backendPort);
      setFrontendHost(cfg.frontendHost);
      setFrontendPort(cfg.frontendPort);
      setDbHost(cfg.dbHost);
      setDbPort(cfg.dbPort);

      setAutoSavedNotice(false);
      setTestResults({
        backend: { tested: false, success: false, latencyMs: 0 },
        frontend: { tested: false, success: false, latencyMs: 0 },
        db: { tested: false, success: false, latencyMs: 0 },
      });

      // Run initial test
      runFullTest(cfg);

      // Android back button support
      return registerBackHandler('serverConnectionModal', 150, () => {
        onClose();
        return true;
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Run full 3-server connection test
  const runFullTest = async (configOverride?: FullServerConfig) => {
    setIsTesting(true);
    setAutoSavedNotice(false);

    const bHost = configOverride ? configOverride.backendHost : backendHost.trim();
    const bPort = configOverride ? configOverride.backendPort : backendPort.trim();
    const fHost = configOverride ? configOverride.frontendHost : frontendHost.trim();
    const fPort = configOverride ? configOverride.frontendPort : frontendPort.trim();
    const dHost = configOverride ? configOverride.dbHost : dbHost.trim();
    const dPort = configOverride ? configOverride.dbPort : dbPort.trim();

    try {
      // 1. Test Backend and Frontend in parallel
      const [backendRes, frontendRes] = await Promise.all([
        testBackendConnection(bHost, bPort),
        testFrontendConnection(fHost, fPort),
      ]);

      // 2. Test DB via Backend
      let dbRes: { success: boolean; isConnected: boolean; latencyMs: number; error?: string } = {
        success: false,
        isConnected: false,
        latencyMs: 0,
        error: '백엔드 연결 불가로 DB 테스트 생략',
      };

      if (backendRes.success) {
        dbRes = await testDbConnection(bHost, bPort, dHost, dPort);
      }

      const results: ServerTestStatus = {
        backend: {
          tested: true,
          success: backendRes.success,
          latencyMs: backendRes.latencyMs,
          error: backendRes.error,
        },
        frontend: {
          tested: true,
          success: frontendRes.success,
          latencyMs: frontendRes.latencyMs,
          error: frontendRes.error,
        },
        db: {
          tested: true,
          success: dbRes.success && dbRes.isConnected,
          latencyMs: dbRes.latencyMs,
          error: dbRes.error,
        },
      };

      setTestResults(results);

      // Requirement: "한번 적어놓은 내용들은 접속테스트 합격 시 저장되어 다음부터는 그 주소롬 접속되면 좋겠어"
      // If backend or all servers pass test, automatically save to localStorage!
      if (backendRes.success || frontendRes.success) {
        const toSave: FullServerConfig = {
          backendHost: bHost,
          backendPort: bPort,
          frontendHost: fHost,
          frontendPort: fPort,
          dbHost: dHost,
          dbPort: dPort,
        };
        saveAllServerConfigs(toSave);
        setAutoSavedNotice(true);
      }
    } catch (err) {
      console.warn('Full server test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  // Explicit Save and Reconnect
  const handleSaveAndReconnect = async () => {
    const toSave: FullServerConfig = {
      backendHost: backendHost.trim(),
      backendPort: backendPort.trim(),
      frontendHost: frontendHost.trim(),
      frontendPort: frontendPort.trim(),
      dbHost: dbHost.trim(),
      dbPort: dbPort.trim(),
    };

    if (!toSave.backendHost || !toSave.backendPort) {
      alert('백엔드 서버 IP와 포트를 입력해주세요.');
      return;
    }
    if (!toSave.frontendHost || !toSave.frontendPort) {
      alert('프론트엔드 서버 IP와 포트를 입력해주세요.');
      return;
    }
    if (!toSave.dbHost || !toSave.dbPort) {
      alert('DB 서버 IP와 포트를 입력해주세요.');
      return;
    }

    saveAllServerConfigs(toSave);
    setOfflineModePreferred(false);

    // If frontend host or port changed in web browser, offer redirect
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      (window.location.hostname !== toSave.frontendHost || window.location.port !== toSave.frontendPort)
    ) {
      const targetUrl = `http://${toSave.frontendHost}:${toSave.frontendPort}`;
      if (confirm(`프론트엔드 서버 주소가 변경되었습니다.\n새로운 주소(${targetUrl})로 이동하시겠습니까?`)) {
        window.location.href = targetUrl;
        return;
      }
    }

    onReconnectSuccess();
    onClose();
  };

  // Offline Mode Selection
  const handleChooseOfflineMode = () => {
    setOfflineModePreferred(true);
    onSelectOfflineMode();
    onClose();
  };

  // Reset to Defaults
  const handleReset = () => {
    resetAllServerConfigs();
    const defaults: FullServerConfig = {
      backendHost: getDefaultBackendHost(),
      backendPort: getDefaultBackendPort(),
      frontendHost: getDefaultFrontendHost(),
      frontendPort: getDefaultFrontendPort(),
      dbHost: getDefaultDbHost(),
      dbPort: getDefaultDbPort(),
    };

    setBackendHost(defaults.backendHost);
    setBackendPort(defaults.backendPort);
    setFrontendHost(defaults.frontendHost);
    setFrontendPort(defaults.frontendPort);
    setDbHost(defaults.dbHost);
    setDbPort(defaults.dbPort);

    runFullTest(defaults);
  };

  const isAllTested = testResults.backend.tested && testResults.frontend.tested && testResults.db.tested;
  const isAllPassed = testResults.backend.success && testResults.frontend.success && testResults.db.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">서버 연결 설정 및 접속 모드</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">백엔드, 프론트엔드, DB 서버 IP/포트 통합 관리</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 flex-1">
          
          {/* Auto-Saved Notification Banner */}
          {autoSavedNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>✅ 접속 테스트 합격! 설정이 저장되어 다음 접속 시에도 유지됩니다.</span>
            </div>
          )}

          {/* 1. Backend Server Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Server className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900">백엔드 서버 (Backend API)</span>
              </div>
              
              {/* Status Badge */}
              {testResults.backend.tested && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  testResults.backend.success
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {testResults.backend.success ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>연결 정상 ({testResults.backend.latencyMs}ms)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      <span>접속 불가</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-600">서버 IP / 호스트</label>
                <input
                  type="text"
                  value={backendHost}
                  onChange={(e) => setBackendHost(e.target.value)}
                  placeholder="예: 192.168.2.29"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">포트 (Port)</label>
                <input
                  type="text"
                  value={backendPort}
                  onChange={(e) => setBackendPort(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
            {testResults.backend.error && (
              <p className="text-[11px] text-rose-600 font-medium">{testResults.backend.error}</p>
            )}
          </div>

          {/* 2. Frontend Server Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900">프론트엔드 서버 (Web / App)</span>
              </div>

              {/* Status Badge */}
              {testResults.frontend.tested && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  testResults.frontend.success
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {testResults.frontend.success ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>웹 서버 응답 ({testResults.frontend.latencyMs}ms)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      <span>응답 없음</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-600">서버 IP / 호스트</label>
                <input
                  type="text"
                  value={frontendHost}
                  onChange={(e) => setFrontendHost(e.target.value)}
                  placeholder="예: 192.168.2.29"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">포트 (Port)</label>
                <input
                  type="text"
                  value={frontendPort}
                  onChange={(e) => setFrontendPort(e.target.value)}
                  placeholder="3000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
            {testResults.frontend.error && (
              <p className="text-[11px] text-rose-600 font-medium">{testResults.frontend.error}</p>
            )}
          </div>

          {/* 3. Database Server Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900">ERP DB 서버 (MSSQL System9)</span>
                </div>
              </div>

              {/* Status Badge */}
              {testResults.db.tested && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  testResults.db.success
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {testResults.db.success ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>ERP 연동 성공</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>오프라인 (캐시모드 권장)</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-600">DB 서버 IP</label>
                <input
                  type="text"
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  placeholder="예: 192.168.2.209"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">포트 (Port)</label>
                <input
                  type="text"
                  value={dbPort}
                  onChange={(e) => setDbPort(e.target.value)}
                  placeholder="6611"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
            {testResults.db.error && (
              <p className="text-[11px] text-amber-700 font-medium">{testResults.db.error}</p>
            )}
          </div>

          {/* Test & Action Controls */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => runFullTest()}
              disabled={isTesting}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isTesting ? '서버 3종 접속 상태 점검 중...' : '🔍 서버 3종 전체 접속 테스트 및 자동 저장'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Save & Reconnect */}
              <button
                type="button"
                onClick={handleSaveAndReconnect}
                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>설정 저장 및 접속</span>
              </button>

              {/* Offline Mode */}
              <button
                type="button"
                onClick={handleChooseOfflineMode}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
              >
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>오프라인 모드 접속</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 설정값 복원</span>
          </button>

          <span className="text-[11px] text-slate-400">
            기본값: 백엔드(5000) / 프론트엔드(3000) / DB(6611)
          </span>
        </div>

      </div>
    </div>
  );
};
