import { useEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, Observer, WIPE_EASE, prefersReduced, refreshSoon, whenFontsReady } from './index';

/** 标记该 section 的动效已成功接管（QA 与 CSS 用；不承担隐藏内容的职责）。 */
const markReady = (el) => { if (el) el.dataset.motionReady = 'true'; };
/** matchMedia 失配时只 revert 自己建的动画，手写的 dataset 必须自己清，
 *  否则窄屏下 pin 已消失而 data-motion-ready 残留，CSS 会把内容永久压暗。 */
const clearReady = (el) => { if (el) delete el.dataset.motionReady; };

/**
 * 站点最高价值的签名动效：逐行擦除条。
 *
 * 一块实色方块从左侧滑入盖住整行，继续滑出右侧，文字在它离开时淡起。
 * ±102% 的过冲和 wrapper 的 width:fit-content 是承重的——少了会在静止态
 * 露出色条残边。
 *
 * 生命周期只有一个所有者：字体/视口 reflow 交给 SplitText 的 autoSplit，
 * 语言切换由 React 通过 lang 依赖重建，卸载由 ctx.revert() 收尾。
 * 绝不再叠加 ResizeObserver / window.resize 手工重建。
 */
export function useTextReveal(scopeRef, lang) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;

    let ctx;
    let cancelled = false;

    whenFontsReady(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        scope.querySelectorAll('.reveal-text').forEach((el) => {
          try {
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'split-line',
              autoSplit: true,
              // 从 onSplit 返回 timeline，重拆时 SplitText 会自动清理旧动画
              onSplit(self) {
                const tl = gsap.timeline({
                  scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
                });
                self.lines.forEach((line, i) => {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'line-wrapper';
                  const box = document.createElement('div');
                  box.className = 'line-box';
                  line.parentNode.insertBefore(wrapper, line);
                  wrapper.appendChild(line);
                  wrapper.appendChild(box);

                  const d = i * 0.08;
                  gsap.set(box, { xPercent: -102, opacity: 1 });
                  gsap.set(line, { opacity: 0 });
                  tl.to(box, { xPercent: 0, duration: 0.9, ease: WIPE_EASE }, d);
                  tl.to(box, { xPercent: 102, duration: 0.9, ease: WIPE_EASE }, d + 0.9);
                  tl.to(line, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, d + 0.9);
                });
                return tl;
              },
            });
          } catch {
            // 拆分失败：保持这行原样可读，不影响其它元素
          }
        });
        markReady(scope);
      }, scope);
      refreshSoon();
    });

    return () => { cancelled = true; ctx?.revert(); };
  }, [scopeRef, lang]);
}

/**
 * 滚动显现，分三档。
 *
 * 全站只用一个 10px / 0.75s 会让每一屏读起来都一样——克制过头就变成单调。
 * spur 同一页上有三档：主视觉 200px/1.0s（还带 1.8s 延迟）、强调项带 scale、
 * 次要项 10–20px。我们按同样的思路分档，但幅度收敛到自己的尺度：
 *   .anim-up--lead    主标题、领句：56px / 1.0s，稍晚入场，建立层级
 *   .anim-up--metric  大数字：带 scale 0.94→1，像仪表归位
 *   .anim-up          正文、次要项：10px / 0.75s（原值）
 */
const REVEAL_TIERS = [
  { sel: '.anim-up--lead', from: { opacity: 0, y: 56 }, to: { duration: 1.0, ease: 'power2.out', delay: 0.12 } },
  { sel: '.anim-up--metric', from: { opacity: 0, y: 18, scale: 0.94 }, to: { duration: 0.9, ease: 'power2.out', scale: 1 } },
  { sel: '.anim-up', from: { opacity: 0, y: 10 }, to: { duration: 0.75, ease: 'power2.inOut' } },
];

export function useReveal(scopeRef, lang) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      for (const tier of REVEAL_TIERS) {
        // 必须显式传 scope：gsap.context 只约束 gsap.to/from/set 里的选择器字符串，
        // gsap.utils.toArray 是独立工具函数，不传 scope 会抓到全站的元素。
        gsap.utils.toArray(tier.sel, scope).forEach((el) => {
          // 更高档位已经接管的元素不再被基础档重复绑定
          if (el.dataset.revealBound) return;
          el.dataset.revealBound = '1';
          gsap.set(el, tier.from);
          gsap.to(el, {
            opacity: 1, y: 0, ...tier.to,
            scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
          });
        });
      }
    }, scope);
    return () => {
      ctx.revert();
      scope.querySelectorAll('[data-reveal-bound]').forEach((el) => { delete el.dataset.revealBound; });
    };
  }, [scopeRef, lang]);
}

/**
 * Thesis 三卡的入场。
 *
 * 这里刻意 *不* 用 spur 的 pinned stacking deck：那套动效的前提是卡片竖排
 * 全宽、依次堆叠；我们这三张是横排三列的并列指标，给它们各自 pin 会因为
 * 释放点错开而让整行在滚动中撕裂（实测三卡之间瞬跳 190px）。
 * 并列内容用错位淡入才是对的。
 */
