/* 全局命名空间与基础工具：不触碰 DOM，便于在 node 中做自检 */
(function (global) {
  'use strict';

  var MG = global.MG || (global.MG = {});

  MG.util = {
    randInt: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    pick: function (arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    clamp: function (v, lo, hi) {
      return Math.min(hi, Math.max(lo, v));
    },
    /* 去掉浮点误差，最多保留 2 位小数 */
    num: function (v) {
      return String(Math.round(v * 100) / 100);
    },
    repeat: function (str, n) {
      var out = '';
      for (var i = 0; i < n; i++) out += str;
      return out;
    }
  };

  MG.gen = {
    _registry: Object.create(null),

    register: function (id, fn) {
      if (typeof id !== 'string' || !id) throw new Error('生成器 id 无效');
      if (typeof fn !== 'function') throw new Error('生成器必须是函数: ' + id);
      this._registry[id] = fn;
    },
    has: function (id) {
      return typeof this._registry[id] === 'function';
    },
    get: function (id) {
      return this._registry[id];
    },
    ids: function () {
      return Object.keys(this._registry).sort();
    },
    /* 生成并做结构校验；非法时抛错，由调用方换题重试 */
    create: function (topicId, level, options) {
      var fn = this.get(topicId);
      if (!fn) throw new Error('未注册的生成器: ' + topicId);
      var q = fn(level || 1, options || {});
      return MG.q.validate(q, topicId);
    }
  };

  MG.q = {
    /* 统一题目结构；correct/wrongs 一律转字符串比较 */
    build: function (spec) {
      var correct = String(spec.correct);
      var seen = Object.create(null);
      seen[correct] = true;
      var wrongs = [];

      (spec.wrongs || []).forEach(function (w) {
        var s = String(w);
        if (!seen[s] && wrongs.length < 3) { seen[s] = true; wrongs.push(s); }
      });

      /* 数值题兜底：用邻近数值补足干扰项 */
      if (wrongs.length < 3 && /^-?\d+(\.\d+)?$/.test(correct)) {
        var num = Number(correct);
        var step = Math.max(1, Math.pow(10, Math.max(0, String(Math.abs(Math.trunc(num))).length - 2)));
        var k = 1;
        while (wrongs.length < 3 && k <= 60) {
          var cands = [num + k, num - k, num + step * k, num - step * k];
          for (var i = 0; i < cands.length && wrongs.length < 3; i++) {
            var s = MG.util.num(cands[i]);
            if (!seen[s] && Number(s) >= 0) { seen[s] = true; wrongs.push(s); }
          }
          k++;
        }
      }
      while (wrongs.length < 3) {
        var tag = '选项' + (wrongs.length + 1);
        if (!seen[tag]) { seen[tag] = true; wrongs.push(tag); }
      }

      var options = MG.util.shuffle([correct].concat(wrongs));
      return {
        topicId: spec.topicId,
        level: spec.level || 1,
        renderer: spec.canvas ? 'canvas' : 'text',
        canvas: spec.canvas || null,
        prompt: String(spec.prompt),
        options: options,
        answer: correct,
        answerIndex: options.indexOf(correct),
        explain: String(spec.explain || '')
      };
    },

    validate: function (q, topicId) {
      var errs = [];
      if (!q || typeof q !== 'object') { errs.push('题目不是对象'); }
      else {
        if (!q.prompt) errs.push('缺少题干');
        if (!Array.isArray(q.options) || q.options.length !== 4) errs.push('选项数量不是 4');
        else {
          var set = Object.create(null), dup = false;
          q.options.forEach(function (o) {
            var s = String(o);
            if (set[s]) dup = true;
            set[s] = true;
            if (!s || s === 'undefined' || s === 'NaN') errs.push('选项内容非法: ' + s);
          });
          if (dup) errs.push('选项重复');
        }
        if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) errs.push('答案下标非法');
        if (!q.explain) errs.push('缺少解析');
        if (q.renderer === 'canvas' && !q.canvas) errs.push('图形题缺少绘制数据');
      }
      if (errs.length) {
        var e = new Error('题目校验失败 [' + (topicId || '?') + ']: ' + errs.join('; '));
        e.detail = errs;
        e.question = q;
        throw e;
      }
      return q;
    },

    /* 稳定序列化：对象键排序，数组保持原序，用于比较图形绘制数据 */
    canonical: function (value) {
      if (typeof value === 'undefined') return 'undefined';
      if (value === null || typeof value !== 'object') return JSON.stringify(value);
      if (Array.isArray(value)) {
        return '[' + value.map(function (v) { return MG.q.canonical(v); }).join(',') + ']';
      }
      return '{' + Object.keys(value).sort().map(function (k) {
        return JSON.stringify(k) + ':' + MG.q.canonical(value[k]);
      }).join(',') + '}';
    },

    /* 同一关去重指纹：题干、图形和选项内容相同即视为同一题，忽略选项顺序 */
    key: function (topicId, q) {
      var options = (q.options || []).map(String).slice().sort();
      return JSON.stringify([
        topicId,
        String(q.prompt || '').replace(/\s+/g, ' ').trim(),
        MG.q.canonical(q.canvas || null),
        options
      ]);
    }
  };

  /* 教材数据：由 data/curriculum.js 填充 */
  MG.data = {
    curriculum: null,

    grades: function () {
      return (this.curriculum && this.curriculum.grades) || [];
    },
    getGrade: function (id) {
      return this.grades().filter(function (g) { return g.id === id; })[0] || null;
    },
    getSemester: function (gradeId, semesterId) {
      var g = this.getGrade(gradeId);
      if (!g || !g.semesters) return null;
      return g.semesters.filter(function (s) { return s.id === semesterId; })[0] || null;
    },
    allUnits: function () {
      var out = [];
      this.grades().forEach(function (g) {
        (g.semesters || []).forEach(function (s) {
          (s.units || []).forEach(function (u) { out.push(u); });
        });
      });
      return out;
    },
    getUnit: function (unitId) {
      return this.allUnits().filter(function (u) { return u.id === unitId; })[0] || null;
    },
    /* 启动期数据自检：结构完整性与生成器引用 */
    validate: function () {
      var errs = [];
      var c = this.curriculum;
      if (!c) return ['教材数据未加载'];
      if (!Array.isArray(c.grades) || !c.grades.length) errs.push('教材数据缺少 grades');
      var unitIds = Object.create(null);
      var semesterIds = Object.create(null);

      c.grades.forEach(function (g) {
        if (!g.id || !g.name) errs.push('年级缺少 id 或 name');
        if (!g.status) errs.push('年级缺少 status: ' + g.id);
        (g.semesters || []).forEach(function (s) {
          if (!s.id || !s.name) errs.push('学期缺少 id 或 name（年级 ' + g.id + '）');
          if (semesterIds[s.id]) errs.push('学期 id 重复: ' + s.id);
          semesterIds[s.id] = true;
          (s.units || []).forEach(function (u) {
            if (!u.id || !u.name) errs.push('单元缺少 id 或 name（学期 ' + s.id + '）');
            if (unitIds[u.id]) errs.push('单元 id 重复: ' + u.id);
            unitIds[u.id] = true;
            if (typeof u.order !== 'number') errs.push('单元缺少顺序: ' + u.id);
            if (typeof u.hasGraphics !== 'boolean') errs.push('单元缺少 hasGraphics: ' + u.id);
            if (!Array.isArray(u.topics) || !u.topics.length) errs.push('单元缺少知识点: ' + u.id);
            (u.topics || []).forEach(function (t) {
              if (!t.id || !t.name) errs.push('知识点缺少 id 或 name（单元 ' + u.id + '）');
              if (!t.gen) errs.push('知识点缺少生成器: ' + u.id + ' / ' + t.id);
              else if (!MG.gen.has(t.gen)) errs.push('知识点引用了不存在的生成器: ' + u.id + ' / ' + t.name + ' -> ' + t.gen);
            });
          });
          var orders = (s.units || []).map(function (u) { return u.order; });
          var sorted = orders.slice().sort(function (a, b) { return a - b; });
          if (orders.join(',') !== sorted.join(',')) errs.push('单元顺序不连续: ' + s.id);
        });
      });
      return errs;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
