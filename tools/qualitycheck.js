/* 题目多样性质量报告（node）：按知识点/等级抽样，统计题干、选项、模板与同关重复 */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var root = path.join(__dirname, '..');

  [
    'js/namespace.js',
    'data/curriculum.js',
    'data/difficulty.js',
    'data/generators/g4a.js',
    'data/generators/g4b.js',
    'data/generators/challenge.js',
    'js/session.js'
  ].forEach(function (rel) {
    (0, eval)(fs.readFileSync(path.join(root, rel), 'utf8'));
  });

  var MG = globalThis.MG;

  function pad(s, n) {
    s = String(s);
    while (s.length < n) s += ' ';
    return s;
  }

  function padLeft(s, n) {
    s = String(s);
    while (s.length < n) s = ' ' + s;
    return s;
  }

  function pct(v) {
    return (v * 100).toFixed(1) + '%';
  }

  function promptTemplate(prompt) {
    return String(prompt)
      .replace(/\d+(?:\.\d+)?/g, '#')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isFallbackOption(option) {
    return /^选项\d+$/.test(String(option));
  }

  function sampleTopic(topic, level, count) {
    var prompts = Object.create(null);
    var options = Object.create(null);
    var templates = Object.create(null);
    var answerPos = [0, 0, 0, 0];
    var fallback = 0;
    var errors = 0;
    var valid = 0;

    for (var i = 0; i < count; i++) {
      try {
        var q = MG.gen.create(topic.gen, level);
        valid++;
        prompts[q.prompt] = (prompts[q.prompt] || 0) + 1;
        options[q.options.slice().sort().join('\u0001')] = true;
        templates[q.template || promptTemplate(q.prompt)] = true;
        answerPos[q.answerIndex]++;
        if (q.options.some(isFallbackOption)) fallback++;
      } catch (e) {
        errors++;
      }
    }

    var promptKeys = Object.keys(prompts);
    var maxPrompt = 0;
    promptKeys.forEach(function (p) {
      if (prompts[p] > maxPrompt) maxPrompt = prompts[p];
    });

    return {
      count: count,
      valid: valid,
      errors: errors,
      uniquePrompt: promptKeys.length,
      uniquePromptRate: count ? promptKeys.length / count : 0,
      maxPromptShare: count ? maxPrompt / count : 0,
      uniqueOptions: Object.keys(options).length,
      optionRate: count ? Object.keys(options).length / count : 0,
      fallback: fallback,
      answerPos: answerPos,
      templateCount: Object.keys(templates).length
    };
  }

  function issueScore(row) {
    var score = 0;
    if (row.errors) score += 100 + row.errors;
    if (row.fallback) score += 50 + row.fallback;
    if (row.uniquePromptRate < 0.7) score += (0.7 - row.uniquePromptRate) * 100;
    if (row.maxPromptShare > 0.05) score += (row.maxPromptShare - 0.05) * 100;
    if (row.optionRate < 0.7) score += (0.7 - row.optionRate) * 100;
    if (row.templateCount < 4) score += (4 - row.templateCount) * 5;
    return score;
  }

  function answerText(pos, valid) {
    return pos.map(function (n) {
      return valid ? Math.round((n / valid) * 100) + '%' : '-';
    }).join('/');
  }

  function buildRows(samples) {
    var rows = [];
    MG.data.allUnits().forEach(function (unit) {
      unit.topics.forEach(function (topic) {
        for (var level = 1; level <= 4; level++) {
          var m = sampleTopic(topic, level, samples);
          rows.push({
            unitId: unit.id,
            topicId: topic.id,
            gen: topic.gen,
            name: topic.name,
            level: level,
            count: m.count,
            valid: m.valid,
            errors: m.errors,
            uniquePrompt: m.uniquePrompt,
            uniquePromptRate: m.uniquePromptRate,
            maxPromptShare: m.maxPromptShare,
            uniqueOptions: m.uniqueOptions,
            optionRate: m.optionRate,
            fallback: m.fallback,
            answerPos: m.answerPos,
            templateCount: m.templateCount,
            score: 0
          });
        }
      });
    });
    rows.forEach(function (r) { r.score = issueScore(r); });
    rows.sort(function (a, b) { return b.score - a.score; });
    return rows;
  }

  function simulateLevels(units, total) {
    var duplicateLevels = 0;
    var duplicateQuestions = 0;
    var coverageProblems = 0;
    var errors = 0;
    var difficulties = ['easy', 'normal', 'hard'];

    MG.store = { data: { settings: { difficulty: 'normal' } } };

    for (var i = 0; i < total; i++) {
      var unit = units[i % units.length];
      MG.store.data.settings.difficulty = difficulties[i % difficulties.length];
      try {
        var state = MG.session.startLevel(unit);
        var keys = state.queue.map(function (item) {
          return MG.q.key(item.topicId, item.question);
        });
        var seen = Object.create(null);
        var dup = 0;
        keys.forEach(function (k) {
          if (seen[k]) dup++;
          seen[k] = true;
        });
        if (dup) {
          duplicateLevels++;
          duplicateQuestions += dup;
        }

        var topicCount = Object.create(null);
        state.queue.forEach(function (item) {
          topicCount[item.topicId] = (topicCount[item.topicId] || 0) + 1;
        });
        var counts = Object.keys(topicCount).map(function (k) { return topicCount[k]; });
        var covered = Object.keys(topicCount).length;
        var expected = Math.min(unit.topics.length, 6);
        var max = counts.length ? Math.max.apply(null, counts) : 0;
        var min = counts.length ? Math.min.apply(null, counts) : 0;
        if (covered !== expected) coverageProblems++;
        else if (unit.topics.length <= 6 && max - min > 1) coverageProblems++;
        if (state.queue.length !== 6) coverageProblems++;
      } catch (e) {
        errors++;
      }
    }

    return {
      total: total,
      duplicateLevels: duplicateLevels,
      duplicateQuestions: duplicateQuestions,
      coverageProblems: coverageProblems,
      errors: errors
    };
  }

  function strictFailures(rows, sim) {
    var fails = [];
    rows.forEach(function (r) {
      if (r.errors) fails.push(r.gen + ' L' + r.level + ' 生成异常 ' + r.errors);
      if (r.fallback) fails.push(r.gen + ' L' + r.level + ' 兜底选项 ' + r.fallback);
      if (r.uniquePromptRate < 0.7) fails.push(r.gen + ' L' + r.level + ' 题干唯一率 ' + pct(r.uniquePromptRate));
      if (r.maxPromptShare > 0.05) fails.push(r.gen + ' L' + r.level + ' 单题干占比 ' + pct(r.maxPromptShare));
      if (r.optionRate < 0.7) fails.push(r.gen + ' L' + r.level + ' 选项唯一率 ' + pct(r.optionRate));
      if (r.templateCount < 4) fails.push(r.gen + ' L' + r.level + ' 模板数 ' + r.templateCount);
      r.answerPos.forEach(function (n, i) {
        var rate = r.valid ? n / r.valid : 0;
        if (rate < 0.2 || rate > 0.3) {
          fails.push(r.gen + ' L' + r.level + ' 答案位置 ' + i + ' 占比 ' + pct(rate));
        }
      });
    });
    if (sim.duplicateLevels) fails.push('模拟关卡同关重复 ' + sim.duplicateLevels + '/' + sim.total);
    if (sim.coverageProblems) fails.push('模拟关卡覆盖异常 ' + sim.coverageProblems + '/' + sim.total);
    if (sim.errors) fails.push('模拟关卡生成异常 ' + sim.errors + '/' + sim.total);
    return fails;
  }

  function main() {
    var args = process.argv.slice(2);
    var samples = 200;
    var strict = false;
    var showAll = false;

    args.forEach(function (arg) {
      if (arg === '--strict') strict = true;
      else if (arg === '--all') showAll = true;
      else if (arg.indexOf('--samples=') === 0) {
        var n = Number(arg.slice('--samples='.length));
        if (n > 0) samples = Math.floor(n);
      } else if (/^\d+$/.test(arg)) {
        samples = Number(arg);
      }
    });

    var rows = buildRows(samples);
    var units = MG.data.allUnits();
    var sim = simulateLevels(units, 1000);
    var visible = showAll ? rows : rows.slice(0, 40);

    console.log('题目质量报告：每知识点每级 ' + samples + ' 题');
    console.log(pad('知识点', 26) + pad('级', 4) + padLeft('样本', 5) +
      padLeft('题干唯一', 9) + padLeft('最高占比', 9) + padLeft('选项唯一', 9) +
      padLeft('兜底', 5) + padLeft('答位分布', 14) + padLeft('模板', 5));

    visible.forEach(function (r) {
      console.log(
        pad(r.gen, 26) + pad('L' + r.level, 4) + padLeft(r.count, 5) +
        padLeft(pct(r.uniquePromptRate), 9) + padLeft(pct(r.maxPromptShare), 9) +
        padLeft(pct(r.optionRate), 9) + padLeft(r.fallback, 5) + ' ' +
        padLeft(answerText(r.answerPos, r.valid), 14) + padLeft(r.templateCount, 5)
      );
    });
    if (!showAll && rows.length > visible.length) {
      console.log('（仅显示问题最多的 ' + visible.length + ' 行，使用 --all 查看全部 ' + rows.length + ' 行）');
    }

    console.log('\n模拟关卡：' + sim.total +
      '  同关重复关卡：' + sim.duplicateLevels +
      '  重复题数：' + sim.duplicateQuestions +
      '  覆盖异常：' + sim.coverageProblems +
      '  生成异常：' + sim.errors);

    var fails = strictFailures(rows, sim);
    if (strict) {
      console.log('严格模式：' + (fails.length ? '失败 ' + fails.length + ' 项' : '通过'));
      fails.slice(0, 20).forEach(function (f) { console.log('  - ' + f); });
      if (fails.length > 20) console.log('  ... 其余 ' + (fails.length - 20) + ' 项省略');
      if (fails.length) process.exitCode = 1;
    } else {
      console.log('提示：当前为只报告模式；加 --strict 可按阈值返回非 0。');
    }
  }

  main();
})();
