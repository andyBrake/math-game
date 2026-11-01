/* 视图与交互：年级 → 学期/单元 → 地图 → 战斗/测验 → 结算 → 报告 */
(function (global) {
  'use strict';
  var MG = global.MG;

  var ENEMY_BY_UNIT = ['goomba', 'koopa', 'goomba', 'koopa', 'boss', 'goomba', 'koopa', 'goomba'];

  function h(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stars(n) {
    var out = '';
    for (var i = 0; i < 3; i++) out += i < n ? '<span class="star on">★</span>' : '<span class="star">☆</span>';
    return out;
  }

  function findTopic(topicId) {
    var found = null;
    MG.data.allUnits().forEach(function (u) {
      u.topics.forEach(function (t) {
        if (t.id === topicId) found = { unit: u, topic: t };
      });
    });
    return found;
  }

  function currentSemester(gradeId, semId) {
    return MG.data.getSemester(gradeId || 'g4', semId);
  }

  MG.ui = {
    app: null,
    focusUnit: null,
    lastAnswer: null,
    recorded: false,
    coinsEarned: 0,
    timer: null,
    started: false,

    init: function () {
      this.app = document.getElementById('app');
      this.app.addEventListener('click', this.onClick.bind(this));
      global.addEventListener('hashchange', this.route.bind(this));
      /* 第一次点击/触摸时解锁音频，避免移动端把音效吞掉 */
      var unlock = function () {
        MG.audio.unlock();
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('click', unlock);
      };
      document.addEventListener('pointerdown', unlock);
      document.addEventListener('click', unlock);
      MG.audio.setMuted(!!MG.store.data.settings.mute);
      this.route();
      this.startTicker();
    },

    /* 角色两帧动画 */
    startTicker: function () {
      var self = this;
      setInterval(function () {
        var imgs = document.querySelectorAll('img[data-sprite].big');
        for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          var f = img.getAttribute('data-frame') === '1' ? '0' : '1';
          img.setAttribute('data-frame', f);
          img.src = MG.sprites.src(img.getAttribute('data-sprite'), Number(f));
        }
      }, 520);
    },

    go: function (hash) {
      if (location.hash === hash) this.route();
      else location.hash = hash;
    },

    onClick: function (ev) {
      var target = ev.target.closest('[data-action]');
      if (!target) return;
      var action = target.getAttribute('data-action');
      var parts = action.split(':');

      if (parts[0] === 'nav') {
        this.go(parts[1] ? '#/' + parts.slice(1).join('/') : '#/grade');
        return;
      }
      if (parts[0] === 'unit') {
        this.focusUnit = parts[1];
        this.go('#/map/' + parts[2]);
        return;
      }
      if (parts[0] === 'start') {
        var unit = MG.data.getUnit(parts[1]);
        if (!unit) return;
        try {
          MG.session.startLevel(unit);
        } catch (e) {
          this.showError('出题器出错：' + e.message);
          return;
        }
        this.lastAnswer = null;
        this.recorded = false;
        this.go('#/battle/' + unit.id);
        return;
      }
      if (parts[0] === 'exam') {
        var sem = currentSemester('g4', parts[1]);
        if (!sem) return;
        try {
          MG.session.startExam(sem, 'g4');
        } catch (e) {
          this.showError('出题器出错：' + e.message);
          return;
        }
        this.recorded = false;
        this.go('#/exam/' + parts[1]);
        return;
      }
      if (parts[0] === 'option') {
        this.choose(Number(parts[1]));
        return;
      }
      if (action === 'continue') {
        this.continueLevel();
        return;
      }
      if (action === 'retry-level') {
        var s = MG.session.state;
        if (!s) { this.go('#/grade'); return; }
        var u = MG.data.getUnit(s.unitId);
        MG.session.startLevel(u);
        this.lastAnswer = null;
        this.recorded = false;
        this.go('#/battle/' + u.id);
        return;
      }
      if (action === 'retry-exam') {
        var ss = MG.session.state;
        var semId = ss ? ss.semesterId : 'g4a';
        var semester = currentSemester('g4', semId);
        MG.session.startExam(semester, 'g4');
        this.recorded = false;
        this.go('#/exam/' + semId);
        return;
      }
      if (action === 'toggle-mute') {
        var next = !MG.audio.muted;
        MG.audio.setMuted(next);
        MG.store.setSetting('mute', next);
        this.renderTopbar();
        return;
      }
      if (action === 'toggle-character') {
        var c = MG.store.data.settings.character === 'mario' ? 'link' : 'mario';
        MG.store.setSetting('character', c);
        this.route();
        return;
      }
      if (parts[0] === 'difficulty') {
        if (MG.difficulty.set(parts[1])) {
          MG.audio.play('click');
          this.route();
        }
        return;
      }
      if (parts[0] === 'buy') {
        this.buyItem(parts[1]);
        return;
      }
      if (parts[0] === 'equip') {
        this.equipItem(parts[1], parts[2]);
        return;
      }
      if (action === 'reset-progress') {
        if (global.confirm('确定要清空全部进度吗？星级、测验成绩、错题本、金币与已购商品都会删除，且无法恢复。')) {
          MG.store.reset();
          MG.audio.setMuted(false);
          this.go('#/grade');
        }
        return;
      }
    },

    buyItem: function (id) {
      var item = MG.shop.byId(id);
      if (!item) return;
      var res = MG.store.buy(item.id, item.price);
      if (!res.ok) {
        this.toast(res.reason === 'poor' ? '还差 ' + res.missing + ' 枚金币' : '已经拥有啦');
        return;
      }
      MG.store.equip(item.slot, item.id);
      MG.audio.play('correct');
      this.toast('购买成功，已装备');
      this.renderTopbar();
      this.renderShop();
    },

    equipItem: function (slot, id) {
      if (!MG.store.equip(slot, id)) return;
      MG.audio.play('click');
      this.toast('已切换');
      this.route();
    },

    toast: function (message) {
      var old = document.querySelector('.toast');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var el = document.createElement('div');
      el.className = 'toast';
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1700);
    },

    choose: function (index) {
      var s = MG.session.state;
      if (!s) return;
      if (s.mode === 'exam') {
        var r = MG.session.answerExam(index);
        if (r && r.finished) {
          this.go('#/exam-result/' + s.semesterId);
        } else {
          this.renderExam();
        }
        return;
      }
      if (s.phase !== 'question') return;
      var res = MG.session.answerLevel(index);
      if (!res) return;
      this.lastAnswer = res;
      this.lastAnswer.chosenIndex = index;
      this.renderBattle();
    },

    continueLevel: function () {
      var s = MG.session.state;
      if (!s) return;
      var r = MG.session.nextLevel();
      this.lastAnswer = null;
      if (r && r.done) {
        this.go('#/result');
      } else {
        this.renderBattle();
      }
    },

    showError: function (message) {
      this.view(
        '<section class="result lose">' +
        '<h2>这一关暂时出不了题</h2>' +
        '<p class="sub">' + h(message || '出题器返回了异常的题目，已自动跳过。') + '</p>' +
        '<div class="actions">' +
        '<button class="btn" data-action="nav:grade">返回首页</button>' +
        '</div></section>'
      );
    },

    /* ---------------- 顶部栏 ---------------- */
    renderTopbar: function () {
      var bar = document.getElementById('topbar');
      if (!bar) return;
      var inBattle = /battle|exam/.test(location.hash);
      var st = MG.session.state;
      var backHash = '#/grade';
      if (st && st.mode === 'level') backHash = '#/map/' + st.unitId.split('-')[0];
      else if (st && st.mode === 'exam') backHash = '#/map/' + st.semesterId;
      var charKey = MG.store.data.settings.character === 'link' ? 'link' : 'mario';
      var left = inBattle
        ? '<button class="ghost" data-action="nav:' + backHash.slice(2) + '">← 返回地图</button>'
        : '<button class="ghost" data-action="nav:grade">🏠 首页</button>';
      bar.innerHTML =
        '<div class="bar-left">' + left + '</div>' +
        '<div class="bar-right">' +
        '<button class="ghost" data-action="toggle-character" title="切换角色">' +
        MG.sprites.imgTag(charKey, 'mini') + '<span>' + (charKey === 'mario' ? '马里奥' : '林克') + '</span></button>' +
        '<button class="ghost wallet" data-action="nav:shop" title="金币商店">🪙 <b>' + MG.store.data.coins + '</b><span class="wallet-label">商店</span></button>' +
        '<button class="ghost" data-action="toggle-mute">' + (MG.audio.muted ? '🔇 静音' : '🔊 音效') + '</button>' +
        '<button class="ghost" data-action="nav:report">📊 学习报告</button>' +
        '</div>';
      MG.sprites.attach(bar);
    },

    route: function () {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      if (MG.music) MG.music.stop();
      try {
        this._route();
      } catch (e) {
        this.showError('页面渲染出错：' + e.message);
      }
    },

    _route: function () {
      var hash = location.hash.replace(/^#\/?/, '');
      var parts = hash.split('/').filter(Boolean);
      this.renderTopbar();

      if (!parts.length) {
        return this.renderGrades();
      }
      if (parts[0] === 'grade') {
        return parts[1] ? this.renderSemesters(parts[1]) : this.renderGrades();
      }
      if (parts[0] === 'map') return this.renderMap(parts[1]);
      if (parts[0] === 'battle') return this.renderBattle();
      if (parts[0] === 'result') return this.renderResult();
      if (parts[0] === 'exam') return this.renderExam();
      if (parts[0] === 'exam-result') return this.renderExamResult(parts[1]);
      if (parts[0] === 'report') return this.renderReport();
      if (parts[0] === 'shop') return this.renderShop();
      return this.renderGrades();
    },

    view: function (html) {
      var view = document.getElementById('view');
      view.innerHTML = html;
      MG.sprites.attach(view);
      window.scrollTo(0, 0);
    },

    paintQuestionCanvas: function (root, question) {
      if (!question || question.renderer !== 'canvas') return;
      var cv = root.querySelector('canvas[data-canvas]');
      if (cv) MG.draw.paint(cv, question.canvas);
    },

    /* ---------------- 商店与表现辅助 ---------------- */
    difficultyHtml: function () {
      var cur = MG.difficulty.get();
      var buttons = MG.difficulty.levels.map(function (l) {
        return '<button class="seg' + (l.id === cur.id ? ' on' : '') + '" data-action="difficulty:' + l.id +
          '" title="' + h(l.desc) + '">' + h(l.name) + '</button>';
      }).join('');
      return '<div class="difficulty-row">' +
        '<span class="diff-label">难度</span>' +
        '<div class="segmented" role="group" aria-label="难度选择">' + buttons + '</div>' +
        '<span class="diff-note">' + h(cur.name) + ' · 金币 ×' + cur.multiplier + '</span>' +
        '</div>';
    },

    /* 攻击特效层：纯 CSS，随反馈重新渲染自动移除 */
    fxHtml: function () {
      var id = MG.store.data.equipped.effect;
      if (!MG.store.owns(id)) id = 'default';
      if (id === 'lightning') {
        return '<div class="fx fx-lightning" aria-hidden="true"><i></i><i></i><i></i></div>';
      }
      if (id === 'stars') {
        var parts = '';
        for (var i = 0; i < 8; i++) {
          var angle = (Math.PI * 2 * i) / 8;
          var dx = Math.round(Math.cos(angle) * 52);
          var dy = Math.round(Math.sin(angle) * 44);
          parts += '<i style="--dx:' + dx + 'px;--dy:' + dy + 'px;--d:' + (i * 0.02).toFixed(2) + 's"></i>';
        }
        return '<div class="fx fx-stars" aria-hidden="true">' + parts + '</div>';
      }
      return '';
    },

    avatarHtml: function (id, cls) {
      var avatarId = id || MG.store.data.equipped.avatar;
      var extra = cls ? ' ' + cls : '';
      if (avatarId === 'default') {
        return '<span class="avatar avatar-default' + extra + '">' +
          MG.sprites.imgTag(MG.store.data.settings.character, 'avatar-img') + '</span>';
      }
      var item = MG.shop.avatar(avatarId);
      if (!item || !item.letter) {
        return this.avatarHtml('default', cls);
      }
      return '<span class="avatar avatar-letter' + extra + '" style="--tile:' + item.color + ';--tile-dark:' + item.dark + '">' +
        h(item.letter) + '</span>';
    },

    celebrationHtml: function () {
      var id = MG.store.data.equipped.avatar;
      var spark = id === 'avatar-c'
        ? '<i class="twinkle t1">✦</i><i class="twinkle t2">✧</i><i class="twinkle t3">✦</i>'
        : '';
      return '<div class="celebration celeb-' + id + '">' + this.avatarHtml(id, 'avatar-big') + spark + '</div>';
    },

    /* ---------------- 首页 ---------------- */
    renderGrades: function () {
      var grades = MG.data.grades();
      var cards = grades.map(function (g) {
        var ready = g.status === 'ready';
        return '<button class="card grade ' + (ready ? '' : 'locked') + '" ' +
          (ready ? 'data-action="nav:grade/' + g.id + '"' : 'disabled') + '>' +
          '<span class="grade-name">' + h(g.name) + '</span>' +
          '<span class="grade-note">' + (ready ? '人教版 · 上下册' : '敬请期待') + '</span>' +
          '</button>';
      }).join('');

      this.view(
        '<section class="hero">' +
        '<h1>数学大冒险</h1>' +
        '<p class="sub">选一个年级，打败每单元的数学怪物</p>' +
        '</section>' +
        this.difficultyHtml() +
        '<section class="grade-grid">' + cards + '</section>' +
        (MG.store.degraded ? '<p class="warn">当前浏览器不允许本地存储，本次进度仅在当前页面有效。</p>' : '')
      );
    },

    /* ---------------- 学期与单元 ---------------- */
    renderSemesters: function (gradeId) {
      var grade = MG.data.getGrade(gradeId || 'g4');
      if (!grade || grade.status !== 'ready') return this.renderGrades();

      var panels = grade.semesters.map(function (sem) {
        var chips = sem.units.map(function (u) {
          var rec = MG.store.unit(u.id);
          var st = rec ? rec.stars : 0;
          return '<button class="chip" data-action="unit:' + u.id + ':' + sem.id + '">' +
            '<span class="chip-name">' + h(u.name) + '</span>' +
            '<span class="chip-stars">' + stars(st) + '</span>' +
            '</button>';
        }).join('');
        var exam = MG.store.data.exams[sem.id];
        return '<div class="semester-panel">' +
          '<div class="semester-head">' +
          '<h2>' + h(grade.name) + h(sem.name) + '</h2>' +
          '<button class="btn small" data-action="nav:map/' + sem.id + '">进入地图 →</button>' +
          '</div>' +
          '<div class="chips">' + chips + '</div>' +
          '<div class="exam-row">' +
          '<span>学期测验：' + (exam ? '最近正确率 ' + exam.accuracy + '%' : '尚未挑战') + '</span>' +
          '<button class="btn small alt" data-action="exam:' + sem.id + '">挑战大 Boss</button>' +
          '</div>' +
          '</div>';
      }).join('');

      this.view('<section class="panel-wrap">' + panels + '</section>');
    },

    /* ---------------- 地图 ---------------- */
    renderMap: function (semId) {
      var sem = currentSemester('g4', semId);
      if (!sem) return this.renderGrades();
      var grade = MG.data.getGrade('g4');

      var nodes = sem.units.map(function (u, i) {
        var rec = MG.store.unit(u.id);
        var st = rec ? rec.stars : 0;
        var cls = 'node' + (st > 0 ? ' done' : '') + (u.id === MG.ui.focusUnit ? ' focus' : '');
        return '<button class="' + cls + '" data-action="start:' + u.id + '">' +
          '<span class="node-order">' + (i + 1) + '</span>' +
          '<span class="node-name">' + h(u.name) + '</span>' +
          '<span class="node-stars">' + stars(st) + '</span>' +
          '</button>';
      }).join('');

      var exam = MG.store.data.exams[sem.id];
      var examNode = '<button class="node boss" data-action="exam:' + sem.id + '">' +
        '<span class="node-order">★</span>' +
        '<span class="node-name">学期测验</span>' +
        '<span class="node-stars">' + (exam ? exam.accuracy + '%' : '未挑战') + '</span>' +
        '</button>';

      this.view(
        '<section class="map-head">' +
        '<button class="ghost" data-action="nav:grade/' + (grade ? grade.id : 'g4') + '">← 学期</button>' +
        '<h2>' + h((grade ? grade.name : '') + sem.name) + ' 关卡地图</h2>' +
        '</section>' +
        this.difficultyHtml() +
        '<section class="map-path">' + nodes + examNode + '</section>' +
        (MG.store.degraded ? '<p class="warn">本地存储不可用，本次进度不会被保存。</p>' : '')
      );
    },

    /* ---------------- 战斗 ---------------- */
    renderBattle: function () {
      var s = MG.session.state;
      if (!s || s.mode !== 'level') { this.go('#/grade'); return; }
      var q = MG.session.current();
      var showFeedback = s.phase === 'feedback' && this.lastAnswer;
      var displayed = showFeedback ? this.lastAnswer.question : q;
      if (!displayed) { this.go('#/result'); return; }

      var character = MG.store.data.settings.character === 'link' ? 'link' : 'mario';
      var enemyKey = ENEMY_BY_UNIT[(s.index + s.unitId.length) % ENEMY_BY_UNIT.length];
      var attacking = showFeedback && this.lastAnswer.correct;
      var heroCls = 'big' + (attacking ? (character === 'link' ? ' act-link' : ' act-mario') : '');
      var enemyCls = 'fighter right' + (attacking ? ' hit' : '');
      var fx = attacking ? this.fxHtml() : '';
      var hearts = '';
      for (var i = 0; i < 3; i++) hearts += '<span class="heart' + (i < s.hearts ? '' : ' off') + '">♥</span>';
      var hpPct = Math.max(0, (s.hp / 6) * 100);

      var options = displayed.options.map(function (opt, idx) {
        var cls = 'option';
        if (showFeedback) {
          if (idx === displayed.answerIndex) cls += ' right';
          else if (this.lastAnswer.correct === false && idx === this.lastAnswer.chosenIndex) cls += ' wrong';
        }
        return '<button class="' + cls + '" data-action="option:' + idx + '"' + (showFeedback ? ' disabled' : '') + '>' +
          h(opt) + '</button>';
      }, this).join('');

      var feedback = '';
      if (showFeedback) {
        var ok = this.lastAnswer.correct;
        feedback = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '">' +
          (ok && this.lastAnswer.dmg === 2 ? '<div class="super-banner">必杀！</div>' : '') +
          '<div class="fb-title">' + (ok ? (this.lastAnswer.dmg === 2 ? '连击 3 次，额外造成 1 点伤害' : '答对了！造成 ' + this.lastAnswer.dmg + ' 点伤害') : '答错了，失去 1 颗心') + '</div>' +
          '<div class="fb-explain">' + h(displayed.explain) + '</div>' +
          '<button class="btn" data-action="continue">' + (s.finished ? '查看结算 →' : '继续 →') + '</button>' +
          '</div>';
      }

      this.view(
        '<section class="arena">' +
        '<div class="fighter">' + MG.sprites.imgTag(character, heroCls) +
        '<div class="fname">' + (character === 'link' ? '林克' : '马里奥') + '</div>' +
        '<div class="hearts' + (showFeedback && !this.lastAnswer.correct ? ' hurt' : '') + '">' + hearts + '</div></div>' +
        '<div class="mid"><div class="combo">' + (s.combo > 0 ? '连击 x' + s.combo : '') + '</div>' +
        '<div class="vs">VS</div></div>' +
        '<div class="' + enemyCls + '">' + fx + MG.sprites.imgTag(enemyKey, 'big') +
        '<div class="fname">' + (enemyKey === 'boss' ? 'BOSS' : enemyKey === 'koopa' ? '乌龟怪' : '蘑菇怪') + '</div>' +
        '<div class="hpbar"><i style="width:' + hpPct + '%"></i></div></div>' +
        '</section>' +
        '<section class="qcard">' +
        '<div class="qhead">第 ' + (s.index + 1) + ' / ' + s.queue.length + ' 题 · ' + h(s.queue[s.index].topicName) + '</div>' +
        '<div class="prompt">' + h(displayed.prompt) + '</div>' +
        (displayed.renderer === 'canvas' ? '<canvas class="qcanvas" data-canvas width="360" height="220"></canvas>' : '') +
        '<div class="options">' + options + '</div>' +
        feedback +
        '</section>'
      );

      var view = document.getElementById('view');
      this.paintQuestionCanvas(view, displayed);
    },

    /* ---------------- 关卡结算 ---------------- */
    renderResult: function () {
      var s = MG.session.state;
      if (!s || s.mode !== 'level') { this.go('#/grade'); return; }

      if (!this.recorded) {
        MG.store.recordLevel(s.unitId, s.stars, { weakest: MG.session.weakestTopic() });
        s.wrongs.forEach(function (w) { MG.store.addWrong(w); });

        var earned = s.won ? s.stars * MG.difficulty.multiplier() : 0;
        if (earned > 0) MG.store.addCoins(earned);
        this.coinsEarned = earned;

        if (s.won) {
          var played = MG.music.playVictory(function () { MG.audio.play('win'); });
          if (!played) MG.audio.play('win');
        } else {
          MG.audio.play('fail');
        }
        this.recorded = true;
        this.renderTopbar();
      }

      var topics = s.queue.map(function (item) { return item.topicName; })
        .filter(function (v, i, arr) { return arr.indexOf(v) === i; });

      var wrongList = s.wrongs.length
        ? '<h3>错题复盘</h3><ul class="wrong-list">' + s.wrongs.map(function (w) {
          return '<li><div class="w-prompt">' + h(w.prompt) + '</div>' +
            '<div class="w-ans">你选了 <b>' + h(w.chosen) + '</b>，正确答案 <b>' + h(w.answer) + '</b></div></li>';
        }).join('') + '</ul>'
        : '<p class="allright">这一关没有答错，太棒了！</p>';

      this.view(
        '<section class="result ' + (s.won ? 'win' : 'lose') + '">' +
        (s.won
          ? this.celebrationHtml()
          : '<div class="celebration celeb-lose">' + this.avatarHtml(null, 'avatar-big') + '</div>') +
        '<h2>' + (s.won ? '通关！' : '再试一次吧') + '</h2>' +
        '<div class="big-stars">' + stars(s.stars) + '</div>' +
        '<p class="sub">' + h(s.unitName) + ' · 剩余 ' + s.hearts + ' 颗心 · 难度 ' + h(MG.difficulty.get().name) + '</p>' +
        (s.won
          ? '<div class="coin-gain">+' + this.coinsEarned + ' 🪙 <small>共 ' + MG.store.data.coins + ' 枚</small></div>'
          : '<p class="sub lose-note">心用完啦，这一关没有金币</p>') +
        '<h3>本关知识点</h3><ul class="topic-list">' +
        topics.map(function (t) { return '<li>' + h(t) + '</li>'; }).join('') + '</ul>' +
        wrongList +
        '<div class="actions">' +
        '<button class="btn" data-action="retry-level">再玩一次</button>' +
        '<button class="btn alt" data-action="nav:map/' + s.unitId.split('-')[0] + '">回地图</button>' +
        '</div></section>'
      );
    },

    /* ---------------- 金币商店 ---------------- */
    renderShop: function () {
      var self = this;

      function priceHtml(item) {
        if (item.price === 0) return '<span class="price owned">免费</span>';
        if (MG.store.owns(item.id)) return '<span class="price owned">已拥有</span>';
        return '<span class="price">' + item.price + ' 🪙</span>';
      }

      function actionHtml(item) {
        if (MG.store.data.equipped[item.slot] === item.id) return '<span class="tag">使用中</span>';
        if (MG.store.owns(item.id)) {
          return '<button class="btn small alt" data-action="equip:' + item.slot + ':' + item.id + '">使用</button>';
        }
        return '<button class="btn small" data-action="buy:' + item.id + '">购买</button>';
      }

      function previewHtml(item) {
        if (item.slot === 'avatar') return self.avatarHtml(item.id, 'avatar-card');
        return '<span class="item-icon">' + item.icon + '</span>';
      }

      function card(item) {
        var cls = 'shop-item' + (MG.store.data.equipped[item.slot] === item.id ? ' equipped' : '');
        return '<article class="' + cls + '">' +
          '<div class="item-preview">' + previewHtml(item) + '</div>' +
          '<h4>' + h(item.name) + '</h4>' +
          '<p class="item-desc">' + h(item.desc) + '</p>' +
          '<div class="item-foot">' + priceHtml(item) + actionHtml(item) + '</div>' +
          '</article>';
      }

      var celebrations = MG.shop.celebrations.map(function (c) {
        var owned = MG.store.owns(c.avatar);
        var equipped = MG.store.data.equipped.avatar === c.avatar;
        var action;
        if (equipped) action = '<span class="tag">使用中</span>';
        else if (owned) action = '<button class="btn small alt" data-action="equip:avatar:' + c.avatar + '">使用</button>';
        else action = '<button class="btn small" data-action="buy:' + c.avatar + '">先拥有头像</button>';

        return '<article class="shop-item' + (equipped ? ' equipped' : '') + '">' +
          '<div class="item-preview">' + self.avatarHtml(c.avatar, 'avatar-card') + '</div>' +
          '<h4>' + h(c.name) + '</h4>' +
          '<p class="item-desc">' + h(c.desc) + ' · ' + (owned ? '已解锁' : '随头像解锁') + '</p>' +
          '<div class="item-foot"><span class="price owned">' + (owned ? '已拥有' : '—') + '</span>' + action + '</div>' +
          '</article>';
      }).join('');

      this.view(
        '<section class="shop">' +
        '<div class="shop-head"><h2>金币商店</h2><div class="wallet-big">🪙 <b>' + MG.store.data.coins + '</b></div></div>' +
        '<p class="sub">通关按星级发金币，再乘难度倍数：轻松 ×1、标准 ×2、挑战 ×3。重复挑战会继续累加。</p>' +
        '<section class="shop-group"><h3>头像</h3><div class="shop-grid">' +
        MG.shop.avatars.map(card).join('') +
        '</div></section>' +
        '<section class="shop-group"><h3>胜利音乐</h3><div class="shop-grid">' +
        MG.shop.music.map(card).join('') +
        '</div><p class="hint">放入本地 mp3 后修改 data/music.js 即可替换。</p></section>' +
        '<section class="shop-group"><h3>攻击特效</h3><div class="shop-grid">' +
        MG.shop.effects.map(card).join('') +
        '</div></section>' +
        '<section class="shop-group"><h3>庆祝动作</h3><div class="shop-grid">' + celebrations + '</div>' +
        '<p class="hint">庆祝动作随头像解锁，不单独收费；装备头像即切换对应的胜利动作。</p></section>' +
        '<div class="actions"><button class="btn alt" data-action="nav:grade">返回首页</button></div>' +
        '</section>'
      );
    },

    /* ---------------- 学期测验 ---------------- */
    renderExam: function () {
      var s = MG.session.state;
      if (!s || s.mode !== 'exam') { this.go('#/grade'); return; }
      if (s.finished) { this.go('#/exam-result/' + s.semesterId); return; }
      var q = MG.session.current();
      var self = this;

      var options = q.options.map(function (opt, idx) {
        return '<button class="option" data-action="option:' + idx + '">' + h(opt) + '</button>';
      }).join('');

      this.view(
        '<section class="exam-head">' +
        '<div class="exam-title">学期测验 · ' + h(s.semesterName) + '</div>' +
        '<div class="exam-timer" id="exam-timer">--:--</div>' +
        '<div class="exam-progress">第 ' + (s.index + 1) + ' / ' + s.queue.length + ' 题</div>' +
        '</section>' +
        '<section class="qcard">' +
        '<div class="qhead">' + h(s.queue[s.index].topicName) + '</div>' +
        '<div class="prompt">' + h(q.prompt) + '</div>' +
        (q.renderer === 'canvas' ? '<canvas class="qcanvas" data-canvas width="360" height="220"></canvas>' : '') +
        '<div class="options">' + options + '</div>' +
        '</section>'
      );
      this.paintQuestionCanvas(document.getElementById('view'), q);

      var timerEl = document.getElementById('exam-timer');
      function tick() {
        var st = MG.session.state;
        if (!st || st.mode !== 'exam' || st.finished) return;
        var left = Math.max(0, Math.round((st.deadline - Date.now()) / 1000));
        var mm = Math.floor(left / 60), ss = left % 60;
        if (timerEl) timerEl.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
        if (left <= 0) {
          MG.session.finishExam(true);
          self.go('#/exam-result/' + st.semesterId);
        }
      }
      tick();
      this.timer = setInterval(tick, 500);
    },

    renderExamResult: function (semId) {
      var s = MG.session.state;
      if (!s || s.mode !== 'exam') { this.go('#/grade'); return; }
      var r = s.result || MG.session.finishExam(false);

      if (!this.recorded) {
        MG.store.recordExam(s.semesterId, r);
        s.wrongs.forEach(function (w) { MG.store.addWrong(w); });
        if (r.accuracy >= 60) {
          var played = MG.music.playVictory(function () { MG.audio.play('win'); });
          if (!played) MG.audio.play('win');
        } else {
          MG.audio.play('fail');
        }
        this.recorded = true;
      }

      var wrongs = s.wrongs.length
        ? '<h3>错题清单</h3><ul class="wrong-list">' + s.wrongs.map(function (w) {
          var found = findTopic(w.topicId);
          return '<li><div class="w-prompt">' + h(w.prompt) + '</div>' +
            '<div class="w-ans">' + (found ? h(found.topic.name) + ' · ' : '') +
            '正确答案 <b>' + h(w.answer) + '</b>，你选了 <b>' + h(w.chosen) + '</b></div></li>';
        }).join('') + '</ul>'
        : '<p class="allright">全部答对，太厉害了！</p>';

      this.view(
        '<section class="result">' +
        '<h2>测验结束' + (s.timedOut ? '（时间到）' : '') + '</h2>' +
        '<div class="score">' + r.accuracy + '%</div>' +
        '<p class="sub">答对 ' + r.correct + ' / ' + r.total + ' 题 · 用时 ' + r.seconds + ' 秒</p>' +
        '<div class="meter"><i style="width:' + r.accuracy + '%"></i></div>' +
        wrongs +
        '<div class="actions">' +
        '<button class="btn" data-action="retry-exam">再测一次</button>' +
        '<button class="btn alt" data-action="nav:map/' + s.semesterId + '">回地图</button>' +
        '</div></section>'
      );
    },

    /* ---------------- 家长报告 ---------------- */
    renderReport: function () {
      var totals = MG.store.totals();
      var allUnits = MG.data.allUnits();
      var grade = MG.data.getGrade('g4');

      var unitRows = grade.semesters.map(function (sem) {
        var rows = sem.units.map(function (u) {
          var rec = MG.store.unit(u.id);
          var st = rec ? rec.stars : 0;
          return '<tr><td>' + h(u.name) + '</td><td class="c">' + stars(st) + '</td>' +
            '<td class="c">' + (rec ? rec.plays + ' 次' : '—') + '</td></tr>';
        }).join('');
        var exam = MG.store.data.exams[sem.id];
        return '<h3>' + h(sem.name) + '</h3>' +
          '<table class="report-table"><thead><tr><th>单元</th><th>星级</th><th>游玩</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table>' +
          '<p class="exam-line">学期测验：' + (exam
            ? exam.accuracy + '%（' + exam.correct + '/' + exam.total + '，用时 ' + exam.seconds + ' 秒）'
            : '尚未参加') + '</p>';
      }).join('');

      var weak = MG.store.weakTopics(3);
      var weakHtml = weak.length
        ? '<ul class="topic-list">' + weak.map(function (w) {
          var found = findTopic(w.topicId);
          return '<li>' + h(found ? found.topic.name : w.topicId) + ' · 错 ' + w.count + ' 次</li>';
        }).join('') + '</ul>'
        : '<p class="allright">还没有错题记录。</p>';

      this.view(
        '<section class="report">' +
        '<h2>学习报告</h2>' +
        '<div class="stats">' +
        '<div class="stat"><b>' + totals.cleared + '</b><span>已通关单元</span></div>' +
        '<div class="stat"><b>' + totals.stars + '</b><span>累计星星</span></div>' +
        '<div class="stat"><b>' + totals.perfect + '</b><span>满星单元</span></div>' +
        '<div class="stat"><b>' + allUnits.length + '</b><span>总单元数</span></div>' +
        '<div class="stat"><b>' + MG.store.data.coins + '</b><span>金币</span></div>' +
        '</div>' +
        '<p class="exam-line">当前难度：' + h(MG.difficulty.get().name) +
        '（金币 ×' + MG.difficulty.multiplier() + '）</p>' +
        '<h3>薄弱知识点 Top 3</h3>' + weakHtml +
        unitRows +
        '<div class="actions">' +
        '<button class="btn danger" data-action="reset-progress">清空全部进度</button>' +
        '<button class="btn alt" data-action="nav:grade">返回首页</button>' +
        '</div>' +
        '</section>'
      );
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
