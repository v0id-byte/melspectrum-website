import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { BracketLink, Eyebrow } from './ui';
import { tuning, staging, montage } from '../data/metrics';

function Product({ eyebrow, site, tag, name, lead, specs, href, note }) {
  const { t } = useT();
  return (
    <article className="product">
      <div className="product__head">
        <Eyebrow>{eyebrow}</Eyebrow>
        {/* legacy page rendered this as an inert <span> that looked like a link */}
        <a className="blink t-ui" href={href} target="_blank" rel="noopener noreferrer">
          {site} ↗
        </a>
      </div>
      <div className="product__body">
        <span className="t-ui" style={{ color: 'var(--color-ash)' }}>{tag}</span>
        <h3 className="t-h2 reveal-text">{name}</h3>
        <p className="product__lead t-body anim-up--lead">{lead}</p>
        <div className="product__actions">
          <BracketLink href={href} external>{t('访问产品站', 'Visit product site')}</BracketLink>
          <BracketLink href="#tech">{t('了解技术细节', 'Tech details')}</BracketLink>
        </div>
      </div>
      <div className="product__side">
        <div className="specs">
          {specs.map((s) => (
            <div className="spec" key={s.k}>
              <span className="spec__k t-ui">{s.k}</span>
              <span className="spec__v anim-up--metric">{s.v}</span>
            </div>
          ))}
        </div>
        {note ? <p className="specs__note">{note}</p> : null}
      </div>
    </article>
  );
}

export default function Products() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  return (
    <section id="products" className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
      <Product
        eyebrow="PRODUCT 01 · HARDWARE"
        site="pianotuner.top"
        href="https://pianotuner.top"
        tag={t('硬件 · HARDWARE', 'HARDWARE')}
        name="Piano Tuner"
        lead={t(
          '把一位调律师的耳朵，装进口袋。实时 Railsback 曲线拟合，让每一根琴弦回到它该在的位置。',
          "A professional tuner's ear, in your pocket. Real-time Railsback curve fitting brings every string back to where it belongs.",
        )}
        specs={[
          { k: t('调律精度 / PITCH ACCURACY', 'PITCH ACCURACY'), v: `±${tuning.accuracyCents} ¢*` },
          { k: t('断弦防护 / STRING PROTECTION', 'STRING PROTECTION'), v: 'StringGuard' },
          { k: t('固件升级 / FIRMWARE OTA', 'FIRMWARE OTA'), v: t('双向回滚', 'Two-way rollback') },
          { k: t('状态 / STATUS', 'STATUS'), v: t('硬件研发中', 'In development') },
        ]}
        note={`* ${t(tuning.noteZh, tuning.noteEn)}`}
      />
      <hr className="rule" />
      <Product
        eyebrow="PRODUCT 02 · ALGORITHM"
        site="somnil.top"
        href="https://somnil.top"
        tag={t('算法 · ALGORITHM', 'ALGORITHM')}
        name="Somnil"
        lead={t(
          '额头上的四路脑电，逐 30 秒判断你睡到了哪一层；检测到噩梦的迹象时，把你轻轻叫醒。',
          'Four channels of EEG across the forehead read which stage of sleep you are in, thirty seconds at a time — and wake you gently at the first signs of a nightmare.',
        )}
        specs={[
          { k: t('导联 / MONTAGE', 'MONTAGE'), v: montage.join(' · ') },
          { k: t('睡眠分期 / SLEEP-EDF', 'SLEEP-EDF'), v: `${staging.sets[0].acc} · κ ${staging.sets[0].kappa}†` },
          { k: t('病理人群 / CAP', 'CAP'), v: `${staging.sets[1].acc} · κ ${staging.sets[1].kappa}†` },
          { k: t('推理位置 / INFERENCE', 'INFERENCE'), v: t('端侧 CoreML', 'On-device CoreML') },
        ]}
        note={`† ${t(staging.noteZh, staging.noteEn)}`}
      />
    </section>
  );
}
