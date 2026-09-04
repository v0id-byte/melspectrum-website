import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReduced, refreshSoon } from './index';

/**
 * 滚动插值的唯一所有者。
 *
 * 平滑全部交给 Lenis，ScrollTrigger 一律 scrub:0——两层都做平滑正是
 * 多数 Lenis 站发糊的原因。
 *
 * reduced-motion 下完全不启动 Lenis：它本质是对浏览器原生滚动响应的
 * 运动重映射，正是该类用户要避免的东西。
 */
export default function MotionProvider({ children }) {
  useEffect(() => {
    if (prefersReduced()) {
      // 静态构图模式：不接管滚动，不注册 ticker。
      document.documentElement.dataset.motion = 'static';
      return undefined;
    }

    const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -80 } });
    window.__lenis = lenis; // 移动端菜单需要 stop()/start() 做滚动锁

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.dataset.motion = 'smooth';
    refreshSoon();

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
      delete document.documentElement.dataset.motion;
    };
  }, []);

  return children;
}
