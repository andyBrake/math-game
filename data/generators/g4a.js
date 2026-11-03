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
        { word: '十万位', val: '几个十万', e: '十万位上的数字表示几个十万。' },
        { word: '百万位', val: '几个百万', e: '百万位上的数字表示几个百万。' },
        { word: '千位', val: '几个千', e: '千位上的数字表示几个千。' }
      ]);
      var dig = U.randInt(1, 9);
      correct = pos.val;
      prompt = U.pick([
        '一个数的' + pos.word + '上是 ' + dig + '，表示（ ）',
        who() + '在' + pos.word + '拨了 ' + dig + ' 个珠子，表示（ ）',
        '数位顺序表中，' + pos.word + '上的数字表示（ ）',
        '在' + pos.word + '上写 ' + dig + '，它表示（ ）',
        '8' + dig + '… 这个数里，' + pos.word + '上的 ' + dig + ' 表示（ ）'
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
    var mode = U.pick(['len', 'birth', 'gender', 'zip', 'region']);
    var correct, prompt, explain;
    if (mode === 'len') {
      correct = '18 位';
      prompt = U.pick([
        '我国第二代身份证号码由（ ）位数字组成',
        '每个公民唯一的、终身不变的身份代码，身份证号码有（ ）位',
        who() + '的身份证号码共有（ ）个数字',
        '身份证号码是 18 位编码，它一共包含（ ）位',
        '现在使用的第二代居民身份证，号码一共是（ ）位',
        '身份证号码是每个公民唯一的身份代码，它由（ ）位组成'
      ]);
      explain = '身份证号码由 18 位数字组成，是每个公民唯一的身份代码。';
    } else if (mode === 'birth') {
      correct = '出生日期';
      prompt = U.pick([
        '身份证号码中第 7~14 位数字表示（ ）',
        '身份证号码里，从第 7 位开始的 8 位是一个人的（ ）',
        '某人身份证号第 7~14 位是 20100512，这表示他的（ ）是 2010 年 5 月 12 日',
        '身份证编码的第 7 到 14 位用来记录（ ）',
        '身份证号里 8 位生日码，排在校验码前面的是（ ）码',
        '身份证号第 7 位起连续 8 位，表示持证人的（ ）'
      ]);
      explain = '身份证号码第 7~14 位是出生日期码，共 8 位（年月日）。';
    } else if (mode === 'gender') {
      correct = U.pick(['男', '女']);
      if (correct === '男') {
        var d1 = U.pick([1, 3, 5, 7, 9]);
        prompt = U.pick([
          '身份证号码第 17 位是奇数（1、3、5、7、9），表示这是（ ）',
          '某人身份证第 17 位是 ' + d1 + '，根据编码规则，他是（ ）',
          '一位同学身份证第 17 位是 ' + d1 + '，按规则这位同学是（ ）'
        ]);
      } else {
        var d2 = U.pick([0, 2, 4, 6, 8]);
        prompt = U.pick([
          '身份证第 17 位如果是偶数表示女，那么第 17 位是 ' + d2 + '，表示这是（ ）',
          '某人身份证第 17 位是 ' + d2 + '，根据编码规则，她是（ ）'
        ]);
      }
      explain = '身份证第 17 位：1、3、5、7、9 表示男，0、2、4、6、8 表示女。';
    } else if (mode === 'zip') {
      correct = '6 位';
      prompt = U.pick([
        '我国邮政编码由（ ）位数字组成',
        '寄信时填写的邮政编码是（ ）位编码',
        '信封左上角填写的邮政编码共有（ ）位',
        '邮政编码是投递邮件的专用编码，它有（ ）位'
      ]);
      explain = '邮政编码由 6 位数字组成，前两位表示省，后面依次表示邮区、县、投递局。';
    } else {
      correct = '地址码';
      prompt = U.pick([
        '身份证号码前 6 位表示出生地的省、市、区（县），这一部分叫（ ）',
        '身份证号最前面的 6 位数字记录的是持证人的（ ）'
      ]);
      explain = '身份证号码前 6 位是地址码，依次表示省、市、区（县）。';
    }
    return q({
      topicId: 'g4a.u1.code', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['15 位', '16 位', '17 位', '18 位', '6 位', '9 位', '男', '女', '出生日期', '地址码', '家庭住址', '班级', '身高']),
      explain: explain
    });
  });

  /* ================= U2 线与角 ================= */

  /* 2.1 线段、射线与直线 */
  R('g4a.u2.line', function (level) {
    var mode = U.pick(['seg', 'ray', 'line', 'shortest', 'count']);
    var correct, prompt, explain;
    var n = 0;
    if (mode === 'seg') {
      correct = '2 个';
      prompt = U.pick([
        '线段有（ ）个端点',
        who() + '画了一条可以量出长度的线，它有（ ）个端点',
        '下面关于线段的说法：线段有（ ）个端点',
        '一条拉直的线绳，看作线段，它有（ ）个端点',
        '课桌的一条边可以看作一条线段，它有（ ）个端点',
        '数学书封面的一条边是线段，它有（ ）个端点',
        '线段 AB 有（ ）个端点',
        '下面说法正确的是：线段有（ ）个端点'
      ]);
      explain = '线段有 2 个端点，有一定长度，可以度量。';
    } else if (mode === 'ray') {
      correct = '1 个';
      prompt = U.pick([
        '射线有（ ）个端点',
        '手电筒射出去的光可以看作射线，它有（ ）个端点',
        '从一点出发向一个方向无限延伸的线，有（ ）个端点',
        '射线 AB 只有（ ）个端点',
        '探照灯射出的光线可以看作射线，它有（ ）个端点',
        '汽车车灯射出的灯光，可看作射线，它有（ ）个端点'
      ]);
      explain = '射线有 1 个端点，可以向一个方向无限延伸。';
    } else if (mode === 'line') {
      correct = '0 个';
      prompt = U.pick([
        '直线有（ ）个端点',
        '没有端点、可以向两端无限延伸的线叫做直线，它有（ ）个端点',
        '直线 AB 或直线 BA，它有（ ）个端点',
        '一条（ ）端点的线，可以向两个方向无限延伸',
        '笔直的铁轨向两端无限延伸，可看作直线，它有（ ）个端点',
        '直线比射线长，这句话对吗？其实直线有（ ）个端点'
      ]);
      explain = '直线没有端点，可以向两个方向无限延伸。';
    } else if (mode === 'shortest') {
      correct = '线段';
      prompt = U.pick([
        '两点之间所有连线中，（ ）最短',
        '从老虎山到狐狸洞，把路线描一描，最短的是（ ）',
        'A、B 两点之间的连线，最短的那条是（ ）',
        '连接两点的线中，长度最短的是（ ），它的长度就是两点间的距离',
        '从家到学校有几条路可走，最近的那条是（ ）'
      ]);
      explain = '两点之间所有连线中线段最短；线段 AB 的长度就是 A、B 两点之间的距离。';
    } else {
      /* 一条直线上 n 个点可数出几条线段/射线 */
      n = U.randInt(3, 5);
      correct = n * (n - 1) / 2 + ' 条';
      prompt = U.pick([
        '一条直线上有 ' + n + ' 个点，这些点一共可以连成（ ）条线段',
        '在一条直线上点 ' + n + ' 个点，数一数共有（ ）条线段'
      ]);
      explain = n + ' 个点连成线段数 = n(n−1)/2 = ' + n + '×' + (n - 1) + '÷2 = ' + (n * (n - 1) / 2) + ' 条。';
    }
    var extraWrongs = (mode === 'count') ? [n * (n - 1) / 2 + 1 + ' 条', n * (n - 1) / 2 - 1 + ' 条', n * (n - 1) + ' 条', n + ' 条'] : [];
    return q({
      topicId: 'g4a.u2.line', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['2 个', '1 个', '0 个', '3 个', '无数个', '线段', '射线', '直线', '曲线', '折线'].concat(extraWrongs)),
      explain: explain
    });
  });

  /* 2.2 相交与垂直（扩充问法） */
  R('g4a.u2.vertical', function (level) {
    var mode = U.pick(['perp', 'short', 'cross', 'angle']);
    var correct, prompt, explain;
    if (mode === 'perp') {
      correct = '互相垂直';
      prompt = U.pick([
        '当两条直线相交成直角时，这两条直线（ ）',
        who() + '画的两条直线相交成 90°，它们的位置关系是（ ）',
        '两条直线相交成直角，就说这两条直线（ ）',
        '剪刀张开成直角、红十字的两条线，都（ ）',
        '黑板相邻的两条边所在的直线是（ ）的',
        '课桌面的长和宽所在的两条直线相交成直角，它们（ ）',
        '正方形相邻的两条边所在的直线是（ ）的'
      ]);
      explain = '两条直线相交成直角时，这两条直线互相垂直，其中一条是另一条的垂线。';
    } else if (mode === 'short') {
      correct = '垂直线段';
      prompt = U.pick([
        '从直线外一点到这条直线所画的各条线段中，（ ）最短',
        '机灵狗去河边喝水，从它所在位置到河边，最短的路线是（ ）',
        '点到直线的所有连线中最短的是（ ）',
        '从一点向直线连线，量一量，最短的那条是（ ）',
        '从直线外一点到这条直线所画的线段中，最短的那条的长度叫点到直线的（ ）',
        '从点 A 向已知直线画线段，其中最短的是（ ）'
      ]);
      explain = '从直线外一点到这条直线所画的线段中，垂直线段最短，它的长度叫做点到直线的距离。';
    } else if (mode === 'cross') {
      correct = '相交';
      prompt = U.pick([
        '两条直线延长后会碰到一起，就说这两条直线（ ）',
        '剪刀张开的两条边所在的直线是（ ）的',
        '下面每组中的两条直线延长后会碰到一起，它们是（ ）的',
        '两条直线有一个公共点，这两条直线（ ）',
        '十字路口两条路所在的直线是（ ）的'
      ]);
      explain = '如果两条直线延长后会有一个公共点，就说这两条直线相交。';
    } else {
      /* 两条直线相交成直角时，所成的角是多少度 */
      correct = '90°';
      var m = gno();
      prompt = U.pick([
        '第 ' + m + ' 组画的两条直线互相垂直，它们相交所成的角是（ ）',
        '两条直线相交成直角，这个直角是（ ）度',
        '互相垂直的两条直线，相交所成的角都是（ ）'
      ]);
      explain = '两条直线互相垂直时，相交所成的四个角都是直角，即 90°。';
    }
    return q({
      topicId: 'g4a.u2.vertical', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['互相垂直', '互相平行', '垂直线段', '斜线', '相交', '重合', '射线', '距离', '平行线', '90°', '45°', '180°', '360°']),
      explain: explain
    });
  });

  /* 2.3 平移与平行（扩充问法） */
  R('g4a.u2.parallel', function (level) {
    var mode = U.pick(['def', 'move', 'dist', 'count']);
    var correct, prompt, explain;
    var steps = 0;
    if (mode === 'def') {
      correct = '平行线';
      prompt = U.pick([
        '在同一平面内不相交的两条直线叫做（ ）',
        '同一平面内永不相交的两条直线，它们是（ ）',
        who() + '在方格纸上画了两条延长后也不相交的直线，这两条是（ ）',
        '在同一平面内，（ ）的两条直线互相平行',
        '斑马线的两条长边所在的直线是（ ）'
      ]);
      explain = '在同一平面内不相交的两条直线互相平行，这两条直线叫做平行线。';
    } else if (mode === 'move') {
      correct = '平移';
      prompt = U.pick([
        '用三角板沿着直尺移动画出两条平行线，这个过程是（ ）',
        '方格纸上一个图形上下左右移动，形状方向不变，这种运动叫（ ）',
        '铅笔在直尺边沿一条直线移动，画出的两条线互相平行，靠的是（ ）',
        '把一个图形沿着直线方向移动一段距离，叫作（ ）',
        '电梯上下移动、缆车沿索道移动，都是（ ）现象'
      ]);
      explain = '在方格纸上把一个图形沿直线方向平移，平移前后对应线段互相平行，方格数相同。';
    } else if (mode === 'dist') {
      correct = '处处相等';
      prompt = U.pick([
        '两条平行线之间的垂直线段长度（ ）',
        who() + '量了两条平行线之间几处的距离，发现它们（ ）',
        '平行线之间的距离，量几处结果（ ）',
        '两条平行线之间可以画无数条垂直线段，这些垂直线段的长度（ ）'
      ]);
      explain = '两条平行线之间的垂直线段长度处处相等，这个长度就是平行线间的距离。';
    } else {
      /* 平移几格 */
      steps = U.randInt(2, 8);
      correct = steps + ' 格';
      prompt = U.pick([
        '方格纸上一个图形向左平移后，对应点之间相隔 ' + steps + ' 格，它平移了（ ）',
        who() + '把一个三角形在方格纸上向下平移，对应点向下数了 ' + steps + ' 格，它平移了（ ）'
      ]);
      explain = '平移几格看对应点：对应点之间相隔几格，图形就平移了几格。';
    }
    var extraWrongs = (mode === 'count') ? [(steps + 1) + ' 格', (steps - 1) + ' 格', (steps * 2) + ' 格'] : [];
    return q({
      topicId: 'g4a.u2.parallel', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['平行线', '垂线', '平移', '旋转', '处处相等', '越来越大', '越来越小', '相交线', '射线', '距离'].concat(extraWrongs)),
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

  /* 2.6 画角（步骤 + 三角尺拼角，扩充组合与问法） */
  R('g4a.u2.draw', function (level) {
    var mode = U.pick(['step', 'step2', 'tri']);
    var correct, prompt, explain;
    if (mode === 'step') {
      correct = '中心点';
      prompt = U.pick([
        '用量角器画角时，先画一条射线，再把量角器的（ ）与射线的端点重合',
        '画角的第一步：画一条射线，使量角器的中心和射线的（ ）重合',
        '用量角器画 60° 角，先画射线，再让量角器的中心点与射线的（ ）重合',
        '画角时，要把量角器的零刻度线与射线重合，还要把量角器的（ ）对准射线端点',
        who() + '画角时犯了个错：量角器中心没对准端点，应该把量角器的（ ）与端点重合',
        '画角时，量角器的半圆中心要对准射线的（ ），这个中心又叫（ ）',
        '先画射线 OA，再把量角器放在射线上，量角器的（ ）要和点 O 重合'
      ]);
      explain = '画角步骤：先画一条射线 → 量角器中心点与射线端点重合 → 零刻度线与射线重合 → 在对应刻度处描点 → 连线。';
    } else if (mode === 'step2') {
      correct = '零刻度线';
      prompt = U.pick([
        '用量角器画角时，中心点对准端点后，还要把量角器的（ ）与射线重合',
        '画角的第二步：使量角器的（ ）和已经画好的那条射线重合',
        '画角时，量角器中心点对准端点后，接着要让（ ）与射线重合',
        '量角器上有内圈和外圈两圈刻度，画角时要看与射线重合的那条（ ）',
        '画 75° 角时，中心点对好端点后，把量角器的（ ）与射线重合，再找 75° 刻度'
      ]);
      explain = '画角步骤：中心点对端点 → 零刻度线对射线 → 在对应刻度处点一个点 → 连线成角。';
    } else {
      /* 三角尺拼角：30/45/60/90 可拼出的角，答案唯一 */
      var combos = [
        { c: '105°', e: '60° + 45° = 105°', expr: '60° + 45°' },
        { c: '15°', e: '45° − 30° = 15°', expr: '45° − 30°' },
        { c: '75°', e: '45° + 30° = 75°', expr: '45° + 30°' },
        { c: '120°', e: '90° + 30° = 120°', expr: '90° + 30°' },
        { c: '135°', e: '90° + 45° = 135°', expr: '90° + 45°' },
        { c: '150°', e: '90° + 60° = 150°', expr: '90° + 60°' },
        { c: '180°', e: '90° + 90° = 180°', expr: '90° + 90°' },
        { c: '165°', e: '90° + 45° + 30° = 165°', expr: '90° + 45° + 30°' }
      ];
      var cb = U.pick(combos);
      correct = cb.c;
      prompt = U.pick([
        '用一副三角尺（有 30°、45°、60°、90°），不能直接画出、但可以拼出的角是（ ）',
        who() + '用一副三角尺拼角，下面哪个角是可以拼出来的？',
        '用一副三角尺，下面哪个度数的角能画出来？',
        '借助一副三角尺，可以拼出的角是（ ）',
        cb.expr + ' = （ ）（用一副三角尺拼）',
        '用三角尺拼一拼，' + cb.expr + ' 等于（ ）',
        who() + '拼出了 ' + cb.expr + '，这个角是（ ）°'
      ]);
      explain = cb.e + '。一副三角尺本身有 30°、45°、60°、90°，再通过相加相减拼出其他角。';
    }
    return q({
      topicId: 'g4a.u2.draw', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['中心点', '零刻度线', '端点', '105°', '15°', '75°', '120°', '135°', '150°', '165°', '80°', '20°', '55°', '40°']),
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

  /* 3.5 有趣的算式（扩充规律模式） */
  R('g4a.u3.rule', function (level) {
    var mode = U.pick(['ones', 'nines', 'end5', 'three', 'eight']);
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
        '照样子，' + s + ' × ' + s + ' 的积是（ ）',
        who() + '发现 11…1 自乘的规律，请你算出 ' + s + ' × ' + s + ' = （ ）'
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
    } else if (mode === 'three') {
      /* 3×4=12, 33×34=1122, 333×334=111222 */
      var t3 = U.pick([2, 3, 4]);
      var a3 = '', b3 = '';
      for (var i5 = 0; i5 < t3; i5++) a3 += '3';
      b3 = a3 + '4';
      var ansStr = '';
      for (var i6 = 0; i6 < t3; i6++) ansStr += '1';
      for (var i7 = 0; i7 < t3; i7++) ansStr += '2';
      correct = Number(ansStr);
      prompt = U.pick([
        '已知 3 × 4 = 12，33 × 34 = 1122，那么 ' + a3 + ' × ' + b3 + ' = （ ）',
        '找规律：3×4=12，33×34=1122，' + a3 + '×' + b3 + ' = （ ）',
        '照样子，' + a3 + ' × ' + b3 + ' 的积是（ ）'
      ]);
      explain = t3 + ' 个 3 乘 ' + t3 + ' 个 3 加 4，积是 ' + t3 + ' 个 1 接 ' + t3 + ' 个 2，即 ' + correct + '。';
    } else if (mode === 'eight') {
      /* 1×8+1=9, 12×8+2=98, 123×8+3=987 */
      var t8 = U.pick([3, 4, 5]);
      var seq = '';
      for (var i8 = 1; i8 <= t8; i8++) seq += i8;
      var ans8 = '';
      for (var d8 = 9; d8 >= 9 - t8 + 1; d8--) ans8 += d8;
      correct = Number(ans8);
      prompt = U.pick([
        '已知 1×8+1=9，12×8+2=98，123×8+3=987，那么 ' + seq + ' × 8 + ' + t8 + ' = （ ）',
        '找规律：1×8+1=9，12×8+2=98，' + seq + '×8+' + t8 + ' = （ ）',
        '照样子，' + seq + ' × 8 + ' + t8 + ' 的结果是（ ）'
      ]);
      explain = seq + '×8+' + t8 + ' 的积从 9 起往下排 ' + t8 + ' 个数字，即 ' + correct + '。';
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
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 100, correct - 100, correct + 1000, correct * 2, Math.floor(correct / 2), correct + 10]),
      explain: explain
    });
  });

  /* ================= U4 我们生活的空间（二） ================= */

  /* 4.1 观察的范围（扩充问法） */
  R('g4a.u4.range', function (level) {
    var mode = U.pick(['sight', 'block', 'shadow', 'height', 'near']);
    var correct, prompt, explain;
    if (mode === 'sight') {
      correct = '直直的直线';
      prompt = U.pick([
        '我们观察物体时，视线可以看作（ ）',
        '司机从远到近看建筑物，视线是（ ），遇到障碍物就被挡住',
        '光线和视线都是（ ）传播的，不会拐弯',
        '小猴爬树看墙内的桃子，它的视线是（ ）',
        who() + '说“视线会拐弯”，对吗？其实视线是（ ）',
        '路灯的光和人的视线，传播路线都是（ ）',
        '舞台追光灯射出的光，和我们的视线一样，都是（ ）'
      ]);
      explain = '视线不会拐弯，都是直直的直线；视线遇到障碍物就被挡住，这就是观察范围受限制的原因。';
    } else if (mode === 'block') {
      correct = '被挡住看不见';
      prompt = U.pick([
        '客车越接近建筑物 A，建筑物 B 被挡住的部分就越多，最后（ ）',
        '司机从位置①开到位置②，看不到建筑物 B 了，这是因为 B 被建筑物 A（ ）',
        '障碍物挡住视线时，障碍物后面的物体就（ ）',
        who() + '躲在墙后面，墙前面的人就看不到他了，这是因为他被墙（ ）',
        '站在大树后面，大树会把后面的小花（ ）',
        '公交车开到广告牌后面时，广告牌后面的景物就（ ）'
      ]);
      explain = '视线是直线，中间有障碍物时，障碍物后面的物体就被挡住、看不见了。';
    } else if (mode === 'shadow') {
      correct = '越短';
      prompt = U.pick([
        '夜晚路灯下，同样高的杆子离路灯越近，它的影子就越（ ）',
        '杆子离路灯越远，影子越（ ）；离得越近，影子越（ ）',
        '晚上在路灯下走路，人离灯越近，地上的影子越（ ）',
        '同一时刻，同样高的树，离路灯越近的那棵影子越（ ）',
        '人从路灯正下方走远，影子会越来越（ ）'
      ]);
      explain = '同样高的杆子，离路灯越近影子越短，离路灯越远影子越长。';
    } else if (mode === 'height') {
      correct = '越高';
      prompt = U.pick([
        '小猴想看到墙内所有的桃子，应该爬得更（ ）',
        '观察点越高，看到的范围越（ ）',
        '站得越高，看得越（ ），能看到的桃子越多',
        who() + '站在凳子上看讲台下，比站在地上看得更（ ）',
        '登得越高，看到的远处越（ ）'
      ]);
      explain = '观察点越高，视线越过障碍物后能看到的范围越大；爬得越高，看到的桃子越多。';
    } else {
      correct = '越大';
      prompt = U.pick([
        '从远处靠近一座高楼，楼在视野里会越来越（ ）',
        '观察点离物体越近，看到的物体影像越（ ）',
        '离物体越近，看到的范围越小，但物体本身显得越（ ）',
        '把玩具车从远处推到眼前，它在视野里会越来越（ ）'
      ]);
      explain = '距离物体越近，看到的物体影像越大；距离越远，看到的物体越小。';
    }
    return q({
      topicId: 'g4a.u4.range', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['直直的直线', '会拐弯的曲线', '被挡住看不见', '越短', '越长', '越高', '越低', '越清楚', '越模糊', '越大', '越小']),
      explain: explain
    });
  });

  /* 4.2 从不同位置观察（扩充问法与模式） */
  R('g4a.u4.view', function (level) {
    var mode = U.pick(['front', 'side', 'back', 'order', 'near', 'above']);
    var correct, prompt, explain;
    if (mode === 'front') {
      correct = '正面';
      prompt = U.pick([
        '在天安门广场，正对着人民英雄纪念碑和城楼拍的照片，是从（ ）拍的',
        '站在建筑物正前方拍到的照片，是从（ ）位置拍摄的',
        '图 a 里纪念碑和城楼都在画面正中、最“正”，这是从（ ）拍的',
        who() + '站在房子正前方拍照，拍到的是房子的（ ）',
        '从正对着物体的方向看，看到的是物体的（ ）',
        '拍到的照片里门窗都在正中、左右对称，这是从（ ）拍的'
      ]);
      explain = '正对着建筑物拍摄，拍到的是正面；从两侧拍会看到侧面，建筑物的左右关系会变化。';
    } else if (mode === 'side') {
      correct = '侧面';
      prompt = U.pick([
        '拍到纪念碑在左、城楼在右（或反过来）的照片，是从（ ）拍的',
        '从位置②或③拍到的不是正面，而是建筑物的（ ）',
        '站在建筑物的一侧拍照，看到的是它的（ ）',
        who() + '绕到房子东边去拍，拍到的是房子的（ ）',
        '从物体的左（右）边看过去，看到的是物体的（ ）'
      ]);
      explain = '从建筑物的一侧拍摄，拍到的是侧面；离得越“正”的位置，照片越接近正面。';
    } else if (mode === 'back') {
      correct = '后面';
      prompt = U.pick([
        '绕到建筑物背后去拍，拍到的是建筑物的（ ）',
        who() + '站在房子背后拍照，拍到的是房子的（ ）',
        '从物体的背面看过去，看到的是物体的（ ）'
      ]);
      explain = '站在物体背后拍摄，拍到的是后面；后面和正面看到的左右关系是反的。';
    } else if (mode === 'order') {
      correct = '先远后近、逐渐变大';
      prompt = U.pick([
        '乘船从远处向建筑物驶去，看到建筑物的先后感觉是（ ）',
        '游船从 A 点出发靠近小岛，照片里建筑物会（ ）',
        '从远处走向一幢大楼，看到的大楼会（ ）',
        '汽车从远处开向一座雕像，雕像在视野里越来越（ ），这说明距离在变（ ）',
        who() + '从山脚一步步爬上山顶，山脚下的亭子在视野里会（ ）'
      ]);
      explain = '从远处靠近时，建筑物由小变大、由模糊变清楚；不同位置看到的建筑物之间的遮挡和左右顺序也会变化。';
    } else if (mode === 'near') {
      correct = '变大';
      prompt = U.pick([
        who() + '从 A 点走到 B 点再走向小屋，越靠近小屋，小屋在画面里越（ ）',
        '从远处走近物体，看到的物体影像会（ ）',
        '距离越近，看到的物体越（ ）',
        '把一个玩具从桌子一头慢慢推到眼前，它看起来会（ ）'
      ]);
      explain = '距离物体越近，看到的物体越大；距离越远，看到的物体越小。';
    } else {
      correct = '上面';
      prompt = U.pick([
        '从楼房的正上方往下看，看到的是楼房的（ ）',
        '直升机在建筑物正上方航拍，拍到的是建筑物的（ ）',
        '站在高处往下看一张桌子，看到的是桌子的（ ）'
      ]);
      explain = '从物体的正上方往下看，看到的是物体的上面（俯视图）。';
    }
    return q({
      topicId: 'g4a.u4.view', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['正面', '侧面', '上面', '后面', '先远后近、逐渐变大', '先大后小', '变大', '变小', '不变', '外面']),
      explain: explain
    });
  });

  /* ================= U5 运算律 ================= */

  /* 5.1 混合运算顺序（参数化） */
  R('g4a.u5.order', function (level) {
    var forms = [];
    /* 类型1：a × b + c ÷ d */
    var a = U.randInt(12, 40), b = U.randInt(2, 8);
    var d = U.randInt(2, 9);
    var c = d * U.randInt(5, 30);
    forms.push({ p: a + ' × ' + b + ' + ' + c + ' ÷ ' + d + ' = （ ）', ans: a * b + c / d, e: '先乘除后加减：' + a + '×' + b + '=' + (a * b) + '，' + c + '÷' + d + '=' + (c / d) + '，再 ' + (a * b) + '+' + (c / d) + '=' + (a * b + c / d) + '。' });
    /* 类型2：a + b × c ÷ d */
    var a2 = U.randInt(20, 80), b2 = U.randInt(12, 30);
    var d2 = U.pick([2, 5]);
    var c2 = d2 * U.randInt(10, 30);
    forms.push({ p: a2 + ' + ' + b2 + ' × ' + c2 + ' ÷ ' + d2 + ' = （ ）', ans: a2 + b2 * c2 / d2, e: '先算乘法：' + b2 + '×' + c2 + '=' + (b2 * c2) + '，再算除法 ' + (b2 * c2) + '÷' + d2 + '=' + (b2 * c2 / d2) + '，最后 ' + a2 + '+' + (b2 * c2 / d2) + '=' + (a2 + b2 * c2 / d2) + '。' });
    /* 类型3：a × (b − c) ÷ d，b>c */
    var c3 = U.randInt(20, 60), b3 = c3 + U.randInt(10, 60);
    var inner = b3 - c3;
    var d3 = U.randInt(2, 6);
    var a3 = d3 * U.randInt(2, 10);
    forms.push({ p: a3 + ' × (' + b3 + ' − ' + c3 + ') ÷ ' + d3 + ' = （ ）', ans: a3 * inner / d3, e: '先算小括号里的 ' + b3 + '−' + c3 + '=' + inner + '，再 ' + a3 + '×' + inner + '=' + (a3 * inner) + '，最后 ÷' + d3 + '=' + (a3 * inner / d3) + '。' });
    /* 类型4：a × (b ÷ d) */
    var b4 = U.pick([120, 150, 210, 240, 270]);
    var d4 = U.pick([2, 3, 5, 6]);
    while (b4 % d4 !== 0) b4 = U.pick([120, 150, 210, 240, 270]);
    var a4 = U.randInt(12, 30);
    forms.push({ p: a4 + ' × (' + b4 + ' ÷ ' + d4 + ') = （ ）', ans: a4 * (b4 / d4), e: '先算小括号 ' + b4 + '÷' + d4 + '=' + (b4 / d4) + '，再 ' + a4 + '×' + (b4 / d4) + '=' + (a4 * b4 / d4) + '。' });
    /* 类型5：a − a ÷ d */
    var d5 = U.pick([4, 5, 8, 6]);
    var a5 = d5 * U.randInt(20, 60);
    forms.push({ p: a5 + ' − ' + a5 + ' ÷ ' + d5 + ' = （ ）', ans: a5 - a5 / d5, e: '先除法后减法：' + a5 + '÷' + d5 + '=' + (a5 / d5) + '，' + a5 + '−' + (a5 / d5) + '=' + (a5 - a5 / d5) + '。' });
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.order', level: level,
      prompt: U.pick([f.p, '说一说运算顺序再计算：' + f.p, '计算：' + f.p, '先想运算顺序，再算：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 100, f.ans - 100, f.ans + 10, f.ans - 10, f.ans + 1, f.ans * 2, f.ans + 50, Math.floor(f.ans / 2)]),
      explain: '在没有括号的算式里，先乘除后加减，同级从左到右；有小括号先算小括号。' + f.e
    });
  });

  /* 5.2 中括号（参数化） */
  R('g4a.u5.bracket', function (level) {
    var forms = [];
    /* 类型1：a ÷ [b × (c − d)]，c>d，b*(c-d) 整除 a */
    var d1 = U.randInt(2, 5), c1 = d1 + U.randInt(1, 4);
    var inner1 = c1 - d1;
    var b1 = U.randInt(2, 6);
    var div1 = b1 * inner1;
    var q1 = U.randInt(2, 20);
    forms.push({ p: (div1 * q1) + ' ÷ [' + b1 + ' × (' + c1 + ' − ' + d1 + ')] = （ ）', ans: q1, e: '先小括号 ' + c1 + '−' + d1 + '=' + inner1 + '，再中括号 ' + b1 + '×' + inner1 + '=' + div1 + '，最后 ' + (div1 * q1) + '÷' + div1 + '=' + q1 + '。' });
    /* 类型2：a × [(b + c) ÷ d] */
    var b2 = U.randInt(5, 20), c2 = U.randInt(5, 20);
    var sum2 = b2 + c2;
    var d2 = U.pick([2, 3, 4]);
    while (sum2 % d2 !== 0) { b2 = U.randInt(5, 20); c2 = U.randInt(5, 20); sum2 = b2 + c2; }
    var a2 = U.randInt(3, 12);
    forms.push({ p: a2 + ' × [(' + b2 + ' + ' + c2 + ') ÷ ' + d2 + '] = （ ）', ans: a2 * (sum2 / d2), e: '先小括号 ' + b2 + '+' + c2 + '=' + sum2 + '，再中括号 ' + sum2 + '÷' + d2 + '=' + (sum2 / d2) + '，最后 ' + a2 + '×' + (sum2 / d2) + '=' + (a2 * sum2 / d2) + '。' });
    /* 类型3：a ÷ [(b − c) × d] */
    var c3 = U.randInt(3, 10), b3 = c3 + U.randInt(2, 6);
    var inner3 = b3 - c3;
    var d3 = U.randInt(2, 5);
    var div3 = inner3 * d3;
    var q3 = U.randInt(3, 15);
    forms.push({ p: (div3 * q3) + ' ÷ [(' + b3 + ' − ' + c3 + ') × ' + d3 + '] = （ ）', ans: q3, e: '先小括号 ' + b3 + '−' + c3 + '=' + inner3 + '，再中括号 ' + inner3 + '×' + d3 + '=' + div3 + '，最后 ' + (div3 * q3) + '÷' + div3 + '=' + q3 + '。' });
    /* 类型4：a × [b ÷ (c − d)] */
    var d4 = U.randInt(2, 5), c4 = d4 + U.randInt(1, 4);
    var inner4 = c4 - d4;
    var b4 = inner4 * U.randInt(2, 10);
    var a4 = U.randInt(3, 10);
    forms.push({ p: a4 + ' × [' + b4 + ' ÷ (' + c4 + ' − ' + d4 + ')] = （ ）', ans: a4 * (b4 / inner4), e: '先小括号 ' + c4 + '−' + d4 + '=' + inner4 + '，再中括号 ' + b4 + '÷' + inner4 + '=' + (b4 / inner4) + '，最后 ' + a4 + '×' + (b4 / inner4) + '=' + (a4 * b4 / inner4) + '。' });
    /* 类型5：[a + b] ÷ c 形式 */
    var a5 = U.randInt(10, 50) * 2, b5 = U.randInt(10, 50) * 2;
    var sum5 = a5 + b5;
    var c5 = U.pick([4, 5, 8]);
    while (sum5 % c5 !== 0) { a5 = U.randInt(10, 50) * 2; b5 = U.randInt(10, 50) * 2; sum5 = a5 + b5; }
    forms.push({ p: '[' + a5 + ' + ' + b5 + '] ÷ ' + c5 + ' = （ ）', ans: sum5 / c5, e: '先中括号 ' + a5 + '+' + b5 + '=' + sum5 + '，再 ' + sum5 + '÷' + c5 + '=' + (sum5 / c5) + '。' });
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.bracket', level: level,
      prompt: U.pick([f.p, '先算小括号再算中括号：' + f.p, '计算：' + f.p, '想一想运算顺序：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans * 2, f.ans + 100, Math.floor(f.ans / 2), f.ans + 5]),
      explain: '既有小括号又有中括号时，先算小括号里的，再算中括号里的。' + f.e
    });
  });

  /* 5.3 加法交换律和结合律（参数化） */
  R('g4a.u5.add', function (level) {
    var mode = U.pick(['fill', 'quick', 'identify']);
    var correct, prompt, explain;
    if (mode === 'fill') {
      var forms = [];
      /* a + b = ( ) + a 形式 */
      var fa = U.randInt(12, 99), fb = U.randInt(12, 99);
      forms.push({ p: fa + ' + ' + fb + ' = （ ） + ' + fa, ans: String(fb), e: '加法交换律：a + b = b + a。' });
      /* a + b + c = a + (( ) + c) 形式，b+c 凑整 */
      var b2 = U.randInt(12, 88), c2 = 100 - b2;
      var a2 = U.randInt(20, 200);
      forms.push({ p: a2 + ' + ' + b2 + ' + ' + c2 + ' = ' + a2 + ' + (（ ） + ' + c2 + ')', ans: String(b2), e: '加法结合律：先把后两个数凑成整百。' });
      /* a + (b + c) = (a + ( )) + c */
      var a3 = U.randInt(12, 99), b3 = U.randInt(12, 99), c3 = U.randInt(12, 99);
      forms.push({ p: a3 + ' + (' + b3 + ' + ' + c3 + ') = (' + a3 + ' + （ ）) + ' + c3, ans: String(b3), e: '加法结合律：(a+b)+c=a+(b+c)。' });
      /* a + b = b + ( ) */
      var fa4 = U.randInt(12, 99), fb4 = U.randInt(12, 99);
      forms.push({ p: fa4 + ' + ' + fb4 + ' = ' + fb4 + ' + （ ）', ans: String(fa4), e: '加法交换律。' });
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '填一填：' + f.p, '在括号里填上合适的数：' + f.p]);
      explain = f.e;
    } else if (mode === 'quick') {
      var forms2 = [];
      /* a + b + c，其中 a+c=100 */
      var q1 = U.randInt(20, 80);
      var p1 = 100 - q1;
      var mid1 = U.randInt(100, 400);
      forms2.push({ p: p1 + ' + ' + mid1 + ' + ' + q1 + ' = （ ）', ans: mid1 + 100, e: p1 + '+' + q1 + '=100，再 100+' + mid1 + '=' + (mid1 + 100) + '。' });
      /* a+b+c+d 两组凑整 */
      var q2 = U.randInt(20, 80), p2 = 100 - q2;
      var q3 = U.randInt(20, 80), p3 = 100 - q3;
      forms2.push({ p: p2 + ' + ' + q2 + ' + ' + p3 + ' + ' + q3 + ' = （ ）', ans: 200, e: p2 + '+' + q2 + '=100，' + p3 + '+' + q3 + '=100，合起来 200。' });
      /* a+b+c 其中 b+c=200 */
      var b4 = U.randInt(80, 120), c4 = 200 - b4;
      var a4 = U.randInt(50, 200);
      forms2.push({ p: a4 + ' + ' + b4 + ' + ' + c4 + ' = （ ）', ans: a4 + 200, e: b4 + '+' + c4 + '=200，再 ' + a4 + '+200=' + (a4 + 200) + '。' });
      var f2 = U.pick(forms2);
      correct = f2.ans;
      prompt = U.pick([f2.p, '用简便方法计算：' + f2.p, '观察加数特点：' + f2.p]);
      explain = '利用加法交换律和结合律凑整：' + f2.e;
    } else {
      correct = U.pick(['加法交换律', '加法结合律']);
      if (correct === '加法交换律') {
        var g1 = U.randInt(100, 900), g2 = U.randInt(100, 900);
        prompt = U.pick([
          g1 + ' + ' + g2 + ' = ' + g2 + ' + ' + g1 + '，这运用了（ ）',
          'a + b = b + a 表示的是（ ）',
          who() + '交换两个加数的位置再算一遍，这是（ ）'
        ]);
        explain = '两个数相加，交换加数的位置，和不变，这是加法交换律 a+b=b+a。';
      } else {
        var h1 = U.randInt(10, 90), h2 = U.randInt(10, 90), h3 = U.randInt(10, 90);
        prompt = U.pick([
          '(' + h1 + ' + ' + h2 + ') + ' + h3 + ' = ' + h1 + ' + (' + h2 + ' + ' + h3 + ')，这运用了（ ）',
          '(a + b) + c = a + (b + c) 表示的是（ ）',
          '三个数相加，先把前两个或先把后两个相加，和不变，这是（ ）'
        ]);
        explain = '三个数相加，先把前两个相加或先把后两个相加，和不变，这是加法结合律 (a+b)+c=a+(b+c)。';
      }
    }
    return q({
      topicId: 'g4a.u5.add', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct, Number(correct) + 1, Number(correct) - 1, Number(correct) + 10, Number(correct) - 10, Number(correct) + 100, '加法交换律', '加法结合律', '乘法交换律', '乘法分配律', '乘法结合律'].filter(function (v) { return typeof v !== 'number' || v >= 0; })),
      explain: explain
    });
  });

  /* 5.4 减法性质（参数化凑整） */
  R('g4a.u5.sub', function (level) {
    var mode = U.pick(['calc', 'identify']);
    var correct, prompt, explain;
    if (mode === 'calc') {
      /* 让 b + c = 整百，便于用 a−(b+c) 简便算 */
      var round = U.pick([100, 200, 300]);
      var b = U.randInt(15, round - 15);
      var c = round - b;
      var T = round + U.pick([0, 100, 200, 300, 500]);
      var ans = T - round;
      var scenario = U.pick([
        { p: T + ' − ' + b + ' − ' + c + ' = （ ）', e: T + '−' + b + '−' + c + '=' + T + '−(' + b + '+' + c + ')=' + T + '−' + round + '=' + ans + '。' },
        { p: '妈妈带 ' + T + ' 元，买鱼花 ' + b + ' 元、买菜花 ' + c + ' 元，还剩（ ）元', e: T + '−' + b + '−' + c + '=' + T + '−(' + b + '+' + c + ')=' + ans + ' 元。' },
        { p: '一本 ' + T + ' 页的故事书，第一天读 ' + b + ' 页，第二天读 ' + c + ' 页，还剩（ ）页', e: T + '−' + b + '−' + c + '=' + T + '−' + round + '=' + ans + ' 页。' },
        { p: '仓库有 ' + T + ' 箱货物，上午运走 ' + b + ' 箱，下午运走 ' + c + ' 箱，还剩（ ）箱', e: T + '−' + b + '−' + c + '=' + ans + ' 箱。' }
      ]);
      correct = ans;
      prompt = U.pick([scenario.p, '用简便方法算：' + scenario.p]);
      explain = '一个数连续减去两个数，等于减去这两个数的和：a−b−c=a−(b+c)。' + scenario.e;
    } else {
      correct = '减法的性质';
      var a1 = U.randInt(100, 900);
      var b1 = U.randInt(20, 80);
      var c1 = U.randInt(20, 80);
      prompt = U.pick([
        a1 + ' − ' + b1 + ' − ' + c1 + ' = ' + a1 + ' − (' + b1 + ' + ' + c1 + ')，这运用了（ ）',
        'a − b − c = a − (b + c) 表示的是（ ）',
        '从一个数里连续减去两个数，可以减去这两个减数的和，这是（ ）',
        who() + '计算 ' + a1 + '−' + b1 + '−' + c1 + ' 时，先把两个减数加起来再减，这用了（ ）'
      ]);
      explain = '一个数连续减去两个数，等于减去这两个减数的和，即 a−b−c=a−(b+c)，这是减法的性质。';
    }
    return q({
      topicId: 'g4a.u5.sub', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct + 100, Math.floor(correct / 2), correct * 2, '减法的性质', '加法结合律', '乘法结合律', '加法交换律']),
      explain: explain
    });
  });

  /* 5.5 乘法交换律和结合律（参数化凑整） */
  R('g4a.u5.mul', function (level) {
    var mode = U.pick(['quick', 'identify', 'fill']);
    var correct, prompt, explain;
    if (mode === 'quick') {
      var forms = [];
      /* 125 × a × 8 → a × 1000 */
      var a1 = U.randInt(2, 15);
      forms.push({ p: '125 × ' + a1 + ' × 8 = （ ）', ans: a1 * 1000, e: '125×8=1000，再 ' + a1 + '×1000=' + (a1 * 1000) + '。' });
      /* a × 25 × 4 → a × 100 */
      var a2 = U.randInt(12, 50);
      forms.push({ p: a2 + ' × 25 × 4 = （ ）', ans: a2 * 100, e: '25×4=100，' + a2 + '×100=' + (a2 * 100) + '。' });
      /* 25 × a where a=4k */
      var k3 = U.randInt(3, 12);
      forms.push({ p: '25 × ' + (4 * k3) + ' = （ ）', ans: 25 * 4 * k3, e: (4 * k3) + '=4×' + k3 + '，25×4=100，100×' + k3 + '=' + (100 * k3) + '。' });
      /* (a × 5) × 6 → a × 30 */
      var a4 = U.randInt(11, 30);
      forms.push({ p: '(' + a4 + ' × 5) × 6 = （ ）', ans: a4 * 30, e: '5×6=30，' + a4 + '×30=' + (a4 * 30) + '。' });
      /* 50 × a × 2 → a × 100 */
      var a5 = U.randInt(12, 40);
      forms.push({ p: '50 × ' + a5 + ' × 2 = （ ）', ans: a5 * 100, e: '50×2=100，' + a5 + '×100=' + (a5 * 100) + '。' });
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '用简便方法计算：' + f.p, '观察特点，怎样简便就怎样算：' + f.p]);
      explain = '利用乘法交换律和结合律凑整（如 25×4=100、125×8=1000）：' + f.e;
    } else if (mode === 'identify') {
      correct = '乘法结合律';
      var a6 = U.randInt(2, 20), b6 = U.pick([25, 125, 50]), c6 = U.pick([4, 8, 2]);
      prompt = U.pick([
        '(' + a6 + ' × ' + b6 + ') × ' + c6 + ' = ' + a6 + ' × (' + b6 + ' × ' + c6 + ')，这运用了（ ）',
        '(a × b) × c = a × (b × c) 表示的是（ ）',
        '三个数相乘，先算前两个或先算后两个，积不变，这是（ ）',
        who() + '计算 ' + a6 + '×' + b6 + '×' + c6 + ' 时，先把后两个数乘起来，这用了（ ）'
      ]);
      explain = '三个数相乘，先把前两个相乘或先把后两个相乘，积不变，这是乘法结合律 (a×b)×c=a×(b×c)。';
    } else {
      /* fill 模式：答案与题干严格对应 */
      var fillMode = U.pick(['25', '125', '50']);
      if (fillMode === '25') {
        correct = '4';
        prompt = U.pick([
          '25 × 4 = 100，所以 24 × 25 = 6 × (（ ） × 25)',
          '(25 × 60) × 4 = 60 × (25 × （ ）) 运用了交换律和结合律',
          '36 × 25 = (9 × 4) × 25 = 9 × (（ ） × 25)'
        ]);
      } else if (fillMode === '125') {
        correct = '8';
        var m = U.randInt(3, 9);
        prompt = U.pick([
          '125 × ' + m + ' × 8 = ' + m + ' × (125 × （ ）)',
          '125 × 17 × 8 = 17 × (（ ） × 8)'
        ]);
      } else {
        correct = '2';
        prompt = U.pick([
          '50 × 17 × 2 = 17 × (50 × （ ）)',
          '35 × 2 × 5 = 35 × (（ ） × 5)'
        ]);
      }
      explain = '看到 25 就想配 4（25×4=100），看到 125 就想配 8，看到 50 就想配 2，这是乘法结合律的凑整技巧。';
    }
    return q({
      topicId: 'g4a.u5.mul', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct + 100, Math.floor(correct / 2), correct * 2, '4', '8', '2', '乘法结合律', '乘法交换律', '乘法分配律', '加法结合律']),
      explain: explain
    });
  });

  /* 5.6 乘法分配律（参数化） */
  R('g4a.u5.dist', function (level) {
    var mode = U.pick(['calc', 'identify']);
    var correct, prompt, explain;
    if (mode === 'calc') {
      var forms = [];
      /* (a+b) × 25 */
      var a1 = U.pick([20, 40, 60, 80]);
      var b1 = U.pick([4, 8, 12]);
      forms.push({ p: '(' + a1 + ' + ' + b1 + ') × 25 = （ ）', ans: (a1 + b1) * 25, e: a1 + '×25 + ' + b1 + '×25 = ' + (a1 * 25) + ' + ' + (b1 * 25) + ' = ' + ((a1 + b1) * 25) + '。' });
      /* a×b + a×c where b+c=100 */
      var a2 = U.randInt(12, 99);
      var b2 = U.randInt(20, 80);
      var c2 = 100 - b2;
      forms.push({ p: a2 + ' × ' + b2 + ' + ' + a2 + ' × ' + c2 + ' = （ ）', ans: a2 * 100, e: '= ' + a2 + ' × (' + b2 + '+' + c2 + ') = ' + a2 + '×100 = ' + (a2 * 100) + '。' });
      /* a × 102 = a×(100+2) */
      var a3 = U.randInt(12, 99);
      forms.push({ p: a3 + ' × 102 = （ ）', ans: a3 * 102, e: '= ' + a3 + '×(100+2) = ' + (a3 * 100) + ' + ' + (a3 * 2) + ' = ' + (a3 * 102) + '。' });
      /* a × 99 = a×(100-1) */
      var a4 = U.randInt(12, 99);
      forms.push({ p: a4 + ' × 99 = （ ）', ans: a4 * 99, e: '= ' + a4 + '×(100−1) = ' + (a4 * 100) + ' − ' + a4 + ' = ' + (a4 * 99) + '。' });
      /* (40+4)×25 经典 */
      var a5 = U.pick([40, 20, 80]);
      var b5 = U.pick([4, 8]);
      forms.push({ p: '(' + a5 + ' + ' + b5 + ') × 25 = （ ）', ans: (a5 + b5) * 25, e: a5 + '×25 + ' + b5 + '×25 = ' + (a5 * 25) + ' + ' + (b5 * 25) + ' = ' + ((a5 + b5) * 25) + '。' });
      var f = U.pick(forms);
      correct = f.ans;
      prompt = U.pick([f.p, '运用乘法分配律计算：' + f.p, '用简便方法算：' + f.p]);
      explain = '乘法分配律 (a+b)×c=a×c+b×c。' + f.e;
    } else {
      correct = '乘法分配律';
      var x1 = U.randInt(2, 9), y1 = U.randInt(2, 9), z1 = U.randInt(10, 30);
      prompt = U.pick([
        '(' + x1 + ' + ' + y1 + ') × ' + z1 + ' = ' + x1 + ' × ' + z1 + ' + ' + y1 + ' × ' + z1 + '，这运用了（ ）',
        '(a + b) × c = a × c + b × c 表示的是（ ）',
        '25 × 4 + 25 × 2 = 25 × (4 + 2)，这是（ ）',
        who() + '把 (a+b)×c 写成 a×c+b×c，这用了（ ）'
      ]);
      explain = '两个数的和乘一个数，可以把它们分别乘这个数再相加，即 (a+b)×c=a×c+b×c，这是乘法分配律。';
    }
    return q({
      topicId: 'g4a.u5.dist', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct + 100, Math.floor(correct / 2), correct * 2, '乘法分配律', '乘法结合律', '加法结合律', '减法性质']),
      explain: explain
    });
  });

  /* 5.7 简便计算（参数化综合凑整） */
  R('g4a.u5.simplify', function (level) {
    var forms = [];
    /* a + b + c 其中 b+c 凑整 */
    var q1 = U.randInt(20, 80), p1 = 100 - q1, mid1 = U.randInt(100, 400);
    forms.push({ p: mid1 + ' + ' + p1 + ' + ' + q1 + ' = （ ）', ans: mid1 + 100, e: p1 + '+' + q1 + '=100，' + mid1 + '+100=' + (mid1 + 100) + '。' });
    /* a × 25 × 4 */
    var a2 = U.randInt(12, 50);
    forms.push({ p: a2 + ' × 25 × 4 = （ ）', ans: a2 * 100, e: '25×4=100，' + a2 + '×100=' + (a2 * 100) + '。' });
    /* 125 × a × 8 */
    var a3 = U.randInt(2, 15);
    forms.push({ p: '125 × ' + a3 + ' × 8 = （ ）', ans: a3 * 1000, e: '125×8=1000，' + a3 + '×1000=' + (a3 * 1000) + '。' });
    /* (a × 5) × 6 */
    var a4 = U.randInt(11, 30);
    forms.push({ p: '(' + a4 + ' × 5) × 6 = （ ）', ans: a4 * 30, e: '5×6=30，' + a4 + '×30=' + (a4 * 30) + '。' });
    /* a × 28 = a × 4 × 7 */
    var a5 = U.randInt(15, 40);
    forms.push({ p: a5 + ' × 28 = （ ）', ans: a5 * 28, e: '28=4×7，' + a5 + '×4=' + (a5 * 4) + '，再 ' + (a5 * 4) + '×7=' + (a5 * 28) + '。' });
    /* 25 × 125 × 32 */
    forms.push({ p: '25 × 125 × 32 = （ ）', ans: 100000, e: '32=4×8，25×4=100，125×8=1000，100×1000=100000。' });
    /* a − b − c 其中 b+c 凑整 */
    var round7 = U.pick([100, 200]);
    var b7 = U.randInt(15, round7 - 15), c7 = round7 - b7;
    var T7 = round7 + U.pick([0, 100, 200, 300]);
    forms.push({ p: T7 + ' − ' + b7 + ' − ' + c7 + ' = （ ）', ans: T7 - round7, e: T7 + '−(' + b7 + '+' + c7 + ')=' + T7 + '−' + round7 + '=' + (T7 - round7) + '。' });
    /* a × 102 */
    var a8 = U.randInt(12, 99);
    forms.push({ p: a8 + ' × 102 = （ ）', ans: a8 * 102, e: '=' + a8 + '×(100+2)=' + (a8 * 100) + '+' + (a8 * 2) + '=' + (a8 * 102) + '。' });
    var f = U.pick(forms);
    return q({
      topicId: 'g4a.u5.simplify', level: level,
      prompt: U.pick([f.p, '观察特点，用简便方法计算：' + f.p, '怎样简便就怎样算：' + f.p, '用简便方法算：' + f.p]),
      correct: f.ans,
      wrongs: pick3(f.ans, [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, Math.floor(f.ans / 2), f.ans * 2, f.ans + 50]),
      explain: '综合运用加法、乘法的运算律凑整。' + f.e
    });
  });

  /* 5.8 数图形的学问（扩 n 范围与情境） */
  R('g4a.u5.count', function (level) {
    var n = level >= 3 ? U.randInt(4, 10) : U.randInt(3, 8);
    var ans = n * (n - 1) / 2;
    var mode = U.pick(['hole', 'station', 'point', 'handshake', 'tour']);
    var prompt, explain;
    if (mode === 'hole') {
      prompt = U.pick([
        '有 ' + n + ' 个洞口，任选一个进、再任选一个出（只向前走不回头），一共有（ ）条不同路线',
        '鼹鼠钻洞，' + n + ' 个洞口连成一条线，不同的路线一共有（ ）条',
        '把 ' + n + ' 个洞口看成 ' + n + ' 个点，连成的线段共有（ ）条',
        '机智狗钻 ' + n + ' 个连在一起的山洞，不同的进出路线共（ ）条'
      ]);
      explain = n + ' 个点连成线段，数线段要按顺序不重不漏：(n−1)+(n−2)+…+1 = ' + (n - 1) + '+…+1 = ' + ans + ' 条。';
    } else if (mode === 'station') {
      prompt = U.pick([
        '一条线路上有 ' + n + ' 个车站，单程需要准备（ ）种不同的车票',
        n + ' 个车站之间，往返路线里单程车票一共有（ ）种',
        '把 ' + n + ' 个车站看作 ' + n + ' 个点，单程车票种类等于线段数，是（ ）种',
        '高铁线路设了 ' + n + ' 个站，任意两站之间都要一种车票，单程共（ ）种'
      ]);
      explain = n + ' 个车站的单程车票数 = 线段数 = ' + (n - 1) + '+' + (n - 2) + '+…+1 = ' + ans + ' 种。';
    } else if (mode === 'handshake') {
      prompt = U.pick([
        n + ' 个小朋友见面，每两人握一次手，一共要握（ ）次',
        '聚会来了 ' + n + ' 位同学，每两人之间都要击一次掌，一共击掌（ ）次',
        n + ' 个球队进行单循环比赛（每两队赛一场），一共要赛（ ）场'
      ]);
      explain = n + ' 个人两两握手，次数 = 线段数 = n(n−1)/2 = ' + n + '×' + (n - 1) + '÷2 = ' + ans + ' 次。';
    } else if (mode === 'tour') {
      prompt = U.pick([
        '一条旅游线路上设了 ' + n + ' 个景点，每两个景点之间都画一条游览路线，共有（ ）条',
        '在 ' + n + ' 个城市之间两两直飞，一共要开（ ）条航线'
      ]);
      explain = n + ' 个点两两连线，线段数 = n(n−1)/2 = ' + ans + ' 条。';
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
      wrongs: pick3(ans, [ans + 1, ans - 1, ans + n, ans - n, ans * 2, n, n * 2, ans + 3, ans + 2]),
      explain: explain
    });
  });

  /* ================= U6 图形的奥秘 ================= */

  /* 6.1 切开立体图形（扩充形状与问法） */
  R('g4a.u6.slice', function (level) {
    var mode = U.pick(['cylH', 'cylV', 'cone', 'coneV', 'cuboid', 'sphere', 'cube']);
    var correct, prompt, explain;
    if (mode === 'cylH') {
      correct = '圆形';
      prompt = U.pick([
        '把一个圆柱横着切开（平行于底面），切开后看到的面是（ ）',
        '在圆柱形杯子里装水，水面的形状是（ ）',
        '圆柱沿着与底面平行的方向切开，切面是（ ）',
        who() + '把火腿肠横着切一刀，切开的面是（ ）',
        '把一根圆木平行于底面锯开，锯开的面是（ ）'
      ]);
      explain = '圆柱横着（平行于底面）切开，切面是大小一样的圆形。';
    } else if (mode === 'cylV') {
      correct = '长方形';
      prompt = U.pick([
        '把一个圆柱竖着切开（沿着底面直径方向），切面是（ ）',
        '圆柱竖着切一刀，切开后看到的面是（ ）',
        '沿着圆柱的一条高把它切开，切面是（ ）',
        '把一节圆柱形水管沿竖直方向剖开，切面是（ ）'
      ]);
      explain = '圆柱竖着切（垂直于底面），切面是长方形。';
    } else if (mode === 'cone') {
      correct = '圆形';
      prompt = U.pick([
        '把一个圆锥横着切开（平行于底面），切开后的面是（ ）',
        '圆锥靠近底面处横着切一刀，切面的形状是（ ）',
        '圆锥平行于底面切开，切面是（ ）',
        '把一个圆锥形圣诞帽沿水平方向切一刀，切面是（ ）'
      ]);
      explain = '圆锥横着（平行于底面）切开，切面是圆形，越靠近顶点圆越小。';
    } else if (mode === 'coneV') {
      correct = '三角形';
      prompt = U.pick([
        '把一个圆锥沿着顶点和底面直径竖着切开，切面是（ ）',
        '圆锥从顶点竖直切到底面，切开后看到的面是（ ）',
        '沿着圆锥的高把它切开，切面是一个（ ）',
        '把圆锥形陀螺沿对称轴剖开，切面是（ ）'
      ]);
      explain = '圆锥沿着高竖着切，切面是一个等腰三角形。';
    } else if (mode === 'cuboid') {
      correct = '长方形';
      prompt = U.pick([
        '把一个长方体切一刀，切面可能是正方形或（ ）',
        '沿着一个面的方向切长方体，切面通常是长方形或（ ）',
        '长方体平行于一个面切一刀，切面是长方形或（ ）',
        '把一块长方体豆腐平行于底面切开，切面是（ ）'
      ]);
      explain = '长方体切开后的面可能是长方形或正方形；圆柱横切是圆、竖切是长方形。';
    } else if (mode === 'sphere') {
      correct = '圆形';
      prompt = U.pick([
        '把一个球任意切一刀，切开后的面都是（ ）',
        '西瓜横着切一刀，切开的面是（ ）',
        '球无论从哪个方向切，切面的形状都是（ ）',
        '把一个乒乓球切成两半，切口的形状是（ ）'
      ]);
      explain = '球无论从哪个方向切，切面都是圆形；切在正中时圆最大。';
    } else {
      correct = '正方形';
      prompt = U.pick([
        '把一个正方体平行于一个面切开，切面是（ ）',
        '魔方沿着一面平行地切一刀，切面的形状是（ ）',
        '正方体平行于上下面切一刀，看到的面是（ ）',
        '把一个正方体积木平行于正面切开，切面是（ ）'
      ]);
      explain = '正方体平行于一个面切开，切面是正方形。';
    }
    return q({
      topicId: 'g4a.u6.slice', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, ['圆形', '长方形', '三角形', '正方形', '椭圆形', '梯形', '扇形', '五边形']),
      explain: explain
    });
  });

  /* 6.2 搭建立体大楼（数正方体，扩底格与层数） */
  R('g4a.u6.blocks', function (level) {
    /* 自写方块生成：随机选若干底面格，按高度堆叠，保证总数已知 */
    var total = level >= 3 ? U.randInt(8, 14) : U.randInt(5, 10);
    var cells = U.shuffle([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 0], [3, 1]]).slice(0, Math.min(U.randInt(3, 6), total));
    var heights = cells.map(function () { return 1; });
    var left = total - cells.length;
    var guard = 0;
    while (left > 0 && guard++ < 80) {
      var i = U.randInt(0, cells.length - 1);
      if (heights[i] < 4) { heights[i]++; left--; }
    }
    var cubes = [];
    cells.forEach(function (c, i) {
      for (var z = 0; z < heights[i]; z++) cubes.push({ x: c[0], y: c[1], z: z });
    });
    var baseCount = cells.length;
    var m = gno();
    return q({
      topicId: 'g4a.u6.blocks', level: level,
      prompt: U.pick([
        '下面的立体大楼由（ ）个小正方体搭成',
        who() + '照两层图纸搭大楼，图中一共用了（ ）个小正方体',
        '先数最下面一层，再看上面，这个立体大楼一共有（ ）个正方体',
        '数一数图中的立体大楼，共有（ ）个小正方体',
        '这个立体图形是由（ ）个小正方体摆成的',
        who() + '用小正方体搭成下面的造型，共用了（ ）个',
        '第 ' + m + ' 组搭的立体大楼由（ ）个小正方体组成',
        '第 ' + m + ' 组数出图中立体大楼共有（ ）个小正方体'
      ]),
      canvas: { kind: 'blocks', cubes: cubes },
      correct: cubes.length,
      wrongs: pick3(cubes.length, [cubes.length + 1, cubes.length - 1, cubes.length + 2, cubes.length - 2, cubes.length + 3, cubes.length + 4, baseCount, cubes.length + baseCount, cubes.length * 2]),
      explain: '先数最下面一层有 ' + baseCount + ' 个，再看上面被挡住叠起来的正方体，一共 ' + cubes.length + ' 个。'
    });
  });

  /* 6.3 翻滚正方体（扩大次数范围） */
  R('g4a.u6.roll', function (level) {
    var k = level >= 3 ? U.randInt(1, 6) : U.randInt(1, 4);
    var ans = 2 + 4 * (k - 1);
    return q({
      topicId: 'g4a.u6.roll', level: level,
      prompt: U.pick([
        '正方体从起点开始在带子上翻滚，蓝色面第 ' + k + ' 次朝上时，落在数字（ ）上',
        who() + '发现正方体每翻 4 次蓝色面才朝上一次。第 1 次落在 2，那么第 ' + k + ' 次蓝色面朝上落在数字（ ）',
        '蓝色面朝上的位置依次是 2、6、10……第 ' + k + ' 次蓝色面朝上落在数字（ ）',
        '正方体翻滚一圈（4 格）蓝色面朝上一次，第 ' + k + ' 次蓝色面经过的数字是（ ）',
        '按规律 2、6、10、14……第 ' + k + ' 个数是（ ）'
      ]),
      correct: ans,
      wrongs: pick3(ans, [ans + 1, ans - 1, ans + 2, ans - 2, ans + 4, ans - 4, ans + 10, ans + 8, 1, 3, 4]),
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

  /* 7.3 速度、时间与路程（扩充数值与情境） */
  R('g4a.u7.speed', function (level) {
    var mode = U.pick(['dist', 'time', 'speed']);
    var correct, prompt, explain;
    if (mode === 'dist') {
      var sp = U.pick([60, 70, 80, 90, 100, 120, 18, 25]);
      var ti = U.randInt(2, 12);
      correct = sp * ti;
      prompt = U.pick([
        '每分钟走 ' + sp + ' 米，走 ' + ti + ' 分钟，走了多少米？',
        '猎豹每分钟约跑 ' + sp + ' 千米，' + ti + ' 分钟能跑多少千米？',
        '运动员每秒滑行 ' + sp + ' 米，' + ti + ' 秒滑多少米？',
        '汽车每小时行 ' + sp + ' 千米，' + ti + ' 小时行多少千米？',
        who() + '骑自行车每分行 ' + sp + ' 米，' + ti + ' 分行多少米？'
      ]);
      explain = '路程 = 速度 × 时间 = ' + sp + ' × ' + ti + ' = ' + correct + '。';
    } else if (mode === 'time') {
      var sp2 = U.pick([50, 60, 70, 80, 90, 120]);
      var ti2 = U.randInt(2, 8);
      var di2 = sp2 * ti2;
      correct = ti2;
      prompt = U.pick([
        '从学校到少年宫 ' + di2 + ' 米，每分钟走 ' + sp2 + ' 米，需要走几分钟？',
        '甲、乙两地 ' + di2 + ' 千米，汽车每小时行 ' + sp2 + ' 千米，几小时到达？',
        who() + '家到书店 ' + di2 + ' 米，每分钟走 ' + sp2 + ' 米，几分钟能到？'
      ]);
      explain = '时间 = 路程 ÷ 速度 = ' + di2 + ' ÷ ' + sp2 + ' = ' + correct + '。';
    } else {
      var ti3 = U.pick([2, 3, 4, 5, 6, 8]);
      var sp3 = U.pick([30, 40, 50, 60, 80, 90]);
      var di3 = sp3 * ti3;
      correct = sp3;
      prompt = U.pick([
        '一辆车 ' + ti3 + ' 小时行了 ' + di3 + ' 千米，平均每小时行多少千米？',
        '' + di3 + ' 米的路程用 ' + ti3 + ' 分钟走完，每分钟走多少米？',
        who() + ' ' + ti3 + ' 分钟跑了 ' + di3 + ' 米，平均每分跑多少米？'
      ]);
      explain = '速度 = 路程 ÷ 时间 = ' + di3 + ' ÷ ' + ti3 + ' = ' + correct + '。';
    }
    return q({
      topicId: 'g4a.u7.speed', level: level,
      prompt: prompt, correct: correct,
      wrongs: pick3(correct, [correct + 1, correct - 1, correct + 10, correct - 10, correct * 2, Math.abs(correct - 5), correct + 2]),
      explain: explain
    });
  });

  /* 7.4 相遇问题（参数化：速度、路程、情境随机） */
  R('g4a.u7.meet', function (level) {
    /* 选两个速度，使速度和整除时间 */
    var vPool = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    var v1 = U.pick(vPool);
    var v2 = U.pick(vPool);
    while (v2 === v1) v2 = U.pick(vPool);
    var sum = v1 + v2;
    var t = U.randInt(3, 12);
    var D = sum * t;
    var scene = U.pick([
      { unit: '米', u2: '分', p: '两人同时从相距 ' + D + ' 米的两地相向而行，' + who() + '每分走 ' + v1 + ' 米，' + who() + '每分走 ' + v2 + ' 米，几分相遇？', e: '速度和 ' + v1 + '+' + v2 + '=' + sum + ' 米/分，' + D + '÷' + sum + '=' + t + ' 分。' },
      { unit: '米', u2: '分', p: '两地相距 ' + D + ' 米，甲每分走 ' + v1 + ' 米、乙每分走 ' + v2 + ' 米，两人同时相向出发，几分相遇？', e: '速度和 ' + sum + ' 米/分，' + D + '÷' + sum + '=' + t + ' 分。' },
      { unit: '千米', u2: '小时', p: '两列火车相距 ' + D + ' 千米，同时相向开出，一列每小时 ' + v1 + ' 千米、另一列每小时 ' + v2 + ' 千米，几小时相遇？', e: '速度和 ' + v1 + '+' + v2 + '=' + sum + ' 千米/时，' + D + '÷' + sum + '=' + t + ' 小时。' },
      { unit: '千米', u2: '小时', p: 'A、B 两城相距 ' + D + ' 千米，两车同时从两城相向开出，一车每小时行 ' + v1 + ' 千米，另一车每小时行 ' + v2 + ' 千米，几小时后相遇？', e: '两车速度和 ' + sum + ' 千米/时，' + D + '÷' + sum + '=' + t + ' 小时。' },
      { unit: '寸', u2: '天', p: '瓜蔓每日向下 ' + (v1 / 10) + ' 寸，葫芦蔓每日向上 ' + (v2 / 10) + ' 寸，墙高 ' + (D / 10) + ' 寸，两蔓几日相遇？', e: '每天共爬 ' + (v1 / 10) + '+' + (v2 / 10) + '=' + (sum / 10) + ' 寸，' + (D / 10) + '÷' + (sum / 10) + '=' + t + ' 日。' }
    ]);
    return q({
      topicId: 'g4a.u7.meet', level: level,
      prompt: U.pick([scene.p, '想一想，列综合算式：' + scene.p, '相遇时间 = 路程 ÷ 速度和。' + scene.p]),
      correct: t,
      wrongs: pick3(t, [t + 1, t - 1, t + 2, t * 2, t + 5, Math.abs(t - 2), Math.round(D / v1), Math.round(D / v2)]),
      explain: '相向而行同时出发，相遇时间 = 路程 ÷ 速度和。' + scene.e
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
