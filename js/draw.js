/* 图形题绘制：全部由结构化数据重绘，不依赖任何图片 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var INK = '#20202e';
  var PAPER = '#fffdf5';
  var BLUE = '#4a86e8';
  var RED = '#e8453c';
  var GREEN = '#3aa655';
  var YELLOW = '#f2c14e';

  function setup(canvas) {
    var dpr = global.devicePixelRatio || 1;
    var w = canvas.clientWidth || 360;
    var h = canvas.clientHeight || 220;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- 条形统计图 ---------- */
  function barChart(ctx, w, h, d) {
    var padL = 34, padB = 26, padT = 18, padR = 12;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var values = d.values || [];
    var max = Math.max.apply(null, values.concat([1]));
    var step = Math.ceil(max / 5 / 5) * 5 || 5;
    var top = step * Math.ceil(max / step);
    if (top < 5) top = 5;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#d8d2c0';
    ctx.fillStyle = '#6b6b7a';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var g = 0; g <= 5; g++) {
      var val = top - (top / 5) * g;
      var y = padT + (plotH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(String(Math.round(val)), padL - 5, y);
    }

    var slot = plotW / values.length;
    var barW = Math.min(38, slot * 0.6);
    values.forEach(function (v, i) {
      var bh = (v / top) * plotH;
      var x = padL + slot * i + (slot - barW) / 2;
      var y = padT + plotH - bh;
      ctx.fillStyle = [BLUE, RED, GREEN, YELLOW, '#9b6bd6', '#4bbfbf'][i % 6];
      roundRect(ctx, x, y, barW, bh, 5);
      ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(v), x + barW / 2, y - 14);
      ctx.fillText(d.categories[i] || '', x + barW / 2, padT + plotH + 6);
    });

    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
  }

  /* ---------- 角 ---------- */
  function drawAngle(ctx, w, h, deg, withProtractor) {
    var cx = w / 2, cy = h * 0.78, radius = Math.min(w, h) * 0.62;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    if (withProtractor) {
      ctx.save();
      ctx.translate(cx, cy);
      /* 量角器半圆 */
      ctx.beginPath();
      ctx.arc(0, 0, radius, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(180,210,255,0.35)';
      ctx.fill();
      ctx.strokeStyle = '#5a7bb5'; ctx.lineWidth = 2; ctx.stroke();

      for (var a = 0; a <= 180; a += 5) {
        var rad = (a * Math.PI) / 180;
        var long = a % 30 === 0;
        var r1 = radius - (long ? 16 : 9);
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * r1, -Math.sin(rad) * r1);
        ctx.lineTo(Math.cos(rad) * radius, -Math.sin(rad) * radius);
        ctx.strokeStyle = long ? '#33507f' : '#7d97c4';
        ctx.lineWidth = long ? 2 : 1;
        ctx.stroke();
        if (long) {
          ctx.fillStyle = '#33507f';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(a), Math.cos(rad) * (radius - 28), -Math.sin(rad) * (radius - 28));
        }
      }
      /* 中心点 */
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = RED; ctx.fill();
      ctx.restore();

      drawRays(ctx, cx, cy, radius, deg, true);
      return;
    }

    drawRays(ctx, cx, cy, radius, deg, false);
  }

  function drawRays(ctx, cx, cy, radius, deg, subtle) {
    var r = radius * (subtle ? 0.92 : 0.95);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();

    var rad = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * r, cy - Math.sin(rad) * r);
    ctx.stroke();

    var arcR = Math.min(60, r * 0.45);
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, 0, -rad, true);
    ctx.strokeStyle = subtle ? '#33507f' : '#e8453c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = INK; ctx.fill();
  }

  /* ---------- 轴对称 ---------- */
  function symmetry(ctx, w, h, d) {
    var cell = Math.min((w - 20) / d.cols, (h - 20) / d.rows);
    var ox = (w - cell * d.cols) / 2;
    var oy = (h - cell * d.rows) / 2;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);

    for (var y = 0; y < d.rows; y++) {
      for (var x = 0; x < d.cols; x++) {
        ctx.strokeStyle = '#e4dfd0';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + x * cell, oy + y * cell, cell, cell);
      }
    }

    (d.filled || []).forEach(function (c) {
      ctx.fillStyle = BLUE;
      roundRect(ctx, ox + c[0] * cell + 3, oy + c[1] * cell + 3, cell - 6, cell - 6, 3);
      ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    });

    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = RED; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + d.axis * cell, oy - 6);
    ctx.lineTo(ox + d.axis * cell, oy + d.rows * cell + 6);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- 平移 ---------- */
  function translate(ctx, w, h, d) {
    var cell = Math.min((w - 20) / d.cols, (h - 20) / d.rows);
    var ox = (w - cell * d.cols) / 2;
    var oy = (h - cell * d.rows) / 2;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);

    for (var y = 0; y < d.rows; y++) {
      for (var x = 0; x < d.cols; x++) {
        ctx.strokeStyle = '#e4dfd0'; ctx.lineWidth = 1;
        ctx.strokeRect(ox + x * cell, oy + y * cell, cell, cell);
      }
    }

    function paint(baseX, baseY, solid) {
      (d.shape || []).forEach(function (s) {
        var x = ox + (baseX + s[0]) * cell, y = oy + (baseY + s[1]) * cell;
        if (solid) {
          ctx.fillStyle = GREEN;
          roundRect(ctx, x + 3, y + 3, cell - 6, cell - 6, 3);
          ctx.fill();
          ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
        } else {
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#8b8b9a'; ctx.lineWidth = 2;
          ctx.strokeRect(x + 4, y + 4, cell - 8, cell - 8);
          ctx.restore();
        }
      });
    }

    paint(d.start[0], d.start[1], true);
    paint(d.end[0], d.end[1], false);

    var ax = ox + (d.start[0] + 2) * cell;
    var ay = oy + (d.start[1] + 0.5) * cell;
    var bx = ax + (d.end[0] - d.start[0] - 1) * cell;
    ctx.strokeStyle = RED; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, ay); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, ay); ctx.lineTo(bx - 10, ay - 6); ctx.lineTo(bx - 10, ay + 6);
    ctx.closePath(); ctx.fillStyle = RED; ctx.fill();
  }

  /* ---------- 等距方块 ---------- */
  function blocks(ctx, w, h, d) {
    var cubes = (d.cubes || []).slice();
    cubes.sort(function (a, b) { return (a.x + a.y + a.z) - (b.x + b.y + b.z); });

    var cw = 30, ch = 15, cz = 30;
    var ox = w / 2 - 20, oy = h / 2 + 20;

    function iso(x, y, z) {
      return { x: ox + (x - y) * cw, y: oy + (x + y) * ch - z * cz };
    }

    function face(pts, color) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    cubes.forEach(function (c) {
      var p = iso(c.x, c.y, c.z);
      var top = [p, { x: p.x + cw, y: p.y + ch }, { x: p.x, y: p.y + ch * 2 }, { x: p.x - cw, y: p.y + ch }];
      var left = [{ x: p.x - cw, y: p.y + ch }, { x: p.x, y: p.y + ch * 2 }, { x: p.x, y: p.y + ch * 2 + cz }, { x: p.x - cw, y: p.y + ch + cz }];
      var right = [{ x: p.x, y: p.y + ch * 2 }, { x: p.x + cw, y: p.y + ch }, { x: p.x + cw, y: p.y + ch + cz }, { x: p.x, y: p.y + ch * 2 + cz }];
      face(top, '#9fd3ff');
      face(left, '#5c9ee0');
      face(right, '#3f7fc2');
    });
  }

  /* ---------- 折线统计图 ---------- */
  function lineChart(ctx, w, h, d) {
    var padL = 34, padB = 26, padT = 18, padR = 12;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var values = d.values || [];
    var categories = d.categories || [];
    var max = Math.max.apply(null, values.concat([1]));
    var min = Math.min.apply(null, values.concat([0]));
    if (min > 0) min = 0;
    var range = max - min || 1;
    var step = Math.ceil(range / 5 / 5) * 5 || 5;
    var top = min + step * Math.ceil(range / step);
    var bottom = min - (top - min) % step;
    if (bottom < 0) bottom = 0;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    /* 纵轴网格线 + 刻度 */
    ctx.strokeStyle = '#d8d2c0';
    ctx.fillStyle = '#6b6b7a';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var g = 0; g <= 5; g++) {
      var val = bottom + ((top - bottom) / 5) * (5 - g);
      var y = padT + (plotH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(String(Math.round(val)), padL - 5, y);
    }

    /* 计算各点坐标 */
    var n = values.length;
    var slot = plotW / Math.max(1, n - 1);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = n === 1 ? padL + plotW / 2 : padL + slot * i;
      var y = padT + plotH - ((values[i] - bottom) / (top - bottom)) * plotH;
      pts.push({ x: x, y: y, v: values[i] });
    }

    /* 折线 */
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    /* 数据点 + 数值标注 */
    pts.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = BLUE;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = INK;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(p.v), p.x, p.y - 6);

      /* 横轴类目名 */
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#6b6b7a';
      ctx.font = '10px monospace';
      var cat = categories[pts.indexOf(p)] || '';
      if (n <= 6) {
        ctx.fillText(cat, p.x, padT + plotH + 5);
      } else {
        /* 点数多时隔一个标注 */
        if (pts.indexOf(p) % 2 === 0 || pts.indexOf(p) === n - 1) {
          ctx.fillText(cat, p.x, padT + plotH + 5);
        }
      }
    });

    /* 坐标轴 */
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
  }

  var painters = {
    'bar-chart': function (ctx, w, h, d) { barChart(ctx, w, h, d); },
    'line-chart': function (ctx, w, h, d) { lineChart(ctx, w, h, d); },
    angle: function (ctx, w, h, d) { drawAngle(ctx, w, h, d.deg, false); },
    protractor: function (ctx, w, h, d) { drawAngle(ctx, w, h, d.deg, true); },
    symmetry: function (ctx, w, h, d) { symmetry(ctx, w, h, d); },
    translate: function (ctx, w, h, d) { translate(ctx, w, h, d); },
    blocks: function (ctx, w, h, d) { blocks(ctx, w, h, d); }
  };

  MG.draw = {
    paint: function (canvas, data) {
      if (!canvas || !data) return;
      var env = setup(canvas);
      var fn = painters[data.kind];
      if (!fn) {
        env.ctx.fillStyle = PAPER;
        env.ctx.fillRect(0, 0, env.w, env.h);
        return;
      }
      fn(env.ctx, env.w, env.h, data);
    },
    kinds: Object.keys(painters)
  };
})(typeof window !== 'undefined' ? window : globalThis);
