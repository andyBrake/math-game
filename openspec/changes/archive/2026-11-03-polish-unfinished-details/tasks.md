## 1. 头像真实素材

- [x] 1.1 在 `assets/avatars/` 新增头像 A/B/C 真实图片素材（avatar-a.png / avatar-b.png / avatar-c.png）
- [x] 1.2 `data/shop.js` 头像 A/B/C 项新增 `img` 字段指向对应素材
- [x] 1.3 `js/ui.js` 的 `avatarHtml` 支持存在 `img` 时渲染真实头像图，否则回退字母色块
- [x] 1.4 验证商店卡片、顶栏、结算页三处显示真实头像，且装备后专属庆祝动作照常播放
- [x] 1.5 确认旧存档（已购/已装备头像）升级后兼容，不报错

## 2. 商店配乐扩充

- [x] 2.1 `data/shop.js` 的 `MUSIC` 新增至少 1 个付费曲目（独立 id/name/price/icon/file）
- [x] 2.2 `data/music.js` 改为多曲目映射表（如 `{ victory, fanfare, ... }`），支持登记多个本地音频
- [x] 2.3 `js/music.js` 增加按曲目 id 播放能力，`playVictory` 读取当前装备曲目
- [x] 2.4 商店胜利音乐分类改为多卡展示，每个曲目可预览、购买、装备，已装备显示"使用中"
- [x] 2.5 验证各曲目装备后结算页播放对应音频；缺文件/静音/拒播时回退 8-bit 号角且无未捕获错误

## 3. 真实角色图片（可选增强）

- [x] 3.1 确认 `js/sprites.js` 图片优先加载分支覆盖 mario/link/goomba/koopa/boss 全部角色
- [x] 3.2 在 README 补充真实角色图登记示例（`data/character-assets.js` 登记格式与 `assets/characters/` 放置说明）

## 4. 主规格同步

- [x] 4.1 apply 后将 `openspec/specs/curriculum/spec.md` 的教材范围更新为北师大版（8+6 单元、66 知识点），与 `data/curriculum.js` 一致
- [x] 4.2 确认 `openspec/specs/shop/spec.md` 头像与配乐描述与本变更一致
- [x] 4.3 运行 `openspec validate --specs` 通过

## 5. 多样性现状跟踪

- [x] 5.1 `tools/qualitycheck.js --strict` 报告中区分"已接受现状（概念题/基础级多样性）"与"待改进项"
- [x] 5.2 运行 `node tools/selfcheck.js 1000` 与 `node tools/qualitycheck.js` 确认无生成异常、兜底选项、同关重复
