import { useT } from '../i18n';

export function Arrow() {
  return (
    <svg viewBox="0 0 11 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M1 5H10M10 5L6 0.5M10 5L6 9.5" />
    </svg>
  );
}

/** [ LABEL → ] — the site's default call to action. */
export function BracketLink({ href, children, external = false, highlight = false }) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={`blink t-ui${highlight ? ' hl' : ''}`} href={href} {...ext}>
      <span aria-hidden="true">[</span>
      <span>{children}</span>
      <Arrow />
      <span aria-hidden="true">]</span>
    </a>
  );
}

export function Button({ href, children, variant = 'accent', external = false }) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={`btn btn--${variant} t-ui`} href={href} {...ext}>
      <span>{children}</span>
      <i aria-hidden="true" />
    </a>
  );
}

export function Eyebrow({ children, plain = false }) {
  return <span className={`t-ui eyebrow${plain ? ' eyebrow--plain' : ''}`}>{children}</span>;
}

/**
 * Section heading block. `reveal` marks lines for the motion layer; the base
 * state is always visible, so a failed motion init degrades to plain text.
 */
export function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="sec-head grid-custom">
      <div className="sec-head__eyebrow">
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="t-h2 reveal-text">{title}</h2>
      {sub ? <p className="t-body">{sub}</p> : null}
    </div>
  );
}

export function useLang() {
  return useT();
}
