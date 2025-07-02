# AI 绘画调试指南

## 概述

为 AI 绘画功能的整个流程添加了详细的调试日志，覆盖从服务层到数据库层的各个关键步骤。

## 调试命名空间

生图功能使用以下 debug 命名空间：

- `lobe-image:service` - 图像服务层日志
- `lobe-image:lambda` - Lambda 路由器日志（主要的任务分发逻辑）
- `lobe-image:async` - 异步路由器日志（实际的生图执行逻辑）
- `lobe-image:generation-model` - Generation 数据模型操作日志

## 如何启用调试日志

### 开发环境

在开发环境中，可以通过设置 `DEBUG` 环境变量来启用特定的调试日志：

```bash
# 启用所有生图相关的调试日志
DEBUG=lobe-image:* pnpm dev

# 启用特定层的调试日志
DEBUG=lobe-image:lambda pnpm dev

# 启用所有 lobe-chat 相关的调试日志
DEBUG=lobe-* pnpm dev
```

### 生产环境

在生产环境中，建议谨慎启用调试日志，避免日志过多影响性能：

```bash
# 只启用图像生成相关的关键日志
DEBUG=lobe-image:lambda,lobe-image:async NODE_ENV=production pnpm start
```

## 日志内容说明

### 服务层 (`lobe-image:service`)

- 服务初始化信息
- 请求参数记录
- 成功/失败结果摘要

### Lambda 路由器 (`lobe-image:lambda`)

- 请求开始和参数
- 数据库事务开始
- GenerationBatch 创建
- Generation 创建（4个）
- AsyncTask 创建和触发
- 整个流程完成的摘要

### 异步路由器 (`lobe-image:async`)

- 异步任务开始执行
- Agent Runtime 初始化
- 模型调用和响应
- 数据库更新操作
- 任务状态变更

### 数据库模型 (`lobe-image:generation-model`)

- Generation 的创建、查询、更新操作
- 数据库操作的结果

## 调试示例

典型的生图流程调试日志流程：

```
lobe-image:service AiImageService initialized for user: user123
lobe-image:service Creating image with payload: { userId: 'user123', provider: 'fal', model: 'flux-1.1-pro', ... }
lobe-image:lambda Starting image creation process: { userId: 'user123', ... }
lobe-image:lambda Starting database transaction for image generation
lobe-image:lambda Creating generation batch: { provider: 'fal', ... }
lobe-image:lambda Generation batch created successfully: batch789
lobe-image:lambda Creating 4 generations for batch: batch789
lobe-image:generation-model Creating generation: { userId: 'user123', generationBatchId: 'batch789' }
lobe-image:generation-model Generation created successfully: gen001
... (repeat for 4 generations)
lobe-image:lambda All async tasks created, preparing to trigger image generation
lobe-image:lambda Triggering 4 async image generation tasks
lobe-image:async Starting async image generation: { taskId: 'task001', generationId: 'gen001', ... }
lobe-image:async Initializing agent runtime for provider: fal
lobe-image:async Agent runtime initialized, calling createImage
lobe-image:async Image generation successful: { hasImageUrl: true, width: 1024, height: 1024 }
lobe-image:generation-model Updating generation: gen001 with values: { hasAsset: true }
lobe-image:async Async image generation completed successfully: task001
```

## 故障排查

常见问题的调试方法：

1. **任务创建失败**：查看 `lobe-image:lambda` 日志中的数据库事务部分
2. **异步任务触发失败**：查看 `lobe-image:lambda` 中 "Failed to trigger async task" 的错误日志
3. **生图执行失败**：查看 `lobe-image:async` 日志中的模型调用和错误信息
4. **数据库更新失败**：查看 `lobe-image:generation-model` 日志

通过这些详细的调试日志，可以快速定位生图流程中的任何问题，并了解整个流程的执行状态。
