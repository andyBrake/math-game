/* 三档难度：每关题目级别配方、测验级别序列与金币倍数 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var LEVELS = [
    {
      id: 'easy',
      name: '轻松',
      mix: [1, 1, 1, 1, 2, 2],
      exam: [1, 2],
      multiplier: 1,
      desc: '1~2 级题，刚学完也能打'
    },
    {
      id: 'normal',
      name: '标准',
      mix: [1, 1, 2, 2, 3, 3],
      exam: [1, 2, 3],
      multiplier: 2,
      desc: '课本难度混合，金币 ×2'
    },
    {
      id: 'hard',
      name: '挑战',
      mix: [4, 4, 4, 4, 4, 4],
      exam: [4],
      multiplier: 3,
      desc: '全部挑战题，金币 ×3'
    }
  ];

  var DEFAULT_ID = 'normal';

  function find(id) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === id) return LEVELS[i];
    }
    return null;
  }

  MG.difficulty = {
    levels: LEVELS,
    DEFAULT_ID: DEFAULT_ID,

    find: function (id) {
      return find(id);
    },

    /* 从存档读取；非法或缺失都回退到标准 */
    get: function () {
      var id = MG.store && MG.store.data && MG.store.data.settings
        ? MG.store.data.settings.difficulty
        : DEFAULT_ID;
      return find(id) || find(DEFAULT_ID);
    },

    set: function (id) {
      if (!find(id)) return false;
      MG.store.setSetting('difficulty', id);
      return true;
    },

    mix: function () {
      return this.get().mix.slice();
    },

    multiplier: function () {
      return this.get().multiplier;
    },

    /* 测验第 index 题的级别，按档位序列循环 */
    examLevel: function (index) {
      var seq = this.get().exam;
      return seq[index % seq.length];
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
