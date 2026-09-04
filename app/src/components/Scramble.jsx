import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/motion';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * 悬停时字符乱跳再还原。参数取自 spur 源码的 hover 变体：
 * duration 1.75 / revealDelay 0.15 / speed 1.25 / power4.inOut。
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
    // 触屏没有真正的 hover；小屏也按 motion density 降级
    if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return undefined;

    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      gsap.killTweensOf(el);
      gsap.to(el, {
        duration: 1.75,
        ease: 'power4.inOut',
        scrambleText: { text: '{original}', chars: 'upperCase', revealDelay: 0.15, speed: 1.25 },
        onComplete: () => { running = false; },
      });
    };

    el.addEventListener('mouseenter', run);
    return () => { el.removeEventListener('mouseenter', run); gsap.killTweensOf(el); };
  }, [children]);

  return <Tag ref={ref} className={className}>{children}</Tag>;
}
