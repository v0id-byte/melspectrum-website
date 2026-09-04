import { useCallback, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useSteps } from '../lib/motion/hooks';
import { SectionHead } from './ui';

export default function Stack() {
  const { t, lang } = useT();
  const root = useRef(null);
  const stepsRef = useRef(null);
  const [active, setActive] = useState(0);
  const onStep = useCallback((i) => setActive(i), []);
  useTextReveal(root, lang);
  useReveal(root, lang);
  useSteps(stepsRef, onStep, lang);
  const steps = [
    {
      key: 'acq',
      num: '01 · ACQUISITION',
      title: t('声学采集', 'Acoustic sensing'),
      desc: t(
        'MEMS 麦克风阵列，配低噪声模拟前端。嘈杂的家里也能锁住目标频段 —— 算法能不能听懂，先看这一关。',
        'A MEMS microphone array behind a low-noise analog front-end. It holds the target band even in a noisy home — whether the algorithm understands anything is decided here first.',
      ),
      data: ['BAND 500 Hz', 'NOISE < 1μV', 'SNR > 70 dB'],
    },
    {
      key: 'int',
      num: '02 · INTELLIGENCE',
      title: t('AI 算法', 'AI algorithms'),
      desc: t(
        'Mel 频谱、STFT、CWT，三种时频视角同时看同一段声音；端侧的小网络在这些特征上做分类与回归。训练与验证都在公开临床数据集上完成。',
        'Mel-spectrogram, STFT and CWT give three views of the same second of sound; a small on-device network reads them for classification and regression. Trained and validated on public clinical datasets.',
      ),
      data: ['~80% staging acc', '1.8 M params', 'ON-DEVICE'],
    },
    {
      key: 'del',
      num: '03 · DELIVERY',
      title: t('BLE 通信', 'BLE delivery'),
      desc: t(
        '自研低功耗蓝牙固件与 OTA 协议，把提取好的特征实时送到手机。端到端 <50 ms，落在人感知不到的区间里。',
        'In-house BLE firmware and OTA protocol carry the extracted features to the phone in real time. Under 50 ms end to end — below the threshold of perception.',
      ),
      data: ['BLE 5.0', 'E2E <50 ms', 'OTA · SECURE'],
    },
  ];

  return (
    <section id="tech" className="island-dark p-custom py-section" data-nav-theme="dark" ref={root}>
      <SectionHead
        eyebrow={t('THE STACK · 三层链路', 'THE STACK')}
        title={t('同一种能力，两种产品形态。', 'One capability, two product forms.')}
        sub={t(
          '声学采集 → AI 推理 → 无线交付。三层叠在一起，才是「让机器听懂声音」的全部含义。',
          'Acoustic sensing → on-device inference → wireless delivery. Only stacked together do they let a machine truly hear.',
        )}
      />
      <div className="steps" ref={stepsRef}>
        {steps.map((s, i) => (
          <article className={`step${active === i ? ' step--active' : ''}`} key={s.key} data-step={i}>
            <span className="card__num t-ui">{s.num}</span>
            <h3 className="t-h3">{s.title}</h3>
            <p className="card__desc t-body-sm">{s.desc}</p>
            <div className="step__data t-ui">
              {s.data.map((d) => <span key={d}>{d}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
