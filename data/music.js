/* 本地音乐登记表：缺文件时完全不发请求，结算页自动回退为内置 8-bit 号角。
   新增曲目只需在这里登记 key: 相对路径，并在 data/shop.js 的 MUSIC 里让 file 指向该 key。
   例如把 victory: 'assets/music/victory.wav' 换成 mp3 即可直接替换。 */
window.MG_MUSIC = {
  victory: 'assets/music/victory.wav',
  fanfare: 'assets/music/fanfare.wav',
  serenade: 'assets/music/serenade.wav'
};
