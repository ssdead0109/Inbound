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
  RotateCcw
} from 'lucide-react';
import {
  getServerHost,
  getServerPort,
  setServerConfig,
  resetServerConfig,
  testServerConnection,
  getDefaultServerHost,
  getDefaultServerPort,
  setOfflineModePreferred
} from '../../utils/serverConfig';
import { registerBackHandler } from '../../utils/backHandler';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOfflineMode: () => void;
  onReconnectSuccess: () => void;
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({
  isOpen,
  onClose,
  onSelectOfflineMode,
  onReconnectSuccess,
}) => {
  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    error?: string;
    isErpConnected?: boolean;
  } | null>(null);

  // Initialize values when opened
  useEffect(() => {
    if (isOpen) {
      setHost(getServerHost());
      setPort(getServerPort());
      setTestResult(null);

      // Auto-run connection test on open
      runPingTest(getServerHost(), getServerPort());

      // Android back button support
      return registerBackHandler('serverConnectionModal', 150, () => {
        onClose();
        return true;
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runPingTest = async (targetHost: string = host, targetPort: string = port) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testServerConnection(targetHost, targetPort);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        error: err.message || '통신 테스트 실패',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 1. Mode: Offline connection mode
  const handleChooseOfflineMode = () => {
    setOfflineModePreferred(true);
    onSelectOfflineMode();
    onClose();
  };

  // 2. Mode: Reconnect with custom host and port
  const handleReconnect = async () => {
    const cleanHost = host.trim();
    const cleanPort = port.trim();

    if (!cleanHost) {
      alert('서버 IP 또는 호스트명을 입력해주세요.');
      return;
    }
    if (!cleanPort) {
      alert('서버 포트 번호를 입력해주세요.');
      return;
    }

    setServerConfig(cleanHost, cleanPort);
    setOfflineModePreferred(false);

    setIsTesting(true);
    const res = await testServerConnection(cleanHost, cleanPort);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onReconnectSuccess();
      onClose();
    }
  };

  // Reset to default host & port
  const handleReset = () => {
    resetServerConfig();
    const defaultHost = getDefaultServerHost();
    const defaultPort = getDefaultServerPort();
    setHost(defaultHost);
    setPort(defaultPort);
    runPingTest(defaultHost, defaultPort);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">서버 연결 설정 및 접속 모드</h2>
              <p className="text-[11px] text-slate-400">서버 주소 변경 또는 오프라인 캐시 모드 선택</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          
          {/* Connection Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
              isTesting
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : testResult?.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
            ) : testResult?.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                {isTesting ? (
                  <span>서버 통신 상태 확인 중...</span>
                ) : testResult?.success ? (
                  <span>
                    서버 응답 성공 ({testResult.latencyMs}ms)
                    {testResult.isErpConnected
                      ? ' · ERP MSSQL 정상 연결'
                      : ' · (ERP MSSQL 미연결 상태)'}
                  </span>
                ) : (
                  <span>서버 접속 불가 (오프라인)</span>
                )}
              </div>
              <p className="text-[11px] opacity-90 leading-tight">
                {testResult?.error ||
                  (testResult?.success
                    ? '지정한 서버와 원활히 통신 중입니다. 재접속하여 온라인으로 동기화할 수 있습니다.'
                    : '서버가 응답하지 않습니다. 주소/포트를 변경하거나 오프라인 모드로 진입하세요.')}
              </p>
            </div>
          </div>

          {/* Server IP and Port Inputs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                <span>서버 네트워크 주소 설정</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 cursor-pointer"
                title="기본값 복원"
              >
                <RotateCcw className="w-3 h-3" /> 기본값 복원
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-500">서버 IP / 호스트</span>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="예: 192.168.2.29"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-500">포트 (Port)</span>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="5000"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => runPingTest(host, port)}
                disabled={isTesting || !host.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>연결 테스트 (Ping)</span>
              </button>
            </div>
          </div>

          {/* Mode Selection Options */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-black text-slate-700 block">접속 모드 선택</span>

            {/* Option 1: Reconnect Mode */}
            <div
              onClick={handleReconnect}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all cursor-pointer space-y-1.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                    모드 1. 지정한 주소로 재접속 (온라인 모드)
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 pl-9">
                설정한 서버 주소로 저장하고 온라인으로 재접속하여 최신 전표 및 자재 데이터를 실시간 동기화합니다.
              </p>
            </div>

            {/* Option 2: Offline Mode */}
            <div
              onClick={handleChooseOfflineMode}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 transition-all cursor-pointer space-y-1.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                    모드 2. 오프라인 모드로 계속하기 (캐시 데이터 사용)
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 pl-9">
                기존 인증된 로그인 정보와 인덱스DB에 보관된 데이터를 바탕으로 네트워크 없이 오프라인 작업 환경으로 바로 접속합니다.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <Database className="w-3.5 h-3.5" />
            <span>오프라인 작업 내역은 서버 연결 시 자동 대기 큐 동기화됩니다.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
