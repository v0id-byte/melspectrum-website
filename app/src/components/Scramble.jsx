import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/motion';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * 字符乱跳再还原。参数取自 spur 源码的 hover 变体：
 * duration 1.75 / revealDelay 0.15 / speed 1.25 / power4.inOut。
 *
 * 两个触发方式并存：
 * - **进场自动跑一次**（IntersectionObserver，跑完即 unobserve）。只靠 hover 的话，
 *   触屏用户和"滑过去就走"的用户根本看不到这个效果。
 * - **悬停可重复触发**，仅限真有 hover 的 ≥1024px 设备。
 *
 * ⚠️ 只能用在「中英两态都是拉丁字母或数字」的内容上，绝不用于中文。
 * 原因不是审美：我们的 NotoSansSC-subset.woff2 是按源码文本子集化的，
 * 随机汉字不在子集里会直接渲染成豆腐块；而且随机汉字可能凑出真词，
 * 语义不可控。拉丁字符集 A–Z 用在中文上还会让行宽瞬间塌陷。
 *
 * 静止态即最终态：GSAP 挂了就是一段普通文字。
 */
export default function Scramble({ children, tag: Tag = 'span', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return undefined;

    // 只持有自己那一条补间。
    // ⚠️ 这里**不能**写 gsap.killTweensOf(el) —— 那会连别的 owner 的补间一起杀掉。
    // 实际踩过：AS218883 是唯一同时挂 <Scramble> 与 anim-up--metric 的元素，
    // 进场时乱码把还在跑的淡入一并杀死，opacity 停在 0.18，白字变灰。
    // 乱码只拥有 scrambleText，淡入只拥有 opacity/transform，各管各的。
    // 重入守卫用 onComplete 翻转的布尔量。
    let tween = null;
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      if (tween) tween.kill();
      tween = gsap.to(el, {
        duration: 1.75,
        ease: 'power4.inOut',
        scrambleText: { text: '{original}', chars: 'upperCase', revealDelay: 0.15, speed: 1.25 },
        onComplete: () => { running = false; },
      });
    };

    // 进场自动跑一次。所有尺寸都给，这正是触屏用户唯一能看到它的机会。
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          run();
        });
      }, { threshold: 0.6 });
      io.observe(el);
    }

    // 触屏没有真正的 hover；小屏也按 motion density 降级
    const hoverable = window.matchMedia('(hover: hover) and (min-width: 1024px)').matches;
    if (hoverable) el.addEventListener('mouseenter', run);

    return () => {
      if (io) io.disconnect();
      if (hoverable) el.removeEventListener('mouseenter', run);
      if (tween) tween.kill();
    };
  }, [children]);

  return <Tag ref={ref} className={className}>{children}</Tag>;
}
