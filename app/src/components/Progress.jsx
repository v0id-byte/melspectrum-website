import { useEffect, useRef } from 'react';
import { networkSnapshot as N } from '../data/network';

/**
 * spur.us runs a live IP counter here. We have no live metric, and inventing
 * one would be a lie — so the bar carries a static identity readout instead.
 */
export default function Progress({ theme }) {
  const barRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const bar = barRef.current;
      const label = labelRef.current;
      if (!bar || !label) return;
      bar.style.width = `${p * 100}%`;
      const x = Math.max(0, bar.offsetWidth - label.offsetWidth);
      label.style.transform = `translateX(${x}px)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const color = theme === 'light' ? 'var(--color-black)' : 'var(--color-accent)';
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__label t-ui" ref={labelRef} style={{ color }}>
        ⬡ AS{N.asn} · {N.originatedPrefixes[0].prefix}
      </div>
      <div className="progress__bar" ref={barRef} style={{ background: color }} />
    </div>
  );
}
