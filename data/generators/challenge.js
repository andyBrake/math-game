/* 4 级「挑战题」：只由挑战难度使用，1~3 级仍走原出题器。
   66 个知识点各有一道更难的变体：多步推理、逆运算、临界值、真实情境。
   上册变体由 parts-a.js 提供，下册变体由 parts-b.js 提供，组装后替换占位符。 */
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

  /* 四年级上册 4 级挑战变体（39 个知识点）。在 challenge.js 共享头之后执行，
   extend/q/three/who/readNum/digitVariants/trickyNumber 等通过闭包可用，勿重复声明。 */
(function () {
  'use strict';

  /* 局部：支持亿级的中文读数（共享头 readNum 只到万级，这里自一份） */
  var aDig = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var aPos = ['', '十', '百', '千'];
  function aGroup(n) {
    var str = String(n), s = '', zero = false;
    for (var i = 0; i < str.length; i++) {
      var d = +str[i], p = str.length - 1 - i;
      if (d === 0) { if (s) zero = true; }
      else { if (zero) { s += '零'; zero = false; } s += aDig[d] + aPos[p]; }
    }
    if (s.slice(0, 2) === '一十') s = s.slice(1);
    return s;
  }
  function rdBig(n) {
    n = Math.floor(n);
    if (n === 0) return '零';
    var ge = n % 10000, wan = Math.floor(n / 10000) % 10000, yi = Math.floor(n / 100000000);
    var s = '';
    if (yi > 0) s += aGroup(yi) + '亿';
    if (wan > 0) { if (yi > 0 && wan < 1000) s += '零'; s += aGroup(wan) + '万'; }
    else if (yi > 0 && ge > 0) s += '零';
    if (ge > 0) { if (wan > 0 && ge < 1000) s += '零'; s += aGroup(ge); }
    return s;
  }
  function w3(correct, pool) { return three(correct, pool); }
  function gno() { return U.randInt(2, 19); }

  /* ---------- U1（保持原实现） ---------- */
  extend('g4a.u1.table', function (level) {
    return q({
      topicId: 'g4a.u1.table', level: 4,
      prompt: who() + '想：10 个一百万是一千万，10 个一千万是一亿。那么一亿里面有（ ）个一百万。',
      correct: 100,
      wrongs: w3(100, [10, 1000, 10000, 100000, 100, 20, 50]),
      explain: '1 亿 = 10 个一千万，1 个一千万 = 10 个一百万，所以 1 亿 = 10 × 10 = 100 个一百万。'
    });
  });

  extend('g4a.u1.read', function (level) {
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    var n = U.pick([
      a * 100000000 + b * 10000 + c * 10,
      a * 100000000 + b * 1000 + c,
      a * 10000000 + b * 100000 + c * 100,
      a * 10000000 + b * 100 + c
    ]);
    var correct = rdBig(n);
    var cands = digitVariants(n).map(rdBig).filter(function (s) { return s && s !== correct; });
    return q({
      topicId: 'g4a.u1.read', level: 4,
      prompt: who() + '在人口普查表上看到 ' + n + '，这个数正确的读法是：',
      correct: correct,
      wrongs: w3(correct, cands),
      explain: n + ' 读作：' + correct + '。注意每级末尾的 0 不读，万级或个级开头连续的 0 只读一个零。'
    });
  });

  extend('g4a.u1.write', function (level) {
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    var n = U.pick([
      a * 100000000 + b * 1000 + c,
      a * 10000000 + b * 100000 + c * 100,
      a * 100000000 + b * 10000 + c * 10
    ]);
    var reading = rdBig(n);
    return q({
      topicId: 'g4a.u1.write', level: 4,
      prompt: '写数挑战：“' + reading + '”，中间有多个 0，' + who() + ' 正确写作是（ ）',
      correct: String(n),
      wrongs: w3(String(n), digitVariants(n)),
      explain: reading + ' 写作 ' + n + '。哪一位上一个单位也没有，就在那一位写 0，注意连续占位。'
    });
  });

  extend('g4a.u1.compare', function (level) {
    var set = [U.randInt(5000000, 8999999), U.randInt(900000, 999999), U.randInt(6000000, 7999999), U.randInt(400000, 599999)];
    var sorted = set.slice().sort(function (x, y) { return y - x; });
    var rank = U.pick([1, 2, 3]);
    return q({
      topicId: 'g4a.u1.compare', level: 4,
      prompt: who() + '把 ' + set.join('、') + ' 四个数从大到小排列，排在第 ' + rank + ' 的是（ ）',
      correct: String(sorted[rank - 1]),
      wrongs: w3(String(sorted[rank - 1]), sorted.filter(function (v) { return v !== sorted[rank - 1]; }).map(String).concat([String(sorted[rank - 1] + 1000), String(sorted[rank - 1] - 1000)])),
      explain: '先比位数：位数多的数大；位数相同从最高位逐位比。从大到小为 ' + sorted.join('＞') + '，第 ' + rank + ' 是 ' + sorted[rank - 1] + '。'
    });
  });

  extend('g4a.u1.convert', function (level) {
    var toYi = Math.random() < 0.5;
    var correct, pool, explain;
    if (toYi) {
      var e = U.randInt(3, 900);
      correct = e + '亿';
      pool = [(e + 1) + '亿', (e - 1) + '亿', (e * 10) + '亿', (e + 2) + '亿', (e - 2) + '亿', e + ''];
      explain = '去掉末尾 8 个 0 加“亿”：' + (e * 100000000) + ' = ' + e + '亿。';
    } else {
      var w = U.randInt(120, 9999);
      correct = w + '万';
      pool = [(w + 1) + '万', (w - 1) + '万', (w * 10) + '万', (w + 10) + '万', (w - 10) + '万', w + ''];
      explain = '去掉末尾 4 个 0 加“万”：' + (w * 10000) + ' = ' + w + '万。';
    }
    return q({
      topicId: 'g4a.u1.convert', level: 4,
      prompt: '改写挑战：' + (toYi ? (parseInt(correct, 10) * 100000000) : (parseInt(correct, 10) * 10000)) + ' 改写成用「' + (toYi ? '亿' : '万') + '」作单位是（ ）',
      correct: correct,
      wrongs: w3(correct, pool),
      explain: explain
    });
  });

  extend('g4a.u1.round', function (level) {
    var w = U.randInt(12, 980);
    var n = w * 10000 + 5000;
    var ans = (w + 1) + '万';
    return q({
      topicId: 'g4a.u1.round', level: 4,
      prompt: '四舍五入临界题：' + n + ' 省略万位后面的尾数（千位正好是 5），约是（ ）',
      correct: ans,
      wrongs: w3(ans, [w + '万', (w + 2) + '万', (w + 10) + '万', (w - 1) + '万', (w + 3) + '万', w + '']),
      explain: n + ' 的千位是 5，正好满 5，要向前一位进 1，所以 ' + w + ' 万进成 ' + (w + 1) + ' 万。'
    });
  });

  extend('g4a.u1.code', function (level) {
    var odd = Math.random() < 0.5;
    var c17 = odd ? U.pick(['1', '3', '5', '7', '9']) : U.pick(['0', '2', '4', '6', '8']);
    var correct = odd ? '男' : '女';
    return q({
      topicId: 'g4a.u1.code', level: 4,
      prompt: who() + '捡到一张身份证，第 17 位是 ' + c17 + '，第 7~14 位是出生日期。按编码规则，这位公民是（ ）',
      correct: correct,
      wrongs: w3(correct, ['男', '女', '无法判断', '儿童', '成年人', '少年']),
      explain: '身份证第 17 位：1、3、5、7、9 表示男，0、2、4、6、8 表示女。第 17 位是 ' + c17 + '，所以是' + correct + '。'
    });
  });

  /* ---------- U2（23 个待修复，加入多模板+随机） ---------- */
  extend('g4a.u2.line', function (level) {
    var mode = U.pick(['seg', 'ray', 'line', 'two']);
    var g = gno(), nm = who();
    if (mode === 'seg') {
      return q({
        topicId: 'g4a.u2.line', level: 4,
        prompt: U.pick([
          '第 ' + g + ' 组的' + nm + '画了一条可以量出长度的线，它有（ ）个端点',
          nm + '用直尺画一条能测量的线，这条线有（ ）个端点',
          '下面说法：线段有（ ）个端点，' + nm + ' 在第 ' + g + ' 组填一填'
        ]),
        correct: '2 个',
        wrongs: w3('2 个', ['2 个', '1 个', '0 个', '3 个', '无数个']),
        explain: '线段有 2 个端点，有一定长度，可以度量。'
      });
    }
    if (mode === 'ray') {
      return q({
        topicId: 'g4a.u2.line', level: 4,
        prompt: U.pick([
          nm + '把手机手电筒打开，射出去的光可以看作射线，它有（ ）个端点',
          '从一点出发向一个方向无限延伸的线叫射线，它有（ ）个端点',
          '第 ' + g + ' 组量一量：射线 AB 只有（ ）个端点'
        ]),
        correct: '1 个',
        wrongs: w3('1 个', ['2 个', '1 个', '0 个', '3 个', '无数个']),
        explain: '射线有 1 个端点，可以向一个方向无限延伸。'
      });
    }
    if (mode === 'line') {
      return q({
        topicId: 'g4a.u2.line', level: 4,
        prompt: U.pick([
          nm + '说直线可以向两端无限延伸，那么直线有（ ）个端点',
          '没有端点、可以向两个方向无限延伸的线是直线，它有（ ）个端点',
          '第 ' + g + ' 组判断：直线 AB 或直线 BA，它有（ ）个端点'
        ]),
        correct: '0 个',
        wrongs: w3('0 个', ['2 个', '1 个', '0 个', '3 个', '无数个']),
        explain: '直线没有端点，可以向两个方向无限延伸。'
      });
    }
    var n = U.randInt(3, 6);
    var ans = n * (n - 1) / 2;
    return q({
      topicId: 'g4a.u2.line', level: 4,
      prompt: U.pick([
        '一条直线上画了 ' + n + ' 个点，每两个点之间是一条线段，一共有（ ）条线段',
        nm + '在直线上点了 ' + n + ' 个点，数出一共有（ ）条线段',
        '第 ' + g + ' 组：直线上 ' + n + ' 个点连成的线段共（ ）条'
      ]),
      correct: ans,
      wrongs: w3(ans, [n, n + 1, ans + 1, ans - 1, n * 2, ans + 2]),
      explain: n + ' 个点中每两点连一条线段，共 ' + (n - 1) + '+' + (n - 2) + '+…+1 = ' + ans + ' 条。'
    });
  });

  extend('g4a.u2.vertical', function (level) {
    var mode = U.pick(['perp', 'short', 'four']);
    var g = gno(), nm = who();
    if (mode === 'perp') {
      return q({
        topicId: 'g4a.u2.vertical', level: 4,
        prompt: U.pick([
          nm + '画的两条直线相交成 90°，这两条直线的位置关系是（ ）',
          '当两条直线相交成直角时，这两条直线互相（ ）',
          '第 ' + g + ' 组：剪刀张开成直角，两条边所在的直线互相（ ）'
        ]),
        correct: '垂直',
        wrongs: w3('垂直', ['垂直', '平行', '重合', '交叉', '对称', '倾斜']),
        explain: '两条直线相交成直角时，这两条直线互相垂直。'
      });
    }
    if (mode === 'short') {
      return q({
        topicId: 'g4a.u2.vertical', level: 4,
        prompt: U.pick([
          '机灵狗去河边，从它所在位置到河边各条连线中，最短的是（ ）',
          nm + '从一点向直线连线，量一量，最短的那条是（ ）',
          '第 ' + g + ' 组：点到直线的所有线段中最短的是（ ）'
        ]),
        correct: '垂直线段',
        wrongs: w3('垂直线段', ['垂直线段', '斜线段', '射线', '曲线', '平行线', '距离']),
        explain: '从直线外一点到这条直线所画的线段中，垂直线段最短。'
      });
    }
    return q({
      topicId: 'g4a.u2.vertical', level: 4,
      prompt: U.pick([
        nm + '发现两条互相垂直的直线相交成直角，这样的直角一共有（ ）个',
        '两条直线互相垂直，相交所成的四个角都是直角，共（ ）个直角',
        '第 ' + g + ' 组：互相垂直的两条直线，一共形成（ ）个直角'
      ]),
      correct: 4,
      wrongs: w3(4, [1, 2, 3, 5, 6, 8]),
      explain: '两条直线相交成直角时，四个角都是直角，所以一共有 4 个直角。'
    });
  });

  extend('g4a.u2.parallel', function (level) {
    var mode = U.pick(['def', 'move', 'eq']);
    var g = gno(), nm = who();
    if (mode === 'def') {
      return q({
        topicId: 'g4a.u2.parallel', level: 4,
        prompt: U.pick([
          '在同一平面内永不相交的两条直线，它们叫做（ ）',
          nm + '在方格纸上画了两条延长后也不相交的直线，这两条是（ ）',
          '第 ' + g + ' 组：同一平面内（ ）的两条直线互相平行'
        ]),
        correct: '平行线',
        wrongs: w3('平行线', ['平行线', '垂线', '相交线', '射线', '斜线', '重合线']),
        explain: '在同一平面内不相交的两条直线互相平行，这两条直线叫做平行线。'
      });
    }
    if (mode === 'move') {
      return q({
        topicId: 'g4a.u2.parallel', level: 4,
        prompt: U.pick([
          nm + '用三角板沿着直尺移动画出两条平行线，这个移动过程叫（ ）',
          '在方格纸上把一个图形沿直线方向移动，形状方向不变，这种运动叫（ ）',
          '第 ' + g + ' 组：铅笔沿直尺边沿直线移动，画出的两条线互相平行，靠的是（ ）'
        ]),
        correct: '平移',
        wrongs: w3('平移', ['平移', '旋转', '对称', '翻转', '对折', '缩放']),
        explain: '把图形沿直线方向平移，平移前后对应线段互相平行。'
      });
    }
    return q({
      topicId: 'g4a.u2.parallel', level: 4,
      prompt: U.pick([
        '在两条平行线之间画 3 条垂直线段，量得它们的长度（ ）',
        nm + '量了两条平行线之间几处的距离，发现它们（ ）',
        '第 ' + g + ' 组：平行线之间的距离，量几处结果（ ）'
      ]),
      correct: '都相等',
      wrongs: w3('都相等', ['都相等', '都不相等', '越来越长', '越来越短', '无法确定']),
      explain: '两条平行线之间的垂直线段长度处处相等。'
    });
  });

  extend('g4a.u2.classify', function (level) {
    var mode = U.pick(['ratio', 'deg', 'ratio2']);
    var nm = who();
    if (mode === 'ratio') {
      return q({
        topicId: 'g4a.u2.classify', level: 4,
        prompt: U.pick([
          nm + '想：1 个周角 = 2 个平角 = （ ）个直角',
          '周角是 360°，直角是 90°，1 个周角等于（ ）个直角',
          '第 ' + gno() + ' 组：1 周角 = （ ）直角 = 2 平角'
        ]),
        correct: 4,
        wrongs: w3(4, [2, 3, 6, 8, 1, 4]),
        explain: '周角 360°，平角 180°，直角 90°。360 ÷ 90 = 4，所以 1 周角 = 4 直角 = 2 平角。'
      });
    }
    if (mode === 'ratio2') {
      return q({
        topicId: 'g4a.u2.classify', level: 4,
        prompt: U.pick([
          '1 个平角 = （ ）个直角',
          nm + '量得一个平角是 180°，它等于（ ）个直角',
          '第 ' + gno() + ' 组：1 平角 = （ ）直角'
        ]),
        correct: 2,
        wrongs: w3(2, [1, 3, 4, 6, 8, 2]),
        explain: '平角 180°，直角 90°，180 ÷ 90 = 2，所以 1 平角 = 2 直角。'
      });
    }
    /* 数字型：随机一个锐/钝角度数，问它是哪类 */
    var kind = U.pick(['锐角', '钝角']);
    var d = kind === '锐角' ? U.randInt(15, 85) : U.randInt(95, 175);
    return q({
      topicId: 'g4a.u2.classify', level: 4,
      prompt: U.pick([
        nm + '量出一个角是 ' + d + '°，按角的分类它是（ ）角',
        '一个 ' + d + '° 的角，它属于（ ）角',
        '第 ' + gno() + ' 组测得角为 ' + d + '°，这是（ ）角'
      ]),
      correct: kind,
      wrongs: w3(kind, ['锐角', '直角', '钝角', '平角', '周角']),
      explain: '小于 90° 是锐角，等于 90° 直角，大于 90° 小于 180° 钝角。' + d + '° 是' + kind + '。'
    });
  });

  extend('g4a.u2.draw', function (level) {
    var mode = U.pick(['combo', 'combo', 'step']);
    var nm = who();
    if (mode === 'step') {
      return q({
        topicId: 'g4a.u2.draw', level: 4,
        prompt: U.pick([
          nm + '用量角器画角，第一步是先画一条（ ），再让量角器中心点与它的端点重合',
          '画角时先画一条射线，再把量角器的（ ）与射线端点重合',
          '第 ' + gno() + ' 组：用量角器画角，零刻度线要与（ ）重合'
        ]),
        correct: '射线',
        wrongs: w3('射线', ['射线', '直线', '线段', '曲线', '端点', '圆心']),
        explain: '画角步骤：先画一条射线 → 量角器中心点与射线端点重合 → 零刻度线与射线重合 → 描点连线。'
      });
    }
    var combo = U.pick([
      { c: '105°', e: '60° + 45° = 105°' },
      { c: '135°', e: '90° + 45° = 135°' },
      { c: '150°', e: '90° + 60° = 150°' },
      { c: '75°', e: '45° + 30° = 75°' },
      { c: '120°', e: '90° + 30° = 120°' }
    ]);
    return q({
      topicId: 'g4a.u2.draw', level: 4,
      prompt: U.pick([
        nm + '用一副三角尺（30°、45°、60°、90°）拼角，下面哪个角一定拼得出来？',
        '第 ' + gno() + ' 组：用一副三角尺，哪个度数的角可以直接拼出来？',
        '借助一副三角尺，下面哪个角画得出来？'
      ]),
      correct: combo.c,
      wrongs: w3(combo.c, ['105°', '135°', '150°', '75°', '120°', '80°', '20°', '55°']),
      explain: combo.e + '。一副三角尺可通过相加相减拼出这些角。'
    });
  });

  extend('g4a.u2.protractor', function (level) {
    var deg = U.pick([175, 15, 165, 25, 155, 35, 45, 130]);
    return q({
      topicId: 'g4a.u2.protractor', level: 4,
      prompt: who() + '量角：一条边对准内圈 0°，另一条边在内圈刻度 ' + deg + ' 处，这个角是（ ）°',
      correct: deg,
      wrongs: w3(deg, [180 - deg, deg + 10, deg - 10, deg + 5, 90, 180 - deg + 5]),
      explain: '角的顶点对准中心点、一条边对准 0° 刻度线，另一条边指的刻度就是角度，这里是 ' + deg + '°。'
    });
  });

  /* ---------- U3 ---------- */
  extend('g4a.u3.zero', function (level) {
    var a = U.randInt(11, 99), b = U.randInt(11, 99);
    var c = a * b;
    var mode = U.pick(['both', 'a100', 'b10', 'one', 'a10']);
    if (mode === 'both') {
      return q({
        topicId: 'g4a.u3.zero', level: 4,
        prompt: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × 100) × (' + b + ' × 10) = （ ）',
        correct: c * 1000,
        wrongs: w3(c * 1000, [c * 100, c * 10, c * 10000, c, c * 500, c * 1000 + 10]),
        explain: '一个因数乘 100、另一个乘 10，积乘 1000：' + c + ' × 1000 = ' + (c * 1000) + '。'
      });
    }
    if (mode === 'a100') {
      return q({
        topicId: 'g4a.u3.zero', level: 4,
        prompt: '已知 ' + a + ' × ' + b + ' = ' + c + '，那么 (' + a + ' × 100) × ' + b + ' = （ ）',
        correct: c * 100,
        wrongs: w3(c * 100, [c * 10, c * 1000, c, c * 50, c * 200, c * 100 + 10]),
        explain: '一个因数乘 100、另一个不变，积乘 100：' + c + ' × 100 = ' + (c * 100) + '。'
      });
    }
    if (mode === 'b10') {
      return q({
        topicId: 'g4a.u3.zero', level: 4,
        prompt: '根据 ' + a + ' × ' + b + ' = ' + c + '，' + a + ' × (' + b + ' × 10) = （ ）',
        correct: c * 10,
        wrongs: w3(c * 10, [c, c * 100, c * 5, c * 20, c * 10 + 10, c - 10]),
        explain: '一个因数不变、另一个乘 10，积乘 10：' + c + ' × 10 = ' + (c * 10) + '。'
      });
    }
    if (mode === 'a10') {
      return q({
        topicId: 'g4a.u3.zero', level: 4,
        prompt: '口算挑战：(' + a + ' × 10) × ' + b + ' = （ ）',
        correct: c * 10,
        wrongs: w3(c * 10, [c, c * 100, c * 5, c * 20, c * 10 + 10, c + 10]),
        explain: '先算 ' + a + '×' + b + '=' + c + '，因数末尾多 1 个 0 补 1 个 0，得 ' + (c * 10) + '。'
      });
    }
    return q({
      topicId: 'g4a.u3.zero', level: 4,
      prompt: who() + '整十数口算：' + (a * 10) + ' × ' + (b * 10) + ' = （ ）',
      correct: c * 100,
      wrongs: w3(c * 100, [c * 10, c * 1000, c, c * 50, c * 200, c * 100 + 10]),
      explain: '先算 ' + a + '×' + b + '=' + c + '，两个因数末尾共 2 个 0，补 2 个 0 得 ' + (c * 100) + '。'
    });
  });

  extend('g4a.u3.mul2', function (level) {
    var a = U.pick([37, 48, 56, 69, 28]);
    var b = U.pick([24, 35, 47, 58, 19]);
    return q({
      topicId: 'g4a.u3.mul2', level: 4,
      prompt: who() + '竖式挑战：' + a + ' × ' + b + ' = （ ）',
      correct: a * b,
      wrongs: w3(a * b, [a * b + a, a * b - a, a * b + b, a * b + 100, a * b - 100, a * b + 10]),
      explain: '两位数乘两位数：' + a + ' × ' + b + ' = ' + (a * b) + '，注意连续进位。'
    });
  });

  extend('g4a.u3.mul3', function (level) {
    var a = U.pick([408, 312, 506, 240, 114]);
    var b = U.pick([23, 47, 35, 62, 21]);
    return q({
      topicId: 'g4a.u3.mul3', level: 4,
      prompt: '三位数乘两位数挑战：' + a + ' × ' + b + ' = （ ）',
      correct: a * b,
      wrongs: w3(a * b, [a * b + a, a * b - a, Number(String(a * b) + '0'), a * b + 100, a * b - 100, a * b + 10]),
      explain: '用第二个因数每一位分别乘 ' + a + '，注意中间有 0 的乘法，结果是 ' + (a * b) + '。'
    });
  });

  extend('g4a.u3.est', function (level) {
    var a = U.pick([498, 302, 591, 207, 412]);
    var b = U.pick([31, 58, 49, 22, 39]);
    var ea = Math.round(a / 10) * 10, eb = Math.round(b / 10) * 10;
    return q({
      topicId: 'g4a.u3.est', level: 4,
      prompt: who() + '估算：' + a + ' × ' + b + ' ≈ （ ）',
      correct: ea * eb,
      wrongs: w3(ea * eb, [ea * eb + 100, ea * eb - 100, a * b, ea * eb + 1000, ea * eb + 50]),
      explain: '把 ' + a + ' 看作 ' + ea + '，' + b + ' 看作 ' + eb + '，' + ea + ' × ' + eb + ' = ' + (ea * eb) + '。'
    });
  });

  extend('g4a.u3.rule', function (level) {
    var mode = U.pick(['ones', 'nines', 'end5', 'ones', 'end5']);
    if (mode === 'ones') {
      var k = U.pick([3, 4, 5]);
      var s = '', r = '';
      for (var i = 0; i < k; i++) s += '1';
      for (var j = 1; j <= k; j++) r += j;
      for (var j2 = k - 1; j2 >= 1; j2--) r += j2;
      return q({
        topicId: 'g4a.u3.rule', level: 4,
        prompt: who() + '找规律：11×11=121，111×111=12321，那么 ' + s + '×' + s + ' = （ ）',
        correct: Number(r),
        wrongs: w3(Number(r), [Number(r) + 1, Number(r) - 1, Number(r) * 10, Number(r) / 10, Number(r) + 100]),
        explain: k + ' 个 1 自乘，积从 1 排到 ' + k + ' 再排回 1，即 ' + r + '。'
      });
    }
    if (mode === 'nines') {
      var m = U.pick([3, 4, 5]);
      var n9 = '', h = '', z = '';
      for (var i = 0; i < m; i++) n9 += '9';
      for (var i2 = 0; i2 < m - 1; i2++) { h += '9'; z += '0'; }
      var r2 = Number(h + '8' + z + '1');
      return q({
        topicId: 'g4a.u3.rule', level: 4,
        prompt: '找规律：99×99=9801，999×999=998001，那么 ' + n9 + '×' + n9 + ' = （ ）',
        correct: r2,
        wrongs: w3(r2, [r2 + 1, r2 - 1, r2 * 10, r2 + 100, r2 - 100]),
        explain: m + ' 个 9 自乘：前面 ' + (m - 1) + ' 个 9、一个 8、' + (m - 1) + ' 个 0、一个 1，即 ' + r2 + '。'
      });
    }
    var n5 = U.pick([15, 25, 35, 45, 55, 65, 75, 85]);
    var t = Math.floor(n5 / 10);
    return q({
      topicId: 'g4a.u3.rule', level: 4,
      prompt: who() + '找规律：15×15=225，25×25=625，35×35=1225，那么 ' + n5 + '×' + n5 + ' = （ ）',
      correct: t * (t + 1) * 100 + 25,
      wrongs: w3(t * (t + 1) * 100 + 25, [t * (t + 1) * 100 + 25 + 100, t * (t + 1) * 100 + 25 - 100, t * t * 100 + 25, (t + 1) * (t + 2) * 100 + 25, t * (t + 1) * 100 + 25 + 1]),
      explain: '个位是 5 的两位数平方 = t×(t+1)×100+25。这里 t=' + t + '，得 ' + (t * (t + 1) * 100 + 25) + '。'
    });
  });

  /* ---------- U4 ---------- */
  extend('g4a.u4.range', function (level) {
    var mode = U.pick(['sight', 'block', 'shadow', 'high']);
    var nm = who();
    if (mode === 'sight') {
      return q({
        topicId: 'g4a.u4.range', level: 4,
        prompt: U.pick([
          nm + '观察物体时，视线可以看作（ ）',
          '光线和视线都是（ ）传播的，不会拐弯',
          '第 ' + gno() + ' 组：我们看东西时，视线是（ ）'
        ]),
        correct: '直直的直线',
        wrongs: w3('直直的直线', ['直直的直线', '会拐弯的曲线', '折线', '射线', '弧线']),
        explain: '视线不会拐弯，都是直直的直线；遇到障碍物就被挡住。'
      });
    }
    if (mode === 'block') {
      return q({
        topicId: 'g4a.u4.range', level: 4,
        prompt: U.pick([
          nm + '坐车从远处靠近大楼，被前面的矮楼挡住的部分越来越多，最后（ ）',
          '障碍物挡住视线时，障碍物后面的物体就（ ）',
          '第 ' + gno() + ' 组：视线被建筑物挡住，后面的物体就（ ）'
        ]),
        correct: '被挡住看不见',
        wrongs: w3('被挡住看不见', ['被挡住看不见', '看得更清楚', '变大', '变小', '不变']),
        explain: '视线是直线，中间有障碍物时，后面的物体就被挡住、看不见了。'
      });
    }
    if (mode === 'shadow') {
      return q({
        topicId: 'g4a.u4.range', level: 4,
        prompt: U.pick([
          '夜晚路灯下，同样高的杆子离路灯越远，影子越（ ）',
          nm + '晚上在路灯下走，人离灯越远，地上的影子越（ ）',
          '第 ' + gno() + ' 组：同样高的杆子离路灯越近，影子越（ ）'
        ]),
        correct: '长',
        wrongs: w3('长', ['长', '短', '不变', '先长后短', '高']),
        explain: '同样高的杆子，离路灯越近影子越短，离路灯越远影子越长。'
      });
    }
    return q({
      topicId: 'g4a.u4.range', level: 4,
      prompt: U.pick([
        nm + '想看到墙内所有的桃子，它应该爬得更（ ）',
        '观察点越高，看到的范围越（ ）',
        '第 ' + gno() + ' 组：站得越高，能看到的范围越（ ）'
      ]),
      correct: '大',
      wrongs: w3('大', ['大', '小', '不变', '先大后小', '远']),
      explain: '观察点越高，视线越过障碍物后能看到的范围越大。'
    });
  });

  extend('g4a.u4.view', function (level) {
    var mode = U.pick(['front', 'near', 'order']);
    var nm = who();
    if (mode === 'front') {
      return q({
        topicId: 'g4a.u4.view', level: 4,
        prompt: U.pick([
          nm + '正对着建筑物拍照片，拍到的是建筑物的（ ）',
          '站在建筑物正前方拍到的照片，是从（ ）拍的',
          '第 ' + gno() + ' 组：拍得最“正”、建筑物居中的照片是从（ ）拍的'
        ]),
        correct: '正面',
        wrongs: w3('正面', ['正面', '侧面', '上面', '后面', '背面']),
        explain: '正对着建筑物拍摄，拍到的是正面；从两侧拍会看到侧面。'
      });
    }
    if (mode === 'near') {
      return q({
        topicId: 'g4a.u4.view', level: 4,
        prompt: U.pick([
          nm + '从远处走近一幢大楼，看到的大楼会（ ）',
          '距离物体越近，看到的物体越（ ）',
          '第 ' + gno() + ' 组：从远到近走向物体，看到的影像（ ）'
        ]),
        correct: '变大',
        wrongs: w3('变大', ['变大', '变小', '不变', '先大后小', '变模糊']),
        explain: '距离物体越近，看到的物体越大；距离越远越小。'
      });
    }
    return q({
      topicId: 'g4a.u4.view', level: 4,
      prompt: U.pick([
        '乘船从远处向建筑物驶去，船上的人看到建筑物（ ）',
        nm + '乘船游览，从 A 点出发靠近小岛，照片里建筑物（ ）',
        '第 ' + gno() + ' 组：从远处靠近建筑物，看到它（ ）'
      ]),
      correct: '由小变大、越来越清楚',
      wrongs: w3('由小变大、越来越清楚', ['由大变小', '大小不变', '先变大后变小', '由近及远']),
      explain: '从远处靠近建筑物，建筑物由小变大、由模糊变清楚。'
    });
  });

  /* ---------- U5 ---------- */
  extend('g4a.u5.order', function (level) {
    /* 随机生成“先乘除后加减/小括号”表达式并计算 */
    var form = U.pick([
      function () { var p = U.randInt(20, 90), q = U.randInt(10, 40) * 2; return { p: p + ' × 3 + ' + q + ' ÷ 2', ans: p * 3 + q / 2, e: '先乘除后加减：' + p + '×3=' + (p * 3) + '，' + q + '÷2=' + (q / 2) + '，再相加。' }; },
      function () { var a = U.randInt(30, 80), b = U.randInt(20, 60), c = U.randInt(2, 9); return { p: a + ' + ' + b + ' × 4 ÷ ' + c, ans: a + b * 4 / c, e: '先乘除：' + b + '×4÷' + c + '=' + (b * 4 / c) + '，再 ' + a + '+' + (b * 4 / c) + '。' }; },
      function () { var m = U.randInt(10, 30), n = U.randInt(5, m - 1), d = U.pick([2, 4, 8]); return { p: '12 × (' + m + ' − ' + n + ') ÷ ' + d, ans: 12 * (m - n) / d, e: '先小括号 ' + m + '−' + n + '=' + (m - n) + '，再 12×' + (m - n) + '÷' + d + '。' }; },
      function () { var a = U.randInt(40, 90), b = U.randInt(2, 9); return { p: a + ' − ' + a + ' ÷ ' + b, ans: a - a / b, e: '先除法后减法：' + a + '÷' + b + '=' + (a / b) + '，再 ' + a + '−' + (a / b) + '。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.order', level: 4,
      prompt: who() + '说运算顺序再算：' + f.p + ' = （ ）',
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 10, f.ans - 10, f.ans + 1, f.ans - 1, f.ans + 100, f.ans * 2]),
      explain: '没有括号先乘除后加减，同级从左到右，有小括号先算小括号。' + f.e
    });
  });

  extend('g4a.u5.bracket', function (level) {
    var form = U.pick([
      function () { var d = U.randInt(2, 5), y = U.randInt(2, 5), inner = y * d, x = inner * U.randInt(2, 9); var big = d + U.randInt(2, 6), small = big - d; return { p: x + ' ÷ [' + y + ' × (' + big + ' − ' + small + ')]', ans: x / inner, e: '先小括号 ' + big + '−' + small + '=' + d + '，再中括号 ' + y + '×' + d + '=' + inner + '，最后 ' + x + '÷' + inner + '。' }; },
      function () { var r = U.pick([2, 3, 4]); return { p: '24 ÷ [(' + (r + 3) + ' − 3) × 2]', ans: 24 / (r * 2), e: '先小括号 ' + (r + 3) + '−3=' + r + '，再中括号 ×2=' + (r * 2) + '，最后 24÷' + (r * 2) + '。' }; },
      function () { var b = U.pick([4, 6]); var diff = 8 - b; var s = U.pick([12, 24, 48]); return { p: s + ' × [16 ÷ (8 − ' + b + ')]', ans: s * (16 / diff), e: '先小括号 8−' + b + '=' + diff + '，再中括号 16÷' + diff + '=' + (16 / diff) + '，最后 ' + s + '×' + (16 / diff) + '。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.bracket', level: 4,
      prompt: who() + '计算：' + f.p + ' = （ ）',
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans * 2, f.ans + 100]),
      explain: '既有小括号又有中括号，先算小括号里的，再算中括号里的。' + f.e
    });
  });

  extend('g4a.u5.add', function (level) {
    var form = U.pick([
      function () { return { p: '91 + 34 + 109 + 366 = （ ）', ans: 600, e: '91+109=200，34+366=400，合起来 600。' }; },
      function () { var a = U.pick([88, 77, 66]), b = U.randInt(130, 170); return { p: a + ' + ' + b + ' + (200 − ' + b + ') = （ ）', ans: a + 200, e: b + ' 和 (200−' + b + ') 凑成 200，再 ' + a + '+200。' }; },
      function () { return { p: '57 + 288 + 43 = （ ）', ans: 388, e: '57+43=100，100+288=388。' }; },
      function () { return { p: '88 + 156 + 44 = （ ）', ans: 288, e: '156+44=200，88+200=288。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.add', level: 4,
      prompt: who() + '用简便方法算：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 1, f.ans * 2]),
      explain: '利用加法交换律和结合律凑整。' + f.e
    });
  });

  extend('g4a.u5.sub', function (level) {
    var form = U.pick([
      function () { var a = U.randInt(300, 900), b = U.randInt(80, 150), c = 160 - b; return { p: a + ' − ' + b + ' − ' + c + ' = （ ）', ans: a - 160, e: b + '+' + c + '=160，' + a + '−160=' + (a - 160) + '。' }; },
      function () { return { p: '100 − 24 − 36 = （ ）', ans: 40, e: '100−(24+36)=100−60=40。' }; },
      function () { return { p: '520 − 137 − 63 = （ ）', ans: 320, e: '520−(137+63)=520−200=320。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.sub', level: 4,
      prompt: who() + '简便计算：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 1, f.ans * 2]),
      explain: '一个数连续减去两个数，等于减去这两个数的和：a−b−c=a−(b+c)。' + f.e
    });
  });

  extend('g4a.u5.mul', function (level) {
    var form = U.pick([
      function () { return { p: '125 × 3 × 8 = （ ）', ans: 3000, e: '125×8=1000，1000×3=3000。' }; },
      function () { return { p: '9 × 125 × 8 = （ ）', ans: 9000, e: '125×8=1000，9×1000=9000。' }; },
      function () { return { p: '38 × 25 × 4 = （ ）', ans: 3800, e: '25×4=100，38×100=3800。' }; },
      function () { return { p: '24 × 25 = （ ）', ans: 600, e: '24=6×4，4×25=100，6×100=600。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.mul', level: 4,
      prompt: who() + '用乘法运算律简便算：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 100, f.ans - 100, f.ans + 1, f.ans - 1, f.ans * 2, f.ans + 1000]),
      explain: '利用乘法交换律和结合律凑整（25×4=100、125×8=1000）。' + f.e
    });
  });

  extend('g4a.u5.dist', function (level) {
    var form = U.pick([
      function () { return { p: '(80 + 4) × 25 = （ ）', ans: 2100, e: '80×25 + 4×25 = 2000+100 = 2100。' }; },
      function () { return { p: '34 × 72 + 34 × 28 = （ ）', ans: 3400, e: '= 34×(72+28) = 34×100 = 3400。' }; },
      function () { return { p: '(20 + 4) × 25 = （ ）', ans: 600, e: '20×25 + 4×25 = 500+100 = 600。' }; },
      function () { return { p: '47 × 102 = （ ）', ans: 4794, e: '= 47×(100+2) = 4700+94 = 4794。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.dist', level: 4,
      prompt: who() + '用乘法分配律计算：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 100, f.ans - 100, f.ans + 1, f.ans - 1, f.ans * 2, f.ans + 1000]),
      explain: '乘法分配律 (a+b)×c=a×c+b×c。' + f.e
    });
  });

  extend('g4a.u5.simplify', function (level) {
    var form = U.pick([
      function () { return { p: '25 × 32 × 125 = （ ）', ans: 100000, e: '32=4×8，25×4=100，125×8=1000，100×1000=100000。' }; },
      function () { return { p: '88 + 156 + 44 = （ ）', ans: 288, e: '156+44=200，88+200=288。' }; },
      function () { return { p: '38 × 25 × 4 = （ ）', ans: 3800, e: '25×4=100，38×100=3800。' }; },
      function () { return { p: '(13 × 5) × 6 = （ ）', ans: 390, e: '5×6=30，13×30=390。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u5.simplify', level: 4,
      prompt: who() + '怎样简便就怎样算：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 100, f.ans - 100, f.ans + 1, f.ans - 1, f.ans * 2, f.ans + 1000]),
      explain: '综合运用加法、乘法运算律凑整。' + f.e
    });
  });

  extend('g4a.u5.count', function (level) {
    var n = U.randInt(6, 9);
    var ans = n * (n - 1) / 2;
    return q({
      topicId: 'g4a.u5.count', level: 4,
      prompt: who() + '挑战：一条线段上有 ' + n + ' 个点，这些点一共可以数出（ ）条不同的线段',
      correct: ans,
      wrongs: w3(ans, [n, ans + n, ans - n, ans + 1, ans - 1, n * 2]),
      explain: n + ' 个点的线段数 = n(n−1)/2 = ' + n + '×' + (n - 1) + '÷2 = ' + ans + '。'
    });
  });

  /* ---------- U6 ---------- */
  extend('g4a.u6.slice', function (level) {
    var mode = U.pick(['cylH', 'cylV', 'cone', 'cube']);
    var nm = who();
    if (mode === 'cylH') {
      return q({
        topicId: 'g4a.u6.slice', level: 4,
        prompt: U.pick([
          nm + '把一个圆柱横着切开（平行于底面），切开后看到的面是（ ）',
          '在圆柱形杯子里装水，水面的形状是（ ）',
          '第 ' + gno() + ' 组：圆柱平行于底面切开，切面是（ ）'
        ]),
        correct: '圆形',
        wrongs: w3('圆形', ['圆形', '长方形', '三角形', '正方形', '椭圆']),
        explain: '圆柱横着（平行于底面）切开，切面是大小一样的圆形。'
      });
    }
    if (mode === 'cylV') {
      return q({
        topicId: 'g4a.u6.slice', level: 4,
        prompt: U.pick([
          nm + '把一个圆柱竖着切开（垂直于底面），切面是（ ）',
          '沿着圆柱的一条高切开，切开后的面是（ ）',
          '第 ' + gno() + ' 组：圆柱竖切一刀，切面是（ ）'
        ]),
        correct: '长方形',
        wrongs: w3('长方形', ['圆形', '长方形', '三角形', '正方形', '椭圆']),
        explain: '圆柱竖着（垂直于底面）切开，切面是长方形。'
      });
    }
    if (mode === 'cone') {
      return q({
        topicId: 'g4a.u6.slice', level: 4,
        prompt: U.pick([
          nm + '把一个圆锥平行于底面横切，切面是（ ）',
          '圆锥靠近底面处横着切一刀，切面形状是（ ）',
          '第 ' + gno() + ' 组：圆锥平行于底面切开，切面是（ ）'
        ]),
        correct: '圆形',
        wrongs: w3('圆形', ['圆形', '长方形', '三角形', '正方形', '椭圆']),
        explain: '圆锥平行于底面切开，切面是圆形，越靠近顶点圆越小。'
      });
    }
    return q({
      topicId: 'g4a.u6.slice', level: 4,
      prompt: U.pick([
        '把一个长方体切一刀，切开后的面可能是长方形或（ ）',
        nm + '切长方体，切面通常是长方形或（ ）',
        '第 ' + gno() + ' 组：长方体切开后，看到的面不可能是（ ）'
      ]),
      correct: '正方形',
      wrongs: w3('正方形', ['圆形', '长方形', '三角形', '正方形', '椭圆']),
      explain: '长方体切开后的面可能是长方形或正方形。'
      });
  });

  extend('g4a.u6.blocks', function (level) {
    var base = U.randInt(4, 6), up = U.randInt(1, 3);
    var total = base + up;
    return q({
      topicId: 'g4a.u6.blocks', level: 4,
      prompt: who() + '照两层图纸搭大楼：第一层有 ' + base + ' 个“1”，第二层又放了 ' + up + ' 个正方体，这座大楼一共用了（ ）个小正方体',
      correct: total,
      wrongs: w3(total, [total + 1, total - 1, total + 2, base, up, total + 3]),
      explain: '第一层 ' + base + ' 个，第二层 ' + up + ' 个，一共 ' + base + ' + ' + up + ' = ' + total + ' 个。'
    });
  });

  extend('g4a.u6.roll', function (level) {
    var k = U.pick([1, 2, 3]);
    var ans = 2 + 4 * (k - 1);
    return q({
      topicId: 'g4a.u6.roll', level: 4,
      prompt: U.pick([
        who() + '发现正方体每翻 4 次蓝色面朝上一圈。蓝色面第 1 次落在 2、第 2 次落在 6，那么第 ' + k + ' 次蓝色面朝上落在数字（ ）',
        '正方体在带子上翻滚，蓝色面朝上落在 2、6、10……第 ' + k + ' 次蓝色面经过的数字是（ ）',
        '第 ' + gno() + ' 组：蓝色面朝上的位置依次加 4，第 ' + k + ' 次落在数字（ ）'
      ]),
      correct: ans,
      wrongs: w3(ans, [ans + 1, ans - 1, ans + 2, ans - 2, ans + 4, ans - 4, 1, 3]),
      explain: '每翻 4 次蓝色面才重新朝上（一圈），落在 2、6、10、14……每次加 4。第 ' + k + ' 次落在 ' + ans + '。'
    });
  });

  /* ---------- U7 ---------- */
  extend('g4a.u7.total', function (level) {
    var total = U.randInt(400, 900);
    var p1 = U.randInt(100, 200), p2 = U.randInt(100, 200);
    var ans = total - p1 - p2;
    return q({
      topicId: 'g4a.u7.total', level: 4,
      prompt: who() + '美术馆一周共接待 ' + total + ' 人，其中周六 ' + p1 + ' 人、周日 ' + p2 + ' 人，其余是平日参观。平日参观（ ）人',
      correct: ans,
      wrongs: w3(ans, [ans + 10, ans - 10, total - p1, total - p2, ans + 100, ans - 100]),
      explain: '分量 = 总量 − 其他分量：' + total + ' − ' + p1 + ' − ' + p2 + ' = ' + ans + '。'
    });
  });

  extend('g4a.u7.price', function (level) {
    var form = U.pick([
      function () { var price = U.pick([2, 3, 4, 5, 8]), num = U.randInt(3, 12); return { p: '矿泉水每瓶 ' + price + ' 元，买 ' + num + ' 瓶一共多少元？', ans: price * num, e: '总价 = 单价×数量 = ' + price + '×' + num + '。' }; },
      function () { var tot = U.pick([12, 20, 24, 36, 48]), n = U.pick([3, 4, 6, 8]); return { p: '买 ' + n + ' 本同样的书共花 ' + tot + ' 元，每本多少元？', ans: tot / n, e: '单价 = 总价÷数量 = ' + tot + '÷' + n + '。' }; },
      function () { var tot2 = U.pick([12, 20, 24, 30, 36]), p = U.pick([2, 3, 4, 5, 6]); return { p: '每袋牛奶 ' + p + ' 元，' + tot2 + ' 元可以买几袋？', ans: tot2 / p, e: '数量 = 总价÷单价 = ' + tot2 + '÷' + p + '。' }; },
      function () { return { p: '买 6 本同样的《数学故事》共花 108 元，买 15 本需要多少元？', ans: 270, e: '单价 108÷6=18 元，15 本 18×15=270 元。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u7.price', level: 4,
      prompt: who() + '购物：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans * 2, f.ans + 5]),
      explain: f.e
    });
  });

  extend('g4a.u7.speed', function (level) {
    var form = U.pick([
      function () { var sp = U.pick([60, 70, 80]), ti = U.pick([4, 5, 10, 6]); return { p: '每分钟走 ' + sp + ' 米，走 ' + ti + ' 分钟，走了多少米？', ans: sp * ti, e: '路程 = 速度×时间 = ' + sp + '×' + ti + '。' }; },
      function () { var sp2 = U.pick([60, 70, 80]); return { p: '从学校到少年宫 ' + (sp2 * 5) + ' 米，每分钟走 ' + sp2 + ' 米，需要几分钟？', ans: 5, e: '时间 = 路程÷速度 = ' + (sp2 * 5) + '÷' + sp2 + '。' }; },
      function () { var di = U.pick([120, 240, 360, 480]), ti = U.pick([2, 3, 4, 6]); return { p: '一辆车 ' + ti + ' 小时行了 ' + di + ' 千米，平均每小时行多少千米？', ans: di / ti, e: '速度 = 路程÷时间 = ' + di + '÷' + ti + '。' }; },
      function () { return { p: '甲地到乙地 420 千米，汽车每小时行 70 千米，需要几小时？', ans: 6, e: '时间 = 420÷70 = 6 小时。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u7.speed', level: 4,
      prompt: who() + '出行问题：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans * 2, f.ans + 5]),
      explain: f.e
    });
  });

  extend('g4a.u7.meet', function (level) {
    var form = U.pick([
      function () { return { p: '瓜蔓每日向下 5 寸，葫芦蔓每日向上 10 寸，墙高 90 寸，两蔓几日相遇？', ans: 6, e: '每天共爬 5+10=15 寸，90÷15=6 日。' }; },
      function () { return { p: '笑笑每分走 40 米，淘气每分走 60 米，两人同时从相距 800 米的两地相向而行，几分相遇？', ans: 8, e: '速度和 40+60=100，800÷100=8 分。' }; },
      function () { var v1 = U.pick([50, 60, 70]), v2 = U.pick([80, 90, 100]); var sum = v1 + v2; var t = U.pick([4, 5, 6]); return { p: '两地相距 ' + (sum * t) + ' 米，甲每分走 ' + v1 + ' 米、乙每分走 ' + v2 + ' 米，两人同时相向出发，几分相遇？', ans: t, e: '速度和 ' + v1 + '+' + v2 + '=' + sum + '，' + (sum * t) + '÷' + sum + '=' + t + ' 分。' }; }
    ]);
    var f = form();
    return q({
      topicId: 'g4a.u7.meet', level: 4,
      prompt: who() + '相遇问题：' + f.p,
      correct: f.ans,
      wrongs: w3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 2, f.ans * 2, f.ans + 5, f.ans - 2]),
      explain: '相向而行同时出发，相遇时间 = 路程 ÷ 速度和。' + f.e
    });
  });

  /* ---------- U8 ---------- */
  extend('g4a.u8.read', function (level) {
    var cats = ['春季', '夏季', '秋季', '冬季'];
    var vals = U.shuffle([37, 36, 41, 53]);
    var idx = U.randInt(0, 3);
    return q({
      topicId: 'g4a.u8.read', level: 4,
      prompt: who() + '看四年级同学生日季节统计图，' + cats[idx] + ' 过生日的有多少人？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: vals[idx],
      wrongs: w3(vals[idx], vals.filter(function (_, i) { return i !== idx; }).concat([vals[idx] + 1, vals[idx] - 1])),
      explain: '看' + cats[idx] + '对应的直条，顶端对准刻度 ' + vals[idx] + '。'
    });
  });

  extend('g4a.u8.compare', function (level) {
    var mode = U.pick(['diff', 'max', 'min', 'total']);
    var cats = U.pick([
      ['春季', '夏季', '秋季', '冬季'],
      ['中国', '贝宁', '埃及', '土耳其', '尼日利亚'],
      ['一班', '二班', '三班', '四班']
    ]);
    var vals = [];
    while (vals.length < cats.length) {
      var v = U.randInt(10, 55);
      if (vals.indexOf(v) === -1) vals.push(v);
    }
    var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    var mi = vals.indexOf(max), ni = vals.indexOf(min);
    if (mode === 'diff') {
      return q({
        topicId: 'g4a.u8.compare', level: 4,
        prompt: who() + '看条形统计图（' + cats.join('、') + '），最多的一项比最少的一项多多少？',
        canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
        correct: max - min,
        wrongs: w3(max - min, [max, min, max + min, max - min + 5, max - min - 5, max - min + 10]),
        explain: '最多 ' + max + '，最少 ' + min + '，相差 ' + max + '−' + min + '=' + (max - min) + '。'
      });
    }
    if (mode === 'max') {
      return q({
        topicId: 'g4a.u8.compare', level: 4,
        prompt: who() + '看统计图，' + cats.join('、') + ' 里数量最多的是哪一个？',
        canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
        correct: cats[mi],
        wrongs: w3(cats[mi], cats.filter(function (_, i) { return i !== mi; }).concat(['一样多', '无法确定'])),
        explain: '直条最高的 ' + cats[mi] + ' 数量最多，是 ' + max + '。'
      });
    }
    if (mode === 'min') {
      return q({
        topicId: 'g4a.u8.compare', level: 4,
        prompt: who() + '看统计图，' + cats.join('、') + ' 里数量最少的是哪一个？',
        canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
        correct: cats[ni],
        wrongs: w3(cats[ni], cats.filter(function (_, i) { return i !== ni; }).concat(['一样多', '无法确定'])),
        explain: '直条最矮的 ' + cats[ni] + ' 数量最少，是 ' + min + '。'
      });
    }
    return q({
      topicId: 'g4a.u8.compare', level: 4,
      prompt: who() + '把统计图中各项相加，' + cats.join('、') + ' 一共是多少？',
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '人' },
      correct: sum,
      wrongs: w3(sum, [sum + 5, sum - 5, sum + 10, max, sum + 1]),
      explain: '把各项相加：' + vals.join(' + ') + ' = ' + sum + '。'
    });
  });

  extend('g4a.u8.scale', function (level) {
    var per = U.pick([5, 10, 2, 4]);
    var cells = U.randInt(6, 11);
    return q({
      topicId: 'g4a.u8.scale', level: 4,
      prompt: who() + '看条形图，纵轴每格表示 ' + per + ' 人，某根直条高 ' + cells + ' 格，它对应的数量是多少？',
      correct: per * cells,
      wrongs: w3(per * cells, [cells, per, per * (cells + 1), per * (cells - 1), per * cells + per, per * cells - per]),
      explain: '每格 ' + per + ' 人，' + cells + ' 格就是 ' + per + ' × ' + cells + ' = ' + (per * cells) + ' 人。'
    });
  });

  extend('g4a.u8.group', function (level) {
    var ages = [53, 40, 68, 59, 53, 52, 59, 62, 51, 49, 58, 60, 60, 59, 62, 46, 59, 89, 60, 56];
    /* 随机打乱一份，随机选段 */
    var shuffled = U.shuffle(ages);
    var seg = U.pick([[50, 59], [60, 69], [40, 49]]);
    var lo = seg[0], hi = seg[1];
    var count = shuffled.filter(function (a) { return a >= lo && a <= hi; }).length;
    return q({
      topicId: 'g4a.u8.group', level: 4,
      prompt: who() + '整理获奖年龄（岁）：' + shuffled.join('、') + '。落在 ' + lo + '~' + hi + ' 岁这一段的有（ ）人',
      correct: count,
      wrongs: w3(count, [count + 1, count - 1, count + 2, count - 2, shuffled.length - count, count + 3]),
      explain: '逐个统计满足 ' + lo + '≤年龄≤' + hi + ' 的个数，共 ' + count + ' 人。'
    });
  });

})();


  /* 四年级下册 4 级挑战变体（27 个知识点） */
(function () {
  'use strict';

  /* ---------- U1 小数的意义和加减法 ---------- */

  extend('g4b.u1.meaning', function (level) {
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    var num = a + '.' + b + c;
    var items = [
      { p: num + ' 中，数字 ' + b + ' 在（ ）位上，表示 ' + b + ' 个（ ）', ans: '十分；0.1', e: num + ' 的十分位是 ' + b + '，表示 ' + b + ' 个 0.1。' },
      { p: num + ' 中，数字 ' + c + ' 表示 ' + c + ' 个（ ）', ans: '0.01', e: num + ' 的百分位是 ' + c + '，表示 ' + c + ' 个 0.01。' },
      { p: '0.6 里面有 60 个（ ）', ans: '0.01', e: '0.6 = 0.60，里面有 60 个 0.01。' },
      { p: '由 5 个 1、3 个 0.1 和 7 个 0.001 组成的数是（ ）', ans: '5.307', e: '5 个 1 = 5，3 个 0.1 = 0.3，7 个 0.001 = 0.007，合起来 5.307。' }
    ];
    var it = U.pick(items);
    return q({ topicId: 'g4b.u1.meaning', level: 4, prompt: who() + '问：' + it.p, correct: it.ans, wrongs: three(it.ans, ['0.1', '0.01', '0.001', '一', '十', '百', '千', '5.37', '5.037', '5.3007', '6 个 0.1', '60 个 0.1']), explain: it.e });
  });

  extend('g4b.u1.unit', function (level) {
    var forms = [
      function () {
        var kg = U.randInt(2, 9), g = U.randInt(1, 9) * 100 + U.randInt(1, 99);
        var totalMilli = kg * 1000 + g;
        return { p: kg + ' 千克 ' + g + ' 克 = （ ）千克', ans: fmt3(totalMilli), e: g + ' 克 = ' + fmt3(g) + ' 千克，加上 ' + kg + ' 千克 = ' + fmt3(totalMilli) + ' 千克。' };
      },
      function () {
        var yuan = U.randInt(1, 9), jiao = U.randInt(1, 9), fen = U.randInt(1, 9);
        var total = yuan * 100 + jiao * 10 + fen;
        return { p: '一根跳绳 ' + yuan + ' 元 ' + jiao + ' 角 ' + fen + ' 分，买 10 根需要多少元？', ans: fmtCents(total * 10), e: '一根 ' + fmtCents(total) + ' 元，10 根 = ' + fmtCents(total) + ' × 10 = ' + fmtCents(total * 10) + ' 元。' };
      },
      function () {
        var cm = U.randInt(101, 999);
        return { p: '小明身高 ' + cm + ' 厘米 = （ ）米', ans: fmtCents(cm), e: '1 米 = 100 厘米，' + cm + ' 厘米 = ' + cm + '/100 米 = ' + fmtCents(cm) + ' 米。' };
      }
    ];
    var f = U.pick(forms)();
    return q({ topicId: 'g4b.u1.unit', level: 4, prompt: who() + '遇到：' + f.p, correct: f.ans, wrongs: three(f.ans, [fmtCents(parseFloat(f.ans) * 10), fmtCents(parseFloat(f.ans) / 10), fmtCents(parseFloat(f.ans) * 100), fmtCents(parseFloat(f.ans) + 0.1), fmtCents(parseFloat(f.ans) * 2), fmt3(Math.round(parseFloat(f.ans) * 1000))]), explain: f.e });
  });

  extend('g4b.u1.zero', function (level) {
    /* 多样性：5 个模板 × 随机数值/对象 */
    var templates = [];
    /* 模板1：末尾 0 化简 */
    var trimPairs = [['8.200', '8.2'], ['15.60', '15.6'], ['3.070', '3.07'], ['0.500', '0.5'], ['10.200', '10.2'], ['6.00', '6'], ['0.090', '0.09'], ['20.30', '20.3']];
    var tp = U.pick(trimPairs);
    templates.push({ p: '不改变数的大小，把 ' + tp[0] + ' 化简后是（ ）', ans: tp[1], e: '小数的末尾添上或去掉 0，大小不变。' + tp[0] + ' 末尾的 0 去掉 = ' + tp[1] + '。' });
    /* 模板2：以 0.001 为单位改写 */
    var unitNums = ['0.5', '1.2', '3.08', '0.07', '5.6', '2.4'];
    var un = U.pick(unitNums);
    templates.push({ p: who() + '把 ' + un + ' 改写成以 0.001 为单位的数是（ ）', ans: fmt3(Math.round(parseFloat(un) * 1000)), e: '以 0.001 为单位就是三位小数，末尾添 0：' + un + ' = ' + fmt3(Math.round(parseFloat(un) * 1000)) + '。' });
    /* 模板3：计数单位不同 */
    var pairNums = U.pick([['0.3', '0.30'], ['1.5', '1.500'], ['0.08', '0.080']]);
    templates.push({ p: pairNums[0] + ' 和 ' + pairNums[1] + ' 相比，它们的（ ）不同', ans: '计数单位', e: pairNums[0] + ' = ' + pairNums[1] + ' 大小相等；但 ' + pairNums[0] + ' 的计数单位是 0.1，' + pairNums[1] + ' 的计数单位是 0.001。' });
    /* 模板4：判断哪个 0 不能去 */
    var cantTrim = U.pick(['600', '30.07', '0.09', '105.008', '200.5', '40.04']);
    templates.push({ p: who() + '说：下面各数中，"0"不能去掉的是（ ）', ans: cantTrim, e: cantTrim + ' 中的 0 不在小数末尾，去掉会改变大小，所以不能去掉。' });
    /* 模板5：写成两位小数 */
    var yuanInt = U.randInt(3, 20);
    templates.push({ p: '把 ' + yuanInt + ' 元写成以"元"为单位的两位小数是（ ）', ans: fmtCents(yuanInt * 100), e: '小数末尾添 0 大小不变，' + yuanInt + ' 元 = ' + fmtCents(yuanInt * 100) + ' 元。' });
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u1.zero', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['8.200', '0.500', '0.5', '8.02', '8.002', '30.07', '0.09', '600', '大小', '计数单位', '意义', '以上都对', it.ans + '0', it.ans + '00']), explain: it.e });
  });

  extend('g4b.u1.compare', function (level) {
    var set = [];
    while (set.length < 4) {
      var v = U.randInt(100, 999);
      if (set.indexOf(v) === -1) set.push(v);
    }
    var strs = set.map(function (x) { return fmtCents(x); });
    var sorted = set.slice().sort(function (a, b) { return a - b; });
    var ans = sorted[2];
    return q({ topicId: 'g4b.u1.compare', level: 4, prompt: who() + '把 ' + strs.join('、') + ' 从小到大排列，排在第三的是（ ）', correct: fmtCents(ans), wrongs: three(fmtCents(ans), set.filter(function (x) { return x !== ans; }).map(function (x) { return fmtCents(x); }).concat([fmtCents(ans + 1), fmtCents(ans - 1)])), explain: '先比整数部分，再比十分位、百分位……从小到大排第三的是 ' + fmtCents(ans) + '。' });
  });

  extend('g4b.u1.calc', function (level) {
    var a = U.randInt(500, 999), b = U.randInt(200, a - 100);
    var whole = U.randInt(5, 10);
    var c = U.randInt(100, 500);
    var forms = [
      { p: fmtCents(a) + ' − ' + fmtCents(b) + ' = （ ）', ans: a - b, e: '小数点对齐：' + fmtCents(a) + ' − ' + fmtCents(b) + ' = ' + fmtCents(a - b) + '。' },
      { p: whole + ' − ' + fmtCents(c) + ' = （ ）', ans: whole * 100 - c, e: whole + ' = ' + fmtCents(whole * 100) + '，再减 ' + fmtCents(c) + ' = ' + fmtCents(whole * 100 - c) + '。' }
    ];
    var f = U.pick(forms);
    return q({ topicId: 'g4b.u1.calc', level: 4, prompt: '神舟飞船轨道高度约 ' + fmtCents(a) + ' 万米，返回舱与轨道舱分离后下降了 ' + fmtCents(b) + ' 万米。现在高度是多少？', correct: fmtCents(f.ans), wrongs: three(fmtCents(f.ans), [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans * 10].map(function (x) { return fmtCents(x); })), explain: f.e });
  });

  extend('g4b.u1.mix', function (level) {
    var b = U.randInt(100, 300), c = U.randInt(100, 300);
    var a = b + c + U.randInt(100, 500);
    var d = U.randInt(50, 200);
    var ans = a - b - c + d;
    return q({ topicId: 'g4b.u1.mix', level: 4, prompt: '蚕丝厂上月生产蚕丝 ' + fmtCents(a) + ' 万米，本月上旬运出 ' + fmtCents(b) + ' 万米，中旬运出 ' + fmtCents(c) + ' 万米，下旬又生产了 ' + fmtCents(d) + ' 万米。现在库存多少万米？', correct: fmtCents(ans), wrongs: three(fmtCents(ans), [ans + 1, ans - 1, ans + 10, ans - 10, ans + 100, ans - 100, ans + 2, ans * 10].map(function (x) { return fmtCents(x); })), explain: '先算上月库存减上旬中旬：' + fmtCents(a) + ' − ' + fmtCents(b) + ' − ' + fmtCents(c) + ' = ' + fmtCents(a - b - c) + '，再加下旬生产的 ' + fmtCents(d) + ' = ' + fmtCents(ans) + '。' });
  });

  /* ---------- U2 认识三角形和四边形 ---------- */

  extend('g4b.u2.classify', function (level) {
    var big = U.randInt(95, 150);
    var small = U.randInt(15, 35);
    var items = [
      { p: '一个三角形两个内角分别是 ' + small + '° 和 ' + small + '°，这个三角形按边分是（ ）三角形，按角分是（ ）三角形', ans: '等腰；锐角', e: '两个角相等 → 等腰三角形；第三个角 = 180° − ' + (2 * small) + '° = ' + (180 - 2 * small) + '° < 90° → 锐角三角形。' },
      { p: '一个三角形最大角是 ' + big + '°，这个三角形是（ ）三角形', ans: '钝角', e: '最大角 ' + big + '° > 90°，所以是钝角三角形。' },
      { p: '等边三角形又是（ ）三角形', ans: '锐角', e: '等边三角形每个角 60°，都小于 90°，所以是锐角三角形。' }
    ];
    var it = U.pick(items);
    return q({ topicId: 'g4b.u2.classify', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['等腰', '等边', '锐角', '直角', '钝角', '不等边', '等腰直角', '以上都不对']), explain: it.e });
  });

  extend('g4b.u2.sum', function (level) {
    var topAngle = U.randInt(40, 100);
    var baseAngle = (180 - topAngle) / 2;
    return q({ topicId: 'g4b.u2.sum', level: 4, prompt: '一个等腰三角形的顶角是 ' + topAngle + '°，它的一个底角是多少度？', correct: baseAngle, wrongs: three(baseAngle, [topAngle, 180 - baseAngle, baseAngle + 10, baseAngle - 10, 90 - baseAngle, baseAngle + 5, baseAngle - 5, 180 - topAngle]), explain: '等腰三角形两个底角相等，底角 = (180° − 顶角) ÷ 2 = (180° − ' + topAngle + '°) ÷ 2 = ' + baseAngle + '°。' });
  });

  extend('g4b.u2.side', function (level) {
    var a = U.randInt(5, 12), b = U.randInt(5, 12);
    var upper = a + b - 1;
    return q({ topicId: 'g4b.u2.side', level: 4, prompt: '两根小棒分别长 ' + a + ' cm 和 ' + b + ' cm，第三根小棒取整厘米数，最长是（ ）cm 就能围成三角形？', correct: upper, wrongs: three(upper, [a + b, Math.abs(a - b), upper + 1, upper + 2, upper - 1, a * 2, b * 2, upper + 10]), explain: '三角形任意两边之和大于第三边。第三边 < ' + a + ' + ' + b + ' = ' + (a + b) + '，所以最长整厘米是 ' + upper + ' cm。' });
  });

  extend('g4b.u2.quad', function (level) {
    /* 多样性：6 个模板 × 随机数值/问法 */
    var templates = [];
    /* 模板1：特殊关系 */
    templates.push({ p: who() + '问：长方形和正方形都是特殊的（ ）', ans: '平行四边形', e: '长方形和正方形两组对边分别平行，它们都是特殊的平行四边形。' });
    /* 模板2：梯形定义判断 */
    templates.push({ p: '下面说法正确的是（ ）', ans: '梯形只有一组对边平行', e: '梯形的定义：只有一组对边平行的四边形。' });
    /* 模板3：周长计算 */
    var pside = U.randInt(8, 20);
    var plen = U.randInt(10, 30);
    templates.push({ p: '平行四边形的周长是 ' + (pside * 2 + plen * 2) + ' cm，其中一条边是 ' + plen + ' cm，邻边长（ ）cm', ans: pside, e: '平行四边形对边相等，邻边和 = 周长 ÷ 2 = ' + (pside + plen) + ' cm，邻边 = ' + (pside + plen) + ' − ' + plen + ' = ' + pside + ' cm。' });
    /* 模板4：判断哪个不是平行四边形 */
    templates.push({ p: who() + '在图形分类时，下面哪个图形不是平行四边形？（ ）', ans: '梯形', e: '梯形只有一组对边平行，不是平行四边形。' });
    /* 模板5：平行四边形对边性质 */
    templates.push({ p: '平行四边形的两组对边分别（ ）', ans: '平行且相等', e: '平行四边形的两组对边分别平行且相等。' });
    /* 模板6：正方形是特殊的什么 */
    templates.push({ p: who() + '说：正方形是特殊的（ ）', ans: '长方形', e: '正方形四个角都是直角，对边平行且四条边相等，它是特殊的长方形。' });
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u2.quad', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['平行四边形', '梯形', '长方形', '正方形', '三角形', '梯形只有一组对边平行', '平行四边形只有一组对边平行', '长方形四条边都相等', '平行且相等', '垂直相交', '不平行']), explain: it.e });
  });

  extend('g4b.u2.stable', function (level) {
    /* 多样性：6 个模板 × 随机生活场景 */
    var scenes = [
      { obj: '自行车车架', use: '稳定性', e: '三角形结构稳固不易变形，适合做车架。' },
      { obj: '伸缩门', use: '不稳定性', e: '平行四边形容易变形（不稳定性），适合做伸缩门。' },
      { obj: '空调外机支架', use: '稳定性', e: '三角形稳定性使支架牢固不变形。' },
      { obj: '屋顶三角屋架', use: '稳定性', e: '三角形结构稳固，适合做屋顶承重结构。' },
      { obj: '晾衣架（平行四边形结构）', use: '不稳定性', e: '平行四边形容易变形（不稳定性），适合做可伸缩晾衣架。' },
      { obj: '电线杆三角支撑', use: '稳定性', e: '三角形稳定性使支撑结构牢固不倒。' },
      { obj: '相机三脚架', use: '稳定性', e: '三角形结构稳固，三脚架放置后不晃动。' },
      { obj: '小区铁栅栏门（伸缩式）', use: '不稳定性', e: '平行四边形容易变形（不稳定性），适合做伸缩栅栏门。' }
    ];
    var sc = U.pick(scenes);
    var prompts = [
      who() + '发现' + sc.obj + '做成三角形（或平行四边形），这是利用了（ ）',
      sc.obj + '的设计利用了图形的什么特性？（ ）',
      who() + '问：' + sc.obj + '为什么这样设计？因为它具有（ ）'
    ];
    return q({ topicId: 'g4b.u2.stable', level: 4, prompt: U.pick(prompts), correct: sc.use, wrongs: three(sc.use, ['稳定性', '不稳定性', '对称性', '美观性', '容易变形', '牢固不变形', '平行性']), explain: sc.obj + '：' + sc.e });
  });

  /* ---------- U3 小数乘法 ---------- */

  extend('g4b.u3.int', function (level) {
    var v = U.randInt(2, 9), n = U.randInt(3, 9);
    return q({ topicId: 'g4b.u3.int', level: 4, prompt: '高铁每秒行驶 0.' + v + ' 千米，' + n + ' 秒行驶多少千米？', correct: fmtCents(v * n * 10), wrongs: three(fmtCents(v * n * 10), [fmtCents(v * n), fmtCents(v * n * 100), fmtCents(v * n * 10 + 10), fmtCents(v * n * 10 - 10), fmtCents(v * n * 20), fmtCents(v * n * 1000)]), explain: '0.' + v + ' × ' + n + ' = ' + (v * n) + ' 个 0.1 = ' + fmtCents(v * n * 10) + ' 千米。' });
  });

  extend('g4b.u3.point', function (level) {
    var cents = U.randInt(100, 999);
    return q({ topicId: 'g4b.u3.point', level: 4, prompt: '把 ' + fmtCents(cents) + ' 的小数点向右移动两位，再向左移动一位，结果是（ ）', correct: fmtCents(cents * 10), wrongs: three(fmtCents(cents * 10), [fmtCents(cents), fmtCents(cents * 100), fmtCents(cents / 10), fmtCents(cents * 1000), fmtCents(cents / 100), fmtCents(cents * 100)]), explain: '小数点右移两位 = × 100 = ' + fmtCents(cents * 100) + '，再左移一位 = ÷ 10 = ' + fmtCents(cents * 10) + '。相当于原数 × 10。' });
  });

  extend('g4b.u3.dec', function (level) {
    var aInt = U.randInt(1, 9), aDec = U.randInt(1, 9);
    var bDec = U.randInt(1, 9);
    var left = aInt * 10 + aDec;
    var right = bDec;
    var prod = left * right;
    return q({ topicId: 'g4b.u3.dec', level: 4, prompt: '长方形花坛长 ' + aInt + '.' + aDec + ' 米，宽 0.' + bDec + ' 米，面积是多少平方米？', correct: fmtCents(prod), wrongs: three(fmtCents(prod), [fmtCents(prod / 10), fmtCents(prod * 10), fmtCents(prod + 10), fmtCents(prod - 10), fmtCents(prod * 100), fmt3(prod * 10)]), explain: aInt + '.' + aDec + ' × 0.' + bDec + '：' + left + ' × ' + right + ' = ' + prod + '，一位小数 × 一位小数 = 两位小数，即 ' + fmtCents(prod) + ' 平方米。' });
  });

  extend('g4b.u3.simplify', function (level) {
    /* 多样性：5 个模板 × 随机凑整组合 */
    var templates = [];
    /* 模板1：乘法分配律 a×c+b×c */
    var s1 = U.randInt(11, 49), s2 = 100 - s1;
    templates.push({ p: '用简便方法计算：0.' + s1 + ' × 5 + 0.' + s2 + ' × 5 = （ ）', ans: '5', e: '运用乘法分配律：(0.' + s1 + ' + 0.' + s2 + ') × 5 = 1 × 5 = 5。' });
    /* 模板2：0.25 × 4 凑整 */
    var b2 = U.randInt(1, 9);
    templates.push({ p: '用简便方法计算：0.25 × 0.' + b2 + ' × 4 = （ ）', ans: '0.' + b2, e: '运用乘法交换律：0.25 × 4 × 0.' + b2 + ' = 1 × 0.' + b2 + ' = 0.' + b2 + '。' });
    /* 模板3：(8+0.8)×1.25 */
    templates.push({ p: '用简便方法计算：(8 + 0.8) × 1.25 = （ ）', ans: '11', e: '运用乘法分配律：8 × 1.25 + 0.8 × 1.25 = 10 + 1 = 11。' });
    /* 模板4：0.89 × 4.8 + 0.89 × 5.2 */
    templates.push({ p: who() + '用简便方法算：0.89 × 4.8 + 0.89 × 5.2 = （ ）', ans: '8.9', e: '运用乘法分配律：0.89 × (4.8 + 5.2) = 0.89 × 10 = 8.9。' });
    /* 模板5：0.5 × 2 凑整 */
    var b5 = U.randInt(1, 9);
    templates.push({ p: '巧算：0.5 × 0.' + b5 + ' × 2 = （ ）', ans: '0.' + b5, e: '运用乘法交换律：0.5 × 2 × 0.' + b5 + ' = 1 × 0.' + b5 + ' = 0.' + b5 + '。' });
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u3.simplify', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['0.89', '89', '890', '0.089', '8.90', '8900', '17.8', '5', '50', '0.5', '10']), explain: it.e });
  });

  /* ---------- U4 观察物体（文本挑战，不依赖 canvas） ---------- */

  extend('g4b.u4.view', function (level) {
    var count = U.randInt(7, 10);
    var layers = U.randInt(2, 3);
    var ans = U.randInt(3, Math.min(count, 6));
    return q({ topicId: 'g4b.u4.view', level: 4, prompt: who() + '用 ' + count + ' 个小正方体搭了一个立体图形（最高 ' + layers + ' 层，占 3 列）。从正面看，最多能看到几个正方形？', correct: ans, wrongs: three(ans, [count, layers, ans + 1, ans - 1, ans + 2, ans - 2, count + 3, count - 3, ans * 2, layers * 2]), explain: '从正面看时，前后重叠的正方形只算一个。最多能看到 ' + ans + ' 个正方形。' });
  });

  extend('g4b.u4.count', function (level) {
    var base = U.randInt(3, 5);
    return q({ topicId: 'g4b.u4.count', level: 4, prompt: who() + '搭了一个立体图形：最底层有 ' + base + ' 个小正方体，上面一层比底层少 1 个，再上面一层又少 1 个。一共用了多少个小正方体？', correct: base + (base - 1) + (base - 2), wrongs: three(base + base - 1 + base - 2, [base, base * 3, base + 2, base + 1, base * 2, base * 3 + 1, base * 3 - 1]), explain: '分层数：底层 ' + base + ' 个，第二层 ' + (base - 1) + ' 个，第三层 ' + (base - 2) + ' 个，一共 ' + base + ' + ' + (base - 1) + ' + ' + (base - 2) + ' = ' + (base + base - 1 + base - 2) + ' 个。' });
  });

  /* ---------- U5 认识方程 ---------- */

  extend('g4b.u5.letter', function (level) {
    var a = U.randInt(3, 12);
    return q({ topicId: 'g4b.u5.letter', level: 4, prompt: '当 a = ' + a + ' 时，正方形的周长 C = 4a = （ ）厘米，面积 S = a² = （ ）平方厘米', correct: '周长 ' + (4 * a) + '，面积 ' + (a * a), wrongs: three('周长 ' + (4 * a) + '，面积 ' + (a * a), ['周长 ' + (4 * a) + '，面积 ' + (2 * a), '周长 ' + (2 * a) + '，面积 ' + (a * a), '周长 ' + (4 * a) + '，面积 ' + (a * a * a), '周长 ' + (4 * a + 2) + '，面积 ' + (a * a)]), explain: '当 a = ' + a + ' 时，C = 4 × ' + a + ' = ' + (4 * a) + ' 厘米，S = ' + a + ' × ' + a + ' = ' + (a * a) + ' 平方厘米。' });
  });

  extend('g4b.u5.relation', function (level) {
    /* 多样性：5 个情境模板 × 随机数值 */
    var templates = [];
    /* 模板1：马尔马拉海 */
    templates.push({ p: '马尔马拉海面积 11000 平方千米，比太湖面积的 4 倍多 1400 平方千米。设太湖面积为 x 平方千米，正确的方程是（ ）', ans: '4x + 1400 = 11000', e: '太湖面积的 4 倍 + 1400 = 马尔马拉海面积，即 4x + 1400 = 11000。' });
    /* 模板2：妈妈年龄 */
    var momAge = U.randInt(30, 40);
    templates.push({ p: '妈妈今年 ' + momAge + ' 岁，是小红年龄的 4 倍。设小红今年 x 岁，正确的方程是（ ）', ans: '4x = ' + momAge, e: '小红年龄 × 4 = 妈妈年龄，即 4x = ' + momAge + '。' });
    /* 模板3：公共汽车 */
    templates.push({ p: '公共汽车到站后，5 人下车，8 人上车，车上现有 15 人。设车上原有 x 人，正确的方程是（ ）', ans: 'x − 5 + 8 = 15', e: '原有人数 − 下车 + 上车 = 现有人数：x − 5 + 8 = 15。' });
    /* 模板4：故事书比科技书多 */
    var storyBooks = U.randInt(1000, 2000);
    var diff = U.randInt(300, 800);
    templates.push({ p: '故事书共有 ' + storyBooks + ' 本，比科技书多 ' + diff + ' 本。设科技书有 x 本，正确的方程是（ ）', ans: 'x + ' + diff + ' = ' + storyBooks, e: '科技书 + ' + diff + ' = 故事书，即 x + ' + diff + ' = ' + storyBooks + '。' });
    /* 模板5：天平 */
    var w = U.randInt(50, 100);
    templates.push({ p: '天平左边放 1 个苹果（x 克）和 20 克砝码，右边放 ' + w + ' 克砝码，天平平衡。正确的方程是（ ）', ans: 'x + 20 = ' + w, e: '左边 = 右边：x + 20 = ' + w + '。' });
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u5.relation', level: 4, prompt: who() + '想：' + it.p, correct: it.ans, wrongs: three(it.ans, ['4x − 1400 = 11000', '4x = 11000 + 1400', 'x + 1400 = 11000', '4x = 11000', 'x − 5 + 8 = 15', 'x + 20 = 70', '4x = 36', 'x − 5 = 15']), explain: it.e });
  });

  extend('g4b.u5.equation', function (level) {
    /* 多样性：4 个模板 × 随机判断问法 */
    var templates = [];
    /* 模板1：判断哪个是方程 */
    var isEqItems = [
      { p: who() + '问：下面哪个是方程？（ ）', ans: '10 = x + 2', e: '含有未知数的等式叫方程。10 = x + 2 既含未知数 x，又是等式。' },
      { p: '下面哪个是方程？（ ）', ans: '4y = 2000', e: '4y = 2000 含有未知数 y 且是等式，所以是方程。' },
      { p: who() + '判断：下面哪个不是方程？（ ）', ans: 'x − 5 < 8', e: 'x − 5 < 8 含有未知数但不是等式（是不等式），所以不是方程。' },
      { p: '下面哪个不是方程？（ ）', ans: '6 + 3 = 9', e: '6 + 3 = 9 是等式但不含未知数，所以不是方程。' }
    ];
    templates.push(U.pick(isEqItems));
    /* 模板2：数有几个方程 */
    templates.push({ p: '下面各式中，有（ ）个方程：① 3x + 5 = 20 ② 18 − 2x ③ 24 = 12 × 2 ④ 5y = 40 ⑤ x − 8 > 6', ans: '2 个', e: '① 3x + 5 = 20 是方程；② 18 − 2x 不是等式；③ 24 = 12 × 2 是等式但不含未知数；④ 5y = 40 是方程；⑤ x − 8 > 6 是不等式。共 2 个方程。' });
    /* 模板3：方程定义填空 */
    templates.push({ p: who() + '说：含有未知数的（ ）叫方程', ans: '等式', e: '含有未知数的等式叫方程。' });
    /* 模板4：判断对错 */
    var judgeTrue = U.pick([
      { p: '"含有未知数的式子叫方程"这句话是（ ）', ans: '错误的', e: '必须是"等式"才叫方程，含有未知数的式子不一定是等式。' },
      { p: '"方程一定是等式"这句话是（ ）', ans: '正确的', e: '方程是含有未知数的等式，所以方程一定是等式。' },
      { p: '"等式一定是方程"这句话是（ ）', ans: '错误的', e: '等式不一定含有未知数，如 6 + 3 = 9 是等式但不是方程。' }
    ]);
    templates.push(judgeTrue);
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u5.equation', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['10 = x + 2', '4y = 2000', 'x − 5 < 8', '6 + 3 = 9', '4x > 10', '等式', '不等式', '式子', '算式', '2 个', '正确的', '错误的']), explain: it.e });
  });

  extend('g4b.u5.solve1', function (level) {
    /* 多样性：5 个模板 × 随机数值 */
    var templates = [];
    /* 模板1：x + b = sum */
    var b1 = U.randInt(5, 25), x1 = U.randInt(10, 50);
    templates.push({ p: '解方程：x + ' + b1 + ' = ' + (x1 + b1) + '，x = （ ）', ans: String(x1), e: '等式两边同时减 ' + b1 + '：x = ' + (x1 + b1) + ' − ' + b1 + ' = ' + x1 + '。' });
    /* 模板2：y - b = diff */
    var b2 = U.randInt(5, 20), y2 = b2 + U.randInt(10, 40);
    templates.push({ p: '解方程：y − ' + b2 + ' = ' + (y2 - b2) + '，y = （ ）', ans: String(y2), e: '等式两边同时加 ' + b2 + '：y = ' + (y2 - b2) + ' + ' + b2 + ' = ' + y2 + '。' });
    /* 模板3：b + x = sum */
    var b3 = U.randInt(3, 15), x3 = U.randInt(10, 40);
    templates.push({ p: '解方程：' + b3 + ' + x = ' + (x3 + b3) + '，x = （ ）', ans: String(x3), e: '等式两边同时减 ' + b3 + '：x = ' + (x3 + b3) + ' − ' + b3 + ' = ' + x3 + '。' });
    /* 模板4：小数减法 x - 12.3 = 3.8 */
    templates.push({ p: who() + '解方程：x − 12.3 = 3.8，x = （ ）', ans: '16.1', e: '等式两边同时加 12.3：x = 3.8 + 12.3 = 16.1。' });
    /* 模板5：x - 19 = diff */
    var x5 = U.randInt(25, 60);
    templates.push({ p: '解方程：x − 19 = ' + (x5 - 19) + '，x = （ ）', ans: String(x5), e: '等式两边同时加 19：x = ' + (x5 - 19) + ' + 19 = ' + x5 + '。' });
    var it = U.pick(templates);
    var baseVal = parseInt(it.ans);
    return q({ topicId: 'g4b.u5.solve1', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, [String(baseVal + 1), String(baseVal - 1), String(baseVal + 10), String(baseVal - 10), String(baseVal + 2), String(baseVal * 2), String(baseVal + 5), String(baseVal - 5), '16.1', '8.5', '15.1']), explain: it.e });
  });

  extend('g4b.u5.solve2', function (level) {
    var x = U.randInt(3, 20), k = U.randInt(3, 9);
    return q({ topicId: 'g4b.u5.solve2', level: 4, prompt: '解方程：' + k + 'y = ' + (x * k) + '，y = （ ）', correct: String(x), wrongs: three(String(x), [String(x + 1), String(x - 1), String(x * 2), String(x + 10), String(x - 10), String(k)]), explain: '等式两边同时除以 ' + k + '：' + k + 'y ÷ ' + k + ' = ' + (x * k) + ' ÷ ' + k + '，y = ' + x + '。' });
  });

  extend('g4b.u5.word', function (level) {
    /* 多样性：5 个情境模板 × 随机数值 */
    var templates = [];
    /* 模板1：猜数游戏 x*4+6-3=87 */
    templates.push({ p: who() + '做猜数游戏：心里想一个数 x，把它乘 4，再加上 6，再减去 3，等于 87。x = （ ）', ans: '21', e: '列方程：4x + 6 − 3 = 87，4x + 3 = 87，4x = 84，x = 21。' });
    /* 模板2：日历规律 */
    var y = U.randInt(10, 25);
    templates.push({ p: '日历中，方框中间的数是 y，5 个数之和是 ' + (5 * y) + '。中间数 y = （ ）', ans: String(y), e: '日历方框中 5 个数之和 = 中间数 × 5，即 5y = ' + (5 * y) + '，y = ' + y + '。' });
    /* 模板3：公共汽车 */
    templates.push({ p: '公共汽车到站，5 人下车，8 人上车，车上现有 15 人。车上原有 x 人，x = （ ）', ans: '12', e: '列方程：x − 5 + 8 = 15，x + 3 = 15，x = 12。' });
    /* 模板4：猜数游戏 x*k+add=result */
    var x4 = U.randInt(10, 30), k4 = U.randInt(2, 5), add4 = U.randInt(5, 20);
    var result4 = x4 * k4 + add4;
    templates.push({ p: who() + '心里想一个数，乘 ' + k4 + ' 再加 ' + add4 + '，等于 ' + result4 + '。这个数是（ ）', ans: String(x4), e: '列方程：' + k4 + 'x + ' + add4 + ' = ' + result4 + '，' + k4 + 'x = ' + (result4 - add4) + '，x = ' + x4 + '。' });
    /* 模板5：猜数游戏 x*k-sub=result */
    var x5 = U.randInt(10, 30), k5 = U.randInt(2, 5), sub5 = U.randInt(5, 15);
    var result5 = x5 * k5 - sub5;
    templates.push({ p: who() + '心里想一个数，乘 ' + k5 + ' 再减 ' + sub5 + '，等于 ' + result5 + '。这个数是（ ）', ans: String(x5), e: '列方程：' + k5 + 'x − ' + sub5 + ' = ' + result5 + '，' + k5 + 'x = ' + (result5 + sub5) + '，x = ' + x5 + '。' });
    var it = U.pick(templates);
    var baseVal = parseInt(it.ans);
    return q({ topicId: 'g4b.u5.word', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, [String(baseVal + 1), String(baseVal - 1), String(baseVal + 5), String(baseVal - 5), String(baseVal + 10), String(baseVal * 2), String(baseVal + 2), String(baseVal - 2)]), explain: it.e });
  });

  extend('g4b.u5.tess', function (level) {
    /* 多样性：5 个模板 × 随机问法 */
    var templates = [];
    /* 模板1：哪个能密铺 */
    templates.push({ p: who() + '问：下面哪种图形可以密铺？（ ）', ans: '三角形', e: '三角形可以密铺。任意三角形内角和 180°，6 个同样的三角形在一点处拼成 360°。' });
    /* 模板2：哪个能密铺（四边形） */
    templates.push({ p: '下面哪种图形可以密铺？（ ）', ans: '四边形', e: '四边形可以密铺。任意四边形内角和 360°，4 个同样的四边形在一点处拼成 360°。' });
    /* 模板3：哪个不能密铺 */
    templates.push({ p: who() + '说：下面哪种图形不能密铺？（ ）', ans: '正五边形', e: '正五边形每个内角 108°，3 × 108° = 324° ≠ 360°，不能密铺。' });
    /* 模板4：密铺定义 */
    templates.push({ p: '图形之间没有空隙、不重叠地铺在平面上，叫做（ ）', ans: '密铺', e: '图形之间没有空隙，也不重叠，就是密铺。' });
    /* 模板5：正六边形密铺 */
    templates.push({ p: who() + '发现蜂巢是正六边形排列，因为正六边形（ ）', ans: '可以密铺', e: '正六边形每个内角 120°，3 × 120° = 360°，可以密铺。' });
    var it = U.pick(templates);
    return q({ topicId: 'g4b.u5.tess', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, ['三角形', '四边形', '正五边形', '正六边形', '正三角形', '长方形', '圆', '密铺', '可以密铺', '不能密铺', '有重叠']), explain: it.e });
  });

  /* ---------- U6 数据的表示和分析 ---------- */

  extend('g4b.u6.bar', function (level) {
    var cats = ['周一', '周二', '周三', '周四', '周五'];
    var vals = [U.randInt(8, 15), U.randInt(10, 20), U.randInt(5, 12), U.randInt(15, 25), U.randInt(12, 22)];
    var sum = vals[0] + vals[1] + vals[2] + vals[3] + vals[4];
    var mean = sum / 5;
    return q({ topicId: 'g4b.u6.bar', level: 4, prompt: who() + '统计了一周借书数量（周一到周五）共 ' + sum + ' 本，平均每天借书多少本？', correct: mean, wrongs: three(mean, [mean + 1, mean - 1, mean + 2, mean - 2, vals[0], vals[2], mean * 2, mean + 5]), canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: '本' }, explain: '总数 = ' + sum + ' 本，平均 = ' + sum + ' ÷ 5 = ' + mean + ' 本。' });
  });

  extend('g4b.u6.line', function (level) {
    /* 多样性：3 种数据情境 × 3 种问法 = 9 种组合 */
    var scenarios = [
      { cats: ['第2天', '第4天', '第6天', '第8天', '第10天', '第12天'], vals: [1, 3, 7, 10, 14, 15], unit: '厘米', title: '蒜苗生长' },
      { cats: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'], vals: [19, 22, 25, 29, 35, 38, 40], unit: '万千米', title: '高铁营业里程' },
      { cats: ['周一', '周二', '周三', '周四', '周五'], vals: [12, 18, 15, 25, 30], unit: '个', title: '每天读书页数' }
    ];
    var sc = U.pick(scenarios);
    var vals = sc.vals, cats = sc.cats;
    /* 计算每段增长量 */
    var diffs = [];
    for (var i = 1; i < vals.length; i++) diffs.push(vals[i] - vals[i - 1]);
    var maxDiffIdx = 0;
    for (var j = 1; j < diffs.length; j++) { if (diffs[j] > diffs[maxDiffIdx]) maxDiffIdx = j; }
    var qTypes = [
      function () {
        var idx = U.randInt(0, vals.length - 1);
        return { p: '根据' + sc.title + '折线统计图，' + cats[idx] + '对应的值是多少' + sc.unit + '？', ans: vals[idx], e: '从折线统计图中读取：' + cats[idx] + '对应的值是 ' + vals[idx] + ' ' + sc.unit + '。' };
      },
      function () {
        var ans = Math.max.apply(null, vals);
        var maxCat = cats[vals.indexOf(ans)];
        return { p: '根据' + sc.title + '折线统计图，最高值是多少' + sc.unit + '？', ans: ans, e: '折线统计图中最高点在' + maxCat + '，值为 ' + ans + ' ' + sc.unit + '。' };
      },
      function () {
        var ans = cats[maxDiffIdx] + ' 到 ' + cats[maxDiffIdx + 1];
        return { p: who() + '看' + sc.title + '折线统计图，哪一段时间增长最快？', ans: ans, e: '折线越陡增长越快。从' + cats[maxDiffIdx] + '到' + cats[maxDiffIdx + 1] + '，增长了 ' + diffs[maxDiffIdx] + ' ' + sc.unit + '，是增长最快的一段。' };
      }
    ];
    var f = U.pick(qTypes)();
    var pool;
    if (typeof f.ans === 'number') {
      pool = [f.ans + 1, f.ans - 1, f.ans + 2, f.ans - 2, Math.max.apply(null, vals) + 1, Math.min.apply(null, vals) - 1, f.ans * 2, f.ans + 5];
    } else {
      pool = ['整体呈下降趋势', '保持不变', '先升后降', '先降后升', cats[0] + ' 到 ' + cats[1], '整体呈上升趋势', '无法判断'];
    }
    return q({ topicId: 'g4b.u6.line', level: 4, prompt: f.p, correct: f.ans, wrongs: three(f.ans, pool), canvas: { kind: 'line-chart', categories: cats, values: vals, unit: sc.unit }, explain: f.e });
  });

  extend('g4b.u6.mean', function (level) {
    /* 多样性：5 个情境模板 × 随机数值 */
    var templates = [];
    /* 模板1：淘气记数字 */
    templates.push({ p: '淘气 5 次记住数字的个数分别是：5、4、7、5、9。平均每次记住几个数字？', ans: '6', e: '平均数 = (5 + 4 + 7 + 5 + 9) ÷ 5 = 30 ÷ 5 = 6（个）。' });
    /* 模板2：跳绳成绩 */
    var n = 5;
    var vals = [];
    var sum = 0;
    for (var i = 0; i < n; i++) { var v = U.randInt(80, 140); vals.push(v); sum += v; }
    var mean = Math.round(sum / n);
    templates.push({ p: who() + '统计了 ' + n + ' 名同学每分钟跳绳成绩：' + vals.join('、') + ' 个。平均每人跳绳多少个？', ans: mean, e: '平均数 = 总数 ÷ 人数 = ' + sum + ' ÷ ' + n + ' = ' + mean + ' 个。' });
    /* 模板3：投球比赛 */
    var v3 = [7, 7, 6, 8];
    templates.push({ p: '奇思前后 4 次投中的个数分别为 7 个、7 个、6 个、8 个。平均每次投中几个？', ans: '7', e: '平均数 = (7 + 7 + 6 + 8) ÷ 4 = 28 ÷ 4 = 7（个）。' });
    /* 模板4：已知平均数求总数 */
    var mean4 = U.randInt(60, 100);
    var n4 = U.randInt(3, 6);
    templates.push({ p: who() + '班级 ' + n4 + ' 名同学的平均分是 ' + mean4 + ' 分，总分是多少分？', ans: mean4 * n4, e: '总数 = 平均数 × 个数 = ' + mean4 + ' × ' + n4 + ' = ' + (mean4 * n4) + ' 分。' });
    /* 模板5：气温记录 */
    var lowTemps = [8, 10, 11, 12, 11, 12, 13];
    templates.push({ p: '某地一周最低气温记录为：8℃、10℃、11℃、12℃、11℃、12℃、13℃。这星期平均最低气温是多少度？', ans: '11', e: '平均数 = (8 + 10 + 11 + 12 + 11 + 12 + 13) ÷ 7 = 77 ÷ 7 = 11（℃）。' });
    var it = U.pick(templates);
    var baseVal = parseFloat(it.ans);
    return q({ topicId: 'g4b.u6.mean', level: 4, prompt: it.p, correct: it.ans, wrongs: three(it.ans, [String(baseVal + 1), String(baseVal - 1), String(baseVal + 2), String(baseVal - 2), String(baseVal * 2), String(baseVal + 5), String(baseVal - 5), '6', '30', '7']), explain: it.e });
  });

})();


  MG.challengeIds = hardIds.slice();
})(typeof window !== 'undefined' ? window : globalThis);
