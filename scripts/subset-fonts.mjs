#!/usr/bin/env node
// source-assets/fonts/*.ttf  ->  app/public/fonts/*.woff2
// Codepoints are harvested from the actual app source, so changing copy and
// forgetting to re-subset is impossible: this runs as step 1 of `npm run build`.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const SRC = 'source-assets/fonts';
const OUT = 'app/public/fonts';
const SCAN_DIRS = ['app/src'];
const SCAN_FILES = ['app/index.html'];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (['.jsx', '.js', '.json', '.css', '.html'].includes(extname(p))) acc.push(p);
  }
  return acc;
}

const files = [...SCAN_DIRS.flatMap((d) => walk(d)), ...SCAN_FILES.filter((f) => existsSync(f))];

// 注释里的中文不会出现在页面上，却会把字形打进子集（实测多出约 50KB）。
// 只影响 CJK 采集：ASCII 下面会全量补齐，所以误删少量注释符无副作用。
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ')      // /* 块注释 */
     .replace(/^\s*\/\/.*$/gm, ' ')            // // 整行注释
     .replace(/<!--[\s\S]*?-->/g, ' ');         // <!-- HTML 注释 -->

let text = files.map((f) => stripComments(readFileSync(f, 'utf8'))).join('');

// Always include ASCII + common punctuation so UI chrome never falls back.
text += ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
text += '·—–…※、。〈〉《》「」『』【】〔〕±≈≠≤≥×÷°′″¢€£¥©®™→←↑↓↗↘⬡';

const cjk = new Set();
const latin = new Set();
for (const ch of text) {
  const cp = ch.codePointAt(0);
  if (cp > 0x2e7f) cjk.add(cp);
  else latin.add(cp);
}

mkdirSync(OUT, { recursive: true });

function subset(file, out, codepoints, extra = []) {
  const unicodes = [...codepoints].map((c) => c.toString(16)).join(',');
  execFileSync('pyftsubset', [
    join(SRC, file),
    `--output-file=${join(OUT, out)}`,
    '--flavor=woff2',
    `--unicodes=${unicodes}`,
    '--layout-features=kern,liga,calt,ccmp,locl',
    '--no-hinting',
    '--desubroutinize',
    ...extra,
  ], { stdio: 'inherit' });
  const kb = (statSync(join(OUT, out)).size / 1024).toFixed(1);
  console.log(`  ${out.padEnd(28)} ${kb.padStart(8)} KB`);
}

console.log('subset-fonts: harvested', latin.size, 'latin +', cjk.size, 'CJK codepoints from', files.length, 'files');
// Inter carries all Latin/punctuation; Noto Sans SC carries only the CJK actually used.
subset('Inter.ttf', 'Inter.woff2', latin);
subset('NotoSansSC.ttf', 'NotoSansSC-subset.woff2', cjk);

const total = readdirSync(OUT).reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
const totalKb = (total / 1024).toFixed(1);
console.log(`subset-fonts: total ${totalKb} KB (target < 250 KB)`);
if (total > 250 * 1024) console.warn('subset-fonts: WARNING over 250 KB target');
