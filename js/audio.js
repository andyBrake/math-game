/* 8-bit 音效：WebAudio 即时合成，无音频文件，无背景音乐 */
(function (global) {
  'use strict';
  var MG = global.MG;

  /* 每个音符：f 频率、d 时长、type 波形、vol 音量、slide 滑到目标频率、vibrato 颤音 */
  var PATTERNS = {
    correct: [
      { f: 660, d: 0.06 },
      { f: 880, d: 0.10 }
    ],

    /* 答错：下行「哇—哇—哇——」，最后一个音往下滑并带颤音，
       全部落在 250~400Hz 有泛音的区间，小喇叭上也听得清 */
    wrong: [
      { f: 392, d: 0.14, type: 'square', vol: 0.10 },
      { f: 370, d: 0.14, type: 'square', vol: 0.10 },
      { f: 349, d: 0.14, type: 'square', vol: 0.10 },
      { f: 330, d: 0.16, type: 'sawtooth', vol: 0.11 },
      { f: 330, d: 0.42, type: 'sawtooth', vol: 0.11, slide: 247, vibrato: { rate: 5.5, depth: 6 } }
    ],

    super: [
      { f: 523, d: 0.05 },
      { f: 659, d: 0.05 },
      { f: 784, d: 0.05 },
      { f: 1046, d: 0.12 }
    ],

    win: [
      { f: 523, d: 0.08 },
      { f: 659, d: 0.08 },
      { f: 784, d: 0.08 },
      { f: 1046, d: 0.18 }
    ],

    fail: [
      { f: 392, d: 0.14, type: 'sawtooth', vol: 0.10 },
      { f: 330, d: 0.14, type: 'sawtooth', vol: 0.10 },
      { f: 262, d: 0.16, type: 'sawtooth', vol: 0.10 },
      { f: 196, d: 0.45, type: 'sawtooth', vol: 0.11, slide: 147, vibrato: { rate: 5, depth: 5 } }
    ],

    click: [
      { f: 880, d: 0.03 }
    ],

    /* 普通敌人爆炸：开头一声短噪声「啪」，接低频下坠的轰鸣尾音，总约 0.6s */
    boom: [
      { noise: true, d: 0.20, vol: 0.18, filterHz: 1200 },
      { f: 150, d: 0.40, type: 'sawtooth', vol: 0.14, slide: 50 }
    ],

    /* BOSS 爆炸：更低更沉更长，噪声更响更长，低频下坠到 45Hz，总约 0.95s */
    'boom-boss': [
      { noise: true, d: 0.35, vol: 0.22, filterHz: 900 },
      { f: 110, d: 0.60, type: 'sawtooth', vol: 0.16, slide: 45 }
    ]
  };

  MG.audio = {
    ctx: null,
    muted: false,
    unlocked: false,

    ensure: function () {
      if (this.muted) return null;
      if (!this.ctx) {
        var AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        try { this.ctx = new AC(); } catch (e) { return null; }
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    /* 首次手势时解锁音频，兼容移动端与自动播放策略 */
    unlock: function () {
      if (this.unlocked) return;
      var ctx = this.ensure();
      if (!ctx) return;
      this.unlocked = true;
      if (ctx.state === 'suspended') ctx.resume();
      /* 用一段极短的静音把管线跑通 */
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
    },

    tone: function (note, startAt) {
      /* 噪声音符走独立分支，由 pattern 编排进同一时间线 */
      if (note.noise) {
        this.noise(note, startAt);
        return;
      }
      var ctx = this.ensure();
      if (!ctx) return;
      var t0 = ctx.currentTime + (startAt || 0);
      var duration = note.d;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = note.type || 'square';
      osc.frequency.setValueAtTime(note.f, t0);
      if (note.slide) {
        osc.frequency.exponentialRampToValueAtTime(note.slide, t0 + duration);
      }

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(note.vol || 0.1, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      var lfo = null;
      if (note.vibrato) {
        lfo = ctx.createOscillator();
        var lfoGain = ctx.createGain();
        lfo.frequency.value = note.vibrato.rate;
        lfoGain.gain.value = note.vibrato.depth;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(t0);
        lfo.stop(t0 + duration + 0.02);
      }

      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },

    /* 白噪声爆点：AudioBuffer 填充随机采样，经低通滤波塑形后输出，
       用于爆炸的「啪」那一下。无外部音频文件，纯 WebAudio 合成 */
    noise: function (note, startAt) {
      var ctx = this.ensure();
      if (!ctx) return;
      var t0 = ctx.currentTime + (startAt || 0);
      var duration = note.d;
      var vol = note.vol || 0.15;
      var filterHz = note.filterHz || 1000;

      var len = Math.max(1, Math.floor(ctx.sampleRate * duration));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterHz;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      src.start(t0);
      src.stop(t0 + duration + 0.02);
    },

    play: function (name) {
      if (this.muted) return;
      var pattern = PATTERNS[name];
      if (!pattern) return;
      var self = this;
      var t = 0;
      pattern.forEach(function (note) {
        self.tone(note, t);
        t += note.d;
      });
    },

    setMuted: function (muted) {
      this.muted = !!muted;
      if (this.muted && MG.music) MG.music.stop();
      if (this.muted && this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend();
      } else if (!this.muted && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
