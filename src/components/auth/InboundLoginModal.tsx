import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Search
} from 'lucide-react';
import { ErpUser, loginErpUser, fetchErpUsers } from '../../api/erpApi';
import { soundHelper } from '../../utils/soundHelper';

interface InboundLoginModalProps {
  onLoginSuccess: (user: ErpUser) => void;
}

export const InboundLoginModal: React.FC<InboundLoginModalProps> = ({ onLoginSuccess }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState<ErpUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  // Load user list for quick selection
  useEffect(() => {
    fetchErpUsers()
      .then((users) => setActiveUsers(users))
      .catch((err) => console.warn('Could not load user list:', err));
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('담당자코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginErpUser(code.trim(), password);
      soundHelper.playSuccessChime();
      onLoginSuccess(user);
    } catch (err: any) {
      soundHelper.playErrorBuzzer();
      setErrorMessage(err.message || '로그인에 실패했습니다. 사번과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickUser = (user: ErpUser) => {
    setCode(user.code);
    setPassword('');
    setErrorMessage('');
    setShowQuickSelect(false);
    
    // If user has no password, attempt direct login
    if (!user.hasPassword) {
      setIsLoading(true);
      loginErpUser(user.code, '')
        .then((loggedUser) => {
          soundHelper.playSuccessChime();
          onLoginSuccess(loggedUser);
        })
        .catch((err) => {
          setErrorMessage(err.message || '로그인 실패');
        })
        .finally(() => setIsLoading(false));
    }
  };

  const filteredUsers = activeUsers.filter((u) => {
    if (!userSearchTerm) return true;
    const q = userSearchTerm.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q) || u.dept.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card (Crisp Light Theme) */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>사내 ERP (System9) 실시간 연동</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              KCP 자재입고 시스템
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              사내 ERP <span className="text-indigo-600 font-bold font-mono">MT_TC_담당자코드</span> 계정으로 로그인하세요
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Manager Code (ID) Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>담당자코드 / 사번</span>
              </label>
              
              <button
                type="button"
                onClick={() => setShowQuickSelect(!showQuickSelect)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{showQuickSelect ? '직접 입력하기' : '사원 목록에서 선택'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="예: jmgang, admin, 박영일"
                autoFocus
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-300 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Quick Select Accordion */}
          {showQuickSelect && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 max-h-56 overflow-y-auto shadow-inner">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="사원명, 부서, 사번 검색..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-900 rounded-xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {filteredUsers.slice(0, 14).map((u) => (
                  <button
                    key={u.code}
                    type="button"
                    onClick={() => handleSelectQuickUser(u)}
                    className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                      <span>{u.name}</span>
                      {u.isAdmin ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">관리자</span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-normal">{u.dept || '자재'}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-1">
                      <span>{u.code}</span>
                      {!u.hasPassword && <span className="text-emerald-600 font-sans text-[9px] font-bold">즉시로그인</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                placeholder="비밀번호 입력 (미설정 시 비워두기)"
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-300 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
              />
            </div>
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

        {/* Quick Demo Credentials Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[11px] text-slate-500 text-center font-medium">
            💡 빠른 테스트 추천 계정:
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => { setCode('jmgang'); setPassword('kcp4800175'); }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-mono border border-slate-200 transition-all cursor-pointer"
            >
              특장: <strong>jmgang</strong> (강종만)
            </button>
            <button
              type="button"
              onClick={() => { setCode('admin'); setPassword('gong2004pass'); }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-mono border border-slate-200 transition-all cursor-pointer"
            >
              관리자: <strong>admin</strong> (개발자)
            </button>
            <button
              type="button"
              onClick={() => { setCode('rkdtjrrb1'); setPassword(''); }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-mono border border-slate-200 transition-all cursor-pointer"
            >
              자재: <strong>rkdtjrrb1</strong> (강석규)
            </button>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        © 2026 KCP HEAVY INDUSTRIES CO., LTD. SmartRack Inbound System
      </div>

    </div>
  );
};
