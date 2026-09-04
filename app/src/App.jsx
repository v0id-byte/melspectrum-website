import Nav from './components/Nav';
import Hero from './components/Hero';
import Thesis from './components/Thesis';
import Marquee from './components/Marquee';
import Products from './components/Products';
import Stack from './components/Stack';
import Network from './components/Network';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Progress from './components/Progress';
import Preloader from './components/Preloader';
import { useCallback, useState } from 'react';
import { useNavTheme } from './lib/useNavTheme';
import { alreadyPreloaded } from './lib/preload';
import { useT } from './i18n';

export default function App() {
  // 一次性把关键资源备齐再放行：与其让用户在滚动中遇到半成品，不如先加载完。
  // 同一会话内刷新不再重复展示。
  const [booting, setBooting] = useState(() => !alreadyPreloaded());
  const finishBoot = useCallback(() => setBooting(false), []);
  const theme = useNavTheme();
  // 进度条在视口底部，按底部所处区块取色（实测约 24% 行程会与背景同色而隐形）
  const bottomTheme = useNavTheme(typeof window !== 'undefined' ? window.innerHeight - 8 : 800);
  const { t, lang } = useT();

  return (
    <>
      {booting ? <Preloader onDone={finishBoot} /> : null}
      <a className="skip-link t-ui" href="#main">{t('跳到主要内容', 'Skip to content')}</a>
      <Nav theme={theme} />
      {/* key={lang}：SplitText 会把标题 DOM 改造成 .split-line，其 revert()
          恢复的是「拆分前的旧语言快照」，且在 React 更新 DOM 之后才运行，
          结果是新语言被旧快照覆盖。整棵子树按语言重挂载是唯一干净的解法。 */}
      <main id="main" key={lang}>
        <Hero />
        <div className="gasket" aria-hidden="true" />
        <Thesis />
        <Marquee />
        <Products />
        <div className="gasket" aria-hidden="true" />
        <Stack />
        <Network />
        <div className="gasket" aria-hidden="true" />
        <Team />
        <Contact />
        <div className="gasket" aria-hidden="true" />
        <Footer />
      </main>
      <Progress theme={bottomTheme} />
    </>
  );
}
