# macOS Electron 调试指南

本指南解决了 lobe-chat 项目中 macOS Electron 调试和 build 流程的常见问题。

## 🚀 快速开始 - 自动化调试（推荐）

### 使用自动化启动脚本

最简单的方式是使用我们新增的自动化脚本：

```bash
npm run dev:desktop:auto
```

这个脚本会：
- ✅ 自动启动 Next.js 开发服务器（端口 3015）
- ✅ 等待服务器准备就绪
- ✅ 自动启动 Electron 应用
- ✅ 提供健康检查和错误恢复
- ✅ 统一的日志输出和进程管理

## 🔧 手动调试方式

如果需要手动控制，请按以下步骤：

### 1. 启动 Next.js 开发服务器
```bash
npm run dev:desktop
```
等待看到 "Ready in" 或类似的启动成功消息。

### 2. 启动 Electron 应用
在新的终端窗口中：
```bash
cd apps/desktop
npm run electron:dev
```

## 🛠️ 构建和文件安全

### 安全的构建流程

为了防止意外的文件丢失，我们提供了安全的构建选项：

```bash
# 使用安全版本（推荐）
npm run desktop:prepare-dist:safe
```

安全版本提供：
- ✅ 自动备份现有文件
- ✅ 带时间戳的备份目录
- ✅ 失败时自动恢复
- ✅ 自动清理旧备份（保留 3 个最新）

### 传统构建流程

```bash
# 传统版本（谨慎使用）
npm run desktop:prepare-dist
```

⚠️ **警告**: 传统版本会直接删除目标目录，无备份保护。

## 🐛 故障排除

### 问题 1: Electron 无法连接到 Next.js 服务器

**症状**: Electron 应用打开但显示空白或连接错误

**解决方案**:
1. 确认 Next.js 服务器在 http://localhost:3015 正常运行
2. 检查 `.env.desktop` 文件中的 `APP_URL` 配置
3. 使用自动化脚本 `npm run dev:desktop:auto`

### 问题 2: 端口冲突

**症状**: Next.js 服务器启动失败，提示端口被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3015

# 终止进程
kill -9 <PID>
```

### 问题 3: macOS 权限问题

**症状**: Electron 无法启动或出现权限错误

**解决方案**:
1. 确保 Xcode Command Line Tools 已安装:
   ```bash
   xcode-select --install
   ```

2. 检查 Node.js 权限:
   ```bash
   node --version
   npm --version
   ```

### 问题 4: Build 过程中文件丢失

**症状**: 构建后重要文件被删除

**解决方案**:
1. 查看备份目录: `apps/desktop/dist/next.backup_*`
2. 恢复备份:
   ```bash
   cd apps/desktop/dist
   mv next.backup_YYYY-MM-DD_HH-MM-SS next
   ```
3. 今后使用安全版本: `npm run desktop:prepare-dist:safe`

## 📁 项目结构说明

```
├── apps/desktop/               # Electron 应用
│   ├── dist/next/             # Next.js 构建输出（目标目录）
│   ├── dist/next.backup_*/    # 自动备份目录
│   └── package.json           # Electron 应用配置
├── .next/standalone/          # Next.js 独立构建（源目录）
├── .env.desktop              # Desktop 环境配置
└── scripts/
    ├── dev-desktop.mjs       # 自动化调试脚本
    └── electronWorkflow/
        ├── moveNextStandalone.ts      # 传统文件移动
        └── moveNextStandaloneSafe.ts  # 安全文件移动
```

## 🚨 重要提示

1. **备份重要**: 构建前务必备份重要的开发文件
2. **使用安全脚本**: 优先使用 `*:safe` 版本的脚本
3. **检查端口**: 确保 3015 端口未被其他应用占用
4. **权限设置**: macOS 可能需要给 Electron 应用授权

## 📞 获取帮助

如果遇到其他问题：

1. 查看控制台日志输出
2. 检查 `apps/desktop/logs/` 目录
3. 提交 issue 时请包含：
   - macOS 版本
   - Node.js 版本
   - 完整的错误日志
   - 重现步骤

---

*最后更新: 2025-01-11*