/**
 * 官网允许出现的定量宣称，唯一出处。
 *
 * 治理规则来自 vault `00-公司/官网/website-public-claims.md`：
 * - 每一条都必须能追到来源；追不到的一律不上站。
 * - 睡眠分期 **必须 accuracy 与 κ 同时给**，且必须标明是公开临床基准而非真机。
 * - 调律精度 **不得裸写**，必须带角标 + 同页脚注；无法承载角标的位置
 *   （<title> / meta / 跑马灯）改写成「实验室测试精度」。
 *
 * 2026-09-04 普查撤下的几条（查无出处或与实测矛盾，不要再加回来）：
 *   SNR > 70 dB      —— 全库零匹配；命中的 70 dB 全是声压级，不是信噪比
 *   1.8 M params     —— 库里参数量都在十万量级（116k / 213k / 282k / 297k）
 *   E2E < 50 ms      —— 唯一一份端到端拆解算出来 ≈70 ms，且 epoch 是 30 s 窗口
 *   NOISE < 1 μV     —— 实测好通道 3.1–4.0 µVrms，没有一路低于 1 µV
 *   BAND 500 Hz      —— 部署配置标称 250 Hz、实测 222.4 Hz；500 SPS 档从未上机
 *   Mel / CWT        —— Somnil 仓库零 Mel；CWT 被自家代码明确否决（constant-Q 等价）
 */

export const tuning = {
  // 实验室测试结果，不是量产验证结果。角标与脚注是强制的。
  accuracyCents: 2,
  noteZh: '实验室测试结果。测试条件与量产版本、真实琴况均可能不同，最终性能以量产版本验证结果为准。',
  noteEn: 'Lab-tested result. Test conditions may differ from the production version and from real pianos; final performance is whatever the production version verifies.',
};

/** Stage-1 Gen5（部署中）被试级 GroupKFold 留出，Viterbi 解码。 */
export const staging = {
  source: 'somnil/results/stage1_heldout_kappa_gen5.json',
  sets: [
    { key: 'sleep-edf', name: 'Sleep-EDF', acc: 0.785, kappa: 0.715 },
    { key: 'cap', name: 'CAP', acc: 0.761, kappa: 0.683 },
  ],
  noteZh: '公开临床基准（Sleep-EDF 健康人群 / CAP 七类病理人群）被试级留出结果，非真机验证。',
  noteEn: 'Subject-wise held-out results on public clinical benchmarks (Sleep-EDF, healthy; CAP, seven pathologies). Not a validation on our own hardware.',
};

/** 额部四通道导联。市面睡眠可穿戴多是 PPG/加速度，这一条才是真差异。 */
export const montage = ['Fp1', 'Fp2', 'F7', 'F8'];
