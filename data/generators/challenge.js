/* 4 级「挑战题」：只由挑战难度使用，1~3 级仍走原出题器。
   44 个知识点各有一道更难的变体：多步推理、逆运算、余数、临界值、真实情境。 */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;
  var R = MG.gen.register.bind(MG.gen);

  var base = Object.create(null);
  MG.gen.ids().forEach(function (id) { base[id] = MG.gen.get(id); });

  function q(o) { return MG.q.build(o); }
  function concept(topicId, level, list) {
    var it = U.pick(list);
    return q({ topicId: topicId, level: level, prompt: it[0], correct: it[1], wrongs: it[2], explain: it[3] });
  }

  /* concept 变体：第三项是干扰候选池，先洗牌再取 3，避免选项集合坍缩；前缀嵌入人名增加题干多样性 */
  function conceptD(topicId, level, list) {
    var it = U.pick(list);
    var correct = it[1];
    var prefix = U.pick([who() + '问：', who() + '想：', who() + '遇到一道题：', who() + '在练习册上看到：', '']);
    return q({ topicId: topicId, level: level, prompt: prefix + it[0], correct: correct, wrongs: three(correct, it[2]), explain: it[3] });
  }

  var WHO = ['小华', '小丽', '小明', '小刚', '小红', '小军', '小芳', '小林', '小强', '小敏', '小英', '小亮', '小玉', '小峰'];
  function who() { return U.pick(WHO); }

  /* 取 3 个不重复、非负的干扰项，避免出现「选项3」这种兜底；先洗牌保证选项集合随机化 */
  function three(correct, cands) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    var shuffled = U.shuffle(cands);
    for (var i = 0; i < shuffled.length && out.length < 3; i++) {
      if (shuffled[i] === null || shuffled[i] === undefined) continue;
      var s = String(shuffled[i]);
      if (s === 'undefined' || s === 'NaN' || s.charAt(0) === '-') continue;
      if (seen[s]) continue;
      seen[s] = true;
      out.push(shuffled[i]);
    }
    return out;
  }

  /* 定点小数：去掉末尾 0，最多 digits 位 */
  function fmtFixed(units, digits) {
    var neg = units < 0;
    units = Math.abs(units);
    var p = Math.pow(10, digits);
    var i = Math.floor(units / p);
    var f = units % p;
    var s = String(f);
    while (s.length < digits) s = '0' + s;
    s = s.replace(/0+$/, '');
    return (neg ? '-' : '') + i + (s ? '.' + s : '');
  }
  function fmtCents(c) { return fmtFixed(c, 2); }
  function fmt3(v) { return fmtFixed(v, 3); }

  /* ---------- 读数（与 g4a 同样的规则，独立一份避免耦合） ---------- */
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

  /* 构造带连续 0、跨级 0 的 8 位数，专练读写的零规则 */
  function trickyNumber() {
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    return U.pick([
      a * 10000000 + b * 10000 + c * 10,
      a * 10000000 + b * 1000 + c,
      a * 10000000 + b * 100000 + c * 100,
      a * 10000000 + b * 1000000 + c * 10
    ]);
  }

  var hardIds = [];
  function extend(id, fn) {
    hardIds.push(id);
    R(id, function (level) {
      if (level >= 4) return fn(4);
      return base[id](level);
    });
  }

  /* ---------- 1.1 读数：连续零与跨级零 ---------- */
  extend('g4a.u1.read', function (level) {
    var n = trickyNumber();
    var correct = readNum(n);
    var poolN = digitVariants(n).concat([Math.floor(n / 10), n * 10, Math.floor(n / 100), n * 100, Math.floor(n / 1000), n + 1, n - 1, n + 1000, n - 1000]);
    var pool = [], seenR = {};
    poolN.forEach(function (v) {
      if (v > 0 && v !== n) { var r = readNum(v); if (!seenR[r]) { seenR[r] = true; pool.push(r); } }
    });
    var prompt = U.pick([
      '下面各数中，' + n + ' 读作：',
      n + ' 这个数的正确读法是（ ）',
      '读出下面的数：' + n + ' 读作（ ）',
      '选择 ' + n + ' 的正确读法：',
      '下面横线上，' + n + ' 应该读作什么？'
    ]);
    return q({
      topicId: 'g4a.u1.read', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, pool),
      explain: n + ' 读作：' + correct + '。每级末尾的 0 不读，中间连续几个 0 只读一个零。'
    });
  });

  /* ---------- 1.2 写法：带零的读数 ---------- */
  extend('g4a.u1.write', function (level) {
    var n = trickyNumber();
    var reading = readNum(n);
    return q({
      topicId: 'g4a.u1.write', level: level,
      prompt: '「' + reading + '」写作：',
      correct: String(n),
      wrongs: three(String(n), digitVariants(n)),
      explain: reading + ' 写作 ' + n + '。哪一位上一个单位也没有，就写 0 占位。'
    });
  });

  /* ---------- 1.3 比较：前几位相同，比到低位 ---------- */
  extend('g4a.u1.compare', function (level) {
    var baseN = U.randInt(1000000, 9999000) * 10;
    var vals = [baseN + 1, baseN + 10, baseN + 100, baseN + 1000];
    var shown = U.shuffle(vals.slice());
    var sorted = vals.slice().sort(function (a, b) { return b - a; });
    var mode = U.pick(['max', 'min', 'secondMax', 'secondMin']);
    var correct = mode === 'max' ? sorted[0] :
      mode === 'min' ? sorted[3] :
        mode === 'secondMax' ? sorted[1] : sorted[2];
    var ask = mode === 'max' ? '最大' : mode === 'min' ? '最小' : mode === 'secondMax' ? '第二大' : '第二小';
    var list = shown[0] + '、' + shown[1] + '、' + shown[2] + '、' + shown[3];
    var prompt = U.pick([
      '下面四个数：' + list + '，其中' + ask + '的是（ ）',
      '在 ' + list + ' 这四个数中，' + ask + '的数是（ ）',
      '把 ' + list + ' 按从大到小排一排，' + ask + '的是（ ）',
      '四个数 ' + list + ' 中，' + ask + '的那个是（ ）'
    ]);
    return q({
      topicId: 'g4a.u1.compare', level: level,
      prompt: prompt,
      correct: String(correct),
      wrongs: three(String(correct), vals.filter(function (v) { return v !== correct; }).map(String)),
      explain: '四个数的前几位都相同，要从高位往低位逐位比较，' + ask + '的是 ' + correct + '。'
    });
  });

  /* ---------- 1.4 求近似数：九位数省略亿位 ---------- */
  extend('g4a.u1.round', function (level) {
    var n = U.randInt(100000000, 999999999);
    var r = Math.round(n / 100000000);
    var correct = r + '亿';
    var pool = [];
    for (var rv = 1; rv <= 9; rv++) if (rv !== r) pool.push(rv + '亿');
    pool.push((r + 10) + '亿', (r + 20) + '亿');
    var prompt = U.pick([
      '省略 ' + n + ' 亿位后面的尾数，约是：',
      n + ' 省略亿位后面的尾数约等于（ ）',
      '把 ' + n + ' 改写成用「亿」作单位的近似数，约是（ ）',
      n + ' 四舍五入到亿位约是（ ）',
      '用「亿」作单位，写出 ' + n + ' 的近似数：'
    ]);
    return q({
      topicId: 'g4a.u1.round', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, pool),
      explain: '省略亿位后面的尾数要看千万位：' + n + ' 的千万位是 ' + Math.floor(n / 10000000) % 10 +
        '，' + (Math.floor(n / 10000000) % 10 >= 5 ? '满 5 向亿位进 1' : '不满 5 直接舍去') + '，所以约是 ' + correct + '。'
    });
  });

  /* ---------- 2.1 公顷与平方千米：复名数换算 ---------- */
  extend('g4a.u2.convert', function (level) {
    var a = U.randInt(1, 9), b = U.randInt(1, 99);
    if (U.randInt(0, 1) === 0) {
      var ans1 = a * 100 + b;
      var p1 = U.pick([
        a + ' 平方千米 ' + b + ' 公顷 = （ ）公顷',
        '填空：' + a + ' 平方千米 ' + b + ' 公顷 = （ ）公顷',
        a + ' 平方千米 ' + b + ' 公顷，合（ ）公顷'
      ]);
      return q({
        topicId: 'g4a.u2.convert', level: level,
        prompt: p1,
        correct: ans1,
        wrongs: three(ans1, [a * 100, ans1 * 10, ans1 + 100, ans1 + 1, b]),
        explain: '1 平方千米 = 100 公顷，' + a + ' 平方千米 = ' + (a * 100) + ' 公顷，再加 ' + b + ' 公顷，得 ' + ans1 + ' 公顷。'
      });
    }
    var ans2 = a * 10000 + b * 100;
    var p2 = U.pick([
      a + ' 公顷 ' + (b * 100) + ' 平方米 = （ ）平方米',
      '填空：' + a + ' 公顷 ' + (b * 100) + ' 平方米 = （ ）平方米',
      a + ' 公顷 ' + (b * 100) + ' 平方米，合（ ）平方米'
    ]);
    return q({
      topicId: 'g4a.u2.convert', level: level,
      prompt: p2,
      correct: ans2,
      wrongs: three(ans2, [a * 10000, ans2 + 10000, ans2 * 10, ans2 + 100, b * 100]),
      explain: '1 公顷 = 10000 平方米，' + a + ' 公顷 = ' + (a * 10000) + ' 平方米，再加 ' + (b * 100) + ' 平方米，得 ' + ans2 + ' 平方米。'
    });
  });

  /* ---------- 2.2 面积单位：更贴近真实的大小 ---------- */
  extend('g4a.u2.unit', function (level) {
    var items = [
      { obj: '一个标准篮球场的面积', n: U.pick([400, 420, 450, 500]), unit: '平方米' },
      { obj: '一个果园的面积', n: U.pick([2, 3, 5, 8]), unit: '公顷' },
      { obj: '一个湖泊的面积', n: U.pick([15, 20, 30, 50]), unit: '平方千米' },
      { obj: '一张课桌桌面的面积', n: U.pick([35, 40, 45, 60]), unit: '平方分米' },
      { obj: '一块橡皮正面的面积', n: U.pick([6, 8, 10, 12]), unit: '平方厘米' },
      { obj: '一所学校操场的面积', n: U.pick([4000, 5000, 6000, 8000]), unit: '平方米' },
      { obj: '一个城市公园的面积', n: U.pick([20, 30, 40, 60]), unit: '公顷' },
      { obj: '一个指甲盖的面积', n: U.pick([1, 2]), unit: '平方厘米' }
    ];
    var it = U.pick(items);
    var units = ['平方厘米', '平方分米', '平方米', '公顷', '平方千米'];
    var correct = it.n + ' ' + it.unit;
    var pool = [];
    units.forEach(function (u) { if (u !== it.unit) pool.push(it.n + ' ' + u); });
    pool.push((it.n * 10) + ' ' + it.unit, (it.n * 100) + ' ' + it.unit, Math.ceil(it.n / 10) + ' ' + it.unit);
    var prompt = who() + U.pick([
      '问：' + it.obj + '大约是（ ）',
      '想知道' + it.obj + '约等于下面哪个？',
      '在练习册上看到：' + it.obj + '大约是（ ）',
      '在做选择：' + it.obj + '下面哪个数据比较合适？',
      '遇到一道题：' + it.obj + '约是（ ）',
      '翻到课本：' + it.obj + '用哪个数据合适？'
    ]);
    return q({
      topicId: 'g4a.u2.unit', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, pool),
      explain: it.obj + '用' + it.unit + '作单位合适，约是 ' + correct + '。'
    });
  });

  /* ---------- 3.1 角的分类：钟面与三角尺 ---------- */
  extend('g4a.u3.classify', function (level) {
    var list = [];
    var AT = ['锐角', '直角', '钝角', '平角', '周角', '优角', '劣角', '零角', '方位角', '负角', '0°角'];
    function atPool(ex) { return AT.filter(function (w) { return w !== ex; }); }
    var h = U.pick([2, 3, 4, 5, 7, 8]);
    var clockAngle = Math.min(h * 30, 360 - h * 30);
    var cpool = [];
    [clockAngle - 30, clockAngle + 30, clockAngle + 60, clockAngle - 60, clockAngle + 90, clockAngle - 90].forEach(function (v) {
      if (v > 0 && v <= 180 && v !== clockAngle) cpool.push(v + '°');
    });
    list.push(['钟面上 ' + h + ' 时整，时针和分针所成的角是（ ）', clockAngle + '°', cpool,
      '钟面一大格是 30°，' + h + ' 时整两针相隔 ' + (clockAngle / 30) + ' 大格，是 ' + clockAngle + '°。']);
    var combo = U.pick([
      { sum: 75, a: '30°', b: '45°' }, { sum: 105, a: '60°', b: '45°' },
      { sum: 120, a: '90°', b: '30°' }, { sum: 135, a: '90°', b: '45°' },
      { sum: 150, a: '90°', b: '60°' }
    ]);
    list.push(['用一副三角尺，' + combo.a + ' 和 ' + combo.b + ' 可以拼成的角是（ ）', combo.sum + '°',
      [(combo.sum + 15) + '°', (combo.sum - 15) + '°', (combo.sum + 30) + '°', (combo.sum - 30) + '°', 100 + '°', 130 + '°'].filter(function (s) { return s !== combo.sum + '°'; }),
      '三角尺上的 ' + combo.a + ' 加 ' + combo.b + ' = ' + combo.sum + '°。']);
    var small = U.randInt(80, 88);
    list.push(['一个角是 ' + small + '°，这个角是（ ）', '锐角', atPool('锐角'),
      '小于 90° 的角是锐角，' + small + '° 比 90° 小。']);
    var big = U.randInt(91, 100);
    list.push(['一个 ' + big + '° 的角比直角大，它是（ ）', '钝角', atPool('钝角'),
      '大于 90° 且小于 180° 的角是钝角，' + big + '° 是钝角。']);
    list.push(['180° 的角叫做（ ）', '平角', atPool('平角'),
      '一条射线绕端点旋转半周形成平角，平角是 180°。']);
    list.push(['360° 的角叫做（ ）', '周角', atPool('周角'),
      '一条射线绕端点旋转一周形成周角，周角是 360°。']);
    list.push(['90° 的角叫做（ ）', '直角', atPool('直角'),
      '90° 的角是直角。']);
    list.push(['一个角比直角小，它可能是（ ）', '锐角', atPool('锐角'),
      '比直角小的角是锐角。']);
    return conceptD('g4a.u3.classify', level, list);
  });


  /* ---------- 3.2 角的计算：三个角或倍数关系 ---------- */
  extend('g4a.u3.sum', function (level) {
    var kind = U.randInt(0, 2);
    if (kind === 0) {
      var a = U.randInt(15, 75);
      var ans = 90 + a;
      var prompt = U.pick([
        '∠1 和 ∠2 组成直角，∠2 和 ∠3 组成平角。已知 ∠1 = ' + a + '°，∠3 = （ ）',
        '已知 ∠1 和 ∠2 拼成直角，∠2 和 ∠3 拼成平角。若 ∠1 = ' + a + '°，则 ∠3 = （ ）',
        '∠1= ' + a + '°，∠1 与 ∠2 合成直角，∠2 与 ∠3 合成平角，那么 ∠3 = （ ）'
      ]);
      return q({
        topicId: 'g4a.u3.sum', level: level,
        prompt: prompt,
        correct: ans,
        wrongs: three(ans, [180 - a, 90 - a, 180 + a, ans + 10, ans - 10, a, ans + 20, ans - 20, 90 + a, 180 - 2 * a].filter(function (v) { return v > 0 && v !== ans; })),
        explain: '∠2 = 90° − ' + a + '° = ' + (90 - a) + '°，∠3 = 180° − ' + (90 - a) + '° = ' + ans + '°。'
      });
    }
    if (kind === 1) {
      var k = U.pick([2, 3, 4, 5]);
      var one = 180 / (k + 1);
      var p1 = U.pick([
        '∠1 和 ∠2 组成平角，∠2 是 ∠1 的 ' + k + ' 倍。∠1 = （ ）',
        '两个角拼成一个平角，其中一个角是另一个角的 ' + k + ' 倍，较小的角是（ ）',
        '平角被分成两个角，大角是小角的 ' + k + ' 倍，小角是（ ）'
      ]);
      return q({
        topicId: 'g4a.u3.sum', level: level,
        prompt: p1,
        correct: one,
        wrongs: three(one, [180 - one, one + 20, 90, one * 2, one * 3, 180 / k, one + 10, one * 4, 180 / (k + 2)].filter(function (v) { return v > 0 && v !== one; })),
        explain: '把较小角看作 1 份，较大角是 ' + k + ' 份，共 ' + (k + 1) + ' 份是 180°，所以小角 = 180° ÷ ' + (k + 1) + ' = ' + one + '°。'
      });
    }
    var n = U.pick([3, 4, 6]);
    var eq = 180 / n;
    var p2 = U.pick([
      n + ' 个相等的角拼成一个平角，每个角是（ ）',
      '平角被平均分成 ' + n + ' 份，每份是（ ）',
      '把一个平角平均分成 ' + n + ' 个角，每个角是（ ）'
    ]);
    return q({
      topicId: 'g4a.u3.sum', level: level,
      prompt: p2,
      correct: eq,
      wrongs: three(eq, [180 / (n + 1), 180 / (n - 1), 90, 60, eq + 15, eq - 15, eq + 30, 180 / (n + 2), 45].filter(function (v) { return v > 0 && v !== eq; })),
      explain: n + ' 个相等的角拼成 180°，每个角 = 180° ÷ ' + n + ' = ' + eq + '°。'
    });
  });

  /* ---------- 3.3 量角器：读数后再求差 ---------- */
  extend('g4a.u3.protractor', function (level) {
    var deg = U.randInt(3, 33) * 5;
    if (deg === 90) deg = 85;
    var mode = U.randInt(0, 3);
    var diff = mode === 0 || mode === 3 ? Math.abs(deg - 90) : 180 - deg;
    var obj = U.pick(['三角尺的一个角', '剪刀张开的角', '扇子打开的角', '钟面上的一个角', '滑梯的一个角', '红领巾的一个角']);
    var w = who();
    var tail = mode === 0 ? '与直角相差（ ）度' :
      mode === 1 ? '比平角小（ ）度' :
        mode === 2 ? '再增加（ ）度就是平角' :
          '比直角' + (deg > 90 ? '大' : '小') + '（ ）度';
    var prompt = U.pick([
      w + '量出' + obj + '（见图），这个角' + tail,
      '图中是' + w + '测量的' + obj + '，这个角' + tail,
      w + '用量角器量得' + obj + '如图，这个角' + tail
    ]);
    return q({
      topicId: 'g4a.u3.protractor', level: level,
      prompt: prompt,
      canvas: { kind: 'protractor', deg: deg },
      correct: diff,
      wrongs: three(diff, [deg, 180 - deg, diff + 10, diff - 10, 90 - diff, diff + 20, diff - 20, deg + 10, deg - 10].filter(function (v) { return v > 0 && v !== diff; })),
      explain: '先读出这个角是 ' + deg + '°，' +
        (mode === 0 || mode === 3 ? '它与 90° 相差 ' + diff + '°。' : '它与 180° 相差 ' + diff + '°。')
    });
  });

  /* ---------- 4.1 三位数乘两位数：方框里的数字 ---------- */
  extend('g4a.u4.mul', function (level) {
    var b = U.randInt(12, 89);
    var q3 = U.randInt(102, 989);
    var product = q3 * b;
    var str = String(q3);
    var pos = U.randInt(0, 2);
    var correct = +str.charAt(pos);
    var shown = str.slice(0, pos) + '□' + str.slice(pos + 1);
    var pool = [];
    for (var d = 0; d <= 9; d++) if (d !== correct) pool.push(d);
    var prompt = U.pick([
      shown + ' × ' + b + ' = ' + product + '，□ 里应填（ ）',
      '在 ' + shown + ' × ' + b + ' = ' + product + ' 中，□ 代表的数字是（ ）',
      '算式 ' + shown + ' × ' + b + ' = ' + product + ' 的方框里应填（ ）',
      '已知 ' + shown + ' × ' + b + ' = ' + product + '，□ 里的数字是（ ）'
    ]);
    return q({
      topicId: 'g4a.u4.mul', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, pool),
      explain: '先用积除以 ' + b + '：' + product + ' ÷ ' + b + ' = ' + q3 + '，所以方框里是 ' + correct + '。'
    });
  });

  /* ---------- 4.2 积的变化规律：两个因数同时变 ---------- */
  extend('g4a.u4.rule', function (level) {
    var a, b, label, ans;
    var kind = U.randInt(0, 2);
    if (kind === 0) {
      a = U.randInt(5, 40); b = U.randInt(3, 15) * 2;
      label = '(a × 6) × (b ÷ 2)';
      ans = a * b * 3;
    } else if (kind === 1) {
      a = U.randInt(2, 15) * 4; b = U.randInt(3, 20);
      label = '(a ÷ 4) × (b × 8)';
      ans = a * b * 2;
    } else {
      a = U.randInt(4, 30); b = U.randInt(3, 15);
      label = '(a × 3) × (b × 3)';
      ans = a * b * 9;
    }
    var shown = label.replace('a', a).replace('b', b);
    var c = a * b;
    var prompt = U.pick([
      '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 ' + shown + ' = （ ）',
      '根据 ' + a + ' × ' + b + ' = ' + c + '，可以推出 ' + shown + ' = （ ）',
      '如果 ' + a + ' × ' + b + ' = ' + c + '，那么 ' + shown + ' 的结果是（ ）',
      '由 ' + a + ' × ' + b + ' = ' + c + ' 可知，' + shown + ' = （ ）'
    ]);
    return q({
      topicId: 'g4a.u4.rule', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [c, c * 2, c * 3, c * 4, c * 6, ans + 10]),
      explain: '两个因数一个乘几、一个除以几，积就乘（或除以）相应的倍数。所以结果是 ' + ans + '。'
    });
  });

  /* ---------- 4.3 单价与速度：两步问题 ---------- */
  extend('g4a.u4.word', function (level) {
    var kind = U.randInt(0, 2);
    if (kind === 0) {
      var price = U.randInt(105, 180), num = U.randInt(12, 30);
      var cost = price * num;
      var pay = Math.ceil(cost / 1000) * 1000 + 1000;
      var change = pay - cost;
      var w0 = who();
      return q({
        topicId: 'g4a.u4.word', level: level,
        prompt: U.pick([
          w0 + '买 ' + num + ' 套校服，每套 ' + price + ' 元，付了 ' + pay + ' 元，应找回多少元？',
          '学校买 ' + num + ' 套校服，每套 ' + price + ' 元，' + w0 + '付了 ' + pay + ' 元，应找回多少元？'
        ]),
        correct: change,
        wrongs: three(change, [pay, cost, change + 100, change - 50]),
        explain: '先求总价：' + price + ' × ' + num + ' = ' + cost + ' 元；再求找回：' + pay + ' − ' + cost + ' = ' + change + ' 元。'
      });
    }
    if (kind === 1) {
      var speed = U.randInt(105, 180), hours = U.randInt(3, 12), rest = U.randInt(20, 200);
      var total = speed * hours + rest;
      var w1 = who();
      return q({
        topicId: 'g4a.u4.word', level: level,
        prompt: U.pick([
          w1 + '乘的汽车每小时行 ' + speed + ' 千米，行了 ' + hours + ' 小时后离目的地还有 ' + rest + ' 千米。全程多少千米？',
          '一辆汽车每小时行 ' + speed + ' 千米，' + w1 + '坐它行了 ' + hours + ' 小时，离目的地还有 ' + rest + ' 千米。全程多少千米？'
        ]),
        correct: total,
        wrongs: three(total, [speed * hours, total + 100, total - 50, rest]),
        explain: '已行路程：' + speed + ' × ' + hours + ' = ' + (speed * hours) + ' 千米；全程再加剩下的 ' + rest + ' 千米，得 ' + total + ' 千米。'
      });
    }
    var unit = U.randInt(45, 99), box = U.randInt(6, 12);
    var sum = unit * box;
    var real = sum - 30;
    var w2 = who();
    return q({
      topicId: 'g4a.u4.word', level: level,
      prompt: U.pick([
        w2 + '买牛奶：每箱 ' + unit + ' 元，买 ' + box + ' 箱，满 300 元减 30 元，实际要付多少元？',
        '每箱牛奶 ' + unit + ' 元，' + w2 + '买 ' + box + ' 箱，商店满 300 元减 30 元，实际要付多少元？'
      ]),
      correct: real,
      wrongs: three(real, [sum, sum - 60, sum + 30, real + 30]),
      explain: '原价：' + unit + ' × ' + box + ' = ' + sum + ' 元，满 300 元减 30 元，实际付 ' + sum + ' − 30 = ' + real + ' 元。'
    });
  });

  /* ---------- 5.1 垂直与平行：推理 ---------- */
  extend('g4a.u5.parallel', function (level) {
    var d = U.randInt(2, 9);
    return conceptD('g4a.u5.parallel', level, [
      ['在同一平面内，两条直线都与第三条直线垂直，这两条直线（ ）', '互相平行', ['互相垂直', '相交', '无法确定', '互相重合', '斜着相交', '互相交叉', '成 45°', '一定垂直'],
        '同一平面内，垂直于同一条直线的两条直线互相平行。'],
      ['过直线外一点画已知直线的垂线，可以画（ ）条', '1', ['0', '2', '3', '4', '无数', '5', '6', '10'],
        '过直线外一点，有且只有一条直线与已知直线垂直。'],
      ['两条直线相交成直角，其余三个角（ ）', '都是 90°', ['都是锐角', '都是钝角', '两个直角', '和为 90°', '无法确定', '和为 180°', '两个锐角'],
        '相交成直角时，四个角都是 90°，这两条直线互相垂直。'],
      ['点 A 到直线的垂直线段长 ' + d + ' 厘米，那么点 A 到直线的斜线段（ ）', '都比 ' + d + ' 厘米长',
        ['都比 ' + d + ' 厘米短', '也长 ' + d + ' 厘米', '可能比 ' + d + ' 厘米短', '都正好 ' + (d + 1) + ' 厘米', '都比 ' + (d + 2) + ' 厘米短', '都比 ' + (d + 3) + ' 厘米长', '都一样长'],
        '点到直线的所有线段中，垂直线段最短，所以斜线段都比它长。'],
      ['在同一平面内，不相交的两条直线叫做（ ）', '平行线', ['垂线', '垂线段', '交叉线', '斜线', '垂直线', '平行线组', '距离线'],
        '在同一平面内不相交的两条直线互相平行。'],
      ['两条平行线之间的距离（ ）', '处处相等', ['不相等', '越来越大', '越来越小', '时大时小', '无法确定', '逐渐变小', '先大后小'],
        '两条平行线之间的距离处处相等。'],
      ['从直线外一点到这条直线所画的线段中，（ ）最短', '垂直线段', ['斜线段', '任意线段', '水平线段', '最长的线段', '最长的斜线段', '最短线段', '中线段'],
        '点到直线的所有连线中，垂直线段最短。'],
      ['在同一平面内，两条直线都平行于第三条直线，这两条直线（ ）', '互相平行', ['互相垂直', '相交', '无法确定', '互相重合', '斜着相交', '互相交叉', '成 45°', '一定垂直'],
        '平行于同一条直线的两条直线互相平行。']
    ]);
  });

  /* ---------- 5.2 图形特征：对称轴与拼组 ---------- */
  extend('g4a.u5.shape', function (level) {
    var NUMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '无数'];
    function nPool(ex) { return NUMS.filter(function (w) { return w !== ex; }); }
    return conceptD('g4a.u5.shape', level, [
      ['长方形有（ ）条对称轴', '2', nPool('2'),
        '长方形对边中点连线所在的两条直线是对称轴，共 2 条。'],
      ['正方形有（ ）条对称轴', '4', nPool('4'),
        '正方形对边中点和两条对角线都是对称轴，共 4 条。'],
      ['等腰梯形有（ ）条对称轴', '1', nPool('1'),
        '等腰梯形只有上下底中点连线这一条对称轴。'],
      ['圆有（ ）条对称轴', '无数', nPool('无数'),
        '圆的任意一条直径所在直线都是对称轴，所以有无数条。'],
      ['等边三角形有（ ）条对称轴', '3', nPool('3'),
        '等边三角形每条边上的高所在直线都是对称轴，共 3 条。'],
      ['两个完全一样的梯形一定可以拼成一个（ ）', '平行四边形', ['长方形', '三角形', '正方形', '梯形', '圆', '五边形', '六边形', '八边形', '菱形'],
        '把两个完全一样的梯形倒过来拼，可以得到一个平行四边形。'],
      ['从平行四边形的一个顶点向对边作高，最多能作（ ）条', '2', nPool('2'),
        '平行四边形有两组对边，从一个顶点可以向两条不同的对边各作一条高。'],
      ['平行四边形的一组对边平行且相等，另一组对边（ ）', '也平行且相等', ['只平行不相等', '只相等不平行', '无法确定', '互相垂直', '相交', '一定相等', '互相平行', '一定不相等'],
        '平行四边形的两组对边分别平行且相等。'],
      ['一个等腰三角形有（ ）条对称轴', '1', nPool('1'),
        '等腰三角形只有底边高所在的一条对称轴。']
    ]);
  });

  /* ---------- 6.1 除法估算：三位数除以两位数 ---------- */
  extend('g4a.u6.estimate', function (level) {
    var d0 = U.pick([20, 30, 40, 50]);
    var maxQuo = Math.floor(999 / d0);
    var quo = U.randInt(12, maxQuo);
    var d = d0 + U.randInt(-4, 4);
    var dividend = d0 * quo + U.randInt(-9, 9);
    if (dividend < 100) dividend += 20;
    return q({
      topicId: 'g4a.u6.estimate', level: level,
      prompt: U.pick([
        '估算：' + dividend + ' ÷ ' + d + ' ≈ （ ）',
        '估一估，' + dividend + ' ÷ ' + d + ' 大约得（ ）',
        '不用精算，' + dividend + ' ÷ ' + d + ' ≈ （ ）',
        '估算 ' + dividend + ' ÷ ' + d + ' 的商，大约是（ ）'
      ]),
      correct: quo,
      wrongs: three(quo, [quo + 10, quo - 10, quo + 5, quo * 10, quo + 20, quo - 20, quo * 2, quo + 1].filter(function (v) { return v > 0 && v !== quo; })),
      explain: '把 ' + d + ' 看作 ' + d0 + '，把 ' + dividend + ' 看作 ' + (d0 * quo) + '，' + (d0 * quo) + ' ÷ ' + d0 + ' = ' + quo + '。'
    });
  });

  /* ---------- 6.2 除法笔算：带余数 ---------- */
  extend('g4a.u6.div', function (level) {
    var d = U.randInt(12, 49);
    var quo = U.randInt(10, 25);
    var rem = U.randInt(1, d - 1);
    if (d * quo + rem > 999) quo = Math.max(10, Math.floor((999 - rem) / d));
    var dividend = d * quo + rem;
    var correct = quo + '……' + rem;
    var rem2 = rem + 1 < d ? rem + 1 : rem - 1;
    return q({
      topicId: 'g4a.u6.div', level: level,
      prompt: U.pick([
        dividend + ' ÷ ' + d + ' = （ ）',
        '计算：' + dividend + ' ÷ ' + d + ' = （ ）',
        dividend + ' 除以 ' + d + '，商和余数是（ ）',
        '列竖式计算：' + dividend + ' ÷ ' + d + ' = （ ）'
      ]),
      correct: correct,
      wrongs: three(correct, [(quo + 1) + '……' + rem, quo + '……' + rem2, (quo - 1) + '……' + rem, (quo + 2) + '……' + rem, quo + '……' + (rem - 1 < 0 ? rem + 1 : rem - 1)]),
      explain: d + ' × ' + quo + ' = ' + (d * quo) + '，' + dividend + ' − ' + (d * quo) + ' = ' + rem + '，所以商是 ' + quo + '，余数是 ' + rem + '。'
    });
  });

  /* ---------- 6.3 商的变化规律：商和余数一起变 ---------- */
  extend('g4a.u6.rule', function (level) {
    var list = [];
    var q = U.pick([12, 15, 8, 20]);
    var r = U.pick([3, 4, 5, 6]);
    var k = U.pick([2, 3, 5, 10]);
    list.push(['a ÷ b = ' + q + '……' + r + '，如果 a、b 同时乘 ' + k + '，那么商是（ ），余数是（ ）',
      q + '……' + (r * k),
      [(q * k) + '……' + r, q + '……' + r, (q * k) + '……' + (r * k), q + '……' + (r * k * 2), q + '……' + (r + k), (q + k) + '……' + (r * k)],
      '被除数和除数同时乘 ' + k + '，商不变还是 ' + q + '，余数乘 ' + k + '：' + r + ' × ' + k + ' = ' + (r * k) + '。']);
    list.push(['被除数和除数同时乘 ' + k + '，商（ ），余数（ ）', '不变……乘 ' + k,
      ['乘 ' + k + '……不变', '不变……不变', '除以 ' + k + '……乘 ' + k, '不变……乘 2', '乘 ' + k + '……乘 ' + k, '不变……除以 ' + k],
      '商不变，余数跟着被除数和除数一起乘 ' + k + '。']);
    list.push(['在有余数的除法里，被除数和除数同时乘 ' + k + '，余数会（ ）', '乘 ' + k,
      ['不变', '除以 ' + k, '乘 16', '乘 2', '加 ' + k, '乘 ' + (k * 2), '减 ' + k],
      '商不变，余数随被除数和除数一起乘 ' + k + '。']);
    list.push(['a ÷ b = ' + q + '……' + r + '，如果 a、b 同时除以 3，商（ ）', '不变',
      ['乘 3', '除以 3', '加 3', '减 3', '无法确定', '乘 6', '除以 6'],
      '被除数和除数同时除以相同的数（0 除外），商不变。']);
    list.push(['被除数和除数同时乘相同的数（0 除外），商（ ）', '不变',
      ['乘相同的数', '除以相同的数', '变了', '无法确定', '先乘后除', '先除后乘', '乘这个数的平方'],
      '商不变的规律：同时乘或除以相同的数（0 除外），商不变。']);
    list.push(['a ÷ b = ' + q + '……' + r + '，如果 a、b 同时乘 10，余数变成（ ）', '' + (r * 10),
      ['' + r, '' + (q * 10), '' + (r * 100), '' + (q + r * 10), '' + (r + 10), '' + (r * 5)],
      '被除数和除数同时乘 10，余数也乘 10：' + r + ' × 10 = ' + (r * 10) + '。']);
    return conceptD('g4a.u6.rule', level, list);
  });

  /* ---------- 7.1 条形统计图：读两根直条 ---------- */
  extend('g4a.u7.read', function (level) {
    var catSets = [
      ['一月', '二月', '三月', '四月', '五月'],
      ['周一', '周二', '周三', '周四', '周五'],
      ['一组', '二组', '三组', '四组', '五组']
    ];
    var cats = U.pick(catSets);
    var unit = U.pick(['人', '棵', '本']);
    var vals = cats.map(function () { return U.randInt(10, 50); });
    var i = U.randInt(0, 4), j = U.randInt(0, 4);
    while (j === i) j = U.randInt(0, 4);
    if (vals[i] === vals[j]) vals[j] = vals[j] === 50 ? 49 : vals[j] + 1;
    var hi = vals[i] > vals[j] ? i : j;
    var lo = hi === i ? j : i;
    var askSum = U.randInt(0, 1) === 0;
    var correct = askSum ? vals[i] + vals[j] : vals[hi] - vals[lo];
    var w = who();
    var prompt = askSum
      ? U.pick([
        '根据统计图，' + w + '发现' + cats[i] + '和' + cats[j] + '一共有多少' + unit + '？',
        w + '统计后问：' + cats[i] + '和' + cats[j] + '合起来有多少' + unit + '？',
        '看图回答：' + cats[i] + '与' + cats[j] + '共多少' + unit + '？'
      ])
      : U.pick([
        '根据统计图，' + cats[hi] + '比' + cats[lo] + '多多少' + unit + '？',
        w + '问：' + cats[hi] + '比' + cats[lo] + '多多少' + unit + '？',
        '看图：' + cats[hi] + '比' + cats[lo] + '多的' + unit + '数是多少？'
      ]);
    return q({
      topicId: 'g4a.u7.read', level: level,
      prompt: prompt,
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: unit },
      correct: correct,
      wrongs: three(correct, [vals[i], vals[j], vals[i] + vals[j], Math.abs(vals[i] - vals[j]), correct + 10, correct - 10].filter(function (v) { return v > 0 && v !== correct; })),
      explain: askSum
        ? cats[i] + '是 ' + vals[i] + ' ' + unit + '，' + cats[j] + '是 ' + vals[j] + ' ' + unit + '，一共 ' + correct + ' ' + unit + '。'
        : cats[hi] + '是 ' + vals[hi] + ' ' + unit + '，' + cats[lo] + '是 ' + vals[lo] + ' ' + unit + '，多 ' + correct + ' ' + unit + '。'
    });
  });

  /* ---------- 7.2 条形统计图：和平均数比较 ---------- */
  extend('g4a.u7.compare', function (level) {
    var catPool = U.pick([
      ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月'],
      ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周八', '周九', '周十'],
      ['一组', '二组', '三组', '四组', '五组', '六组', '七组', '八组', '九组', '十组']
    ]);
    var cats = U.shuffle(catPool.slice()).slice(0, 5);
    var unit = U.pick(['人', '棵', '本']);
    var vals = [];
    while (vals.length < cats.length) {
      var v = U.randInt(5, 50);
      if (vals.indexOf(v) === -1) vals.push(v);
    }
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / 5;
    var below = vals.filter(function (v) { return v < mean; }).length;
    var above = vals.filter(function (v) { return v > mean; }).length;
    var max = Math.max.apply(null, vals);
    var min = Math.min.apply(null, vals);
    var maxIndex = vals.indexOf(max);
    var mode = U.pick(['below', 'above', 'max', 'diff']);
    var w = who();
    var canvas = { kind: 'bar-chart', categories: cats, values: vals, unit: unit };

    if (mode === 'max') {
      var maxPool = catPool.filter(function (c) { return c !== cats[maxIndex]; });
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: U.pick([
          w + '看了统计图，问：哪个' + cats[0].slice(1) + '的' + unit + '数最多？',
          '看图：' + w + '想知道' + cats.join('、') + '中，哪个' + unit + '数最多？',
          '根据统计图，' + w + '发现' + cats[maxIndex] + '最高，问最多的是哪个？'
        ]),
        canvas: canvas,
        correct: cats[maxIndex],
        wrongs: three(cats[maxIndex], maxPool),
        explain: '直条最高的 ' + cats[maxIndex] + ' ' + unit + '数最多，是 ' + max + ' ' + unit + '。'
      });
    }

    if (mode === 'diff') {
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: U.pick([
          w + '统计后问：' + cats[0].slice(1) + '里' + unit + '数最多的比最少的多多少？',
          '根据统计图，' + w + '想求' + unit + '数最多与最少的相差多少？',
          '看图：' + cats.join('、') + '中，最多比最少多多少' + unit + '？'
        ]),
        canvas: canvas,
        correct: max - min,
        wrongs: three(max - min, [max, min, max + min, max - min + 1, max - min + 10, max - min + 2, max - min + 5, max - min - 1, max + min + 1, max * 2, min * 2]),
        explain: '最多 ' + max + ' ' + unit + '，最少 ' + min + ' ' + unit + '，相差 ' + (max - min) + ' ' + unit + '。'
      });
    }

    var count = mode === 'below' ? below : above;
    return q({
      topicId: 'g4a.u7.compare', level: level,
      prompt: mode === 'below'
        ? U.pick([
          w + '问：统计图里低于平均数的有几个' + cats[0].slice(1) + '？',
          '根据统计图，' + w + '数出低于平均数的' + cats[0].slice(1) + '有多少个？',
          w + '看图统计：低于平均数的' + cats[0].slice(1) + '有几个？'
        ])
        : U.pick([
          w + '问：统计图里高于平均数的有几个' + cats[0].slice(1) + '？',
          '根据统计图，' + w + '数出高于平均数的' + cats[0].slice(1) + '有多少个？',
          w + '看图统计：高于平均数的' + cats[0].slice(1) + '有几个？'
        ]),
      canvas: canvas,
      correct: count,
      wrongs: three(count, [count + 1, count - 1, 5 - count, count + 2, 0, 5, count + 3, count + 4, count * 2, 4, 3, count + 6, count + 8, count + 10, 2, 1, count + 12].filter(function (v) { return v >= 0 && v !== count; })),
      explain: '总数 ' + sum + ' ' + unit + '，平均数 ' + U.num(mean) + ' ' + unit + '；' +
        (mode === 'below' ? '低于' : '高于') + '平均数的有 ' + count + ' 个' + cats[0].slice(1) + '。'
    });
  });

  /* ---------- 7.3 条形统计图：先比较再计算 ---------- */
  extend('g4a.u7.draw', function (level) {
    var per = U.pick([2, 5, 10]);
    var a = U.randInt(2, 6), extra = U.randInt(1, 4);
    var ans = (a + extra) * per;
    var unit = U.pick(['人', '棵', '本']);
    var w = who();
    var names = U.pick([['A', 'B'], ['第一根', '第二根'], ['甲', '乙']]);
    var prompt = U.pick([
      '条形统计图的纵轴每格表示 ' + per + ' ' + unit + '。' + names[0] + ' 直条高 ' + a + ' 格，' + names[1] + ' 直条比 ' + names[0] + ' 高 ' + extra + ' 格，' + names[1] + ' 直条表示多少' + unit + '？',
      w + '画的条形图纵轴每格代表 ' + per + ' ' + unit + '，' + names[0] + ' 条高 ' + a + ' 格，' + names[1] + ' 条比它高 ' + extra + ' 格，' + names[1] + ' 条表示多少' + unit + '？',
      '看图：纵轴每格 ' + per + ' ' + unit + '，' + names[0] + ' 直条 ' + a + ' 格，' + names[1] + ' 直条高 ' + (a + extra) + ' 格，' + names[1] + ' 表示多少' + unit + '？'
    ]);
    return q({
      topicId: 'g4a.u7.draw', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [a * per, a + extra, ans + per, ans - per, extra * per, ans + 10].filter(function (v) { return v > 0 && v !== ans; })),
      explain: names[1] + ' 直条高 ' + (a + extra) + ' 格，每格 ' + per + ' ' + unit + '，所以表示 ' + (a + extra) + ' × ' + per + ' = ' + ans + ' ' + unit + '。'
    });
  });

  /* ---------- 8.1 沏茶：烧水与准备工作并行 ---------- */
  extend('g4a.u8.tea', function (level) {
    var t = U.randInt(4, 9);
    var prep = 5; // 洗茶杯 2 + 找茶叶 1 + 洗茶壶 2
    var ans = 2 + Math.max(t, prep) + 1;
    var w = who();
    var prompt = U.pick([
      w + '给客人沏茶：洗水壶 1 分钟、接水 1 分钟、烧水 ' + t + ' 分钟、洗茶杯 2 分钟、找茶叶 1 分钟、洗茶壶 2 分钟、沏茶 1 分钟。烧水前先洗水壶接水，沏茶前做好准备。最少要多少分钟？',
      '妈妈让' + w + '沏茶：洗水壶 1 分、接水 1 分、烧水 ' + t + ' 分、洗茶杯 2 分、找茶叶 1 分、洗茶壶 2 分、沏茶 1 分。烧水时可以做准备工作。最少几分钟？',
      w + '要做这些事：洗水壶 1 分、接水 1 分、烧水 ' + t + ' 分、洗茶杯 2 分、找茶叶 1 分、洗茶壶 2 分、沏茶 1 分。怎样安排最省时间？最少多少分钟？'
    ]);
    return q({
      topicId: 'g4a.u8.tea', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [2 + t + prep + 1, ans + 1, ans - 1, t + 3, ans + 2, ans - 2, ans + 3, ans + 5, ans + 8, ans > 3 ? ans - 3 : ans + 3, ans * 2, prep + 1, 2 + prep + 1, ans + 10].filter(function (v) { return v > 0 && v !== ans; })),
      explain: '洗水壶和接水用 2 分钟；烧水 ' + t + ' 分钟的同时做 5 分钟准备工作，取较长的时间；最后沏茶 1 分钟。共 2 + ' +
        Math.max(t, prep) + ' + 1 = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.2 烙饼：锅一次放 3 张 ---------- */
  extend('g4a.u8.pancake', function (level) {
    var n = U.randInt(4, 9), t = U.randInt(1, 3);
    var batches = Math.ceil(2 * n / 3);
    var ans = batches * t;
    var w = who();
    var prompt = U.pick([
      w + '家的锅每次最多烙 3 张饼，每面烙 ' + t + ' 分钟。烙 ' + n + ' 张饼最少需要多少分钟？',
      '一口锅每次最多放 3 张饼，每面 ' + t + ' 分钟，' + w + '要烙 ' + n + ' 张饼，最少几分钟？',
      w + '烙饼：锅一次最多 3 张，每面 ' + t + ' 分钟，烙 ' + n + ' 张饼两面都要烙，最少多少分钟？'
    ]);
    return q({
      topicId: 'g4a.u8.pancake', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [n * t, 2 * n * t, ans + t, ans + 1, ans - 1, (batches - 1) * t, ans + 2 * t, ans + 3 * t, ans * 2, ans + 5, n * 2].filter(function (v) { return v > 0 && v !== ans; })),
      explain: n + ' 张饼共 ' + (2 * n) + ' 面，每次最多烙 3 面，需要 ' + batches + ' 次，每次 ' + t + ' 分钟，共 ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.3 田忌赛马：应对不同出场顺序 ---------- */
  extend('g4a.u8.horse', function (level) {
    var H = ['上等马', '中等马', '下等马', '都可以', '任意一匹', '最强的马', '最弱的马', '中等偏上马', '中等偏下马', '最快的马', '最慢的马', '换一匹马', '随便哪匹马'];
    function hPool(ex) { return H.filter(function (w) { return w !== ex; }); }
    return conceptD('g4a.u8.horse', level, [
      ['齐王按上、中、下出场，田忌第一场应出（ ）才能最终获胜', '下等马', hPool('下等马'),
        '先用下等马对上等马输一场，再用上等马、中等马赢下两场。'],
      ['田忌用下等马对齐王的上等马，第二场应出（ ）', '上等马', hPool('上等马'),
        '第一场已经输掉，第二场要用上等马赢齐王的中等马。'],
      ['如果齐王先出下等马，田忌第一场应出（ ）才能 2 胜 1 负', '中等马', hPool('中等马'),
        '中等马能赢下等马；接着用下等马输给上等马，最后用上等马赢中等马。'],
      ['田忌要获胜，必须让哪匹马去输掉一场？', '下等马', hPool('下等马'),
        '用最弱的下等马去输给齐王最强的上等马，才能用另外两匹赢下两场。'],
      ['田忌用策略赢了齐王，最终比分是几比几？', '2 比 1', ['3 比 0', '1 比 2', '0 比 3', '2 比 2', '3 比 2', '1 比 1', '4 比 1', '1 比 4'],
        '田忌输一场、赢两场，最终 2 比 1 获胜。'],
      ['田忌的下等马对齐王的上等马，这一场田忌（ ）', '输', ['赢', '平', '无法确定', '赢一半', '可能赢', '打平', '小胜'],
        '下等马比上等马弱，这一场田忌会输。'],
      ['田忌要想赢齐王，最关键的是用下等马去对齐王的（ ）', '上等马', hPool('上等马'),
        '用下等马消耗掉齐王最强的上等马，后面才能两胜。']
    ]);
  });

  /* ---------- 四年级下册 ---------- */

  /* 3 列、最多 3 层的方块，和原出题器同一套坐标，画布放得下 */
  function hardCubes(count) {
    var cells = U.shuffle([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]).slice(0, Math.min(3, count));
    var heights = cells.map(function () { return 1; });
    var left = count - cells.length, guard = 0;
    while (left > 0 && guard++ < 80) {
      var i = U.randInt(0, cells.length - 1);
      if (heights[i] < 3) { heights[i]++; left--; }
    }
    var cubes = [];
    cells.forEach(function (c, i) {
      for (var z = 0; z < heights[i]; z++) cubes.push({ x: c[0], y: c[1], z: z });
    });
    return cubes;
  }

  /* ---------- 1.1 运算顺序：带中括号 ---------- */
  extend('g4b.u1.order', function (level) {
    var a = U.randInt(3, 20), b = U.randInt(3, 20), c = U.randInt(2, 9), qv = U.randInt(2, 9);
    var e, inner;
    if (U.randInt(0, 1) === 0) {
      e = (a + b) * c * qv;
      inner = '(' + a + ' + ' + b + ') × ' + c;
    } else {
      e = a * (b + c) * qv;
      inner = a + ' × (' + b + ' + ' + c + ')';
    }
    var body = e + ' ÷ [' + inner + ']';
    var prompt = U.pick([
      body + ' = （ ）',
      '计算：' + body + ' = （ ）',
      '脱式计算：' + body + ' = （ ）',
      '先算中括号里的：' + body + ' = （ ）'
    ]);
    return q({
      topicId: 'g4b.u1.order', level: level,
      prompt: prompt,
      correct: qv,
      wrongs: three(qv, [qv + 1, qv - 1, qv * 2, qv * 10, qv + 2, qv - 2, qv * 3, qv + 10].filter(function (v) { return v > 0 && v !== qv; })),
      explain: '先算小括号里的，再算中括号里的，最后算括号外面的除法，结果是 ' + qv + '。'
    });
  });

  /* ---------- 1.2 含括号：三步混合运算 ---------- */
  extend('g4b.u1.calc', function (level) {
    var a = U.randInt(3, 20), b = U.randInt(2, 20), c = U.randInt(2, 9);
    var e = U.randInt(2, 9), f = U.randInt(1, 9);
    var ans = (a + b) * c - f;
    var body = '(' + a + ' + ' + b + ') × ' + c + ' − ' + (e * f) + ' ÷ ' + e;
    var prompt = U.pick([
      body + ' = （ ）',
      '脱式计算：' + body + ' = （ ）',
      '先算括号再算乘除：' + body + ' = （ ）',
      '计算下面各题：' + body + ' = （ ）'
    ]);
    return q({
      topicId: 'g4b.u1.calc', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [(a + b) * c, ans + 1, ans - 1, (a + b) * c + f, ans + 10, ans - 10].filter(function (v) { return v > 0 && v !== ans; })),
      explain: '先算括号：' + a + ' + ' + b + ' = ' + (a + b) + '；再算乘除：' + (a + b) + ' × ' + c + ' = ' +
        ((a + b) * c) + '，' + (e * f) + ' ÷ ' + e + ' = ' + f + '；最后相减得 ' + ans + '。'
    });
  });

  /* ---------- 1.3 关于 0：除数为 0 与混合运算 ---------- */
  extend('g4b.u1.zero', function (level) {
    var a = U.randInt(2, 20), b = U.randInt(2, 9);
    var d = U.randInt(2, 9);
    return conceptD('g4b.u1.zero', level, [
      ['0 ÷ (8 − 8) = （ ）', '无意义', ['0', '1', '8', '16', '80'],
        '8 − 8 = 0，0 不能作除数，所以这个算式没有意义。'],
      [a + ' × 0 + ' + b + ' ÷ ' + b + ' = （ ）', '1', ['0', String(a), String(b), String(a + b), String(b * 2)],
        '先算乘除：' + a + ' × 0 = 0，' + b + ' ÷ ' + b + ' = 1；再相加 0 + 1 = 1。'],
      ['0 × ' + a + ' + 0 ÷ ' + a + ' = （ ）', '0', ['1', String(a), '无意义', String(a * 2), String(a + 1)],
        '0 乘任何数得 0，0 除以非 0 的数也得 0，0 + 0 = 0。'],
      ['下面算式中，结果一定是 0 的是（ ）', '0 × ' + a, [a + ' ÷ ' + a, a + ' + 0', a + ' − 0', a + ' × 1', '0 ÷ ' + a],
        '0 乘任何数都得 0；其他三个算式的结果分别是 1、' + a + ' 和 ' + a + '。'],
      ['下面算式中，没有意义的是（ ）', d + ' ÷ 0', ['0 ÷ ' + d, '0 × ' + d, d + ' + 0', d + ' − 0', '0 ÷ 100'],
        '0 不能作除数，所以 ' + d + ' ÷ 0 没有意义。'],
      ['0 不能作（ ）', '除数', ['被除数', '因数', '加数', '被减数'],
        '在除法里，0 不能作除数。'],
      [a + ' + 0 = （ ）', String(a), ['0', '1', '2', String(a + 1), String(a * 2)],
        '任何数加 0 还得原数，所以 ' + a + ' + 0 = ' + a + '。'],
      ['0 × ' + d + ' × ' + a + ' = （ ）', '0', [String(a), String(d), String(a * d), '1', String(d + a)],
        '乘法中有一个因数是 0，积就是 0。']
    ]);
  });

  /* ---------- 2.1 观察物体：从不同方向看 ---------- */
  function viewCount(cubes, direction) {
    var seen = Object.create(null);
    cubes.forEach(function (c) {
      var key = direction === 'front' ? c.x + ',' + c.z :
        direction === 'top' ? c.x + ',' + c.y : c.y + ',' + c.z;
      seen[key] = true;
    });
    return Object.keys(seen).length;
  }

  extend('g4b.u2.view', function (level) {
    var cubes = hardCubes(U.randInt(7, 9));
    var directions = [
      { id: 'front', name: '正面', desc: '前后重叠的正方形只算一个' },
      { id: 'top', name: '上面', desc: '上下重叠的正方形只算一个' },
      { id: 'right', name: '右面', desc: '左右重叠的正方形只算一个' },
      { id: 'left', name: '左面', desc: '左右重叠的正方形只算一个' }
    ];
    var d = U.pick(directions);
    var ans = viewCount(cubes, d.id);
    var w = who();
    return q({
      topicId: 'g4b.u2.view', level: level,
      prompt: U.pick([
        '由这些小正方体搭成的立体图形，' + w + '从' + d.name + '看能看到几个正方形？',
        w + '观察这个立体图形：从' + d.name + '看，能看到几个小正方形？',
        '看图：' + w + '站在立体图形的' + d.name + '看，一共看到几个正方形？',
        w + '想知道从' + d.name + '看这个立体图形能看到几个小正方形？'
      ]),
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, [cubes.length, cubes.length + 1, ans + 1, ans > 1 ? ans - 1 : ans + 2, ans + 2, ans + 3, ans > 2 ? ans - 2 : ans + 3, cubes.length - 1, ans + 5, ans + 8, ans * 2, cubes.length + 2].filter(function (v) { return v > 0 && v !== ans; })),
      explain: '从' + d.name + '看时，' + d.desc + '，共能看到 ' + ans + ' 个正方形。'
    });
  });

  /* ---------- 2.2 数正方体：补成长方体 ---------- */
  extend('g4b.u2.count', function (level) {
    var dims = U.pick([[3, 2, 3], [3, 3, 2], [4, 2, 2], [3, 3, 3], [4, 3, 2], [2, 2, 3], [3, 2, 2], [4, 2, 3]]);
    var total = dims[0] * dims[1] * dims[2];
    var cubes = hardCubes(U.randInt(5, Math.min(9, total - 2)));
    var ans = total - cubes.length;
    var w = who();
    var prompt = U.pick([
      w + '问：看图，这个立体图形至少再添几个小正方体，就能搭成一个长 ' + dims[0] + '、宽 ' + dims[1] + '、高 ' + dims[2] + ' 的长方体？',
      w + '在草稿纸上画了一个图形：至少再添几个小正方体，就能把它补成一个长 ' + dims[0] + '、宽 ' + dims[1] + '、高 ' + dims[2] + ' 的长方体？',
      w + '遇到一道题：这个图形至少再添多少个小正方体，才能搭成长 ' + dims[0] + '、宽 ' + dims[1] + '、高 ' + dims[2] + ' 的长方体？',
      w + '看到一道思考题：再添几个小正方体就能补成长 ' + dims[0] + '、宽 ' + dims[1] + '、高 ' + dims[2] + ' 的长方体？'
    ]);
    var pool = [cubes.length, ans + 1, ans - 1, total, ans + 2, ans - 2, ans + 3, ans + 5, ans + 8, ans + 10, ans * 2, ans + 15, ans > 3 ? ans - 3 : ans + 3, ans + 4, total - 1, cubes.length + 1, total - 2, ans + 6];
    return q({
      topicId: 'g4b.u2.count', level: level,
      prompt: prompt,
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, pool.filter(function (v) { return v > 0 && v !== ans; })),
      explain: '补成的长方体共 ' + dims[0] + ' × ' + dims[1] + ' × ' + dims[2] + ' = ' + total + ' 个小正方体，现在有 ' + cubes.length + ' 个，还要添 ' + ans + ' 个。'
    });
  });

  /* ---------- 3.1 运算定律：变式辨认 ---------- */
  extend('g4b.u3.identify', function (level) {
    var laws = ['加法交换律', '加法结合律', '乘法交换律', '乘法结合律', '乘法分配律'];
    var fakes = ['减法结合律', '除法性质', '商不变规律', '减法交换律', '加法分配律', '乘法性质', '提取公因数', '拆数法'];
    function poolFor(correct) {
      var p = laws.filter(function (l) { return l !== correct; });
      return p.concat(fakes);
    }
    var x = U.pick([125, 25, 50]), y = U.pick([8, 4, 2]), z = U.pick([4, 8, 5]);
    var a2 = U.pick([48, 36, 25, 72]);
    var b1 = U.pick([36, 45, 28, 64]);
    return conceptD('g4b.u3.identify', level, [
      [x + ' × ' + y + ' × ' + z + ' = ' + x + ' × (' + y + ' × ' + z + ') 运用了（ ）', '乘法结合律', poolFor('乘法结合律'),
        '三个数相乘，先把前两个数相乘或先把后两个数相乘，积不变。'],
      [a2 + ' × 101 = ' + a2 + ' × 100 + ' + a2 + ' 运用了（ ）', '乘法分配律', poolFor('乘法分配律'),
        '把 101 看成 100 + 1，再分别与 ' + a2 + ' 相乘，这是乘法分配律。'],
      [b1 + ' × 15 + ' + b1 + ' × 5 = ' + b1 + ' × (15 + 5) 运用了（ ）', '乘法分配律', poolFor('乘法分配律'),
        '两个积有相同的因数 ' + b1 + '，可以先把另外两个因数相加，这是乘法分配律的逆用。'],
      ['a + b + c = a + (b + c) 运用了（ ）', '加法结合律', poolFor('加法结合律'),
        '三个数相加，先把前两个数相加或先把后两个数相加，和不变。'],
      ['a + b = b + a 运用了（ ）', '加法交换律', poolFor('加法交换律'),
        '两个数相加，交换加数的位置，和不变。'],
      ['a × b = b × a 运用了（ ）', '乘法交换律', poolFor('乘法交换律'),
        '两个数相乘，交换因数的位置，积不变。'],
      ['(a + b) × c = a × c + b × c 运用了（ ）', '乘法分配律', poolFor('乘法分配律'),
        '两个数的和乘一个数，可以先把它们分别与这个数相乘再相加。'],
      ['25 × (4 + 8) = 25 × 4 + 25 × 8 运用了（ ）', '乘法分配律', poolFor('乘法分配律'),
        '括号外的数分别乘括号里的两个数，这是乘法分配律。']
    ]);
  });

  /* ---------- 3.2 简便计算：提公因数与拆数 ---------- */
  extend('g4b.u3.simplify', function (level) {
    var kind = U.randInt(0, 4);
    var a, ans, prompt, explain;
    if (kind === 0) {
      a = U.randInt(12, 89);
      ans = a * 100;
      prompt = U.pick([a + ' × 99 + ' + a + ' = （ ）', '简便计算：' + a + ' × 99 + ' + a + ' = （ ）', a + ' × 99 再加 ' + a + '，得多少？']);
      explain = '把 ' + a + ' 提出来：' + a + ' × (99 + 1) = ' + a + ' × 100 = ' + ans + '。';
    } else if (kind === 1) {
      var k1 = U.pick([32, 16, 24, 88]);
      ans = 125 * k1 * 25;
      prompt = U.pick(['125 × ' + k1 + ' × 25 = （ ）', '简便计算：125 × ' + k1 + ' × 25 = （ ）', '用简便方法算：125 × ' + k1 + ' × 25 = （ ）']);
      explain = '把 ' + k1 + ' 拆成 8 × ' + (k1 / 8) + '：125 × 8 = 1000，25 × ' + (k1 / 8) + ' = ' + (25 * (k1 / 8)) + '，得 ' + ans + '。';
    } else if (kind === 2) {
      a = U.randInt(12, 89);
      ans = a * 100;
      prompt = U.pick([a + ' × 102 − ' + (2 * a) + ' = （ ）', '简便计算：' + a + ' × 102 − ' + (2 * a) + ' = （ ）', a + ' × 102 减去 ' + (2 * a) + '，得多少？']);
      explain = a + ' × 102 − ' + a + ' × 2 = ' + a + ' × (102 − 2) = ' + a + ' × 100 = ' + ans + '。';
    } else if (kind === 3) {
      var k3 = U.pick([88, 48, 56, 72]);
      ans = k3 * 125;
      prompt = U.pick([k3 + ' × 125 = （ ）', '简便计算：' + k3 + ' × 125 = （ ）', '用简便方法算：' + k3 + ' × 125 = （ ）']);
      explain = '把 ' + k3 + ' 拆成 8 × ' + (k3 / 8) + '：8 × 125 = 1000，1000 × ' + (k3 / 8) + ' = ' + ans + '。';
    } else {
      var k4 = U.pick([36, 44, 28, 32]);
      ans = k4 * 25;
      prompt = U.pick([k4 + ' × 25 = （ ）', '简便计算：' + k4 + ' × 25 = （ ）', '用简便方法算：' + k4 + ' × 25 = （ ）']);
      explain = '把 ' + k4 + ' 拆成 4 × ' + (k4 / 4) + '：4 × 25 = 100，100 × ' + (k4 / 4) + ' = ' + ans + '。';
    }
    return q({
      topicId: 'g4b.u3.simplify', level: level,
      prompt: who() + '做简便计算：' + prompt.replace(/^简便计算：|^用简便方法算：/, ''),
      correct: ans,
      wrongs: three(ans, [ans + 10, ans - 10, ans * 10, ans + 100, ans - 100, Math.floor(ans / 2), ans + 1, ans + 25, ans - 25].filter(function (v) { return v > 0 && v !== ans; })),
      explain: explain
    });
  });

  /* ---------- 4.1 小数点移动：连续移动两次 ---------- */
  extend('g4b.u4.point', function (level) {
    var op = U.pick([
      { o1: '×', k1: 10, o2: '÷', k2: 100, net: 0.1, need10: true },
      { o1: '×', k1: 100, o2: '÷', k2: 10, net: 10 },
      { o1: '÷', k1: 10, o2: '×', k2: 100, net: 10, need10: true },
      { o1: '÷', k1: 100, o2: '×', k2: 10, net: 0.1, need100: true },
      { o1: '×', k1: 10, o2: '×', k2: 10, net: 100 }
    ]);
    var cents = U.randInt(15, 999);
    if (op.need10) cents *= 10;
    if (op.need100) cents *= 100;
    var ansCents = cents * op.net;
    var correct = fmtCents(ansCents);
    var body = fmtCents(cents) + ' ' + op.o1 + ' ' + op.k1 + ' ' + op.o2 + ' ' + op.k2;
    return q({
      topicId: 'g4b.u4.point', level: level,
      prompt: U.pick([
        body + ' = （ ）',
        '计算：' + body + ' = （ ）',
        '小数点连续移动后：' + body + ' = （ ）',
        '先想小数点往哪边移：' + body + ' = （ ）'
      ]),
      correct: correct,
      wrongs: three(correct, [fmtCents(cents), fmtCents(cents * 10), fmtCents(cents * 100), fmtCents(ansCents + 10), fmtCents(ansCents - 10), fmtCents(cents / 10)]),
      explain: '把小数点先' + (op.o1 === '×' ? '向右' : '向左') + '移动 ' + (op.k1 === 10 ? 1 : op.k1 === 100 ? 2 : 3) +
        ' 位，再' + (op.o2 === '×' ? '向右' : '向左') + '移动 ' + (op.k2 === 10 ? 1 : op.k2 === 100 ? 2 : 3) +
        ' 位，结果是 ' + correct + '。'
    });
  });

  /* ---------- 4.2 小数比较：千分位也很接近 ---------- */
  extend('g4b.u4.compare', function (level) {
    var ip = U.randInt(1, 9);
    var fracs = [];
    while (fracs.length < 4) {
      var f = U.randInt(0, 999);
      if (fracs.indexOf(f) === -1) fracs.push(f);
    }
    var nums = fracs.map(function (f) { return fmt3(ip * 1000 + f); });
    var askMax = U.randInt(0, 1) === 0;
    var targetFrac = askMax ? Math.max.apply(null, fracs) : Math.min.apply(null, fracs);
    var correct = fmt3(ip * 1000 + targetFrac);
    var ask = askMax ? '最大' : '最小';
    var prompt = U.pick([
      '下面四个数：' + nums.join('、') + '，其中' + ask + '的是（ ）',
      '在 ' + nums.join('、') + ' 这四个小数中，' + ask + '的是（ ）',
      '把 ' + nums.join('、') + ' 比一比，' + ask + '的数是（ ）'
    ]);
    return q({
      topicId: 'g4b.u4.compare', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, nums.filter(function (v) { return v !== correct; })),
      explain: '整数部分相同，就从十分位、百分位、千分位依次比较，' + ask + '的是 ' + correct + '。'
    });
  });

  /* ---------- 4.3 单位换算：复名数 ---------- */
  extend('g4b.u4.unit', function (level) {
    var kind = U.randInt(0, 3);
    var a, b, scale, digits, prompt, unit;
    if (kind === 0) {
      a = U.randInt(1, 9); b = U.randInt(1, 99); scale = 100; digits = 2;
      prompt = a + ' 米 ' + b + ' 厘米 = （ ）米'; unit = '米';
    } else if (kind === 1) {
      a = U.randInt(1, 9); b = U.randInt(1, 999); scale = 1000; digits = 3;
      prompt = a + ' 千克 ' + b + ' 克 = （ ）千克'; unit = '千克';
    } else if (kind === 2) {
      a = U.randInt(1, 9); b = U.randInt(1, 999); scale = 1000; digits = 3;
      prompt = a + ' 千米 ' + b + ' 米 = （ ）千米'; unit = '千米';
    } else {
      a = U.randInt(1, 99); b = U.randInt(1, 9); scale = 10; digits = 1;
      prompt = a + ' 元 ' + b + ' 角 = （ ）元'; unit = '元';
    }
    var total = a * scale + b;
    var correct = fmtFixed(total, digits);
    return q({
      topicId: 'g4b.u4.unit', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, [
        fmtFixed(a * scale, digits),
        fmtFixed(total * 10, digits),
        fmtFixed(total * 100, digits),
        fmtFixed(total + scale, digits)
      ]),
      explain: '把复名数化成小数：整数部分写高级单位的数，低级单位的数除以进率写在小数部分，结果是 ' + correct + ' ' + unit + '。'
    });
  });

  /* ---------- 4.4 近似数：反推最大、最小 ---------- */
  extend('g4b.u4.round', function (level) {
    var t = U.randInt(10, 99); // 3.6 记作 36 个十分位
    var askMax = U.randInt(0, 1) === 0;
    var cents = askMax ? t * 10 + 4 : t * 10 - 5;
    var correct = fmtCents(cents);
    var shown = (t / 10).toFixed(1);
    var dir = askMax ? '最大' : '最小';
    var prompt = U.pick([
      '一个两位小数保留一位小数后是 ' + shown + '，这个数' + dir + '是（ ）',
      shown + '是一个两位小数保留一位小数的结果，这个两位小数' + dir + '是（ ）',
      '一个两位小数四舍五入到十分位是 ' + shown + '，它' + dir + '是（ ）',
      '近似数 ' + shown + ' 是由一个两位小数四舍五入得到的，这个两位小数' + dir + '是（ ）'
    ]);
    return q({
      topicId: 'g4b.u4.round', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, [fmtCents(t * 10 + 5), fmtCents(t * 10 - 4), fmtCents(t * 10), fmtCents(t * 10 + 3), fmtCents(t * 10 - 6), fmtCents(t * 10 + 9)]),
      explain: '保留一位小数要看百分位：' + (askMax ? '百分位最大是 4，所以最大是 ' + correct + '。' : '百分位最小是 5，所以最小是 ' + correct + '。')
    });
  });

  /* ---------- 5.1 三角形内角和：等腰三角形 ---------- */
  extend('g4b.u5.sum', function (level) {
    if (U.randInt(0, 1) === 0) {
      var a = U.randInt(25, 80);
      var apex = 180 - 2 * a;
      return q({
        topicId: 'g4b.u5.sum', level: level,
        prompt: U.pick([
          '等腰三角形的一个底角是 ' + a + '°，顶角是（ ）',
          who() + '量得等腰三角形的一个底角是 ' + a + '°，顶角是多少度？',
          '等腰三角形中，一个底角为 ' + a + '°，它的顶角是（ ）'
        ]),
        correct: apex,
        wrongs: three(apex, [180 - a, 90 - a, 2 * a, apex + 10, apex - 10, 180 - a * 2].filter(function (v) { return v > 0 && v !== apex; })),
        explain: '等腰三角形两个底角相等，顶角 = 180° − ' + a + '° × 2 = ' + apex + '°。'
      });
    }
    var top = U.randInt(10, 50) * 2;
    var bottom = (180 - top) / 2;
    return q({
      topicId: 'g4b.u5.sum', level: level,
      prompt: U.pick([
        '等腰三角形的顶角是 ' + top + '°，一个底角是（ ）',
        who() + '知道等腰三角形的顶角是 ' + top + '°，它的一个底角是多少度？',
        '一个等腰三角形，顶角 ' + top + '°，每个底角是（ ）'
      ]),
      correct: bottom,
      wrongs: three(bottom, [180 - top, 90 - top, top, bottom + 5, bottom + 10, bottom - 5].filter(function (v) { return v > 0 && v !== bottom; })),
      explain: '两个底角相等：(180° − ' + top + '°) ÷ 2 = ' + bottom + '°。'
    });
  });

  /* ---------- 5.2 三边关系：第三根的范围 ---------- */
  extend('g4b.u5.side', function (level) {
    var a = U.randInt(4, 12), b = U.randInt(4, 12);
    if (a === b) b = b === 12 ? 11 : b + 1;
    var askMax = U.randInt(0, 1) === 0;
    var correct = askMax ? a + b - 1 : Math.abs(a - b) + 1;
    var w = who();
    var dir = askMax ? '最长' : '最短';
    var prompt = U.pick([
      '两根小棒分别长 ' + a + ' 厘米和 ' + b + ' 厘米，第三根取整厘米数。第三根' + dir + '是（ ）厘米',
      w + '有两根小棒，分别长 ' + a + ' 厘米和 ' + b + ' 厘米，再配一根整厘米的小棒围成三角形，第三根' + dir + '是多少？',
      '三角形两边分别是 ' + a + ' 厘米、' + b + ' 厘米，第三边取整厘米数，' + dir + '是（ ）厘米'
    ]);
    return q({
      topicId: 'g4b.u5.side', level: level,
      prompt: prompt,
      correct: correct,
      wrongs: three(correct, [a + b, Math.abs(a - b), correct + 1, correct - 1, a + b + 1, Math.abs(a - b) + 1, correct + 2, correct - 2].filter(function (v) { return v > 0 && v !== correct; })),
      explain: '三角形任意两边之和大于第三边，两边之差小于第三边。所以第三根' +
        (askMax ? '要小于 ' + (a + b) + '，最长是 ' + correct + ' 厘米。' : '要大于 ' + Math.abs(a - b) + '，最短是 ' + correct + ' 厘米。')
    });
  });

  /* ---------- 5.3 三角形分类：角度推理 ---------- */
  extend('g4b.u5.classify', function (level) {
    var obt = U.pick([100, 110, 120, 130]);
    var eq2 = (180 - obt) / 2;
    var acute = U.randInt(30, 60);
    var other = 90 - acute;
    var maxAng = U.pick([89, 88, 85, 91, 92, 95]);
    return conceptD('g4b.u5.classify', level, [
      ['等腰三角形的一个角是 ' + obt + '°，另外两个角分别是（ ）', eq2 + '° 和 ' + eq2 + '°',
        [obt + '° 和 ' + eq2 + '°', '50° 和 30°', '80° 和 0°', (eq2 + 10) + '° 和 ' + (eq2 + 10) + '°', '90° 和 ' + eq2 + '°'],
        obt + '° 只能是顶角，两个底角相等：(180° − ' + obt + '°) ÷ 2 = ' + eq2 + '°。'],
      ['直角三角形中，一个锐角是 ' + acute + '°，另一个锐角是（ ）', other + '°',
        [(other + 10) + '°', acute + '°', (180 - acute) + '°', (other - 10) + '°', '90°'],
        '直角三角形两个锐角的和是 90°，90° − ' + acute + '° = ' + other + '°。'],
      ['等腰三角形一定是（ ）', '锐角三角形', ['直角三角形', '钝角三角形', '等腰直角三角形', '无法确定', '等腰三角形', '斜三角形', '等边直角三角形'],
        '等边三角形三个角都是 60°，所以一定是锐角三角形。'],
      ['一个三角形中，最大的角是 ' + maxAng + '°，这个三角形是（ ）', maxAng < 90 ? '锐角三角形' : '钝角三角形',
        ['直角三角形', '钝角三角形', '锐角三角形', '等边三角形', '无法确定', '等腰三角形', '斜三角形'],
        '最大角 ' + maxAng + '° ' + (maxAng < 90 ? '小于 90°，三个角都是锐角，是锐角三角形。' : '大于 90°，这个三角形是钝角三角形。')],
      ['一个三角形中，有一个角是直角，它是（ ）', '直角三角形', ['锐角三角形', '钝角三角形', '等腰三角形', '等边三角形', '无法确定', '等腰直角三角形', '斜三角形'],
        '有一个角是直角的三角形叫做直角三角形。'],
      ['等腰直角三角形的一个锐角是（ ）', '45°', ['30°', '60°', '90°', '55°', '40°', '50°', '35°'],
        '等腰直角三角形两个锐角相等，(180° − 90°) ÷ 2 = 45°。']
    ]);
  });

  /* ---------- 6.1 小数加减：三个数混合 ---------- */
  extend('g4b.u6.calc', function (level) {
    var a = U.randInt(100, 9999), b = U.randInt(100, 9999);
    var c = U.randInt(100, Math.max(101, a + b - 100));
    var ans = a + b - c;
    var correct = fmtCents(ans);
    var body = fmtCents(a) + ' + ' + fmtCents(b) + ' − ' + fmtCents(c);
    return q({
      topicId: 'g4b.u6.calc', level: level,
      prompt: U.pick([
        body + ' = （ ）',
        '计算：' + body + ' = （ ）',
        '小数加减混合：' + body + ' = （ ）',
        '竖式计算：' + body + ' = （ ）'
      ]),
      correct: correct,
      wrongs: three(correct, [fmtCents(a + b + c), fmtCents(ans + 10), fmtCents(ans - 10), fmtCents(ans * 10), fmtCents(ans + 100), fmtCents(ans - 100), fmtCents(a + b)]),
      explain: '小数点对齐，按整数加减法计算，结果是 ' + correct + '。'
    });
  });

  /* ---------- 6.2 小数简便计算：凑整与连减 ---------- */
  extend('g4b.u6.simplify', function (level) {
    if (U.randInt(0, 1) === 0) {
      var a = U.randInt(21, 89); // 2.1 ~ 8.9
      if (a % 10 === 0) a += 1;
      var k = U.randInt(1, Math.floor((a - 11) / 10));
      var c = a - k * 10; // 与 a 的十分位相同，相减得整数
      var d = U.randInt(11, 89);
      var ans = (k * 10 + d) * 10;
      var body = fmtCents(a * 10) + ' + ' + fmtCents(d * 10) + ' − ' + fmtCents(c * 10);
      return q({
        topicId: 'g4b.u6.simplify', level: level,
        prompt: U.pick([body + ' = （ ）', '简便计算：' + body + ' = （ ）', '小数凑整：' + body + ' = （ ）']),
        correct: fmtCents(ans),
        wrongs: three(fmtCents(ans), [fmtCents((a + d + c) * 10), fmtCents(ans + 10), fmtCents(ans - 10), fmtCents(ans + 100)]),
        explain: '先算 ' + fmtCents(a * 10) + ' − ' + fmtCents(c * 10) + ' = ' + fmtCents((a - c) * 10) +
          '，再加 ' + fmtCents(d * 10) + '，得 ' + fmtCents(ans) + '。'
      });
    }
    var x = U.randInt(120, 999) * 10; // 12.0 ~ 99.9
    if (x % 100 === 0) x += 10;
    var y = U.randInt(11, 89) * 10;
    var z = 1000 - y;
    var ans2 = x - 1000;
    var body2 = fmtCents(x) + ' − ' + fmtCents(y) + ' − ' + fmtCents(z);
    return q({
      topicId: 'g4b.u6.simplify', level: level,
      prompt: U.pick([body2 + ' = （ ）', '简便计算：' + body2 + ' = （ ）', '小数连减凑整：' + body2 + ' = （ ）']),
      correct: fmtCents(ans2),
      wrongs: three(fmtCents(ans2), [fmtCents(x), fmtCents(ans2 + 100), fmtCents(ans2 - 100), fmtCents(ans2 + 10)]),
      explain: '后两个数相加正好是 10：' + fmtCents(y) + ' + ' + fmtCents(z) + ' = 10，再算 ' +
        fmtCents(x) + ' − 10 = ' + fmtCents(ans2) + '。'
    });
  });

  /* ---------- 7.1 轴对称：更多涂色格 ---------- */
  extend('g4b.u7.symmetry', function (level) {
    var rows = U.pick([4, 5, 6]);
    var axis = U.pick([2, 3, 4]);
    var cols = axis * 2 + U.pick([0, 1]);
    var cells = [];
    for (var x = 0; x < axis; x++) {
      for (var y = 0; y < rows; y++) cells.push([x, y]);
    }
    var filled = U.shuffle(cells).slice(0, U.randInt(4, Math.min(10, cells.length)));
    var need = filled.length;
    var w = who();
    var prompt = U.pick([
      w + '在方格纸上画了轴对称图形的左半边（见图），虚线是对称轴。右边还要涂几个小正方形才能对称？',
      '看图：虚线是对称轴，左边涂了若干格，' + w + '要把它补成轴对称图形，右边还需要涂几个？',
      w + '画的轴对称图形只完成了左半边，虚线为对称轴。右边还需要涂几个小正方形？',
      '在 ' + cols + ' 列 ' + rows + ' 行的方格中，' + w + '已涂好左半边，虚线是对称轴，右边再涂几个就对称了？',
      w + '发现这个轴对称图形只画了一半，虚线是对称轴。右边接着涂几个才能两边一样？',
      '左边已经涂好，请帮 ' + w + ' 算一算：以虚线为对称轴，右边还要补几个小正方形？',
      w + '在练习册上做到一道对称题：虚线左边涂了这些格，右边要涂几个才对称？',
      '这是轴对称图形的一半，' + w + '问：右边按虚线补全，还需要涂几个小正方形？'
    ]);
    return q({
      topicId: 'g4b.u7.symmetry', level: level,
      prompt: prompt,
      canvas: { kind: 'symmetry', cols: cols, rows: rows, axis: axis, filled: filled },
      correct: need,
      wrongs: three(need, [need + 1, need - 1, need + 2, need - 2, need + 3, need - 3, need + 5, need + 8, need * 2, need + 10, need + 4].filter(function (v) { return v > 0 && v !== need; })),
      explain: '对称点到对称轴的距离相等，左半边有 ' + need + ' 个格子，右边就要补同样多的格子。'
    });
  });

  /* ---------- 7.2 平移：更远的距离 ---------- */
  var TRANS_SHAPES = [
    { cells: [[0, 0], [1, 0], [0, 1]], k: 3, label: '由 3 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0]], k: 3, label: '由 3 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 0]], k: 5, label: '由 5 个小正方形拼成的' }
  ];
  extend('g4b.u7.translate', function (level) {
    var shape = U.pick(TRANS_SHAPES);
    var width = 0;
    shape.cells.forEach(function (c) { if (c[0] + 1 > width) width = c[0] + 1; });
    var steps = U.randInt(5, 12);
    var cols = steps + width + U.pick([2, 5, 8]);
    var rows = U.pick([4, 5]);
    var who = U.pick(['小华', '小丽', '小明', '小刚', '小红', '小军', '小芳', '小林', '小强', '小敏', '小英', '小亮']);
    var prompt = U.pick([
      who + '在 ' + cols + ' 列的方格纸中画了一个图形（' + shape.label + '），虚线图形是它向右平移后的位置。它向右平移了几格？',
      who + '在 ' + cols + ' 列的方格纸中画的图形（' + shape.label + '），要向右平移几格才能与虚线图形重合？',
      who + '在 ' + cols + ' 列的方格纸中画了由 ' + shape.k + ' 个小正方形组成的图形，虚线图形是平移后的位置，它向右平移了（ ）格。',
      who + '画的' + shape.label + '图形，在 ' + cols + ' 列的方格纸中向右平移后得到虚线图形，平移了几格？',
      who + '数一数：在 ' + cols + ' 列的方格纸中，' + shape.label + '图形向右平移了（ ）格与虚线图形重合？',
      '在 ' + cols + ' 列的方格纸中，' + who + '把' + shape.label + '图形向右平移后得到虚线图形，图形平移了（ ）格。'
    ]);
    return q({
      topicId: 'g4b.u7.translate', level: level,
      prompt: prompt,
      canvas: {
        kind: 'translate', cols: cols, rows: rows,
        shape: shape.cells, start: [0, 0], end: [steps, 0]
      },
      correct: steps,
      wrongs: three(steps, [steps + 1, steps - 1, steps + 2, steps - 2, steps + 3, steps - 3, steps + 4, steps - 4, steps * 2, steps * 2 + 1, steps + 5, steps + 8, steps + 10, steps + 2]),
      explain: '找图形上一个对应的点，数一数它向右移动了几格，就是整个图形平移的格数：' + steps + ' 格。'
    });
  });

  /* ---------- 8.1 平均数：已知平均数反求部分和 ---------- */
  extend('g4b.u8.mean', function (level) {
    var n = U.pick([5, 6]);
    var k = U.pick([2, 3, 4]);
    var mean = U.randInt(60, 90);
    var firstSum = U.randInt(k * mean - 30, k * mean + 30);
    var ans = n * mean - firstSum;
    var w = who();
    var prompt = U.pick([
      n + ' 个数的平均数是 ' + mean + '，前 ' + k + ' 个数的和是 ' + firstSum + '，其余几个数的和是多少？',
      w + '算出 ' + n + ' 个数的平均数是 ' + mean + '，前 ' + k + ' 个共 ' + firstSum + '，剩下几个数的和是多少？',
      n + ' 个数平均为 ' + mean + '，其中前 ' + k + ' 个数的和是 ' + firstSum + '，后 ' + (n - k) + ' 个数的和是（ ）'
    ]);
    return q({
      topicId: 'g4b.u8.mean', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [n * mean, firstSum, ans + 10, ans - 10, ans + 20, firstSum - mean].filter(function (v) { return v > 0 && v !== ans; })),
      explain: n + ' 个数的总和是 ' + mean + ' × ' + n + ' = ' + (n * mean) + '，其余数的和 = ' + (n * mean) + ' − ' + firstSum + ' = ' + ans + '。'
    });
  });

  /* ---------- 8.2 统计图：先求平均数再比较 ---------- */
  extend('g4b.u8.chart', function (level) {
    var catSets = [
      ['周一', '周二', '周三', '周四', '周五'],
      ['一月', '二月', '三月', '四月', '五月'],
      ['一组', '二组', '三组', '四组', '五组']
    ];
    var cats = U.pick(catSets);
    var unit = U.pick(['人', '棵', '本']);
    var mean = U.randInt(8, 18);
    var vals = null, idx = -1;
    for (var attempt = 0; attempt < 80 && !vals; attempt++) {
      var arr = [], sum = 0;
      for (var i = 0; i < 4; i++) { var v = U.randInt(1, 25); arr.push(v); sum += v; }
      var last = 5 * mean - sum;
      if (last < 1 || last > 30) continue;
      arr.push(last);
      for (var k = 0; k < 5; k++) {
        if (arr[k] < mean) { idx = k; break; }
      }
      if (idx >= 0) vals = arr;
    }
    if (!vals) {
      vals = [mean - 3, mean - 2, mean - 1, mean, mean + 6];
      idx = 0;
    }
    var ans = mean - vals[idx];
    var w = who();
    return q({
      topicId: 'g4b.u8.chart', level: level,
      prompt: U.pick([
        '根据统计图，这 5 个' + cats[0].slice(1) + '平均每天比' + cats[idx] + '多多少' + unit + '？',
        w + '看图：5 个' + cats[0].slice(1) + '的平均数比' + cats[idx] + '多多少' + unit + '？',
        '统计图里平均每天是 ' + mean + ' ' + unit + '，比' + cats[idx] + '多多少' + unit + '？'
      ]),
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: unit },
      correct: ans,
      wrongs: three(ans, [mean, vals[idx], ans + 1, ans + 2, ans - 1, mean + vals[idx]].filter(function (v) { return v > 0 && v !== ans; })),
      explain: '5 个' + cats[0].slice(1) + '总数是 ' + (5 * mean) + ' ' + unit + '，平均每天 ' + mean + ' ' + unit + '；' + cats[idx] + '是 ' +
        vals[idx] + ' ' + unit + '，平均每天比它多 ' + ans + ' ' + unit + '。'
    });
  });

  /* ---------- 9.1 鸡兔同笼：大数或得分问题 ---------- */
  function chickenPair(chickens, rabbits) {
    return '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
  }
  function chickenWrongs(chickens, rabbits) {
    var correct = chickenPair(chickens, rabbits);
    var seen = Object.create(null);
    seen[correct] = true;
    var out = [];
    function add(c, r) {
      if (c < 1 || r < 1) return;
      var s = chickenPair(c, r);
      if (seen[s] || out.length >= 3) return;
      seen[s] = true;
      out.push(s);
    }
    var deltas = [[1, 0], [0, 1], [1, 1], [2, 0], [0, 2], [-1, 0], [0, -1], [2, 1], [1, 2], [3, 0], [0, 3], [-1, 1], [1, -1], [2, 2]];
    U.shuffle(deltas).forEach(function (d) {
      add(chickens + d[0], rabbits + d[1]);
    });
    return out;
  }

  extend('g4b.u9.chicken', function (level) {
    if (U.randInt(0, 1) === 0) {
      var heads = U.randInt(20, 40);
      var rabbits = U.randInt(3, heads - 3);
      var chickens = heads - rabbits;
      var legs = rabbits * 4 + chickens * 2;
      var correct = '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
      var w = who();
      return q({
        topicId: 'g4b.u9.chicken', level: level,
        prompt: U.pick([
          '笼子里有鸡和兔共 ' + heads + ' 只，一共 ' + legs + ' 条腿。鸡和兔各有多少只？',
          w + '数出笼子里鸡和兔共 ' + heads + ' 只，腿一共 ' + legs + ' 条。鸡、兔各几只？',
          '王大爷养的鸡和兔同笼，数头共 ' + heads + ' 个，数腿共 ' + legs + ' 条。鸡兔各多少只？'
        ]),
        correct: correct,
        wrongs: chickenWrongs(chickens, rabbits),
        explain: '假设全是鸡，共有 ' + (heads * 2) + ' 条腿，比实际少 ' + (legs - heads * 2) +
          ' 条。每把一只鸡换成兔多 2 条腿，所以兔有 ' + rabbits + ' 只，鸡有 ' + chickens + ' 只。'
      });
    }
    var right = U.randInt(5, 9);
    var wrong = 10 - right;
    var score = 5 * right - 2 * wrong;
    var w2 = who();
    return q({
      topicId: 'g4b.u9.chicken', level: level,
      prompt: U.pick([
        '答对一题得 5 分，答错一题扣 2 分，共 10 题，' + w2 + '得了 ' + score + ' 分。他答对了几题？',
        '竞赛共 10 题，答对一题 +5 分，答错一题 −2 分，' + w2 + '最后得 ' + score + ' 分。他答对几题？',
        w2 + '做 10 道题，答对得 5 分、答错扣 2 分，结果得 ' + score + ' 分。他答对了几题？'
      ]),
      correct: right,
      wrongs: three(right, [right + 1, right - 1, wrong, right + 2, right - 2, 10 - right + 1].filter(function (v) { return v > 0 && v !== right; })),
      explain: '如果全对得 50 分，实际少 ' + (50 - score) + ' 分；每错一题比答对少 5 + 2 = 7 分，所以错了 ' +
        (50 - score) / 7 + ' 题，答对 ' + right + ' 题。'
    });
  });

  MG.challengeIds = hardIds.slice();
})(typeof window !== 'undefined' ? window : globalThis);
