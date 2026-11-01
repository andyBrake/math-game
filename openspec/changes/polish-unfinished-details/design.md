# Design

本变更立项一批"未完善细节"的打磨任务，覆盖头像真实化、配乐扩充、真实角色图、规格同步与多样性现状跟踪。以下为各方向的实现方案。

## 1. 头像真实素材（avatar / shop）

- **现状**：`data/shop.js` 中头像 A/B/C 用 `letter` + 色块渲染（`js/ui.js` 的 `avatar-letter` 分支）；庆祝动作已用 CSS keyframes 实现（`celebSpin`/`celebJump`/`celebSway`）。
- **方案**：
  - 在 `assets/avatars/` 下新增 3 张真实头像图（如 `avatar-a.png`/`avatar-b.png`/`avatar-c.png`）。
  - `data/shop.js` 头像项新增 `img` 字段；`js/ui.js` 的 `avatarHtml` 在存在 `img` 时输出 `<img>`，否则保持字母色块兜底。
  - 保留价格、名称、庆祝动作、装备逻辑与存档键不变，确保旧存档兼容。
- **验收**：商店卡片/顶栏/结算页显示真实图；装备后庆祝动作照常；旧存档不报错。

## 2. 配乐扩充（music / shop）

- **现状**：`data/shop.js` 的 `MUSIC` 仅 1 个付费曲目"冒险胜利曲"；`data/music.js` 登记表单条 `victory`；`js/music.js` 播放单曲。
- **方案**：
  - `data/shop.js` `MUSIC` 增加新曲目（如"凯旋进行曲""星空小夜曲"等），每项带独立 `id/name/price/icon/file`。
  - `data/music.js` 改为曲目映射表：`{ victory: {...}, fanfare: 'assets/music/fanfare.mp3', ... }`，支持多曲目。
  - `js/music.js` 增加 `play(id)` 按曲目 id 播放，`playVictory` 读取当前装备曲目；回退逻辑（缺文件/静音/拒播 → 8-bit 号角）保持不变。
  - 商店 UI 胜利音乐分类改为多卡展示，每个可预览/购买/装备。
- **验收**：商店展示多曲目；分别装备后结算页播对应曲目；缺文件回退号角且无报错。

## 3. 真实角色图片（character-assets）

- **现状**：`data/character-assets.js` = `{}`，`js/sprites.js` 在登记表有对应 key 时优先加载图片，否则用像素画。管线已就绪。
- **方案**：无需改渲染逻辑，只需确认 `sprites.js` 的图片优先加载分支完整（`mario/link/goomba/koopa/boss` 均可登记），并在 README 补登记示例。属于"可选增强"，默认保持像素画。
- **验收**：登记某角色图片后战斗/结算使用图片；缺失时回退像素画不阻塞。

## 4. 规格同步（spec-sync / curriculum）

- **现状**：`openspec/specs/curriculum/spec.md` 仍写"人教版 17 单元"，与已切换的北师大版（66 知识点）脱节。
- **方案**：本变更的 delta spec 已声明北师大版范围，apply 时同步主规格；同时把"切换后必须同步主规格"纳入变更后流程。
- **验收**：`openspec/specs/curriculum/spec.md` 声明的范围与 `data/curriculum.js` 一致。

## 5. 多样性现状跟踪（spec-sync）

- **现状**：`qualitycheck --strict` 575 项阈值未达标（概念题/基础级题干唯一率等），无正确性问题，属已接受现状。
- **方案**：不改生成器（避免破坏已验证题库）；仅在本变更规格中记录该现状，并在 `qualitycheck` 报告中区分"已接受现状 / 待改进项"。
- **验收**：报告能区分两类未达标项；不产生生成异常、兜底、同关重复。

## 影响范围

- 数据：`data/shop.js`、`data/music.js`、`data/character-assets.js`
- 前端：`js/ui.js`、`js/music.js`、`js/sprites.js`
- 素材：`assets/avatars/`、`assets/music/`
- 规格：`openspec/specs/shop`、`openspec/specs/curriculum`
- 验证：`tools/selfcheck.js`、`tools/qualitycheck.js`
