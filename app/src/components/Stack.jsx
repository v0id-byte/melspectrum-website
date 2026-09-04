import { useCallback, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useSteps } from '../lib/motion/hooks';
import { SectionHead } from './ui';
import { staging, montage } from '../data/metrics';

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
      title: t('两条采集路径', 'Two sensing front-ends'),
      desc: t(
        'Piano Tuner 听的是琴弦本身的声音；Somnil 读的是额头上的四路脑电。前端不同——一条是声学，一条是生物电——但后面的信号处理与端侧推理是同一套。',
        'Piano Tuner listens to the strings themselves; Somnil reads four channels of EEG across the forehead. One front-end is acoustic, the other bioelectric — but everything behind them, the signal processing and the on-device inference, is the same.',
      ),
      data: [t('声学 · ACOUSTIC', 'ACOUSTIC'), t('脑电 · EEG', 'EEG'), montage.join(' / ')],
    },
    {
      key: 'int',
      num: '02 · INTELLIGENCE',
      title: t('AI 算法', 'AI algorithms'),
      desc: t(
        '睡眠分期跑的是 ResNet1D 加逐受试者 HMM，输入是 30 秒一段的单通道波形；实时那条路径用因果前向滤波，实测追平了只能事后跑的 Viterbi。模型转成 CoreML，在手机上推理，不上云。',
        'Sleep staging runs a ResNet1D with a per-subject HMM over single-channel, thirty-second windows. The real-time path uses causal forward filtering, which in our own measurements matches the Viterbi pass that can only run after the fact. The model ships as CoreML and runs on the phone — nothing goes to a server.',
      ),
      data: ['RESNET1D + HMM', t('因果前向滤波', 'CAUSAL FILTERING'), t('端侧 CoreML', 'ON-DEVICE COREML')],
    },
    {
      key: 'del',
      num: '03 · DELIVERY',
      title: t('固件与升级', 'Firmware and updates'),
      desc: t(
        '自研低功耗蓝牙固件，把提取好的特征送到手机。真正难的不是把包发出去，是升级失败时能干净地退回去——双向升级与回滚已经跑通端到端验证。',
        'In-house low-energy Bluetooth firmware carries the extracted features to the phone. The hard part was never sending the packets; it is coming back cleanly when an update fails — two-way update and rollback have passed end-to-end verification.',
      ),
      data: [t('自研 BLE 固件', 'IN-HOUSE BLE FIRMWARE'), t('OTA 双向回滚', 'TWO-WAY OTA ROLLBACK'), t('端到端已验证', 'END-TO-END VERIFIED')],
    },
  ];


  return (
    <section id="tech" className="island-dark p-custom py-section" data-nav-theme="dark" ref={root}>
      <SectionHead
        eyebrow={t('THE STACK · 三层链路', 'THE STACK')}
        title={t('同一种能力，两种产品形态。', 'One capability, two product forms.')}
        sub={t(
          '采集 → 端侧推理 → 交付。两个产品在最前面那一层分开走，之后共用同一条链路。',
          'Sensing → on-device inference → delivery. The two products diverge only at the very first layer; everything after it they share.',
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
