/* 出题器自检（node 与浏览器通用）：每个知识点生成 N 题并校验约束 */
(function (global) {
  'use strict';

  function negativeHit(text) {
    return /(^|[^0-9])-\d/.test(String(text));
  }

  function makeSelfcheck(MG) {
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
      });
      return errs;
    }

    function run(options) {
      options = options || {};
      var perTopic = options.perTopic || 1000;
      var onTopic = options.onTopic || function () {};
      var failures = [];
      var total = 0;
      var units = MG.data.allUnits();

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
          onTopic({ unitId: unit.id, topicId: topic.id, name: topic.name, failures: local, count: perTopic });
        });
      });

      return {
        total: total,
        perTopic: perTopic,
        topics: units.reduce(function (n, u) { return n + u.topics.length; }, 0),
        failures: failures
      };
    }

    return { run: run, checkQuestion: checkQuestion };
  }

  global.MG = global.MG || {};
  global.MG.selfcheck = makeSelfcheck(global.MG);
  global.MG.makeSelfcheck = makeSelfcheck;
})(typeof window !== 'undefined' ? window : globalThis);

/* node 直跑：node tools/selfcheck.js [每知识点题数] */
if (typeof module !== 'undefined' && require.main === module) {
  var fs = require('fs');
  var path = require('path');
  var root = path.join(__dirname, '..');
  ['js/namespace.js', 'data/curriculum.js', 'data/generators/g4a.js', 'data/generators/g4b.js', 'data/generators/challenge.js']
    .forEach(function (rel) { (0, eval)(fs.readFileSync(path.join(root, rel), 'utf8')); });

  var MGn = globalThis.MG;
  var dataErrs = MGn.data.validate();
  console.log('数据校验: ' + (dataErrs.length ? '失败\n  - ' + dataErrs.join('\n  - ') : '通过'));

  var missing = [];
  var totalTopics = 0;
  MGn.data.allUnits().forEach(function (unit) {
    unit.topics.forEach(function (topic) {
      totalTopics++;
      if (!MGn.challengeIds || MGn.challengeIds.indexOf(topic.gen) === -1) missing.push(topic.gen);
    });
  });
  console.log('挑战题覆盖: ' + (missing.length ? '缺少 ' + missing.join(', ') : totalTopics + '/' + totalTopics + ' 全覆盖'));
  if (missing.length) process.exitCode = 1;

  var perTopic = Number(process.argv[2] || 1000);
  var result = MGn.makeSelfcheck(MGn).run({
    perTopic: perTopic,
    onTopic: function (t) {
      if (t.failures) console.log('  [x] ' + t.topicId + '  ' + t.name + '  失败 ' + t.failures);
    }
  });

  console.log('\n知识点数: ' + result.topics + '  生成题目: ' + result.total);
  if (result.failures.length) {
    console.log('失败 ' + result.failures.length + ' 例，前 5 例：');
    result.failures.slice(0, 5).forEach(function (f) {
      console.log('  - ' + f.topicId + ': ' + f.message);
      if (f.question) console.log('    ' + f.question.prompt + ' | ' + f.question.options.join(' / '));
    });
    process.exitCode = 1;
  } else {
    console.log('全部通过：每知识点 ' + perTopic + ' 题，共 ' + result.total + ' 题');
  }
}
