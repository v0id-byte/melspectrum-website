import { useEffect, useRef } from 'react';
import { networkSnapshot as N } from '../data/network';
import { MASK_W, MASK_H, MASK_B64 } from '../data/landmask';

// 我们实际运营的三个路由控制面端点的真实经纬度
const COORDS = { AMS: [52.37, 4.90], SLC: [40.76, -111.89], LAX: [34.05, -118.24] };

/**
 * 陆地点阵：模块级只算一次。
 *
 * 用 Fibonacci 球面等面积采样，再按构建期烘焙的 1-bit 掩码筛出落在陆地上的点。
 * 不引入 three.js / three-globe / globe.gl —— 实测它们分别是 110–180KB、354KB、
 * 480KB gzip，而这套方案只要约 3KB，且点用方块渲染，比圆点更贴合全站零圆角语言。
 */
const LAND = (() => {
  const bin = atob(MASK_B64);
  const bits = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bits[i] = bin.charCodeAt(i);
  const N_SAMPLES = 16000;              // 约 30% 命中 → ~4800 个陆地点
  const GA = Math.PI * (3 - Math.sqrt(5));
  const out = [];
  for (let i = 0; i < N_SAMPLES; i += 1) {
    const y = 1 - (i / (N_SAMPLES - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * GA;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const lat = Math.asin(y);
    const lon = Math.atan2(z, x);
    const col = Math.min(MASK_W - 1, (((lon + Math.PI) / (2 * Math.PI)) * MASK_W) | 0);
    const row = Math.min(MASK_H - 1, (((Math.PI / 2 - lat) / Math.PI) * MASK_H) | 0);
    const b = row * MASK_W + col;
    if (bits[b >> 3] & (128 >> (b & 7))) out.push(x, y, z);
  }
  return new Float32Array(out);
})();

/** 稀疏"天空点"层，制造视差微光 */
const SKY = (() => {
  const n = 800;
  const GA = Math.PI * (3 - Math.sqrt(5));
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * GA;
    out[i * 3] = Math.cos(th) * r;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.sin(th) * r;
  }
  return out;
})();

const toVec = (lat, lon) => {
  const p = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};

/** 两点间大圆弧（slerp），代表 iBGP 全互联的真实拓扑 */
function greatArc(a, b, segs = 64) {
  const A = toVec(...a);
  const B = toVec(...b);
  const dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  const om = Math.acos(dot);
  const pts = [];
  if (om < 1e-6) return pts;
  for (let i = 0; i <= segs; i += 1) {
    const t = i / segs;
    const s1 = Math.sin((1 - t) * om) / Math.sin(om);
    const s2 = Math.sin(t * om) / Math.sin(om);
    pts.push([A[0] * s1 + B[0] * s2, A[1] * s1 + B[1] * s2, A[2] * s1 + B[2] * s2]);
  }
  return pts;
}

const ARCS = (() => {
  const codes = Object.keys(COORDS);
  const out = [];
  for (let i = 0; i < codes.length; i += 1) {
    for (let j = i + 1; j < codes.length; j += 1) {
      out.push(greatArc(COORDS[codes[i]], COORDS[codes[j]]));
    }
  }
  return out;
})();

/**
 * 装饰性可视化，aria-hidden。它描绘的每个事实（三个 POP、互联拓扑）在
 * <Network/> 里都有对应的真实 DOM 文本，canvas 消失不丢任何信息。
 */
export default function Globe({ className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallMq = window.matchMedia('(max-width: 767px)');

    let raf = 0;
    let spin = 0;
    let last = 0;
    let inView = false;
    let w = 0;
    let h = 0;
    let R = 0;

    const isStatic = () => reducedMq.matches || smallMq.matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // 填充率封顶
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.42;
    };

    // 绕 Y 轴旋转后做正交投影；只画正面（z>0）
    const project = (v, rot, radius) => {
      const cs = Math.cos(rot); const sn = Math.sin(rot);
      const xr = v[0] * cs + v[2] * sn;
      const zr = -v[0] * sn + v[2] * cs;
      return { x: w / 2 + xr * radius, y: h / 2 - v[1] * radius, z: zr };
    };

    const drawPoints = (arr, rot, radius, size, alpha) => {
      ctx.fillStyle = '#2DD4BF';
      for (let i = 0; i < arr.length; i += 3) {
        const p = project([arr[i], arr[i + 1], arr[i + 2]], rot, radius);
        if (p.z <= 0.02) continue;
        ctx.globalAlpha = alpha * (0.28 + 0.72 * p.z); // 深度淡出 = z 轴遮蔽的物理必然
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const drawGraticule = (rot, radius) => {
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.16)';
      ctx.lineWidth = 0.6;
      for (let latD = -60; latD <= 60; latD += 20) {
        ctx.beginPath(); let on = false;
        for (let lonD = -180; lonD <= 180; lonD += 4) {
          const p = project(toVec(latD, lonD), rot, radius);
          if (p.z <= 0) { on = false; continue; }
          if (!on) { ctx.moveTo(p.x, p.y); on = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (let lonD = -180; lonD < 180; lonD += 20) {
        ctx.beginPath(); let on = false;
        for (let latD = -90; latD <= 90; latD += 4) {
          const p = project(toVec(latD, lonD), rot, radius);
          if (p.z <= 0) { on = false; continue; }
          if (!on) { ctx.moveTo(p.x, p.y); on = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    };

    const drawArcs = (rot, radius) => {
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]); // 与全站 1px 虚线语言一致
      for (const arc of ARCS) {
        ctx.beginPath(); let on = false;
        for (const v of arc) {
          const p = project(v, rot, radius * 1.005);
          if (p.z <= 0) { on = false; continue; }
          if (!on) { ctx.moveTo(p.x, p.y); on = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    const drawPops = (rot, radius, pulse) => {
      for (const p of N.routingPresence) {
        const c = COORDS[p.code];
        if (!c) continue;
        const q = project(toVec(c[0], c[1]), rot, radius);
        if (q.z <= 0) continue;
        ctx.fillStyle = 'rgba(45, 212, 191, 0.95)';
        ctx.fillRect(q.x - 3, q.y - 3, 6, 6);
        // 方框扩散而非圆环 —— 呼应零圆角。纯装饰节拍，不代表任何实时事件。
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.45 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        const s = 6 + 12 * pulse;
        ctx.strokeRect(q.x - s / 2, q.y - s / 2, s, s);
      }
    };

    const draw = (pulse = 0) => {
      ctx.clearRect(0, 0, w, h);
      drawGraticule(spin * 1.667, R * 1.017);        // 转速比 3 : 5 : 2
      drawPoints(SKY, spin * 0.667, R * 1.026, 1, 0.10);
      drawPoints(LAND, spin, R, Math.max(1, R * 0.0075), 1);
      drawArcs(spin, R);
      drawPops(spin, R, pulse);
    };

    const tick = (now) => {
      // 必须按时间推进：直接 spin += 常数 会让 120Hz 屏转速翻倍、掉帧时又变慢
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      spin += 0.06 * dt;
      draw(0.5 + 0.5 * Math.sin((now / 1000) * Math.PI));
      raf = requestAnimationFrame(tick);
    };

    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } last = 0; };
    const start = () => { if (!raf && !isStatic()) raf = requestAnimationFrame(tick); };
    // 离屏与页面不可见是两件事，都要停
    const sync = () => { if (inView && !document.hidden) start(); else stop(); };

    resize();
    draw(0);

    const io = new IntersectionObserver((es) => {
      inView = es.some((e) => e.isIntersecting);
      sync();
    }, { rootMargin: '16px 0px' });
    io.observe(canvas);

    const onResize = () => { resize(); draw(0); if (!isStatic()) sync(); };
    // 媒体查询变化要能动态生效，不能只在挂载时读一次
    const onMedia = () => { stop(); resize(); draw(0); sync(); };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', sync);
    reducedMq.addEventListener('change', onMedia);
    smallMq.addEventListener('change', onMedia);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', sync);
      reducedMq.removeEventListener('change', onMedia);
      smallMq.removeEventListener('change', onMedia);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
