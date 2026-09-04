import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { Eyebrow } from './ui';

export default function Contact() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  const rows = [
    {
      k: t('投资合作', 'Investment'),
      v: t('种子轮 · 天使轮 · 战略投资', 'Seed · Angel · Strategic'),
    },
    {
      k: t('业务合作', 'Business'),
      v: t('钢琴厂商 · 调律师 · 睡眠监测平台', 'Piano makers · Tuners · Sleep platforms'),
    },
    {
      k: t('学术交流', 'Research'),
      v: t('声学信号处理 · 睡眠医学 · 嵌入式 AI', 'Acoustic SP · Sleep medicine · Embedded AI'),
    },
  ];

  return (
    <section id="contact" className="island-accent p-custom py-section" data-nav-theme="light" ref={root}>
      <div className="sec-head grid-custom">
        <div className="sec-head__eyebrow">
          <span className="t-ui" style={{ background: 'var(--color-black)', color: 'var(--color-white)', padding: '4px 6px' }}>
            {t('GET IN TOUCH · 合作', 'GET IN TOUCH')}
          </span>
        </div>
        <h2 className="t-h2 reveal-text" style={{ gridColumn: '1 / -1' }}>
          {t('一个邮箱 · 一个人 · 一封回复', 'One address · one person · one reply')}
        </h2>
      </div>
      <div style={{ marginTop: 'var(--gap-y-md)' }}>
        <span className="t-ui">MAIL</span>
        <div style={{ marginTop: 12 }}>
          <a className="cta__mail anim-up--lead" href="mailto:contact@melspectrum.com">contact@melspectrum.com</a>
        </div>
        <p className="t-body" style={{ maxWidth: '52ch', marginTop: 24 }}>
          {t(
            '投资、合作、学术，都写到这一个地址，由创始人本人回。慢一点，但认真。',
            'Investment, partnership, research — every kind of inquiry lands at this single address, answered by the founder, personally. Slow, but considered.',
          )}
        </p>
      </div>
      <div className="cta__rows">
        {rows.map((r) => (
          <div className="cta__row" key={r.k}>
            <span className="t-ui">{r.k}</span>
            <span className="t-body">{r.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
