import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { preloadAll, markPreloaded } from '../lib/preload';

/**
 * 极简加载页。风格与全站一致：零圆角、零阴影、单色、1px 发丝线、等宽大写标签。
 * 刻意不用 spinner —— 一条真实推进的线 + 等宽数字更像仪器而非通用 Web 组件。
 */
export default function Preloader({ onDone }) {
  const { t, lang } = useT();
  const [pct, setPct] = useState(0);
  const [stage, setStage] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    preloadAll({
      onProgress: (p) => { if (!cancelled) setPct(p); },
      onStage: (a) => { if (!cancelled) setStage(a); },
    }).then(() => {
      if (cancelled || doneRef.current) return;
      doneRef.current = true;
      markPreloaded();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { onDone(); return; }
      setLeaving(true);
      setTimeout(onDone, 620); // 与 CSS 的淡出时长一致
    });
    return () => { cancelled = true; };
  }, [onDone]);

  const shown = Math.round(pct * 100);
  const label = stage ? (lang === 'en' ? stage.en : stage.zh) : t('准备中', 'PREPARING');

  return (
    <div className={`preloader${leaving ? ' preloader--leaving' : ''}`} role="status" aria-live="polite">
      <div className="preloader__inner">
        <div className="preloader__top t-ui">
          <span>MELSPECTRUM</span>
          <span className="preloader__pct">{String(shown).padStart(3, '0')}%</span>
        </div>

        <div className="preloader__track">
          <div className="preloader__bar" style={{ transform: `scaleX(${pct})` }} />
        </div>

        <div className="preloader__foot t-ui">
          <span className="preloader__stage">{label}</span>
          <span className="preloader__mark" aria-hidden="true">AS218883</span>
        </div>
      </div>
      <span className="preloader__sr">
        {t(`加载中 ${shown}%`, `Loading ${shown}%`)}
      </span>
    </div>
  );
}
