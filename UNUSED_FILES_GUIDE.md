# 未使用文件检测报告

## 📊 检测结果摘要

- **总计**: 138 个未使用的文件
- **检测工具**: Knip
- **检测时间**: 2025-12-05

## 📁 分类统计

| 分类       | 文件数量 |
| ---------- | -------- |
| Features   | 57       |
| Components | 30       |
| Packages   | 18       |
| Store      | 9        |
| E2E Tests  | 9        |
| Hooks      | 7        |
| Services   | 4        |
| Others     | 4        |
| Tools      | 3        |
| Server     | 12       |

## 🎯 重点关注区域

### 1. AgentSetting 相关组件（可能已重构）

```
src/features/AgentSetting/AgentMeta/
src/features/AgentSetting/AgentPlugin/
src/features/AgentSetting/AgentTTS/
src/features/AgentSetting/AgentPrompt/
```

### 2. ResourceManager 相关组件

```
src/features/ResourceManager/Header/
src/features/ResourceManager/PageExplorer/
src/features/ResourceManager/FileExplorer/
```

### 3. SharePdf 功能（整个模块）

```
src/features/ChatList/components/ChatItem/ShareMessageModal/SharePdf/
```

### 4. Discover Store Slices

```
src/store/discover/slices/assistant/
src/store/discover/slices/model/
src/store/discover/slices/plugin/
src/store/discover/slices/provider/
```

## ⚠️ 删除建议

### 第一优先级 - 较安全删除

这些文件 / 文件夹可能是旧代码或已被替换：

```bash
# Template 文件
rm src/server/routers/lambda/_template.ts
rm packages/database/src/models/_template.ts

# Mock 文件
rm src/libs/trpc/mock.ts

# E2E 旧测试文件（Cucumber 配置）
rm e2e/cucumber.config.js
rm -rf e2e/src/steps/
rm -rf e2e/src/support/

# Promptfoo 测试文件（如果不再使用）
rm -rf packages/prompts/promptfoo/
```

### 第二优先级 - 需要验证

这些可能仍在特定场景下使用：

```bash
# Redis 相关（如果项目不使用 Redis）
rm src/envs/redis.ts
rm src/libs/redis/index.ts

# Python 环境（如果不使用）
rm src/envs/python.ts

# 旧的 UI 组件
rm src/components/StopLoading.tsx
rm src/components/Link.tsx
```

### 第三优先级 - 谨慎处理

需要仔细检查业务逻辑：

- 所有 `src/features/AgentSetting/*` 相关文件
- 所有 `src/store/discover/slices/*` 文件
- SharePdf 相关功能

## 🔧 使用的工具命令

### 检查未使用的文件

```bash
bunx knip --include files
```

### 检查未使用的导出

```bash
bunx knip --include exports
```

### 检查未使用的依赖

```bash
bunx knip --include dependencies
```

### 检查所有问题

```bash
bunx knip
```

### 生成详细报告

```bash
bunx knip --reporter json > knip-report.json
```

## 📝 后续步骤

1. **验证文件**: 在删除前，通过 grep 搜索确认文件真的未被使用

   ```bash
   # 示例：搜索某个文件是否被引用
   grep -r "AgentMeta" src/ --include="*.ts" --include="*.tsx"
   ```

2. **创建清理分支**

   ```bash
   git checkout -b cleanup/remove-unused-files
   ```

3. **分批删除**: 建议分类别逐步删除，每次删除后：
   - 运行 `bun run type-check` 检查类型错误
   - 运行 `bun run lint` 检查 lint 错误
   - 运行相关测试确保功能正常

4. **提交 PR**: 按照项目规范提交 PR

## 🛠️ 其他可选工具

### ts-prune（轻量级）

```bash
pnpm add -D ts-prune
bunx ts-prune | grep -v '(used in module)'
```

### depcheck（检查依赖）

```bash
pnpm add -D depcheck
bunx depcheck
```

## 📚 参考资源

- [Knip 官方文档](https://github.com/webpro/knip)
- [ts-prune](https://github.com/nadeesha/ts-prune)

---

**注意**:

1. 这个报告是基于静态分析生成的，某些文件可能通过动态导入或其他方式被使用
2. 删除前务必进行充分测试
3. 建议在独立分支上进行清理工作
