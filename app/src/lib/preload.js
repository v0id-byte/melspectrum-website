/**
 * 真实字节级预加载。
 *
 * 进度条必须反映真实加载量——假的定时动画走到 90% 卡住是最糟的观感，
 * 而且与全站「不伪造数据」的原则冲突。这里用 fetch + ReadableStream
 * 累加实际收到的字节；fetch 到的资源进入 HTTP 缓存，随后 CSS 的
 * @font-face 与 <img> 直接命中，不会二次下载。
 */

/** 需要在首屏之前备齐的关键资源。将来的重型资源（如三维地球）也加进这里。 */
export const CRITICAL_ASSETS = [
  { url: '/fonts/Inter.woff2', zh: '加载西文字体', en: 'LOADING LATIN TYPEFACE', bytes: 43736 },
  { url: '/fonts/NotoSansSC-subset.woff2', zh: '加载中文字体子集', en: 'LOADING CJK SUBSET', bytes: 96640 },
  { url: '/images/hero-bg.webp', zh: '解码产品渲染图', en: 'DECODING PRODUCT RENDER', bytes: 97538 },
];

/** 任何一项失败都不能把用户永久挡在遮罩后面。 */
const HARD_TIMEOUT_MS = 8000;

export function preloadAll({ onProgress, onStage }) {
  const expected = CRITICAL_ASSETS.reduce((n, a) => n + a.bytes, 0);
  let loaded = 0;
  let settled = false;

  const report = () => onProgress?.(Math.min(1, expected ? loaded / expected : 1));

  const one = async (asset) => {
    onStage?.(asset);
    try {
      const res = await fetch(asset.url, { cache: 'force-cache' });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += value.length;
        loaded += value.length;
        report();
      }
      // 声明体积与实际不符时补齐差额，避免进度条停在 97%
      if (got < asset.bytes) { loaded += asset.bytes - got; report(); }
    } catch {
      // 失败也要计入，否则进度永远到不了 100%
      loaded += asset.bytes;
      report();
    }
  };

  return new Promise((resolve) => {
    const finish = () => { if (!settled) { settled = true; onProgress?.(1); resolve(); } };
    const timer = setTimeout(finish, HARD_TIMEOUT_MS);

    (async () => {
      // 串行加载，让阶段文案能真实对应当前正在下载的东西
      for (const a of CRITICAL_ASSETS) await one(a);
      // 字体真正可用要等 FontFace 解析完，不只是字节到齐
      try { await document.fonts?.ready; } catch { /* 忽略 */ }
      clearTimeout(timer);
      finish();
    })();
  });
}

const SEEN_KEY = 'ms_preloaded';

/** 同一会话内刷新不再重复展示；换标签页/重开浏览器会再显示一次。 */
export function alreadyPreloaded() {
  try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}
export function markPreloaded() {
  try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* 隐私模式忽略 */ }
}
