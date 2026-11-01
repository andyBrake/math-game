# 角色图片（可选）

默认情况下游戏使用 `js/sprites.js` 里用代码绘制的像素角色，不读取本目录。

如果要换成自己的图片：

1. 准备 PNG 文件，建议 16x16 或 32x32 的透明背景像素图（会按整数倍放大并保持像素感）。
2. 文件名使用：`mario.png`、`link.png`、`goomba.png`、`koopa.png`、`boss.png`。
3. 在 `data/character-assets.js` 里登记，例如：

```js
window.MG_CHARACTER_ASSETS = {
  mario: 'assets/characters/mario.png',
  link: 'assets/characters/link.png'
};
```

未登记或加载失败的角色会自动回退到内置像素画，游戏不会中断。

本目录仅供本地自用，不随游戏分发第三方素材。
