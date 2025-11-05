# Feature Analysis Workflow

用户需求反馈分析工具 - 分析GitHub Issues中用户最关注的功能需求

## 功能

- 自动获取所有带 `[Request]` 标签的GitHub Issues
- 按用户赞同数（reactions +1）排序
- 生成详细的功能需求分析报告
- 导出JSON格式的数据供进一步分析

## 使用方法

### 运行分析

```bash
# 从项目根目录运行
bun run scripts/featureAnalysisWorkflow/index.ts
```

### 输出文件

运行后会在 `docs/usage/features/` 目录下生成:

1. `user-feedback-analysis.mdx` - Markdown格式的分析报告
2. `feature-requests-data.json` - JSON格式的原始数据

## 配置

可以通过修改 `index.ts` 中的常量来调整:

- `OWNER`: GitHub仓库所有者 (默认: lobehub)
- `REPO`: GitHub仓库名称 (默认: lobe-chat)
- `OUTPUT_DIR`: 输出目录 (默认: docs/usage/features)
- `maxPages`: 获取的最大页数 (默认: 15)

## 环境变量

如果需要提高API限流额度，可以设置GitHub Token:

```bash
export GITHUB_TOKEN=your_github_token
```

## 报告内容

生成的报告包含:

- 📊 概览统计 (总数、已完成、进行中)
- 🔥 TOP 30 最受关注功能列表
- 📂 功能分类统计
- 💡 TOP 10 详细说明
- 📈 趋势观察

## 示例输出

```
🚀 LobeChat 功能需求分析工具

📊 正在获取功能请求数据...

  ✓ 第 1 页: 获取 100 个请求 (总计: 100)
  ✓ 第 2 页: 获取 100 个请求 (总计: 200)
  ...

✓ 总计获取 1232 个功能请求

📊 正在分析数据...

📝 正在生成报告...

✅ 报告已生成:
   📄 docs/usage/features/user-feedback-analysis.mdx
   📊 docs/usage/features/feature-requests-data.json

=== 数据摘要 ===

总功能请求数: 1232
已完成: 678
进行中: 554

TOP 5 最受关注功能:

1. ✅ 关于 gpt-image-1 模型使用的问题 (20👍)
2. ⏳ Support for Realtime API (15👍)
3. ✅ LLM 适配 (15👍)
4. ✅ 支持 DeepSeek-R1 模型 (15👍)
5. ✅ 自定义嵌入模型 (12👍)
```

## 自动化

可以设置为定期自动运行，例如通过GitHub Actions:

```yaml
name: Feature Analysis

on:
  schedule:
    - cron: '0 0 * * 0' # 每周日运行
  workflow_dispatch: # 允许手动触发

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run scripts/featureAnalysisWorkflow/index.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: update feature analysis report'
```

## 注意事项

- GitHub API有速率限制 (未认证: 60次/小时, 已认证: 5000次/小时)
- 脚本会自动添加延迟避免触发限流
- 建议使用GitHub Token以获得更高的API配额
