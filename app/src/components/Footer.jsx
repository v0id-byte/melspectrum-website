import { useT } from '../i18n';
import { networkLinks } from '../data/network';

export default function Footer() {
  const { t } = useT();
  return (
    <footer className="island-dark p-custom py-section-sm footer" data-nav-theme="dark">
      <div className="footer__cols">
        <div className="footer__col">
          <h3 className="t-ui">MELSPECTRUM</h3>
          <a href="#products">{t('产品', 'Products')}</a>
          <a href="#tech">{t('技术', 'Technology')}</a>
          <a href="#network">{t('网络', 'Network')}</a>
          <a href="#team">{t('团队', 'Team')}</a>
        </div>
        <div className="footer__col">
          <h3 className="t-ui">{t('产品', 'PRODUCTS')}</h3>
          <a href="https://pianotuner.top" target="_blank" rel="noopener noreferrer">PIANOTUNER.TOP ↗</a>
          <a href="https://somnil.top" target="_blank" rel="noopener noreferrer">SOMNIL.TOP ↗</a>
        </div>
        <div className="footer__col">
          <h3 className="t-ui">NETWORK · AS218883</h3>
          {networkLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
        <div className="footer__col">
          <h3 className="t-ui">{t('联系', 'CONTACT')}</h3>
          <a className="literal" href="mailto:contact@melspectrum.com">contact@melspectrum.com</a>
        </div>
      </div>
      <div className="footer__legal t-ui">
        {/* The legacy footer carried "粤ICP备 0000000000号 · 粤公网安备 00000000000000号"
            — placeholder zeros, live in production. melspectrum.com is hosted on
            GitHub Pages outside mainland China and needs no ICP filing, so the
            line is removed rather than faked. */}
        <span>© 2026 融谱智能科技（深圳）有限公司</span>
        <span>MelSpectrum Technology</span>
      </div>
    </footer>
  );
}
