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
            observed={t('RIPE · /40 为迁移兜底宣告', 'RIPE · /40 ANNOUNCED AS MIGRATION FALLBACK')}
          >
            <Scramble tag="div" className="net__prefix anim-up--metric">{N.primaryPrefix}</Scramble>
          </Metric>

          <Metric
            label={t('生产主机 / PRODUCTION IPv6', 'PRODUCTION IPv6')}
            observed={t('清单地址 · 直连域名待核验', 'INVENTORY ADDRESS · DIRECT HOSTNAME PENDING VERIFICATION')}
          >
            <div className="net__prefix anim-up--metric">{N.productionHost.address}</div>
            <span className="t-ui">{N.productionHost.host}</span>
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
          <p className="t-ui">{t(`来源：NOC 网络清单与 wg-enroll 地址规划 · ${N.inventoryAsOf}。此处不展示未经重新核验的 RIS 可见性。`, `Source: NOC network inventory and wg-enroll address plan · ${N.inventoryAsOf}. RIS visibility is omitted pending fresh verification.`)}</p>
          <ul>
            {N.originatedPrefixes.map((p) => (
              <li key={p.prefix}><code>{p.prefix}</code> · {p.rir} · {t(p.role, p.roleEn)}</li>
            ))}
          </ul>
          <p className="t-ui">{t('迁移中的旧前缀（不计入上方主地址空间清单）：', 'Legacy migration prefixes (excluded from the primary-space inventory above):')}</p>
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
