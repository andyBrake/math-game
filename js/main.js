/* 启动引导：先校验教材数据，再初始化存档、角色与视图 */
(function () {
  'use strict';
  var MG = window.MG;
  var app = document.getElementById('app');

  function fatal(lines) {
    app.innerHTML =
      '<section class="fatal">' +
      '<h1>无法启动</h1>' +
      '<p>教材数据存在错误，请修正后刷新页面：</p>' +
      '<ul>' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
      '</section>';
  }

  var errors;
  try {
    errors = MG.data.validate();
  } catch (e) {
    errors = ['数据加载异常：' + e.message];
  }

  if (errors.length) {
    fatal(errors);
    return;
  }

  try {
    MG.store.init();
    MG.sprites.init();
    MG.ui.init();
  } catch (e) {
    fatal(['初始化失败：' + e.message]);
  }
})();
