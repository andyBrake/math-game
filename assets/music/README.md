# 本地音乐

结算页的「冒险胜利曲」会读取这里登记的文件，默认是 `victory.wav`（由 `tools/make-victory-music.py` 生成）。

## 换成自己的音乐

1. 把文件放进本目录，例如 `victory.mp3`。
2. 修改 `data/music.js`：

   ```js
   window.MG_MUSIC = {
     victory: 'assets/music/victory.mp3'
   };
   ```

3. 刷新页面，在商店解锁并装备「冒险胜利曲」。

## 说明

- 音乐只在通关结算页播放一次，不循环、不作为背景音乐。
- 未解锁、文件缺失、浏览器拒绝播放或处于静音状态时，会自动回退到内置 8-bit 胜利号角。
- 文件只在本地使用，不上传、不联网。
