# 数学大冒险 · 四年级

人教版小学数学四年级上下册的闯关小游戏。每道题都是一次攻击：答对打倒敌人，答错掉一颗心，但会先看讲解再换一道同知识点的题继续。面向四年级小朋友，目标是把"练知识点"变成"想再玩一关"。

- 纯本地运行，零第三方依赖，无构建步骤，无网络请求
- 17 个单元（上册 8 + 下册 9），44 个知识点，每个知识点可无限生成题目
- 学期末有一个 20 题的测验大 Boss
- 三档难度（轻松 / 标准 / 挑战），金币按难度 1 / 2 / 3 倍结算，挑战档全部使用 4 级挑战题
- 金币商店：头像 A/B/C、胜利音乐、攻击特效、庆祝动作
- 战斗打击反馈：命中白闪、击败像素爆炸与 8-bit 爆炸音，支持减弱动效降级

> `math-book/` 是外部教材参考，不参与运行，也不纳入本仓库。

## 启动

方式一：直接用浏览器打开 `index.html`（双击即可）。

方式二（推荐，存档更可靠）：

```bash
python -m http.server 8000
```

然后在浏览器访问 `http://localhost:8000/`。

> `file://` 下部分浏览器会限制本地存储。遇到这种情况游戏仍可玩，界面顶部会提示"本次进度仅在当前页面有效"。

## 目录结构

```
index.html                 单页入口，按顺序加载经典脚本
css/style.css              任天堂风格样式
js/
  namespace.js             全局命名空间、题目构造与校验、教材数据自检
  draw.js                  图形题绘制（统计图 / 角 / 量角器 / 轴对称 / 平移 / 等距方块）
  sprites.js               像素角色与两帧动画
  audio.js                 WebAudio 合成音效（无背景音乐）
  music.js                 结算页胜利音乐（本地文件，可回退）
  store.js                  存档、金币、已购商品、错题本与降级处理
  session.js                单元关与学期测验的会话状态机、组题去重
  ui.js                     视图、路由与交互
  main.js                   启动引导
data/
  curriculum.js             年级 → 学期 → 单元 → 知识点 → 生成器 id
  difficulty.js             三档难度的题目配方与金币倍数
  shop.js                   商店商品目录与价格
  music.js                  胜利音乐文件登记表
  character-assets.js       角色图片登记表（默认为空）
  generators/g4a.js         四年级上册 8 个单元的出题器
  generators/g4b.js         四年级下册 9 个单元的出题器
  generators/challenge.js   44 个知识点的 4 级挑战变体（仅挑战档使用）
assets/characters/          可选的角色图片目录
assets/music/               胜利音乐文件（默认 victory.wav）
tools/selfcheck.js          出题器自检（node）
tools/selfcheck.html        出题器自检（浏览器）
tools/qualitycheck.js       题目多样性与质量报告（node）
tools/make-victory-music.py 重新生成示例胜利曲
```

## 玩法规则

| 项 | 规则 |
|---|---|
| 一关 | 6 道题，题目级别由难度设置决定 |
| 难度 | 轻松 1/1/1/1/2/2、标准 1/1/2/2/3/3、挑战 4/4/4/4/4/4；全局保存，启动恢复 |
| 生命 | 3 颗心 |
| 敌人 | 6 点 HP，答对扣 1 点 |
| 连击 | 连续答对 3 题触发必杀，该次伤害翻倍 |
| 答错 | 掉 1 颗心，展示解析，换同知识点的新题重新作答（题号不推进） |
| 出题 | 同一关不重复；错题重出避开刚答错的题和本关已出现题；知识点覆盖均衡 |
| 失败 | 心数归零，可原地重试，不扣任何进度 |
| 星级 | 剩余 3 心 = 3 星，2 心 = 2 星，1 心 = 1 星，只记历史最高 |
| 金币 | 星级 × 难度倍数（轻松 ×1、标准 ×2、挑战 ×3），失败 0 枚，重复通关继续累加 |
| 学期测验 | 20 题，每题 30 秒，一次性结算，错题进错题本 |

战斗打击反馈：单元关答对时，敌人位置会出现约 100ms 的局部白闪；打出最后一击击败敌人时，播放一段像素爆炸——普通敌人约 0.8s、伴随轻微震屏，BOSS 形象约 1.1s、震屏更强——同时响起 8-bit 爆炸音（普通约 0.6s，BOSS 更长更沉）。爆炸播完后，「查看结算」按钮才会出现。答错和学期测验不触发这些反馈。若系统开启「减弱动态效果」，白闪与震屏会自动关闭，爆炸降级为约 0.2s 淡出、按钮立即出现，但爆炸音仍会播放并受静音控制。

