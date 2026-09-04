import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { SectionHead } from './ui';

export default function Team() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  const people = [
    {
      // legacy page shipped a literal "[PHOTO PLACEHOLDER]" string here.
      // A monogram block holds the slot with dignity until real photos exist.
      mono: '覃',
      role: 'FOUNDER · CEO',
      name: t('覃刘浩然 · Soren Qin', 'Soren Qin'),
      bio: t(
        '融谱智能科技创始人。Piano Tuner 始于一台总也调不准的钢琴，Somnil 始于一段睡不好的夜晚。做的事情，都是从一个具体的人、一个具体的麻烦开始的。',
        'Founder of MelSpectrum. Piano Tuner began with a piano that would not stay in tune; Somnil began with a stretch of bad nights. The work starts from a specific person with a specific problem.',
      ),
      meta: t('RESEARCH · 声学硬件 / DSP / 嵌入式', 'RESEARCH · Acoustic HW / DSP / Embedded'),
    },
    {
      mono: '张',
      role: 'CO-FOUNDER · PIANO TUNER',
      name: t('张希瑞 · Zhang Xirui', 'Zhang Xirui'),
      bio: t(
        'Piano Tuner 联合创始人，与 Soren 在科创学院把这个项目做起来。负责算法，把采到的声音拟合成每一台钢琴自己的 Railsback 曲线。',
        'Co-founder of Piano Tuner — the project began with Soren at the Innovation College. Leads the algorithms that fit captured sound to each piano\'s own Railsback curve.',
      ),
      meta: t('RESEARCH · 算法 / 信号处理 / AI', 'RESEARCH · Algorithms / DSP / AI'),
    },
  ];

  return (
    <section id="team" className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
      <SectionHead
        eyebrow={t('THE PEOPLE · 团队', 'THE PEOPLE')}
        title={t(
          '小团队，做能打穿物理层的事。',
          'A small team, shipping things that punch through the physical layer.',
        )}
        sub={t(
          'Piano Tuner 来自一位调律师对精度的执着；Somnil 来自一个人反复睡不好的那些夜晚。两件事，都不是从市场调研开始的。',
          "Piano Tuner came from a tuner's obsession with precision. Somnil came from one person's run of bad nights. Neither started with a market survey.",
        )}
      />
      <div className="team-grid">
        {people.map((p) => (
          <article className="person" key={p.role}>
            <div className="person__top">
              <div className="person__mono" aria-hidden="true">{p.mono}</div>
              <div>
                <div className="t-ui" style={{ color: 'var(--color-ash)' }}>{p.role}</div>
                <h3 className="t-h3">{p.name}</h3>
              </div>
            </div>
            <p className="person__bio t-body-sm">{p.bio}</p>
            <div className="person__meta t-ui">{p.meta}</div>
            <a className="t-ui literal" href="mailto:contact@melspectrum.com">contact@melspectrum.com</a>
          </article>
        ))}
      </div>
    </section>
  );
}
