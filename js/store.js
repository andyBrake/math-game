/* 存档：localStorage 优先，不可用时降级为内存并对外暴露 degraded 标志 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var KEY = 'math-game.grade4.v1';
  var VERSION = 1;
  var MAX_WRONGS = 200;

  function blank() {
    return {
      version: VERSION,
      units: {},
      exams: {},
      wrongs: [],
      settings: { mute: false, character: 'mario', difficulty: 'normal' },
      coins: 0,
      owned: {},
      equipped: { avatar: 'default', music: 'default', effect: 'default' }
    };
  }

  function normalize(data) {
    if (!data || typeof data !== 'object') return blank();
    if (!data.settings || typeof data.settings !== 'object') data.settings = {};
    if (typeof data.settings.mute !== 'boolean') data.settings.mute = false;
    if (data.settings.character !== 'link') data.settings.character = 'mario';
    if (typeof data.settings.difficulty !== 'string') data.settings.difficulty = 'normal';

    if (!data.units || typeof data.units !== 'object') data.units = {};
    if (!data.exams || typeof data.exams !== 'object') data.exams = {};
    if (!Array.isArray(data.wrongs)) data.wrongs = [];

    var coins = Number(data.coins);
    data.coins = isFinite(coins) && coins > 0 ? Math.floor(coins) : 0;

    if (!data.owned || typeof data.owned !== 'object') data.owned = {};
    if (!data.equipped || typeof data.equipped !== 'object') data.equipped = {};
    ['avatar', 'music', 'effect'].forEach(function (slot) {
      if (typeof data.equipped[slot] !== 'string' || !data.equipped[slot]) {
        data.equipped[slot] = 'default';
      }
    });
    return data;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  MG.store = {
    data: blank(),
    degraded: false,

    _read: function () {
      try {
        var raw = global.localStorage.getItem(KEY);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== VERSION) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    },

    init: function () {
      var loaded = null;
      try {
        /* 探测写能力，隐私模式下 getItem 可用但 setItem 会抛错 */
        global.localStorage.setItem(KEY + '.probe', '1');
        global.localStorage.removeItem(KEY + '.probe');
        loaded = this._read();
      } catch (e) {
        this.degraded = true;
      }
      this.data = normalize(loaded) || blank();
      if (loaded) this.save();
      return this.data;
    },

    save: function () {
      if (this.degraded) return false;
      try {
        global.localStorage.setItem(KEY, JSON.stringify(this.data));
        return true;
      } catch (e) {
        this.degraded = true;
        return false;
      }
    },

    unit: function (unitId) {
      return this.data.units[unitId] || null;
    },

    recordLevel: function (unitId, stars, meta) {
      var current = this.data.units[unitId] || { stars: 0, plays: 0, lastPlayed: 0 };
      current.plays += 1;
      current.lastPlayed = Date.now();
      current.lastStars = stars;
      if (stars > current.stars) current.stars = stars;
      if (meta && meta.weakest) current.lastTopic = meta.weakest;
      this.data.units[unitId] = current;
      this.save();
      return current;
    },

    recordExam: function (semesterId, result) {
      this.data.exams[semesterId] = {
        correct: result.correct,
        total: result.total,
        accuracy: result.accuracy,
        seconds: result.seconds,
        at: Date.now()
      };
      this.save();
    },

    addWrong: function (item) {
      this.data.wrongs.push({
        prompt: item.prompt,
        answer: item.answer,
        chosen: item.chosen,
        topicId: item.topicId,
        unitId: item.unitId,
        at: Date.now()
      });
      if (this.data.wrongs.length > MAX_WRONGS) {
        this.data.wrongs = this.data.wrongs.slice(this.data.wrongs.length - MAX_WRONGS);
      }
      this.save();
    },

    weakTopics: function (limit) {
      var counter = Object.create(null);
      this.data.wrongs.forEach(function (w) {
        counter[w.topicId] = (counter[w.topicId] || 0) + 1;
      });
      return Object.keys(counter)
        .map(function (id) { return { topicId: id, count: counter[id] }; })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, limit || 3);
    },

    totals: function () {
      var units = this.data.units;
      var cleared = 0, stars = 0, perfect = 0;
      Object.keys(units).forEach(function (id) {
        var u = units[id];
        if (u.stars > 0) cleared++;
        stars += u.stars;
        if (u.stars === 3) perfect++;
      });
      return { cleared: cleared, stars: stars, perfect: perfect };
    },

    setSetting: function (key, value) {
      this.data.settings[key] = value;
      this.save();
    },

    /* ---------- 金币与商店 ---------- */
    addCoins: function (n) {
      n = Math.floor(Number(n) || 0);
      if (!n) return this.data.coins;
      this.data.coins = Math.max(0, this.data.coins + n);
      this.save();
      return this.data.coins;
    },

    owns: function (id) {
      return id === 'default' || id === 'mario' || id === 'link' || !!this.data.owned[id];
    },

    /* 购买：余额不足或已拥有都不扣费 */
    buy: function (id, price) {
      if (this.owns(id)) return { ok: false, reason: 'owned' };
      price = Math.max(0, Math.floor(Number(price) || 0));
      if (this.data.coins < price) {
        return { ok: false, reason: 'poor', missing: price - this.data.coins };
      }
      this.data.coins -= price;
      this.data.owned[id] = true;
      this.save();
      return { ok: true, balance: this.data.coins };
    },

    equip: function (slot, id) {
      if (['avatar', 'music', 'effect'].indexOf(slot) < 0) return false;
      if (!this.owns(id)) return false;
      this.data.equipped[slot] = id;
      this.save();
      return true;
    },

    reset: function () {
      this.data = blank();
      this.save();
    },

    snapshot: function () {
      return clone(this.data);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
