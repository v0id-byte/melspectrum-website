import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useStackDeck } from '../lib/motion/hooks';
import { SectionHead } from './ui';
import { tuning, staging } from '../data/metrics';

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
      metric: `±${tuning.accuracyCents} ¢`,
      title: t('物理层精度', 'Physical-layer precision'),
      desc: t(
        '声学硬件配数字信号处理，把调律精度做到人耳分辨极限附近。实验室测试结果，最终性能以量产版本验证为准。',
        'Acoustic hardware and DSP together push tuning precision to the edge of what an ear can resolve. Lab-tested; final performance is whatever the production version verifies.',
      ),
    },
    {
      num: '02 · INTELLIGENCE',
      metric: `κ ${staging.sets[0].kappa}`,
      title: t('睡眠分期算法', 'Sleep-staging algorithm'),
      desc: t(
        `单通道脑电做睡眠分期。Sleep-EDF 公开临床基准、被试级留出：准确率 ${staging.sets[0].acc}、κ ${staging.sets[0].kappa}，落在已发表单通道文献区间内。非真机验证。`,
        `Single-channel EEG sleep staging. On the Sleep-EDF public clinical benchmark, subject-wise held out: ${staging.sets[0].acc} accuracy, κ ${staging.sets[0].kappa} — inside the published range for single-channel work. Not validated on our own hardware.`,
      ),
    },
    {
      num: '03 · INFRASTRUCTURE',
      metric: 'AS218883',
      title: t('自有网络', 'Our own network'),
      desc: t(
        '连接产品的那条路径也是我们自己运营的。下面每一个数字，你都可以去第三方公共数据库自己查。',
        'The path our products travel is one we run ourselves. Every figure below it is one you can check for yourself, on third-party public databases.',
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
