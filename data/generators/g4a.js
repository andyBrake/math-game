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
    return q({
      topicId: 'g4a.u1.read', level: level,
      prompt: '下面各数中，' + n + ' 读作：',
      correct: correct,
      wrongs: digitVariants(n).map(readNum),
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
    var max = Math.max.apply(null, set);
    return q({
      topicId: 'g4a.u1.compare', level: level,
      prompt: '下面各数中，最大的是：',
      correct: String(max),
      wrongs: set.filter(function (v) { return v !== max; }),
      explain: '位数相同时从最高位比起，最高位大的数就大；最高位相同再比下一位。'
    });
  });

  /* ---------- 1.4 大数的认识：改写与近似数 ---------- */
  R('g4a.u1.round', function (level) {
    if (level === 1) {
      var w = U.randInt(12, 980);
      var n = w * 10000;
      return q({
        topicId: 'g4a.u1.round', level: level,
        prompt: '把 ' + n + ' 改写成用「万」作单位的数是：',
        correct: w + '万',
        wrongs: [(w * 10) + '万', (w + 1) + '万', (w * 100) + '万'],
        explain: '改写成用「万」作单位，去掉末尾的 4 个 0，再写上「万」字：' + n + ' = ' + w + '万。'
      });
    }
    var num = U.randInt(Math.pow(10, 5), Math.pow(10, 7) - 1);
    var rounded = Math.round(num / 10000);
    return q({
      topicId: 'g4a.u1.round', level: level,
      prompt: '省略 ' + num + ' 万位后面的尾数，约是：',
      correct: rounded + '万',
      wrongs: [(rounded + 1) + '万', (rounded - 1) + '万', (rounded * 10) + '万'],
      explain: '省略万位后面的尾数要看千位：' + num + ' 的千位是 ' + Math.floor(num / 1000) % 10 +
        '，' + (Math.floor(num / 1000) % 10 >= 5 ? '满 5 向前一位进 1' : '不满 5 直接舍去') + '，所以约是 ' + rounded + '万。'
    });
  });

  /* ---------- 2.1 公顷和平方千米：换算 ---------- */
  R('g4a.u2.convert', function (level) {
    var k = level >= 3 ? U.randInt(2, 9) : U.randInt(1, 5);
    var forms = [
      { ask: k + ' 公顷 = （ ）平方米', ans: k * 10000, unit: '平方米' },
      { ask: (k * 10000) + ' 平方米 = （ ）公顷', ans: k, unit: '公顷' },
      { ask: k + ' 平方千米 = （ ）公顷', ans: k * 100, unit: '公顷' },
      { ask: (k * 100) + ' 公顷 = （ ）平方千米', ans: k, unit: '平方千米' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u2.convert', level: level,
      prompt: f.ask,
      correct: f.ans,
      wrongs: [f.ans * 10, f.ans + 1, f.ans * 100],
      explain: '1 公顷 = 10000 平方米，1 平方千米 = 100 公顷。答案：' + f.ans + ' ' + f.unit + '。'
    });
  });

  /* ---------- 2.2 公顷和平方千米：选择单位 ---------- */
  R('g4a.u2.unit', function (level) {
    return concept('g4a.u2.unit', level, [
      ['一间教室的面积大约是 60（ ）', '平方米', ['公顷', '平方千米', '平方厘米'],
        '教室面积用平方米计量，60 平方米比较合理。'],
      ['一个操场的面积大约是 1（ ）', '公顷', ['平方米', '平方千米', '平方分米'],
        '1 公顷 = 10000 平方米，正好相当于一个较大的操场。'],
      ['一座城市的面积大约是 800（ ）', '平方千米', ['平方米', '公顷', '平方厘米'],
        '城市这类很大的面积用平方千米作单位。'],
      ['天安门广场的面积大约是 44（ ）', '公顷', ['平方米', '平方千米', '平方分米'],
        '44 公顷 = 440000 平方米，与广场实际大小相符。']
    ]);
  });

  /* ---------- 3.1 角的度量：分类 ---------- */
  R('g4a.u3.classify', function (level) {
    var kind = U.pick(['锐角', '直角', '钝角', '平角']);
    var deg;
    if (kind === '直角') deg = 90;
    else if (kind === '平角') deg = 180;
    else if (kind === '锐角') deg = U.randInt(15, 85);
    else deg = U.randInt(95, 175);
    return q({
      topicId: 'g4a.u3.classify', level: level,
      prompt: '下图中这个角是：',
      canvas: { kind: 'angle', deg: deg },
      correct: kind,
      wrongs: ['锐角', '直角', '钝角', '平角'].filter(function (x) { return x !== kind; }),
      explain: deg + '° 的角是' + kind + '。小于 90° 是锐角，等于 90° 是直角，大于 90° 小于 180° 是钝角，等于 180° 是平角。'
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
    return q({
      topicId: 'g4a.u3.sum', level: level,
      prompt: '∠1 和 ∠2 组成一个' + f.name + '，已知 ∠1 = ' + a + '°，那么 ∠2 = （ ）',
      correct: ans,
      wrongs: [f.total + a, a, ans + 10, ans - 10],
      explain: f.name + '是 ' + f.total + '°，所以 ∠2 = ' + f.total + '° − ' + a + '° = ' + ans + '°。'
    });
  });

  /* ---------- 3.3 角的度量：量角器读数（改为选择） ---------- */
  R('g4a.u3.protractor', function (level) {
    var deg = U.randInt(3, 33) * 5; // 15 ~ 165
    return q({
      topicId: 'g4a.u3.protractor', level: level,
      prompt: '下图量角器上这个角是多少度？',
      canvas: { kind: 'protractor', deg: deg },
      correct: deg,
      wrongs: [180 - deg, deg + 5, deg - 5, deg + 10],
      explain: '量角时角的顶点对准中心点，一条边对准 0° 刻度线，另一条边所指的刻度就是角的度数，这里是 ' + deg + '°。'
    });
  });

  /* ---------- 4.1 三位数乘两位数：笔算 ---------- */
  R('g4a.u4.mul', function (level) {
    var a = level >= 3 ? U.randInt(300, 999) : U.randInt(120, 899);
    var b = level >= 3 ? U.randInt(25, 99) : U.randInt(12, 89);
    var ans = a * b;
    return q({
      topicId: 'g4a.u4.mul', level: level,
      prompt: a + ' × ' + b + ' = （ ）',
      correct: ans,
      wrongs: [ans + a * 10, ans - a, Number(String(ans) + '0'), ans + 100],
      explain: '先用 ' + a + ' 乘个位上的 ' + (b % 10) + '，再用 ' + a + ' 乘十位上的 ' + Math.floor(b / 10) +
        '（积的末位与十位对齐），最后相加得 ' + ans + '。'
    });
  });

  /* ---------- 4.2 三位数乘两位数：积的变化规律 ---------- */
  R('g4a.u4.rule', function (level) {
    var a = U.randInt(11, 40);
    var k = U.pick([2, 3, 4, 5, 10]);
    var b = k * U.randInt(4, 10);
    var c = a * b;
    var forms = [
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 ' + a + ' × ' + (b * k) + ' = （ ）', ans: c * k, e: '一个因数不变，另一个因数乘 ' + k + '，积也乘 ' + k + '。' },
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × ' + k + ') × (' + b + ' ÷ ' + k + ') = （ ）', ans: c, e: '一个因数乘 ' + k + '，另一个因数除以 ' + k + '，积不变。' },
      { p: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × 2) × (' + b + ' × 3) = （ ）', ans: c * 6, e: '两个因数分别乘 2 和乘 3，积就乘 2 × 3 = 6。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u4.rule', level: level,
      prompt: f.p,
      correct: f.ans,
      wrongs: [f.ans / k, f.ans * k, f.ans + k * 10, c],
      explain: f.e + '所以结果是 ' + f.ans + '。'
    });
  });

  /* ---------- 4.3 三位数乘两位数：单价与速度 ---------- */
  R('g4a.u4.word', function (level) {
    var a = U.randInt(105, 480), b = U.randInt(12, 45);
    var forms = [
      { p: '一套校服 ' + a + ' 元，买 ' + b + ' 套一共需要多少元？', ans: a * b, e: '总价 = 单价 × 数量 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 元。' },
      { p: '一辆汽车每小时行 ' + a + ' 千米，' + b + ' 小时行多少千米？', ans: a * b, e: '路程 = 速度 × 时间 = ' + a + ' × ' + b + ' = ' + (a * b) + ' 千米。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u4.word', level: level,
      prompt: f.p,
      correct: f.ans,
      wrongs: [f.ans + a, f.ans - b, f.ans * 10],
      explain: f.e
    });
  });

  /* ---------- 5.1 平行四边形和梯形：垂直与平行 ---------- */
  R('g4a.u5.parallel', function (level) {
    return concept('g4a.u5.parallel', level, [
      ['在同一个平面内不相交的两条直线叫做（ ）', '平行线', ['垂线', '射线', '线段'],
        '同一平面内不相交的两条直线互相平行，这两条直线叫做平行线。'],
      ['两条直线相交成直角，就说这两条直线（ ）', '互相垂直', ['互相平行', '互相重合', '无法确定'],
        '两条直线相交成直角时互相垂直，其中一条是另一条的垂线。'],
      ['从直线外一点到这条直线所画的线段中，（ ）最短', '垂直线段', ['斜线段', '最长的线段', '任意线段'],
        '点到直线的所有线段中，垂直线段最短，它的长度叫做点到直线的距离。'],
      ['两条平行线之间的距离（ ）', '处处相等', ['越远越大', '越远越小', '无法比较'],
        '平行线之间的垂直线段长度处处相等。']
    ]);
  });

  /* ---------- 5.2 平行四边形和梯形：图形特征 ---------- */
  R('g4a.u5.shape', function (level) {
    return concept('g4a.u5.shape', level, [
      ['只有一组对边平行的四边形叫做（ ）', '梯形', ['平行四边形', '长方形', '正方形'],
        '只有一组对边平行的四边形是梯形；两组对边都平行的是平行四边形。'],
      ['两组对边分别平行的四边形叫做（ ）', '平行四边形', ['梯形', '三角形', '圆'],
        '两组对边分别平行的四边形是平行四边形。'],
      ['平行四边形有（ ）条高', '无数', ['1', '2', '4'],
        '从平行四边形一条边上任意一点向对边作垂线都是高，所以有无数条。'],
      ['长方形是特殊的（ ）', '平行四边形', ['梯形', '三角形', '圆'],
        '长方形的两组对边分别平行，所以是特殊的平行四边形。'],
      ['平行四边形容易变形，这种特性叫做（ ）', '不稳定性', ['稳定性', '对称性', '旋转性'],
        '平行四边形具有不稳定性，三角形具有稳定性。']
    ]);
  });

  /* ---------- 6.1 除数是两位数的除法：估算 ---------- */
  R('g4a.u6.estimate', function (level) {
    var d0 = U.randInt(2, 9) * 10;
    var quo = U.randInt(2, 9);
    var d = d0 + U.randInt(-4, 4);
    var dividend = d0 * quo + U.randInt(-9, 9);
    if (dividend <= 0) dividend = d0 * quo;
    return q({
      topicId: 'g4a.u6.estimate', level: level,
      prompt: '估算：' + dividend + ' ÷ ' + d + ' ≈ （ ）',
      correct: quo,
      wrongs: [quo + 1, quo - 1, quo * 10, quo + 10],
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
    return q({
      topicId: 'g4a.u6.div', level: level,
      prompt: dividend + ' ÷ ' + d + ' = （ ）',
      correct: quo,
      wrongs: [quo + 1, quo - 1, quo * 10, quo + 10],
      explain: '把 ' + d + ' 看作 ' + (Math.round(d / 10) * 10) + ' 试商，' + d + ' × ' + quo + ' = ' + dividend + '，所以商是 ' + quo + '。'
    });
  });

  /* ---------- 6.3 除数是两位数的除法：商的变化规律 ---------- */
  R('g4a.u6.rule', function (level) {
    var k = U.pick([10, 100, 5, 2]);
    return concept('g4a.u6.rule', level, [
      ['被除数和除数同时乘 ' + k + '，商（ ）', '不变', ['乘 ' + k, '除以 ' + k, '变成 0'],
        '被除数和除数同时乘或除以相同的数（0 除外），商不变。'],
      ['被除数不变，除数乘 ' + k + '，商（ ）', '除以 ' + k, ['乘 ' + k, '不变', '增加 ' + k],
        '被除数不变时，除数扩大几倍，商就缩小到原来的几分之一。'],
      ['除数不变，被除数乘 ' + k + '，商（ ）', '乘 ' + k, ['除以 ' + k, '不变', '减少 ' + k],
        '除数不变时，被除数扩大几倍，商也扩大几倍。'],
      ['被除数和除数同时除以 ' + k + '，商（ ）', '不变', ['乘 ' + k, '除以 ' + k, '无法确定'],
        '被除数和除数同时缩小相同的倍数，商不变。']
    ]);
  });

  /* ---------- 7.1 条形统计图：读图 ---------- */
  function makeBars(count, maxVal) {
    var cats = ['一月', '二月', '三月', '四月', '五月', '六月'].slice(0, count);
    var vals = cats.map(function () { return U.randInt(5, maxVal); });
    return { cats: cats, vals: vals };
  }

  R('g4a.u7.read', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 45);
    var idx = U.randInt(0, d.cats.length - 1);
    var ans = d.vals[idx];
    var others = d.vals.filter(function (_, i) { return i !== idx; });
    while (others.length < 3) others.push(others[0] + 1);
    return q({
      topicId: 'g4a.u7.read', level: level,
      prompt: '根据统计图，' + d.cats[idx] + '有多少人？',
      canvas: { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' },
      correct: ans,
      wrongs: others,
      explain: '看 ' + d.cats[idx] + ' 对应的直条，顶端对准的刻度是 ' + ans + '。'
    });
  });

  /* ---------- 7.2 条形统计图：比较 ---------- */
  R('g4a.u7.compare', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 50);
    var max = Math.max.apply(null, d.vals);
    var min = Math.min.apply(null, d.vals);
    var mode = U.pick(['max', 'diff']);
    if (mode === 'max') {
      var mi = d.vals.indexOf(max);
      return q({
        topicId: 'g4a.u7.compare', level: level,
        prompt: '哪个月的人数最多？',
        canvas: { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' },
        correct: d.cats[mi],
        wrongs: d.cats.filter(function (_, i) { return i !== mi; }),
        explain: '直条最高的 ' + d.cats[mi] + ' 人数最多，是 ' + max + ' 人。'
      });
    }
    return q({
      topicId: 'g4a.u7.compare', level: level,
      prompt: '人数最多的月份比最少的月份多多少人？',
      canvas: { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' },
      correct: max - min,
      wrongs: [max, min, max + min],
      explain: '最多 ' + max + ' 人，最少 ' + min + ' 人，相差 ' + max + ' − ' + min + ' = ' + (max - min) + ' 人。'
    });
  });

  /* ---------- 7.3 条形统计图：直条高度 ---------- */
  R('g4a.u7.draw', function (level) {
    var per = U.pick([2, 5, 10]);
    var cells = U.randInt(3, 8);
    var ans = per * cells;
    return q({
      topicId: 'g4a.u7.draw', level: level,
      prompt: '条形统计图的纵轴每格表示 ' + per + ' 人。某个直条高 ' + cells + ' 格，表示多少人？',
      correct: ans,
      wrongs: [cells, per, ans + per, ans - per],
      explain: '每格表示 ' + per + ' 人，' + cells + ' 格就是 ' + per + ' × ' + cells + ' = ' + ans + ' 人。'
    });
  });

  /* ---------- 8.1 优化：沏茶 ---------- */
  R('g4a.u8.tea', function (level) {
    var boil = U.randInt(6, 10);
    var ans = boil + 3; // 洗水壶 1 + 接水 1 + 沏茶 1，洗杯找茶在烧水时做
    return q({
      topicId: 'g4a.u8.tea', level: level,
      prompt: '沏茶需要：洗水壶 1 分钟、接水 1 分钟、烧水 ' + boil + ' 分钟、洗茶杯 2 分钟、找茶叶 1 分钟、沏茶 1 分钟。合理安排最少需要多少分钟？',
      correct: ans,
      wrongs: [ans + 2, ans + 3, boil + 6, ans - 1],
      explain: '烧水的同时洗茶杯、找茶叶，共用 1 + 1 + ' + boil + ' + 1 = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.2 优化：烙饼 ---------- */
  R('g4a.u8.pancake', function (level) {
    var n = U.randInt(1, 6);
    var t = U.pick([3, 4]);
    var ans = n === 1 ? 2 * t : n * t;
    var wrongs = [];
    if (n === 1) wrongs = [t, 3 * t, 4 * t];
    else wrongs = [n * t + t, n * t - t, n * 2 * t];
    return q({
      topicId: 'g4a.u8.pancake', level: level,
      prompt: '一口锅每次最多烙 2 张饼，每面烙 ' + t + ' 分钟。烙 ' + n + ' 张饼最少需要多少分钟？',
      correct: ans,
      wrongs: wrongs,
      explain: n === 1
        ? '只有 1 张饼，两面都要烙，共 ' + 2 * t + ' 分钟。'
        : '每次让锅里都有 2 张饼，' + n + ' 张饼共需 ' + n + ' × ' + t + ' = ' + ans + ' 分钟。'
    });
  });

  /* ---------- 8.3 优化：田忌赛马 ---------- */
  R('g4a.u8.horse', function (level) {
    var list = [
      ['田忌的马比齐王的马都弱一些。齐王按上、中、下出场，田忌怎样安排才能获胜？',
        '下等马对上等马，上等马对中等马，中等马对下等马',
        ['上等马对上等马，中等马对中等马，下等马对下等马',
          '上等马对中等马，中等马对下等马，下等马对上等马',
          '中等马对上等马，下等马对中等马，上等马对下等马'],
        '用下等马输掉一局，再用上等马、中等马分别赢下两局，2 胜 1 负获胜。'],
      ['田忌用「下对上、上对中、中对下」对阵齐王，最终结果是什么？',
        '田忌 2 胜 1 负获胜',
        ['田忌 3 场全胜', '田忌 1 胜 2 负失败', '田忌 3 场全负'],
        '下等马输给上等马，上等马赢中等马，中等马赢下等马，所以田忌 2 胜 1 负。']
    ];
    return concept('g4a.u8.horse', level, list);
  });

  /* 数学广角·优化：把「马」的静态题补足到 1000 题自检所需的稳定性 */
})(typeof window !== 'undefined' ? window : globalThis);
