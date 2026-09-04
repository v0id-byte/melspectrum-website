import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Observer);

/** 站点的运动签名：violently symmetric ease-in-out，静→急→缓。 */
export const WIPE_EASE = CustomEase.create('msWipe', '1, 0, 0, 1');

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 让出一帧再测量。document.fonts.ready 只表示字体加载已 settled，
 * 并不保证此刻 layout 已稳定；在连续 DOM 写入后立刻 refresh，
 * Safari 上容易按旧 layout 计算出偏几 px 的 pin 起点。
 */
export function refreshSoon() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}

/** 字体就绪后再拆行——行盒会随字体落定而改变。 */
export function whenFontsReady(cb) {
  if (typeof document === 'undefined') return;
  const run = () => requestAnimationFrame(cb);
  if (document.fonts?.ready) document.fonts.ready.then(run).catch(run);
  else run();
}

export { gsap, ScrollTrigger, SplitText, Observer };
