# src 目录未使用文件检测报告 🔍

## ✅ 已配置完成

配置文件：`knip.ts` - 只检查 `src` 目录，忽略 `packages`、`e2e`、`scripts` 等。

## 🚀 使用命令

```bash
# 检查未使用的文件和导出
bun run lint:unused

# 生成 JSON 格式报告
bunx knip --reporter json > knip-report.json
```

## 📊 检测结果（2025-12-05）

| 类型         | 数量   |
| ------------ | ------ |
| 未使用的文件 | 111 个 |
| 未使用的导出 | 28 个  |

## 📁 主要未使用文件分类

### 1. AgentSetting 功能（22 个文件）

可能已被重构，建议检查是否完全迁移：

```
src/features/AgentSetting/AgentMeta/
src/features/AgentSetting/AgentPlugin/
src/features/AgentSetting/AgentTTS/
src/features/AgentSetting/AgentPrompt/
```

### 2. ResourceManager 功能（11 个文件）

```
src/features/ResourceManager/Header/
src/features/ResourceManager/PageExplorer/
src/features/ResourceManager/FileExplorer/
```

### 3. SharePdf 功能（5 个文件）

整个模块可能未使用：

```
src/features/ChatList/components/ChatItem/ShareMessageModal/SharePdf/
```

### 4. Discover Store Slices（4 个）

```
src/store/discover/slices/assistant/
src/store/discover/slices/model/
src/store/discover/slices/plugin/
src/store/discover/slices/provider/
```

### 5. 其他未使用文件

```
# Template 文件
src/server/routers/lambda/_template.ts

# Mock 文件
src/libs/trpc/mock.ts

# Redis（如果不使用）
src/envs/redis.ts
src/libs/redis/index.ts

# Python（如果不使用）
src/envs/python.ts
```

## 🎯 建议清理步骤

### Step 1: 验证文件是否真的未使用

```bash
# 搜索文件名是否被动态引用
grep -r "AgentMeta" src/ --include="*.ts" --include="*.tsx"

# 搜索导入语句
grep -r "from.*AgentMeta" src/ --include="*.ts" --include="*.tsx"
```

### Step 2: 创建清理分支

```bash
git checkout -b your_name/cleanup/remove-unused-src-files
```

### Step 3: 优先删除最安全的文件

```bash
# Template 和 Mock 文件
rm src/server/routers/lambda/_template.ts
rm src/libs/trpc/mock.ts

# 验证
bun run type-check
bun run lint
```

### Step 4: 按模块逐步删除

每次删除一个模块后：

1. 运行 `bun run type-check` 检查类型
2. 运行 `bun run lint` 检查 lint
3. 本地测试功能是否正常

### Step 5: 提交 PR

按照项目规范提交 PR，使用 gitmoji 前缀。

## ⚠️ 注意事项

1. **动态导入**：某些文件可能通过 `import()` 动态加载，静态分析无法检测
2. **Next.js 约定**：`app` 目录下的文件可能是路由文件
3. **外部引用**：某些文件可能被配置文件或外部工具使用
4. **分批删除**：建议每次删除 10-20 个文件，立即测试
5. **备份**：如不确定，可以先移动到 `_archived` 目录观察一段时间

## 🔧 配置说明

`knip.ts` 配置解释：

```typescript
{
  entry: [
    // Next.js App Router 的入口点
    'src/app/**/*.ts{x,}',
    // OpenTelemetry instrumentation
    'src/instrumentation.ts',
    'src/instrumentation.node.ts',
  ],
  // 只检查 src 目录下的所有 TypeScript 文件
  project: ['src/**/*.ts{x,}'],
  // 忽略测试文件和其他目录
  ignore: [
    'src/**/__tests__/**',
    'src/**/*.test.ts{x,}',
    'packages/**',
    'e2e/**',
    // ...
  ],
}
```

## 📚 相关资源

- [Knip 官方文档](https://knip.dev/)
- [项目 TypeScript 规范](.cursor/rules/typescript.mdc)

---

**生成时间**: 2025-12-05\
**配置文件**: `knip.ts`\
**检测范围**: 仅 `src/` 目录
