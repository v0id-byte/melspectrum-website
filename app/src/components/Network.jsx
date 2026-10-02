import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { networkSnapshot as N, networkLinks } from '../data/network';
import { SectionHead, BracketLink } from './ui';
import Scramble from './Scramble';
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
            `我们运营自治域 AS${N.asn}，主地址块为 ${N.primaryPrefix}，路由节点覆盖洛杉矶、盐湖城、香港、伦敦和圣路易斯。以下是截至 ${N.inventoryAsOf} 的运维清单快照；实时状态请查看 Status 和 Looking Glass，公共路由记录可在第三方数据库核对。`,
            `We operate AS${N.asn}, with primary address block ${N.primaryPrefix} and routing locations in Los Angeles, Salt Lake City, Hong Kong, London and St. Louis. This is an operator inventory snapshot as of ${N.inventoryAsOf}. See Status and Looking Glass for live status, and third-party databases for public routing records.`,
          )}
        />

        <div className="net__metrics">
          <Metric label={t('自治域 / AUTONOMOUS SYSTEM', 'AUTONOMOUS SYSTEM')}>
            <Scramble className="t-metric anim-up--metric">{`AS${N.asn}`}</Scramble>
          </Metric>

          <Metric
            label={t('主地址块 / PRIMARY IPv6 BLOCK', 'PRIMARY IPv6 BLOCK')}
            /* snapshot, not a permanent property: provenance travels with the figure */
            observed={t(
              `${N.ris.source} · ${N.ris.visible} / ${N.ris.total} 全表 PEER 可见 · 观测于 ${N.ris.observedAt}`,
              `${N.ris.visible} / ${N.ris.total} FULL PEERS · ${N.ris.source} · OBSERVED ${N.ris.observedAt}`,
            )}
          >
            <Scramble tag="div" className="net__prefix anim-up--metric">{N.primaryPrefix}</Scramble>
          </Metric>

          <Metric
            label={t('生产主机 / PRODUCTION IPv6', 'PRODUCTION IPv6')}
            observed={N.productionHost.host}
          >
            <div className="net__prefix anim-up--metric">{N.productionHost.address}</div>
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
              {t(`运维清单 · ${N.inventoryAsOf}`, `OPERATOR INVENTORY · ${N.inventoryAsOf}`)}
            </span>
          </Metric>
        </div>

        <details className="net__inventory">
          <summary className="t-ui">
            {t(`主地址空间宣告清单（${N.originatedPrefixes.length} 条）与旧前缀状态`, `PRIMARY-SPACE ANNOUNCEMENT INVENTORY (${N.originatedPrefixes.length}) AND LEGACY STATUS`)}
          </summary>
          <p className="t-ui">{t(`来源：运维清单 · ${N.inventoryAsOf}。可见性数据仅针对 ${N.ris.prefix}（${N.ris.source} · ${N.ris.observedAt}）。`, `Source: operator inventory · ${N.inventoryAsOf}. The visibility figure covers ${N.ris.prefix} only (${N.ris.source} · ${N.ris.observedAt}).`)}</p>
          <ul>
            {N.originatedPrefixes.map((p) => (
              <li key={p.prefix}><code>{p.prefix}</code> · {p.rir} · {t(p.role, p.roleEn)}</li>
            ))}
          </ul>
          <p className="t-ui">{t('旧前缀（不计入上方主地址空间清单）：', 'Legacy prefixes (not part of the primary-space inventory above):')}</p>
          <ul>
            {N.legacyPrefixes.map((p) => (
              <li key={p.prefix}><code>{p.prefix}</code> · {p.rir} · {t(p.status, p.statusEn)}</li>
            ))}
          </ul>
        </details>

        <div className="net__links">
          {N.directService && (
            <BracketLink href={`https://${N.directService.host}/`} external highlight>
              {N.directService.host}
            </BracketLink>
          )}
          {networkLinks.map((l) => (
            <BracketLink key={l.label} href={l.href} external highlight>{l.label}</BracketLink>
          ))}
        </div>
      </div>
    </section>
  );
}
