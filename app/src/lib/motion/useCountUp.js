import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from './index';

/**
 * 数字滚动到最终值，只在首次进入视口跑一次，跑完即静止。
 *
 * 这不是伪造实时数据：目标值全部来自 data/network.js 的静态快照，
 * 且页面上紧挨着就标注了观测日期与来源。绝不做每秒自增的假计数器。
 */
export function useCountUp(scopeRef, lang) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const targets = gsap.utils.toArray('[data-countup]', scope);
    if (!targets.length) return undefined;

    // reduced-motion：直接呈现最终值，不做任何过渡
    if (prefersReduced()) {
      targets.forEach((el) => { el.textContent = el.dataset.countup; });
      return undefined;
    }

    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        const end = parseFloat(el.dataset.countup);
        const suffix = el.dataset.countupSuffix || '';
        if (!Number.isFinite(end)) return;
        const state = { v: 0 };
        el.textContent = `0${suffix}`;
        gsap.to(state, {
          v: end,
          duration: 1.1,
          ease: 'power2.out',
          snap: { v: 1 },
          onUpdate: () => { el.textContent = `${Math.round(state.v)}${suffix}`; },
          scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
        });
      });
    }, scope);

    return () => {
      ctx.revert();
      // revert 会把文本还原成初始的 "0"，必须显式落回真实值
      targets.forEach((el) => { el.textContent = `${el.dataset.countup}${el.dataset.countupSuffix || ''}`; });
    };
  }, [scopeRef, lang]);
}
