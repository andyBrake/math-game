/* 四年级下册出题器（北师大版，6 单元 27 知识点） */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;
  var R = MG.gen.register.bind(MG.gen);

  function q(o) { return MG.q.build(o); }

  /* 取 3 个不重复、非负的干扰项，先洗牌保证选项集合随机化 */
  function three(correct, cands) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    var shuffled = U.shuffle(cands);
    for (var i = 0; i < shuffled.length && out.length < 3; i++) {
      if (shuffled[i] === null || shuffled[i] === undefined) continue;
      var s = String(shuffled[i]);
      if (s === 'undefined' || s === 'NaN') continue;
      if (s.charAt(0) === '-') continue;
      if (seen[s]) continue;
      seen[s] = true;
      out.push(shuffled[i]);
    }
    return out;
  }

  var WHO = ['小明', '小华', '小丽', '小刚', '小红', '小军', '小芳', '小林', '小强', '小敏', '小英', '小亮', '小东', '小宇', '小杰', '小婷', '小浩', '小芸', '小磊', '小鹏', '小萌', '小静', '小雪', '小龙'];
  function who() { return U.pick(WHO); }

  /* 以「分」为单位的整数转小数（2 位），避免浮点误差 */
  function fmtCents(c) {
    var sign = c < 0 ? '-' : '';
    c = Math.abs(c);
    var i = Math.floor(c / 100), f = c % 100;
    if (f === 0) return sign + i;
    if (f % 10 === 0) return sign + i + '.' + (f / 10);
    return sign + i + '.' + (f < 10 ? '0' + f : f);
  }
  /* 以「毫」为单位的整数转小数（3 位） */
  function fmtMilli(m) {
    var sign = m < 0 ? '-' : '';
    m = Math.abs(m);
    var i = Math.floor(m / 1000), f = m % 1000;
    if (f === 0) return sign + i;
    var s = String(f);
    while (s.length < 3) s = '0' + s;
    s = s.replace(/0+$/, '');
    return sign + i + (s ? '.' + s : '');
  }

  /* ==================== 第一单元：小数的意义和加减法 ==================== */

  /* ---------- g4b.u1.meaning 小数的意义 ---------- */
  R('g4b.u1.meaning', function (level) {
    var items = [];
    /* 分数→小数（十分之几） */
    for (var t = 1; t <= 9; t++) {
      items.push({ p: '把"1"平均分成 10 份，取其中的 ' + t + ' 份，用小数表示是（ ）', ans: '0.' + t, pool: ['0.0' + t, '0.0' + t + '0', String(t) + '/10', '1.' + t, '0.' + (t * 10), String(t) + '/100', '0.' + (t + 1)], e: '把"1"平均分成 10 份，1 份是 1/10 = 0.1，' + t + ' 份是 ' + t + '/10 = 0.' + t + '。' });
    }
    /* 分数→小数（百分之几） */
    var pc = U.randInt(11, 99);
    items.push({ p: '把"1"平均分成 100 份，取其中的 ' + pc + ' 份，用小数表示是（ ）', ans: fmtCents(pc), pool: ['0.' + pc, String(pc) + '/10', fmtCents(pc * 10), '0.0' + pc, String(pc) + '/1000', fmtCents(pc + 1), fmtCents(pc - 1)], e: '把"1"平均分成 100 份，1 份是 1/100 = 0.01，' + pc + ' 份是 ' + pc + '/100 = ' + fmtCents(pc) + '。' });
    /* 千分之几 */
    var m = U.randInt(101, 999);
    items.push({ p: '把"1"平均分成 1000 份，取其中的 ' + m + ' 份，用小数表示是（ ）', ans: fmtMilli(m), pool: [fmtCents(m), '0.' + m, fmtMilli(m * 10), fmtMilli(Math.floor(m / 10)), fmtMilli(m + 1), fmtMilli(m - 1)], e: '把"1"平均分成 1000 份，1 份是 1/1000 = 0.001，' + m + ' 份是 ' + m + '/1000 = ' + fmtMilli(m) + '。' });
    /* 小数的组成 */
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    var comp = a + '.' + b + c;
    items.push({ p: comp + ' 是由（ ）组成的', ans: a + ' 个 1，' + b + ' 个 0.1，' + c + ' 个 0.01', pool: [a + ' 个 0.1，' + b + ' 个 0.01，' + c + ' 个 0.001', a + ' 个 1，' + b + ' 个 0.01，' + c + ' 个 0.1', (a + b + c) + ' 个 1', a + ' 个 10，' + b + ' 个 1，' + c + ' 个 0.1'], e: comp + ' 的个位是 ' + a + '（表示 ' + a + ' 个 1），十分位是 ' + b + '（表示 ' + b + ' 个 0.1），百分位是 ' + c + '（表示 ' + c + ' 个 0.01）。' });
    /* 计数单位 */
    var cu = U.pick([
      { v: 4, u: '0.1', ans: '4', q: '0.4 里面有（ ）个 0.1', e: '0.4 的十分位是 4，表示 4 个 0.1。' },
      { v: 25, u: '0.001', ans: '25', q: '0.025 里面有（ ）个 0.001', e: '0.025 的千分位是 25（百分位 2 个 0.01 = 20 个 0.001，千分位 5 个 0.001），共 25 个 0.001。' },
      { v: 7, u: '0.01', ans: '7', q: '0.07 里面有（ ）个 0.01', e: '0.07 的百分位是 7，表示 7 个 0.01。' },
      { v: 9, u: '0.1', ans: '9', q: '0.9 里面有（ ）个 0.1', e: '0.9 的十分位是 9，表示 9 个 0.1。' },
      { v: 108, u: '0.001', ans: '108', q: '0.108 里面有（ ）个 0.001', e: '0.108 = 0.1 + 0.008 = 100 个 0.001 + 8 个 0.001 = 108 个 0.001。' }
    ]);
    items.push({ p: cu.q, ans: cu.ans, pool: [String(cu.v * 10), String(cu.v * 100), String(cu.v + 1), String(cu.v - 1), String(cu.v * 2), String(cu.v + 10)], e: cu.e });

    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？', '填一填：' + it.p]);
    return q({ topicId: 'g4b.u1.meaning', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, it.pool), explain: it.e });
  });

  /* ---------- g4b.u1.unit 小数与单位换算 ---------- */
  R('g4b.u1.unit', function (level) {
    var forms = [
      function () {
        var cm = U.randInt(11, 99);
        return { p: cm + ' 厘米 = （ ）米', ans: fmtCents(cm), e: '1 米 = 100 厘米，' + cm + ' 厘米 = ' + cm + '/100 米 = ' + fmtCents(cm) + ' 米。' };
      },
      function () {
        var g = U.randInt(11, 999);
        return { p: g + ' 克 = （ ）千克', ans: fmtMilli(g), e: '1 千克 = 1000 克，' + g + ' 克 = ' + g + '/1000 千克 = ' + fmtMilli(g) + ' 千克。' };
      },
      function () {
        var kg = U.randInt(1, 9), g = U.randInt(1, 9) * 100;
        return { p: kg + ' 千克 ' + g + ' 克 = （ ）千克', ans: (g === 500 ? kg + '.5' : fmtMilli(kg * 1000 + g)), e: g + ' 克 = ' + fmtMilli(g) + ' 千克，加上 ' + kg + ' 千克，共 ' + (g === 500 ? kg + '.5' : fmtMilli(kg * 1000 + g)) + ' 千克。' };
      },
      function () {
        var yuan = U.randInt(1, 9), jiao = U.randInt(1, 9), fen = U.randInt(1, 9);
        return { p: yuan + ' 元 ' + jiao + ' 角 ' + fen + ' 分 = （ ）元', ans: fmtCents(yuan * 100 + jiao * 10 + fen), e: jiao + ' 角 = ' + (jiao / 10) + ' 元，' + fen + ' 分 = 0.0' + fen + ' 元，合起来 ' + yuan + ' 元 ' + jiao + ' 角 ' + fen + ' 分 = ' + fmtCents(yuan * 100 + jiao * 10 + fen) + ' 元。' };
      },
      function () {
        var cents = U.randInt(101, 599);
        return { p: fmtCents(cents) + ' 元 = （ ）元（ ）角（ ）分', ans: Math.floor(cents / 100) + ' 元 ' + Math.floor((cents % 100) / 10) + ' 角 ' + (cents % 10) + ' 分', e: fmtCents(cents) + ' 元 = ' + Math.floor(cents / 100) + ' 元 ' + Math.floor((cents % 100) / 10) + ' 角 ' + (cents % 10) + ' 分。' };
      },
      function () {
        var m = U.randInt(1, 9), dm = U.randInt(1, 9);
        return { p: m + '.' + dm + ' 米 = （ ）米（ ）分米', ans: m + ' 米 ' + dm + ' 分米', e: '1 米 = 10 分米，' + m + '.' + dm + ' 米 = ' + m + ' 米 ' + dm + ' 分米。' };
      },
      function () {
        var g = U.randInt(101, 999);
        return { p: g + ' 克 = （ ）千克', ans: fmtMilli(g), e: '1 千克 = 1000 克，' + g + ' 克 = ' + fmtMilli(g) + ' 千克。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([f.p, who() + '换算：' + f.p, '填一填：' + f.p, '想一想，' + f.p]);
    var pool = [f.ans + '0', fmtCents(Math.round(parseFloat(f.ans) * 10)), fmtCents(Math.round(parseFloat(f.ans) / 10)), fmtCents(Math.round(parseFloat(f.ans) * 100)), fmtCents(Math.round(parseFloat(f.ans) * 1000)), fmtCents(Math.round(parseFloat(f.ans) + 1)), fmtCents(Math.round(parseFloat(f.ans) - 1))];
    return q({ topicId: 'g4b.u1.unit', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u1.zero 小数的性质 ---------- */
  R('g4b.u1.zero', function (level) {
    var items = [];
    /* 判断哪些 0 可以去掉 */
    var canTrim = ['8.10', '15.00', '30.070', '0.090', '6.00', '0.500', '10.200', '3.40'];
    var trimMap = { '8.10': '8.1', '15.00': '15', '30.070': '30.07', '0.090': '0.09', '6.00': '6', '0.500': '0.5', '10.200': '10.2', '3.40': '3.4' };
    var s = U.pick(canTrim);
    items.push({ p: '不改变数的大小，把 ' + s + ' 化简后是（ ）', ans: trimMap[s], pool: [s, s.replace(/0/g, ''), trimMap[s] + '0', trimMap[s] + '00', '0.' + trimMap[s], trimMap[s].replace('.', '')], e: '小数的末尾添上或去掉 0，小数的大小不变。' + s + ' 末尾的 0 可以去掉，化简为 ' + trimMap[s] + '。' });
    /* 哪些 0 不能去 */
    var cantTrim = ['600', '30.07', '0.09', '105.008', '200.5', '0.04'];
    var s2 = U.pick(cantTrim);
    items.push({ p: '下面各数中，"0"不能去掉的是（ ）', ans: s2, pool: ['8.10', '6.00', '3.40', '15.00', '0.500', '10.200'], e: s2 + ' 中的 0 不在小数末尾，去掉会改变数的大小，所以不能去掉。' });
    /* 小数数位 */
    var digitItems = [
      { p: '14.24 中，个位上的 4 表示（ ）', ans: '4 个一', pool: ['4 个 0.1', '4 个 0.01', '4 个 10', '4 个百'], e: '个位的计数单位是一，个位上的 4 表示 4 个一。' },
      { p: '14.24 中，百分位上的 4 表示（ ）', ans: '4 个 0.01', pool: ['4 个一', '4 个 0.1', '4 个 0.001', '4 个 10'], e: '百分位的计数单位是 0.01，百分位上的 4 表示 4 个 0.01。' },
      { p: '0.30 与 0.3 相比（ ）', ans: '大小相等，计数单位不同', pool: ['大小不相等', '大小相等，计数单位相同', '0.30 比 0.3 大', '0.30 比 0.3 小'], e: '0.30 = 0.3，大小相等；但 0.3 的计数单位是 0.1，0.30 的计数单位是 0.01。' },
      { p: '把 5 元写成以"元"为单位的两位小数是（ ）', ans: '5.00 元', pool: ['5.0 元', '0.50 元', '50.0 元', '5.000 元'], e: '小数末尾添上 0 大小不变，5 元 = 5.00 元。' }
    ];
    items = items.concat(digitItems);

    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？']);
    return q({ topicId: 'g4b.u1.zero', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, it.pool), explain: it.e });
  });

  /* ---------- g4b.u1.compare 小数的大小比较 ---------- */
  R('g4b.u1.compare', function (level) {
    if (level === 1) {
      var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
      var v1 = a + '.' + b;
      var v2 = a + '.' + c;
      while (b === c) c = U.randInt(1, 9);
      var ans = b < c ? '<' : '>';
      var prompt = U.pick([v1 + ' ○ ' + v2 + '，○ 里应填（ ）', who() + '比较大小：' + v1 + ' ○ ' + v2, '在○里填 >、< 或 =：' + v1 + ' ○ ' + v2]);
      return q({ topicId: 'g4b.u1.compare', level: level, prompt: prompt, correct: ans, wrongs: three(ans, ['>', '<', '=', '≥', '≤', '≠']), explain: '整数部分相同，比十分位：' + v1 + ' 与 ' + v2 + '，十分位 ' + b + ' 和 ' + c + '，所以 ' + v1 + ' ' + ans + ' ' + v2 + '。' });
    }
    var centsPool = [];
    while (centsPool.length < 4) {
      var cc = U.randInt(100, 9999);
      if (centsPool.indexOf(cc) === -1) centsPool.push(cc);
    }
    var strs = centsPool.map(function (x) { return fmtCents(x); });
    var mode = U.pick(['max', 'min']);
    var sorted = centsPool.slice().sort(function (a, b) { return a - b; });
    var ansCents = mode === 'max' ? sorted[3] : sorted[0];
    var listStr = strs.join('、');
    var prompt = U.pick([
      '比较下面四个小数：' + listStr + '，最大的是（ ）',
      who() + '把 ' + listStr + ' 从大到小排列，最大的是（ ）',
      '下面各数 ' + listStr + ' 中，最小的是（ ）',
      '四个小数 ' + listStr + ' 中，最大的是（ ）'
    ]);
    var ansStr = fmtCents(ansCents);
    var others = centsPool.filter(function (x) { return x !== ansCents; }).map(function (x) { return fmtCents(x); });
    return q({ topicId: 'g4b.u1.compare', level: level, prompt: prompt, correct: ansStr, wrongs: three(ansStr, others.concat([fmtCents(ansCents + 1), fmtCents(ansCents - 1), fmtCents(ansCents + 10)])), explain: '比较小数时先比整数部分，再比十分位、百分位……' + listStr + ' 中' + (mode === 'max' ? '最大' : '最小') + '的是 ' + ansStr + '。' });
  });

  /* ---------- g4b.u1.calc 小数加减法 ---------- */
  R('g4b.u1.calc', function (level) {
    var forms = [
      function () {
        var a = U.randInt(100, 999), b = U.randInt(100, 999);
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' = （ ）', ans: a + b, e: '小数点对齐：' + fmtCents(a) + ' + ' + fmtCents(b) + ' = ' + fmtCents(a + b) + '。' };
      },
      function () {
        var a = U.randInt(200, 999), b = U.randInt(100, a - 1);
        return { p: fmtCents(a) + ' − ' + fmtCents(b) + ' = （ ）', ans: a - b, e: '小数点对齐：' + fmtCents(a) + ' − ' + fmtCents(b) + ' = ' + fmtCents(a - b) + '。' };
      },
      function () {
        var a = U.randInt(100, 500), b = U.randInt(100, 500), c = U.randInt(100, 500);
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' = （ ）', ans: a + b, e: '先把小数点对齐，再按整数加法算：' + fmtCents(a) + ' + ' + fmtCents(b) + ' = ' + fmtCents(a + b) + '。' };
      },
      function () {
        var whole = U.randInt(3, 9);
        var a = U.randInt(50, 200);
        return { p: whole + ' − ' + fmtCents(a) + ' = （ ）', ans: whole * 100 - a, e: whole + ' = ' + fmtCents(whole * 100) + '，再减 ' + fmtCents(a) + ' = ' + fmtCents(whole * 100 - a) + '。' };
      },
      function () {
        var a = U.randInt(100, 300), b = U.randInt(50, 200);
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' = （ ）', ans: a + b, e: '小数点对齐后相加：' + fmtCents(a) + ' + ' + fmtCents(b) + ' = ' + fmtCents(a + b) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick(['计算：' + f.p, who() + '算一算：' + f.p, '用竖式计算 ' + f.p, '小数加减练习 ' + f.p]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans * 10, f.ans + 1000, f.ans * 2, f.ans + 5, f.ans - 5];
    return q({ topicId: 'g4b.u1.calc', level: level, prompt: prompt, correct: fmtCents(f.ans), wrongs: three(fmtCents(f.ans), pool.map(function (x) { return fmtCents(x); })), explain: f.e });
  });

  /* ---------- g4b.u1.mix 小数加减混合运算 ---------- */
  R('g4b.u1.mix', function (level) {
    var forms = [
      function () {
        var a = U.randInt(500, 900), b = U.randInt(100, 300);
        var c = U.randInt(50, Math.min(300, a + b - 1));
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' − ' + fmtCents(c) + ' = （ ）', ans: a + b - c, e: '按从左往右顺序算：' + fmtCents(a) + ' + ' + fmtCents(b) + ' = ' + fmtCents(a + b) + '，再减 ' + fmtCents(c) + ' = ' + fmtCents(a + b - c) + '。' };
      },
      function () {
        var b = U.randInt(100, 300), c = U.randInt(100, 300);
        var a = b + c + U.randInt(50, 300);
        return { p: fmtCents(a) + ' − (' + fmtCents(b) + ' + ' + fmtCents(c) + ') = （ ）', ans: a - b - c, e: '先算括号里的 ' + fmtCents(b) + ' + ' + fmtCents(c) + ' = ' + fmtCents(b + c) + '，再算 ' + fmtCents(a) + ' − ' + fmtCents(b + c) + ' = ' + fmtCents(a - b - c) + '。' };
      },
      function () {
        var a = U.randInt(200, 500), b = U.randInt(50, Math.min(200, a - 1));
        var c = U.randInt(100, 300);
        return { p: fmtCents(a) + ' − ' + fmtCents(b) + ' + ' + fmtCents(c) + ' = （ ）', ans: a - b + c, e: '按从左往右：' + fmtCents(a) + ' − ' + fmtCents(b) + ' = ' + fmtCents(a - b) + '，再加 ' + fmtCents(c) + ' = ' + fmtCents(a - b + c) + '。' };
      },
      function () {
        var b = U.randInt(200, 500), c = U.randInt(50, Math.min(200, b - 1));
        var inner = b - c;
        var a = U.randInt(inner + 50, inner + 400);
        return { p: fmtCents(a) + ' − (' + fmtCents(b) + ' − ' + fmtCents(c) + ') = （ ）', ans: a - b + c, e: '先算括号里的 ' + fmtCents(b) + ' − ' + fmtCents(c) + ' = ' + fmtCents(inner) + '，再算 ' + fmtCents(a) + ' − ' + fmtCents(inner) + ' = ' + fmtCents(a - b + c) + '。' };
      },
      function () {
        var whole = U.randInt(5, 10);
        var a = U.randInt(100, 200), b = U.randInt(50, Math.min(200, whole * 100 - a - 10));
        return { p: whole + ' − (' + fmtCents(a) + ' + ' + fmtCents(b) + ') = （ ）', ans: whole * 100 - a - b, e: whole + ' = ' + fmtCents(whole * 100) + '，括号内 ' + fmtCents(a) + ' + ' + fmtCents(b) + ' = ' + fmtCents(a + b) + '，结果 ' + fmtCents(whole * 100 - a - b) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick(['计算：' + f.p, who() + '算一算：' + f.p, '脱式计算 ' + f.p, '递等式计算 ' + f.p]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans * 10, f.ans + 5, f.ans - 5];
    return q({ topicId: 'g4b.u1.mix', level: level, prompt: prompt, correct: fmtCents(f.ans), wrongs: three(fmtCents(f.ans), pool.map(function (x) { return fmtCents(x); })), explain: f.e });
  });

  /* ==================== 第二单元：认识三角形和四边形 ==================== */

  /* ---------- g4b.u2.classify 三角形的分类 ---------- */
  R('g4b.u2.classify', function (level) {
    var classes = ['锐角三角形', '直角三角形', '钝角三角形', '等腰三角形', '等边三角形'];
    var items = [
      function () {
        var big = U.randInt(91, 150);
        return { p: '三角形中有一个角是 ' + big + '°，它是（ ）', ans: '钝角三角形', e: '有一个角大于 90° 的三角形是钝角三角形。' };
      },
      function () {
        var small = U.randInt(20, 40);
        return { p: '等腰三角形的一个底角是 ' + small + '°，它的顶角是（ ）', ans: String(180 - 2 * small) + '°', e: '等腰三角形两个底角相等，顶角 = 180° − ' + small + '° × 2 = ' + (180 - 2 * small) + '°。' };
      },
      function () {
        return { p: '等边三角形的每个内角是（ ）', ans: '60°', e: '等边三角形三个角相等，180° ÷ 3 = 60°。' };
      },
      function () {
        return { p: '有两条边相等的三角形叫做（ ）', ans: '等腰三角形', e: '有两条边相等的三角形是等腰三角形。' };
      },
      function () {
        var s1 = U.randInt(3, 9);
        return { p: '三角形三边为 ' + s1 + ' cm、' + s1 + ' cm、' + s1 + ' cm，它是（ ）', ans: '等边三角形', e: '三条边都相等的三角形是等边三角形，也叫正三角形。' };
      },
      function () {
        var s1 = U.randInt(3, 9), s2 = U.randInt(3, 9), s3 = U.randInt(3, 9);
        while (s1 === s2 && s2 === s3) s3 = U.randInt(3, 9);
        var a1 = U.randInt(30, 70), a2 = U.randInt(30, 70), a3 = 180 - a1 - a2;
        if (a3 <= 0 || a3 >= 180) { a1 = 60; a2 = 60; a3 = 60; }
        var ans = a3 > 90 ? '钝角三角形' : (a3 === 90 ? '直角三角形' : '锐角三角形');
        return { p: '一个三角形三个角分别是 ' + a1 + '°、' + a2 + '°、' + a3 + '°，它是（ ）', ans: ans, e: '三个角中最大的是 ' + Math.max(a1, a2, a3) + '°，据此判断三角形类型。' };
      },
      function () {
        return { p: '等边三角形是特殊的（ ）', ans: '等腰三角形', e: '等边三角形三条边都相等，它是特殊的等腰三角形。' };
      },
      function () {
        var small = U.randInt(20, 50);
        return { p: '直角三角形的一个锐角是 ' + small + '°，另一个锐角是（ ）', ans: String(90 - small) + '°', e: '直角三角形两个锐角和是 90°，另一个 = 90° − ' + small + '° = ' + (90 - small) + '°。' };
      }
    ];
    var it = U.pick(items)();
    var prompt = U.pick([it.p, who() + '想一想：' + it.p, it.p + ' 正确答案是？']);
    var pool = classes.slice();
    pool.push('45°', '90°', '30°', '180°', '等腰直角三角形', '120°', '3 个');
    return q({ topicId: 'g4b.u2.classify', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ---------- g4b.u2.sum 三角形的内角和 ---------- */
  R('g4b.u2.sum', function (level) {
    var a = U.randInt(30, 80), b = U.randInt(30, 80);
    if (a + b > 150) b = 150 - a;
    var c = 180 - a - b;
    var prompt = U.pick([
      '一个三角形中，∠1 = ' + a + '°，∠2 = ' + b + '°，∠3 = （ ）',
      who() + '量得三角形两个内角分别是 ' + a + '° 和 ' + b + '°，第三个角是（ ）',
      '三角形内角和 180°，若两角分别是 ' + a + '° 和 ' + b + '°，则第三角为（ ）',
      '在三角形中，∠A = ' + a + '°，∠B = ' + b + '°，∠C = （ ）'
    ]);
    var pool = [180 - a, 180 - b, 360 - a - b, c + 10, c - 10, c + 5, c - 5, c + 1, a + b, c * 2, c + 30, c + 20];
    return q({ topicId: 'g4b.u2.sum', level: level, prompt: prompt, correct: c, wrongs: three(c, pool), explain: '三角形的内角和是 180°，所以 ∠3 = 180° − ' + a + '° − ' + b + '° = ' + c + '°。' });
  });

  /* ---------- g4b.u2.side 三角形三边关系 ---------- */
  R('g4b.u2.side', function (level) {
    var a = U.randInt(3, 9), b = U.randInt(3, 9);
    var c = U.randInt(Math.abs(a - b) + 1, a + b - 1);
    var mat = U.pick(['小棒', '木条', '铁丝', '吸管']);
    var prompt = U.pick([
      '有两根' + mat + '分别长 ' + a + ' cm 和 ' + b + ' cm，再选一根长（ ）cm 的' + mat + '就能围成三角形？',
      who() + '有两根' + mat + '长 ' + a + ' cm 和 ' + b + ' cm，下面哪根长的第三根能与它们围成三角形？',
      '已知两根' + mat + '长 ' + a + ' cm 和 ' + b + ' cm，第三根取下面哪个长度可以围成三角形？'
    ]);
    var pool = [a + b, Math.abs(a - b), a + b + 1, Math.abs(a - b) + 2, a + b + 2, a + b + 3, a + b - 1, Math.abs(a - b) + 1, a * 2, b * 2, a + b + 10, Math.abs(a - b) - 1];
    return q({ topicId: 'g4b.u2.side', level: level, prompt: prompt, correct: c, wrongs: three(c, pool), explain: '三角形任意两边之和大于第三边。' + a + ' + ' + b + ' > ' + c + '，所以第三边取 ' + c + ' cm 可以围成三角形。' });
  });

  /* ---------- g4b.u2.quad 四边形的分类 ---------- */
  R('g4b.u2.quad', function (level) {
    var items = [
      { p: '两组对边分别平行的四边形叫做（ ）', ans: '平行四边形', e: '两组对边分别平行的四边形是平行四边形。' },
      { p: '只有一组对边平行的四边形叫做（ ）', ans: '梯形', e: '只有一组对边平行的四边形是梯形。' },
      { p: '正方形是特殊的（ ）', ans: '长方形', e: '正方形四个角都是直角，对边平行且四条边相等，它是特殊的长方形。' },
      { p: '长方形是特殊的（ ）', ans: '平行四边形', e: '长方形两组对边分别平行，它是特殊的平行四边形。' },
      { p: '下面图形中，不是平行四边形的是（ ）', ans: '梯形', e: '梯形只有一组对边平行，不是平行四边形。' },
      { p: '平行四边形的两组对边分别（ ）', ans: '平行且相等', e: '平行四边形的两组对边分别平行且相等。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？']);
    var pool = ['长方形', '正方形', '梯形', '三角形', '圆', '五边形', '不平行', '垂直', '相交'];
    return q({ topicId: 'g4b.u2.quad', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ---------- g4b.u2.stable 图形的稳定性 ---------- */
  R('g4b.u2.stable', function (level) {
    var items = [
      { p: '三角形具有（ ）', ans: '稳定性', e: '三角形具有稳定性，不易变形。' },
      { p: '平行四边形具有（ ）', ans: '不稳定性', e: '平行四边形具有不稳定性，一拉就变形。' },
      { p: '工人师傅建房时常用木条固定门框，这是利用了（ ）', ans: '三角形的稳定性', e: '木条与门框构成三角形，利用三角形的稳定性使门框不变形。' },
      { p: '下面哪种图形一拉就变形？（ ）', ans: '平行四边形', e: '平行四边形具有不稳定性，一拉就变形。' },
      { p: '自行车车架做成三角形，是利用了三角形的（ ）', ans: '稳定性', e: '三角形结构稳固不易变形，适合做自行车车架。' },
      { p: '伸缩门做成平行四边形，是利用了平行四边形的（ ）', ans: '不稳定性', e: '平行四边形容易变形（不稳定性），适合做伸缩门。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？']);
    var pool = ['稳定性', '不稳定性', '对称性', '美观性', '平行四边形', '三角形', '容易变形', '牢固不变形'];
    return q({ topicId: 'g4b.u2.stable', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ==================== 第三单元：小数乘法 ==================== */

  /* ---------- g4b.u3.int 小数乘整数 ---------- */
  R('g4b.u3.int', function (level) {
    var forms = [
      function () {
        var v = U.randInt(1, 9); /* 0.v 元 */
        var n = U.randInt(2, 9);
        var ans = v * n; /* 角 */
        return { p: '每块橡皮 0.' + v + ' 元，买 ' + n + ' 块需要多少元？', ans: fmtCents(ans * 10), e: '0.' + v + ' 元 = ' + v + ' 角，' + v + ' × ' + n + ' = ' + ans + ' 角 = ' + fmtCents(ans * 10) + ' 元。' };
      },
      function () {
        var v = U.randInt(1, 9);
        var n = U.randInt(2, 9);
        return { p: '0.' + v + ' × ' + n + ' = （ ）', ans: fmtCents(v * n * 10), e: '0.' + v + ' 是 ' + v + ' 个 0.1，' + n + ' 个 0.' + v + ' 就是 ' + (v * n) + ' 个 0.1 = ' + fmtCents(v * n * 10) + '。' };
      },
      function () {
        var n = U.randInt(10, 100);
        return { p: '0.01 × ' + n + ' = （ ）', ans: fmtCents(n), e: '0.01 × ' + n + ' = ' + fmtCents(n / 100) + '。' };
      },
      function () {
        var v = U.randInt(1, 9);
        var n = U.randInt(2, 9);
        return { p: n + ' × 0.' + v + ' = （ ）', ans: fmtCents(v * n * 10), e: n + ' 个 0.' + v + ' 相加 = ' + fmtCents(v * n * 10) + '。' };
      },
      function () {
        return { p: '0.3 × 3 = （ ）', ans: '0.9', e: '0.3 是 3 个 0.1，3 个 0.3 就是 9 个 0.1 = 0.9。' };
      },
      function () {
        return { p: '0.4 × 3 = （ ）', ans: '1.2', e: '0.4 是 4 个 0.1，3 个 0.4 就是 12 个 0.1 = 1.2。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([f.p, who() + '算一算：' + f.p, '买文具：' + f.p]);
    var pool = [fmtCents(Math.round(parseFloat(f.ans) * 10)), fmtCents(Math.round(parseFloat(f.ans) / 10)), fmtCents(Math.round(parseFloat(f.ans) * 100)), fmtCents(Math.round(parseFloat(f.ans) + 0.1)), fmtCents(Math.round(parseFloat(f.ans) - 0.1)), fmtCents(Math.round(parseFloat(f.ans) * 2))];
    return q({ topicId: 'g4b.u3.int', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u3.point 小数点移动 ---------- */
  R('g4b.u3.point', function (level) {
    var cents = U.randInt(15, 999);
    var ops = [
      { k: 10, sym: '×', div: false },
      { k: 100, sym: '×', div: false },
      { k: 1000, sym: '×', div: false }
    ];
    if (cents % 10 === 0) ops.push({ k: 10, sym: '÷', div: true });
    if (cents % 100 === 0) ops.push({ k: 100, sym: '÷', div: true });
    var op = U.pick(ops);
    var ansCents = op.div ? cents / op.k : cents * op.k;
    var prompt = U.pick([
      fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' = （ ）',
      who() + '计算：' + fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' = （ ）',
      '把 ' + fmtCents(cents) + ' 的小数点向' + (op.sym === '×' ? '右' : '左') + '移动' + (op.k === 10 ? '一' : op.k === 100 ? '两' : '三') + '位，结果是（ ）',
      fmtCents(cents) + ' 扩大到原来的 ' + op.k + ' 倍是（ ）',
      fmtCents(cents) + ' 缩小到原来的 ' + op.k + ' 分之一是（ ）'
    ]);
    var pool = [
      fmtCents(op.div ? cents * op.k : cents / op.k),
      fmtCents(ansCents * 10),
      fmtCents(ansCents / 10),
      fmtCents(ansCents * 100),
      fmtCents(ansCents / 100),
      fmtCents(cents),
      fmtCents(ansCents + 100),
      fmtCents(ansCents - 100)
    ];
    return q({ topicId: 'g4b.u3.point', level: level, prompt: prompt, correct: fmtCents(ansCents), wrongs: three(fmtCents(ansCents), pool), explain: '把小数点向' + (op.sym === '×' ? '右' : '左') + '移动 ' + (op.k === 10 ? 1 : op.k === 100 ? 2 : 3) + ' 位，结果是 ' + fmtCents(ansCents) + '。位数不够时用 0 补足。' });
  });

  /* ---------- g4b.u3.dec 小数乘小数 ---------- */
  R('g4b.u3.dec', function (level) {
    /* 用整数单位：a (十分位) × b (百分位) = 积 (千分位) */
    var forms = [
      function () {
        var a = U.randInt(1, 9), b = U.randInt(1, 9);
        var ans = a * b; /* 0.a × 0.b = ab/100 */
        return { p: '0.' + a + ' × 0.' + b + ' = （ ）', ans: fmtCents(ans), e: '0.' + a + ' 是 ' + a + '/10，0.' + b + ' 是 ' + b + '/10，相乘 = ' + a * b + '/100 = ' + fmtCents(ans) + '。积的小数位数 = 1 + 1 = 2 位。' };
      },
      function () {
        var a = U.randInt(2, 9), b = U.randInt(1, 9);
        var ans = a * b; /* a.b × 0.c -> 用角为单位：ab(角) × c(角/10) ... 简化为 a.b × 0.c */
        /* 2.6 × 0.8 = 2.08 → 26 × 8 = 208, 两位小数 */
        var aInt = U.randInt(1, 9), aDec = U.randInt(1, 9);
        var bDec = U.randInt(1, 9);
        var left = aInt * 10 + aDec; /* 角 */
        var right = bDec; /* 角 */
        var prod = left * right; /* 角×角 = 百分位 */
        return { p: aInt + '.' + aDec + ' × 0.' + bDec + ' = （ ）', ans: fmtCents(prod), e: (aInt + '.' + aDec) + ' 有一位小数，0.' + bDec + ' 有一位小数，积有两位小数：' + left + ' × ' + right + ' = ' + prod + '，点两位小数 = ' + fmtCents(prod) + '。' };
      },
      function () {
        var a = U.randInt(1, 9), b = U.randInt(10, 99);
        var left = a * 10; /* 角 */
        var right = b; /* 分 */
        var prod = left * right; /* 角×分 = 千分位 */
        return { p: '0.' + a + ' × 0.' + (b < 10 ? '0' + b : b) + ' = （ ）', ans: fmtMilli(prod), e: '0.' + a + ' 是一位小数，0.' + b + ' 是两位小数，积有三位小数。' + left + ' × ' + right + ' = ' + prod + '，点三位小数 = ' + fmtMilli(prod) + '。' };
      },
      function () {
        var a = U.randInt(1, 9), b = U.randInt(1, 9);
        var left = a * 10;
        var right = b * 10;
        var prod = left * right;
        return { p: '0.' + a + ' × ' + b + ' = （ ）', ans: fmtCents(prod), e: '0.' + a + ' × ' + b + '：' + left + ' × ' + right + ' = ' + prod + '，一位小数 × 0 位小数 = 一位小数，即 ' + fmtCents(prod) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([f.p, who() + '算一算：' + f.p, '想一想，积的小数点应点在哪里？' + f.p]);
    var baseVal = parseFloat(f.ans);
    var pool = [fmtCents(Math.round(baseVal * 10)), fmtCents(Math.round(baseVal / 10)), fmtCents(Math.round(baseVal * 100)), fmtCents(Math.round(baseVal + 0.1)), fmtCents(Math.round(baseVal - 0.1)), fmtCents(Math.round(baseVal * 2)), fmtMilli(Math.round(baseVal * 1000))];
    return q({ topicId: 'g4b.u3.dec', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u3.simplify 小数乘法简算 ---------- */
  R('g4b.u3.simplify', function (level) {
    var forms = [
      function () {
        var a = U.randInt(11, 89), c = 100 - a, b = U.randInt(1, 9);
        /* 0.a × b + 0.c × b = (0.a + 0.c) × b = 1 × b = b */
        return { p: '0.' + a + ' × ' + b + ' + 0.' + c + ' × ' + b + ' = （ ）', ans: fmtCents(b * 100), e: '运用乘法分配律：(0.' + a + ' + 0.' + c + ') × ' + b + ' = 1 × ' + b + ' = ' + fmtCents(b * 100) + '。' };
      },
      function () {
        var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
        /* 0.25 × 3.7 × 0.4 形态：0.25 × 4 = 1 */
        return { p: '0.25 × 0.' + b + ' × 4 = （ ）', ans: fmtCents(b * 10), e: '运用乘法交换律：0.25 × 4 × 0.' + b + ' = 1 × 0.' + b + ' = 0.' + b + '。' };
      },
      function () {
        var a = U.randInt(1, 9), b = U.randInt(1, 9);
        /* (8 + 0.8) × 1.25 → 用角：(80 + 8) × 125 = 88 × 125 = 11000 千分位 */
        return { p: '(8 + 0.8) × 1.25 = （ ）', ans: '11', e: '运用乘法分配律：8 × 1.25 + 0.8 × 1.25 = 10 + 1 = 11。' };
      },
      function () {
        var a = U.randInt(1, 9);
        return { p: '0.89 × 0.' + a + ' + 0.89 × 0.' + (10 - a) + ' = （ ）', ans: fmtCents(89), e: '运用乘法分配律：0.89 × (0.' + a + ' + 0.' + (10 - a) + ') = 0.89 × 1 = 0.89。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick(['用简便方法计算：' + f.p, who() + '巧算：' + f.p, '怎样简便就怎样算 ' + f.p]);
    var baseVal = parseFloat(f.ans);
    var pool = [fmtCents(Math.round(baseVal * 10)), fmtCents(Math.round(baseVal / 10)), fmtCents(Math.round(baseVal + 0.1)), fmtCents(Math.round(baseVal - 0.1)), fmtCents(Math.round(baseVal * 2)), fmtCents(Math.round(baseVal + 1)), fmtCents(Math.round(baseVal - 1))];
    return q({ topicId: 'g4b.u3.simplify', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ==================== 第四单元：观察物体 ==================== */

  /* ---------- 观察物体工具 ---------- */
  function makeCubes(count, base) {
    var cells = U.shuffle([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]).slice(0, base || Math.min(3, count));
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
  function viewCount(cubes, direction) {
    var seen = Object.create(null);
    cubes.forEach(function (c) {
      var key = direction === 'front' ? c.x + ',' + c.z :
        direction === 'top' ? c.x + ',' + c.y : c.y + ',' + c.z;
      seen[key] = true;
    });
    return Object.keys(seen).length;
  }

  /* ---------- g4b.u4.view 从不同方向观察 ---------- */
  R('g4b.u4.view', function (level) {
    var count = level >= 3 ? U.randInt(5, 8) : U.randInt(4, 6);
    var base = Math.min(U.randInt(Math.ceil(count / 3), 4), count - 1);
    var cubes = makeCubes(count, base);
    var layers = 0, colCount = 0, rowCount = 0;
    var cols = Object.create(null), rows = Object.create(null);
    cubes.forEach(function (c) {
      if (c.z + 1 > layers) layers = c.z + 1;
      if (!cols[c.x]) { cols[c.x] = true; colCount++; }
      if (!rows[c.y]) { rows[c.y] = true; rowCount++; }
    });
    var directions = [
      { id: 'front', name: '正面' },
      { id: 'top', name: '上面' },
      { id: 'right', name: '右面' },
      { id: 'left', name: '左面' }
    ];
    var d = U.pick(directions);
    var ans = viewCount(cubes, d.id);
    var mat = U.pick(['积木', '小正方体', '小方块', '木块', '纸盒', '方块']);
    var prompt = U.pick([
      who() + '用' + mat + '搭了一个立体图形（底层 ' + base + ' 个，最高 ' + layers + ' 层）。从' + d.name + '看，能看到几个正方形？',
      '这个立体图形由 ' + count + ' 个' + mat + '搭成，从' + d.name + '看有几个正方形？',
      who() + '搭的' + mat + '图形（最高 ' + layers + ' 层，占 ' + colCount + ' 列），从' + d.name + '看，能看到几个小正方形？',
      '由 ' + count + ' 个' + mat + '搭成（底层 ' + base + ' 个），从' + d.name + '看能看到几个正方形？'
    ]);
    var pool = [count + 5, count + 6, count - 1, count - 2, count - 3, base + 10, layers + 10, colCount + 10, ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, base * 3, layers * 3, count + 10];
    return q({
      topicId: 'g4b.u4.view', level: level,
      prompt: prompt,
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, pool),
      explain: '从' + d.name + '看时，重叠的正方形只算一个，共能看到 ' + ans + ' 个正方形。'
    });
  });

  /* ---------- g4b.u4.count 数小正方体的个数 ---------- */
  R('g4b.u4.count', function (level) {
    var count = level >= 3 ? U.randInt(6, 11) : (level === 2 ? U.randInt(5, 9) : U.randInt(4, 9));
    var base = Math.min(U.randInt(Math.ceil(count / 3), 4), count - 1);
    var cubes = makeCubes(count, base);
    var layers = 0, colCount = 0;
    cubes.forEach(function (c) {
      if (c.z + 1 > layers) layers = c.z + 1;
    });
    var mat = U.pick(['积木', '小正方体', '小方块', '木块', '纸盒']);
    var prompt = U.pick([
      who() + '用' + mat + '搭了一个立体图形：底层有 ' + base + ' 个，最高的地方堆了 ' + layers + ' 层。这个立体图形一共用了多少个小正方体？',
      who() + '搭的立体图形（底层 ' + base + ' 个，最高 ' + layers + ' 层）一共有多少个小正方体？',
      '由 ' + count + ' 个' + mat + '搭成的图形，分层数一数，一共用了多少个？'
    ]);
    var cands = [count + 1, count + 2, count + 3, count + 4, count + 5, count - 1, count - 2, count - 3, base, layers, colCount, 2 * count, count + base, base + layers, count + layers, count + 8];
    var seenW = Object.create(null);
    seenW[String(count)] = true;
    var wrongs = [];
    U.shuffle(cands).forEach(function (w) {
      var s = String(w);
      if (w >= 0 && !seenW[s] && wrongs.length < 3) { seenW[s] = true; wrongs.push(s); }
    });
    return q({
      topicId: 'g4b.u4.count', level: level,
      prompt: prompt,
      canvas: { kind: 'blocks', cubes: cubes },
      correct: count,
      wrongs: wrongs,
      explain: '先数最下面一层有 ' + base + ' 个，再看上面被挡住的小正方体，一共 ' + count + ' 个。'
    });
  });

  /* ==================== 第五单元：认识方程 ==================== */

  /* ---------- g4b.u5.letter 字母表示数 ---------- */
  R('g4b.u5.letter', function (level) {
    var items = [
      function () {
        var n = U.randInt(2, 9);
        return { p: n + ' 只青蛙有（ ）条腿', ans: (4 * n) + '', e: '1 只青蛙 4 条腿，' + n + ' 只青蛙就是 4 × ' + n + ' = ' + (4 * n) + ' 条腿。' };
      },
      function () {
        var n = U.randInt(2, 9);
        return { p: 'a = ' + n + ' 时，4a = （ ）', ans: String(4 * n), e: '当 a = ' + n + ' 时，4a = 4 × ' + n + ' = ' + (4 * n) + '。' };
      },
      function () {
        var n = U.randInt(2, 9);
        return { p: '摆 ' + n + ' 个三角形需要（ ）根小棒', ans: String(3 * n), e: '摆 1 个三角形需要 3 根小棒，摆 ' + n + ' 个就是 3 × ' + n + ' = ' + (3 * n) + ' 根。' };
      },
      function () {
        var n = U.randInt(1, 5);
        return { p: n + ' 只手有（ ）个手指', ans: String(5 * n), e: '1 只手有 5 个手指，' + n + ' 只手就是 5 × ' + n + ' = ' + (5 * n) + ' 个手指。' };
      },
      function () {
        var a = U.randInt(2, 9);
        return { p: '正方形边长为 a = ' + a + ' 厘米，周长 C = （ ）厘米', ans: String(4 * a), e: '正方形周长 = 4 × 边长 = 4 × ' + a + ' = ' + (4 * a) + ' 厘米。' };
      },
      function () {
        var a = U.randInt(2, 9);
        return { p: '正方形边长为 a = ' + a + ' 厘米，面积 S = （ ）平方厘米', ans: String(a * a), e: '正方形面积 = 边长 × 边长 = ' + a + ' × ' + a + ' = ' + (a * a) + ' 平方厘米。' };
      },
      function () {
        var n = U.randInt(2, 9);
        return { p: '1 只青蛙 4 条腿，a 只青蛙（ ）条腿', ans: '4a', e: 'a 只青蛙就是 4 × a = 4a 条腿，数字一般写在字母前面。' };
      }
    ];
    var it = U.pick(items)();
    var prompt = U.pick([it.p, who() + '想一想：' + it.p, it.p + ' 正确答案是？']);
    var pool = [String(parseInt(it.ans) + 4), String(parseInt(it.ans) - 4), String(parseInt(it.ans) * 2), String(parseInt(it.ans) + 1), String(parseInt(it.ans) - 1), String(parseInt(it.ans) + 10), '4a', '3a', '5a', 'a²'];
    return q({ topicId: 'g4b.u5.letter', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ---------- g4b.u5.relation 等量关系 ---------- */
  R('g4b.u5.relation', function (level) {
    var items = [
      { p: '妹妹身高 × 2 = 姚明身高（226 厘米）。妹妹身高是多少？（设妹妹身高为 x）', ans: '2x = 226', e: '妹妹身高的 2 倍等于姚明身高，等量关系：妹妹身高 × 2 = 226，即 2x = 226。' },
      { p: '妹妹身高 + 20 厘米 = 笑笑身高。如果笑笑身高 140 厘米，设妹妹身高为 x，正确的等量关系式是（ ）', ans: 'x + 20 = 140', e: '妹妹身高加上 20 厘米等于笑笑身高：x + 20 = 140。' },
      { p: '故事书比科技书多 500 本，故事书共 1200 本。设科技书有 x 本，正确的方程是（ ）', ans: 'x + 500 = 1200', e: '科技书 + 500 = 故事书，即 x + 500 = 1200。' },
      { p: '妈妈今年 36 岁，是小红年龄的 4 倍。设小红今年 x 岁，正确的方程是（ ）', ans: '4x = 36', e: '小红年龄 × 4 = 妈妈年龄，即 4x = 36。' },
      { p: '天平左边放 1 个苹果和 1 个 20 克砝码，右边放 50 克 + 20 克砝码，天平平衡。设苹果重 x 克，正确的方程是（ ）', ans: 'x + 20 = 70', e: '左边 = 右边：x + 20 = 50 + 20 = 70。' },
      { p: '一辆公共汽车到站后，有 5 人下车，8 人上车，车上现有 15 人。设车上原有 x 人，正确的方程是（ ）', ans: 'x − 5 + 8 = 15', e: '原有人数 − 下车 + 上车 = 现有人数：x − 5 + 8 = 15。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？']);
    var pool = [it.ans.replace(/[+\-×÷=]/g, function (m) { return m === '+' ? '−' : m === '−' ? '+' : m === '×' ? '÷' : m === '÷' ? '×' : '+'; }), it.ans.replace('x', 'y'), it.ans + ' + 10', it.ans + ' − 5', 'x = 36', '2x = 140', 'x − 500 = 1200'];
    return q({ topicId: 'g4b.u5.relation', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ---------- g4b.u5.equation 认识方程 ---------- */
  R('g4b.u5.equation', function (level) {
    var items = [
      { p: '下面哪个是方程？（ ）', ans: '10 = x + 2', e: '含有未知数的等式叫方程。10 = x + 2 既含有未知数 x，又是等式，所以是方程。' },
      { p: '下面哪个是方程？（ ）', ans: '4y = 2000', e: '4y = 2000 含有未知数 y 且是等式，所以是方程。' },
      { p: '下面哪个不是方程？（ ）', ans: 'x − 5 < 8', e: 'x − 5 < 8 含有未知数但不是等式（是不等式），所以不是方程。' },
      { p: '下面哪个不是方程？（ ）', ans: '6 + 3 = 9', e: '6 + 3 = 9 是等式但不含未知数，所以不是方程。' },
      { p: '下面哪个不是方程？（ ）', ans: '4x > 10', e: '4x > 10 含有未知数但不是等式（是不等式），所以不是方程。' },
      { p: '含有未知数的（ ）叫方程', ans: '等式', e: '含有未知数的等式叫方程。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '判断：' + it.p, it.p]);
    var pool = ['10 = x + 2', '4y = 2000', 'x − 5 < 8', '6 + 3 = 9', '4x > 10', '等式', '不等式', '式子', '算式'];
    return q({ topicId: 'g4b.u5.equation', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ---------- g4b.u5.solve1 解方程（加减型） ---------- */
  R('g4b.u5.solve1', function (level) {
    var forms = [
      function () {
        var x = U.randInt(5, 50), b = U.randInt(2, 30);
        return { p: 'x + ' + b + ' = ' + (x + b) + '，x = （ ）', ans: String(x), e: '等式两边同时减 ' + b + '：x + ' + b + ' − ' + b + ' = ' + (x + b) + ' − ' + b + '，x = ' + x + '。' };
      },
      function () {
        var b = U.randInt(5, 20);
        var y = b + U.randInt(5, 40);
        return { p: 'y − ' + b + ' = ' + (y - b) + '，y = （ ）', ans: String(y), e: '等式两边同时加 ' + b + '：y − ' + b + ' + ' + b + ' = ' + (y - b) + ' + ' + b + '，y = ' + y + '。' };
      },
      function () {
        var x = U.randInt(10, 50), b = U.randInt(2, 20);
        return { p: b + ' + x = ' + (x + b) + '，x = （ ）', ans: String(x), e: '等式两边同时减 ' + b + '：x = ' + (x + b) + ' − ' + b + ' = ' + x + '。' };
      },
      function () {
        var x = U.randInt(22, 60);
        return { p: 'x − 19 = ' + (x - 19) + '，x = （ ）', ans: String(x), e: '等式两边同时加 19：x − 19 + 19 = ' + (x - 19) + ' + 19，x = ' + x + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick(['解方程：' + f.p, who() + '解：' + f.p, '求未知数：' + f.p]);
    var baseVal = parseInt(f.ans);
    var pool = [String(baseVal + 1), String(baseVal - 1), String(baseVal + 10), String(baseVal - 10), String(baseVal + 2), String(baseVal * 2), String(baseVal + 5), String(baseVal - 5)];
    return q({ topicId: 'g4b.u5.solve1', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u5.solve2 解方程（乘除型） ---------- */
  R('g4b.u5.solve2', function (level) {
    var forms = [
      function () {
        var x = U.randInt(3, 20), k = U.randInt(2, 9);
        return { p: k + 'x = ' + (x * k) + '，x = （ ）', ans: String(x), e: '等式两边同时除以 ' + k + '：' + k + 'x ÷ ' + k + ' = ' + (x * k) + ' ÷ ' + k + '，x = ' + x + '。' };
      },
      function () {
        var x = U.randInt(3, 20), k = U.randInt(2, 9);
        return { p: 'x ÷ ' + k + ' = ' + x + '，x = （ ）', ans: String(x * k), e: '等式两边同时乘 ' + k + '：x ÷ ' + k + ' × ' + k + ' = ' + x + ' × ' + k + '，x = ' + (x * k) + '。' };
      },
      function () {
        var y = U.randInt(4, 20), k = U.randInt(2, 9);
        return { p: k + 'y = ' + (y * k) + '，y = （ ）', ans: String(y), e: '等式两边同时除以 ' + k + '：y = ' + (y * k) + ' ÷ ' + k + ' = ' + y + '。' };
      },
      function () {
        var x = U.randInt(5, 15), k = U.randInt(2, 9);
        return { p: 'x ÷ 4 = ' + x + '，x = （ ）', ans: String(x * 4), e: '等式两边同时乘 4：x = ' + x + ' × 4 = ' + (x * 4) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick(['解方程：' + f.p, who() + '解：' + f.p, '求未知数：' + f.p]);
    var baseVal = parseInt(f.ans);
    var pool = [String(baseVal + 1), String(baseVal - 1), String(baseVal + 10), String(baseVal - 10), String(baseVal * 2), String(baseVal / 2), String(baseVal + 5), String(baseVal - 5)];
    return q({ topicId: 'g4b.u5.solve2', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u5.word 列方程解决问题 ---------- */
  R('g4b.u5.word', function (level) {
    var forms = [
      function () {
        var x = U.randInt(10, 30), k = U.randInt(2, 5), add = U.randInt(5, 20);
        /* x × k + add = result */
        var result = x * k + add;
        return { p: who() + '心里想一个数 x，把它乘 ' + k + '，再加上 ' + add + '，等于 ' + result + '。x = （ ）', ans: String(x), e: '列方程：' + k + 'x + ' + add + ' = ' + result + '。两边减 ' + add + '：' + k + 'x = ' + (result - add) + '，再除以 ' + k + '：x = ' + x + '。' };
      },
      function () {
        /* 日历：中间数 y，5 个数之和 = 5y */
        var y = U.randInt(8, 24);
        var sum = 5 * y;
        return { p: '日历中，方框中间的数是 y，5 个数之和是 ' + sum + '。中间数 y = （ ）', ans: String(y), e: '日历方框中 5 个数之和 = 中间数 × 5，即 5y = ' + sum + '，y = ' + y + '。' };
      },
      function () {
        var x = U.randInt(10, 30);
        return { p: '公共汽车到站，5 人下车，8 人上车，车上现有 15 人。车上原有 x 人，x = （ ）', ans: String(x), e: '列方程：x − 5 + 8 = 15，x + 3 = 15，x = 12。' };
      },
      function () {
        var x = U.randInt(10, 40), k = U.randInt(2, 5), sub = U.randInt(5, 15);
        var result = x * k - sub;
        return { p: who() + '心里想一个数，乘 ' + k + ' 再减 ' + sub + '，等于 ' + result + '。这个数是（ ）', ans: String(x), e: '列方程：' + k + 'x − ' + sub + ' = ' + result + '。两边加 ' + sub + '：' + k + 'x = ' + (result + sub) + '，x = ' + x + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([f.p, '列方程解决：' + f.p, who() + '遇到一道题：' + f.p]);
    var baseVal = parseInt(f.ans);
    var pool = [String(baseVal + 1), String(baseVal - 1), String(baseVal + 5), String(baseVal - 5), String(baseVal + 10), String(baseVal * 2), String(baseVal + 2), String(baseVal - 2)];
    return q({ topicId: 'g4b.u5.word', level: level, prompt: prompt, correct: f.ans, wrongs: three(f.ans, pool), explain: f.e });
  });

  /* ---------- g4b.u5.tess 密铺 ---------- */
  R('g4b.u5.tess', function (level) {
    var items = [
      { p: '图形之间没有空隙、不重叠地铺在平面上，叫做（ ）', ans: '密铺', e: '图形之间没有空隙，也不重叠，就是密铺。' },
      { p: '下面哪种图形可以密铺？（ ）', ans: '三角形', e: '三角形可以密铺。任意三角形的内角和 180°，6 个同样的三角形在一点处拼成 360°。' },
      { p: '下面哪种图形可以密铺？（ ）', ans: '四边形', e: '四边形可以密铺。任意四边形的内角和 360°，4 个同样的四边形在一点处拼成 360°。' },
      { p: '下面哪种图形不能密铺？（ ）', ans: '正五边形', e: '正五边形每个内角是 108°，3 × 108° = 324° ≠ 360°，不能密铺。' },
      { p: '下面哪种图形可以密铺？（ ）', ans: '正六边形', e: '正六边形每个内角是 120°，3 × 120° = 360°，可以密铺（如蜂巢）。' },
      { p: '用形状、大小完全相同的一种或几种平面图形进行拼接，彼此之间（ ）地铺成一片，就是密铺', ans: '不留空隙、不重叠', e: '密铺的定义：图形之间没有空隙，也不重叠。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([it.p, who() + '想：' + it.p, it.p + ' 正确答案是？']);
    var pool = ['三角形', '四边形', '正五边形', '正六边形', '圆', '密铺', '不留空隙', '可以重叠', '有重叠'];
    return q({ topicId: 'g4b.u5.tess', level: level, prompt: prompt, correct: it.ans, wrongs: three(it.ans, pool), explain: it.e });
  });

  /* ==================== 第六单元：数据的表示和分析 ==================== */

  /* ---------- g4b.u6.bar 读条形统计图 ---------- */
  R('g4b.u6.bar', function (level) {
    var catsChoices = [
      ['周一', '周二', '周三', '周四', '周五'],
      ['一班', '二班', '三班', '四班'],
      ['男生', '女生', '老师'],
      ['红球', '黄球', '蓝球', '绿球', '白球']
    ];
    var cats = U.pick(catsChoices);
    var vals = [];
    var sum = 0;
    for (var i = 0; i < cats.length; i++) { var v = U.randInt(5, 25); vals.push(v); sum += v; }
    /* 问最大值/最小值/某类的值 */
    var maxIdx = 0, minIdx = 0;
    for (var j = 1; j < vals.length; j++) {
      if (vals[j] > vals[maxIdx]) maxIdx = j;
      if (vals[j] < vals[minIdx]) minIdx = j;
    }
    var qType = U.pick(['max', 'min', 'at']);
    var unit = U.pick(['人', '个', '棵', '朵', '箱', '本']);
    var title = U.pick(['人数统计', '数量统计', '产量统计', '销售统计']);
    var ans, prompt;
    if (qType === 'max') {
      ans = vals[maxIdx];
      prompt = U.pick([
        '根据' + title + '（每格 1 人），最多的一组是多少' + unit + '？',
        who() + '看条形统计图，数量最多的一组有多少' + unit + '？',
        '条形统计图中，最高的一组是多少' + unit + '？'
      ]);
    } else if (qType === 'min') {
      ans = vals[minIdx];
      prompt = U.pick([
        '根据' + title + '，最少的一组是多少' + unit + '？',
        who() + '看条形统计图，数量最少的一组有多少' + unit + '？',
        '条形统计图中，最矮的一组是多少' + unit + '？'
      ]);
    } else {
      var idx = U.randInt(0, cats.length - 1);
      ans = vals[idx];
      prompt = U.pick([
        '根据' + title + '，' + cats[idx] + '那组有多少' + unit + '？',
        who() + '看统计图：' + cats[idx] + '对应的数量是多少' + unit + '？',
        '条形统计图中，' + cats[idx] + '对应的柱子表示多少' + unit + '？'
      ]);
    }
    var pool = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 5, ans - 5, ans + 10, Math.max.apply(null, vals), Math.min.apply(null, vals), ans + 3, ans - 3, ans * 2];
    return q({
      topicId: 'g4b.u6.bar', level: level,
      prompt: prompt,
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: unit },
      correct: ans,
      wrongs: three(ans, pool),
      explain: '从条形统计图中读取数据：最高/最矮/指定柱子对应的值是 ' + ans + ' ' + unit + '。'
    });
  });

  /* ---------- g4b.u6.line 读折线统计图 ---------- */
  R('g4b.u6.line', function (level) {
    /* 蒜苗生长数据：第2天1cm、第4天3cm、第6天7cm、第8天10cm、第10天14cm、第12天15cm */
    var scenarios = [
      {
        cats: ['第2天', '第4天', '第6天', '第8天', '第10天', '第12天'],
        vals: [1, 3, 7, 10, 14, 15],
        unit: '厘米',
        title: '蒜苗生长情况'
      },
      {
        cats: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
        vals: [19, 22, 25, 29, 35, 38, 40],
        unit: '万千米',
        title: '高铁营业里程'
      },
      {
        cats: ['周一', '周二', '周三', '周四', '周五'],
        vals: [12, 18, 15, 25, 30],
        unit: '个',
        title: '读书页数'
      }
    ];
    var sc = U.pick(scenarios);
    var vals = sc.vals;
    var cats = sc.cats;
    /* 计算每段增长量 */
    var diffs = [];
    for (var i = 1; i < vals.length; i++) diffs.push(vals[i] - vals[i - 1]);
    var maxDiffIdx = 0;
    for (var j = 1; j < diffs.length; j++) {
      if (diffs[j] > diffs[maxDiffIdx]) maxDiffIdx = j;
    }
    var qType = U.pick(['point', 'max', 'min', 'fastest', 'trend']);
    var ans, prompt, explain;
    if (qType === 'point') {
      var idx = U.randInt(0, vals.length - 1);
      ans = vals[idx];
      prompt = U.pick([
        '根据' + sc.title + '折线统计图，' + cats[idx] + '对应的值是多少' + sc.unit + '？',
        who() + '看折线统计图：' + cats[idx] + '是多少' + sc.unit + '？',
        '折线图中，' + cats[idx] + '那个点的值是多少' + sc.unit + '？'
      ]);
      explain = '从折线统计图中读取：' + cats[idx] + '对应的点的值是 ' + vals[idx] + ' ' + sc.unit + '。';
    } else if (qType === 'max') {
      ans = Math.max.apply(null, vals);
      var maxCat = cats[vals.indexOf(ans)];
      prompt = U.pick([
        '根据' + sc.title + '折线统计图，最高值是多少' + sc.unit + '？',
        who() + '看折线统计图，最大值是多少' + sc.unit + '？'
      ]);
      explain = '折线统计图中最高点在' + maxCat + '，值为 ' + ans + ' ' + sc.unit + '。';
    } else if (qType === 'min') {
      ans = Math.min.apply(null, vals);
      var minCat = cats[vals.indexOf(ans)];
      prompt = U.pick([
        '根据' + sc.title + '折线统计图，最低值是多少' + sc.unit + '？',
        who() + '看折线统计图，最小值是多少' + sc.unit + '？'
      ]);
      explain = '折线统计图中最低点在' + minCat + '，值为 ' + ans + ' ' + sc.unit + '。';
    } else if (qType === 'fastest') {
      ans = cats[maxDiffIdx] + ' 到 ' + cats[maxDiffIdx + 1];
      prompt = U.pick([
        '根据' + sc.title + '折线统计图，哪一段时间增长最快？',
        who() + '看折线统计图，哪一段线段最陡（增长最快）？'
      ]);
      explain = '折线越陡增长越快。从' + cats[maxDiffIdx] + '到' + cats[maxDiffIdx + 1] + '，增长了 ' + diffs[maxDiffIdx] + ' ' + sc.unit + '，是增长最快的一段。';
    } else {
      ans = '整体呈上升趋势';
      prompt = U.pick([
        '根据' + sc.title + '折线统计图，整体趋势是怎样的？',
        who() + '看折线统计图，这几天数据的整体趋势是？'
      ]);
      explain = '从折线统计图可以看出，数据整体呈上升（增长）趋势。';
    }
    var pool;
    if (typeof ans === 'number') {
      pool = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 5, ans - 5, ans + 10, Math.max.apply(null, vals) + 1, Math.min.apply(null, vals) - 1, ans * 2, ans + 3, ans - 3];
    } else {
      pool = ['整体呈下降趋势', '保持不变', '先升后降', '先降后升', '波动变化', '无法判断', '整体呈上升趋势', '以上都不对'];
    }
    return q({
      topicId: 'g4b.u6.line', level: level,
      prompt: prompt,
      canvas: { kind: 'line-chart', categories: cats, values: vals, unit: sc.unit },
      correct: ans,
      wrongs: three(ans, pool),
      explain: explain
    });
  });

  /* ---------- g4b.u6.mean 求平均数 ---------- */
  R('g4b.u6.mean', function (level) {
    var n = level >= 3 ? 5 : 4;
    var vals = [];
    var sum = 0;
    for (var i = 0; i < n - 1; i++) {
      var v = U.randInt(60, 100);
      vals.push(v); sum += v;
    }
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
    var act = U.pick([
      { what: '跳绳', unit: '个' },
      { what: '拍球', unit: '下' },
      { what: '口算', unit: '题' },
      { what: '读书', unit: '页' }
    ]);
    var cls = U.pick(['四（1）班', '四（2）班', '四（3）班', '四（4）班']);
    var prompt = U.pick([
      cls + ' ' + n + ' 名同学每分钟' + act.what + '的个数分别是：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？',
      who() + '统计了 ' + n + ' 位同学每分钟' + act.what + '的成绩：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？',
      n + ' 名同学每分钟' + act.what + '个数：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？'
    ]);
    var pool = [mean + 1, mean - 1, mean + 2, mean - 2, mean + 10, mean - 10, Math.max.apply(null, vals), Math.min.apply(null, vals), mean + 5, mean - 5, mean * 2, Math.max.apply(null, vals) + 1];
    return q({
      topicId: 'g4b.u6.mean', level: level,
      prompt: prompt,
      correct: mean,
      wrongs: three(mean, pool),
      explain: '平均数 = 总数 ÷ 份数 = ' + sum + ' ÷ ' + n + ' = ' + mean + '。'
    });
  });

})(typeof window !== 'undefined' ? window : globalThis);
