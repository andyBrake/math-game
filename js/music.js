/* 胜利音乐：只在结算页播放一次，静音、离开或失败时立即停止 */
(function (global) {
  'use strict';
  var MG = global.MG;

  MG.music = {
    el: null,

    /* 返回 true 表示已开始播放；false 表示应回退到合成号角 */
    playVictory: function (onFail) {
      if (MG.audio.muted) return false;
      if (MG.store.data.equipped.music !== 'victory-theme') return false;
      if (!MG.store.owns('victory-theme')) return false;

      var src = global.MG_MUSIC && global.MG_MUSIC.victory;
      if (!src) return false;

      this.stop();
      var el;
      try {
        el = new global.Audio(src);
      } catch (e) {
        return false;
      }
      el.volume = 0.4;
      el.preload = 'auto';
      this.el = el;

      var self = this;
      var failed = false;
      function fail() {
        if (failed) return;
        failed = true;
        self.stop();
        if (onFail) onFail();
      }
      el.addEventListener('error', fail);
      try {
        var p = el.play();
        if (p && typeof p.catch === 'function') p.catch(fail);
      } catch (e) {
        fail();
        return false;
      }
      return true;
    },

    stop: function () {
      if (!this.el) return;
      try {
        this.el.pause();
        this.el.currentTime = 0;
      } catch (e) { /* 忽略未加载完成的媒体错误 */ }
      this.el = null;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
