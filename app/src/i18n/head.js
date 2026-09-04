/**
 * 运行时 <head> 元数据同步。
 *
 * ⚠️ 与 app/index.html 里那段内联 IIFE 是同一份数据的两个副本：IIFE 负责
 * 首屏（React 尚未加载时爬虫就能拿到正确 head），本模块负责运行时语言切换。
 * 改动任一处都必须同步另一处。
 */
const META = {
  zh: {
    title: 'MelSpectrum · 融谱智能科技 — 让机器听懂声音',
    desc: '融谱智能科技 MelSpectrum：做声学硬件，也做跑在硬件上的算法。Piano Tuner 实验室测试调律精度 ±2 音分；Somnil 用额部四通道脑电做睡眠分期，公开临床基准 Sleep-EDF 准确率 0.785、κ 0.715。让机器听懂声音。',
    url: 'https://melspectrum.com/',
    locale: 'zh_CN',
    alt: 'en_US',
    htmlLang: 'zh-CN',
  },
  en: {
    title: 'MelSpectrum — Teach Machines to Listen | Acoustic AI',
    desc: 'MelSpectrum builds acoustic hardware and the algorithms that run on it. Piano Tuner: lab-tested ±2-cent tuning accuracy. Somnil: four-channel frontal EEG sleep staging, 0.785 accuracy and κ 0.715 on the Sleep-EDF public clinical benchmark.',
    url: 'https://melspectrum.com/?lang=en',
    locale: 'en_US',
    alt: 'zh_CN',
    htmlLang: 'en',
  },
};

const set = (sel, attr, val) => {
  const el = document.querySelector(sel);
  if (el) el.setAttribute(attr, val);
};

export function syncHead(lang) {
  const m = META[lang] || META.zh;
  document.documentElement.lang = m.htmlLang;
  document.title = m.title;
  set('meta[name="description"]', 'content', m.desc);
  // canonical 指向当前语言自身，避免同时宣称「英文是独立 alternate」和
  // 「英文只是中文 canonical 的重复页」这组自相矛盾的信号
  set('link[rel="canonical"]', 'href', m.url);
  set('meta[property="og:title"]', 'content', m.title);
  set('meta[property="og:description"]', 'content', m.desc);
  set('meta[property="og:url"]', 'content', m.url);
  set('meta[property="og:locale"]', 'content', m.locale);
  set('meta[property="og:locale:alternate"]', 'content', m.alt);
  set('meta[name="twitter:title"]', 'content', m.title);
  set('meta[name="twitter:description"]', 'content', m.desc);
}

/** 让 URL 反映当前语言，否则用户切到英文后分享出去的链接仍是中文页。 */
export function syncUrl(lang) {
  try {
    const u = new URL(window.location.href);
    if (lang === 'en') u.searchParams.set('lang', 'en');
    else u.searchParams.delete('lang');
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  } catch {
    /* 非致命 */
  }
}