音效由 WebAudio 实时合成，共六种：答对、答错（下行「哇—哇—哇——」沮丧音）、必杀、通关、失败、击败爆炸。没有常驻背景音乐，右上角可一键静音，静音状态会保存。

## 金币与商店

通关按「星级 × 难度倍数」发金币：轻松 ×1、标准 ×2、挑战 ×3。3 星在标准难度是 6 枚，挑战难度是 9 枚；失败不给。金币、已购商品与当前装备都会存进存档，清空进度时一并清空。

| 商品 | 价格 |
|---|---|
| 头像 A / B / C | 18 / 24 / 30 |
| 胜利音乐「冒险胜利曲」 | 16 |
| 攻击特效「闪电冲击」 | 12 |
| 攻击特效「星星爆裂」 | 18 |

- 头像 A/B/C 目前是字母色块占位，每个头像带一个专属庆祝动作，通关结算页播放。
- 攻击特效在答对的那一次反馈里叠加在敌人身上，不改变战斗数值。
- 胜利音乐只在结算页播放一次，不循环。想换成自己的 mp3：把文件放进 `assets/music/`，再改 `data/music.js` 里的 `victory` 路径；文件缺失或静音时自动回退到 8-bit 号角。

## 出题器自检

```bash
node tools/selfcheck.js 1000
```

对每个知识点生成 1000 道题，按 1~4 级循环，校验选项唯一、答案下标一致、无负数、无 `NaN`、解析非空。也会检查教材数据结构完整性，以及 44 个知识点是否都有 4 级挑战变体。浏览器版本打开 `tools/selfcheck.html` 即可。

## 题目多样性检查

```bash
node tools/qualitycheck.js              # 每个知识点每级抽 200 题，只报告
node tools/qualitycheck.js 500          # 调整抽样数量
node tools/qualitycheck.js --all        # 输出全部知识点/等级
node tools/qualitycheck.js --strict     # 按阈值返回非 0
```

报告会统计题干唯一率、单一题干最高占比、选项集合唯一率、兜底选项、答案位置分布和模板数量，并模拟 1000 次单元关组题检查同关重复。默认只报告，不阻塞游戏；`--strict` 会按初始阈值失败。当前内容尚未全部达到阈值，报告会列出需要优先补问法的知识点。

## 新增一个单元或知识点

1. 在 `data/curriculum.js` 对应学期下加单元：`{ id, name, order, hasGraphics, topics: [...] }`，其中 `topics` 每项是 `{ id, name, gen }`。
2. 在 `data/generators/g4a.js` 或 `g4b.js` 中用 `MG.gen.register('<gen-id>', function (level) { ... })` 注册生成器。
3. 生成器返回 `MG.q.build({ topicId, level, prompt, correct, wrongs, explain, canvas })`：
   - `wrongs` 给 3 个干扰项，建议用该知识点的**典型错误**（漏进位、数位错位、单位未换算等）
   - 需要画图时传 `canvas`，结构为 `{ kind, ... }`，`kind` 取值见 `js/draw.js`
4. 在 `data/generators/challenge.js` 里用 `extend('<gen-id>', function (level) { ... })` 补一个 4 级挑战变体；自检会检查覆盖率。
5. 运行 `node tools/selfcheck.js`，失败信息会指出知识点与违反的约束。

单元 id 与知识点 id 必须唯一；`order` 必须连续。

## 使用真实角色图片（可选）

默认使用 `js/sprites.js` 里代码绘制的像素角色，不读取任何图片。

想换成自己的图片：

1. 把 PNG 放进 `assets/characters/`，文件名用 `mario.png`、`link.png`、`goomba.png`、`koopa.png`、`boss.png`。
2. 在 `data/character-assets.js` 中登记：

```js
window.MG_CHARACTER_ASSETS = {
  mario: 'assets/characters/mario.png',
  link: 'assets/characters/link.png',
  goomba: 'assets/characters/goomba.png',
  koopa: 'assets/characters/koopa.png',
  boss: 'assets/characters/boss.png'
};
```

未登记的角色继续使用内置像素画。登记表为空时不会发起任何图片请求，控制台不会出现 404。

## 存档

进度保存在 `localStorage` 的 `math-game.grade4.v1` 键下，包含单元星级、学期测验成绩、错题本（最多 200 条）与设置。报告页底部可以清空全部进度（需二次确认）。存档结构带 `version` 字段，版本不匹配时会重建，不会导致页面白屏。

## 约定

- 所有路径都相对于仓库根目录，文档、代码与配置中不使用绝对路径。
- 不使用 ES Module 与 `fetch`，保证 `file://` 下直接双击也能运行。
- 不引入任何第三方库、CDN 资源或音频文件。
