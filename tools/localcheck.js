/* 局部校验（node）：只加载一个学期的生成器与挑战变体，校验该学期知识点。
   用法：node tools/localcheck.js <g4a|g4b> <parts 文件相对路径> [每知识点题数]
   例：  node tools/localcheck.js g4a data/generators/parts-a.js 300
   parts 文件会注入 data/generators/challenge.js 的对应占位符后重新求值。 */
(function () {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var root = path.join(__dirname, '..');
  var args = process.argv.slice(2);
  var sem = args[0] || 'g4a';
  var partsRel = args[1] || '';
  var perTopic = Number(args[2] || 300);

  function negativeHit(text) {
    return /(^|[^0-9])-\d/.test(String(text));
  }

  var loadList = ['js/namespace.js', 'data/curriculum.js'];
  loadList.push(sem === 'g4b' ? 'data/generators/g4b.js' : 'data/generators/g4a.js');
  loadList.forEach(function (rel) { (0, eval)(fs.readFileSync(path.join(root, rel), 'utf8')); });

  var MG = globalThis.MG;
  var challengeSrc = fs.readFileSync(path.join(root, 'data/generators/challenge.js'), 'utf8');
  if (partsRel) {
    var partSrc = fs.readFileSync(path.join(root, partsRel), 'utf8');
    challengeSrc = challengeSrc
      .replace('/*__PART_A__*/', sem === 'g4a' ? partSrc : '')
      .replace('/*__PART_B__*/', sem === 'g4b' ? partSrc : '');
  }
  (0, eval)(challengeSrc);

  var dataErrs = MG.data.validate();
  console.log('数据校验: ' + (dataErrs.length ? '失败\n  - ' + dataErrs.join('\n  - ') : '通过'));

  var missing = [];
  var units = MG.data.allUnits().filter(function (u) { return u.id.indexOf(sem + '-') === 0; });
  units.forEach(function (unit) {
    unit.topics.forEach(function (topic) {
      if (MG.challengeIds.indexOf(topic.gen) === -1) missing.push(topic.gen);
    });
  });
  console.log('挑战题覆盖(' + sem + '): ' + (missing.length ? '缺少 ' + missing.join(', ') : '全覆盖'));

  function checkQuestion(q) {
    var errs = [];
    if (!q.prompt || /undefined|NaN/.test(q.prompt)) errs.push('题干异常');
    if (!Array.isArray(q.options) || q.options.length !== 4) errs.push('选项数量异常');
    if (new Set(q.options).size !== 4) errs.push('选项重复');
    if (q.options[q.answerIndex] !== q.answer) errs.push('答案下标与答案不一致');
    if (!q.explain) errs.push('缺少解析');
    if (negativeHit(q.prompt)) errs.push('题干出现负数');
    q.options.forEach(function (o) {
      if (negativeHit(o)) errs.push('选项出现负数: ' + o);
      if (/undefined|NaN/.test(o)) errs.push('选项异常: ' + o);
      if (/^选项\d+$/.test(String(o))) errs.push('兜底选项: ' + o);
    });
    if (q.renderer === 'canvas' && !q.canvas) errs.push('图形题缺少绘制数据');
    if (q.canvas && q.canvas.kind === 'line-chart') {
      var d = q.canvas;
      if (!d.values || d.values.length < 2) errs.push('折线统计图数据不足');
    }
    return errs;
  }

  var failures = [];
  var total = 0;
  units.forEach(function (unit) {
    unit.topics.forEach(function (topic) {
      var local = 0;
      for (var i = 0; i < perTopic; i++) {
        total++;
        var level = (i % 4) + 1;
        try {
          var q = MG.gen.create(topic.gen, level);
          var errs = checkQuestion(q);
          if (errs.length) {
            failures.push({ unitId: unit.id, topicId: topic.id, message: errs.join('; '), question: q });
            local++;
          }
        } catch (e) {
          failures.push({ unitId: unit.id, topicId: topic.id, message: e.message, question: e.question || null });
          local++;
        }
      }
      if (local) console.log('  [x] ' + topic.topicId + ' ' + topic.name + ' 失败 ' + local);
    });
  });

  console.log('\n' + sem + ' 知识点数: ' + units.reduce(function (n, u) { return n + u.topics.length; }, 0) +
    '  生成题目: ' + total);
  if (failures.length) {
    console.log('失败 ' + failures.length + ' 例，前 5 例：');
    failures.slice(0, 5).forEach(function (f) {
      console.log('  - ' + f.topicId + ': ' + f.message);
      if (f.question) console.log('    ' + f.question.prompt + ' | ' + f.question.options.join(' / '));
    });
    process.exitCode = 1;
  } else {
    console.log('全部通过：每知识点 ' + perTopic + ' 题（含 4 级挑战），共 ' + total + ' 题');
  }
})();
