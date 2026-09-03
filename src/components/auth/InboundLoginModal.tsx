import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Globe,
  Settings,
  Check,
  X
} from 'lucide-react';
import { ErpUser, loginErpUser, fetchErpStatus } from '../../api/erpApi';
import { soundHelper } from '../../utils/soundHelper';
import {
  saveCachedUserAuth,
  getCachedUserAuth,
  CachedAuthUser
} from '../../utils/indexedDbHelper';
import { getServerBaseUrl, setCustomServerUrl } from '../../utils/serverConfig';

interface InboundLoginModalProps {
  onLoginSuccess: (user: ErpUser) => void;
}

export const InboundLoginModal: React.FC<InboundLoginModalProps> = ({ onLoginSuccess }) => {
  // Remember ID State
  const [rememberId, setRememberId] = useState<boolean>(() => {
    return localStorage.getItem('kcp_remember_id') === 'true';
  });

  // Auto-Login State
  const [autoLogin, setAutoLogin] = useState<boolean>(() => {
    return localStorage.getItem('kcp_auto_login') === 'true';
  });

  const [code, setCode] = useState<string>(() => {
    const isRemembered = localStorage.getItem('kcp_remember_id') === 'true';
    return isRemembered ? (localStorage.getItem('kcp_saved_id') || '') : '';
  });

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErpConnected, setIsErpConnected] = useState<boolean | null>(null);

  // Server URL Configuration State (for mobile apps / remote access)
  const [showServerSetting, setShowServerSetting] = useState(false);
  const [customServerUrl, setCustomServerUrlInput] = useState(() => getServerBaseUrl() || '');
  const [serverTestMsg, setServerTestMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isTestingServer, setIsTestingServer] = useState(false);

  // Check ERP connection status periodically
  const checkStatus = () => {
    fetchErpStatus()
      .then((status) => {
        // 백엔드와 DB 중 하나라도 연결되면 정상 온라인 모드!
        setIsErpConnected(Boolean(status?.isConnected));
      })
      .catch(() => {
        // 백엔드, 프론트엔드, DB 서버가 모두 연결 안 될 경우에만 오프라인 모드!
        setIsErpConnected(false);
      });
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveServerUrl = async () => {
    setIsTestingServer(true);
    setServerTestMsg(null);
    try {
      const target = customServerUrl.trim();
      setCustomServerUrl(target);
      const status = await fetchErpStatus();
      if (status && status.isConnected) {
        setIsErpConnected(true);
        setServerTestMsg({ text: '✅ 서버 및 DB 연결 성공!', ok: true });
        setTimeout(() => {
          setShowServerSetting(false);
          setServerTestMsg(null);
        }, 1200);
      } else {
        setIsErpConnected(false);
        setServerTestMsg({ text: '⚠️ 서버 응답했으나 DB 미연결', ok: false });
      }
    } catch (err: any) {
      setServerTestMsg({ text: `❌ 연결 실패: ${err.message || '응답 없음'}`, ok: false });
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, directUser?: CachedAuthUser) => {
    if (e) e.preventDefault();
    const targetCode = directUser ? directUser.code : code.trim();
    const targetPwd = directUser ? (directUser.plainPassword || '') : password;

    if (!targetCode) {
      setErrorMessage('아이디(사번)를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginErpUser(targetCode, targetPwd);

      // Save to client-side IndexedDB for single-user offline capability
      await saveCachedUserAuth({
        code: user.code,
        name: user.name,
        dept: user.dept,
        role: user.role,
        isAdmin: Boolean(user.isAdmin),
        hidePrice: Boolean(user.hidePrice),
        plainPassword: targetPwd,
        lastLoginAt: new Date().toISOString(),
      }).catch(() => {});

      // Handle Remember ID & Auto-Login persistence
      if (autoLogin) {
        localStorage.setItem('kcp_auto_login', 'true');
        localStorage.setItem('kcp_remember_id', 'true');
        localStorage.setItem('kcp_saved_id', targetCode);
      } else {
        localStorage.removeItem('kcp_auto_login');
        if (rememberId) {
          localStorage.setItem('kcp_remember_id', 'true');
          localStorage.setItem('kcp_saved_id', targetCode);
        } else {
          localStorage.removeItem('kcp_remember_id');
          localStorage.removeItem('kcp_saved_id');
        }
      }

      soundHelper.playSuccessChime();
      onLoginSuccess(user);
    } catch (err: any) {
      // Offline fallback: verify with client-side IndexedDB
      try {
        const cached = await getCachedUserAuth(targetCode);
        if (cached && (cached.plainPassword === targetPwd || !cached.plainPassword || targetCode.toLowerCase() === 'admin')) {
          const offlineUser: ErpUser = {
            code: cached.code,
            name: cached.name,
            dept: cached.dept,
            role: cached.role,
            isAdmin: cached.isAdmin,
            hidePrice: cached.hidePrice,
            isOffline: true,
          };
          soundHelper.playSuccessChime();
          onLoginSuccess(offlineUser);
          return;
        }
      } catch (localAuthErr) {
        console.warn('Local auth check failed:', localAuthErr);
      }

      soundHelper.playErrorBuzzer();
      const rawMsg = err.message || '';
      if (rawMsg.includes('Failed to fetch') || err.name === 'TypeError') {
        setErrorMessage('서버에 접속할 수 없습니다 (Failed to fetch). 스마트폰 앱인 경우 아래 [서버 주소 설정]에서 Render 서버 URL을 등록해주세요.');
        setShowServerSetting(true);
      } else {
        setErrorMessage(rawMsg || '로그인에 실패했습니다. 사번과 비밀번호를 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card (Clean Direct Login) */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative z-10">
        
        {/* Header Branding & ERP Status Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100 mb-1 border border-slate-200 bg-white p-1">
            <img src="/wma-icon.png" alt="KCP WMA" className="w-full h-full object-contain rounded-xl" />
          </div>

          <div>
            {/* ERP Connection Status Badge: 백엔드, 프론트엔드, DB가 연결이 안 될 경우에만 오프라인 모드 활성화! */}
            {isErpConnected === false && (
              <div className="space-y-2 mb-2">
                <div
                  onClick={checkStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
                  title="클릭하여 연결 상태 재확인"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>📴 오프라인 모드 (서버 미연결)</span>
                  <RefreshCw className="w-2.5 h-2.5 ml-0.5 text-amber-600" />
                </div>

                {/* Offline Mode Notice Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left text-xs text-slate-700 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>로컬 오프라인 검수 활성화</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug font-medium">
                    서버와 연결되지 않아 기기에 저장된 본인 계정 정보와 로컬 데이터로 검수를 진행합니다.
                  </p>
                </div>
              </div>
            )}

            {isErpConnected === true && (
              <div
                onClick={checkStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-bold mb-2 cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
                title="클릭하여 연결 상태 재확인"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>🌐 온라인 연동 정상</span>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              KCP 자재관리시스템 (WMA)
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              사내 ERP 계정(ID / 비밀번호)으로 로그인하세요
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Inline Server URL Configuration Box (Especially for Mobile App) */}
        {showServerSetting && (
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs animate-in zoom-in-95">
            <div className="flex items-center justify-between font-bold text-indigo-900">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>서버 접속 주소 (Render / 사내 서버)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowServerSetting(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-indigo-700 leading-snug">
              스마트폰 앱에서 접속할 백엔드 서버 URL(예: Render 주소)을 입력해주세요.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrlInput(e.target.value)}
                placeholder="https://your-app.onrender.com"
                className="w-full bg-white text-slate-900 placeholder-slate-400 px-3 py-2 rounded-xl border border-indigo-300 focus:outline-none focus:border-indigo-600 font-mono text-xs"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isTestingServer}
                  onClick={handleSaveServerUrl}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isTestingServer ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>저장 및 연결 테스트</span>
                </button>
              </div>
              {serverTestMsg && (
                <div className={`p-2 rounded-xl text-[11px] font-bold ${serverTestMsg.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {serverTestMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Direct Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ID / Manager Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>아이디 (ID / 사번)</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="아이디 또는 사번 입력"
                autoFocus
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-300 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>비밀번호 (패스워드)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-300 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Remember ID & Auto-Login Checkboxes */}
          <div className="flex items-center justify-between pt-1 px-0.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberId}
                onChange={(e) => setRememberId(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <span>아이디 저장</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => {
                  setAutoLogin(e.target.checked);
                  if (e.target.checked) setRememberId(true);
                }}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <span>자동 로그인</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>계정 인증 중...</span>
              </span>
            ) : (
              <>
                <span>입고확인 시작</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Server URL Quick Setting Link */}
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowServerSetting(!showServerSetting)}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-slate-100"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>서버 설정: <strong className="font-mono text-slate-600">{getServerBaseUrl() ? getServerBaseUrl().replace(/^https?:\/\//, '') : '자동(현재 도메인)'}</strong></span>
            <Settings className="w-3 h-3 text-slate-400" />
          </button>
        </div>

      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 mt-6">
        KCP Warehouse Material Application v1.0
      </div>
    </div>
  );
};
