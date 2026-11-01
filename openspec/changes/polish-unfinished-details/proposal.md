## Why

对 `math-game` 全面排查后，确认存在一批"未完善 / 占位 / 待打磨"的细节，此前分散在数据文件、注释和 README 里，没有被规格化跟踪，容易在后续开发中遗漏。用户试玩时已点名两类（头像 A/B/C 仍是字母色块占位、商店配乐不足），希望把全部同类问题整理进 OpenSpec，确保后续开发不遗漏、验收有标准。

## What Changes

本变更**仅立项待实现内容并建立验收规格**（不在此变更内改代码，改动由后续 apply 完成）。覆盖以下方向：

1. **头像真实化**：头像 A/B/C 由字母色块升级为真实头像素材，每个头像保留专属庆祝动作。
2. **商店配乐扩充**：胜利音乐目前仅 1 个付费曲目（"冒险胜利曲"，本地 wav），增加更多可选配乐，并明确默认/解锁规则。
3. **真实角色图可选支持**：`data/character-assets.js` 登记表目前为空，角色全部使用内置像素画；支持登记真实角色 PNG 并优先加载。
4. **其他年级占位**：`curriculum.js` 中 g1/g2/g3/g5/g6 为 `todo` 占位，明确其状态为"未实现、不可进入"，并记录为后续可选扩展。
5. **主规格与实现同步**：`openspec/specs/curriculum/spec.md` 仍描述"人教版 17 单元"，与已切换的北师大版（66 知识点）脱节，需同步。
6. **题目多样性阈值**：`qualitycheck --strict` 仍有 575 项多样性阈值未达标（题干唯一率/模板数等，集中于概念题与基础级），记录为可接受现状并跟踪。

## Capabilities

### New Capabilities
- `polish/character-assets`: 真实角色图片登记与优先加载（可选素材，未登记回退像素画）
- `polish/spec-sync`: 主规格与当前实现（北师大版题库）的同步，以及多样性阈值的可接受现状跟踪

### Modified Capabilities
- `shop`: 头像 A/B/C 从字母色块占位升级为真实素材并保留专属庆祝；胜利音乐从 1 首扩充为多曲目
- `curriculum`: 主规格当前仍声明"人教版 17 单元"，改为北师大版单元结构（66 知识点），并明确未实现年级占位

## Impact

- 数据：`data/shop.js`（头像/配乐目录）、`data/character-assets.js`（登记表）、`data/music.js`（配乐清单）、`data/curriculum.js`（未实现年级占位）
- 前端：`js/ui.js`（头像渲染/商店）、`js/music.js`（配乐播放）、`js/sprites.js`（真实角色图优先加载）
- 素材：`assets/characters/`（真实角色图）、`assets/music/`（新增配乐）
- 规格：`openspec/specs/shop`、`openspec/specs/curriculum`、`openspec/specs/question-diversity` 同步更新
- 验证：`tools/selfcheck.js`、`tools/qualitycheck.js`
