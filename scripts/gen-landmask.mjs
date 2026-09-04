#!/usr/bin/env node
// 构建期把世界陆地烘焙成 1-bit 掩码 → app/src/data/landmask.js
//
// 为什么不用 three.js / three-globe / globe.gl：实测它们分别是 110–180KB、
// 354KB、480KB gzip，而这里只要约 3KB，且产出的点阵用方块渲染，比圆点更贴合
// 全站「零圆角」的语言。海岸线来自 Natural Earth 110m，是真实数据不是手绘。
//
// 多边形判定放在构建期，运行时只做「查一个 bit」，零运行时几何计算。
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'source-assets/geo/countries-110m.json';
const OUT = 'app/src/data/landmask.js';
const W = 512;
const H = 256;

const topo = JSON.parse(readFileSync(SRC, 'utf8'));
const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;

// TopoJSON 的 arc 是差分编码的，先还原成绝对经纬度
const arcs = topo.arcs.map((a) => {
  let x = 0; let y = 0;
  return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const arcOf = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
const ringOf = (ids) => ids.flatMap((i, k) => { const a = arcOf(i); return k ? a.slice(1) : a; });

const polys = [];
for (const g of topo.objects.land.geometries) {
  if (g.type === 'Polygon') polys.push(g.arcs.map(ringOf));
  else if (g.type === 'MultiPolygon') for (const p of g.arcs) polys.push(p.map(ringOf));
}

// ray casting；第 0 环是外边界，其余是洞（内陆湖）
const inRing = (pt, r) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i]; const [xj, yj] = r[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const isLand = (pt) => polys.some((p) => inRing(pt, p[0]) && !p.slice(1).some((h) => inRing(pt, h)));

const bytes = new Uint8Array((W * H) >> 3);
let land = 0;
for (let j = 0; j < H; j++) {
  const lat = 90 - (j + 0.5) * (180 / H);
  for (let i = 0; i < W; i++) {
    const lon = -180 + (i + 0.5) * (360 / W);
    if (isLand([lon, lat])) { const b = j * W + i; bytes[b >> 3] |= 128 >> (b & 7); land++; }
  }
}

const b64 = Buffer.from(bytes).toString('base64');
writeFileSync(OUT,
  `// 本文件由 scripts/gen-landmask.mjs 生成，请勿手工编辑。\n`
  + `// 数据源：Natural Earth 110m（world-atlas），构建期烘焙为 1-bit 等距圆柱投影掩码。\n`
  + `export const MASK_W = ${W};\n`
  + `export const MASK_H = ${H};\n`
  + `export const MASK_B64 = '${b64}';\n`);

console.log(`gen-landmask: ${W}x${H}  陆地占比 ${(land / (W * H) * 100).toFixed(1)}%  base64 ${(b64.length / 1024).toFixed(1)} KB`);
