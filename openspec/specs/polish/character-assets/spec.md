# polish/character-assets Specification

## Purpose
支持为战斗角色登记真实图片素材，登记后渲染时优先加载图片；未登记的角色继续使用内置像素画，不发起图片请求。

## Requirements

### Requirement: 真实角色图片优先加载

系统 MUST 支持为战斗角色登记真实图片素材。登记了图片的角色 MUST 在渲染时优先使用图片；未登记的角色 MUST 继续使用内置像素画，且不发起任何图片请求。

#### Scenario: 登记图片后使用图片

- **WHEN** 玩家为某角色登记了真实图片素材
- **THEN** 战斗与结算渲染使用该图片
- **AND** 图片缺失时不阻塞游戏，回退到像素画

#### Scenario: 未登记使用像素画

- **WHEN** 玩家未登记任何角色图片
- **THEN** 全部角色使用 `js/sprites.js` 内置像素画
- **AND** 不产生图片网络请求
