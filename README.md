# MelSpectrum 融谱智能科技

官网原型 · melspectrum.com

## 技术栈

- 纯 HTML + CSS + Vanilla JS
- CSS 变量管理颜色体系
- IntersectionObserver 滚动动画
- Canvas 频谱动画
- 移动端 Hamburger 菜单

## 设计规范

| 变量 | 值 | 用途 |
|------|----|------|
| `--bg` | `#0A0A0F` | 背景 |
| `--accent` | `#FF4500` | 强调色（Somnil） |
| `--accent-cool` | `#4A9EFF` | 冷调点缀（Piano Tuner） |

字体：Inter + Space Grotesk（中文 fallback 思源黑体）

## 部署

推送到 `gh-pages` 分支即可自动部署。

```
git push origin main
```

GitHub Pages: https://v0id-byte.github.io/melspectrum-website/