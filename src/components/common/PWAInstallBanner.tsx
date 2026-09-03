import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. 이미 네이티브 Capacitor 앱으로 실행 중이면 배너 숨김
    if (Capacitor.isNativePlatform()) {
      return;
    }

    // 2. 이미 PWA Standalone(홈 화면 설치된 앱)으로 실행 중이면 배너 숨김
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      return;
    }

    // 3. 최근 24시간 내에 닫기를 누른 경우 숨김
    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 4. iOS Safari 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIos(true);
      // iOS에서는 beforeinstallprompt가 지원되지 않으므로 배너 노출 후 가이드 안내
      setIsVisible(true);
      return;
    }

    // 5. Android Chrome / Desktop Chrome PWA 설치 프롬프트 이벤트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosGuide(false);
    // 24시간 동안 배너 닫기 유지
    localStorage.setItem('pwa_prompt_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-50 animate-bounce-subtle">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
              <span>KCP 자재 앱 설치하기</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/40">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              홈 화면에 추가하여 편리한 전체화면 앱으로 사용하세요
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>앱 설치</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari 사용자를 위한 설치 안내 팝업 */}
      {showIosGuide && (
        <div className="mt-2 bg-white text-slate-800 rounded-xl p-3 shadow-xl border border-slate-200 text-xs space-y-1.5 animate-fade-in">
          <div className="font-bold flex items-center justify-between text-indigo-700">
            <span className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              아이폰(iOS) 홈 화면 추가 방법
            </span>
            <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            1. 사파리 브라우저 하단의 <strong>공유 아이콘 [↑]</strong>을 누르세요.<br />
            2. 메뉴를 아래로 스크롤하여 <strong>[홈 화면에 추가]</strong>를 누르시면 바탕화면에 진짜 앱으로 설치됩니다!
          </p>
        </div>
      )}
    </div>
  );
};
