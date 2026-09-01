import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ErpUser, loginErpUser, fetchErpStatus } from '../../api/erpApi';
import { soundHelper } from '../../utils/soundHelper';

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
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('아이디(사번)를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginErpUser(code.trim(), password);

      // Handle Remember ID & Auto-Login persistence
      if (autoLogin) {
        localStorage.setItem('kcp_auto_login', 'true');
        localStorage.setItem('kcp_remember_id', 'true');
        localStorage.setItem('kcp_saved_id', code.trim());
      } else {
        localStorage.removeItem('kcp_auto_login');
        if (rememberId) {
          localStorage.setItem('kcp_remember_id', 'true');
          localStorage.setItem('kcp_saved_id', code.trim());
        } else {
          localStorage.removeItem('kcp_remember_id');
          localStorage.removeItem('kcp_saved_id');
        }
      }

      soundHelper.playSuccessChime();
      onLoginSuccess(user);
    } catch (err: any) {
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
        
        {/* Header Branding & ERP Status Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100 mb-1 border border-slate-200 bg-white p-1">
            <img src="/wma-icon.png" alt="KCP WMA" className="w-full h-full object-contain rounded-xl" />
          </div>

          <div>
            {/* ERP Connection Status Badge */}
            {isErpConnected === false ? (
              <div
                onClick={checkStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-bold mb-2 cursor-pointer hover:bg-rose-100 transition-colors shadow-2xs"
                title="클릭하여 연결 상태 재확인"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>사내 ERP 연동이 되지 않습니다 (서버 연결 확인 필요)</span>
                <RefreshCw className="w-2.5 h-2.5 ml-0.5 text-rose-500" />
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

      {/* Footer copyright */}
      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        © 2026 KCP HEAVY INDUSTRIES CO., LTD. SmartRack Inbound System
      </div>

    </div>
  );
};
