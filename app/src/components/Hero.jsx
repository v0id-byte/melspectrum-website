import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useHeroCue, useGridParallax } from '../lib/motion/hooks';
import { BracketLink } from './ui';

/** Blueprint hairline grid — ~2KB of inline SVG, 68px pitch. */
function BlueprintGrid({ innerRef }) {
  const P = 68;
  const W = 1512;
  const H = 1010;
  const v = [];
  for (let x = P; x < W; x += P) v.push(x);
  const h = [];
  for (let y = P; y < H; y += P) h.push(y);
  return (
    <svg
      ref={innerRef}
      className="hero__grid"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#414141" strokeOpacity="0.25" strokeWidth="0.673286">
        {v.map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} />)}
        {h.map((y) => <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} />)}
      </g>
    </svg>
  );
}

export default function Hero() {
  const { t, lang } = useT();
  const root = useRef(null);
  const cue = useRef(null);
  const grid = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  useHeroCue(cue);
  useGridParallax(grid);
  return (
    <section id="top" className="hero island-dark p-custom" data-nav-theme="dark" ref={root}>
      <div className="hero__media" aria-hidden="true" />
      <BlueprintGrid innerRef={grid} />
      <div className="hero__inner">
        <h1 className="t-display hero__title reveal-text">
          {lang === 'en' ? (
            <>
              <span className="l1">Teach machines</span>
              <span className="l2">to listen</span>
            </>
          ) : (
            <>
              <span className="l1">让机器</span>
              <span className="l2">听懂声音</span>
            </>
          )}
        </h1>

        <div className="hero__foot">
          <p className="hero__sub t-body anim-up--lead">
            {/* 原文是「……的深度融合。」——公文套话、括号注释、且整句无谓语。
                而下面那句 We turn vibrations into understanding 原本是硬编码英文、
                中文版也照原样显示，等于好句子在打杂、坏句子在当家。这里把它扶正
                并给了对等的中文。 */}
            {t(
              '融谱智能科技 —— 一半是声学，一半是算法。',
              'MelSpectrum. Half acoustics, half algorithms.',
            )}
            <br />
            {t('我们把振动，变成理解。', 'We turn vibrations into understanding.')}
          </p>
          <div className="hero__actions anim-up">
            <BracketLink href="#products">{t('探索产品', 'Explore products')}</BracketLink>
            <BracketLink href="#team">{t('了解团队', 'Meet the team')}</BracketLink>
          </div>
        </div>

        <div className="hero__cue t-ui" ref={cue}>
          <span>SCROLL</span>
          <span className="line" />
        </div>
      </div>
    </section>
  );
}
