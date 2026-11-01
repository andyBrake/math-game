/* 四年级下册出题器（9 个单元） */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;
  var R = MG.gen.register.bind(MG.gen);

  function q(o) { return MG.q.build(o); }
  function concept(topicId, level, list) {
    var it = U.pick(list);
    return q({ topicId: topicId, level: level, prompt: it[0], correct: it[1], wrongs: it[2], explain: it[3] });
  }
  /* 以「分」为单位的整数转小数，避免浮点误差 */
  function fmtCents(c) {
    var sign = c < 0 ? '-' : '';
    c = Math.abs(c);
    var i = Math.floor(c / 100), f = c % 100;
    if (f === 0) return sign + i;
    if (f % 10 === 0) return sign + i + '.' + (f / 10);
    return sign + i + '.' + (f < 10 ? '0' + f : f);
  }

  /* ---------- 1.1 四则运算：运算顺序 ---------- */
  R('g4b.u1.order', function (level) {
    var b = U.randInt(2, 9), c = U.randInt(2, 9), a = U.randInt(3, 20);
    var quo = b * c;
    if (level === 1) {
      return q({
        topicId: 'g4b.u1.order', level: level,
        prompt: '计算 ' + a + ' + ' + quo + ' ÷ ' + b + '，应该先算：',
        correct: '除法',
        wrongs: ['加法', '从左往右依次算', '都可以'],
        explain: '在没有括号的算式里，既有加减法又有乘除法，要先算乘除法，再算加减法。'
      });
    }
    return q({
      topicId: 'g4b.u1.order', level: level,
      prompt: a + ' + ' + quo + ' ÷ ' + b + ' = （ ）',
      correct: a + c,
      wrongs: [(a + quo) / b, a + quo, a + c + 1],
      explain: '先算除法 ' + quo + ' ÷ ' + b + ' = ' + c + '，再算加法 ' + a + ' + ' + c + ' = ' + (a + c) + '。'
    });
  });

  /* ---------- 1.2 四则运算：含括号 ---------- */
  R('g4b.u1.calc', function (level) {
    var a = U.randInt(2, 20), b = U.randInt(2, 20), c = U.randInt(2, 9);
    var total = (a + b) * c;
    var d = U.randInt(1, Math.max(1, total - 2));
    var ans = total - d;
    return q({
      topicId: 'g4b.u1.calc', level: level,
      prompt: '(' + a + ' + ' + b + ') × ' + c + ' − ' + d + ' = （ ）',
      correct: ans,
      wrongs: [ans + c, ans + 1, total],
      explain: '先算小括号里的 ' + a + ' + ' + b + ' = ' + (a + b) + '，再乘 ' + c + ' 得 ' + ((a + b) * c) +
        '，最后减 ' + d + ' 得 ' + ans + '。'
    });
  });

  /* ---------- 1.3 四则运算：关于 0 ---------- */
  R('g4b.u1.zero', function (level) {
    return concept('g4b.u1.zero', level, [
      ['0 除以一个不是 0 的数，商是（ ）', '0', ['1', '这个数本身', '没有意义'],
        '0 除以任何非 0 的数都得 0。'],
      ['一个数乘 0，积是（ ）', '0', ['这个数', '1', '无法确定'],
        '任何数与 0 相乘都得 0。'],
      ['在除法算式中，（ ）不能作除数', '0', ['1', '被除数', '商'],
        '0 不能作除数，因为找不到一个数与 0 相乘得到被除数。'],
      ['0 加一个数，和是（ ）', '这个数', ['0', '1', '无法确定'],
        '0 加任何数还得这个数。']
    ]);
  });

  /* ---------- 2.1 观察物体：从正面看 ---------- */
  function makeCubes(count) {
    var cells = U.shuffle([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]).slice(0, Math.min(3, count));
    var heights = cells.map(function () { return 1; });
    var left = count - cells.length;
    var guard = 0;
    while (left > 0 && guard++ < 50) {
      var i = U.randInt(0, cells.length - 1);
      if (heights[i] < 3) { heights[i]++; left--; }
    }
    var cubes = [];
    cells.forEach(function (c, i) {
      for (var z = 0; z < heights[i]; z++) cubes.push({ x: c[0], y: c[1], z: z });
    });
    return cubes;
  }
  R('g4b.u2.view', function (level) {
    var cubes = makeCubes(level >= 3 ? U.randInt(5, 7) : U.randInt(4, 5));
    var seen = Object.create(null);
    cubes.forEach(function (c) { seen[c.x + ',' + c.z] = true; });
    var ans = Object.keys(seen).length;
    return q({
      topicId: 'g4b.u2.view', level: level,
      prompt: '由这些小正方体搭成的立体图形，从正面看能看到几个正方形？',
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: [cubes.length, ans + 1, ans - 1],
      explain: '从正面看时，前后重叠的正方形只算一个，共能看到 ' + ans + ' 个正方形。'
    });
  });

  /* ---------- 2.2 观察物体：数正方体 ---------- */
  R('g4b.u2.count', function (level) {
    var cubes = makeCubes(level >= 3 ? U.randInt(5, 8) : U.randInt(3, 5));
    return q({
      topicId: 'g4b.u2.count', level: level,
      prompt: '这个立体图形由多少个小正方体搭成？',
      canvas: { kind: 'blocks', cubes: cubes },
      correct: cubes.length,
      wrongs: [cubes.length + 1, cubes.length - 1, cubes.length + 2],
      explain: '按层数数：先数最下面一层，再数上面被挡住的小正方体，一共 ' + cubes.length + ' 个。'
    });
  });

  /* ---------- 3.1 运算定律：辨认 ---------- */
  R('g4b.u3.identify', function (level) {
    var a = U.randInt(12, 90), b = U.randInt(3, 9), c = U.randInt(10, 40);
    return concept('g4b.u3.identify', level, [
      [a + ' × ' + b + ' = ' + b + ' × ' + a + ' 运用了（ ）',
        '乘法交换律', ['乘法结合律', '乘法分配律', '加法交换律'],
        '两个数相乘，交换因数的位置，积不变，这是乘法交换律。'],
      [a + ' + ' + b + ' = ' + b + ' + ' + a + ' 运用了（ ）',
        '加法交换律', ['加法结合律', '乘法交换律', '减法性质'],
        '两个数相加，交换加数的位置，和不变，这是加法交换律。'],
      ['(' + a + ' × ' + b + ') × ' + c + ' = ' + a + ' × (' + b + ' × ' + c + ') 运用了（ ）',
        '乘法结合律', ['乘法交换律', '乘法分配律', '加法结合律'],
        '三个数相乘，先把前两个数相乘或先把后两个数相乘，积不变，这是乘法结合律。'],
      ['(' + a + ' + ' + b + ') × ' + c + ' = ' + a + ' × ' + c + ' + ' + b + ' × ' + c + ' 运用了（ ）',
        '乘法分配律', ['乘法结合律', '乘法交换律', '加法结合律'],
        '两个数的和与一个数相乘，可以先把它们分别与这个数相乘再相加，这是乘法分配律。']
    ]);
  });

  /* ---------- 3.2 运算定律：简便计算 ---------- */
  R('g4b.u3.simplify', function (level) {
    var forms = [
      function () {
        var a = U.randInt(11, 89);
        return { p: a + ' + 37 + 63 = （ ）', ans: a + 100, e: '先算 37 + 63 = 100（加法结合律），再加 ' + a + '。' };
      },
      function () {
        var a = U.randInt(3, 19);
        return { p: '25 × ' + a + ' × 4 = （ ）', ans: 100 * a, e: '先算 25 × 4 = 100（乘法交换律和结合律），再乘 ' + a + '。' };
      },
      function () {
        var a = U.randInt(11, 49);
        return { p: '25 × (40 + 4) = （ ）', ans: 25 * 44, e: '用乘法分配律：25 × 40 + 25 × 4 = 1000 + 100 = 1100。' };
      },
      function () {
        var a = U.randInt(2, 9);
        return { p: '99 × ' + a + ' = （ ）', ans: 99 * a, e: '把 99 看成 100 − 1：100 × ' + a + ' − ' + a + ' = ' + (100 * a - a) + '。' };
      }
    ];
    var f = U.pick(forms)();
    return q({
      topicId: 'g4b.u3.simplify', level: level,
      prompt: f.p,
      correct: f.ans,
      wrongs: [f.ans + 10, f.ans - 10, f.ans * 10],
      explain: f.e
    });
  });

  /* ---------- 4.1 小数的意义和性质：小数点移动 ---------- */
  R('g4b.u4.point', function (level) {
    var cents = U.randInt(15, 999); // 0.15 ~ 9.99
    var ops = [
      { k: 10, sym: '×', div: false },
      { k: 100, sym: '×', div: false },
      { k: 1000, sym: '×', div: false }
    ];
    if (cents % 10 === 0) ops.push({ k: 10, sym: '÷', div: true });
    if (cents % 100 === 0) ops.push({ k: 100, sym: '÷', div: true });
    var op = U.pick(ops);
    var ansCents = op.div ? cents / op.k : cents * op.k;
    return q({
      topicId: 'g4b.u4.point', level: level,
      prompt: fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' = （ ）',
      correct: fmtCents(ansCents),
      wrongs: [fmtCents(op.div ? cents * op.k : cents / op.k), fmtCents(ansCents * 10), fmtCents(ansCents / 10)],
      explain: '把小数点向' + (op.sym === '×' ? '右' : '左') + '移动 ' + (op.k === 10 ? 1 : op.k === 100 ? 2 : 3) +
        ' 位，结果是 ' + fmtCents(ansCents) + '。位数不够时用 0 补足。'
    });
  });

  /* ---------- 4.2 小数的意义和性质：比较与化简 ---------- */
  R('g4b.u4.compare', function (level) {
    if (level === 1) {
      var intPart = U.randInt(1, 9);
      var s = intPart + '.' + U.randInt(1, 9) + U.pick(['00', '0', '']);
      var trimmed = String(Number(s));
      return q({
        topicId: 'g4b.u4.compare', level: level,
        prompt: '把 ' + s + ' 化简后是：',
        correct: trimmed,
        wrongs: [trimmed + '0', trimmed + '.0', String(Number(s) * 10)],
        explain: '小数的末尾添上 0 或去掉 0，小数的大小不变，所以 ' + s + ' = ' + trimmed + '。'
      });
    }
    var set = [];
    while (set.length < 4) {
      var v = U.randInt(1, 9999) / 100;
      if (set.indexOf(v) === -1) set.push(v);
    }
    var max = Math.max.apply(null, set);
    return q({
      topicId: 'g4b.u4.compare', level: level,
      prompt: '下面各数中，最大的是：',
      correct: fmtCents(Math.round(max * 100)),
      wrongs: set.filter(function (v) { return v !== max; }).map(function (v) { return fmtCents(Math.round(v * 100)); }),
      explain: '比较小数时先比整数部分，整数部分相同再比十分位、百分位……'
    });
  });

  /* ---------- 4.3 小数的意义和性质：单位换算 ---------- */
  R('g4b.u4.unit', function (level) {
    var forms = [
      { a: U.randInt(11, 99) / 10, from: '米', to: '厘米', k: 100 },
      { a: U.randInt(11, 99) / 10, from: '千克', to: '克', k: 1000 },
      { a: U.randInt(101, 999) / 100, from: '千米', to: '米', k: 1000 },
      { a: U.randInt(11, 99) / 10, from: '元', to: '角', k: 10 }
    ];
    var f = U.pick(forms);
    var cents = Math.round(f.a * 100);
    var ans = cents * f.k / 100;
    return q({
      topicId: 'g4b.u4.unit', level: level,
      prompt: fmtCents(cents) + ' ' + f.from + ' = （ ）' + f.to,
      correct: fmtCents(Math.round(ans * 100)),
      wrongs: [fmtCents(Math.round(ans * 10 * 100)), fmtCents(Math.round(ans / 10 * 100)), fmtCents(Math.round(ans * 100 * 100))],
      explain: '1 ' + f.from + ' = ' + f.k + ' ' + f.to + '，把小数点向右移动相应位数，得 ' +
        fmtCents(Math.round(ans * 100)) + ' ' + f.to + '。'
    });
  });

  /* ---------- 4.4 小数的意义和性质：近似数 ---------- */
  R('g4b.u4.round', function (level) {
    var intPart = U.randInt(1, 9);
    var frac = U.randInt(100, 999);
    var value = intPart + frac / 1000;
    var digits = U.pick([1, 2]);
    var ans = value.toFixed(digits);
    return q({
      topicId: 'g4b.u4.round', level: level,
      prompt: value.toFixed(3) + ' 保留' + (digits === 1 ? '一' : '两') + '位小数，约是（ ）',
      correct: ans,
      wrongs: [value.toFixed(digits + 1 > 3 ? 3 : digits + 1), value.toFixed(0), (value * 10).toFixed(digits)],
      explain: '保留' + (digits === 1 ? '一' : '两') + '位小数，要看下一位：满 5 进 1，不满 5 舍去，结果是 ' + ans + '。'
    });
  });

  /* ---------- 5.1 三角形：内角和 ---------- */
  R('g4b.u5.sum', function (level) {
    var a = U.randInt(30, 80);
    var b = U.randInt(30, 80);
    if (a + b > 150) b = 150 - a;
    var c = 180 - a - b;
    return q({
      topicId: 'g4b.u5.sum', level: level,
      prompt: '一个三角形中，∠1 = ' + a + '°，∠2 = ' + b + '°，∠3 = （ ）',
      correct: c,
      wrongs: [180 - a, 360 - a - b, c + 10],
      explain: '三角形的内角和是 180°，所以 ∠3 = 180° − ' + a + '° − ' + b + '° = ' + c + '°。'
    });
  });

  /* ---------- 5.2 三角形：三边关系 ---------- */
  R('g4b.u5.side', function (level) {
    function setStr(arr) { return arr.join('cm、') + 'cm'; }
    var a = U.randInt(3, 9), b = U.randInt(3, 9);
    var c = U.randInt(Math.abs(a - b) + 1, a + b - 1);
    var good = [a, b, c];
    var bad1 = [a, b, a + b];
    var bad2 = [a, b, Math.abs(a - b)];
    var bad3 = [a, b, a + b + 2];
    var options = U.shuffle([
      { v: setStr(good), ok: true },
      { v: setStr(bad1), ok: false },
      { v: setStr(bad2), ok: false },
      { v: setStr(bad3), ok: false }
    ]);
    var goodStr = options.filter(function (o) { return o.ok; })[0].v;
    return q({
      topicId: 'g4b.u5.side', level: level,
      prompt: '下面哪一组小棒能围成一个三角形？',
      correct: goodStr,
      wrongs: options.filter(function (o) { return !o.ok; }).map(function (o) { return o.v; }),
      explain: '三角形任意两边之和大于第三边。' + setStr(good) + ' 中 ' + a + ' + ' + b + ' > ' + c + '，可以围成三角形。'
    });
  });

  /* ---------- 5.3 三角形：分类 ---------- */
  R('g4b.u5.classify', function (level) {
    return concept('g4b.u5.classify', level, [
      ['有一个角是直角的三角形叫做（ ）', '直角三角形', ['锐角三角形', '钝角三角形', '等边三角形'],
        '按角分类，有一个角是直角的三角形是直角三角形。'],
      ['三个角都是锐角的三角形叫做（ ）', '锐角三角形', ['直角三角形', '钝角三角形', '等腰三角形'],
        '三个角都是锐角的三角形是锐角三角形。'],
      ['等边三角形的每个内角是（ ）', '60°', ['45°', '90°', '30°'],
        '等边三角形三个角相等，180° ÷ 3 = 60°。'],
      ['有两条边相等的三角形叫做（ ）', '等腰三角形', ['等边三角形', '直角三角形', '不等边三角形'],
        '有两条边相等的三角形是等腰三角形，两条腰相等，两个底角也相等。']
    ]);
  });

  /* ---------- 6.1 小数加减法 ---------- */
  R('g4b.u6.calc', function (level) {
    var a = U.randInt(100, 999), b = U.randInt(100, 999);
    var minus = level >= 2 && a > b;
    var ansCents = minus ? a - b : a + b;
    return q({
      topicId: 'g4b.u6.calc', level: level,
      prompt: fmtCents(a) + (minus ? ' − ' : ' + ') + fmtCents(b) + ' = （ ）',
      correct: fmtCents(ansCents),
      wrongs: [fmtCents(ansCents + 10), fmtCents(ansCents + 1), fmtCents(ansCents * 10)],
      explain: '计算小数加减法时，先把小数点对齐（也就是相同数位对齐），再按整数加减法计算。结果：' + fmtCents(ansCents) + '。'
    });
  });

  /* ---------- 6.2 小数加减简便计算 ---------- */
  R('g4b.u6.simplify', function (level) {
    var a = U.randInt(11, 49), c = 100 - a;
    var b = U.randInt(11, 89);
    return q({
      topicId: 'g4b.u6.simplify', level: level,
      prompt: fmtCents(a * 10) + ' + ' + fmtCents(b * 10) + ' + ' + fmtCents(c * 10) + ' = （ ）',
      correct: fmtCents(1000 + b * 10),
      wrongs: [fmtCents(1000 + b * 10 + 10), fmtCents(1000 + b * 10 - 10), fmtCents((1000 + b * 10) * 10)],
      explain: '运用加法交换律和结合律：' + fmtCents(a * 10) + ' + ' + fmtCents(c * 10) + ' = 10，再加 ' +
        fmtCents(b * 10) + ' 得 ' + fmtCents(1000 + b * 10) + '。'
    });
  });

  /* ---------- 7.1 图形的运动：轴对称 ---------- */
  R('g4b.u7.symmetry', function (level) {
    var cols = 6, rows = 4, axis = 3;
    var cells = [];
    for (var x = 0; x < axis; x++) {
      for (var y = 0; y < rows; y++) cells.push([x, y]);
    }
    var filled = U.shuffle(cells).slice(0, U.randInt(3, 5));
    var need = filled.length;
    return q({
      topicId: 'g4b.u7.symmetry', level: level,
      prompt: '虚线是对称轴。要把左半边补成轴对称图形，右边还需要涂几个小正方形？',
      canvas: { kind: 'symmetry', cols: cols, rows: rows, axis: axis, filled: filled },
      correct: need,
      wrongs: [need + 1, need - 1, filled.length],
      explain: '对称点到对称轴的距离相等，左半边有 ' + need + ' 个格子，右边就要补同样多的格子。'
    });
  });

  /* ---------- 7.2 图形的运动：平移 ---------- */
  R('g4b.u7.translate', function (level) {
    var shape = [[0, 0], [1, 0], [0, 1], [1, 1]].slice(0, U.randInt(3, 4));
    var startX = 0, startY = 0;
    var steps = U.randInt(2, 5);
    var endX = startX + steps;
    return q({
      topicId: 'g4b.u7.translate', level: level,
      prompt: '下面的图形要向右平移几格，才能与虚线图形重合？',
      canvas: {
        kind: 'translate', cols: 9, rows: 4,
        shape: shape, start: [startX, startY], end: [endX, startY]
      },
      correct: steps,
      wrongs: [steps + 1, steps - 1, steps * 2],
      explain: '找图形上一个对应的点，数一数它向右移动了几格，就是整个图形平移的格数：' + steps + ' 格。'
    });
  });

  /* ---------- 8.1 平均数 ---------- */
  R('g4b.u8.mean', function (level) {
    var n = level >= 3 ? 5 : 4;
    var vals = [];
    var sum = 0;
    for (var i = 0; i < n - 1; i++) {
      var v = U.randInt(60, 100);
      vals.push(v); sum += v;
    }
    /* 构造最后一个数，使平均数为整数 */
    var mean = U.randInt(60, 100);
    var last = mean * n - sum;
    var guard = 0;
    while ((last < 30 || last > 130) && guard++ < 60) {
      mean += last < 30 ? 1 : -1;
      last = mean * n - sum;
    }
    if (last < 1) last = 60;
    vals.push(last);
    sum += last;
    mean = sum / n;
    return q({
      topicId: 'g4b.u8.mean', level: level,
      prompt: '四（1）班 ' + n + ' 名同学每分钟跳绳的个数分别是：' + vals.join('、') + '。平均每人跳多少个？',
      correct: mean,
      wrongs: [mean + 1, mean - 1, Math.max.apply(null, vals)],
      explain: '平均数 = 总数 ÷ 份数 = ' + sum + ' ÷ ' + n + ' = ' + mean + '。'
    });
  });

  /* ---------- 8.2 统计图中的平均数 ---------- */
  R('g4b.u8.chart', function (level) {
    var cats = ['周一', '周二', '周三', '周四', '周五'];
    var vals = [];
    var sum = 0;
    for (var i = 0; i < cats.length; i++) { var v = U.randInt(5, 20); vals.push(v); sum += v; }
    var adjust = (5 - (sum % 5)) % 5;
    vals[0] += adjust;
    sum += adjust;
    var mean = sum / 5;
    return q({
      topicId: 'g4b.u8.chart', level: level,
      prompt: '根据统计图，这 5 天平均每天有多少人？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: mean,
      wrongs: [mean + 1, mean - 1, Math.max.apply(null, vals)],
      explain: '先求总数 ' + sum + '，再除以 5，平均每天 ' + mean + ' 人。'
    });
  });

  /* ---------- 9.1 鸡兔同笼 ---------- */
  R('g4b.u9.chicken', function (level) {
    var rabbits = U.randInt(1, level >= 3 ? 15 : 9);
    var chickens = U.randInt(1, level >= 3 ? 15 : 9);
    var heads = rabbits + chickens;
    var legs = rabbits * 4 + chickens * 2;
    var ans = '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
    return q({
      topicId: 'g4b.u9.chicken', level: level,
      prompt: '笼子里有鸡和兔共 ' + heads + ' 只，一共 ' + legs + ' 条腿。鸡和兔各有多少只？',
      correct: ans,
      wrongs: [
        '鸡 ' + rabbits + ' 只，兔 ' + chickens + ' 只',
        '鸡 ' + (chickens + 1) + ' 只，兔 ' + (rabbits - 1) + ' 只',
        '鸡 ' + (chickens - 1) + ' 只，兔 ' + (rabbits + 1) + ' 只'
      ],
      explain: '假设全是鸡，共有 ' + heads * 2 + ' 条腿，比实际少 ' + (legs - heads * 2) +
        ' 条。每把一只鸡换成兔多 2 条腿，所以兔有 ' + rabbits + ' 只，鸡有 ' + chickens + ' 只。'
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
