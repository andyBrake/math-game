/* 四年级上册出题器（北师大版，8 个单元 39 个知识点） */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;
  var R = MG.gen.register.bind(MG.gen);

  function q(o) { return MG.q.build(o); }

  /* 从候选池洗牌取 3 个不重复、不等于 correct、非负（仅对数值）的干扰项 */
  function pick3(correct, pool) {
    var seen = Object.create(null);
    seen[String(correct)] = true;
    var out = [];
    U.shuffle(pool).forEach(function (v) {
      if (v === null || v === undefined) return;
      if (typeof v === 'number' && v < 0) return;
      var s = String(v);
      if (s === 'undefined' || s === 'NaN') return;
      if (seen[s]) return;
      seen[s] = true; out.push(s);
    });
    return out.slice(0, 3);
  }
  var NAMES = ['小明', '小红', '小刚', '小丽', '小强', '小芳', '小军', '小梅', '小华', '小勇', '小燕', '小亮', '小杰', '小娟', '小涛', '小琴'];
  function who() { return U.pick(NAMES); }
  function gno() { return U.randInt(2, 19); }

  /* ---------- 读数辅助（支持亿级） ---------- */
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
  /* 支持到亿级（12 位以内）的中文读数 */
  function readNum(n) {
    n = Math.floor(n);
    if (n === 0) return '零';
    var ge = n % 10000;
    var wan = Math.floor(n / 10000) % 10000;
    var yi = Math.floor(n / 100000000);
    var s = '';
    if (yi > 0) s += readGroup(yi) + '亿';
    if (wan > 0) {
      if (yi > 0 && wan < 1000) s += '零';
      s += readGroup(wan) + '万';
    } else if (yi > 0 && ge > 0) s += '零';
    if (ge > 0) {
      if (wan > 0 && ge < 1000) s += '零';
      s += readGroup(ge);
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
  /* 生成含连续 0 / 跨级 0 的 7~9 位数，专练零的读法 */
  function trickyBig() {
    var a = U.randInt(1, 9), b = U.randInt(1, 9), c = U.randInt(1, 9);
    var t = U.randInt(1, 6);
    var table = [
      a * 100000000 + b * 10000 + c * 10,          // 亿级非0，万级千位非0
      a * 100000000 + b * 1000 + c,                 // 万级连续零
      a * 10000000 + b * 100000 + c * 100,          // 千万位起
      a * 10000000 + b * 1000000 + c * 10,
      a * 100000000 + b * 100000 + c * 100,
      a * 10000000 + b * 1000 + c * 10
    ];
    return table[t - 1];
  }

  /* ================= U1 认识更大的数 ================= */

  /* 1.1 十进制数位顺序表：计数单位与进率、某位表示多少 */
  R('g4a.u1.table', function (level) {
    var POOL = ['十万', '百万', '千万', '亿', '万', '个', '十', '百', '千', '十亿', '千亿'];
    var mode = U.pick(['rel', 'level', 'pos']);
    var correct, prompt, explain;
    if (mode === 'rel') {
      var steps = U.pick([
        { a: '一万', b: '十万', e: '10 个一万是十万。' },
        { a: '十万', b: '一百万', e: '10 个十万是一百万。' },
        { a: '一百万', b: '一千万', e: '10 个一百万是一千万。' },
        { a: '一千万', b: '一亿', e: '10 个一千万是一亿。' },
        { a: '一百万', b: '一亿', e: '一百万乘 100 是一亿，即 100 个一百万是一亿。' }
      ]);
      correct = steps.b;
      prompt = U.pick([
        '10 个' + steps.a + '是（ ）',
        '每相邻两个计数单位之间的进率都是 10，10 个' + steps.a + '等于（ ）',
        '在计数器上一万一万地数，数 10 次就是（ ）',
        who() + '拨一拨：10 个' + steps.a + '是（ ）',
        '比' + steps.a + '大 10 倍的计数单位是（ ）'
      ]);
      explain = steps.e;
    } else if (mode === 'level') {
      correct = '4 个';
      prompt = U.pick([
        '按照我国的计数习惯，从右边起每（ ）个数位是一级',
        '数位顺序表中，亿级、万级、个级，每一级都有（ ）个数位',
        '个级包含个位、十位、百位、千位，共（ ）个数位',
        who() + '发现每一级的计数单位个数相同，每级有（ ）个',
        '万级的数位个数是（ ）'
      ]);
      explain = '每一级有 4 个计数单位，类似“个、十、百、千”。';
    } else {
      var pos = U.pick([
        { word: '万位', val: '几个万', e: '万位上的数字表示几个万。' },
        { word: '千万位', val: '几个千万', e: '千万位上的数字表示几个千万。' },
        { word: '亿位', val: '几个亿', e: '亿位上的数字表示几个亿。' },
        { word: '十万位', val: '几个十万', e: '十万位上的数字表示几个十万。' }
      ]);
      correct = pos.val;
      prompt = U.pick([
        '一个数的' + pos.word + '上是 7，表示（ ）',
        who() + '在' + pos.word + '拨了 5 个珠子，表示（ ）',
        '数位顺序表中，' + pos.word + '上的数字表示（ ）',
        '在' + pos.word + '上写 3，它表示（ ）'
      ]);
      explain = pos.e;
    }
    return q({
      topicId: 'g4a.u1.table', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, POOL.concat(['5 个', '3 个', '10 个', '几个百', '几个千', '几个十'])),
      explain: explain
    });
  });

  /* 1.2 大数的读法（含亿级） */
  R('g4a.u1.read', function (level) {
    var n;
    if (Math.random() < 0.5) n = trickyBig();
    else {
      var digits = level >= 3 ? 9 : (level === 2 ? 8 : 7);
      n = U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    }
    var correct = readNum(n);
    var p = U.pick([
      '下面各数中，' + n + ' 读作：',
      who() + '在计数器上拨出了 ' + n + '，这个数读作：',
      '读出下面的数：' + n,
      '写作 ' + n + ' 的数，读出来是：',
      '把 ' + n + ' 读出来，正确的是：',
      '我国人口约为 ' + n + ' 人，它读作：'
    ]);
    var cands = digitVariants(n).map(readNum).filter(function (s) {
      return s && s.indexOf('undefined') < 0 && s !== correct;
    });
    return q({
      topicId: 'g4a.u1.read', level: level,
      prompt: p, correct: correct,
      wrongs: pick3(correct, cands),
      explain: n + ' 读作：' + correct + '。读数时从高位读起，先分级；每级末尾的 0 不读，中间连续的 0 只读一个零。'
    });
  });

  /* 1.3 大数的写法（含亿级） */
  R('g4a.u1.write', function (level) {
    var digits = level >= 3 ? 9 : (level === 2 ? 8 : 7);
    var n = Math.random() < 0.4 ? trickyBig() : U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var reading = readNum(n);
    return q({
      topicId: 'g4a.u1.write', level: level,
      prompt: U.pick([
        '「' + reading + '」写作：',
        who() + '读出来是“' + reading + '”，这个数写作：',
        '把“' + reading + '”写成数字是（ ）',
        '写数：' + reading + ' 写作（ ）'
      ]),
      correct: String(n),
      wrongs: pick3(String(n), digitVariants(n)),
      explain: reading + ' 写作 ' + n + '。写数时从高位起，哪一位上一个单位也没有就在那一位写 0。'
    });
  });

  /* 1.4 大数的大小比较 */
  R('g4a.u1.compare', function (level) {
    var useGrain = Math.random() < 0.3;
    var set;
    if (useGrain) {
      var grain = [1690000, 7190000, 750000, 910000, 1040000, 3200000, 580000];
      set = U.shuffle(grain).slice(0, 4);
    } else {
      var digits = level >= 3 ? 8 : (level === 2 ? 7 : 6);
      set = [];
      while (set.length < 4) {
        var v = U.randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
        if (set.indexOf(v) === -1) set.push(v);
      }
    }
    var sorted = set.slice().sort(function (a, b) { return b - a; });
    var listStr = set.join('、');
    var mode = U.pick(['max', 'min', 'secondMax', 'secondMin']);
    var correct, head;
    if (mode === 'max') {
      correct = sorted[0];
      head = U.pick(['在 ' + listStr + ' 这些数中，最大的是',
        '把 ' + listStr + ' 从大到小排，排在最前面的是',
        listStr + ' 四个数里，最大的数是',
        '大豆产量中，' + listStr + ' 产量最高的是']);
    } else if (mode === 'min') {
      correct = sorted[3];
      head = U.pick(['在 ' + listStr + ' 这些数中，最小的是',
        '把 ' + listStr + ' 从小到大排，排在最前面的是',
        listStr + ' 四个数里，最小的数是']);
    } else if (mode === 'secondMax') {
      correct = sorted[1];
      head = U.pick(['把 ' + listStr + ' 从大到小排列，排在第二的是',
        listStr + ' 中，第二大的数是']);
    } else {
      correct = sorted[2];
      head = U.pick(['把 ' + listStr + ' 从小到大排列，排在第二的是',
        listStr + ' 中，第二小的数是']);
    }
    return q({
      topicId: 'g4a.u1.compare', level: level,
      prompt: head + '（ ）',
      correct: String(correct),
      wrongs: pick3(String(correct), sorted.filter(function (v) { return v !== correct; }).concat([correct + 1000, correct - 1000, correct * 2])),
      explain: '比较大数先看位数，位数多的大；位数相同从最高位逐位比较。' + (mode === 'max' ? '最大' : mode === 'min' ? '最小' : mode === 'secondMax' ? '第二大' : '第二小') + '的是 ' + correct + '。'
    });
  });

  /* 1.5 改写成以“万”“亿”为单位的数 */
  R('g4a.u1.convert', function (level) {
    var toYi = Math.random() < 0.3;
    var correct, prompt, explain;
    if (toYi) {
      var e = U.randInt(3, 999);
      var n = e * 100000000;
      correct = e + '亿';
      prompt = U.pick([
        '把 ' + n + ' 改写成用「亿」作单位的数是：',
        n + ' = （ ）亿，括号里应填：',
        '将 ' + n + ' 写成以「亿」为单位，是：',
        '用「亿」作单位表示 ' + n + '，正确的是：'
      ]);
      explain = '改写成用「亿」作单位，去掉末尾的 8 个 0，再写上「亿」字：' + n + ' = ' + e + '亿。';
    } else {
      var w = U.randInt(12, 9999);
      var nw = w * 10000;
      correct = w + '万';
      prompt = U.pick([
        '把 ' + nw + ' 改写成用「万」作单位的数是：',
        nw + ' = （ ）万，括号里应填：',
        '将 ' + nw + ' 写成以「万」为单位，是：',
        '把整万数 ' + nw + ' 改写后是：',
        '用「万」作单位表示 ' + nw + '，正确的是：'
      ]);
      explain = '改写成用「万」作单位，去掉末尾的 4 个 0，再写上「万」字：' + nw + ' = ' + w + '万。';
    }
    var baseNum = parseInt(correct, 10);
    var suffix = correct.slice(String(baseNum).length);
    var pool = [];
    for (var k = 1; k <= 8; k++) {
      if (baseNum + k > 0) pool.push((baseNum + k) + suffix);
      if (baseNum - k > 0) pool.push((baseNum - k) + suffix);
    }
    pool.push((baseNum * 10) + suffix, (Math.floor(baseNum / 10)) + suffix);
    return q({
      topicId: 'g4a.u1.convert', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, pool),
      explain: explain
    });
  });

  /* 1.6 近似数（四舍五入）+ 精确数/近似数判断 */
  R('g4a.u1.round', function (level) {
    var mode = U.pick(['wan', 'shiwan', 'yi', 'exact']);
    var correct, prompt, explain;
    if (mode === 'exact') {
      var items = [
        { s: '我们班有 45 人，这里的 45 是（ ）', c: '精确数', e: '与实际完全符合的数是精确数，45 人是准确统计的。' },
        { s: '全校大约有 1000 人，这里的 1000 是（ ）', c: '近似数', e: '带有“大约”“约”等字样、与实际接近的数是近似数。' },
        { s: '小明身高约 140 厘米，140 是（ ）', c: '近似数', e: '“约 140 厘米”是估计出来的，是近似数。' },
        { s: '数学课本有 121 页，121 是（ ）', c: '精确数', e: '页数是准确数出来的，是精确数。' },
        { s: '我国陆地面积约 960 万平方千米，960 万是（ ）', c: '近似数', e: '“约”字说明是近似数。' }
      ];
      var it = U.pick(items);
      correct = it.c;
      prompt = U.pick([it.s, who() + '说：' + it.s]);
      explain = it.e;
      return q({
        topicId: 'g4a.u1.round', level: level,
        prompt: prompt, correct: correct,
        wrongs: pick3(correct, ['精确数', '近似数', '自然数', '整数', '小数']),
        explain: explain
      });
    }
    if (mode === 'wan') {
      var num = U.randInt(120000, 9999999);
      var rounded = Math.round(num / 10000);
      correct = rounded + '万';
      prompt = U.pick([
        '省略 ' + num + ' 万位后面的尾数，约是：',
        '用四舍五入法求 ' + num + ' 的近似数（精确到万位）是：',
        num + ' ≈ （ ）万（省略万位后面的尾数）',
        '省略万位后面的尾数，' + num + ' 大约是：'
      ]);
      explain = '省略万位后面的尾数要看千位：千位是 ' + (Math.floor(num / 1000) % 10) +
        '，' + ((Math.floor(num / 1000) % 10) >= 5 ? '满 5 向前一位进 1' : '不满 5 直接舍去') + '，所以约是 ' + rounded + '万。';
    } else if (mode === 'shiwan') {
      var num2 = U.randInt(120000, 9999999);
      var r2 = Math.round(num2 / 100000);
      correct = r2 + '十万';
      prompt = U.pick([
        '省略 ' + num2 + ' 十万位后面的尾数，约是：',
        num2 + ' 四舍五入到十万位约是（ ）',
        '把 ' + num2 + ' 精确到十万位，约是：'
      ]);
      explain = '四舍五入到十万位要看万位：' + num2 + ' 约是 ' + r2 + ' 十万。';
    } else {
      var num3 = U.randInt(150000000, 999999999);
      var r3 = Math.round(num3 / 100000000);
      correct = r3 + '亿';
      prompt = U.pick([
        '省略 ' + num3 + ' 亿位后面的尾数，约是：',
        num3 + ' 四舍五入到亿位约是（ ）',
        '把 ' + num3 + ' 精确到亿位，约是：'
      ]);
      explain = '四舍五入到亿位要看千万位：' + num3 + ' 约是 ' + r3 + ' 亿。';
    }
    var baseNum = parseInt(correct, 10);
    var suffix = correct.slice(String(baseNum).length);
    var pool = [];
    for (var k = 1; k <= 6; k++) {
      pool.push((baseNum + k) + suffix);
      if (baseNum - k > 0) pool.push((baseNum - k) + suffix);
    }
    pool.push((baseNum * 10) + suffix, (baseNum + k) + '');
    return q({
      topicId: 'g4a.u1.round', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, pool),
      explain: explain
    });
  });

  /* 1.7 编码（综合实践） */
  R('g4a.u1.code', function (level) {
    var mode = U.pick(['len', 'birth', 'gender', 'zip']);
    var correct, prompt, explain;
    if (mode === 'len') {
      correct = '18 位';
      prompt = U.pick([
        '我国第二代身份证号码由（ ）位数字组成',
        '每个公民唯一的、终身不变的身份代码，身份证号码有（ ）位',
        who() + '的身份证号码共有（ ）个数字',
        '身份证号码是 18 位编码，它一共包含（ ）位'
      ]);
      explain = '身份证号码由 18 位数字组成，是每个公民唯一的身份代码。';
    } else if (mode === 'birth') {
      correct = '出生日期';
      prompt = U.pick([
        '身份证号码中第 7~14 位数字表示（ ）',
        '身份证号码里，从第 7 位开始的 8 位是一个人的（ ）',
        '某人身份证号第 7~14 位是 20100512，这表示他的（ ）是 2010 年 5 月 12 日',
        '身份证编码的第 7 到 14 位用来记录（ ）'
      ]);
      explain = '身份证号码第 7~14 位是出生日期码，共 8 位（年月日）。';
    } else if (mode === 'gender') {
      correct = '男';
      prompt = U.pick([
        '身份证号码第 17 位是奇数（1、3、5、7、9），表示这是（ ）',
        '某人身份证第 17 位是 3，根据编码规则，他是（ ）',
        '身份证第 17 位如果是偶数表示女，那么是奇数表示（ ）',
        '一位同学身份证第 17 位是 7，按规则这位同学是（ ）'
      ]);
      explain = '身份证第 17 位：1、3、5、7、9 表示男，0、2、4、6、8 表示女。';
    } else {
      correct = '6 位';
      prompt = U.pick([
        '我国邮政编码由（ ）位数字组成',
        '寄信时填写的邮政编码是（ ）位编码',
        '信封左上角填写的邮政编码共有（ ）位',
        '邮政编码是投递邮件的专用编码，它有（ ）位'
      ]);
      explain = '邮政编码由 6 位数字组成，前两位表示省，后面依次表示邮区、县、投递局。';
    }
    return q({
      topicId: 'g4a.u1.code', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['15 位', '16 位', '17 位', '18 位', '6 位', '9 位', '男', '女', '出生日期', '家庭住址', '班级', '身高']),
      explain: explain
    });
  });

  /* ================= U2 线与角 ================= */

  /* 2.1 线段、射线与直线 */
  R('g4a.u2.line', function (level) {
    var mode = U.pick(['seg', 'ray', 'line', 'shortest']);
    var correct, prompt, explain;
    if (mode === 'seg') {
      correct = '2 个';
      prompt = U.pick([
        '线段有（ ）个端点',
        who() + '画了一条可以量出长度的线，它有（ ）个端点',
        '下面关于线段的说法：线段有（ ）个端点',
        '一条拉直的线绳，看作线段，它有（ ）个端点'
      ]);
      explain = '线段有 2 个端点，有一定长度，可以度量。';
    } else if (mode === 'ray') {
      correct = '1 个';
      prompt = U.pick([
        '射线有（ ）个端点',
        '手电筒射出去的光可以看作射线，它有（ ）个端点',
        '从一点出发向一个方向无限延伸的线，有（ ）个端点',
        '射线 AB 只有（ ）个端点'
      ]);
      explain = '射线有 1 个端点，可以向一个方向无限延伸。';
    } else if (mode === 'line') {
      correct = '0 个';
      prompt = U.pick([
        '直线有（ ）个端点',
        '没有端点、可以向两端无限延伸的线叫做直线，它有（ ）个端点',
        '直线 AB 或直线 BA，它有（ ）个端点',
        '一条（ ）端点的线，可以向两个方向无限延伸'
      ]);
      explain = '直线没有端点，可以向两个方向无限延伸。';
    } else {
      correct = '线段';
      prompt = U.pick([
        '两点之间所有连线中，（ ）最短',
        '从老虎山到狐狸洞，把路线描一描，最短的是（ ）',
        'A、B 两点之间的连线，最短的那条是（ ）',
        '连接两点的线中，长度最短的是（ ），它的长度就是两点间的距离'
      ]);
      explain = '两点之间所有连线中线段最短；线段 AB 的长度就是 A、B 两点之间的距离。';
    }
    return q({
      topicId: 'g4a.u2.line', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['2 个', '1 个', '0 个', '3 个', '无数个', '线段', '射线', '直线', '曲线', '折线']),
      explain: explain
    });
  });

  /* 2.2 相交与垂直 */
  R('g4a.u2.vertical', function (level) {
    var mode = U.pick(['perp', 'short', 'cross']);
    var correct, prompt, explain;
    if (mode === 'perp') {
      correct = '互相垂直';
      prompt = U.pick([
        '当两条直线相交成直角时，这两条直线（ ）',
        who() + '画的两条直线相交成 90°，它们的位置关系是（ ）',
        '两条直线相交成直角，就说这两条直线（ ）',
        '剪刀张开成直角、红十字的两条线，都（ ）'
      ]);
      explain = '两条直线相交成直角时，这两条直线互相垂直，其中一条是另一条的垂线。';
    } else if (mode === 'short') {
      correct = '垂直线段';
      prompt = U.pick([
        '从直线外一点到这条直线所画的各条线段中，（ ）最短',
        '机灵狗去河边喝水，从它所在位置到河边，最短的路线是（ ）',
        '点到直线的所有连线中最短的是（ ）',
        '从一点向直线连线，量一量，最短的那条是（ ）'
      ]);
      explain = '从直线外一点到这条直线所画的线段中，垂直线段最短，它的长度叫做点到直线的距离。';
    } else {
      correct = '相交';
      prompt = U.pick([
        '两条直线延长后会碰到一起，就说这两条直线（ ）',
        '剪刀张开的两条边所在的直线是（ ）的',
        '下面每组中的两条直线延长后会碰到一起，它们是（ ）的',
        '两条直线有一个公共点，这两条直线（ ）'
      ]);
      explain = '如果两条直线延长后会有一个公共点，就说这两条直线相交。';
    }
    return q({
      topicId: 'g4a.u2.vertical', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['互相垂直', '互相平行', '垂直线段', '斜线', '相交', '重合', '射线', '距离', '平行线']),
      explain: explain
    });
  });

  /* 2.3 平移与平行 */
  R('g4a.u2.parallel', function (level) {
    var mode = U.pick(['def', 'move', 'dist']);
    var correct, prompt, explain;
    if (mode === 'def') {
      correct = '平行线';
      prompt = U.pick([
        '在同一平面内不相交的两条直线叫做（ ）',
        '同一平面内永不相交的两条直线，它们是（ ）',
        who() + '在方格纸上画了两条延长后也不相交的直线，这两条是（ ）',
        '在同一平面内，（ ）的两条直线互相平行'
      ]);
      explain = '在同一平面内不相交的两条直线互相平行，这两条直线叫做平行线。';
    } else if (mode === 'move') {
      correct = '平移';
      prompt = U.pick([
        '用三角板沿着直尺移动画出两条平行线，这个过程是（ ）',
        '方格纸上一个图形上下左右移动，形状方向不变，这种运动叫（ ）',
        '铅笔在直尺边沿一条直线移动，画出的两条线互相平行，靠的是（ ）',
        '把一个图形沿着直线方向移动一段距离，叫作（ ）'
      ]);
      explain = '在方格纸上把一个图形沿直线方向平移，平移前后对应线段互相平行，方格数相同。';
    } else {
      correct = '处处相等';
      prompt = U.pick([
        '两条平行线之间的垂直线段长度（ ）',
        who() + '量了两条平行线之间几处的距离，发现它们（ ）',
        '平行线之间的距离，量几处结果（ ）'
      ]);
      explain = '两条平行线之间的垂直线段长度处处相等，这个长度就是平行线间的距离。';
    }
    return q({
      topicId: 'g4a.u2.parallel', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['平行线', '垂线', '平移', '旋转', '处处相等', '越来越大', '越来越小', '相交线', '射线', '距离']),
      explain: explain
    });
  });

  /* 2.4 角的分类 */
  R('g4a.u2.classify', function (level) {
    var rule = '小于 90° 是锐角，等于 90° 是直角，大于 90° 小于 180° 是钝角，等于 180° 是平角，等于 360° 是周角。';
    var types = ['锐角', '直角', '钝角', '平角', '周角'];
    var m = gno();
    var canvasMode = Math.random() < 0.4;
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
      return q({
        topicId: 'g4a.u2.classify', level: level,
        prompt: U.pick([
          '第 ' + m + ' 组的' + who() + '量出图中这个角是 ' + deg + '°，它属于（ ）角',
          who() + '用量角器测得图中这个角为 ' + deg + '°，按角的分类它是：',
          '观察图中这个 ' + deg + '° 的角，它是（ ）角'
        ]),
        canvas: { kind: 'angle', deg: deg },
        correct: kind,
        wrongs: pick3(kind, types),
        explain: deg + '° 的角是' + kind + '。' + rule
      });
    }
    var kind2 = U.pick(['锐角', '直角', '钝角', '平角']);
    var d = degFor(kind2);
    var pool = [], tries = 0;
    while (pool.length < 28 && tries < 200) {
      var cand = U.randInt(1, 36) * 5;
      if (pool.indexOf(cand) === -1 && cand !== d) pool.push(cand);
      tries++;
    }
    return q({
      topicId: 'g4a.u2.classify', level: level,
      prompt: U.pick([
        '第 ' + m + ' 组测量，下面哪个度数表示一个' + kind2 + '？',
        who() + '在第 ' + m + ' 组要找一个' + kind2 + '，下面哪个度数合适？',
        '下面各度数中，属于' + kind2 + '的是哪一个？（第 ' + m + ' 小组）',
        '一个' + kind2 + '的度数可能是下面哪个？'
      ]),
      correct: d + '°',
      wrongs: pick3(d + '°', pool.map(function (x) { return x + '°'; })),
      explain: kind2 + '的范围：' + (kind2 === '锐角' ? '小于 90°' : kind2 === '直角' ? '等于 90°' : kind2 === '钝角' ? '大于 90° 且小于 180°' : '等于 180°') + '，所以 ' + d + '° 是' + kind2 + '。' + rule
    });
  });

  /* 2.5 角的度量（量角器读数） */
  R('g4a.u2.protractor', function (level) {
    var deg = U.randInt(3, 33) * 5; /* 15 ~ 165 */
    var m = gno();
    var pool = [], tries = 0;
    while (pool.length < 14 && tries < 80) {
      var cand = U.randInt(1, 36) * 5;
      if (pool.indexOf(cand) === -1 && cand !== deg) pool.push(cand);
      tries++;
    }
    return q({
      topicId: 'g4a.u2.protractor', level: level,
      prompt: U.pick([
        '第 ' + m + ' 组的' + who() + '看量角器，这个角是多少度？',
        who() + '在第 ' + m + ' 组用量角器测量，图中这个角的度数是：',
        '第 ' + m + ' 组观察量角器，从 0° 刻度线到这个角是多少度？',
        '量角器上这条边所指的刻度是多少？第 ' + m + ' 组读出（ ）°',
        '第 ' + m + ' 组测量，下图量角器测得的角度数是：'
      ]),
      canvas: { kind: 'protractor', deg: deg },
      correct: deg,
      wrongs: pick3(deg, pool),
      explain: '量角器把半圆平均分成 180 份，每份是 1°。量角时角的顶点对准中心点，一条边对准 0° 刻度线，另一条边所指的刻度就是角的度数，这里是 ' + deg + '°。'
    });
  });

  /* 2.6 画角（步骤 + 三角尺拼角） */
  R('g4a.u2.draw', function (level) {
    var mode = U.pick(['step', 'tri']);
    var correct, prompt, explain;
    if (mode === 'step') {
      correct = '中心点';
      prompt = U.pick([
        '用量角器画角时，先画一条射线，再把量角器的（ ）与射线的端点重合',
        '画角的第一步：画一条射线，使量角器的中心和射线的（ ）重合',
        '用量角器画 60° 角，先画射线，再让量角器的中心点与射线的（ ）重合',
        '画角时，要把量角器的零刻度线与射线重合，还要把量角器的（ ）对准射线端点'
      ]);
      explain = '画角步骤：先画一条射线 → 量角器中心点与射线端点重合 → 零刻度线与射线重合 → 在对应刻度处描点 → 连线。';
    } else {
      /* 三角尺拼角：30/45/60/90 可拼出的角，答案唯一 */
      var combos = [
        { c: '105°', e: '60° + 45° = 105°' },
        { c: '15°', e: '45° − 30° = 15°' },
        { c: '75°', e: '45° + 30° = 75°' },
        { c: '120°', e: '90° + 30° = 120°' },
        { c: '135°', e: '90° + 45° = 135°' },
        { c: '150°', e: '90° + 60° = 150°' },
        { c: '180°', e: '90° + 90° = 180°' }
      ];
      var cb = U.pick(combos);
      correct = cb.c;
      prompt = U.pick([
        '用一副三角尺（有 30°、45°、60°、90°），不能直接画出、但可以拼出的角是（ ）',
        who() + '用一副三角尺拼角，下面哪个角是可以拼出来的？',
        '用一副三角尺，下面哪个度数的角能画出来？',
        '借助一副三角尺，可以拼出的角是（ ）'
      ]);
      explain = cb.e + '。一副三角尺本身有 30°、45°、60°、90°，再通过相加相减拼出其他角。';
    }
    return q({
      topicId: 'g4a.u2.draw', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['中心点', '零刻度线', '端点', '105°', '15°', '75°', '120°', '135°', '150°', '80°', '20°', '55°']),
      explain: explain
    });
  });

  /* ================= U3 整数乘法（二） ================= */

  /* 3.1 整十整百数的乘法 */
  R('g4a.u3.zero', function (level) {
    var mode = U.pick(['direct', 'derive', 'egg']);
    var correct, prompt, explain;
    if (mode === 'derive') {
      var base = U.pick([
        { a: 16, b: 3 }, { a: 23, b: 4 }, { a: 12, b: 4 }, { a: 32, b: 3 }, { a: 11, b: 5 }
      ]);
      var c = base.a * base.b;
      var forms = [
        { p: '根据 ' + base.a + ' × ' + base.b + ' = ' + c + '，' + base.a + ' × ' + (base.b * 10) + ' = （ ）', ans: c * 10, e: '一个因数不变，另一个因数乘 10，积也乘 10：' + c + ' × 10 = ' + (c * 10) + '。' },
        { p: '根据 ' + base.a + ' × ' + base.b + ' = ' + c + '，(' + base.a + ' × 10) × ' + base.b + ' = （ ）', ans: c * 10, e: '一个因数乘 10，另一个不变，积也乘 10：' + c * 10 + '。' },
        { p: '根据 ' + base.a + ' × ' + base.b + ' = ' + c + '，' + base.a + ' × ' + (base.b * 100) + ' = （ ）', ans: c * 100, e: '一个因数不变，另一个因数乘 100，积也乘 100：' + c * 100 + '。' },
        { p: '根据 ' + base.a + ' × ' + base.b + ' = ' + c + '，(' + base.a + ' × 10) × (' + base.b + ' × 10) = （ ）', ans: c * 100, e: '两个因数都乘 10，积乘 100：' + c * 100 + '。' }
      ];
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '想一想：' + f.p, '直接写出得数：' + f.p]);
      explain = f.e;
    } else if (mode === 'egg') {
      var eggs = U.pick([28, 32, 24, 18]);
      var plates = U.pick([10, 20, 30]);
      correct = eggs * plates;
      prompt = U.pick([
        '每盘装 ' + eggs + ' 个鸡蛋，' + plates + ' 盘能装多少个鸡蛋？',
        '超市每盘放 ' + eggs + ' 个鸡蛋，' + plates + ' 盘一共有多少个？',
        who() + '数鸡蛋：每盘 ' + eggs + ' 个，' + plates + ' 盘共多少个？'
      ]);
      explain = '每盘 ' + eggs + ' 个 × ' + plates + ' 盘 = ' + eggs + ' × ' + plates + ' = ' + correct + ' 个。' + eggs + ' 乘 ' + (plates / 10) + ' 个十，得 ' + correct / 10 + ' 个十。';
    } else {
      var a = U.pick([30, 120, 20, 40, 300]);
      var b = U.pick([20, 40, 30, 200]);
      correct = a * b;
      prompt = U.pick([
        a + ' × ' + b + ' = （ ）',
        '口算：' + a + ' × ' + b + ' = （ ）',
        a + ' 个十乘 ' + b / 10 + '，积是（ ）',
        '（ ）= ' + a + ' × ' + b
      ]);
      explain = a + ' × ' + b + '，先算 ' + (String(a).replace(/0+$/, '')) + ' × ' + (String(b).replace(/0+$/, '')) + '，再在末尾补上相应个数的 0，得 ' + correct + '。';
    }
    return q({
      topicId: 'g4a.u3.zero', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 10, correct - 10, correct + 100, correct - 100, correct / 10, correct * 10, correct + 1, correct + 50]),
      explain: explain
    });
  });

  /* 3.2 两位数乘两位数 */
  R('g4a.u3.mul2', function (level) {
    var a = U.pick([14, 21, 26, 13, 12, 15, 23, 18]);
    var b = U.pick([12, 23, 51, 17, 15, 32, 11, 24]);
    var ans = a * b;
    return q({
      topicId: 'g4a.u3.mul2', level: level,
      prompt: U.pick([
        a + ' × ' + b + ' = （ ）',
        '队列表演：每行 ' + a + ' 人，有 ' + b + ' 行，一共有多少人？',
        '用竖式算一算：' + a + ' × ' + b + ' = （ ）',
        a + ' 个 ' + b + ' 相加，和是（ ）',
        '（ ）= ' + a + ' × ' + b
      ]),
      correct: ans,
      wrongs: pick3(ans, [ans + a, ans + b, ans - a, ans + 10, ans - 10, ans + 100, ans + b * 10]),
      explain: '把 ' + a + ' 分成整十数和一位数分别乘 ' + b + '，再相加：' + a + ' × ' + b + ' = ' + ans + '。'
    });
  });

  /* 3.3 三位数乘两位数 */
  R('g4a.u3.mul3', function (level) {
    var a = U.pick([114, 135, 408, 312, 210, 240, 125, 208]);
    var b = U.pick([21, 74, 23, 47, 32, 16, 35, 42]);
    var ans = a * b;
    return q({
      topicId: 'g4a.u3.mul3', level: level,
      prompt: U.pick([
        a + ' × ' + b + ' = （ ）',
        '卫星每秒运行 ' + a + ' 千米，' + b + ' 秒运行多少千米？',
        '用竖式计算：' + a + ' × ' + b + ' = （ ）',
        '（ ）= ' + a + ' × ' + b,
        a + ' 乘 ' + b + '，积是（ ）'
      ]),
      correct: ans,
      wrongs: pick3(ans, [ans + a, ans - a, ans + b, Number(String(ans) + '0'), ans + 100, ans - 100, ans + 10]),
      explain: '先用 ' + a + ' 乘个位上的 ' + (b % 10) + '，再用 ' + a + ' 乘十位上的 ' + Math.floor(b / 10) + '（积末位与十位对齐），最后相加得 ' + ans + '。'
    });
  });

  /* 3.4 乘法的估算 */
  R('g4a.u3.est', function (level) {
    var a = U.pick([912, 110, 120, 220, 298, 403, 198, 302]);
    var b = U.pick([25, 20, 60, 30, 41, 19, 38, 59]);
    var ea = Math.round(a / 10) * 10;
    var eb = Math.round(b / 10) * 10;
    if (ea === 0) ea = a;
    var ans = ea * eb;
    return q({
      topicId: 'g4a.u3.est', level: level,
      prompt: U.pick([
        '估算：' + a + ' × ' + b + ' ≈ （ ）',
        '把因数看作整十数，估计 ' + a + ' × ' + b + ' 大约得多少？',
        '不计算，估计 ' + a + ' × ' + b + ' 的积约是（ ）',
        who() + '估一估：' + a + ' × ' + b + ' 大约是（ ）'
      ]),
      correct: ans,
      wrongs: pick3(ans, [ans + 100, ans - 100, ans + 1000, ans - 1000, a * b, ans + 50, ans - 50]),
      explain: '把 ' + a + ' 看作 ' + ea + '，把 ' + b + ' 看作 ' + eb + '，' + ea + ' × ' + eb + ' = ' + ans + '，所以 ' + a + ' × ' + b + ' ≈ ' + ans + '。'
    });
  });

  /* 3.5 有趣的算式 */
  R('g4a.u3.rule', function (level) {
    var mode = U.pick(['ones', 'nines', 'end5']);
    var correct, prompt, explain;
    if (mode === 'ones') {
      var k = U.pick([2, 3, 4]);
      var s = '';
      for (var i = 0; i < k; i++) s += '1';
      /* 11..1(k个) 的平方是 123..k..321 */
      var r = '';
      for (var j = 1; j <= k; j++) r += j;
      for (var j2 = k - 1; j2 >= 1; j2--) r += j2;
      correct = Number(r);
      prompt = U.pick([
        '已知 11 × 11 = 121，111 × 111 = 12321，那么 ' + s + ' × ' + s + ' = （ ）',
        '找规律：11×11=121，111×111=12321，' + s + '×' + s + ' = （ ）',
        '照样子，' + s + ' × ' + s + ' 的积是（ ）'
      ]);
      explain = '11…1（k 个 1）自乘，积是从 1 排到 ' + k + ' 再排回 1，即 ' + correct + '。';
    } else if (mode === 'nines') {
      var m = U.pick([2, 3, 4, 5]);
      var n = '';
      for (var i2 = 0; i2 < m; i2++) n += '9';
      /* 99..9(m个)^2 = (m-1个9) 8 (m-1个0) 1 */
      var head = '';
      for (var i3 = 0; i3 < m - 1; i3++) head += '9';
      var zeros = '';
      for (var i4 = 0; i4 < m - 1; i4++) zeros += '0';
      var r2 = Number(head + '8' + zeros + '1');
      correct = r2;
      prompt = U.pick([
        '已知 99 × 99 = 9801，999 × 999 = 998001，那么 ' + n + ' × ' + n + ' = （ ）',
        '找规律：99×99=9801，999×999=998001，' + n + '×' + n + ' = （ ）',
        '照样子，' + n + ' × ' + n + ' 的积是（ ）'
      ]);
      explain = '99…9（m 个 9）自乘，积前面是 ' + (m - 1) + ' 个 9，接着一个 8，再 ' + (m - 1) + ' 个 0，最后一个 1，即 ' + correct + '。';
    } else {
      var n5 = U.pick([15, 25, 35, 45, 55, 65, 75, 85]);
      var t = Math.floor(n5 / 10);
      correct = t * (t + 1) * 100 + 25;
      prompt = U.pick([
        '已知 15×15=225（=1×2×100+25），25×25=625（=2×3×100+25），那么 ' + n5 + ' × ' + n5 + ' = （ ）',
        '找规律：个位是 5 的两位数平方，' + n5 + '×' + n5 + ' = （ ）',
        '照样子：' + n5 + ' × ' + n5 + ' = （ ）'
      ]);
      explain = '个位是 5 的两位数平方：十位 t × (t+1) × 100 + 25。这里 t=' + t + '，得 ' + t + '×' + (t + 1) + '×100+25=' + correct + '。';
    }
    return q({
      topicId: 'g4a.u3.rule', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 100, correct - 100, correct + 1000, correct * 2, Math.floor(correct / 2)]),
      explain: explain
    });
  });

  /* ================= U4 我们生活的空间（二） ================= */

  /* 4.1 观察的范围 */
  R('g4a.u4.range', function (level) {
    var mode = U.pick(['sight', 'block', 'shadow', 'height']);
    var correct, prompt, explain;
    if (mode === 'sight') {
      correct = '直直的直线';
      prompt = U.pick([
        '我们观察物体时，视线可以看作（ ）',
        '司机从远到近看建筑物，视线是（ ），遇到障碍物就被挡住',
        '光线和视线都是（ ）传播的，不会拐弯',
        '小猴爬树看墙内的桃子，它的视线是（ ）'
      ]);
      explain = '视线不会拐弯，都是直直的直线；视线遇到障碍物就被挡住，这就是观察范围受限制的原因。';
    } else if (mode === 'block') {
      correct = '被挡住看不见';
      prompt = U.pick([
        '客车越接近建筑物 A，建筑物 B 被挡住的部分就越多，最后（ ）',
        '司机从位置①开到位置②，看不到建筑物 B 了，这是因为 B 被建筑物 A（ ）',
        '障碍物挡住视线时，障碍物后面的物体就（ ）'
      ]);
      explain = '视线是直线，中间有障碍物时，障碍物后面的物体就被挡住、看不见了。';
    } else if (mode === 'shadow') {
      correct = '越短';
      prompt = U.pick([
        '夜晚路灯下，同样高的杆子离路灯越近，它的影子就越（ ）',
        '杆子离路灯越远，影子越（ ）；离得越近，影子越（ ）',
        '晚上在路灯下走路，人离灯越近，地上的影子越（ ）'
      ]);
      explain = '同样高的杆子，离路灯越近影子越短，离路灯越远影子越长。';
    } else {
      correct = '越高';
      prompt = U.pick([
        '小猴想看到墙内所有的桃子，应该爬得更（ ）',
        '观察点越高，看到的范围越（ ）',
        '站得越高，看得越（ ），能看到的桃子越多'
      ]);
      explain = '观察点越高，视线越过障碍物后能看到的范围越大；爬得越高，看到的桃子越多。';
    }
    return q({
      topicId: 'g4a.u4.range', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['直直的直线', '会拐弯的曲线', '被挡住看不见', '越短', '越长', '越高', '越低', '越清楚', '越模糊']),
      explain: explain
    });
  });

  /* 4.2 从不同位置观察 */
  R('g4a.u4.view', function (level) {
    var mode = U.pick(['front', 'side', 'order', 'near']);
    var correct, prompt, explain;
    if (mode === 'front') {
      correct = '正面';
      prompt = U.pick([
        '在天安门广场，正对着人民英雄纪念碑和城楼拍的照片，是从（ ）拍的',
        '站在建筑物正前方拍到的照片，是从（ ）位置拍摄的',
        '图 a 里纪念碑和城楼都在画面正中、最“正”，这是从（ ）拍的'
      ]);
      explain = '正对着建筑物拍摄，拍到的是正面；从两侧拍会看到侧面，建筑物的左右关系会变化。';
    } else if (mode === 'side') {
      correct = '侧面';
      prompt = U.pick([
        '拍到纪念碑在左、城楼在右（或反过来）的照片，是从（ ）拍的',
        '从位置②或③拍到的不是正面，而是建筑物的（ ）',
        '站在建筑物的一侧拍照，看到的是它的（ ）'
      ]);
      explain = '从建筑物的一侧拍摄，拍到的是侧面；离得越“正”的位置，照片越接近正面。';
    } else if (mode === 'order') {
      correct = '先远后近、逐渐变大';
      prompt = U.pick([
        '乘船从远处向建筑物驶去，看到建筑物的先后感觉是（ ）',
        '游船从 A 点出发靠近小岛，照片里建筑物会（ ）',
        '从远处走向一幢大楼，看到的大楼会（ ）'
      ]);
      explain = '从远处靠近时，建筑物由小变大、由模糊变清楚；不同位置看到的建筑物之间的遮挡和左右顺序也会变化。';
    } else {
      correct = '变大';
      prompt = U.pick([
        '小明从 A 点走到 B 点再走向小屋，越靠近小屋，小屋在画面里越（ ）',
        '从远处走近物体，看到的物体影像会（ ）',
        '距离越近，看到的物体越（ ）'
      ]);
      explain = '距离物体越近，看到的物体越大；距离越远，看到的物体越小。';
    }
    return q({
      topicId: 'g4a.u4.view', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['正面', '侧面', '上面', '先远后近、逐渐变大', '先大后小', '变大', '变小', '不变']),
      explain: explain
    });
  });

  /* ================= U5 运算律 ================= */

  /* 5.1 混合运算顺序 */
  R('g4a.u5.order', function (level) {
    var forms = [
      { e: '先乘除后加减：85×3=255，100÷2=50，再 255+50=305。', p: '85 × 3 + 100 ÷ 2 = （ ）', ans: 305 },
      { e: '先算乘法：65×40=2600，再算除法 2600÷5=520，最后 35+520=555。', p: '35 + 65 × 40 ÷ 5 = （ ）', ans: 555 },
      { e: '先算小括号里的 153−83=70，再 12×70=840，最后 ÷8=105。', p: '12 × (153 − 83) ÷ 8 = （ ）', ans: 105 },
      { e: '先乘除后加减：207÷3=69，28×69=1932。', p: '28 × (207 ÷ 3) = （ ）', ans: 1932 },
      { e: '先除法后减法：176÷8=22，176−22=154。', p: '176 − 176 ÷ 8 = （ ）', ans: 154 }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.order', level: level,
      prompt: U.pick([f.p, '说一说运算顺序再计算：' + f.p, '计算：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 100, f.ans - 100, f.ans + 10, f.ans - 10, f.ans + 1, f.ans * 2]),
      explain: '在没有括号的算式里，先乘除后加减，同级从左到右；有小括号先算小括号。' + f.e
    });
  });

  /* 5.2 中括号 */
  R('g4a.u5.bracket', function (level) {
    var forms = [
      { p: '9 ÷ [3 × (5 − 2)] = （ ）', ans: 1, e: '先小括号 5−2=3，再中括号 3×3=9，最后 9÷9=1。' },
      { p: '12 × [(8 + 4) ÷ 2] = （ ）', ans: 72, e: '先小括号 8+4=12，再中括号 12÷2=6，最后 12×6=72。' },
      { p: '234 ÷ [(51 − 48) × 3] = （ ）', ans: 26, e: '先小括号 51−48=3，再中括号 3×3=9，最后 234÷9=26。' },
      { p: '48 ÷ [(12 − 8) × 2] = （ ）', ans: 6, e: '先小括号 12−8=4，再中括号 4×2=8，最后 48÷8=6。' },
      { p: '5 × [16 ÷ (7 − 3)] = （ ）', ans: 20, e: '先小括号 7−3=4，再中括号 16÷4=4，最后 5×4=20。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.bracket', level: level,
      prompt: U.pick([f.p, '先算小括号再算中括号：' + f.p, '计算：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans * 2, f.ans + 100]),
      explain: '既有小括号又有中括号时，先算小括号里的，再算中括号里的。' + f.e
    });
  });

  /* 5.3 加法交换律和结合律 */
  R('g4a.u5.add', function (level) {
    var mode = U.pick(['fill', 'quick', 'identify']);
    var correct, prompt, explain;
    if (mode === 'fill') {
      var forms = [
        { p: '45 + 76 = （ ） + 45', ans: '76', e: '加法交换律：a + b = b + a。' },
        { p: '25 + 13 + 87 = 25 + (（ ） + 87)', ans: '13', e: '加法结合律：先把后两个数凑成整百。' },
        { p: '19 + (62 + 38) = (19 + （ ）) + 38', ans: '62', e: '加法结合律：(a+b)+c=a+(b+c)。' },
        { p: '28 + 13 = 13 + （ ）', ans: '28', e: '加法交换律。' }
      ];
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '填一填：' + f.p]);
      explain = f.e;
    } else if (mode === 'quick') {
      var forms2 = [
        { p: '57 + 288 + 43 = （ ）', ans: 388, e: '57+43=100，再 100+288=388。' },
        { p: '88 + 156 + 44 = （ ）', ans: 288, e: '156+44=200，再 88+200=288。' },
        { p: '91 + 34 + 109 + 366 = （ ）', ans: 600, e: '91+109=200，34+366=400，合起来 600。' },
        { p: '28 + 69 + 172 = （ ）', ans: 269, e: '28+172=200，再 200+69=269。' }
      ];
      var f2 = U.pick(forms2);
      correct = f2.ans;
      prompt = U.pick([f2.p, '用简便方法计算：' + f2.p]);
      explain = '利用加法交换律和结合律凑整：' + f2.e;
    } else {
      correct = '加法交换律';
      prompt = U.pick([
        '45 + 76 = 76 + 45，这运用了（ ）',
        'a + b = b + a 表示的是（ ）',
        '358 + 276 = 276 + 358，交换两个加数的位置，这是（ ）'
      ]);
      explain = '两个数相加，交换加数的位置，和不变，这是加法交换律 a+b=b+a；三个数相加先算前两个或后两个，是加法结合律。';
    }
    return q({
      topicId: 'g4a.u5.add', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['76', '13', '62', '28', '388', '288', '600', '269', '加法交换律', '加法结合律', '乘法交换律', '乘法分配律']),
      explain: explain
    });
  });

  /* 5.4 减法性质 */
  R('g4a.u5.sub', function (level) {
    var mode = U.pick(['calc', 'identify']);
    var correct, prompt, explain;
    if (mode === 'calc') {
      var forms = [
        { p: '100 − 24 − 36 = （ ）', ans: 40, e: '100−24−36=100−(24+36)=100−60=40。' },
        { p: '200 − 56 − 44 = （ ）', ans: 100, e: '200−(56+44)=200−100=100。' },
        { p: '350 − 130 − 70 = （ ）', ans: 150, e: '350−(130+70)=350−200=150。' },
        { p: '妈妈带 100 元，买鱼花 24 元、买菜花 36 元，还剩（ ）元', ans: 40, e: '100−24−36=100−(24+36)=40。' }
      ];
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '用简便方法算：' + f.p]);
      explain = '一个数连续减去两个数，等于减去这两个数的和：a−b−c=a−(b+c)。' + f.e;
    } else {
      correct = '减法的性质';
      prompt = U.pick([
        '100 − 24 − 36 = 100 − (24 + 36)，这运用了（ ）',
        'a − b − c = a − (b + c) 表示的是（ ）',
        '从一个数里连续减去两个数，可以减去这两个数的和，这是（ ）'
      ]);
      explain = '一个数连续减去两个数，等于减去这两个减数的和，即 a−b−c=a−(b+c)，这是减法的性质。';
    }
    return q({
      topicId: 'g4a.u5.sub', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [40, 100, 150, '减法的性质', '加法结合律', '乘法结合律', '加法交换律']),
      explain: explain
    });
  });

  /* 5.5 乘法交换律和结合律 */
  R('g4a.u5.mul', function (level) {
    var mode = U.pick(['quick', 'identify', 'fill']);
    var correct, prompt, explain;
    if (mode === 'quick') {
      var forms = [
        { p: '9 × 125 × 8 = （ ）', ans: 9000, e: '125×8=1000，再 9×1000=9000。' },
        { p: '24 × 25 = （ ）', ans: 600, e: '24=6×4，4×25=100，6×100=600。' },
        { p: '38 × 25 × 4 = （ ）', ans: 3800, e: '25×4=100，38×100=3800。' },
        { p: '125 × 3 × 8 = （ ）', ans: 3000, e: '125×8=1000，1000×3=3000。' },
        { p: '(13 × 5) × 6 = （ ）', ans: 390, e: '5×6=30，13×30=390。' }
      ];
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '用简便方法计算：' + f.p]);
      explain = '利用乘法交换律和结合律凑整（如 25×4=100、125×8=1000）：' + f.e;
    } else if (mode === 'identify') {
      correct = '乘法结合律';
      prompt = U.pick([
        '(9 × 125) × 8 = 9 × (125 × 8)，这运用了（ ）',
        '(a × b) × c = a × (b × c) 表示的是（ ）',
        '三个数相乘，先算前两个或先算后两个，积不变，这是（ ）'
      ]);
      explain = '三个数相乘，先把前两个相乘或先把后两个相乘，积不变，这是乘法结合律 (a×b)×c=a×(b×c)。';
    } else {
      correct = '4';
      prompt = U.pick([
        '35 × 2 × 5 = 35 × (（ ） × 5)',
        '25 × 4 = 100，所以 24 × 25 = 6 × (（ ） × 25)',
        '(25 × 60) × 4 = 60 × (25 × （ ）) 运用了交换律和结合律'
      ]);
      explain = '看到 25 就想配 4（25×4=100），看到 125 就想配 8，这是乘法结合律的凑整技巧。';
    }
    return q({
      topicId: 'g4a.u5.mul', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [9000, 600, 3800, 3000, 390, '4', '乘法结合律', '乘法交换律', '乘法分配律', '加法结合律']),
      explain: explain
    });
  });

  /* 5.6 乘法分配律 */
  R('g4a.u5.dist', function (level) {
    var mode = U.pick(['calc', 'identify']);
    var correct, prompt, explain;
    if (mode === 'calc') {
      var forms = [
        { p: '(80 + 4) × 25 = （ ）', ans: 2100, e: '80×25 + 4×25 = 2000 + 100 = 2100。' },
        { p: '34 × 72 + 34 × 28 = （ ）', ans: 3400, e: '= 34 × (72+28) = 34×100 = 3400。' },
        { p: '(20 + 4) × 25 = （ ）', ans: 600, e: '20×25 + 4×25 = 500 + 100 = 600。' },
        { p: '19 × 66 + 81 × 66 = （ ）', ans: 6600, e: '= (19+81) × 66 = 100×66 = 6600。' },
        { p: '47 × 102 = （ ）', ans: 4794, e: '= 47×(100+2) = 4700 + 94 = 4794。' }
      ];
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '运用乘法分配律计算：' + f.p]);
      explain = '乘法分配律 (a+b)×c=a×c+b×c。' + f.e;
    } else {
      correct = '乘法分配律';
      prompt = U.pick([
        '(3 + 5) × 10 = 3 × 10 + 5 × 10，这运用了（ ）',
        '(a + b) × c = a × c + b × c 表示的是（ ）',
        '25 × 4 + 25 × 2 = 25 × (4 + 2)，这是（ ）'
      ]);
      explain = '两个数的和乘一个数，可以把它们分别乘这个数再相加，即 (a+b)×c=a×c+b×c，这是乘法分配律。';
    }
    return q({
      topicId: 'g4a.u5.dist', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [2100, 3400, 600, 6600, 4794, '乘法分配律', '乘法结合律', '加法结合律', '减法性质']),
      explain: explain
    });
  });

  /* 5.7 简便计算 */
  R('g4a.u5.simplify', function (level) {
    var forms = [
      { p: '88 + 156 + 44 = （ ）', ans: 288, e: '156+44=200，88+200=288。' },
      { p: '91 + 34 + 109 + 366 = （ ）', ans: 600, e: '91+109=200，34+366=400，共 600。' },
      { p: '38 × 25 × 4 = （ ）', ans: 3800, e: '25×4=100，38×100=3800。' },
      { p: '125 × 3 × 8 = （ ）', ans: 3000, e: '125×8=1000，1000×3=3000。' },
      { p: '(13 × 5) × 6 = （ ）', ans: 390, e: '5×6=30，13×30=390。' },
      { p: '35 × 28 = （ ）', ans: 980, e: '28=4×7，35×4=140，140×7=980。' },
      { p: '25 × 125 × 32 = （ ）', ans: 100000, e: '32=4×8，25×4=100，125×8=1000，100×1000=100000。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.simplify', level: level,
      prompt: U.pick([f.p, '观察特点，用简便方法计算：' + f.p, '怎样简便就怎样算：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, Math.floor(f.ans / 2), f.ans * 2]),
      explain: '综合运用加法、乘法的运算律凑整。' + f.e
    });
  });

  /* 5.8 数图形的学问 */
  R('g4a.u5.count', function (level) {
    var n = U.randInt(3, 8);
    var ans = n * (n - 1) / 2;
    var mode = U.pick(['hole', 'station', 'point']);
    var prompt, explain;
    if (mode === 'hole') {
      prompt = U.pick([
        '有 ' + n + ' 个洞口，任选一个进、再任选一个出（只向前走不回头），一共有（ ）条不同路线',
        '鼹鼠钻洞，' + n + ' 个洞口连成一条线，不同的路线一共有（ ）条',
        '把 ' + n + ' 个洞口看成 ' + n + ' 个点，连成的线段共有（ ）条'
      ]);
      explain = n + ' 个点连成线段，数线段要按顺序不重不漏：(n−1)+(n−2)+…+1 = ' + (n - 1) + '+…+1 = ' + ans + ' 条。';
    } else if (mode === 'station') {
      prompt = U.pick([
        '一条线路上有 ' + n + ' 个车站，单程需要准备（ ）种不同的车票',
        n + ' 个车站之间，往返路线里单程车票一共有（ ）种',
        '把 ' + n + ' 个车站看作 ' + n + ' 个点，单程车票种类等于线段数，是（ ）种'
      ]);
      explain = n + ' 个车站的单程车票数 = 线段数 = ' + (n - 1) + '+' + (n - 2) + '+…+1 = ' + ans + ' 种。';
    } else {
      prompt = U.pick([
        '一条直线上有 ' + n + ' 个点，这些点一共可以连成（ ）条线段',
        '平面上 ' + n + ' 个点（在同一直线上），每两点连一条线段，共（ ）条',
        'n 个点连成线段，当 n=' + n + ' 时，线段数是（ ）'
      ]);
      explain = 'n 个点连成线段数 = n(n−1)/2 = ' + n + '×' + (n - 1) + '÷2 = ' + ans + ' 条。';
    }
    return q({
      topicId: 'g4a.u5.count', level: level,
      prompt: prompt, correct: ans,
      wrongs: pick3(ans, [ans + 1, ans - 1, ans + n, ans - n, ans * 2, n, n * 2, ans + 3]),
      explain: explain
    });
  });

  /* ================= U6 图形的奥秘 ================= */

  /* 6.1 切开立体图形 */
  R('g4a.u6.slice', function (level) {
    var mode = U.pick(['cylH', 'cylV', 'cone', 'cuboid']);
    var correct, prompt, explain;
    if (mode === 'cylH') {
      correct = '圆形';
      prompt = U.pick([
        '把一个圆柱横着切开（平行于底面），切开后看到的面是（ ）',
        '在圆柱形杯子里装水，水面的形状是（ ）',
        '圆柱沿着与底面平行的方向切开，切面是（ ）'
      ]);
      explain = '圆柱横着（平行于底面）切开，切面是大小一样的圆形。';
    } else if (mode === 'cylV') {
      correct = '长方形';
      prompt = U.pick([
        '把一个圆柱竖着切开（沿着底面直径方向），切面是（ ）',
        '圆柱竖着切一刀，切开后看到的面是（ ）',
        '沿着圆柱的一条高把它切开，切面是（ ）'
      ]);
      explain = '圆柱竖着切（垂直于底面），切面是长方形。';
    } else if (mode === 'cone') {
      correct = '圆形';
      prompt = U.pick([
        '把一个圆锥横着切开（平行于底面），切开后的面是（ ）',
        '圆锥靠近底面处横着切一刀，切面的形状是（ ）',
        '圆锥平行于底面切开，切面是（ ）'
      ]);
      explain = '圆锥横着（平行于底面）切开，切面是圆形，越靠近顶点圆越小。';
    } else {
      correct = '长方形';
      prompt = U.pick([
        '把一个长方体切一刀，切面可能是正方形或（ ）',
        '沿着一个面的方向切长方体，切面通常是长方形或（ ）',
        '长方体切开后，看到的面不可能是下面的（ ）（选长方形类）'
      ]);
      explain = '长方体切开后的面可能是长方形或正方形；圆柱横切是圆、竖切是长方形。';
    }
    return q({
      topicId: 'g4a.u6.slice', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['圆形', '长方形', '三角形', '正方形', '椭圆形', '梯形', '扇形']),
      explain: explain
    });
  });

  /* 6.2 搭建立体大楼（数正方体） */
  R('g4a.u6.blocks', function (level) {
    /* 自写方块生成：随机选若干底面格，按高度堆叠，保证总数已知 */
    var total = level >= 3 ? U.randInt(6, 10) : U.randInt(4, 8);
    var cells = U.shuffle([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [0, 2]]).slice(0, Math.min(U.randInt(2, 4), total));
    var heights = cells.map(function () { return 1; });
    var left = total - cells.length;
    var guard = 0;
    while (left > 0 && guard++ < 60) {
      var i = U.randInt(0, cells.length - 1);
      if (heights[i] < 3) { heights[i]++; left--; }
    }
    var cubes = [];
    cells.forEach(function (c, i) {
      for (var z = 0; z < heights[i]; z++) cubes.push({ x: c[0], y: c[1], z: z });
    });
    var baseCount = cells.length;
    return q({
      topicId: 'g4a.u6.blocks', level: level,
      prompt: U.pick([
        '下面的立体大楼由（ ）个小正方体搭成',
        who() + '照两层图纸搭大楼，图中一共用了（ ）个小正方体',
        '先数最下面一层，再看上面，这个立体大楼一共有（ ）个正方体',
        '数一数图中的立体大楼，共有（ ）个小正方体'
      ]),
      canvas: { kind: 'blocks', cubes: cubes },
      correct: cubes.length,
      wrongs: pick3(cubes.length, [cubes.length + 1, cubes.length - 1, cubes.length + 2, cubes.length - 2, cubes.length + 3, baseCount, cubes.length + baseCount]),
      explain: '先数最下面一层有 ' + baseCount + ' 个，再看上面被挡住叠起来的正方体，一共 ' + cubes.length + ' 个。'
    });
  });

  /* 6.3 翻滚正方体 */
  R('g4a.u6.roll', function (level) {
    var k = U.pick([1, 2, 3]);
    var ans = 2 + 4 * (k - 1);
    return q({
      topicId: 'g4a.u6.roll', level: level,
      prompt: U.pick([
        '正方体从起点开始在带子上翻滚，蓝色面第 ' + k + ' 次朝上时，落在数字（ ）上',
        who() + '发现正方体每翻 4 次蓝色面才朝上一次。第 1 次落在 2，那么第 ' + k + ' 次蓝色面朝上落在数字（ ）',
        '蓝色面朝上的位置依次是 2、6、10……第 ' + k + ' 次蓝色面朝上落在数字（ ）',
        '正方体翻滚一圈（4 格）蓝色面朝上一次，第 ' + k + ' 次蓝色面经过的数字是（ ）'
      ]),
      correct: ans,
      wrongs: pick3(ans, [ans + 1, ans - 1, ans + 2, ans - 2, ans + 4, ans - 4, ans + 10, 1, 3, 4]),
      explain: '正方体每翻 4 次蓝色面才重新朝上（一圈），所以蓝色面朝上落在 2、6、10、14……每次加 4。第 ' + k + ' 次落在 ' + ans + '。'
    });
  });

  /* ================= U7 运用数量关系解决问题 ================= */

  /* 7.1 总量与分量 */
  R('g4a.u7.total', function (level) {
    var mode = U.pick(['sum', 'minus']);
    var correct, prompt, explain;
    if (mode === 'sum') {
      var p1 = U.randInt(20, 120), p2 = U.randInt(20, 120), p3 = U.randInt(20, 120);
      correct = p1 + p2 + p3;
      prompt = U.pick([
        '美术馆上午参观 ' + p1 + ' 人、下午参观 ' + p2 + ' 人，傍晚又来 ' + p3 + ' 人，全天共（ ）人',
        '乐器组有 ' + p1 + ' 人，舞蹈组 ' + p2 + ' 人，合唱组 ' + p3 + ' 人，三个组一共（ ）人',
        '一段路分三段，分别长 ' + p1 + ' 米、' + p2 + ' 米、' + p3 + ' 米，这段路全长（ ）米',
        '学校男生 ' + p1 + ' 人、女生 ' + p2 + ' 人、老师 ' + p3 + ' 人，全校共（ ）人'
      ]);
      explain = '总量 = 分量 + 分量：' + p1 + ' + ' + p2 + ' + ' + p3 + ' = ' + correct + '。';
    } else {
      var total = U.randInt(200, 900);
      var part = U.randInt(50, total - 50);
      correct = total - part;
      prompt = U.pick([
        '美术馆第一周共接待 ' + total + ' 人，其中双休日 ' + part + ' 人，平日参观（ ）人',
        '一段路全长 ' + total + ' 米，已经走了 ' + part + ' 米，还剩（ ）米',
        '图书角共有 ' + total + ' 本书，其中故事书 ' + part + ' 本，其余是科技书，科技书有（ ）本'
      ]);
      explain = '分量 = 总量 − 分量：' + total + ' − ' + part + ' = ' + correct + '。减法是加法的逆运算。';
    }
    return q({
      topicId: 'g4a.u7.total', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 10, correct - 10, correct + 100, correct - 100, correct + 1, Math.abs(correct - 20)]),
      explain: explain
    });
  });

  /* 7.2 单价、数量与总价 */
  R('g4a.u7.price', function (level) {
    var mode = U.pick(['total', 'price', 'count']);
    var correct, prompt, explain;
    if (mode === 'total') {
      var price = U.pick([2, 3, 4, 5, 8, 12]);
      var num = U.randInt(3, 12);
      correct = price * num;
      prompt = U.pick([
        '矿泉水每瓶 ' + price + ' 元，买 ' + num + ' 瓶一共多少元？',
        '苹果每千克 ' + price + ' 元，妈妈买了 ' + num + ' 千克，应付多少元？',
        '笔记本每本 ' + price + ' 元，' + who() + '买了 ' + num + ' 本，共多少元？'
      ]);
      explain = '总价 = 单价 × 数量 = ' + price + ' × ' + num + ' = ' + correct + ' 元。';
    } else if (mode === 'price') {
      var tot = U.pick([12, 20, 24, 36, 48]);
      var n2 = U.pick([3, 4, 6, 8]);
      correct = tot / n2;
      prompt = U.pick([
        '买 ' + n2 + ' 盒酸奶共花 ' + tot + ' 元，每盒酸奶多少元？',
        tot + ' 元买了 ' + n2 + ' 本同样的书，每本多少元？',
        '购物小票：' + n2 + ' 件商品共 ' + tot + ' 元，平均每件（ ）元'
      ]);
      explain = '单价 = 总价 ÷ 数量 = ' + tot + ' ÷ ' + n2 + ' = ' + correct + ' 元。';
    } else {
      var tot2 = U.pick([12, 20, 24, 30, 36, 48]);
      var p2 = U.pick([2, 3, 4, 5, 6]);
      correct = tot2 / p2;
      prompt = U.pick([
        '每袋牛奶 ' + p2 + ' 元，' + tot2 + ' 元可以买几袋？',
        '圆珠笔每支 ' + p2 + ' 元，' + tot2 + ' 元能买多少支？',
        '总价 ' + tot2 + ' 元，单价 ' + p2 + ' 元，数量是（ ）'
      ]);
      explain = '数量 = 总价 ÷ 单价 = ' + tot2 + ' ÷ ' + p2 + ' = ' + correct + '。';
    }
    return q({
      topicId: 'g4a.u7.price', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct * 2, Math.abs(correct - 5)]),
      explain: explain
    });
  });

  /* 7.3 速度、时间与路程 */
  R('g4a.u7.speed', function (level) {
    var mode = U.pick(['dist', 'time', 'speed']);
    var correct, prompt, explain;
    if (mode === 'dist') {
      var sp = U.pick([60, 70, 80, 2, 18, 90]);
      var ti = U.pick([4, 5, 10, 6, 3]);
      correct = sp * ti;
      prompt = U.pick([
        '每分钟走 ' + sp + ' 米，走 ' + ti + ' 分钟，走了多少米？',
        '猎豹每分钟约跑 ' + sp + ' 千米，' + ti + ' 分钟能跑多少千米？',
        '运动员每秒滑行 ' + sp + ' 米，' + ti + ' 秒滑多少米？',
        '汽车每小时行 ' + sp + ' 千米，' + ti + ' 小时行多少千米？'
      ]);
      explain = '路程 = 速度 × 时间 = ' + sp + ' × ' + ti + ' = ' + correct + '。';
    } else if (mode === 'time') {
      var sp2 = U.pick([60, 70, 80]);
      var di2 = sp2 * U.pick([2, 3, 4, 5]);
      correct = di2 / sp2;
      prompt = U.pick([
        '从学校到少年宫 ' + di2 + ' 米，每分钟走 ' + sp2 + ' 米，需要走几分钟？',
        '甲、乙两地 ' + di2 + ' 千米，汽车每小时行 ' + sp2 + ' 千米，几小时到达？'
      ]);
      explain = '时间 = 路程 ÷ 速度 = ' + di2 + ' ÷ ' + sp2 + ' = ' + correct + '。';
    } else {
      var di3 = U.pick([120, 240, 360, 480]);
      var ti3 = U.pick([2, 3, 4, 6]);
      correct = di3 / ti3;
      prompt = U.pick([
        '一辆车 ' + ti3 + ' 小时行了 ' + di3 + ' 千米，平均每小时行多少千米？',
        '' + di3 + ' 米的路程用 ' + ti3 + ' 分钟走完，每分钟走多少米？'
      ]);
      explain = '速度 = 路程 ÷ 时间 = ' + di3 + ' ÷ ' + ti3 + ' = ' + correct + '。';
    }
    return q({
      topicId: 'g4a.u7.speed', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct * 2, Math.abs(correct - 5)]),
      explain: explain
    });
  });

  /* 7.4 相遇问题 */
  R('g4a.u7.meet', function (level) {
    var forms = [
      { p: '瓜蔓每日向下 5 寸，葫芦蔓每日向上 10 寸，墙高 90 寸，两蔓几日相遇？', ans: 6, e: '每天共爬 5+10=15 寸，90÷15=6 日。' },
      { p: '笑笑每分走 40 米，淘气每分走 60 米，两人同时从相距 800 米的两地相向而行，几分相遇？', ans: 8, e: '速度和 40+60=100 米/分，800÷100=8 分。' },
      { p: '两地相距 600 米，甲每分走 70 米、乙每分走 50 米，两人同时相向出发，几分相遇？', ans: 5, e: '速度和 70+50=120，600÷120=5 分。' },
      { p: '两列火车相距 900 千米，同时相向开出，一列每小时 100 千米、另一列每小时 80 千米，几小时相遇？', ans: 5, e: '速度和 100+80=180，900÷180=5 小时。' }
    ];
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u7.meet', level: level,
      prompt: U.pick([f.p, '想一想，列综合算式：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 2, f.ans * 2, f.ans + 5, Math.abs(f.ans - 2)]),
      explain: '相向而行同时出发，相遇时间 = 路程 ÷ 速度和。' + f.e
    });
  });

  /* ================= U8 数据的表示和分析（一） ================= */

  var BARTYPES = [
    ['春季', '夏季', '秋季', '冬季'],
    ['洗袜子', '洗碗', '擦桌子', '扫地'],
    ['中国', '贝宁', '埃及', '土耳其', '尼日利亚'],
    ['少儿', '动漫', '体育', '电影', '军事'],
    ['一月', '二月', '三月', '四月', '五月'],
    ['一班', '二班', '三班', '四班']
  ];
  var BARTITLES = ['同学生日季节统计', '家务劳动情况', '棉花生长期统计', '最喜欢的节目', '各月销量', '各班图书角数量'];
  function makeBars(count, maxVal) {
    var full = U.pick(BARTYPES);
    var cats = full.slice(0, Math.min(count, full.length));
    var vals = [];
    while (vals.length < cats.length) {
      var v = U.randInt(5, maxVal);
      if (vals.indexOf(v) === -1) vals.push(v);
    }
    return { cats: cats, vals: vals, title: U.pick(BARTITLES) };
  }

  /* 8.1 读条形统计图 */
  R('g4a.u8.read', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 45);
    var idx = U.randInt(0, d.cats.length - 1);
    var ans = d.vals[idx];
    var others = d.vals.filter(function (_, i) { return i !== idx; });
    while (others.length < 3) others.push(others[0] + 1);
    return q({
      topicId: 'g4a.u8.read', level: level,
      prompt: U.pick([
        '根据统计图（' + d.title + '），' + d.cats[idx] + '有多少？',
        who() + '看了下面的统计图，' + d.cats[idx] + '对应的数量是多少？',
        '从条形图中读出：' + d.cats[idx] + '这一项是多少？',
        d.title + '里，' + d.cats[idx] + '这根直条表示多少？'
      ]),
      canvas: { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' },
      correct: ans,
      wrongs: pick3(ans, others.concat([ans + 1, ans - 1, ans + 5])),
      explain: '看 ' + d.cats[idx] + ' 对应的直条，顶端对准的刻度是 ' + ans + '。'
    });
  });

  /* 8.2 统计图中的比较 */
  R('g4a.u8.compare', function (level) {
    var d = makeBars(level >= 3 ? 5 : 4, 50);
    var max = Math.max.apply(null, d.vals);
    var min = Math.min.apply(null, d.vals);
    var sum = d.vals.reduce(function (a, b) { return a + b; }, 0);
    var mi = d.vals.indexOf(max);
    var ni = d.vals.indexOf(min);
    var canvas = { kind: 'bar-chart', categories: d.cats, values: d.vals, unit: '人' };
    var mode = U.pick(['max', 'min', 'diff', 'total']);
    if (mode === 'max') {
      return q({
        topicId: 'g4a.u8.compare', level: level,
        prompt: U.pick([
          who() + '看统计图（' + d.title + '），' + d.cats.join('、') + ' 里数量最多的是哪一个？',
          d.cats.join('、') + ' 中（' + d.title + '），直条最高、数量最多的是哪一项？'
        ]),
        canvas: canvas, correct: d.cats[mi],
        wrongs: pick3(d.cats[mi], d.cats.filter(function (_, i) { return i !== mi; }).concat(['一样多', '无法确定'])),
        explain: '直条最高的 ' + d.cats[mi] + ' 数量最多，是 ' + max + '。'
      });
    }
    if (mode === 'min') {
      return q({
        topicId: 'g4a.u8.compare', level: level,
        prompt: U.pick([
          who() + '看统计图（' + d.title + '），' + d.cats.join('、') + ' 里数量最少的是哪一个？',
          d.cats.join('、') + ' 中（' + d.title + '），直条最矮、数量最少的是哪一项？'
        ]),
        canvas: canvas, correct: d.cats[ni],
        wrongs: pick3(d.cats[ni], d.cats.filter(function (_, i) { return i !== ni; }).concat(['一样多', '无法确定'])),
        explain: '直条最矮的 ' + d.cats[ni] + ' 数量最少，是 ' + min + '。'
      });
    }
    if (mode === 'total') {
      return q({
        topicId: 'g4a.u8.compare', level: level,
        prompt: U.pick([
          who() + '把统计图（' + d.title + '）中各项相加，' + d.cats.join('、') + ' 一共是多少？',
          d.cats.join('、') + ' 合起来一共是多少？（' + d.title + '）'
        ]),
        canvas: canvas, correct: sum,
        wrongs: pick3(sum, [sum + 5, sum - 5, sum + 10, max, sum + 1]),
        explain: '把各项相加：' + d.vals.join(' + ') + ' = ' + sum + '。'
      });
    }
    return q({
      topicId: 'g4a.u8.compare', level: level,
      prompt: U.pick([
        who() + '看统计图（' + d.title + '），最多的一项比最少的一项多多少？',
        d.cats[mi] + ' 比 ' + d.cats[ni] + ' 多多少？（' + d.title + '）'
      ]),
      canvas: canvas, correct: max - min,
      wrongs: pick3(max - min, [max, min, max + min, max - min + 1, max - min + 5]),
      explain: '最多 ' + max + '，最少 ' + min + '，相差 ' + max + ' − ' + min + ' = ' + (max - min) + '。'
    });
  });

  /* 8.3 1 格表示多少 */
  R('g4a.u8.scale', function (level) {
    var per = U.pick([2, 3, 4, 5, 10, 100]);
    var cells = U.randInt(3, 12);
    var ans = per * cells;
    return q({
      topicId: 'g4a.u8.scale', level: level,
      prompt: U.pick([
        '第 ' + gno() + ' 组画的条形图，纵轴每格表示 ' + per + '，一个直条高 ' + cells + ' 格，表示多少？',
        who() + '统计时纵轴每格代表 ' + per + '，' + cells + ' 格高的直条表示（ ）',
        '统计图中每格是 ' + per + '，一个直条高 ' + cells + ' 格，它对应的数量是多少？',
        '纵轴用 ' + cells + ' 格表示一个数量，每格 ' + per + '，这个数量是（ ）'
      ]),
      correct: ans,
      wrongs: pick3(ans, [cells, per, ans + per, ans - per, per * (cells + 1), per * (cells - 1), ans + 10, ans - 10]),
      explain: '每格表示 ' + per + '，' + cells + ' 格就是 ' + per + ' × ' + cells + ' = ' + ans + '。'
    });
  });

  /* 8.4 数据的分段整理 */
  R('g4a.u8.group', function (level) {
    /* 生成一组年龄/身高数据，问落在某段的个数 */
    var ages = [];
    var g = 0;
    while (ages.length < 20 && g++ < 100) {
      var v = U.randInt(40, 89);
      ages.push(v);
    }
    var seg = U.pick([[40, 49], [50, 59], [60, 69], [70, 79], [80, 89]]);
    var lo = seg[0], hi = seg[1];
    var count = ages.filter(function (a) { return a >= lo && a <= hi; }).length;
    while (count === 0 || count === ages.length) {
      v = U.randInt(40, 89);
      ages[U.randInt(0, ages.length - 1)] = v;
      count = ages.filter(function (a) { return a >= lo && a <= hi; }).length;
    }
    return q({
      topicId: 'g4a.u8.group', level: level,
      prompt: U.pick([
        '下面是 20 位获奖科学家获奖时的年龄（岁）：' + ages.join('、') + '。其中年龄在 ' + lo + '~' + hi + ' 岁的有（ ）人',
        who() + '把下面这组年龄分段整理：' + ages.join('、') + '，落在 ' + lo + '~' + hi + ' 这一段的有（ ）人',
        '这组数据 ' + ages.join('、') + ' 中，' + lo + ' 到 ' + hi + ' 之间的数共有（ ）个'
      ]),
      correct: count,
      wrongs: pick3(count, [count + 1, count - 1, count + 2, count - 2, count + 3, 20 - count, count + 5]),
      explain: '逐个看哪些数满足 ' + lo + ' ≤ 年龄 ≤ ' + hi + '，数出一共有 ' + count + ' 个。'
    });
  });

})(typeof window !== 'undefined' ? window : globalThis);
