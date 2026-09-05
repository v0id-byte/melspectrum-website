import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { networkSnapshot as N, networkLinks } from '../data/network';
import { SectionHead, BracketLink } from './ui';
import Scramble from './Scramble';
import { useCountUp } from '../lib/motion/useCountUp';
import Globe from './Globe';

function Metric({ label, children, observed }) {
  return (
    <div className="metric">
      <span className="metric__label t-ui">{label}</span>
      <div className="metric__value">{children}</div>
      {observed ? <span className="metric__obs t-ui">{observed}</span> : null}
    </div>
  );
}

export default function Network() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root, lang);
  useReveal(root, lang);
  useCountUp(root, lang);
  const pct = Math.round((N.ris.visible / N.ris.total) * 100);

  return (
    <section id="network" className="island-dark net p-custom py-section" data-nav-theme="dark" ref={root}>
      {/* Decorative only. Every figure below also exists as real DOM text. */}
      <Globe className="net__canvas" />

      <div className="net__inner">
        <SectionHead
          eyebrow={t('THE NETWORK · 自有网络', 'THE NETWORK')}
          title={t(
            '连接我们产品的那条路径，也是我们自己的。',
            'The path our products travel is one we run ourselves.',
          )}
          sub={t(
            '我们自己运营自治域 AS218883，对外宣告两条 IPv6 前缀，从三个节点向外通告，节点之间用 BFD 做故障检测。v6.pianotuner.top 就直接跑在我们自己的 IPv6 地址上。下面每一个数字，你都可以去第三方公共数据库自己查。',
            'We run our own autonomous system, AS218883. It originates two IPv6 prefixes, announced from three locations, with BFD between them for failure detection. v6.pianotuner.top is served directly from an address inside our own prefix. Every figure below is one you can check for yourself, on third-party public databases.',
          )}
        />

        <div className="net__metrics">
          <Metric label={t('自治域 / AUTONOMOUS SYSTEM', 'AUTONOMOUS SYSTEM')}>
            <Scramble className="t-metric anim-up--metric">{`AS${N.asn}`}</Scramble>
          </Metric>

          <Metric
            label={t('宣告前缀 / ORIGINATED PREFIXES', 'ORIGINATED PREFIXES')}
            observed={t(`首次观测 ${N.ris.firstSeen}`, `FIRST SEEN ${N.ris.firstSeen}`)}
          >
            <span className="t-metric anim-up--metric">
              {String(N.originatedPrefixes.length).padStart(2, '0')}
            </span>
            <div className="net__prefix" style={{ marginTop: 8 }}>
              {/* RIR 与起始日期随前缀一起走：两条前缀来源不同，不可合并成一个标签 */}
              {N.originatedPrefixes.map((p) => (
                <div key={p.prefix}>
                  <Scramble tag="span">{p.prefix.toUpperCase()}</Scramble>
                  <span className="t-ui" style={{ color: 'var(--color-ash)', marginLeft: 10 }}>
                    {p.rir} · {t(`${p.since} 起`, `SINCE ${p.since}`)}
                  </span>
                </div>
              ))}
            </div>
          </Metric>

          <Metric
            label="RIS VISIBILITY"
            /* snapshot, not a permanent property — provenance travels with it */
            observed={`${N.ris.visible} / ${N.ris.total} FULL PEERS · ${N.ris.prefix.toUpperCase()} · OBSERVED ${N.ris.observedAt} · ${N.ris.source}`}
          >
            <span className="t-metric anim-up--metric">
              <span data-countup={pct} data-countup-suffix="%">{pct}%</span>
            </span>
          </Metric>

          <Metric label={t('路由节点 / ROUTING PRESENCE', 'ROUTING PRESENCE')}>
            <div className="net__pops">
              {N.routingPresence.map((p) => (
                <span className="net__pop" key={p.code}>
                  <Scramble tag="b">{p.code}</Scramble>
                  <span className="t-ui" style={{ color: 'var(--color-ash)' }}>
                    {lang === 'en' ? p.regionEn : p.region}
                  </span>
                </span>
              ))}
            </div>
            <span className="metric__obs t-ui" style={{ display: 'block', marginTop: 10 }}>
              {t('三节点通告 · BFD 故障检测', 'ANNOUNCED FROM THREE NODES · BFD FAILURE DETECTION')}
            </span>
          </Metric>
        </div>

        <div className="net__links">
          <BracketLink href={`https://${N.directService.host}/`} external highlight>
            {N.directService.host}
          </BracketLink>
          {networkLinks.map((l) => (
            <BracketLink key={l.label} href={l.href} external highlight>{l.label}</BracketLink>
          ))}
        </div>
      </div>
    </section>
  );
}
