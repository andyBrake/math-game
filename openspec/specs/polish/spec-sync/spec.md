# polish/spec-sync Specification

## Purpose
确保 OpenSpec 主规格与当前游戏实现保持同步一致，并将题目多样性阈值的"可接受现状"规格化跟踪，避免规格与实现脱节导致后续遗漏。

## Requirements

### Requirement: 主规格与实现同步

`openspec/specs/curriculum` 主规格 MUST 反映当前实际教材范围（北师大版四年级，66 知识点），不得停留在旧的人教版描述。任何题库教材切换完成后 SHALL 同步更新对应主规格。

#### Scenario: 教材范围一致

- **WHEN** 用户或开发者读取 curriculum 主规格
- **THEN** 其声明的教材范围（北师大版、单元数、知识点数）与 `data/curriculum.js` 实际内容一致

### Requirement: 多样性阈值现状跟踪

题目多样性 `--strict` 未达标项 MUST 以可接受现状记录并持续跟踪，不阻塞游戏运行；报告 SHALL 清晰标注哪些是已接受现状、哪些是待改进项。

#### Scenario: 现状标注

- **WHEN** 运行 `tools/qualitycheck.js --strict`
- **THEN** 未达标项被归类为"已接受现状（概念题/基础级多样性）"或"待改进项"
- **AND** 不产生生成异常、兜底选项或同关重复
