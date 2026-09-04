import { useCallback, useEffect, useState } from 'react';

/**
 * Whichever [data-nav-theme] section crosses y=72px owns the nav colour.
 * Plain scroll listener for now; the motion layer swaps in ScrollTrigger later
 * without changing this contract.
 */
export function useNavTheme(line = 72) {
  // line 是判定线在视口中的 y 坐标。导航用 72（自身位置），底部进度条必须
  // 传视口底部附近的值——否则它会按顶部区块取色，在页脚等处出现黑底黑字。
  const [theme, setTheme] = useState('dark');

  const check = useCallback(() => {
    const els = document.querySelectorAll('[data-nav-theme]');
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) {
        setTheme(el.dataset.navTheme);
        return;
      }
    }
  }, [line]);

  useEffect(() => {
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [check]);

  return theme;
}
