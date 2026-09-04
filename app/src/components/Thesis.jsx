import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useStackDeck } from '../lib/motion/hooks';
import { SectionHead } from './ui';

export default function Thesis() {
  const { t, lang } = useT();
  const root = useRef(null);
  const deck = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  useStackDeck(deck, lang);
  const cards = [
    {
      num: '01 · ACOUSTICS',
      metric: '±2 cents',
      title: t('物理层精度', 'Physical-layer precision'),
      desc: t(
        '声学硬件配数字信号处理，把调律精度做到人耳分辨极限附近。',
        'Acoustic hardware and DSP together push tuning precision to the edge of what an ear can resolve.',
      ),
    },
    {
      num: '02 · INTELLIGENCE',
      metric: '~80%',
      title: t('睡眠分期算法', 'Sleep-staging algorithm'),
      desc: t(
        '从声音里读出睡眠分期。在公开临床数据集上，精度接近人类技师之间的一致性水平。',
        'Sleep staging read from sound. On public clinical datasets, accuracy comes close to the agreement between human scorers.',
      ),
    },
    {
      // was <10 ms in the legacy page, contradicting its own description and
      // every other latency figure on the site. Unified to <50 ms.
      num: '03 · LATENCY',
      metric: '<50 ms',
      title: t('实时响应', 'Real-time response'),
      desc: t(
        '端到端信号链路 <50 ms —— 从声音发生到系统作出反应，短到察觉不到。',
        'Under 50 ms, end to end — from the sound happening to the system responding, short enough to go unnoticed.',
      ),
    },
  ];

  return (
    <section className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
      <SectionHead
        eyebrow={t('OUR THESIS · 我们的判断', 'OUR THESIS')}
        title={t(
          '声音是物理的。听见它只要一个麦克风；听懂它，传感器、固件、算法三层都得做对。',
          'Sound is physical. Hearing it takes a microphone. Understanding it takes the sensor, the firmware and the algorithm — all three.',
        )}
        sub={t(
          '页面上的每一个数字，都对应真实的传感器、真实的算法、真实的人。',
          'Every number on this page maps to a real sensor, a real algorithm, a real person.',
        )}
      />
      <div className="stack-deck" ref={deck}>
        {cards.map((c) => (
          <article className="card" key={c.num} data-stack-card>
            <span className="card__num t-ui">{c.num}</span>
            <span className="t-metric card__metric anim-up--metric">{c.metric}</span>
            <h3 className="t-h3">{c.title}</h3>
            <p className="card__desc t-body-sm">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