export function useStackDeck(containerRef, lang) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReduced()) return undefined;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('[data-stack-card]', container);
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 14 });
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power2.inOut', stagger: 0.09,
        scrollTrigger: { trigger: container, start: 'top bottom', toggleActions: 'play none none none' },
      });
      markReady(container);
    }, container);

    return () => { clearReady(container); ctx.revert(); };
  }, [containerRef, lang]);
}

/** The Stack 三步：桌面 pin + 滚动推进；手机直接垂直展开。 */
export function useSteps(containerRef, onStep, lang) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReduced()) return undefined;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const steps = gsap.utils.toArray('[data-step]', container);
      if (!steps.length) return;
      let current = -1;
      ScrollTrigger.create({
        trigger: container,
        start: 'top 120px',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // 先把 0→1 映射到 0→n-1，再取整；只在跨阈值时 setState，
          // 绝不每帧驱动 React。
          const idx = gsap.utils.pipe(
            gsap.utils.mapRange(0, 1, 0, steps.length - 1),
            gsap.utils.snap(1),
          )(self.progress);
          if (idx !== current) { current = idx; onStep?.(idx); }
        },
      });
      markReady(container);
      return () => clearReady(container);
    });

    return () => mm.revert();
  }, [containerRef, onStep, lang]);
}

/**
 * 速度反应式跑马灯。
 *
 * 方向恒定，只调速度。刻意 *不* 让 timeScale 取负来跟随滚动方向：反向播放
 * 会一路退到 timeline 的 time=0 边界后终止（repeat:-1 在反向时不续接），
 * 跑马灯就此卡死，之后页面静止也不恢复——正常向下阅读必然触发。
 * modifiers 只能消除视觉接缝，消不掉 timeline 自身的边界。
 * 滚动越快转得越快，静止后回落到巡航速度，反应感保留。
 */
export function useMarquee(trackRef, lang) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReduced()) return undefined;

    const ctx = gsap.context(() => {
      const total = track.scrollWidth / 3; // 内容被复制了三份
      if (!total) return;
      const wrap = gsap.utils.wrap(-total, 0);
      const tl = gsap.timeline({ repeat: -1 })
        .to(track, {
          x: `-=${total}`,
          duration: 28,
          ease: 'none',
          modifiers: { x: (x) => `${wrap(parseFloat(x))}px` },
        });
      const CRUISE = 0.4;
      tl.timeScale(CRUISE);

      let hovering = false;

      const obs = Observer.create({
        type: 'wheel,touch,scroll',
        onChangeY(self) {
          if (hovering) return;   // 悬停阅读时不被滚动打断
          const boost = gsap.utils.clamp(CRUISE, 3, Math.abs(self.deltaY) * 0.12 + CRUISE);
          gsap.timeline({ defaults: { ease: 'none' } })
            .to(tl, { timeScale: boost, duration: 0.2, overwrite: true })
            .to(tl, { timeScale: CRUISE, duration: 1 });
        },
      });

      // 悬停几乎停下来，让人能读清某一项；离开后缓慢恢复巡航
      const host = track.parentElement;
      const canHover = window.matchMedia('(hover: hover)').matches;
      const onEnter = () => {
        hovering = true;
        gsap.to(tl, { timeScale: 0.04, duration: 0.45, ease: 'power2.out', overwrite: true });
      };
      const onLeave = () => {
        hovering = false;
        gsap.to(tl, { timeScale: CRUISE, duration: 0.9, ease: 'power2.out', overwrite: true });
      };
      if (canHover) {
        host.addEventListener('mouseenter', onEnter);
        host.addEventListener('mouseleave', onLeave);
      }

      markReady(host);
      return () => {
        obs.kill();
        if (canHover) {
          host.removeEventListener('mouseenter', onEnter);
          host.removeEventListener('mouseleave', onLeave);
        }
      };
    }, track);

    return () => ctx.revert();
  }, [trackRef, lang]);
}

/** Hero 蓝图网格：随滚动缓慢上移，并极缓地"呼吸"——网格是测量的隐喻，
 *  让它像待机中的仪器而不是静态装饰。位移很小，避免与内容抢注意力。 */
export function useGridParallax(gridRef) {
  useEffect(() => {
    const el = gridRef.current;
    if (!el || prefersReduced()) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      gsap.to(el, {
        y: -70,
        ease: 'power2.in',
        scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: 0 },
      });
      gsap.to(el, { opacity: 0.72, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true });
    });
    return () => mm.revert();
  }, [gridRef]);
}

/** Hero 滚动提示：在前 100px 内淡出。 */
export function useHeroCue(cueRef) {
  useEffect(() => {
    const cue = cueRef.current;
    if (!cue || prefersReduced()) return undefined;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'top top-=100',
      scrub: 0,
      onUpdate: (self) => gsap.set(cue, { opacity: 1 - self.progress }),
    });
    return () => st.kill();
  }, [cueRef]);
}
