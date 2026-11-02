/* 会话状态机：单元关（有血量）与学期测验（无血量）共用一套答题流程 */
(function (global) {
  'use strict';
  var MG = global.MG;
  var U = MG.util;

  var MAX_DIVERSITY_ATTEMPTS = 20;

  /* 生成一道未出现在 avoid 中的题；重试耗尽时返回最后一题并标记重复 */
  function makeQuestion(topicId, level, avoid) {
    var last = null;
    var lastKey = '';
    for (var attempt = 0; attempt < MAX_DIVERSITY_ATTEMPTS; attempt++) {
      try {
        var q = MG.gen.create(topicId, level);
        var key = MG.q.key(topicId, q);
        last = q;
        lastKey = key;
        if (!avoid || !avoid[key]) {
          return { question: q, key: key, duplicate: false };
        }
      } catch (e) {
        /* 单题异常时换同知识点的另一个题目；连续失败则抛出由上层兜底 */
      }
    }
    if (!last) throw new Error('无法生成合法题目: ' + topicId);
    return { question: last, key: lastKey, duplicate: true };
  }

  function rotateTopics(topics) {
    var off = U.randInt(0, topics.length - 1);
    return topics.slice(off).concat(topics.slice(0, off));
  }

  /* 不超过 6 个知识点时全部覆盖；超过 6 个时随机抽 6 个不同知识点 */
  function planTopics(topics) {
    if (topics.length > 6) return U.shuffle(topics).slice(0, 6);
    return rotateTopics(topics);
  }

  function allocate(units, total) {
    var quota = units.map(function () { return 1; });
    var left = total - units.length;
    var guard = 0;
    while (left > 0 && guard++ < 5000) {
      var i = U.randInt(0, units.length - 1);
      if (quota[i] < 4) { quota[i]++; left--; }
    }
    return quota;
  }

  MG.session = {
    state: null,

    startLevel: function (unit) {
      var topics = planTopics(unit.topics);
      var difficulties = MG.difficulty ? MG.difficulty.mix() : [1, 1, 2, 2, 3, 3];
      var used = Object.create(null);
      var queue = difficulties.map(function (d, i) {
        var topic = topics[i % topics.length];
        var made = makeQuestion(topic.gen, d, used);
        used[made.key] = true;
        return {
          topicId: topic.gen,
          topicName: topic.name,
          level: d,
          question: made.question,
          duplicate: made.duplicate
        };
      });
      this.state = {
        mode: 'level',
        unitId: unit.id,
        unitName: unit.name,
        queue: queue,
        index: 0,
        hearts: 3,
        hp: 6,
        combo: 0,
        phase: 'question',
        finished: false,
        won: false,
        stars: 0,
        answers: [],
        wrongs: [],
        usedKeys: used,
        startedAt: Date.now()
      };
      return this.state;
    },

    startExam: function (semester, gradeId) {
      var units = semester.units;
      var quota = allocate(units, 20);
      var used = Object.create(null);
      var queue = [];
      units.forEach(function (unit, ui) {
        var topics = rotateTopics(unit.topics);
        for (var j = 0; j < quota[ui]; j++) {
          var topic = topics[j % topics.length];
          var level = MG.difficulty ? MG.difficulty.examLevel(j) : (j % 3) + 1;
          var made = makeQuestion(topic.gen, level, used);
          used[made.key] = true;
          queue.push({
            topicId: topic.gen,
            topicName: topic.name,
            unitId: unit.id,
            level: level,
            question: made.question,
            duplicate: made.duplicate
          });
        }
      });
      queue = U.shuffle(queue);
      this.state = {
        mode: 'exam',
        gradeId: gradeId,
        semesterId: semester.id,
        semesterName: semester.name,
        queue: queue,
        index: 0,
        phase: 'question',
        finished: false,
        answers: [],
        wrongs: [],
        usedKeys: used,
        secondsLimit: queue.length * 30,
        startedAt: Date.now(),
        deadline: Date.now() + queue.length * 30 * 1000
      };
      return this.state;
    },

    current: function () {
      var s = this.state;
      if (!s || s.finished) return null;
      var item = s.queue[s.index];
      return item ? item.question : null;
    },

    currentItem: function () {
      var s = this.state;
      return s && s.queue ? s.queue[s.index] : null;
    },

    /* 单元关：一次作答。返回 { correct, dmg, finished, won } */
    answerLevel: function (choice) {
      var s = this.state;
      if (!s || s.finished || s.phase !== 'question') return null;
      var item = s.queue[s.index];
      var q = item.question;
      var correct = choice === q.answerIndex;
      var dmg = 0;

      if (correct) {
        s.combo += 1;
        dmg = 1;
        if (s.combo >= 3) { dmg = 2; s.combo = 0; }
        s.hp -= dmg;
        /* 致命一击（敌人被击败）不播 correct/super，爆炸音由战斗界面统一播放，避免叠音 */
        if (s.hp > 0) MG.audio.play(dmg === 2 ? 'super' : 'correct');
      } else {
        s.combo = 0;
        s.hearts -= 1;
        s.wrongs.push({
          prompt: q.prompt,
          answer: q.answer,
          chosen: q.options[choice],
          topicId: item.topicId,
          unitId: s.unitId
        });
        MG.audio.play('wrong');
        /* 同一知识点换数字重出，题号与血量都不变；避开刚答错和本关已出现的题 */
        var avoid = Object.create(null);
        Object.keys(s.usedKeys || {}).forEach(function (k) { avoid[k] = true; });
        avoid[MG.q.key(item.topicId, q)] = true;
        var made = makeQuestion(item.topicId, item.level, avoid);
        item.question = made.question;
        item.duplicate = made.duplicate;
        s.usedKeys = s.usedKeys || Object.create(null);
        s.usedKeys[made.key] = true;
      }

      s.answers.push({ topicId: item.topicId, correct: correct, level: item.level, prompt: q.prompt });

      if (s.hp <= 0) {
        s.finished = true;
        s.won = true;
        s.stars = Math.max(1, s.hearts);
      } else if (s.hearts <= 0) {
        s.finished = true;
        s.won = false;
        s.stars = 0;
      }
      s.phase = 'feedback';
      return { correct: correct, dmg: dmg, finished: s.finished, won: s.won, question: q };
    },

    /* 反馈结束后推进 */
    nextLevel: function () {
      var s = this.state;
      if (!s) return null;
      if (s.finished) {
        s.phase = 'done';
        return { done: true };
      }
      s.phase = 'question';
      s.index += 1;
      if (s.index >= s.queue.length) {
        s.index = s.queue.length - 1;
        s.finished = true;
        s.won = true;
        s.stars = Math.max(1, s.hearts);
        s.phase = 'done';
        return { done: true };
      }
      return { done: false };
    },

    /* 学期测验：作答即推进，无即时反馈 */
    answerExam: function (choice) {
      var s = this.state;
      if (!s || s.finished) return null;
      var item = s.queue[s.index];
      var q = item.question;
      var correct = choice === q.answerIndex;
      s.answers.push({
        topicId: item.topicId,
        unitId: item.unitId,
        correct: correct,
        prompt: q.prompt,
        answer: q.answer,
        chosen: choice >= 0 ? q.options[choice] : '未作答'
      });
      if (!correct) {
        s.wrongs.push({
          prompt: q.prompt,
          answer: q.answer,
          chosen: choice >= 0 ? q.options[choice] : '未作答',
          topicId: item.topicId,
          unitId: item.unitId
        });
        MG.audio.play('wrong');
      } else {
        MG.audio.play('click');
      }
      s.index += 1;
      if (s.index >= s.queue.length) {
        return this.finishExam(false);
      }
      return { finished: false, correct: correct };
    },

    /* timedOut 为 true 时，未作答题目计为错误 */
    finishExam: function (timedOut) {
      var s = this.state;
      if (!s || s.finished) return s;
      while (s.answers.length < s.queue.length) {
        var item = s.queue[s.answers.length];
        s.answers.push({
          topicId: item.topicId,
          unitId: item.unitId,
          correct: false,
          prompt: item.question.prompt,
          answer: item.question.answer,
          chosen: '未作答'
        });
        s.wrongs.push({
          prompt: item.question.prompt,
          answer: item.question.answer,
          chosen: '未作答',
          topicId: item.topicId,
          unitId: item.unitId
        });
      }
      var correct = s.answers.filter(function (a) { return a.correct; }).length;
      s.finished = true;
      s.phase = 'done';
      s.timedOut = !!timedOut;
      s.result = {
        correct: correct,
        total: s.queue.length,
        accuracy: Math.round((correct / s.queue.length) * 100),
        seconds: Math.min(s.secondsLimit, Math.round((Date.now() - s.startedAt) / 1000)),
        wrongs: s.wrongs
      };
      return s.result;
    },

    weakestTopic: function () {
      var s = this.state;
      if (!s || !s.wrongs.length) return null;
      var count = Object.create(null);
      s.wrongs.forEach(function (w) { count[w.topicId] = (count[w.topicId] || 0) + 1; });
      return Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
