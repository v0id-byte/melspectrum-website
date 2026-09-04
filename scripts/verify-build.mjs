#!/usr/bin/env node
// 构建产物校验。既可作为 CLI（verify-build.mjs <dir>），也可被 publish-build.mjs
// 直接 import —— 后者需要在删除备份之前就地校验根目录，否则 verify:root 只是验尸。
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GENERATED, PRESERVED } from './paths.mjs';

// dist/ 与 src/ 是上一轮实现的遗留分叉，已 gitignore / 待清理，不会被 Pages 服务。
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'app', 'source-assets', 'scripts',
  'build-stage', '.publish-backup', 'dist', 'src',
]);

/** 内容治理红线：这些字样绝不允许出现在投产物里。 */
const FORBIDDEN_STRINGS = [
  { pattern: /粤ICP备|公网安备|ICP备/, why: 'ICP 备案号（曾是占位零，站点在境外托管无需备案）' },
  { pattern: /PHOTO PLACEHOLDER/i, why: '团队头像占位文本' },
  { pattern: /\bRPKI\b/i, why: 'RPKI（该 ASN 的 ROA 状态为 unknown，提及等于自曝）' },
  { pattern: /[<＜]\s*10\s*ms/, why: '<10 ms（与全站 <50 ms 自相矛盾）' },
  { pattern: /Qin Liuhaoran/, why: '旧拼音署名（应为 Soren Qin）' },
  { pattern: /sub-second failover|亚秒级(故障)?切换/, why: 'BFD 检测 ≠ 端到端收敛，属过度声明' },
];

function walk(dir, root, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    if (SKIP_DIRS.has(n) || n.startsWith('.')) continue; // 先剪枝再递归，别走进 node_modules
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, root, acc);
    else acc.push(f);
  }
  return acc;
}

export function verifyBuild(dir, { writeManifest = true } = {}) {
  const isRoot = dir === '.';
  const base = isRoot ? '.' : dir;
  const p = (...x) => join(dir, ...x);
  const fail = [];

  // 1. 入口存在，且引用的本地产物都在
  if (!existsSync(p('index.html'))) {
    fail.push('缺少 index.html');
  } else {
    const html = readFileSync(p('index.html'), 'utf8');
    for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
      const ref = m[1].replace(/^\//, '');
      if (/^(assets|fonts|images)\//.test(ref) && !existsSync(p(ref))) fail.push(`悬空引用: /${ref}`);
    }
    if (!/<title>/.test(html)) fail.push('index.html 没有 <title>');
  }

  // 2. 静态源确实经由 app/public/ 流转过来
  for (const f of ['robots.txt', 'sitemap.xml']) {
    if (!existsSync(p(f))) fail.push(`缺少 ${f}（应来自 app/public/）`);
  }

  // 3. 原始素材不得泄漏进可部署树
  const files = walk(base, base);
  for (const f of files) {
    const rel = relative(base, f);
    if (extname(rel) === '.ttf') fail.push(`原始字体泄漏: ${rel}`);
    if (/\.source\./.test(rel)) fail.push(`原始图片泄漏: ${rel}`);
  }

  // 4. 内容治理红线（防回归：这些曾经清理掉的字样不能再漂回来）
  const textFiles = files.filter((f) => /\.(html|js|css|txt|xml|json)$/.test(f) && !/build-manifest\.json$/.test(f));
  for (const f of textFiles) {
    const body = readFileSync(f, 'utf8');
    for (const { pattern, why } of FORBIDDEN_STRINGS) {
      if (pattern.test(body)) fail.push(`禁用内容出现在 ${relative(base, f)}：${why}`);
    }
  }

  // 5. 校验根目录时，preserved 文件必须还在
  if (isRoot) for (const f of PRESERVED) if (!existsSync(f)) fail.push(`PRESERVED 文件丢失: ${f}`);

  // 6. 产物清单
  const manifest = {};
  for (const g of GENERATED) {
    if (g === 'build-manifest.json') continue;
    const target = p(g);
    if (!existsSync(target)) continue;
    const list = statSync(target).isDirectory() ? walk(target, base) : [target];
    for (const f of list) manifest[relative(base, f)] = createHash('sha256').update(readFileSync(f)).digest('hex');
  }

  // manifest 是「验证通过」的凭证，publish 以它为门禁，因此只能在全部断言通过后写出
  if (fail.length) {
    rmSync(p('build-manifest.json'), { force: true });
    return { ok: false, failures: fail, manifest: null };
  }
  if (writeManifest) writeFileSync(p('build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { ok: true, failures: [], manifest };
}

// --- CLI ---
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2];
  if (!dir) { console.error('用法: verify-build.mjs <dir>'); process.exit(2); }
  const { ok, failures, manifest } = verifyBuild(dir);
  if (!ok) {
    console.error(`verify-build(${dir}): 失败`);
    for (const f of failures) console.error('  ✗ ' + f);
    process.exit(1);
  }
  console.log(`verify-build(${dir}): ok — 已校验 ${Object.keys(manifest).length} 个产物`);
}
