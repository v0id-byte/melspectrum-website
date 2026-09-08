import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { Button } from './ui';

const LINKS = [
  { href: '#products', zh: '产品', en: 'Products' },
  { href: '#tech', zh: '技术', en: 'Technology' },
  { href: '#network', zh: '网络', en: 'Network' },
  { href: '#team', zh: '团队', en: 'Team' },
];

function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <div className="lang-toggle t-ui">
      <button
        type="button"
        aria-pressed={lang === 'zh'}
        aria-label="切换到中文"
        onClick={() => setLang('zh')}
      >
        中
      </button>
      <button
        type="button"
        aria-pressed={lang === 'en'}
        aria-label="Switch to English"
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}

/**
 * Mobile menu built on native <dialog>: modal focus containment, ESC, and top
 * layer come for free. We still own scroll-lock (Lenis + body) and focus return.
 */
function MobileMenu({ open, onClose, openerRef }) {
  const ref = useRef(null);
  const { t } = useT();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      // showModal() 才有原生 ESC 与 top-layer；若因状态竞态已是 open 属性
      // 打开（非 modal），先关掉再以 modal 方式重开，否则 ESC 不生效。
      try {
        el.showModal();
      } catch {
        el.close();
        el.showModal();
      }
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // 兜底：某些浏览器/状态下 dialog 的原生 ESC 不触发 close 事件
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); ref.current?.close(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleClose = useCallback(() => {
    document.body.style.overflow = '';
    window.__lenis?.start();
    openerRef.current?.focus();
    onClose();
  }, [onClose, openerRef]);

  return (
    <dialog className="menu" ref={ref} onClose={handleClose} aria-label={t('主菜单', 'Main menu')}>
      <div className="menu__inner">
        <div className="menu__top">
          <span className="t-ui">MENU</span>
          <button type="button" className="menu__close t-ui" onClick={() => ref.current?.close()}>
            {t('关闭', 'Close')} ✕
          </button>
        </div>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => ref.current?.close()}>
            {t(l.zh, l.en)}
          </a>
        ))}
        <a href="#network" onClick={() => ref.current?.close()}>AS218883</a>
        <div className="menu__foot">
          <LangToggle />
          <Button href="mailto:contact@melspectrum.com">{t('联系我们', 'Get in touch')}</Button>
        </div>
      </div>
    </dialog>
  );
}

export default function Nav({ theme = 'dark' }) {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);

  return (
    <>
      <div className="nav-frame">
        <nav className="nav" data-theme={theme} aria-label={t('主导航', 'Primary')}>
          <a className="nav__brand" href="#top">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="nav__mark" width="20" height="20" aria-hidden="true" focusable="false"><g fill="currentColor" color="currentColor"><mask id="ms-m-standard-nav"><rect width="32" height="32" fill="#fff"/><path d="M10.5 10.75 C10.896 10.75 10.83 11.725 11.82 10.75 C12.81 9.775 12.546 7.841 13.8 7.5 C15.054 7.159 14.68 9.613 16 9.613 C17.32 9.613 16.946 7.159 18.2 7.5 C19.454 7.841 19.19 9.775 20.18 10.75 C21.17 11.725 21.104 10.75 21.5 10.75" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></mask><g mask="url(#ms-m-standard-nav)"><path d="M6 13 a10 10 0 0 1 20 0 Z"/><rect x="6.072" y="13" width="19.855" height="2.4"/><rect x="7.008" y="16.5" width="17.984" height="1.75"/><rect x="9.034" y="19.55" width="13.931" height="1.25"/><rect x="13.778" y="22.3" width="4.444" height="0.9"/></g></g></svg>
            <span className="nav__name">MelSpectrum</span>
            <span aria-hidden="true">融谱智能</span>
          </a>
          <div className="nav__spacer" />
          <div className="nav__links t-ui">
            {LINKS.map((l) => (
              <a key={l.href} className="nav__link" href={l.href}>
                {t(l.zh, l.en)}
              </a>
            ))}
          </div>
          <a
            className="nav__asn t-ui"
            href="#network"
            title={t('我们运营的自治域 AS218883', 'AS218883 — our autonomous system')}
          >
            AS218883
          </a>
          <LangToggle />
          <div className="nav__links">
            <Button href="mailto:contact@melspectrum.com">{t('联系我们', 'Get in touch')}</Button>
          </div>
          <button
            type="button"
            ref={burgerRef}
            className="nav__burger"
            aria-label={t('打开菜单', 'Open menu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <i /><i /><i />
          </button>
        </nav>
      </div>
      <div id="mobile-menu">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} openerRef={burgerRef} />
      </div>
    </>
  );
}
