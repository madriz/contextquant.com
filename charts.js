// Small dependency-free SVG charts for the ContextQuant site (dark theme).
// Colors validated with the dataviz palette checker against the #0a1018 surface: #3fa863 / #5b8dd9.
(function () {
  const C = { flag: '#3fa863', base: '#5b8dd9', grid: 'rgba(255,255,255,0.07)', ink: '#a3acbd', muted: '#6b7689', text: '#e8ecf2', surface: '#0a1018' };
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function tipFor(box) { let t = box.querySelector('.tip'); if (!t) { t = document.createElement('div'); t.className = 'tip'; box.appendChild(t); } return t; }
  function showTip(box, html, evt) { const t = tipFor(box); t.innerHTML = html; t.style.display = 'block'; const r = box.getBoundingClientRect();
    let x = evt.clientX - r.left + 14, y = evt.clientY - r.top - 10; if (x + 200 > r.width) x = r.width - 210; t.style.left = x + 'px'; t.style.top = y + 'px'; }
  function hideTip(box) { tipFor(box).style.display = 'none'; }

  // Grouped bars: rows [{label, flag, base, note}] as percentages.
  window.cqBars = function (id, rows, opts) {
    const box = document.getElementById(id); const W = 960, H = 330, m = { t: 20, r: 16, b: 58, l: 46 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': opts.aria }, null);
    box.appendChild(svg);
    const top = Math.max(...rows.map(r => Math.max(r.flag, r.base))); const step = top > 40 ? 10 : 5; const max = Math.ceil(top / step) * step;
    const y = v => m.t + (H - m.t - m.b) * (1 - v / max);
    for (let v = 0; v <= max; v += step) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: C.grid }, svg);
      const t = el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: C.muted }, svg); t.textContent = v + '%'; }
    const gw = (W - m.l - m.r) / rows.length, bw = Math.min(46, gw * 0.28), gap = 2;
    rows.forEach((r, i) => {
      const cx = m.l + gw * i + gw / 2;
      [['flag', r.flag, cx - bw - gap / 2], ['base', r.base, cx + gap / 2]].forEach(([k, v, x]) => {
        const top = y(v), h = y(0) - top, rad = Math.min(4, h);
        const p = el('path', { d: `M${x},${y(0)} V${top + rad} Q${x},${top} ${x + rad},${top} H${x + bw - rad} Q${x + bw},${top} ${x + bw},${top + rad} V${y(0)} Z`, fill: C[k] }, svg);
        const hit = el('rect', { x: x - 4, y: m.t, width: bw + 8, height: y(0) - m.t, fill: 'transparent' }, svg);
        const label = k === 'flag' ? opts.flagLabel : opts.baseLabel;
        hit.addEventListener('mousemove', e => showTip(box, `<b>${r.label}</b><br>${label}: ${v.toFixed(1)}%${k === 'flag' && r.note ? '<br>' + r.note : ''}`, e));
        hit.addEventListener('mouseleave', () => hideTip(box));
        const tv = el('text', { x: x + bw / 2, y: top - 6, 'text-anchor': 'middle', 'font-size': 12, fill: C.text, 'font-family': 'DM Mono, monospace' }, svg); tv.textContent = v.toFixed(1) + '%';
      });
      const words = r.label.split('|');
      words.forEach((w, j) => { const t = el('text', { x: cx, y: H - m.b + 20 + j * 15, 'text-anchor': 'middle', 'font-size': 12, fill: C.ink }, svg); t.textContent = w; });
    });
  };

  // Two-series line: x labels, series [{name, key, values}]
  window.cqLines = function (id, xs, series, opts) {
    const box = document.getElementById(id); const W = 960, H = 300, m = { t: 20, r: 150, b: 40, l: 54 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': opts.aria }, null); box.appendChild(svg);
    const all = series.flatMap(s => s.values); const lo = Math.floor(Math.min(...all, 0) * 10) / 10, hi = Math.ceil(Math.max(...all) * 10) / 10;
    const x = i => m.l + (W - m.l - m.r) * i / (xs.length - 1), y = v => m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo));
    for (let v = lo; v <= hi + 1e-9; v += opts.step) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: Math.abs(v) < 1e-9 ? 'rgba(255,255,255,0.22)' : C.grid }, svg);
      const t = el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: C.muted }, svg); t.textContent = (v > 0 ? '+' : '') + v.toFixed(2); }
    xs.forEach((l, i) => { const t = el('text', { x: x(i), y: H - 14, 'text-anchor': 'middle', 'font-size': 12, fill: C.ink }, svg); t.textContent = l; });
    series.forEach(s => {
      el('path', { d: s.values.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + y(v)).join(' '), fill: 'none', stroke: C[s.key], 'stroke-width': 2 }, svg);
      s.values.forEach((v, i) => el('circle', { cx: x(i), cy: y(v), r: 4.5, fill: C[s.key], stroke: C.surface, 'stroke-width': 2 }, svg));
      const last = s.values[s.values.length - 1]; const t = el('text', { x: x(xs.length - 1) + 12, y: y(last) + 4, 'font-size': 12, fill: C.text }, svg); t.textContent = s.name;
    });
    const cross = el('line', { y1: m.t, y2: H - m.b, stroke: 'rgba(255,255,255,0.25)', 'stroke-dasharray': '3 3', visibility: 'hidden' }, svg);
    const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', e => { const r = svg.getBoundingClientRect(); const px = (e.clientX - r.left) * W / r.width;
      const i = Math.max(0, Math.min(xs.length - 1, Math.round((px - m.l) / ((W - m.l - m.r) / (xs.length - 1)))));
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      showTip(box, `<b>${xs[i]}</b><br>` + series.map(s => `${s.name}: ${(s.values[i] > 0 ? '+' : '') + s.values[i].toFixed(3)}`).join('<br>'), e); });
    hit.addEventListener('mouseleave', () => { cross.setAttribute('visibility', 'hidden'); hideTip(box); });
  };
})();
