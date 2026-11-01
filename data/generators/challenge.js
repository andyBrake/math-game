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

  /* 取 3 个不重复、非负的干扰项，避免出现「选项3」这种兜底 */
  function three(correct, cands) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    for (var i = 0; i < cands.length && out.length < 3; i++) {
      if (cands[i] === null || cands[i] === undefined) continue;
      var s = String(cands[i]);
      if (s === 'undefined' || s === 'NaN' || s.charAt(0) === '-') continue;
      if (seen[s]) continue;
      seen[s] = true;
      out.push(cands[i]);
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
    return q({
      topicId: 'g4a.u1.read', level: level,
      prompt: '下面各数中，' + n + ' 读作：',
      correct: correct,
      wrongs: three(correct, digitVariants(n).map(readNum)),
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
    var askMax = U.randInt(0, 1) === 0;
    var correct = askMax ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
    return q({
      topicId: 'g4a.u1.compare', level: level,
      prompt: '下面各数中，' + (askMax ? '最大' : '最小') + '的是：',
      correct: String(correct),
      wrongs: three(String(correct), vals.filter(function (v) { return v !== correct; })),
      explain: '四个数的前几位都相同，要从高位往低位逐位比较，' + (askMax ? '最大' : '最小') + '的是 ' + correct + '。'
    });
  });

  /* ---------- 1.4 求近似数：九位数省略亿位 ---------- */
  extend('g4a.u1.round', function (level) {
    var n = U.randInt(100000000, 999999999);
    var r = Math.round(n / 100000000);
    var correct = r + '亿';
    return q({
      topicId: 'g4a.u1.round', level: level,
      prompt: '省略 ' + n + ' 亿位后面的尾数，约是：',
      correct: correct,
      wrongs: three(correct, [(r + 1) + '亿', (r + 2) + '亿', (r > 1 ? (r - 1) + '亿' : (r + 10) + '亿')]),
      explain: '省略亿位后面的尾数要看千万位：' + n + ' 的千万位是 ' + Math.floor(n / 10000000) % 10 +
        '，' + (Math.floor(n / 10000000) % 10 >= 5 ? '满 5 向亿位进 1' : '不满 5 直接舍去') + '，所以约是 ' + correct + '。'
    });
  });

  /* ---------- 2.1 公顷与平方千米：复名数换算 ---------- */
  extend('g4a.u2.convert', function (level) {
    var a = U.randInt(1, 9), b = U.randInt(1, 99);
    if (U.randInt(0, 1) === 0) {
      var ans1 = a * 100 + b;
      return q({
        topicId: 'g4a.u2.convert', level: level,
        prompt: a + ' 平方千米 ' + b + ' 公顷 = （ ）公顷',
        correct: ans1,
        wrongs: three(ans1, [a * 100, ans1 * 10, ans1 + 100]),
        explain: '1 平方千米 = 100 公顷，' + a + ' 平方千米 = ' + (a * 100) + ' 公顷，再加 ' + b + ' 公顷，得 ' + ans1 + ' 公顷。'
      });
    }
    var ans2 = a * 10000 + b * 100;
    return q({
      topicId: 'g4a.u2.convert', level: level,
      prompt: a + ' 公顷 ' + (b * 100) + ' 平方米 = （ ）平方米',
      correct: ans2,
      wrongs: three(ans2, [a * 10000, ans2 + 10000, ans2 * 10]),
      explain: '1 公顷 = 10000 平方米，' + a + ' 公顷 = ' + (a * 10000) + ' 平方米，再加 ' + (b * 100) + ' 平方米，得 ' + ans2 + ' 平方米。'
    });
  });

  /* ---------- 2.2 面积单位：更贴近真实的大小 ---------- */
  extend('g4a.u2.unit', function (level) {
    return concept('g4a.u2.unit', level, [
      ['一个标准篮球场的面积大约是 420（ ）', '平方米', ['公顷', '平方千米', '平方分米'],
        '篮球场长约 28 米、宽约 15 米，面积约 420 平方米。'],
      ['一个果园的面积大约是 3（ ）', '公顷', ['平方米', '平方千米', '平方分米'],
        '3 公顷 = 30000 平方米，正好是一个果园的大小。'],
      ['一个湖泊的面积大约是 20（ ）', '平方千米', ['公顷', '平方米', '平方厘米'],
        '湖泊这类很大的面积用平方千米作单位合适。'],
      ['一张课桌桌面的面积大约是 40（ ）', '平方分米', ['平方米', '公顷', '平方厘米'],
        '课桌桌面约 0.4 平方米，也就是 40 平方分米。']
    ]);
  });

  /* ---------- 3.1 角的分类：钟面与三角尺 ---------- */
  extend('g4a.u3.classify', function (level) {
    return concept('g4a.u3.classify', level, [
      ['钟面上 3 时整，时针和分针所成的角是（ ）', '90°', ['60°', '120°', '180°'],
        '钟面一大格是 30°，3 时整两针相隔 3 大格：30° × 3 = 90°。'],
      ['钟面上 4 时整，时针和分针所成的角是（ ）', '120°', ['90°', '100°', '150°'],
        '4 时整两针相隔 4 大格：30° × 4 = 120°，是一个钝角。'],
      ['用一副三角尺，可以拼出下面哪个角？', '75°', ['100°', '130°', '160°'],
        '三角尺上有 30°、45°、60°、90°，30° + 45° = 75°。'],
      ['用一副三角尺，可以拼出下面哪个角？', '105°', ['95°', '125°', '155°'],
        '三角尺上有 45° 和 60°，45° + 60° = 105°。'],
      ['一个角是 89°，这个角是（ ）', '锐角', ['直角', '钝角', '平角'],
        '小于 90° 的角是锐角，89° 比 90° 小 1°。']
    ]);
  });


  /* ---------- 3.2 角的计算：三个角或倍数关系 ---------- */
  extend('g4a.u3.sum', function (level) {
    if (U.randInt(0, 1) === 0) {
      var a = U.randInt(15, 75);
      var ans = 90 + a;
      return q({
        topicId: 'g4a.u3.sum', level: level,
        prompt: '∠1 和 ∠2 组成直角，∠2 和 ∠3 组成平角。已知 ∠1 = ' + a + '°，∠3 = （ ）',
        correct: ans,
        wrongs: three(ans, [180 - a, 90 - a, 180 + a]),
        explain: '∠2 = 90° − ' + a + '° = ' + (90 - a) + '°，∠3 = 180° − ' + (90 - a) + '° = ' + ans + '°。'
      });
    }
    var k = U.pick([2, 3, 4, 5]);
    var one = 180 / (k + 1);
    return q({
      topicId: 'g4a.u3.sum', level: level,
      prompt: '∠1 和 ∠2 组成平角，∠2 是 ∠1 的 ' + k + ' 倍。∠1 = （ ）',
      correct: one,
      wrongs: three(one, [180 - one, one + 20, 90]),
      explain: '把 ∠1 看作 1 份，∠2 是 ' + k + ' 份，共 ' + (k + 1) + ' 份是 180°，所以 ∠1 = 180° ÷ ' + (k + 1) + ' = ' + one + '°。'
    });
  });

  /* ---------- 3.3 量角器：读数后再求差 ---------- */
  extend('g4a.u3.protractor', function (level) {
    var deg = U.randInt(3, 33) * 5;
    if (deg === 90) deg = 85;
    var diff = Math.abs(deg - 90);
    return q({
      topicId: 'g4a.u3.protractor', level: level,
      prompt: '下图量角器上这个角与直角相差（ ）度',
      canvas: { kind: 'protractor', deg: deg },
      correct: diff,
      wrongs: three(diff, [deg, 180 - deg, diff + 10, diff + 20]),
      explain: '先读出这个角是 ' + deg + '°，它与 90° 相差 ' + diff + '°。'
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
    return q({
      topicId: 'g4a.u4.mul', level: level,
      prompt: shown + ' × ' + b + ' = ' + product + '，□ 里应填（ ）',
      correct: correct,
      wrongs: three(correct, [(correct + 1) % 10, (correct + 2) % 10, (correct + 9) % 10]),
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
    return q({
      topicId: 'g4a.u4.rule', level: level,
      prompt: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 ' + shown + ' = （ ）',
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
      return q({
        topicId: 'g4a.u4.word', level: level,
        prompt: '学校买 ' + num + ' 套校服，每套 ' + price + ' 元，付了 ' + pay + ' 元，应找回多少元？',
        correct: change,
        wrongs: three(change, [pay, cost, change + 100]),
        explain: '先求总价：' + price + ' × ' + num + ' = ' + cost + ' 元；再求找回：' + pay + ' − ' + cost + ' = ' + change + ' 元。'
      });
    }
    if (kind === 1) {
      var speed = U.randInt(105, 180), hours = U.randInt(3, 12), rest = U.randInt(20, 200);
      var total = speed * hours + rest;
      return q({
        topicId: 'g4a.u4.word', level: level,
        prompt: '一辆汽车每小时行 ' + speed + ' 千米，行了 ' + hours + ' 小时后离目的地还有 ' + rest + ' 千米。全程多少千米？',
        correct: total,
        wrongs: three(total, [speed * hours, total + 100, total - 50]),
        explain: '已行路程：' + speed + ' × ' + hours + ' = ' + (speed * hours) + ' 千米；全程再加剩下的 ' + rest + ' 千米，得 ' + total + ' 千米。'
      });
    }
    var unit = U.randInt(45, 99), box = U.randInt(6, 12);
    var sum = unit * box;
    var real = sum - 30;
    return q({
      topicId: 'g4a.u4.word', level: level,
      prompt: '每箱牛奶 ' + unit + ' 元，买 ' + box + ' 箱，满 300 元减 30 元，实际要付多少元？',
      correct: real,
      wrongs: three(real, [sum, sum - 60, sum + 30]),
      explain: '原价：' + unit + ' × ' + box + ' = ' + sum + ' 元，满 300 元减 30 元，实际付 ' + sum + ' − 30 = ' + real + ' 元。'
    });
  });

  /* ---------- 5.1 垂直与平行：推理 ---------- */
  extend('g4a.u5.parallel', function (level) {
    return concept('g4a.u5.parallel', level, [
      ['在同一平面内，两条直线都与第三条直线垂直，这两条直线（ ）', '互相平行', ['互相垂直', '相交', '无法确定'],
        '同一平面内，垂直于同一条直线的两条直线互相平行。'],
      ['过直线外一点画已知直线的垂线，可以画（ ）条', '1', ['2', '3', '无数'],
        '过直线外一点，有且只有一条直线与已知直线垂直。'],
      ['两条直线相交，其中一个角是 90°，其余三个角（ ）', '都是 90°', ['都是锐角', '两个钝角', '无法确定'],
        '相交成直角时，四个角都是 90°，这两条直线互相垂直。'],
      ['点 A 到直线的垂直线段长 3 厘米，那么点 A 到直线的斜线段（ ）', '都比 3 厘米长', ['都比 3 厘米短', '也长 3 厘米', '可能比 3 厘米短'],
        '点到直线的所有线段中，垂直线段最短，所以斜线段都比 3 厘米长。']
    ]);
  });

  /* ---------- 5.2 图形特征：对称轴与拼组 ---------- */
  extend('g4a.u5.shape', function (level) {
    return concept('g4a.u5.shape', level, [
      ['长方形有（ ）条对称轴', '2', ['1', '4', '无数'],
        '长方形对边中点连线所在的两条直线是对称轴，共 2 条。'],
      ['等腰梯形有（ ）条对称轴', '1', ['0', '2', '4'],
        '等腰梯形只有上下底中点连线这一条对称轴。'],
      ['两个完全一样的梯形一定可以拼成一个（ ）', '平行四边形', ['长方形', '三角形', '正方形'],
        '把两个完全一样的梯形倒过来拼，可以得到一个平行四边形。'],
      ['从平行四边形的一个顶点向对边作高，最多能作（ ）条', '2', ['1', '4', '无数'],
        '平行四边形有两组对边，从一个顶点可以向两条不同的对边各作一条高。'],
      ['平行四边形的一组对边平行且相等，另一组对边（ ）', '也平行且相等', ['只平行不相等', '只相等不平行', '无法确定'],
        '平行四边形的两组对边分别平行且相等。']
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
      prompt: '估算：' + dividend + ' ÷ ' + d + ' ≈ （ ）',
      correct: quo,
      wrongs: three(quo, [quo + 10, quo - 10, quo + 5, quo * 10]),
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
      prompt: dividend + ' ÷ ' + d + ' = （ ）',
      correct: correct,
      wrongs: three(correct, [(quo + 1) + '……' + rem, quo + '……' + rem2, (quo - 1) + '……' + rem]),
      explain: d + ' × ' + quo + ' = ' + (d * quo) + '，' + dividend + ' − ' + (d * quo) + ' = ' + rem + '，所以商是 ' + quo + '，余数是 ' + rem + '。'
    });
  });

  /* ---------- 6.3 商的变化规律：商和余数一起变 ---------- */
  extend('g4a.u6.rule', function (level) {
    return concept('g4a.u6.rule', level, [
      ['a ÷ b = 12……3，如果 a、b 同时乘 10，商是（ ），余数是（ ）', '12……30', ['120……3', '12……3', '120……30'],
        '被除数和除数同时乘 10，商不变，余数也乘 10，所以商 12 余 30。'],
      ['a ÷ b = 15……4，如果 a、b 同时乘 3，商是（ ），余数是（ ）', '15……12', ['45……4', '15……4', '45……12'],
        '商不变，余数乘 3：4 × 3 = 12。'],
      ['被除数和除数同时乘 5，商（ ），余数（ ）', '不变……乘 5', ['乘 5……不变', '不变……不变', '除以 5……乘 5'],
        '被除数和除数同时乘相同的数，商不变，但余数会乘这个数。']
    ]);
  });

  /* ---------- 7.1 条形统计图：读两根直条 ---------- */
  extend('g4a.u7.read', function (level) {
    var cats = ['一月', '二月', '三月', '四月', '五月'];
    var vals = cats.map(function () { return U.randInt(10, 50); });
    var i = U.randInt(0, 4), j = U.randInt(0, 4);
    while (j === i) j = U.randInt(0, 4);
    if (vals[i] === vals[j]) vals[j] = vals[j] === 50 ? 49 : vals[j] + 1;
    var hi = vals[i] > vals[j] ? i : j;
    var lo = hi === i ? j : i;
    var askSum = U.randInt(0, 1) === 0;
    var correct = askSum ? vals[i] + vals[j] : vals[hi] - vals[lo];
    return q({
      topicId: 'g4a.u7.read', level: level,
      prompt: askSum
        ? '根据统计图，' + cats[i] + '和' + cats[j] + '一共有多少人？'
        : '根据统计图，' + cats[hi] + '比' + cats[lo] + '多多少人？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: correct,
      wrongs: three(correct, [vals[i], vals[j], vals[i] + vals[j], Math.abs(vals[i] - vals[j])]),
      explain: askSum
        ? cats[i] + '是 ' + vals[i] + ' 人，' + cats[j] + '是 ' + vals[j] + ' 人，一共 ' + correct + ' 人。'
        : cats[hi] + '是 ' + vals[hi] + ' 人，' + cats[lo] + '是 ' + vals[lo] + ' 人，多 ' + correct + ' 人。'
    });
  });

  /* ---------- 7.2 条形统计图：和平均数比较 ---------- */
  extend('g4a.u7.compare', function (level) {
    var cats = ['一月', '二月', '三月', '四月', '五月'];
    var vals = cats.map(function () { return U.randInt(5, 50); });
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / 5;
    var count = vals.filter(function (v) { return v < mean; }).length;
    return q({
      topicId: 'g4a.u7.compare', level: level,
      prompt: '根据统计图，低于平均数的月份有几个？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: count,
      wrongs: three(count, [count + 1, count - 1, 5 - count, count + 2, 0, 5]),
      explain: '总数 ' + sum + ' 人，平均数 ' + U.num(mean) + ' 人；低于平均数的有 ' + count + ' 个月。'
    });
  });

  /* ---------- 7.3 条形统计图：先比较再计算 ---------- */
  extend('g4a.u7.draw', function (level) {
    var per = U.pick([2, 5, 10]);
    var a = U.randInt(2, 6), extra = U.randInt(1, 4);
    var ans = (a + extra) * per;
    return q({
      topicId: 'g4a.u7.draw', level: level,
      prompt: '条形统计图的纵轴每格表示 ' + per + ' 人。A 直条高 ' + a + ' 格，B 直条比 A 高 ' + extra +
        ' 格，B 直条表示多少人？',
      correct: ans,
      wrongs: three(ans, [a * per, a + extra, ans + per, ans - per]),
      explain: 'B 直条高 ' + (a + extra) + ' 格，每格 ' + per + ' 人，所以表示 ' + (a + extra) + ' × ' + per + ' = ' + ans + ' 人。'
    });
  });

  /* ---------- 8.1 沏茶：烧水与准备工作并行 ---------- */
  extend('g4a.u8.tea', function (level) {
    var t = U.randInt(4, 9);
    var prep = 5; // 洗茶杯 2 + 找茶叶 1 + 洗茶壶 2
    var ans = 2 + Math.max(t, prep) + 1;
    return q({
      topicId: 'g4a.u8.tea', level: level,
      prompt: '沏茶需要：洗水壶 1 分钟、接水 1 分钟、烧水 ' + t + ' 分钟、洗茶杯 2 分钟、找茶叶 1 分钟、洗茶壶 2 分钟、沏茶 1 分钟。' +
        '烧水前要先洗水壶和接水，沏茶前要洗茶杯、找茶叶、洗茶壶。最少需要多少分钟？',
      correct: ans,
      wrongs: three(ans, [2 + t + prep + 1, ans + 1, ans - 1, t + 3]),
      explain: '洗水壶和接水用 2 分钟；烧水 ' + t + ' 分钟的同时做 5 分钟准备工作，取较长的时间；最后沏茶 1 分钟。共 2 + ' +
        Math.max(t, prep) + ' + 1 = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.2 烙饼：锅一次放 3 张 ---------- */
  extend('g4a.u8.pancake', function (level) {
    var n = U.randInt(4, 9), t = U.randInt(1, 3);
    var batches = Math.ceil(2 * n / 3);
    var ans = batches * t;
    return q({
      topicId: 'g4a.u8.pancake', level: level,
      prompt: '一口锅每次最多烙 3 张饼，每面烙 ' + t + ' 分钟。烙 ' + n + ' 张饼最少需要多少分钟？',
      correct: ans,
      wrongs: three(ans, [n * t, 2 * n * t, ans + t, ans + 1, ans - 1, (batches - 1) * t]),
      explain: n + ' 张饼共 ' + (2 * n) + ' 面，每次最多烙 3 面，需要 ' + batches + ' 次，每次 ' + t + ' 分钟，共 ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.3 田忌赛马：应对不同出场顺序 ---------- */
  extend('g4a.u8.horse', function (level) {
    return concept('g4a.u8.horse', level, [
      ['齐王按上、中、下出场，田忌第一场应出（ ）才能最终获胜', '下等马', ['上等马', '中等马', '都可以'],
        '先用下等马对上等马输一场，再用上等马、中等马赢下两场。'],
      ['田忌用下等马对齐王的上等马，第二场应出（ ）', '上等马', ['中等马', '下等马', '都可以'],
        '第一场已经输掉，第二场要用上等马赢齐王的中等马。'],
      ['如果齐王先出下等马，田忌第一场应出（ ）才能 2 胜 1 负', '中等马', ['上等马', '下等马', '都可以'],
        '中等马能赢下等马；接着用下等马输给上等马，最后用上等马赢中等马。'],
      ['田忌要获胜，必须让哪匹马去输掉一场？', '下等马', ['上等马', '中等马', '不需要输'],
        '用最弱的下等马去输给齐王最强的上等马，才能用另外两匹赢下两场。']
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
    var e, prompt;
    if (U.randInt(0, 1) === 0) {
      e = (a + b) * c * qv;
      prompt = e + ' ÷ [(' + a + ' + ' + b + ') × ' + c + '] = （ ）';
    } else {
      e = a * (b + c) * qv;
      prompt = e + ' ÷ [' + a + ' × (' + b + ' + ' + c + ')] = （ ）';
    }
    return q({
      topicId: 'g4b.u1.order', level: level,
      prompt: prompt,
      correct: qv,
      wrongs: three(qv, [qv + 1, qv - 1, qv * 2, qv * 10]),
      explain: '先算小括号里的，再算中括号里的，最后算括号外面的除法，结果是 ' + qv + '。'
    });
  });

  /* ---------- 1.2 含括号：三步混合运算 ---------- */
  extend('g4b.u1.calc', function (level) {
    var a = U.randInt(3, 20), b = U.randInt(2, 20), c = U.randInt(2, 9);
    var e = U.randInt(2, 9), f = U.randInt(1, 9);
    var ans = (a + b) * c - f;
    return q({
      topicId: 'g4b.u1.calc', level: level,
      prompt: '(' + a + ' + ' + b + ') × ' + c + ' − ' + (e * f) + ' ÷ ' + e + ' = （ ）',
      correct: ans,
      wrongs: three(ans, [(a + b) * c, ans + 1, ans - 1, (a + b) * c + f]),
      explain: '先算括号：' + a + ' + ' + b + ' = ' + (a + b) + '；再算乘除：' + (a + b) + ' × ' + c + ' = ' +
        ((a + b) * c) + '，' + (e * f) + ' ÷ ' + e + ' = ' + f + '；最后相减得 ' + ans + '。'
    });
  });

  /* ---------- 1.3 关于 0：除数为 0 与混合运算 ---------- */
  extend('g4b.u1.zero', function (level) {
    var a = U.randInt(2, 20), b = U.randInt(2, 9);
    return concept('g4b.u1.zero', level, [
      ['0 ÷ (8 − 8) = （ ）', '无意义', ['0', '1', '8'],
        '8 − 8 = 0，0 不能作除数，所以这个算式没有意义。'],
      [a + ' × 0 + ' + b + ' ÷ ' + b + ' = （ ）', '1', ['0', String(a), String(b)],
        '先算乘除：' + a + ' × 0 = 0，' + b + ' ÷ ' + b + ' = 1；再相加 0 + 1 = 1。'],
      ['0 × ' + a + ' + 0 ÷ ' + a + ' = （ ）', '0', ['1', String(a), '无意义'],
        '0 乘任何数得 0，0 除以非 0 的数也得 0，0 + 0 = 0。']
    ]);
  });

  /* ---------- 2.1 观察物体：从上面看 ---------- */
  extend('g4b.u2.view', function (level) {
    var cubes = hardCubes(U.randInt(7, 9));
    var seen = Object.create(null);
    cubes.forEach(function (c) { seen[c.x + ',' + c.y] = true; });
    var ans = Object.keys(seen).length;
    return q({
      topicId: 'g4b.u2.view', level: level,
      prompt: '由这些小正方体搭成的立体图形，从上面看能看到几个正方形？',
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, [cubes.length, ans + 1, ans - 1]),
      explain: '从上面看时，上下重叠的正方形只算一个，共能看到 ' + ans + ' 个正方形。'
    });
  });

  /* ---------- 2.2 数正方体：补成长方体 ---------- */
  extend('g4b.u2.count', function (level) {
    var cubes = hardCubes(U.randInt(5, 9));
    var total = 3 * 2 * 3;
    var ans = total - cubes.length;
    return q({
      topicId: 'g4b.u2.count', level: level,
      prompt: '这个立体图形至少再添几个小正方体，就能搭成一个长 3、宽 2、高 3 的长方体？',
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, [cubes.length, ans + 1, ans - 1, total]),
      explain: '补成的长方体共 3 × 2 × 3 = ' + total + ' 个小正方体，现在有 ' + cubes.length + ' 个，还要添 ' + ans + ' 个。'
    });
  });

  /* ---------- 3.1 运算定律：变式辨认 ---------- */
  extend('g4b.u3.identify', function (level) {
    return concept('g4b.u3.identify', level, [
      ['125 × 8 × 4 = 125 × (8 × 4) 运用了（ ）', '乘法结合律', ['乘法交换律', '乘法分配律', '加法结合律'],
        '三个数相乘，先把前两个数相乘或先把后两个数相乘，积不变。'],
      ['48 × 101 = 48 × 100 + 48 运用了（ ）', '乘法分配律', ['乘法结合律', '乘法交换律', '加法交换律'],
        '把 101 看成 100 + 1，再分别与 48 相乘，这是乘法分配律。'],
      ['36 × 15 + 36 × 5 = 36 × (15 + 5) 运用了（ ）', '乘法分配律', ['乘法结合律', '乘法交换律', '加法结合律'],
        '两个积有相同的因数 36，可以先把另外两个因数相加，这是乘法分配律的逆用。'],
      ['a + b + c = a + (b + c) 运用了（ ）', '加法结合律', ['加法交换律', '乘法结合律', '乘法分配律'],
        '三个数相加，先把前两个数相加或先把后两个数相加，和不变。']
    ]);
  });

  /* ---------- 3.2 简便计算：提公因数与拆数 ---------- */
  extend('g4b.u3.simplify', function (level) {
    var kind = U.randInt(0, 4);
    var a, ans, prompt, explain;
    if (kind === 0) {
      a = U.randInt(12, 89);
      ans = a * 100;
      prompt = a + ' × 99 + ' + a + ' = （ ）';
      explain = '把 ' + a + ' 提出来：' + a + ' × (99 + 1) = ' + a + ' × 100 = ' + ans + '。';
    } else if (kind === 1) {
      ans = 100000;
      prompt = '125 × 32 × 25 = （ ）';
      explain = '把 32 拆成 8 × 4：125 × 8 = 1000，4 × 25 = 100，1000 × 100 = 100000。';
    } else if (kind === 2) {
      a = U.randInt(12, 89);
      ans = a * 100;
      prompt = a + ' × 102 − ' + (2 * a) + ' = （ ）';
      explain = a + ' × 102 − ' + a + ' × 2 = ' + a + ' × (102 − 2) = ' + a + ' × 100 = ' + ans + '。';
    } else if (kind === 3) {
      ans = 11000;
      prompt = '88 × 125 = （ ）';
      explain = '把 88 拆成 8 × 11：8 × 125 = 1000，1000 × 11 = 11000。';
    } else {
      ans = 900;
      prompt = '36 × 25 = （ ）';
      explain = '把 36 拆成 9 × 4：4 × 25 = 100，9 × 100 = 900。';
    }
    return q({
      topicId: 'g4b.u3.simplify', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, [ans + 10, ans - 10, ans * 10]),
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
    return q({
      topicId: 'g4b.u4.point', level: level,
      prompt: fmtCents(cents) + ' ' + op.o1 + ' ' + op.k1 + ' ' + op.o2 + ' ' + op.k2 + ' = （ ）',
      correct: correct,
      wrongs: three(correct, [fmtCents(cents), fmtCents(cents * 10), fmtCents(cents * 100), fmtCents(ansCents + 10)]),
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
    var askMax = U.randInt(0, 1) === 0;
    var target = askMax ? Math.max.apply(null, fracs) : Math.min.apply(null, fracs);
    var correct = fmt3(ip * 1000 + target);
    return q({
      topicId: 'g4b.u4.compare', level: level,
      prompt: '下面各数中，' + (askMax ? '最大' : '最小') + '的是：',
      correct: correct,
      wrongs: three(correct, fracs.filter(function (v) { return v !== target; }).map(function (v) { return fmt3(ip * 1000 + v); })),
      explain: '整数部分相同，就从十分位、百分位、千分位依次比较，' + (askMax ? '最大' : '最小') + '的是 ' + correct + '。'
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
    return q({
      topicId: 'g4b.u4.round', level: level,
      prompt: '一个两位小数保留一位小数后是 ' + (t / 10).toFixed(1) + '，这个数' + (askMax ? '最大' : '最小') + '是（ ）',
      correct: correct,
      wrongs: three(correct, [fmtCents(t * 10 + 5), fmtCents(t * 10 - 4), fmtCents(t * 10)]),
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
        prompt: '等腰三角形的一个底角是 ' + a + '°，顶角是（ ）',
        correct: apex,
        wrongs: three(apex, [180 - a, 90 - a, 2 * a]),
        explain: '等腰三角形两个底角相等，顶角 = 180° − ' + a + '° × 2 = ' + apex + '°。'
      });
    }
    var top = U.randInt(10, 50) * 2;
    var bottom = (180 - top) / 2;
    return q({
      topicId: 'g4b.u5.sum', level: level,
      prompt: '等腰三角形的顶角是 ' + top + '°，一个底角是（ ）',
      correct: bottom,
      wrongs: three(bottom, [180 - top, 90 - top, top, bottom + 5]),
      explain: '两个底角相等：(180° − ' + top + '°) ÷ 2 = ' + bottom + '°。'
    });
  });

  /* ---------- 5.2 三边关系：第三根的范围 ---------- */
  extend('g4b.u5.side', function (level) {
    var a = U.randInt(4, 12), b = U.randInt(4, 12);
    if (a === b) b = b === 12 ? 11 : b + 1;
    var askMax = U.randInt(0, 1) === 0;
    var correct = askMax ? a + b - 1 : Math.abs(a - b) + 1;
    return q({
      topicId: 'g4b.u5.side', level: level,
      prompt: '两根小棒分别长 ' + a + ' 厘米和 ' + b + ' 厘米，第三根取整厘米数。第三根' +
        (askMax ? '最长' : '最短') + '是（ ）厘米',
      correct: correct,
      wrongs: three(correct, [a + b, Math.abs(a - b), correct + 1, correct - 1]),
      explain: '三角形任意两边之和大于第三边，两边之差小于第三边。所以第三根' +
        (askMax ? '要小于 ' + (a + b) + '，最长是 ' + correct + ' 厘米。' : '要大于 ' + Math.abs(a - b) + '，最短是 ' + correct + ' 厘米。')
    });
  });

  /* ---------- 5.3 三角形分类：角度推理 ---------- */
  extend('g4b.u5.classify', function (level) {
    return concept('g4b.u5.classify', level, [
      ['等腰三角形的一个角是 100°，另外两个角分别是（ ）', '40° 和 40°', ['100° 和 40°', '50° 和 30°', '80° 和 0°'],
        '100° 只能是顶角，两个底角相等：(180° − 100°) ÷ 2 = 40°。'],
      ['直角三角形中，一个锐角是 35°，另一个锐角是（ ）', '55°', ['65°', '35°', '145°'],
        '直角三角形两个锐角的和是 90°，90° − 35° = 55°。'],
      ['等边三角形一定是（ ）', '锐角三角形', ['直角三角形', '钝角三角形', '等腰直角三角形'],
        '等边三角形三个角都是 60°，所以一定是锐角三角形。'],
      ['一个三角形中，最大的角是 89°，这个三角形是（ ）', '锐角三角形', ['直角三角形', '钝角三角形', '无法确定'],
        '最大的角只有 89°，说明三个角都小于 90°，是锐角三角形。'],
      ['一个三角形中，最大的角是 91°，这个三角形是（ ）', '钝角三角形', ['锐角三角形', '直角三角形', '等边三角形'],
        '最大的角大于 90°，这个三角形是钝角三角形。']
    ]);
  });

  /* ---------- 6.1 小数加减：三个数混合 ---------- */
  extend('g4b.u6.calc', function (level) {
    var a = U.randInt(100, 9999), b = U.randInt(100, 9999);
    var c = U.randInt(100, Math.max(101, a + b - 100));
    var ans = a + b - c;
    var correct = fmtCents(ans);
    return q({
      topicId: 'g4b.u6.calc', level: level,
      prompt: fmtCents(a) + ' + ' + fmtCents(b) + ' − ' + fmtCents(c) + ' = （ ）',
      correct: correct,
      wrongs: three(correct, [fmtCents(a + b + c), fmtCents(ans + 10), fmtCents(ans - 10), fmtCents(ans * 10)]),
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
      return q({
        topicId: 'g4b.u6.simplify', level: level,
        prompt: fmtCents(a * 10) + ' + ' + fmtCents(d * 10) + ' − ' + fmtCents(c * 10) + ' = （ ）',
        correct: fmtCents(ans),
        wrongs: three(fmtCents(ans), [fmtCents((a + d + c) * 10), fmtCents(ans + 10), fmtCents(ans - 10)]),
        explain: '先算 ' + fmtCents(a * 10) + ' − ' + fmtCents(c * 10) + ' = ' + fmtCents((a - c) * 10) +
          '，再加 ' + fmtCents(d * 10) + '，得 ' + fmtCents(ans) + '。'
      });
    }
    var x = U.randInt(120, 999) * 10; // 12.0 ~ 99.9
    if (x % 100 === 0) x += 10;
    var y = U.randInt(11, 89) * 10;
    var z = 1000 - y;
    var ans2 = x - 1000;
    return q({
      topicId: 'g4b.u6.simplify', level: level,
      prompt: fmtCents(x) + ' − ' + fmtCents(y) + ' − ' + fmtCents(z) + ' = （ ）',
      correct: fmtCents(ans2),
      wrongs: three(fmtCents(ans2), [fmtCents(x), fmtCents(ans2 + 100), fmtCents(ans2 - 100)]),
      explain: '后两个数相加正好是 10：' + fmtCents(y) + ' + ' + fmtCents(z) + ' = 10，再算 ' +
        fmtCents(x) + ' − 10 = ' + fmtCents(ans2) + '。'
    });
  });

  /* ---------- 7.1 轴对称：更多涂色格 ---------- */
  extend('g4b.u7.symmetry', function (level) {
    var cols = 6, rows = 5, axis = 3;
    var cells = [];
    for (var x = 0; x < axis; x++) {
      for (var y = 0; y < rows; y++) cells.push([x, y]);
    }
    var filled = U.shuffle(cells).slice(0, U.randInt(6, 8));
    var need = filled.length;
    return q({
      topicId: 'g4b.u7.symmetry', level: level,
      prompt: '虚线是对称轴。要把左半边补成轴对称图形，右边还需要涂几个小正方形？',
      canvas: { kind: 'symmetry', cols: cols, rows: rows, axis: axis, filled: filled },
      correct: need,
      wrongs: three(need, [need + 1, need - 1, need + 2]),
      explain: '对称点到对称轴的距离相等，左半边有 ' + need + ' 个格子，右边就要补同样多的格子。'
    });
  });

  /* ---------- 7.2 平移：更远的距离 ---------- */
  extend('g4b.u7.translate', function (level) {
    var shape = [[0, 0], [1, 0], [0, 1], [1, 1]].slice(0, U.randInt(3, 4));
    var steps = U.randInt(6, 9);
    return q({
      topicId: 'g4b.u7.translate', level: level,
      prompt: '下面的图形要向右平移几格，才能与虚线图形重合？',
      canvas: {
        kind: 'translate', cols: 12, rows: 5,
        shape: shape, start: [0, 0], end: [steps, 0]
      },
      correct: steps,
      wrongs: three(steps, [steps + 1, steps - 1, steps + 2]),
      explain: '找图形上一个对应的点，数一数它向右移动了几格，就是整个图形平移的格数：' + steps + ' 格。'
    });
  });

  /* ---------- 8.1 平均数：已知平均数反求部分和 ---------- */
  extend('g4b.u8.mean', function (level) {
    var mean = U.randInt(60, 90);
    var firstSum = U.randInt(150, 5 * mean - 20);
    var ans = 5 * mean - firstSum;
    return q({
      topicId: 'g4b.u8.mean', level: level,
      prompt: '5 个数的平均数是 ' + mean + '，前 3 个数的和是 ' + firstSum + '，后两个数的和是多少？',
      correct: ans,
      wrongs: three(ans, [5 * mean, firstSum, ans + 10]),
      explain: '5 个数的总和是 ' + mean + ' × 5 = ' + (5 * mean) + '，后两个数的和 = ' + (5 * mean) + ' − ' + firstSum + ' = ' + ans + '。'
    });
  });

  /* ---------- 8.2 统计图：先求平均数再比较 ---------- */
  extend('g4b.u8.chart', function (level) {
    var cats = ['周一', '周二', '周三', '周四', '周五'];
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
    return q({
      topicId: 'g4b.u8.chart', level: level,
      prompt: '根据统计图，这 5 天平均每天比' + cats[idx] + '多多少人？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: ans,
      wrongs: three(ans, [mean, vals[idx], ans + 1]),
      explain: '5 天总数是 ' + (5 * mean) + ' 人，平均每天 ' + mean + ' 人；' + cats[idx] + '是 ' +
        vals[idx] + ' 人，平均每天比它多 ' + ans + ' 人。'
    });
  });

  /* ---------- 9.1 鸡兔同笼：大数或得分问题 ---------- */
  extend('g4b.u9.chicken', function (level) {
    if (U.randInt(0, 1) === 0) {
      var heads = U.randInt(20, 40);
      var rabbits = U.randInt(3, heads - 3);
      var chickens = heads - rabbits;
      var legs = rabbits * 4 + chickens * 2;
      var correct = '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
      return q({
        topicId: 'g4b.u9.chicken', level: level,
        prompt: '笼子里有鸡和兔共 ' + heads + ' 只，一共 ' + legs + ' 条腿。鸡和兔各有多少只？',
        correct: correct,
        wrongs: three(correct, [
          '鸡 ' + rabbits + ' 只，兔 ' + chickens + ' 只',
          '鸡 ' + (chickens + 1) + ' 只，兔 ' + (rabbits - 1) + ' 只',
          '鸡 ' + (chickens - 1) + ' 只，兔 ' + (rabbits + 1) + ' 只'
        ]),
        explain: '假设全是鸡，共有 ' + (heads * 2) + ' 条腿，比实际少 ' + (legs - heads * 2) +
          ' 条。每把一只鸡换成兔多 2 条腿，所以兔有 ' + rabbits + ' 只，鸡有 ' + chickens + ' 只。'
      });
    }
    var right = U.randInt(5, 9);
    var wrong = 10 - right;
    var score = 5 * right - 2 * wrong;
    return q({
      topicId: 'g4b.u9.chicken', level: level,
      prompt: '答对一题得 5 分，答错一题扣 2 分，共 10 题，小明得了 ' + score + ' 分。他答对了几题？',
      correct: right,
      wrongs: three(right, [right + 1, right - 1, wrong]),
      explain: '如果全对得 50 分，实际少 ' + (50 - score) + ' 分；每错一题比答对少 5 + 2 = 7 分，所以错了 ' +
        (50 - score) / 7 + ' 题，答对 ' + right + ' 题。'
    });
  });

  MG.challengeIds = hardIds.slice();
})(typeof window !== 'undefined' ? window : globalThis);
