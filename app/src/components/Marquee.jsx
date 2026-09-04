import { useRef } from 'react';
import { useT } from '../i18n';
import { useMarquee } from '../lib/motion/hooks';

const ITEMS = [
  'LAB-TESTED ±2 ¢',
  'RAILSBACK CURVE',
  'STRINGGUARD',
  'TWO-WAY OTA ROLLBACK',
  '4-CH FRONTAL EEG',
  'RESNET1D + HMM',
  'κ 0.715 · SLEEP-EDF',
  'ON-DEVICE COREML',
  'AS218883',
  '2a13:c8c3:e803::/48',
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
