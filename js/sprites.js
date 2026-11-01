/* 像素角色：代码绘制，assets/characters/<key>.png 存在时优先使用图片 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var PALETTE = {
    k: '#20202e',
    r: '#e8453c',
    s: '#f7c9a0',
    b: '#2f5fd0',
    g: '#3aa655',
    w: '#ffffff',
    y: '#f2c14e',
    o: '#c47a3d',
    n: '#8b5a2b',
    d: '#4d3218',
    p: '#9b6bd6'
  };

  var ART = {
    mario: [
      '................',
      '....rrrrrr......',
      '...rrrrrrrr.....',
      '...kkksssk......',
      '..kksksskssk....',
      '..kssssssssk....',
      '..kskssskssk....',
      '...kssssssk.....',
      '....ssssss......',
      '...rrbrrbrr.....',
      '..rrrbrrbrrr....',
      '.rrrrbbbbbrrrr..',
      '.ssrbbbbbbbbrss.',
      '.ss.bbbbbb..ss..',
      '....bbb..bbb....',
      '...kkk....kkk...'
    ],
    link: [
      '................',
      '......gggg......',
      '.....gggggg.....',
      '....gggggggg....',
      '....gssssssg....',
      '...gssssssssg...',
      '...gsksssksgg...',
      '....ssssssss....',
      '....sssssss.....',
      '...ggggggggg....',
      '..ggggggggggg...',
      '..gg.ggggg.gg...',
      '..gg.gwwg..gg...',
      '.....gggg.......',
      '.....gg.gg......',
      '....kkk.kkk.....'
    ],
    goomba: [
      '................',
      '.....oooooo.....',
      '...oooooooooo...',
      '..oooooooooooo..',
      '.oooooooooooooo.',
      '.ookoooooooooko.',
      '.ookoooooooooko.',
      '.oooooooooooooo.',
      '..oooooooooooo..',
      '...oooooooooo...',
      '....oooooooo....',
      '.....oooooo.....',
      '....ww....ww....',
      '...wwww..wwww...',
      '..wwww....wwww..',
      '................'
    ],
    koopa: [
      '................',
      '......gggg......',
      '.....gggggg.....',
      '....gg.gg.gg....',
      '....gggggggg....',
      '...gggggggggg...',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '...gggggggggg...',
      '....gggggggg....',
      '.....yyyyyy.....',
      '....yyyyyyyy....',
      '...yyyyyyyyyy...',
      '....yy....yy....',
      '....yy....yy....',
      '................'
    ],
    boss: [
      '................',
      '..y..........y..',
      '..yy.gggggg.yy..',
      '..yyggggggggyy..',
      '...ggkggggkgg...',
      '...gggggggggg...',
      '...ggwwwwwwgg...',
      '..gggggggggggg..',
      '.g.gggggggggg.g.',
      '.g.gggggggggg.g.',
      '...gggggggggg...',
      '...gg..gg..gg...',
      '..ggg..gg..ggg..',
      '..yy...yy...yy..',
      '................',
      '................'
    ]
  };

  var SIZE = 16;
  var cache = Object.create(null);

  function normalize(rows) {
    var out = [];
    for (var i = 0; i < SIZE; i++) {
      var row = rows[i] || '';
      while (row.length < SIZE) row += '.';
      out.push(row.slice(0, SIZE));
    }
    return out;
  }

  function paint(key, frame) {
    var rows = normalize(ART[key] || ART.goomba);
    var scale = 8;
    var cv = global.document.createElement('canvas');
    cv.width = SIZE * scale;
    cv.height = SIZE * scale;
    var ctx = cv.getContext('2d');
    var dy = frame ? 1 : 0;
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        var ch = rows[y][x];
        if (!ch || ch === '.') continue;
        ctx.fillStyle = PALETTE[ch] || '#000';
        ctx.fillRect(x * scale, (y + dy) * scale, scale, scale);
      }
    }
    return cv.toDataURL();
  }

  MG.sprites = {
    keys: Object.keys(ART),
    available: Object.create(null),

    dataUrl: function (key, frame) {
      var id = key + ':' + (frame ? 1 : 0);
      if (!cache[id]) cache[id] = paint(key, frame ? 1 : 0);
      return cache[id];
    },

    assetPath: function (key) {
      return 'assets/characters/' + key + '.png';
    },

    src: function (key, frame) {
      return this.available[key] ? this.paths[key] : this.dataUrl(key, frame);
    },

    /* 素材登记表由 data/character-assets.js 提供；未登记则使用内置像素画，
       这样可以避免对不存在的文件发起请求（控制台无 404）。 */
    init: function () {
      var registry = global.MG_CHARACTER_ASSETS || {};
      var self = this;
      this.keys.forEach(function (key) {
        self.available[key] = typeof registry[key] === 'string' && registry[key] !== '';
        self.paths = self.paths || {};
        self.paths[key] = self.available[key] ? registry[key] : null;
      });
    },

    imgTag: function (key, cls) {
      return '<img class="sprite ' + (cls || '') + '" data-sprite="' + key +
        '" data-frame="0" alt="' + key + '" draggable="false">';
    },

    attach: function (root) {
      if (!root) return;
      var self = this;
      var list = root.querySelectorAll('img[data-sprite]');
      for (var i = 0; i < list.length; i++) {
        (function (img) {
          var frame = Number(img.getAttribute('data-frame')) || 0;
          img.onerror = function () {
            img.onerror = null;
            img.src = self.dataUrl(img.getAttribute('data-sprite'), frame);
          };
          img.src = self.src(img.getAttribute('data-sprite'), frame);
        })(list[i]);
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
