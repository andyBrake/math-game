/* 商店目录：头像、胜利音乐、攻击特效、庆祝动作。价格为 0 的默认项始终可用 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var AVATARS = [
    {
      id: 'default', slot: 'avatar', kind: 'avatar', name: '默认头像', price: 0,
      desc: '跟随已装备的马里奥 / 林克', celebration: '原地欢呼'
    },
    {
      id: 'mario', slot: 'avatar', kind: 'avatar', name: '马里奥', price: 0,
      desc: '经典水管工 · 免费默认头像', celebration: '原地欢呼'
    },
    {
      id: 'link', slot: 'avatar', kind: 'avatar', name: '林克', price: 0,
      desc: '勇者少年 · 免费默认头像', celebration: '原地欢呼'
    },
    {
      id: 'avatar-a', slot: 'avatar', kind: 'avatar', name: '头像 A', price: 18,
      letter: 'A', color: '#e8453c', dark: '#a82c25', img: 'assets/avatars/avatar-a.png',
      desc: '红披风小勇士 · 专属庆祝「旋风转体」', celebration: '旋风转体'
    },
    {
      id: 'avatar-b', slot: 'avatar', kind: 'avatar', name: '头像 B', price: 24,
      letter: 'B', color: '#2f5fd0', dark: '#1d3c8c', img: 'assets/avatars/avatar-b.png',
      desc: '蓝盔小剑士 · 专属庆祝「高举跳跃」', celebration: '高举跳跃'
    },
    {
      id: 'avatar-c', slot: 'avatar', kind: 'avatar', name: '头像 C', price: 30,
      letter: 'C', color: '#9b6bd6', dark: '#6a3fa8', img: 'assets/avatars/avatar-c.png',
      desc: '紫袍小法师 · 专属庆祝「星光摇摆」', celebration: '星光摇摆'
    },
    {
      id: 'avatar-d', slot: 'avatar', kind: 'avatar', name: '蛋仔派对', price: 50,
      letter: 'D', color: '#ffb43c', dark: '#d98a1e', img: 'assets/avatars/avatar-d.png',
      desc: 'Q 弹蛋仔 · 专属庆祝「弹跳摇摆」', celebration: '弹跳摇摆'
    }
  ];

  var MUSIC = [
    {
      id: 'default', slot: 'music', kind: 'music', name: '8-bit 胜利号角', price: 0,
      icon: '📯', desc: '内置合成音效，不加载任何文件'
    },
    {
      id: 'victory-theme', slot: 'music', kind: 'music', name: '冒险胜利曲', price: 16,
      icon: '🎵', file: 'victory', desc: '结算页播放本地配乐，文件缺失自动回退 8-bit 号角'
    },
    {
      id: 'fanfare-theme', slot: 'music', kind: 'music', name: '凯旋进行曲', price: 22,
      icon: '🎺', file: 'fanfare', desc: '结算页播放本地配乐，文件缺失自动回退 8-bit 号角'
    },
    {
      id: 'serenade-theme', slot: 'music', kind: 'music', name: '星空小夜曲', price: 28,
      icon: '🌙', file: 'serenade', desc: '结算页播放本地配乐，文件缺失自动回退 8-bit 号角'
    }
  ];

  var EFFECTS = [
    {
      id: 'default', slot: 'effect', kind: 'effect', name: '普通打击', price: 0,
      icon: '💥', desc: '只有命中抖动，最省电'
    },
    {
      id: 'lightning', slot: 'effect', kind: 'effect', name: '闪电冲击', price: 12,
      icon: '⚡', desc: '答对时在敌人头顶劈下闪电'
    },
    {
      id: 'stars', slot: 'effect', kind: 'effect', name: '星星爆裂', price: 18,
      icon: '✨', desc: '答对时炸出一圈星星'
    }
  ];

  var CELEBRATIONS = [
    { id: 'celeb-default', avatar: 'default', name: '原地欢呼', desc: '默认头像专属' },
    { id: 'celeb-mario', avatar: 'mario', name: '马里奥跳', desc: '马里奥头像专属' },
    { id: 'celeb-link', avatar: 'link', name: '林克拔剑', desc: '林克头像专属' },
    { id: 'celeb-a', avatar: 'avatar-a', name: '旋风转体', desc: '头像 A 专属' },
    { id: 'celeb-b', avatar: 'avatar-b', name: '高举跳跃', desc: '头像 B 专属' },
    { id: 'celeb-c', avatar: 'avatar-c', name: '星光摇摆', desc: '头像 C 专属' },
    { id: 'celeb-d', avatar: 'avatar-d', name: '弹跳摇摆', desc: '蛋仔派对头像专属' }
  ];

  var ALL = AVATARS.concat(MUSIC, EFFECTS);

  MG.shop = {
    avatars: AVATARS,
    music: MUSIC,
    effects: EFFECTS,
    celebrations: CELEBRATIONS,

    byId: function (id) {
      for (var i = 0; i < ALL.length; i++) {
        if (ALL[i].id === id) return ALL[i];
      }
      return null;
    },

    avatar: function (id) {
      for (var i = 0; i < AVATARS.length; i++) {
        if (AVATARS[i].id === id) return AVATARS[i];
      }
      return null;
    },

    items: function (kind) {
      if (kind === 'avatar') return AVATARS;
      if (kind === 'music') return MUSIC;
      if (kind === 'effect') return EFFECTS;
      return [];
    },

    celebration: function (avatarId) {
      for (var i = 0; i < CELEBRATIONS.length; i++) {
        if (CELEBRATIONS[i].avatar === avatarId) return CELEBRATIONS[i];
      }
      return CELEBRATIONS[0];
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
