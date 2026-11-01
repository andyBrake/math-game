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

  function chickenPair(chickens, rabbits) {
    return '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
  }
  function chickenWrongs(chickens, rabbits) {
    var correct = chickenPair(chickens, rabbits);
    var pool = [];
    var ds = [[1, 0], [0, 1], [1, 1], [2, 0], [0, 2], [-1, 0], [0, -1], [2, 1], [1, 2], [3, 0], [0, 3], [2, -1], [-1, 2], [3, 1], [1, 3], [-2, 1], [1, -2]];
    ds.forEach(function (d) {
      var c = chickens + d[0], r = rabbits + d[1];
      if (c < 1 || r < 1) return;
      var s = chickenPair(c, r);
      if (s !== correct) pool.push(s);
    });
    return three(correct, pool);
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
    var who = U.pick(WHO);
    if (level === 1) {
      var a = U.randInt(3, 20), b = U.randInt(2, 9), c = U.randInt(2, 9);
      var forms = [
        { expr: a + ' + ' + (b * c) + ' ÷ ' + b, ans: '除法' },
        { expr: a + ' × ' + b + ' − ' + c, ans: '乘法' },
        { expr: (a * b) + ' − ' + c + ' × ' + b, ans: '乘法' },
        { expr: a + ' − ' + (b * c) + ' ÷ ' + b, ans: '除法' },
        { expr: a + ' + ' + c + ' × ' + b, ans: '乘法' }
      ];
      var f = U.pick(forms);
      var prompt = U.pick([
        who + '在计算 ' + f.expr + ' 时，应该先算：',
        '算式 ' + f.expr + ' 中，应该先进行哪种运算？',
        '计算 ' + f.expr + '，第一步要先算的是（ ）',
        '下面这道题 ' + f.expr + '，应该先算什么？',
        who + '列的算式 ' + f.expr + '，要先做哪一步运算？'
      ]);
      var pool = ['加法', '减法', '乘法', '除法', '从左往右依次算', '从右往左依次算', '都可以', '先算加法', '先算减法', '先算乘法', '先算除法', '先算括号', '随便先算哪个', '从中间开始算', '先算大的数', '先算小的数'];
      return q({
        topicId: 'g4b.u1.order', level: level,
        prompt: prompt,
        correct: f.ans,
        wrongs: three(f.ans, pool),
        explain: '在没有括号的算式里，既有加减法又有乘除法，要先算乘除法，再算加减法。'
      });
    }
    var a = U.randInt(3, 20), b = U.randInt(2, 9), c = U.randInt(2, 9);
    var forms = [
      { p: a + ' + ' + (b * c) + ' ÷ ' + b + ' = （ ）', ans: a + c, e: '先算除法 ' + b * c + ' ÷ ' + b + ' = ' + c + '，再算加法 ' + a + ' + ' + c + ' = ' + (a + c) + '。' },
      { p: a + ' × ' + b + ' + ' + c + ' = （ ）', ans: a * b + c, e: '先算乘法 ' + a + ' × ' + b + ' = ' + (a * b) + '，再加 ' + c + ' 得 ' + (a * b + c) + '。' }
    ];
    /* a*b - c，确保 a*b > c */
    var c2 = U.randInt(2, Math.max(2, a * b - 1));
    forms.push({ p: a + ' × ' + b + ' − ' + c2 + ' = （ ）', ans: a * b - c2, e: '先算乘法 ' + a + ' × ' + b + ' = ' + (a * b) + '，再减 ' + c2 + ' 得 ' + (a * b - c2) + '。' });
    /* 减法在前的形式，确保被减数足够大 */
    var subA = c * b + U.randInt(5, 20);
    forms.push({ p: subA + ' − ' + c + ' × ' + b + ' = （ ）', ans: subA - c * b, e: '先算乘法 ' + c + ' × ' + b + ' = ' + (c * b) + '，再算减法 ' + subA + ' − ' + (c * b) + ' = ' + (subA - c * b) + '。' });
    var f = U.pick(forms);
    var prompt = U.pick([
      '计算：' + f.p,
      who + '算一算：' + f.p,
      '请用递等式计算 ' + f.p,
      '脱式计算 ' + f.p,
      '请看算式 ' + f.p + ' 它的结果是（ ）'
    ]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 2, f.ans - 2, f.ans + b, f.ans - b, f.ans + c, f.ans - c, f.ans + 100, f.ans * 2];
    return q({
      topicId: 'g4b.u1.order', level: level,
      prompt: prompt,
      correct: f.ans,
      wrongs: three(f.ans, pool),
      explain: f.e
    });
  });

  /* ---------- 1.2 四则运算：含括号 ---------- */
  R('g4b.u1.calc', function (level) {
    var who = U.pick(WHO);
    var a = U.randInt(2, 20), b = U.randInt(2, 20), c = U.randInt(2, 9);
    var forms = [
      function () {
        var total = (a + b) * c;
        var d = U.randInt(1, Math.max(1, total - 2));
        var ans = total - d;
        return { p: '(' + a + ' + ' + b + ') × ' + c + ' − ' + d + ' = （ ）', ans: ans, e: '先算小括号里的 ' + a + ' + ' + b + ' = ' + (a + b) + '，再乘 ' + c + ' 得 ' + total + '，最后减 ' + d + ' 得 ' + ans + '。' };
      },
      function () {
        var total = (a + b) * c;
        var d = U.randInt(1, Math.max(1, 50));
        var ans = total + d;
        return { p: '(' + a + ' + ' + b + ') × ' + c + ' + ' + d + ' = （ ）', ans: ans, e: '先算小括号里的 ' + a + ' + ' + b + ' = ' + (a + b) + '，再乘 ' + c + ' 得 ' + total + '，最后加 ' + d + ' 得 ' + ans + '。' };
      },
      function () {
        var total = a * (b + c);
        var d = U.randInt(1, Math.max(1, total - 2));
        var ans = total - d;
        return { p: a + ' × (' + b + ' + ' + c + ') − ' + d + ' = （ ）', ans: ans, e: '先算小括号里的 ' + b + ' + ' + c + ' = ' + (b + c) + '，再乘 ' + a + ' 得 ' + total + '，最后减 ' + d + ' 得 ' + ans + '。' };
      },
      function () {
        var d = U.randInt(2, 20);
        var ans = a * b + c * d;
        return { p: a + ' × ' + b + ' + ' + c + ' × ' + d + ' = （ ）', ans: ans, e: '先算两个乘法：' + a + ' × ' + b + ' = ' + (a * b) + '，' + c + ' × ' + d + ' = ' + (c * d) + '，再相加得 ' + ans + '。' };
      },
      function () {
        var a2 = U.randInt(10, 20), b2 = U.randInt(2, 9);
        var d = U.randInt(2, Math.max(2, Math.floor((a2 * b2 - 1) / c)));
        var ans = a2 * b2 - c * d;
        return { p: a2 + ' × ' + b2 + ' − ' + c + ' × ' + d + ' = （ ）', ans: ans, e: '先算两个乘法：' + a2 + ' × ' + b2 + ' = ' + (a2 * b2) + '，' + c + ' × ' + d + ' = ' + (c * d) + '，再相减得 ' + ans + '。' };
      },
      function () {
        var d = U.randInt(1, Math.max(1, a + b - 1));
        var ans = (a + b) * c - d * c;
        return { p: '(' + a + ' + ' + b + ') × ' + c + ' − ' + d + ' × ' + c + ' = （ ）', ans: ans, e: '先算两个乘法：' + (a + b) + ' × ' + c + ' = ' + ((a + b) * c) + '，' + d + ' × ' + c + ' = ' + (d * c) + '，再相减得 ' + ans + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([
      '计算：' + f.p,
      who + '算一算：' + f.p,
      '脱式计算 ' + f.p,
      '请递等式计算 ' + f.p,
      '仔细计算 ' + f.p + '，结果是（ ）',
      '下面这道题 ' + f.p + ' 的答案是多少？'
    ]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 2, f.ans - 2, f.ans + c, f.ans - c, f.ans + 100, f.ans * 2, f.ans + b, f.ans - b];
    return q({
      topicId: 'g4b.u1.calc', level: level,
      prompt: prompt,
      correct: f.ans,
      wrongs: three(f.ans, pool),
      explain: f.e
    });
  });

  /* ---------- 1.3 四则运算：关于 0 ---------- */
  R('g4b.u1.zero', function (level) {
    var who = U.pick(WHO);
    var n = U.randInt(5, 99);
    var m = U.randInt(5, 99);
    var items = [
      { p: '0 ÷ ' + n + ' = （ ）', ans: '0', pool: [String(n), '1', String(n + 1), String(n - 1), String(n * 2), String(n + 2), String(n * 3), '2', String(n + 10)], e: '0 除以任何不是 0 的数都得 0。' },
      { p: n + ' × 0 = （ ）', ans: '0', pool: [String(n), '1', String(n + 1), String(n - 1), String(n * 2), '2', String(n + 2), String(n - 2)], e: '任何数与 0 相乘都得 0。' },
      { p: '0 × ' + n + ' = （ ）', ans: '0', pool: [String(n), '1', String(n + 1), String(n - 1), String(n * 2), '2', String(n + 5)], e: '0 乘任何数都得 0。' },
      { p: '0 + ' + n + ' = （ ）', ans: String(n), pool: ['0', '1', String(n + 1), String(n - 1), String(n * 2), String(n + 2), '2', String(n + 10)], e: '0 加任何数还得这个数。' },
      { p: n + ' + 0 = （ ）', ans: String(n), pool: ['0', '1', String(n + 1), String(n - 1), String(n * 2), '2', String(n + 3)], e: '任何数加 0 还得这个数。' },
      { p: n + ' − 0 = （ ）', ans: String(n), pool: ['0', '1', String(n + 1), String(n - 1), String(n * 2), '2', String(n + 4)], e: '任何数减 0 还得这个数。' },
      { p: '在 ' + n + ' ÷ ' + m + ' = 0 中，' + m + ' 不能是（ ）', ans: '0', pool: [String(n), '1', String(n + 1), String(n - 1), String(n * 2)], e: '0 不能作除数。' },
      { p: '0 ÷ ' + n + ' ○ 0 × ' + n + '，○ 里应填（ ）', ans: '=', pool: ['>', '<', '≥', '≤', '≠'], e: '左边 0÷n=0，右边 0×n=0，两边相等。' },
      { p: n + ' + 0 ○ ' + n + ' − 0，○ 里应填（ ）', ans: '=', pool: ['>', '<', '≥', '≤', '≠'], e: '一个数加 0 或减 0 都得原数，两边相等。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([
      it.p,
      who + '做口算：' + it.p,
      '想一想，' + it.p,
      it.p + ' 正确结果是多少？'
    ]);
    return q({
      topicId: 'g4b.u1.zero', level: level,
      prompt: prompt,
      correct: it.ans,
      wrongs: three(it.ans, it.pool),
      explain: it.e
    });
  });

  /* ---------- 2.1 观察物体：从正面看 ---------- */
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

  R('g4b.u2.view', function (level) {
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
      { id: 'front', name: '正面', desc: '前后重叠的正方形只算一个' },
      { id: 'top', name: '上面', desc: '上下重叠的正方形只算一个' },
      { id: 'right', name: '右面', desc: '左右重叠的正方形只算一个' },
      { id: 'left', name: '左面', desc: '左右重叠的正方形只算一个' }
    ];
    var d = U.pick(directions);
    var ans = viewCount(cubes, d.id);
    var who = U.pick(WHO);
    var mat = U.pick(['积木', '小正方体', '小方块', '木块', '纸盒', '方块', '小盒子', '彩砖']);
    var prompt = U.pick([
      who + '用' + mat + '搭了一个立体图形：底层 ' + base + ' 个，最高 ' + layers + ' 层，占 ' + colCount + ' 列。从' + d.name + '看，能看到几个正方形？',
      '这个立体图形由 ' + count + ' 个' + mat + '搭成（底层 ' + base + ' 个，最高 ' + layers + ' 层），从' + d.name + '看有几个正方形？',
      who + '搭的' + mat + '图形（最高 ' + layers + ' 层，占 ' + colCount + ' 列），从' + d.name + '看，能看到几个小正方形？',
      '由 ' + count + ' 个' + mat + '搭成（底层 ' + base + ' 个，占 ' + rowCount + ' 排），从' + d.name + '看能看到几个正方形？',
      who + '用' + mat + '搭的图形：底层 ' + base + ' 个、最高 ' + layers + ' 层、占 ' + colCount + ' 列。从' + d.name + '看，一共看到几个正方形？',
      '观察这个立体图形（' + count + ' 个' + mat + '，最高 ' + layers + ' 层），从' + d.name + '看有几个正方形？'
    ]);
    var pool = [count + 5, count + 6, count + 7, count + 8, count - 1, count - 2, count - 3, base + 10, layers + 10, colCount + 10, rowCount + 10, ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans + 4, ans + 5, ans + 6, base + layers + 5, colCount + rowCount + 5, count + base + 5, count + layers + 5, count + colCount + 5, base * 3, layers * 3, base + colCount + 10, layers + rowCount + 10, count + 15, ans + 8, ans + 10, colCount + layers + 10, rowCount + base + 10, count + 20, base * 4, layers * 4];
    return q({
      topicId: 'g4b.u2.view', level: level,
      prompt: prompt,
      canvas: { kind: 'blocks', cubes: cubes },
      correct: ans,
      wrongs: three(ans, pool),
      explain: '从' + d.name + '看时，' + d.desc + '，共能看到 ' + ans + ' 个正方形。'
    });
  });

  /* ---------- 2.2 观察物体：数正方体 ---------- */
  /* 示范模式：makeCubes 增加 base 参数（底层个数），题干嵌入可从图中读出的参数保证唯一率 */
  R('g4b.u2.count', function (level) {
    var count = level >= 3 ? U.randInt(6, 11) : (level === 2 ? U.randInt(5, 9) : U.randInt(4, 9));
    var base = Math.min(U.randInt(Math.ceil(count / 3), 4), count - 1);
    var cubes = makeCubes(count, base);
    var layers = 0, colCount = 0, cols = Object.create(null);
    cubes.forEach(function (c) {
      if (c.z + 1 > layers) layers = c.z + 1;
      if (!cols[c.x]) { cols[c.x] = true; colCount++; }
    });
    var who = U.pick(['小明', '小华', '小丽', '小刚', '小红', '小军', '小芳', '小林', '小强', '小敏', '小英', '小亮', '小东', '小宇', '小杰', '小婷', '小浩', '小芸', '小磊', '小鹏', '小萌', '小静', '小雪', '小龙']);
    var mat = U.pick(['积木', '小正方体', '小方块', '木块', '纸盒', '方块', '小盒子', '彩砖', '玩具块', '骰子']);
    var prompt = U.pick([
      who + '用' + mat + '搭了一个立体图形：底层有 ' + base + ' 个，最高的地方堆了 ' + layers + ' 层，一共占了 ' + colCount + ' 列。这个立体图形一共用了多少个小正方体？',
      who + '搭的立体图形（底层 ' + base + ' 个，最高 ' + layers + ' 层，占 ' + colCount + ' 列）一共有多少个小正方体？',
      who + '用' + mat + '搭的图形，最下面一层有 ' + base + ' 个，一共占了 ' + colCount + ' 列。数一数，这个立体图形一共用了多少个？',
      who + '用' + mat + '搭成的立体图形：底层 ' + base + ' 个、最高的位置堆了 ' + layers + ' 层、占了 ' + colCount + ' 列。一共有多少个小正方体？',
      who + '用' + mat + '搭了一个图形：底层有 ' + base + ' 个，最高堆了 ' + layers + ' 层，占了 ' + colCount + ' 列。总共用了多少个？',
      who + '搭的图形底层有 ' + base + ' 个，最高的地方堆了 ' + layers + ' 层，一共占 ' + colCount + ' 列。它一共用了多少个小正方体？'
    ]);
    var cands = [count + 1, count + 2, count + 3, count + 4, count + 5, count + 6, count + 7, count - 1, count - 2, count - 3, count - 4, base, layers, colCount, 2 * count, count + base, base + layers, count + layers, count + colCount, base * 2 + layers, count + 8, base + colCount, layers + colCount, count + 10];
    var seenW = Object.create(null);
    seenW[String(count)] = true;
    var wrongs = [];
    U.shuffle(cands).forEach(function (w) {
      var s = String(w);
      if (w >= 0 && !seenW[s] && wrongs.length < 3) { seenW[s] = true; wrongs.push(s); }
    });
    return q({
      topicId: 'g4b.u2.count', level: level,
      prompt: prompt,
      canvas: { kind: 'blocks', cubes: cubes },
      correct: count,
      wrongs: wrongs,
      explain: '先数最下面一层有 ' + base + ' 个，再看上面被挡住的小正方体，一共 ' + count + ' 个。'
    });
  });

  /* ---------- 3.1 运算定律：辨认 ---------- */
  R('g4b.u3.identify', function (level) {
    var a = U.randInt(12, 90), b = U.randInt(3, 9), c = U.randInt(10, 40);
    var laws = ['加法交换律', '加法结合律', '乘法交换律', '乘法结合律', '乘法分配律', '减法性质'];
    var items = [
      { p: a + ' × ' + b + ' = ' + b + ' × ' + a + ' 运用了（ ）', ans: '乘法交换律', e: '两个数相乘，交换因数的位置，积不变，这是乘法交换律。' },
      { p: a + ' + ' + b + ' = ' + b + ' + ' + a + ' 运用了（ ）', ans: '加法交换律', e: '两个数相加，交换加数的位置，和不变，这是加法交换律。' },
      { p: '(' + a + ' × ' + b + ') × ' + c + ' = ' + a + ' × (' + b + ' × ' + c + ') 运用了（ ）', ans: '乘法结合律', e: '三个数相乘，先把前两个数相乘或先把后两个数相乘，积不变，这是乘法结合律。' },
      { p: '(' + a + ' + ' + b + ') × ' + c + ' = ' + a + ' × ' + c + ' + ' + b + ' × ' + c + ' 运用了（ ）', ans: '乘法分配律', e: '两个数的和与一个数相乘，可以先把它们分别与这个数相乘再相加，这是乘法分配律。' },
      { p: '(' + a + ' + ' + b + ') + ' + c + ' = ' + a + ' + (' + b + ' + ' + c + ') 运用了（ ）', ans: '加法结合律', e: '三个数相加，先把前两个数相加或先把后两个数相加，和不变，这是加法结合律。' },
      { p: a + ' − ' + b + ' − ' + c + ' = ' + a + ' − (' + b + ' + ' + c + ') 运用了（ ）', ans: '减法性质', e: '一个数连续减去两个数，等于这个数减去这两个数的和，这是减法性质。' }
    ];
    var it = U.pick(items);
    var who = U.pick(WHO);
    var prompt = U.pick([
      it.p,
      who + '观察算式 ' + it.p,
      '下面算式 ' + it.p,
      it.p + ' 它用了什么运算定律？'
    ]);
    var pool = laws.filter(function (l) { return l !== it.ans; });
    pool.push('没有用运算定律', '交换位置', '凑整', '加法性质', '乘法性质', '除法性质', '减法交换律', '结合律', '分配律');
    return q({
      topicId: 'g4b.u3.identify', level: level,
      prompt: prompt,
      correct: it.ans,
      wrongs: three(it.ans, pool),
      explain: it.e
    });
  });

  /* ---------- 3.2 运算定律：简便计算 ---------- */
  R('g4b.u3.simplify', function (level) {
    var who = U.pick(WHO);
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
        return { p: '25 × (40 + 4) = （ ）', ans: 25 * 44, e: '用乘法分配律：25 × 40 + 25 × 4 = 1000 + 100 = 1100。' };
      },
      function () {
        var a = U.randInt(2, 9);
        return { p: '99 × ' + a + ' = （ ）', ans: 99 * a, e: '把 99 看成 100 − 1：100 × ' + a + ' − ' + a + ' = ' + (100 * a - a) + '。' };
      },
      function () {
        var a = U.randInt(111, 899);
        return { p: a + ' − 37 − 63 = （ ）', ans: a - 100, e: '先算 37 + 63 = 100（减法性质），再用 ' + a + ' − 100。' };
      },
      function () {
        var a = U.randInt(3, 9);
        return { p: '125 × ' + a + ' × 8 = （ ）', ans: 1000 * a, e: '先算 125 × 8 = 1000，再乘 ' + a + '。' };
      },
      function () {
        var a = U.randInt(12, 89);
        return { p: '101 × ' + a + ' = （ ）', ans: 101 * a, e: '把 101 看成 100 + 1：100 × ' + a + ' + ' + a + ' = ' + (100 * a + a) + '。' };
      },
      function () {
        var a = U.randInt(11, 89);
        return { p: a + ' + 98 = （ ）', ans: a + 98, e: '把 98 看成 100 − 2：' + a + ' + 100 − 2 = ' + (a + 98) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([
      '用简便方法计算：' + f.p,
      who + '用简便方法算一算：' + f.p,
      '怎样简便就怎样算：' + f.p,
      '脱式计算（能简算的要简算）' + f.p,
      '巧算 ' + f.p,
      '下面各题怎样简便就怎样算 ' + f.p
    ]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans - 2, f.ans * 10, f.ans + 1000, f.ans - 1000, f.ans * 2];
    return q({
      topicId: 'g4b.u3.simplify', level: level,
      prompt: prompt,
      correct: f.ans,
      wrongs: three(f.ans, pool),
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
    var who = U.pick(WHO);
    var prompt = U.pick([
      fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' = （ ）',
      who + '计算：' + fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' = （ ）',
      '把 ' + fmtCents(cents) + ' 的小数点向' + (op.sym === '×' ? '右' : '左') + '移动' + (op.k === 10 ? '一' : op.k === 100 ? '两' : '三') + '位，结果是（ ）',
      fmtCents(cents) + ' 扩大到原来的 ' + op.k + ' 倍是（ ）',
      fmtCents(cents) + ' 缩小到原来的 ' + op.k + ' 分之一是（ ）',
      '想一想，' + fmtCents(cents) + ' ' + op.sym + ' ' + op.k + ' 的结果是多少？'
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
    return q({
      topicId: 'g4b.u4.point', level: level,
      prompt: prompt,
      correct: fmtCents(ansCents),
      wrongs: three(fmtCents(ansCents), pool),
      explain: '把小数点向' + (op.sym === '×' ? '右' : '左') + '移动 ' + (op.k === 10 ? 1 : op.k === 100 ? 2 : 3) +
        ' 位，结果是 ' + fmtCents(ansCents) + '。位数不够时用 0 补足。'
    });
  });

  /* ---------- 4.2 小数的意义和性质：比较与化简 ---------- */
  R('g4b.u4.compare', function (level) {
    if (level === 1) {
      var intPart = U.randInt(1, 9);
      var s = intPart + '.' + U.randInt(1, 9) + U.pick(['00', '0']);
      var trimmed = String(Number(s));
      var who = U.pick(WHO);
      var prompt = U.pick([
        '把 ' + s + ' 化简后是：',
        s + ' 去掉小数末尾的 0 后是：',
        '与 ' + s + ' 大小相等，但写法更简单的是：',
        s + ' 化简后的结果是多少？',
        who + '把 ' + s + ' 写成最简形式是（ ）',
        '不改变 ' + s + ' 的大小，把它化简后是（ ）'
      ]);
      var pool = [s, String(Number(s) * 10), trimmed + '0', String(Number(s) / 10), trimmed + '00', String(Number(s) * 100), trimmed + '000'];
      return q({
        topicId: 'g4b.u4.compare', level: level,
        prompt: prompt,
        correct: trimmed,
        wrongs: three(trimmed, pool),
        explain: '小数的末尾添上 0 或去掉 0，小数的大小不变，所以 ' + s + ' = ' + trimmed + '。'
      });
    }
    var set = [];
    while (set.length < 4) {
      var v = U.randInt(1, 9999) / 100;
      if (set.indexOf(v) === -1) set.push(v);
    }
    var sorted = set.slice().sort(function (a, b) { return b - a; });
    var mode = U.pick(['max', 'min', 'secondMax', 'secondMin']);
    var val = mode === 'max' ? sorted[0] :
      mode === 'min' ? sorted[3] :
        mode === 'secondMax' ? sorted[1] : sorted[2];
    var strs = set.map(function (x) { return fmtCents(Math.round(x * 100)); });
    var who = U.pick(WHO);
    var listStr = strs.join('、');
    var prompt = U.pick([
      '比较下面四个小数：' + listStr + '，最大的是（ ）',
      '下面各数 ' + listStr + ' 中，最大的是（ ）',
      who + '把 ' + listStr + ' 从大到小排一排，最大的是（ ）',
      '在 ' + listStr + ' 这四个数中，最小的是（ ）',
      '四个小数 ' + listStr + ' 中，最小的是（ ）',
      who + '把 ' + listStr + ' 从小到大排列，排在第二的是（ ）',
      '比较 ' + listStr + '，第二大的是（ ）',
      '四个数 ' + listStr + ' 中，第二小的是（ ）'
    ]);
    var ansStr = fmtCents(Math.round(val * 100));
    var others = set.filter(function (x) { return x !== val; }).map(function (x) { return fmtCents(Math.round(x * 100)); });
    return q({
      topicId: 'g4b.u4.compare', level: level,
      prompt: prompt,
      correct: ansStr,
      wrongs: three(ansStr, others),
      explain: '比较小数时先比整数部分，整数部分相同再比十分位、百分位……' +
        (mode === 'max' ? '最大' : mode === 'min' ? '最小' : mode === 'secondMax' ? '第二大' : '第二小') +
        '的是 ' + ansStr + '。'
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
    var who = U.pick(WHO);
    var prompt = U.pick([
      value.toFixed(3) + ' 保留' + (digits === 1 ? '一' : '两') + '位小数，约是（ ）',
      who + '把 ' + value.toFixed(3) + ' 保留' + (digits === 1 ? '一位' : '两位') + '小数，结果是（ ）',
      value.toFixed(3) + ' 精确到' + (digits === 1 ? '十分位' : '百分位') + '，约是（ ）',
      '按四舍五入法，' + value.toFixed(3) + ' 保留' + (digits === 1 ? '一' : '两') + '位小数约是（ ）',
      '把 ' + value.toFixed(3) + ' 省略' + (digits === 1 ? '十分位后面' : '百分位后面') + '的尾数，约是（ ）'
    ]);
    var pool = [
      value.toFixed(digits + 1 > 3 ? 3 : digits + 1),
      value.toFixed(0),
      (value * 10).toFixed(digits),
      (value / 10).toFixed(digits + 1 > 3 ? 3 : digits + 1),
      value.toFixed(3),
      (value + 0.01).toFixed(digits),
      (value - 0.01).toFixed(digits)
    ];
    return q({
      topicId: 'g4b.u4.round', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: three(ans, pool),
      explain: '保留' + (digits === 1 ? '一' : '两') + '位小数，要看下一位：满 5 进 1，不满 5 舍去，结果是 ' + ans + '。'
    });
  });

  /* ---------- 5.1 三角形：内角和 ---------- */
  R('g4b.u5.sum', function (level) {
    var a = U.randInt(30, 80);
    var b = U.randInt(30, 80);
    if (a + b > 150) b = 150 - a;
    var c = 180 - a - b;
    var who = U.pick(WHO);
    var prompt = U.pick([
      '一个三角形中，∠1 = ' + a + '°，∠2 = ' + b + '°，∠3 = （ ）',
      who + '量得三角形两个内角分别是 ' + a + '° 和 ' + b + '°，第三个角是（ ）',
      '三角形的两个内角为 ' + a + '°、' + b + '°，第三个内角是多少度？',
      '已知三角形两个角为 ' + a + '° 和 ' + b + '°，它的第三个角是（ ）',
      '三角形内角和 180°，若两角分别是 ' + a + '° 和 ' + b + '°，则第三角为（ ）',
      '在三角形中，∠A = ' + a + '°，∠B = ' + b + '°，∠C = （ ）'
    ]);
    var pool = [180 - a, 180 - b, 360 - a - b, c + 10, c - 10, c + 5, c - 5, c + 1, c + 20, a + b, c * 2, c + 30];
    return q({
      topicId: 'g4b.u5.sum', level: level,
      prompt: prompt,
      correct: c,
      wrongs: three(c, pool),
      explain: '三角形的内角和是 180°，所以 ∠3 = 180° − ' + a + '° − ' + b + '° = ' + c + '°。'
    });
  });

  /* ---------- 5.2 三角形：三边关系 ---------- */
  R('g4b.u5.side', function (level) {
    var a = U.randInt(3, 9), b = U.randInt(3, 9);
    var c = U.randInt(Math.abs(a - b) + 1, a + b - 1);
    var who = U.pick(WHO);
    var mat = U.pick(['小棒', '木条', '铁丝', '吸管']);
    var prompt = U.pick([
      '有两根' + mat + '分别长 ' + a + ' cm 和 ' + b + ' cm，再选一根长（ ）cm 的' + mat + '就能围成三角形？',
      who + '有两根' + mat + '长 ' + a + ' cm 和 ' + b + ' cm，下面哪根长的第三根能与它们围成三角形？',
      '已知两根' + mat + '长 ' + a + ' cm 和 ' + b + ' cm，第三根取下面哪个长度可以围成三角形？',
      '三角形两边长为 ' + a + ' cm、' + b + ' cm，第三边不可能是下面哪个长度？（选能围成的）',
      who + '用两根 ' + a + ' cm 和 ' + b + ' cm 的' + mat + '，再配一根多长的' + mat + '能围成三角形？'
    ]);
    var pool = [a + b, Math.abs(a - b), a + b + 1, Math.abs(a - b) + 2, a + b + 2, Math.abs(a - b) - 1, a + b + 3, a + b - 1, Math.abs(a - b) + 1, a * 2, b * 2, a + b + 10];
    return q({
      topicId: 'g4b.u5.side', level: level,
      prompt: prompt,
      correct: c,
      wrongs: three(c, pool),
      explain: '三角形任意两边之和大于第三边。' + a + ' + ' + b + ' > ' + c + '，所以第三边取 ' + c + ' cm 可以围成三角形。'
    });
  });

  /* ---------- 5.3 三角形：分类 ---------- */
  R('g4b.u5.classify', function (level) {
    var who = U.pick(WHO);
    var classes = ['锐角三角形', '直角三角形', '钝角三角形', '等腰三角形', '等边三角形', '不等边三角形'];
    var a1 = U.randInt(30, 80), a2 = U.randInt(30, 80);
    var a3 = 180 - a1 - a2;
    if (a3 <= 0 || a3 >= 180) { a1 = 60; a2 = 60; a3 = 60; }
    var s1 = U.randInt(3, 9), s2 = U.randInt(3, 9), s3 = U.randInt(3, 9);
    var big = U.randInt(91, 150), small = U.randInt(20, 40);
    var items = [
      { p: '三角形中有一个角是 ' + big + '°，它是（ ）', ans: '钝角三角形', e: '有一个角大于 90° 的三角形是钝角三角形。' },
      { p: '三角形最大角是 ' + big + '°，这个三角形是（ ）', ans: '钝角三角形', e: '最大角大于 90°，所以是钝角三角形。' },
      { p: '一个三角形两个角分别是 ' + small + '° 和 ' + small + '°，第三个角是 ' + (180 - 2 * small) + '°，它是（ ）', ans: '锐角三角形', e: '三个角都小于 90°，是锐角三角形。' },
      { p: '等腰三角形的一个底角是 ' + small + '°，它的顶角是（ ）', ans: String(180 - 2 * small) + '°', e: '等腰三角形两个底角相等，顶角 = 180° − ' + small + '° × 2 = ' + (180 - 2 * small) + '°。' },
      { p: '等边三角形的每个内角是（ ）', ans: '60°', e: '等边三角形三个角相等，180° ÷ 3 = 60°。' },
      { p: '有两条边相等的三角形叫做（ ）', ans: '等腰三角形', e: '有两条边相等的三角形是等腰三角形。' },
      { p: '等边三角形又叫作（ ）', ans: '正三角形', e: '等边三角形三条边都相等，也叫正三角形。' },
      { p: '直角三角形的一个锐角是 ' + small + '°，另一个锐角是（ ）', ans: String(90 - small) + '°', e: '直角三角形两个锐角和是 90°，另一个 = 90° − ' + small + '° = ' + (90 - small) + '°。' },
      { p: '一个三角形至少有（ ）个锐角', ans: '2', e: '一个三角形至少有 2 个锐角，最多有 3 个锐角。' },
      { p: '一个三角形三个角分别是 ' + a1 + '°、' + a2 + '°、' + a3 + '°，它是（ ）', ans: a3 > 90 ? '钝角三角形' : (a3 === 90 ? '直角三角形' : '锐角三角形'), e: '三个角分别是 ' + a1 + '°、' + a2 + '°、' + a3 + '°，按角分类判断。' },
      { p: '三角形三个内角为 ' + a1 + '°、' + a2 + '°、' + a3 + '°，这个三角形是（ ）', ans: a3 > 90 ? '钝角三角形' : (a3 === 90 ? '直角三角形' : '锐角三角形'), e: '看最大角：' + Math.max(a1, a2, a3) + '°，据此判断三角形类型。' },
      { p: '一个三角形两边长 ' + s1 + ' cm 和 ' + s1 + ' cm，它一定是（ ）', ans: '等腰三角形', e: '有两条边相等的三角形是等腰三角形。' },
      { p: '三角形三边为 ' + s1 + ' cm、' + s1 + ' cm、' + s1 + ' cm，它是（ ）', ans: '等边三角形', e: '三条边都相等的三角形是等边三角形，也叫正三角形。' },
      { p: '一个三角形最大角是 ' + Math.max(a1, a2, a3) + '°，它是（ ）', ans: Math.max(a1, a2, a3) > 90 ? '钝角三角形' : (Math.max(a1, a2, a3) === 90 ? '直角三角形' : '锐角三角形'), e: '看最大角判断三角形类型。' }
    ];
    var it = U.pick(items);
    var prompt = U.pick([
      it.p,
      who + '想一想：' + it.p,
      it.p + ' 正确答案是？',
      '根据三角形分类，' + it.p
    ]);
    var pool = classes.slice();
    pool.push('45°', '90°', '30°', '180°', '1 个', '3 个', '无法确定', '等腰直角三角形', '60°', '120°', '4 个', '5 个');
    return q({
      topicId: 'g4b.u5.classify', level: level,
      prompt: prompt,
      correct: it.ans,
      wrongs: three(it.ans, pool),
      explain: it.e
    });
  });

  /* ---------- 6.1 小数加减法 ---------- */
  R('g4b.u6.calc', function (level) {
    var who = U.pick(WHO);
    var forms = [
      function () {
        var a = U.randInt(100, 999), b = U.randInt(100, 999);
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' = （ ）', ans: a + b };
      },
      function () {
        var a = U.randInt(200, 999), b = U.randInt(100, a - 1);
        return { p: fmtCents(a) + ' − ' + fmtCents(b) + ' = （ ）', ans: a - b };
      },
      function () {
        var a = U.randInt(100, 500), b = U.randInt(100, 500), c = U.randInt(100, 500);
        return { p: fmtCents(a) + ' + ' + fmtCents(b) + ' + ' + fmtCents(c) + ' = （ ）', ans: a + b + c };
      },
      function () {
        var a = U.randInt(300, 999), b = U.randInt(100, a - 150), c = U.randInt(50, 200);
        return { p: fmtCents(a) + ' − ' + fmtCents(b) + ' + ' + fmtCents(c) + ' = （ ）', ans: a - b + c };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([
      '计算：' + f.p,
      who + '算一算：' + f.p,
      '用竖式计算 ' + f.p,
      '小数加减练习 ' + f.p,
      '请看算式 ' + f.p + ' 结果是多少？'
    ]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans * 10, f.ans + 1000, f.ans * 2];
    return q({
      topicId: 'g4b.u6.calc', level: level,
      prompt: prompt,
      correct: fmtCents(f.ans),
      wrongs: three(fmtCents(f.ans), pool.map(function (x) { return fmtCents(x); })),
      explain: '计算小数加减法时，先把小数点对齐（也就是相同数位对齐），再按整数加减法计算。结果：' + fmtCents(f.ans) + '。'
    });
  });

  /* ---------- 6.2 小数加减简便计算 ---------- */
  R('g4b.u6.simplify', function (level) {
    var who = U.pick(WHO);
    var forms = [
      function () {
        var a = U.randInt(11, 49), c = 100 - a, b = U.randInt(11, 89);
        return { p: fmtCents(a * 10) + ' + ' + fmtCents(b * 10) + ' + ' + fmtCents(c * 10) + ' = （ ）', ans: 1000 + b * 10, e: '运用加法交换律和结合律：' + fmtCents(a * 10) + ' + ' + fmtCents(c * 10) + ' = 10，再加 ' + fmtCents(b * 10) + '。' };
      },
      function () {
        var a = U.randInt(11, 89), c = 100 - a, b = U.randInt(11, 89);
        return { p: fmtCents(a * 100) + ' + ' + fmtCents(b * 100) + ' + ' + fmtCents(c * 100) + ' = （ ）', ans: 10000 + b * 100, e: '先把能凑整的 ' + fmtCents(a * 100) + ' 和 ' + fmtCents(c * 100) + ' 相加得 100，再加 ' + fmtCents(b * 100) + '。' };
      },
      function () {
        var b = U.randInt(50, 200), c = U.randInt(50, 200);
        var a = b + c + U.randInt(50, 500);
        var ans = a - b - c;
        return { p: fmtCents(a) + ' − ' + fmtCents(b) + ' − ' + fmtCents(c) + ' = （ ）', ans: ans, e: '用减法性质：' + fmtCents(a) + ' − (' + fmtCents(b) + ' + ' + fmtCents(c) + ') = ' + fmtCents(ans) + '。' };
      },
      function () {
        var a = U.randInt(100, 900);
        var b = U.randInt(9, 19);
        var ans = a + b * 10;
        return { p: fmtCents(a) + ' + ' + fmtCents(b * 10) + ' = （ ）', ans: ans, e: '把 ' + fmtCents(b * 10) + ' 看成 ' + fmtCents((b + 10) * 10) + ' − ' + fmtCents(100) + '，凑整：' + fmtCents(a) + ' + ' + fmtCents((b + 10) * 10) + ' − 1 = ' + fmtCents(ans) + '。' };
      }
    ];
    var f = U.pick(forms)();
    var prompt = U.pick([
      '用简便方法计算：' + f.p,
      who + '用简便方法算：' + f.p,
      '怎样简便就怎样算 ' + f.p,
      '脱式计算（能简算的要简算）' + f.p
    ]);
    var pool = [f.ans + 1, f.ans - 1, f.ans + 10, f.ans - 10, f.ans + 100, f.ans - 100, f.ans + 2, f.ans * 10, f.ans + 1000, f.ans * 2, f.ans + 5, f.ans - 5];
    return q({
      topicId: 'g4b.u6.simplify', level: level,
      prompt: prompt,
      correct: fmtCents(f.ans),
      wrongs: three(fmtCents(f.ans), pool.map(function (x) { return fmtCents(x); })),
      explain: f.e
    });
  });

  /* ---------- 7.1 图形的运动：轴对称 ---------- */
  R('g4b.u7.symmetry', function (level) {
    var cols = U.pick([5, 6, 7]);
    var rows = U.pick([3, 4, 5]);
    var axis = U.randInt(2, Math.floor(cols / 2));
    var cells = [];
    for (var x = 0; x < axis; x++) {
      for (var y = 0; y < rows; y++) cells.push([x, y]);
    }
    var filled = U.shuffle(cells).slice(0, U.randInt(3, 5));
    var need = filled.length;
    var who = U.pick(WHO);
    var mat = U.pick(['小正方形', '方格', '格子', '正方形']);
    var prompt = U.pick([
      who + '在 ' + cols + ' 列 ' + rows + ' 行的方格纸上画了图形，虚线是对称轴。要把左半边补成轴对称图形，右边还需要涂几个' + mat + '？',
      '下面是 ' + cols + ' 列 ' + rows + ' 行的方格图，虚线为对称轴。右半边还要涂多少个' + mat + '才能对称？',
      '以虚线为对称轴（' + cols + ' 列 ' + rows + ' 行），右半边已涂 ' + need + ' 个' + mat + '，左边还要补几个？',
      who + '观察对称轴，这个 ' + cols + ' 列 ' + rows + ' 行的图形右边还需要补几个' + mat + '才能对称？',
      '在 ' + cols + ' × ' + rows + ' 的方格图中，虚线是对称轴，左半边已涂 ' + need + ' 格，右边还要涂几格？',
      who + '在方格纸上画了一个轴对称图形的一半（' + cols + ' 列 ' + rows + ' 行，左半边涂了 ' + need + ' 格），右半边还要涂几格？',
      '虚线把 ' + cols + ' 列 ' + rows + ' 行的方格图分成两半，左半边已涂 ' + need + ' 格。右半边还要涂几格才能对称？',
      who + '补画轴对称图形：' + cols + ' 列 ' + rows + ' 行的方格图中，左半边涂了 ' + need + ' 格，右边还要涂几格？'
    ]);
    var pool = [need + 1, need - 1, need + 2, need - 2, need + 3, need + 4, need + 5, need + 6, filled.length + 1, filled.length + 2, rows, cols, axis, rows * cols, need * 2, need + 7, need + 8, axis * 2, rows + cols, cols * 2, need - 3, need + 10];
    return q({
      topicId: 'g4b.u7.symmetry', level: level,
      prompt: prompt,
      canvas: { kind: 'symmetry', cols: cols, rows: rows, axis: axis, filled: filled },
      correct: need,
      wrongs: three(need, pool),
      explain: '对称点到对称轴的距离相等，左半边有 ' + need + ' 个格子，右边就要补同样多的格子。'
    });
  });

  /* ---------- 7.2 图形的运动：平移 ---------- */
  var TRANS_SHAPES = [
    { cells: [[0, 0], [1, 0], [0, 1]], k: 3, label: '由 3 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0]], k: 3, label: '由 3 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], k: 4, label: '由 4 个小正方形拼成的' },
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], k: 4, label: '由 4 个小正方形拼成的' }
  ];
  R('g4b.u7.translate', function (level) {
    var shape = U.pick(TRANS_SHAPES);
    var width = 0;
    shape.cells.forEach(function (c) { if (c[0] + 1 > width) width = c[0] + 1; });
    var steps = U.randInt(3, 8);
    var cols = steps + width + U.pick([2, 5, 8]);
    var rows = U.pick([3, 4, 5]);
    var who = U.pick(WHO);
    var prompt = U.pick([
      who + '在 ' + cols + ' 列的方格纸中画了一个图形（' + shape.label + '），虚线图形是它向右平移后的位置。它向右平移了几格？',
      who + '在 ' + cols + ' 列的方格纸中画的图形（' + shape.label + '），要向右平移几格才能与虚线图形重合？',
      who + '在 ' + cols + ' 列 ' + rows + ' 行的方格纸中画了由 ' + shape.k + ' 个小正方形组成的图形，虚线图形是平移后的位置，它向右平移了（ ）格。',
      who + '画的' + shape.label + '图形，在 ' + cols + ' 列的方格纸中向右平移后得到虚线图形，平移了几格？',
      '在 ' + cols + ' 列的方格纸中，' + who + '把' + shape.label + '图形向右平移后得到虚线图形，图形平移了（ ）格。',
      who + '数一数：在 ' + cols + ' 列 ' + rows + ' 行的方格纸中，' + shape.label + '图形向右平移了（ ）格与虚线图形重合？'
    ]);
    var pool = [steps + 1, steps - 1, steps + 2, steps - 2, steps + 3, steps - 3, steps + 4, steps * 2, steps + 5, steps + 8, steps + 10, steps + 6, steps - 4];
    return q({
      topicId: 'g4b.u7.translate', level: level,
      prompt: prompt,
      canvas: {
        kind: 'translate', cols: cols, rows: rows,
        shape: shape.cells, start: [0, 0], end: [steps, 0]
      },
      correct: steps,
      wrongs: three(steps, pool),
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
    var who = U.pick(WHO);
    var act = U.pick([
      { what: '跳绳', unit: '个' },
      { what: '拍球', unit: '下' },
      { what: '口算', unit: '题' },
      { what: '读书', unit: '页' },
      { what: '跑步', unit: '米' }
    ]);
    var cls = U.pick(['四（1）班', '四（2）班', '四（3）班', '四（4）班']);
    var prompt = U.pick([
      cls + ' ' + n + ' 名同学每分钟' + act.what + '的个数分别是：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？',
      who + '统计了 ' + n + ' 位同学每分钟' + act.what + '的成绩：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？',
      cls + '第 ' + n + ' 小组 ' + n + ' 名同学一分钟' + act.what + '成绩为 ' + vals.join('、') + '，平均每人' + act.what + '多少' + act.unit + '？',
      n + ' 名同学每分钟' + act.what + '个数：' + vals.join('、') + '。平均每人' + act.what + '多少' + act.unit + '？'
    ]);
    var pool = [mean + 1, mean - 1, mean + 2, mean - 2, mean + 10, mean - 10, Math.max.apply(null, vals), Math.min.apply(null, vals), mean + 5, mean - 5, mean * 2, Math.max.apply(null, vals) + 1];
    return q({
      topicId: 'g4b.u8.mean', level: level,
      prompt: prompt,
      correct: mean,
      wrongs: three(mean, pool),
      explain: '平均数 = 总数 ÷ 份数 = ' + sum + ' ÷ ' + n + ' = ' + mean + '。'
    });
  });

  /* ---------- 8.2 统计图中的平均数 ---------- */
  R('g4b.u8.chart', function (level) {
    var catsChoices = [
      ['周一', '周二', '周三', '周四', '周五'],
      ['一班', '二班', '三班', '四班', '五班'],
      ['男生', '女生', '老师', '家长', '客人'],
      ['红球', '黄球', '蓝球', '绿球', '白球']
    ];
    var cats = U.pick(catsChoices);
    var vals = [];
    var sum = 0;
    for (var i = 0; i < cats.length; i++) { var v = U.randInt(5, 20); vals.push(v); sum += v; }
    var adjust = (5 - (sum % 5)) % 5;
    vals[0] += adjust;
    sum += adjust;
    var mean = sum / 5;
    var who = U.pick(WHO);
    var unit = U.pick(['人', '个', '棵', '朵', '箱']);
    var title = U.pick(['人数统计', '数量统计', '产量统计', '销售统计', '借书统计', '借书量']);
    var prompt = U.pick([
      '根据' + title + '（共 ' + cats.length + ' 组，总数 ' + sum + ' ' + unit + '），平均每组有多少' + unit + '？',
      who + '看统计图：这 ' + cats.length + ' 组数据一共 ' + sum + ' ' + unit + '，平均每组是多少' + unit + '？',
      '根据条形统计图，这 ' + cats.length + ' 组共 ' + sum + ' ' + unit + '，平均每天是多少' + unit + '？',
      '把统计图中的 ' + cats.length + ' 个数据（共 ' + sum + ' ' + unit + '）平均，每组是多少' + unit + '？',
      who + '统计了 ' + cats.length + ' 组数据共 ' + sum + ' ' + unit + '，平均每组是多少？',
      title + '中，' + cats.length + ' 组数据总数为 ' + sum + ' ' + unit + '，平均每组多少' + unit + '？',
      '看图算一算：' + cats.length + ' 组共 ' + sum + ' ' + unit + '，平均每组多少' + unit + '？',
      who + '整理的' + title + '有 ' + cats.length + ' 组共 ' + sum + ' ' + unit + '，平均每组多少' + unit + '？'
    ]);
    var pool = [mean + 1, mean - 1, mean + 2, mean - 2, mean + 3, mean - 3, mean + 5, Math.max.apply(null, vals), Math.min.apply(null, vals), Math.max.apply(null, vals) + 1, mean * 2, mean + 10];
    return q({
      topicId: 'g4b.u8.chart', level: level,
      prompt: prompt,
      canvas: { kind: 'bar-chart', categories: cats, values: vals, unit: unit },
      correct: mean,
      wrongs: three(mean, pool),
      explain: '先求总数 ' + sum + '，再除以 5，平均每组 ' + mean + ' ' + unit + '。'
    });
  });

  /* ---------- 9.1 鸡兔同笼 ---------- */
  R('g4b.u9.chicken', function (level) {
    var rabbits = U.randInt(1, level >= 3 ? 15 : 9);
    var chickens = U.randInt(1, level >= 3 ? 15 : 9);
    var heads = rabbits + chickens;
    var legs = rabbits * 4 + chickens * 2;
    var ans = '鸡 ' + chickens + ' 只，兔 ' + rabbits + ' 只';
    var who = U.pick(WHO);
    var where = U.pick(['笼子', '院子', '围栏', '鸡舍']);
    var prompt = U.pick([
      where + '里有鸡和兔共 ' + heads + ' 只，一共 ' + legs + ' 条腿。鸡和兔各有多少只？',
      who + '数了数' + where + '里的鸡和兔，头共 ' + heads + ' 个，脚共 ' + legs + ' 只。鸡兔各几只？',
      where + '里养鸡和兔，从上面数有 ' + heads + ' 个头，从下面数有 ' + legs + ' 只脚。鸡和兔各有几只？',
      '鸡和兔关在同一个' + where + '里，共有 ' + heads + ' 个头、' + legs + ' 条腿。鸡有多少只？兔有多少只？',
      who + '发现' + where + '里的鸡和兔共有 ' + heads + ' 只、' + legs + ' 条腿。鸡兔各几只？'
    ]);
    return q({
      topicId: 'g4b.u9.chicken', level: level,
      prompt: prompt,
      correct: ans,
      wrongs: chickenWrongs(chickens, rabbits),
      explain: '假设全是鸡，共有 ' + heads * 2 + ' 条腿，比实际少 ' + (legs - heads * 2) +
        ' 条。每把一只鸡换成兔多 2 条腿，所以兔有 ' + rabbits + ' 只，鸡有 ' + chickens + ' 只。'
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
