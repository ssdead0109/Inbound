import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * 페이지 상단 이동 플로팅 액션 버튼 (Scroll-to-Top Floating Button)
 * 스크롤이 280px 이상 내려갔을 때 우측 하단에 부드럽게 나타나며,
 * 모바일 하단 네비게이션 바와 겹치지 않도록 반응형 오프셋(bottom-24 / md:bottom-8)을 가집니다.
 */
export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 280);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="페이지 맨 위로 이동"
      aria-label="페이지 맨 위로 이동"
      className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center border-2 border-white/90 backdrop-blur-xs cursor-pointer animate-in fade-in zoom-in-75 duration-200"
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};
