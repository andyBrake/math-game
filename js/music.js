/* 胜利音乐：只在结算页播放一次，静音、离开或失败时立即停止 */
(function (global) {
  'use strict';
  var MG = global.MG;

  MG.music = {
    el: null,

    /* 按商店曲目 id 播放本地音频。
       返回 true 表示已开始播放；false 表示应回退到合成号角。
       onFail 在异步失败（error / play 被拒绝）时调用，用于回退合成号角。 */
    play: function (id, onFail) {
      if (MG.audio.muted) return false;
      var item = MG.shop.byId(id);
      if (!item || item.kind !== 'music' || !item.file) return false;
      var src = global.MG_MUSIC && global.MG_MUSIC[item.file];
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

    /* 结算页播放当前装备的胜利曲目；同步 false 由调用方兜底，异步失败由 play 内 fail() 触发 onFail */
    playVictory: function (onFail) {
      var id = MG.store.data.equipped.music;
      if (!MG.store.owns(id)) return false;
      return this.play(id, onFail);
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
