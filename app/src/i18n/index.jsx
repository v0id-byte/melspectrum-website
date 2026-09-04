import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { syncHead, syncUrl } from './head';

const LangCtx = createContext({ lang: 'zh', setLang: () => {}, t: (zh) => zh });

function resolveInitialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
    const stored = window.localStorage.getItem('ms_lang');
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {
    /* private mode / blocked storage — fall through to default */
  }
  return 'zh';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(resolveInitialLang);

  useEffect(() => {
    document.documentElement.dataset.lang = lang;
    // head 元数据必须随运行时切换更新，否则英文访客分享出去的卡片仍是中文
    syncHead(lang);
    syncUrl(lang);
    try {
      window.localStorage.setItem('ms_lang', lang);
    } catch {
      /* non-fatal */
    }
  }, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t: (zh, en) => (lang === 'en' && en !== undefined ? en : zh) }),
    [lang],
  );
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useT = () => useContext(LangCtx);
