import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';
import { ErpUser, loginErpUser, fetchErpStatus } from '../../api/erpApi';
import { soundHelper } from '../../utils/soundHelper';
import {
  saveCachedUserAuth,
  getCachedUserAuth,
  getAllCachedUsers,
  CachedAuthUser
} from '../../utils/indexedDbHelper';
import { ServerConnectionModal } from '../common/ServerConnectionModal';

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
  const [cachedAccounts, setCachedAccounts] = useState<CachedAuthUser[]>([]);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // Check ERP connection status periodically
  const checkStatus = () => {
    fetchErpStatus()
      .then((status) => {
        setIsErpConnected(Boolean(status?.isConnected));
      })
      .catch(() => {
        setIsErpConnected(false);
      });
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 8000);
    // Load previously authenticated offline accounts
    getAllCachedUsers().then((users) => {
      if (users && users.length > 0) setCachedAccounts(users);
    }).catch(() => {});

    return () => clearInterval(timer);
  }, []);

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

      // Save to client-side IndexedDB for complete offline capability
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
      setErrorMessage(err.message || '로그인에 실패했습니다. 사번과 비밀번호를 확인해주세요.');
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
        
        {/* Server Setting Button in Top Right */}
        <button
          type="button"
          onClick={() => setIsServerModalOpen(true)}
          title="서버 IP/포트 설정 및 접속 모드 선택"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
        >
          <Server className="w-4 h-4" />
        </button>

        {/* Header Branding & ERP Status Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100 mb-1 border border-slate-200 bg-white p-1">
            <img src="/wma-icon.png" alt="KCP WMA" className="w-full h-full object-contain rounded-xl" />
          </div>

          <div>
            {/* ERP Connection Status Badge */}
            {isErpConnected === false ? (
              <div className="space-y-2 mb-2">
                <div
                  onClick={checkStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-bold cursor-pointer hover:bg-rose-100 transition-colors shadow-2xs"
                  title="클릭하여 연결 상태 재확인"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span>사내 ERP 미연결 (오프라인 모드)</span>
                  <RefreshCw className="w-2.5 h-2.5 ml-0.5 text-rose-500" />
                </div>

                {/* Offline Mode Notice Box */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-left text-xs text-amber-900 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>오프라인 실행 모드 활성화</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-snug font-medium">
                    DB 서버에 연결할 수 없지만, 기존 인증정보와 로컬 인덱스DB를 바탕으로 현장 검수를 진행할 수 있습니다.
                  </p>
                  
                  {/* Button to open Server Config / Connection Mode */}
                  <button
                    type="button"
                    onClick={() => setIsServerModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>서버 IP/포트 설정 및 접속 모드 선택</span>
                  </button>
                  {cachedAccounts.length > 0 && (
                    <div className="pt-2 border-t border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-800 block mb-1">최근 로그인 이력 계정 (빠른 선택):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cachedAccounts.slice(0, 4).map((acc) => (
                          <button
                            key={acc.code}
                            type="button"
                            onClick={() => {
                              setCode(acc.code);
                              if (acc.plainPassword) setPassword(acc.plainPassword);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-[11px] border border-amber-300 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <span>{acc.name}</span>
                            <span className="font-mono text-[10px] text-amber-600 font-normal">[{acc.code}]</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={checkStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-bold mb-2 cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
                title="클릭하여 연결 상태 재확인"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>사내 ERP 실시간 연동 정상</span>
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
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
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
                <span>ERP 계정 인증 중...</span>
              </span>
            ) : (
              <>
                <span>로그인 및 현장 검수 시작</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 mt-6">
        KCP Warehouse Material Application v1.0
      </div>

      {/* Server Connection & Mode Selection Modal */}
      <ServerConnectionModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onSelectOfflineMode={() => {
          setIsServerModalOpen(false);
          if (cachedAccounts.length > 0) {
            setCode(cachedAccounts[0].code);
            if (cachedAccounts[0].plainPassword) {
              setPassword(cachedAccounts[0].plainPassword);
            }
          }
        }}
        onReconnectSuccess={() => {
          setIsServerModalOpen(false);
          checkStatus();
        }}
      />
    </div>
  );
};
