import { useRef } from 'react';
import { useT } from '../i18n';
import { useMarquee } from '../lib/motion/hooks';

const ITEMS = [
  '±2 ¢ TUNING ACCURACY',
  'MEL · STFT · CWT',
  'BLE 5.0 · OTA',
  'RAILSBACK CURVE',
  '~80% STAGING ACC',
  'AS218883',
  '2a13:c8c3:e803::/48',
  '< 50 ms SIGNAL CHAIN',
];

export default function Marquee() {
  const { t, lang } = useT();
  const track = useRef(null);
  useMarquee(track, lang);
  // tripled so the loop has material either side of the viewport
  const items = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <section
      className="island-light marquee"
      data-nav-theme="light"
      aria-label={t('技术关键词', 'Technology keywords')}
    >
      <div className="marquee__track" ref={track}>
        {items.map((it, i) => (
          <span className="marquee__item" key={`${it}-${i}`}>
            {it}
            <span className="marquee__sep" aria-hidden="true"> — </span>
          </span>
        ))}
      </div>
    </section>
  );
}
