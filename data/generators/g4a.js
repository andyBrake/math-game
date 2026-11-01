/* 四年级上册出题器（8 个单元） */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;
  var R = MG.gen.register.bind(MG.gen);

  function q(o) { return MG.q.build(o); }
  function wrongsFrom(correct, pool) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    pool.forEach(function (v) {
      var s = String(v);
      if (!seen[s] && out.length < 3) { seen[s] = true; out.push(s); }
    });
    return out;
  }
  function concept(topicId, level, list) {
    var it = U.pick(list);
    return q({ topicId: topicId, level: level, prompt: it[0], correct: it[1], wrongs: it[2], explain: it[3] });
  }
  /* 从候选池洗牌取 3 个不重复、不等于 correct、非负（仅对数值）的干扰项 */
  function pick3(correct, pool) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    U.shuffle(pool).forEach(function (v) {
      var s = String(v);
      if (seen[s]) return;
      if (/^\d+(\.\d+)?$/.test(s) && Number(s) < 0) return;
      seen[s] = true; out.push(s);
    });
    return out.slice(0, 3);
  }
  var NAMES = ['小明', '小红', '小刚', '小丽', '小强', '小芳', '小军', '小梅', '小华', '小勇', '小燕', '小亮', '小杰', '小娟', '小涛', '小琴'];

  /* ---------- 读数辅助 ---------- */
  var DIG = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var POS = ['', '十', '百', '千'];

  function readGroup(n) {
    var str = String(n), s = '', zero = false;
    for (var i = 0; i < str.length; i++) {
      var d = +str[i], p = str.length - 1 - i;
      if (d === 0) { if (s) zero = true; }
      else {
        if (zero) { s += '零'; zero = false; }
        s += DIG[d] + POS[p];
      }
    }
    if (s.slice(0, 2) === '一十') s = s.slice(1);
    return s;
  }
  function readNum(n) {
    if (n === 0) return '零';
    var wan = Math.floor(n / 10000), rest = n % 10000, s = '';
    if (wan > 0) s += readGroup(wan) + '万';
    if (rest > 0) {
      if (wan > 0 && rest < 1000) s += '零';
      s += readGroup(rest);
    }
    return s;
  }
  function digitVariants(n) {
    var s = String(n), out = [];
    for (var i = 1; i < s.length; i++) {
      if (s[i] === '0') out.push(Number(s.slice(0, i) + s.slice(i + 1)));
      else out.push(Number(s.slice(0, i) + '0' + s.slice(i)));
    }
    out.push(n + 1, n + 10, n + 100, n - 10, n - 100);
    return out.filter(function (v) {
      return v > 0 && v !== n && String(v).length === s.length;
    });
  }

  /* ---------- 1.1 大数的认识：读数 ---------- */
  R('g4a.u1.read', function (level) {
    var digits = level >= 3 ? 8 : (level === 2 ? 7 : 6);
    var n = U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    n = Math.floor(n / 10) * 10; // 让末尾为 0，更贴近教材
    var correct = readNum(n);
    var who = U.pick(NAMES);
    var prompt = U.pick([
      '下面各数中，' + n + ' 读作：',
      who + '在计数器上拨出了 ' + n + '，这个数读作：',
      '读出下面的数：' + n,
      '比一比，' + n + ' 正确的读法是：',
      '写作 ' + n + ' 的数，读出来是：',
      '算盘上表示的数是 ' + n + '，它读作：',
      '把 ' + n + ' 读出来，正确的是：'
    ]);
    var cands = digitVariants(n).map(readNum).filter(function (s) {
      return s && s.indexOf('undefined') < 0 && s !== correct;
    });
    return q({
      topicId: 'g4a.u1.read', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: pick3(correct, cands),
      explain: n + ' 读作：' + correct + '。读数时从高位读起，每级末尾的 0 不读，中间连续的 0 只读一个零。'
    });
  });

  /* ---------- 1.2 大数的认识：写法 ---------- */
  R('g4a.u1.write', function (level) {
    var digits = level >= 3 ? 8 : (level === 2 ? 7 : 5);
    var n = U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var reading = readNum(n);
    return q({
      topicId: 'g4a.u1.write', level: level,
      prompt: '「' + reading + '」写作：',
      correct: String(n),
      wrongs: digitVariants(n),
      explain: reading + ' 写作 ' + n + '。写数时从高位起，哪一位上一个单位也没有就写 0。'
    });
  });

  /* ---------- 1.3 大数的认识：比较大小 ---------- */
  R('g4a.u1.compare', function (level) {
    var digits = level >= 3 ? 8 : (level === 2 ? 7 : 5);
    var set = [];
    while (set.length < 4) {
      var v = U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
      if (set.indexOf(v) === -1) set.push(v);
    }
    var sorted = set.slice().sort(function (a, b) { return b - a; });
    var listStr = set.join('、');
    var mode = U.pick(['max', 'min', 'secondMax', 'secondMin']);
    var correct, prompt, head;
    if (mode === 'max') {
      correct = sorted[0];
      head = U.pick(['在 ' + listStr + ' 这些数中，最大的是',
        '把 ' + listStr + ' 从大到小排，排在最前面的是',
        listStr + ' 四个数里，最大的数是']);
    } else if (mode === 'min') {
      correct = sorted[3];
      head = U.pick(['在 ' + listStr + ' 这些数中，最小的是',
        '把 ' + listStr + ' 从小到大排，排在最前面的是',
        listStr + ' 四个数里，最小的数是']);
    } else if (mode === 'secondMax') {
      correct = sorted[1];
      head = U.pick(['把 ' + listStr + ' 从大到小排列，排在第二的是',
        listStr + ' 中，第二大的数是',
        '在 ' + listStr + ' 里，比最大的数小一点的是']);
    } else {
      correct = sorted[2];
      head = U.pick(['把 ' + listStr + ' 从小到大排列，排在第二的是',
        listStr + ' 中，第二小的数是',
        '在 ' + listStr + ' 里，比最小的数大一点的是']);
    }
    prompt = head + '（ ）';
    return q({
      topicId: 'g4a.u1.compare', level: level,
      prompt: prompt,
      correct: String(correct),
      wrongs: pick3(correct, sorted.filter(function (v) { return v !== correct; }).concat([correct * 10, Math.floor(correct / 10), correct + digits * 1000])),
      explain: '比较位数相同的数，要从最高位开始逐位比较；' +
        (mode === 'max' ? '最大的是 ' : mode === 'min' ? '最小的是 ' :
          mode === 'secondMax' ? '第二大的是 ' : '第二小的是 ') + correct + '。'
    });
  });

  /* ---------- 1.4 大数的认识：改写与近似数 ---------- */
  R('g4a.u1.round', function (level) {
    if (level === 1) {
      var w = U.randInt(12, 980);
      var n = w * 10000;
      var ans1 = w + '万';
      var p1 = U.pick([
        '把 ' + n + ' 改写成用「万」作单位的数是：',
        n + ' = （ ）万，括号里应填：',
        '将 ' + n + ' 写成以「万」为单位，是：',
        '把整万数 ' + n + ' 改写后是：',
        '用「万」作单位表示 ' + n + '，正确的是：'
      ]);
      return q({
        topicId: 'g4a.u1.round', level: level,
        prompt: p1,
        correct: ans1,
        wrongs: pick3(ans1, [(w * 10) + '万', (w + 1) + '万', (w * 100) + '万', (w - 1) + '万', (w * 1000) + '万', w + '']),
        explain: '改写成用「万」作单位，去掉末尾的 4 个 0，再写上「万」字：' + n + ' = ' + w + '万。'
      });
    }
    var num = U.randInt(Math.pow(10, 5), Math.pow(10, 7) - 1);
    var rounded = Math.round(num / 10000);
    var ans2 = rounded + '万';
    var p2 = U.pick([
      '省略 ' + num + ' 万位后面的尾数，约是：',
      '用四舍五入法求 ' + num + ' 的近似数（精确到万位）是：',
      '把 ' + num + ' 改写成用「万」作单位的近似数，约是：',
      num + ' ≈ （ ）万（省略万位后面的尾数）',
      '省略万位后面的尾数，' + num + ' 大约是：'
    ]);
    return q({
      topicId: 'g4a.u1.round', level: level,
      prompt: p2,
      correct: ans2,
      wrongs: pick3(ans2, [(rounded + 1) + '万', (rounded - 1) + '万', (rounded * 10) + '万', (rounded + 2) + '万', (rounded - 2) + '万', rounded + '']),
      explain: '省略万位后面的尾数要看千位：' + num + ' 的千位是 ' + Math.floor(num / 1000) % 10 +
        '，' + (Math.floor(num / 1000) % 10 >= 5 ? '满 5 向前一位进 1' : '不满 5 直接舍去') + '，所以约是 ' + rounded + '万。'
    });
  });

  /* ---------- 2.1 公顷和平方千米：换算 ---------- */
  R('g4a.u2.convert', function (level) {
    var k = level >= 3 ? U.randInt(2, 20) : U.randInt(1, 15);
    var dir = U.pick(['ha2m2', 'km2ha', 'km2m2', 'm2ha', 'ha2km2']);
    var ans, ask, unit;
    if (dir === 'ha2m2') { ans = k * 10000; unit = '平方米'; ask = k + ' 公顷 = （ ）平方米'; }
    else if (dir === 'km2ha') { ans = k * 100; unit = '公顷'; ask = k + ' 平方千米 = （ ）公顷'; }
    else if (dir === 'km2m2') { ans = k * 1000000; unit = '平方米'; ask = k + ' 平方千米 = （ ）平方米'; }
    else if (dir === 'm2ha') { ans = k; unit = '公顷'; ask = (k * 10000) + ' 平方米 = （ ）公顷'; }
    else { ans = k; unit = '平方千米'; ask = (k * 100) + ' 公顷 = （ ）平方千米'; }
    var p = U.pick([
      ask,
      '填一填：' + ask,
      '在括号里填上合适的数：' + ask,
      '想一想，' + ask.replace(' = （ ）', ' 是多少？'),
      '单位换算：' + ask
    ]);
    var pool = [ans * 10, ans * 100, ans + 100, ans - 100, Math.floor(ans / 10), ans + 1, ans * 2];
    if (dir === 'm2ha' || dir === 'ha2km2') pool = [ans * 10, ans + 1, ans * 100, ans - 1, ans * 2, Math.floor(ans / 10)];
    return q({
      topicId: 'g4a.u2.convert', level: level,
      prompt: p,
      correct: ans,
      wrongs: pick3(ans, pool),
      explain: '1 公顷 = 10000 平方米，1 平方千米 = 100 公顷 = 1000000 平方米。答案：' + ans + ' ' + unit + '。'
    });
  });

  /* ---------- 2.2 公顷和平方千米：选择单位 ---------- */
  R('g4a.u2.unit', function (level) {
    var ALL = ['平方厘米', '平方分米', '平方米', '公顷', '平方千米'];
    var sc = U.pick([
      { obj: '一张邮票的面积', unit: '平方厘米', lo: 4, hi: 9 },
      { obj: '一块小手帕的面积', unit: '平方分米', lo: 3, hi: 6 },
      { obj: '一张课桌面的面积', unit: '平方分米', lo: 20, hi: 32 },
      { obj: '教室地面的面积', unit: '平方米', lo: 50, hi: 72 },
      { obj: '一块黑板面的面积', unit: '平方米', lo: 3, hi: 7 },
      { obj: '一个操场的面积', unit: '公顷', lo: 1, hi: 3 },
      { obj: '一座街心公园的面积', unit: '公顷', lo: 20, hi: 60 },
      { obj: '天安门广场的面积', unit: '公顷', lo: 40, hi: 50 },
      { obj: '一座小县城的面积', unit: '平方千米', lo: 80, hi: 130 },
      { obj: '一座城市的面积', unit: '平方千米', lo: 500, hi: 1300 }
    ]);
    var a = U.randInt(sc.lo, sc.hi);
    var correct = a + ' ' + sc.unit;
    var wrongOpts = ALL.filter(function (u) { return u !== sc.unit; }).map(function (u) { return a + ' ' + u; });
    var who = U.pick(NAMES);
    var prompt = U.pick([
      sc.obj + '大约是 ' + a + '（ ），括号里应填哪个单位？',
      who + '估计' + sc.obj + '大约是 ' + a + '，用什么面积单位合适？',
      '下面说法中，' + sc.obj + '大约是 ' + a + '，选哪个单位？',
      '填上合适的面积单位：' + sc.obj + ' ≈ ' + a + '（ ）',
      '量一量、估一估：' + sc.obj + '大约是 ' + a + '（ ）'
    ]);
    return q({
      topicId: 'g4a.u2.unit', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: pick3(correct, wrongOpts),
      explain: sc.obj + '用' + sc.unit + '计量比较合适，所以大约是 ' + a + ' ' + sc.unit + '。'
    });
  });

  /* ---------- 3.1 角的度量：分类 ---------- */
  R('g4a.u3.classify', function (level) {
    var types = ['锐角', '直角', '钝角', '平角', '周角'];
    var rule = '小于 90° 是锐角，等于 90° 是直角，大于 90° 小于 180° 是钝角，等于 180° 是平角。';
    var m = U.randInt(2, 19);
    var who = U.pick(NAMES);
    var canvasMode = Math.random() < 0.35;

    function degFor(kind) {
      if (kind === '直角') return 90;
      if (kind === '平角') return 180;
      if (kind === '周角') return 360;
      if (kind === '锐角') return U.randInt(15, 85);
      return U.randInt(95, 175);
    }

    if (canvasMode) {
      var kind = U.pick(['锐角', '直角', '钝角', '平角']);
      var deg = degFor(kind);
      var prompt = U.pick([
        '第 ' + m + ' 组的' + who + '量出图中这个角是 ' + deg + '°，它属于（ ）角',
        who + '用量角器测得图中这个角为 ' + deg + '°，按角的分类它是：',
        '观察图中这个 ' + deg + '° 的角，' + who + '说它是（ ）角'
      ]);
      return q({
        topicId: 'g4a.u3.classify', level: level,
        prompt: prompt,
        canvas: { kind: 'angle', deg: deg },
        correct: kind,
        wrongs: pick3(kind, types),
        explain: deg + '° 的角是' + kind + '。' + rule
      });
    }

    /* 数字型：问哪个度数属于某类，选项为度数（可洗牌散开） */
    var kind2 = U.pick(['锐角', '直角', '钝角', '平角']);
    var d = degFor(kind2);
    var pool = [];
    var tries = 0;
    while (pool.length < 28 && tries < 200) {
      var cand = U.randInt(1, 36) * 5;
      if (pool.indexOf(cand) === -1 && cand !== d) pool.push(cand);
      tries++;
    }
    var prompt2 = U.pick([
      '第 ' + m + ' 组测量，下面哪个度数表示一个' + kind2 + '？',
      who + '在第 ' + m + ' 组要找一个' + kind2 + '，下面哪个度数合适？',
      '下面各度数中，属于' + kind2 + '的是哪一个？（第 ' + m + ' 小组的' + who + '量的）',
      '用量角器量角时，第 ' + m + ' 组的' + who + '想找一个' + kind2 + '，度数可能是下面哪个？'
    ]);
    return q({
      topicId: 'g4a.u3.classify', level: level,
      prompt: prompt2,
      correct: d + '°',
      wrongs: pick3(d + '°', pool.map(function (x) { return x + '°'; })),
      explain: kind2 + '的范围：' + (kind2 === '锐角' ? '小于 90°' : kind2 === '直角' ? '等于 90°' : kind2 === '钝角' ? '大于 90° 且小于 180°' : '等于 180°') + '，所以 ' + d + '° 是' + kind2 + '。' + rule
    });
  });

  /* ---------- 3.2 角的度量：角度计算 ---------- */
  R('g4a.u3.sum', function (level) {
    var forms = [
      { total: 90, name: '直角' },
      { total: 180, name: '平角' },
      { total: 360, name: '周角' }
    ];
    var f = U.pick(forms);
    var a = U.randInt(15, f.total - 15);
    if (f.total === 90 && a > 75) a = 75;
    var ans = f.total - a;
    var who = U.pick(NAMES);
    var prompt = U.pick([
      '∠1 和 ∠2 组成一个' + f.name + '，已知 ∠1 = ' + a + '°，那么 ∠2 = （ ）',
      who + '发现两个角拼成一个' + f.name + '，其中一个是 ' + a + '°，另一个是（ ）°',
      '一个' + f.name + '被分成两个角，一个角是 ' + a + '°，另一个角是多少度？',
      '已知 ∠1 + ∠2 = ' + f.total + '°（一个' + f.name + '），∠1 = ' + a + '°，求 ∠2。',
      '两个角正好拼成一个' + f.name + '，较大角是 ' + a + '°，较小角是（ ）°'
    ]);
    return q({
      topicId: 'g4a.u3.sum', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: pick3(ans, [f.total + a, a, ans + 10, ans - 10, ans + 20, ans + 5]),
      explain: f.name + '是 ' + f.total + '°，所以 ∠2 = ' + f.total + '° − ' + a + '° = ' + ans + '°。'
    });
  });

  /* ---------- 3.3 角的度量：量角器读数（改为选择） ---------- */
  R('g4a.u3.protractor', function (level) {
    var deg = U.randInt(3, 33) * 5; // 15 ~ 165
    var m = U.randInt(2, 19);
    var who = U.pick(NAMES);
    var pool = [];
    var tries = 0;
    while (pool.length < 14 && tries < 80) {
      var cand = U.randInt(1, 36) * 5;
      if (pool.indexOf(cand) === -1 && cand !== deg) pool.push(cand);
      tries++;
    }
    var prompts = [
      '第 ' + m + ' 组的' + who + '看量角器，这个角是多少度？',
      who + '在第 ' + m + ' 组用量角器测量，图中这个角的度数是：',
      '第 ' + m + ' 组观察量角器，从 0° 刻度线到这个角是多少度？',
      '量角器上这条边所指的刻度是多少？第 ' + m + ' 组的' + who + '读出（ ）°',
      '第 ' + m + ' 组的' + who + '测量，下图量角器测得的角度数是：'
    ];
    return q({
      topicId: 'g4a.u3.protractor', level: level,
      prompt: U.pick(prompts),
      canvas: { kind: 'protractor', deg: deg },
      correct: deg,
      wrongs: pick3(deg, pool),
      explain: '量角时角的顶点对准中心点，一条边对准 0° 刻度线，另一条边所指的刻度就是角的度数，这里是 ' + deg + '°。'
    });
  });

  /* ---------- 4.1 三位数乘两位数：笔算 ---------- */
  R('g4a.u4.mul', function (level) {
    var a = level >= 3 ? U.randInt(300, 999) : U.randInt(120, 899);
    var b = level >= 3 ? U.randInt(25, 99) : U.randInt(12, 89);
    var ans = a * b;
    var prompt = U.pick([
      a + ' × ' + b + ' = （ ）',
      '计算：' + a + ' × ' + b + ' = （ ）',
      a + ' 乘 ' + b + '，积是（ ）',
      '（ ）= ' + a + ' × ' + b,
      '用竖式算一算：' + a + ' × ' + b + ' = （ ）',
      a + ' × ' + b + ' 的结果是（ ）',
      b + ' 个 ' + a + ' 相加的和是（ ）'
    ]);
    return q({
      topicId: 'g4a.u4.mul', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: [ans + a * 10, ans - a, Number(String(ans) + '0'), ans + 100, ans - 100, ans + 10],
      explain: '先用 ' + a + ' 乘个位上的 ' + (b % 10) + '，再用 ' + a + ' 乘十位上的 ' + Math.floor(b / 10) +
        '（积的末位与十位对齐），最后相加得 ' + ans + '。'
    });
  });

  /* ---------- 4.2 三位数乘两位数：积的变化规律 ---------- */
  R('g4a.u4.rule', function (level) {
    var k = U.pick([2, 3, 4, 5, 10]);
    var a = k * U.randInt(3, 8);
    var b = k * U.randInt(4, 10);
    var c = a * b;
    var forms = [
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 ' + a + ' × ' + (b * k) + ' = （ ）', ans: c * k, e: '一个因数不变，另一个因数乘 ' + k + '，积也乘 ' + k + '。' },
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × ' + k + ') × (' + b + ' ÷ ' + k + ') = （ ）', ans: c, e: '一个因数乘 ' + k + '，另一个因数除以 ' + k + '，积不变。' },
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × 2) × (' + b + ' × 3) = （ ）', ans: c * 6, e: '两个因数分别乘 2 和乘 3，积就乘 2 × 3 = 6。' },
      { p: '根据 ' + a + ' × ' + b + ' = ' + c + '，可以推出 ' + a + ' × (' + b + ' ÷ ' + k + ') = （ ）', ans: c / k, e: '一个因数不变，另一个因数除以 ' + k + '，积也除以 ' + k + '。' },
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，想一想：(' + a + ' ÷ ' + k + ') × ' + b + ' = （ ）', ans: a / k * b, e: '一个因数除以 ' + k + '，另一个因数不变，积也除以 ' + k + '。' }
    ];
    var f = U.pick(forms);
    var p = U.pick([f.p, f.p.replace(' = （ ）', '，结果是（ ）'), '算一算：' + f.p]);
    return q({
      topicId: 'g4a.u4.rule', level: level,
      prompt: p,
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans / k, f.ans * k, f.ans + k * 10, c, f.ans + 100]),
      explain: f.e + '所以结果是 ' + f.ans + '。'
    });
  });

  /* ---------- 4.3 三位数乘两位数：单价与速度 ---------- */
  R('g4a.u4.word', function (level) {
    var a = U.randInt(105, 480), b = U.randInt(12, 45);
    var forms = [
      { p: '一套校服 ' + a + ' 元，买 ' + b + ' 套一共需要多少元？', ans: a * b, e: '总价 = 单价 × 数量 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 元。' },
      { p: '一辆汽车每小时行 ' + a + ' 千米，' + b + ' 小时行多少千米？', ans: a * b, e: '路程 = 速度 × 时间 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 千米。' },
      { p: '每千克苹果 ' + a + ' 元，妈妈买了 ' + b + ' 千克，应付多少元？', ans: a * b, e: '总价 = 单价 × 数量 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 元。' },
      { p: '图书室每个书架放 ' + a + ' 本书，' + b + ' 个书架一共放多少本？', ans: a * b, e: '总数 = 每个书架本数 × 书架个数 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 本。' },
      { p: '一台打印机每分钟打印 ' + a + ' 页，连续打印 ' + b + ' 分钟，共打印多少页？', ans: a * b, e: '工作总量 = 效率 × 时间 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 页。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u4.word', level: level,
      prompt: f.p,
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + a, f.ans - b, f.ans * 10, f.ans + b, f.ans - a]),
      explain: f.e
    });
  });

  /* ---------- 5.1 平行四边形和梯形：垂直与平行 ---------- */
  R('g4a.u5.parallel', function (level) {
    var POOL = ['平行线', '垂线', '垂直线段', '斜线段', '距离', '射线', '线段', '直线', '相交线', '平行线间的距离', '互相垂直', '互相平行', '延长线', '重合'];
    var who = U.pick(NAMES);
    var m = U.randInt(2, 19);
    var mode = U.pick(['def', 'perp', 'short', 'dist']);
    var correct, prompt, explain;
    if (mode === 'def') {
      correct = '平行线';
      prompt = U.pick([
        '第 ' + m + ' 组的' + who + '画了同一平面内永不相交的两条直线，它们叫做（ ）',
        who + '在练习本上画了两条不相交的直线，第 ' + m + ' 组把它们叫做（ ）',
        '同一平面内不相交的两条直线，' + who + '说它们是（ ）'
      ]);
      explain = '同一平面内不相交的两条直线互相平行，这两条直线叫做平行线。';
    } else if (mode === 'perp') {
      correct = '互相垂直';
      prompt = U.pick([
        who + '画的两条直线相交成直角，就说这两条直线（ ）',
        '第 ' + m + ' 组中两条直线相交成 90°，它们的位置关系是（ ）',
        who + '发现两条直线相交成直角，这两条直线互相（ ）'
      ]);
      explain = '两条直线相交成直角时互相垂直，其中一条是另一条的垂线。';
    } else if (mode === 'short') {
      correct = '垂直线段';
      prompt = U.pick([
        '从直线外一点到这条直线所画的各条线段中，第 ' + m + ' 组的' + who + '发现（ ）最短',
        who + '量了从一点到直线的几条连线，最短的那条是（ ）',
        '点到直线的所有连线中最短的是（ ）（第 ' + m + ' 组测量）'
      ]);
      explain = '点到直线的所有线段中，垂直线段最短，它的长度叫做点到直线的距离。';
    } else {
      correct = '处处相等';
      prompt = U.pick([
        who + '量了两条平行线之间几处的垂直线段长度，发现它们（ ）',
        '第 ' + m + ' 组测量两条平行线间的距离，结果是（ ）',
        '两条平行线之间的距离，' + who + '量后发现（ ）'
      ]);
      explain = '平行线之间的垂直线段长度处处相等。';
    }
    return q({
      topicId: 'g4a.u5.parallel', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: pick3(correct, POOL),
      explain: explain
    });
  });

  /* ---------- 5.2 平行四边形和梯形：图形特征 ---------- */
  R('g4a.u5.shape', function (level) {
    var POOL = ['梯形', '平行四边形', '长方形', '正方形', '三角形', '圆', '无数条', '一条', '两条', '四条', '稳定性', '不稳定性', '对称性', '五边形'];
    var who = U.pick(NAMES);
    var m = U.randInt(2, 19);
    var mode = U.pick(['trap', 'para', 'height', 'rect', 'deform']);
    var correct, prompt, explain;
    if (mode === 'trap') {
      correct = '梯形';
      prompt = U.pick([
        who + '画了一个只有一组对边平行的四边形，第 ' + m + ' 组说它是（ ）',
        '只有一组对边平行的四边形叫做（ ）',
        '一个四边形只有一组对边平行，第 ' + m + ' 组的' + who + '说它是（ ）'
      ]);
      explain = '只有一组对边平行的四边形是梯形；两组对边都平行的是平行四边形。';
    } else if (mode === 'para') {
      correct = '平行四边形';
      prompt = U.pick([
        who + '画了两组对边分别平行的四边形，第 ' + m + ' 组叫它（ ）',
        '两组对边分别平行的四边形叫做（ ）',
        who + '在钉子板上围出两组对边分别平行的四边形，这是（ ）'
      ]);
      explain = '两组对边分别平行的四边形是平行四边形。';
    } else if (mode === 'height') {
      correct = '无数条';
      prompt = U.pick([
        '第 ' + m + ' 组的' + who + '发现平行四边形一条边上可以作（ ）条高',
        '从平行四边形一条边上任意一点向对边作垂线，能作（ ）条高',
        who + '数平行四边形的高，发现它有（ ）条高（第 ' + m + ' 组）'
      ]);
      explain = '从平行四边形一条边上任意一点向对边作垂线都是高，所以有无数条。';
    } else if (mode === 'rect') {
      correct = '平行四边形';
      prompt = U.pick([
        who + '说长方形是特殊的（ ），第 ' + m + ' 组同意吗？',
        '长方形的两组对边分别平行，所以它是特殊的（ ）',
        '第 ' + m + ' 组讨论：长方形属于特殊的（ ）'
      ]);
      explain = '长方形的两组对边分别平行，所以是特殊的平行四边形。';
    } else {
      correct = '不稳定性';
      prompt = U.pick([
        who + '发现平行四边形一拉就变形，这种特性叫做（ ）',
        '第 ' + m + ' 组用手拉动平行四边形框架，它容易变形，这叫（ ）',
        '平行四边形容易变形，这种特性和三角形的稳定性相反，叫做（ ）'
      ]);
      explain = '平行四边形具有不稳定性，三角形具有稳定性。';
    }
    return q({
      topicId: 'g4a.u5.shape', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: pick3(correct, POOL),
      explain: explain
    });
  });

  /* ---------- 6.1 除数是两位数的除法：估算 ---------- */
  R('g4a.u6.estimate', function (level) {
    var d0 = U.randInt(2, 9) * 10;
    var quo = U.randInt(2, 9);
    var d = d0 + U.randInt(-4, 4);
    var dividend = d0 * quo + U.randInt(-9, 9);
    if (dividend <= 0) dividend = d0 * quo;
    var pool = [quo - 1, quo + 1, quo - 2, quo + 2, quo * 10, quo * 2, quo + 10, quo + 3];
    var p = U.pick([
      '估算：' + dividend + ' ÷ ' + d + ' ≈ （ ）',
      '估一估，' + dividend + ' ÷ ' + d + ' 大约得多少？',
      '不计算，估计 ' + dividend + ' ÷ ' + d + ' 的商约是（ ）',
      '把除数看作整十数估算：' + dividend + ' ÷ ' + d + ' ≈ （ ）'
    ]);
    return q({
      topicId: 'g4a.u6.estimate', level: level,
      prompt: p,
      correct: quo,
      wrongs: pick3(quo, pool),
      explain: '把 ' + d + ' 看作 ' + d0 + '，把 ' + dividend + ' 看作 ' + (d0 * quo) + '，' + (d0 * quo) + ' ÷ ' + d0 + ' = ' + quo + '。'
    });
  });

  /* ---------- 6.2 除数是两位数的除法：笔算 ---------- */
  R('g4a.u6.div', function (level) {
    var d, quo, tries = 0;
    do {
      d = U.randInt(11, 89);
      quo = level >= 3 ? U.randInt(10, 40) : U.randInt(2, 9);
      tries++;
    } while (d * quo < 100 && tries < 40);
    var dividend = d * quo;
    var pool = [quo + 1, quo - 1, quo + 2, quo - 2, quo * 10, quo * 2, quo + 10, quo + 3];
    var p = U.pick([
      dividend + ' ÷ ' + d + ' = （ ）',
      '用竖式计算：' + dividend + ' ÷ ' + d + ' = （ ）',
      '算一算，' + dividend + ' 里面有多少个 ' + d + '？商是（ ）',
      '（ ）= ' + dividend + ' ÷ ' + d,
      '列竖式求 ' + dividend + ' ÷ ' + d + ' 的商：'
    ]);
    return q({
      topicId: 'g4a.u6.div', level: level,
      prompt: p,
      correct: quo,
      wrongs: pick3(quo, pool),
      explain: '把 ' + d + ' 看作 ' + (Math.round(d / 10) * 10) + ' 试商，' + d + ' × ' + quo + ' = ' + dividend + '，所以商是 ' + quo + '。'
    });
  });

  /* ---------- 6.3 除数是两位数的除法：商的变化规律 ---------- */
  R('g4a.u6.rule', function (level) {
    var k = U.pick([2, 3, 5]);
    var base = k * U.randInt(2, 12);
    var b = k * U.randInt(1, 3);
    var a = base * b;
    var mode = U.pick(['bothMul', 'divMul', 'dividendMul', 'bothDiv']);
    var correct, prompt;
    if (mode === 'bothMul') {
      correct = base;
      prompt = U.pick([
        '已知 ' + a + ' ÷ ' + b + ' = ' + base + '，若被除数和除数同时乘 ' + k + '，商是（ ）',
        a + ' ÷ ' + b + ' = ' + base + '。被除数、除数都乘 ' + k + ' 后，商变成（ ）'
      ]);
    } else if (mode === 'divMul') {
      correct = base / k;
      prompt = U.pick([
        '已知 ' + a + ' ÷ ' + b + ' = ' + base + '，被除数不变，除数乘 ' + k + '，商是（ ）',
        a + ' ÷ ' + b + ' = ' + base + '。除数变成 ' + (b * k) + '（被除数不变），商是（ ）'
      ]);
    } else if (mode === 'dividendMul') {
      correct = base * k;
      prompt = U.pick([
        '已知 ' + a + ' ÷ ' + b + ' = ' + base + '，除数不变，被除数乘 ' + k + '，商是（ ）',
        a + ' ÷ ' + b + ' = ' + base + '。被除数变成 ' + (a * k) + '（除数不变），商是（ ）'
      ]);
    } else {
      correct = base;
      prompt = U.pick([
        '已知 ' + a + ' ÷ ' + b + ' = ' + base + '，被除数和除数同时除以 ' + k + '，商是（ ）',
        a + ' ÷ ' + b + ' = ' + base + '。被除数、除数都除以 ' + k + ' 后，商是（ ）'
      ]);
    }
    return q({
      topicId: 'g4a.u6.rule', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: pick3(correct, [base * k, base / k, base * 10, base + k, base + 10]),
      explain: mode === 'bothMul' || mode === 'bothDiv'
        ? '被除数和除数同时乘或除以相同的数（0 除外），商不变，所以商仍是 ' + correct + '。'
        : mode === 'divMul'
          ? '被除数不变，除数乘 ' + k + '，商反而除以 ' + k + '：' + base + ' ÷ ' + k + ' = ' + correct + '。'
          : '除数不变，被除数乘 ' + k + '，商也乘 ' + k + '：' + base + ' × ' + k + ' = ' + correct + '。'
    });
  });

  /* ---------- 7.1 条形统计图：读图 ---------- */
  var BARTYPES = [
    ['一月', '二月', '三月', '四月', '五月', '六月'],
    ['语文', '数学', '英语', '科学', '体育', '音乐'],
    ['苹果', '香蕉', '橘子', '葡萄', '西瓜', '桃子'],
    ['跳绳', '踢球', '跑步', '游泳', '乒乓', '篮球'],
    ['一班', '二班', '三班', '四班', '五班', '六班'],
    ['小猫', '小狗', '兔子', '仓鼠', '鹦鹉', '金鱼'],
    ['米饭', '面条', '包子', '饺子', '馒头', '粥'],
    ['红色', '黄色', '蓝色', '绿色', '黑色', '白色'],
    ['周一', '周二', '周三', '周四', '周五', '周六'],
    ['铅笔', '橡皮', '尺子', '本子', '书包', '水杯']
  ];
  var BARTITLES = ['最喜欢的科目', '爱吃的水果', '喜欢的运动', '各班人数', '各月销量', '喜爱的宠物', '爱吃的主食', '喜欢的颜色', '每周安排', '文具数量'];

  function makeBars(count, maxVal) {
    var full = U.pick(BARTYPES);
    var cats = full.slice(0, count);
    var vals = [];
    while (vals.length < count) {
      var v = U.randInt(5, maxVal);
      if (vals.indexOf(v) === -1) vals.push(v);
    }
    return { cats: cats, vals: vals, title: U.pick(BARTITLES) };
  }

  R('g4a.u7.read', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 45);
    var idx = U.randInt(0, d.cats.length - 1);
    var ans = d.vals[idx];
    var others = d.vals.filter(function (_, i) { return i !== idx; });
    while (others.length < 3) others.push(others[0] + 1);
    var who = U.pick(NAMES);
    var prompt = U.pick([
      '根据统计图（' + d.title + '），' + d.cats[idx] + '有多少？',
      who + '看了下面的统计图，' + d.cats[idx] + '对应的数量是多少？',
      '从条形图中读出：' + d.cats[idx] + '这一项是多少？',
      d.title + '统计图里，' + d.cats[idx] + '这一格直条表示多少？'
    ]);
    return q({
      topicId: 'g4a.u7.read', level: level,
      prompt: prompt,
      canvas: { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' },
      correct: ans,
      wrongs: pick3(ans, others.concat([ans + 1, ans - 1, ans + 5])),
      explain: '看 ' + d.cats[idx] + ' 对应的直条，顶端对准的刻度是 ' + ans + '。'
    });
  });

  /* ---------- 7.2 条形统计图：比较 ---------- */
  R('g4a.u7.compare', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 50);
    var max = Math.max.apply(null, d.vals);
    var min = Math.min.apply(null, d.vals);
    var sum = d.vals.reduce(function (a, b) { return a + b; }, 0);
    var mode = U.pick(['max', 'min', 'diff', 'total']);
    var mi = d.vals.indexOf(max);
    var ni = d.vals.indexOf(min);
    var canvas = { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' };
    var who = U.pick(NAMES);
    if (mode === 'max') {
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: U.pick([
          who + '看统计图（' + d.title + '），' + d.cats.join('、') + ' 里数量最多的是哪一个？',
          d.cats.join('、') + ' 中（' + d.title + '），直条最高、数量最多的是哪一项？'
        ]),
        canvas: canvas,
        correct: d.cats[mi],
        wrongs: pick3(d.cats[mi], d.cats.filter(function (_, i) { return i !== mi; }).concat(['一样多', '无法确定'])),
        explain: '直条最高的 ' + d.cats[mi] + ' 数量最多，是 ' + max + '。'
      });
    }
    if (mode === 'min') {
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: U.pick([
          who + '看统计图（' + d.title + '），' + d.cats.join('、') + ' 里数量最少的是哪一个？',
          d.cats.join('、') + ' 中（' + d.title + '），直条最矮、数量最少的是哪一项？'
        ]),
        canvas: canvas,
        correct: d.cats[ni],
        wrongs: pick3(d.cats[ni], d.cats.filter(function (_, i) { return i !== ni; }).concat(['一样多', '无法确定'])),
        explain: '直条最矮的 ' + d.cats[ni] + ' 数量最少，是 ' + min + '。'
      });
    }
    if (mode === 'total') {
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: U.pick([
          who + '把统计图（' + d.title + '）中各项相加，' + d.cats.join('、') + ' 一共是多少？',
          d.cats.join('、') + ' 合起来一共是多少？（' + d.title + '，' + who + '算）'
        ]),
        canvas: canvas,
        correct: sum,
        wrongs: pick3(sum, [sum + 5, sum - 5, sum + 10, max, sum + 1]),
        explain: '把各项相加：' + d.vals.join(' + ') + ' = ' + sum + '。'
      });
    }
    return q({
      topicId: 'g4a.u7.compare', level: level,
      prompt: U.pick([
        who + '看统计图（' + d.title + '），最多的一项比最少的一项多多少？',
        d.cats[mi] + ' 比 ' + d.cats[ni] + ' 多多少？（' + d.title + '）'
      ]),
      canvas: canvas,
      correct: max - min,
      wrongs: pick3(max - min, [max, min, max + min, max - min + 1, max - min + 5]),
      explain: '最多 ' + max + '，最少 ' + min + '，相差 ' + max + ' − ' + min + ' = ' + (max - min) + '。'
    });
  });

  /* ---------- 7.3 条形统计图：直条高度 ---------- */
  R('g4a.u7.draw', function (level) {
    var per = U.pick([2, 3, 4, 5, 10]);
    var cells = U.randInt(3, 12);
    var ans = per * cells;
    var who = U.pick(NAMES);
    var m = U.randInt(2, 19);
    var prompt = U.pick([
      '第 ' + m + ' 组的' + who + '画的条形图，纵轴每格表示 ' + per + '，一个直条高 ' + cells + ' 格，表示多少？',
      who + '统计时纵轴每格代表 ' + per + '，第 ' + m + ' 条直条高 ' + cells + ' 格，这个直条表示（ ）',
      '统计图中每格是 ' + per + '，' + who + '画的直条高 ' + cells + ' 格，它对应的数量是多少？',
      who + '在条形图上用 ' + cells + ' 格表示一个数量，每格 ' + per + '，这个数量是（ ）'
    ]);
    return q({
      topicId: 'g4a.u7.draw', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: pick3(ans, [cells, per, ans + per, ans - per, ans + cells, per * (cells + 1), per * (cells - 1), ans + 1, ans + 10, ans - 10, ans + per * 2]),
      explain: '每格表示 ' + per + '，' + cells + ' 格就是 ' + per + ' × ' + cells + ' = ' + ans + '。'
    });
  });

  /* ---------- 8.1 优化：沏茶 ---------- */
  /* 洗水壶 1 + 接水 1 必须先行，烧水 boil 分钟的同时做洗茶杯/找茶叶（共 prep 分钟），最后沏茶 1 分钟 */
  R('g4a.u8.tea', function (level) {
    var boil = U.randInt(3, 12);
    var cup = U.randInt(1, 5);
    var leaf = U.randInt(1, 5);
    var prep = cup + leaf;
    var ans = 3 + Math.max(boil, prep);
    var all = 2 + boil + prep + 1; /* 不并行，一件一件做 */
    var prompt = U.pick([
      '沏茶需要：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。合理安排，最少需要多少分钟？',
      '家里来客人要沏茶：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。从开始准备到沏好茶，最快需要（ ）分钟。',
      '妈妈沏茶的过程：洗水壶 1 分钟 → 接水 1 分钟 → 烧水 ' + boil + ' 分钟，烧水的同时可以洗茶杯（' + cup + ' 分钟）、找茶叶（' + leaf + ' 分钟），最后沏茶 1 分钟。最少需要（ ）分钟才能喝上茶？',
      '小丽给客人泡茶，需要做：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。烧水时可以同时洗茶杯和找茶叶，最少需要多少分钟？',
      '沏茶一共要做 6 件事：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。洗茶杯和找茶叶可以放在烧水的时候做，最短用（ ）分钟。',
      '叔叔来家里喝茶，要泡茶需做：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。怎样安排最省时间？最少（ ）分钟。',
      '沏茶时这些事的时间分别是：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 ' + cup + ' 分钟、找茶叶 ' + leaf + ' 分钟、沏茶 1 分钟。其中洗茶杯、找茶叶可以在烧水时完成，最少需要（ ）分钟。'
    ]);
    var cands = [all, ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans + 10, ans + 20, boil + 3, prep + 3, all - 1, all + 2];
    var seenW = Object.create(null);
    seenW[String(ans)] = true;
    var wrongs = [];
    U.shuffle(cands).forEach(function (w) {
      var s = String(w);
      if (w >= 0 && !seenW[s] && wrongs.length < 3) { seenW[s] = true; wrongs.push(s); }
    });
    return q({
      topicId: 'g4a.u8.tea', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: wrongs,
      explain: '洗水壶和接水必须先做，用 2 分钟；烧水 ' + boil + ' 分钟的同时可以洗茶杯、找茶叶（共 ' + prep +
        ' 分钟），两者取较长的 ' + Math.max(boil, prep) + ' 分钟；最后沏茶 1 分钟。共 2 + ' + Math.max(boil, prep) +
        ' + 1 = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.2 优化：烙饼 ---------- */
  R('g4a.u8.pancake', function (level) {
    var n = U.randInt(1, 6);
    var t = U.pick([3, 4, 5]);
    var ans = n === 1 ? 2 * t : n * t;
    var who = U.pick(NAMES);
    var pool = n === 1
      ? [t, 3 * t, 4 * t, t * 2 + 1, 3 * t + 1, t + 1, 5 * t, t * 2 + 2, t - 1, 2 * t - 1]
      : [n * t + t, n * t - t, n * 2 * t, n * t + 1, (n + 1) * t, n * t - 2 * t, n * 2 * t - t, n * t + 2 * t, n * t + 10, (n - 1) * t];
    var prompt = U.pick([
      who + '家的锅一次最多烙 2 张饼，每面烙 ' + t + ' 分钟。烙 ' + n + ' 张饼最少要多少分钟？',
      '一口平底锅每次放 2 张，每面 ' + t + ' 分钟。' + who + '要烙 ' + n + ' 张饼，最少用几分钟？',
      who + '的妈妈用一口锅烙饼，每次最多 2 张、每面 ' + t + ' 分钟。烙 ' + n + ' 张饼最少（ ）分钟。',
      '烙饼：锅一次 2 张，正反各 ' + t + ' 分钟。' + who + '烙 ' + n + ' 张饼最少需（ ）分钟。'
    ]);
    return q({
      topicId: 'g4a.u8.pancake', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: pick3(ans, pool),
      explain: n === 1
        ? '只有 1 张饼，两面都要烙，共 ' + 2 * t + ' 分钟。'
        : '每次让锅里都有 2 张饼，' + n + ' 张饼共需 ' + n + ' × ' + t + ' = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.3 优化：田忌赛马 ---------- */
  R('g4a.u8.horse', function (level) {
    var who = U.pick(NAMES);
    var stratMode = Math.random() < 0.5;
    var LV = ['上等马', '中等马', '下等马'];

    if (stratMode) {
      /* 问：对齐王的某等马，田忌该出哪匹马才能达成目标（赢/输）。正确答案在三种马间变化 */
      var m = U.randInt(2, 19);
      var target = U.pick(['win_zhong', 'win_xia', 'lose_shang']);
      var correct, prompt;
      if (target === 'win_zhong') {
        correct = '上等马';
        prompt = U.pick([
          who + '要赢下一局。齐王出中等马，田忌该出（ ）马才能赢？',
          '第 ' + m + ' 组：齐王中等马先出，' + who + '派哪匹马对齐王的中等马才能获胜？',
          '田忌要战胜齐王的中等马，这一局应该出（ ）'
        ]);
      } else if (target === 'win_xia') {
        correct = '中等马';
        prompt = U.pick([
          who + '要赢下一局。齐王出下等马，田忌该出（ ）马才能赢？',
          '第 ' + m + ' 组：齐王下等马先出，' + who + '派哪匹马对齐王的下等马才能获胜？',
          '田忌要战胜齐王的下等马，这一局应该出（ ）'
        ]);
      } else {
        correct = '下等马';
        prompt = U.pick([
          who + '要故意输掉第一局以保存实力。齐王出上等马，田忌该出（ ）马？',
          '第 ' + m + ' 组：齐王上等马先出，田忌想先输一局，应该派（ ）马对齐王的上等马？',
          '田忌用最弱的马去对齐王的上等马，这一局应该出（ ）'
        ]);
      }
      var wrongPool = ['上等马', '中等马', '下等马', '同等等级的马', '比他强的马', '任意一匹马', '比他弱的马', '中等马或下等马'];
      return q({
        topicId: 'g4a.u8.horse', level: level,
        prompt: prompt,
        correct: correct,
        wrongs: pick3(correct, wrongPool),
        explain: '田忌的同等等级马都比齐王稍弱，要用更高等级的马去对齐王较低等级的马才能赢；对齐王最强的上等马则故意用下等马输一局。'
      });
    }

    /* 数字型：给定田忌出马顺序，算赢几局 */
    var order = U.shuffle(LV);
    var qi = LV; /* 齐王固定 上中下 */
    var rank = { '上等马': 3, '中等马': 2, '下等马': 1 };
    var wins = 0;
    for (var i = 0; i < 3; i++) {
      if (rank[order[i]] > rank[qi[i]]) wins++;
    }
    var m2 = U.randInt(2, 19);
    var prompt2 = U.pick([
      '齐王按上等马、中等马、下等马出场。田忌按' + order.join('、') + '出场。田忌能赢（ ）局。',
      who + '在第 ' + m2 + ' 组模拟赛马：齐王上、中、下依次出马，田忌出' + order[0] + '、' + order[1] + '、' + order[2] + '。田忌胜（ ）局。',
      '同等级马田忌都稍弱。第 ' + m2 + ' 组，齐王出上、中、下，田忌出' + order.join('、') + '，田忌赢（ ）场。'
    ]);
    return q({
      topicId: 'g4a.u8.horse', level: level,
      prompt: prompt2,
      correct: wins,
      wrongs: pick3(wins, [0, 1, 2, 3, wins + 1, wins + 2]),
      explain: '同等级的马田忌都弱一些，只有用更高等级的马去对齐王较低等级的马才能赢；这样田忌共赢 ' + wins + ' 局。'
    });
  });

  /* 数学广角·优化：把「马」的静态题补足到 1000 题自检所需的稳定性 */
})(typeof window !== 'undefined' ? window : globalThis);
