#!/usr/bin/env node
// source-assets/images/*  ->  app/public/images/*
// Originals are never deployed. The hero render has a ~10% flat grey band across
// the top (render viewport artifact); we crop it off here rather than hiding it
// behind a CSS scrim, so the asset itself is correct.
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'source-assets/images';
const OUT = 'app/public/images';
mkdirSync(OUT, { recursive: true });

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
const size = (p) => (statSync(p).size / 1024).toFixed(1) + ' KB';

// --- hero background: crop the top 11% grey band, re-encode webp ---
const heroSrc = join(SRC, 'hero-bg.source.webp');
if (existsSync(heroSrc)) {
  const tmpPng = '/tmp/ms-hero.png';
  const dims = sh('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', heroSrc]);
  const w = +dims.match(/pixelWidth:\s*(\d+)/)[1];
  const h = +dims.match(/pixelHeight:\s*(\d+)/)[1];
  const cropTop = Math.round(h * 0.11);
  const newH = h - cropTop;
  sh('sips', ['-s', 'format', 'png', heroSrc, '--out', tmpPng]);
  // sips crops from the center, so offset by cropping to newH anchored at bottom:
  sh('sips', ['--cropOffset', String(Math.round(cropTop / 2)), '0', '-c', String(newH), String(w), tmpPng]);
  execFileSync('cwebp', ['-q', '82', '-quiet', tmpPng, '-o', join(OUT, 'hero-bg.webp')], { stdio: 'inherit' });
  console.log(`  hero-bg.webp  ${w}x${newH} (cropped ${cropTop}px band)  ${size(join(OUT, 'hero-bg.webp'))}`);
}

// --- favicons / touch icon / og image pass through unchanged ---
for (const f of ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'logo.png', 'og-image.png']) {
  const s = join(SRC, f);
  if (existsSync(s)) { copyFileSync(s, join(OUT, f)); console.log(`  ${f}  ${size(join(OUT, f))}`); }
}
