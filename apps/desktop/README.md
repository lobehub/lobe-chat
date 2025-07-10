# LobeHub Desktop Application

LobeHub Desktop 是 [LobeChat](https://github.com/lobehub/lobe-chat) 的跨平台桌面应用程序，使用 Electron 构建，提供了更加原生的桌面体验和功能。

## 功能特点

- **跨平台支持**：支持 macOS (Intel/Apple Silicon)、Windows 和 Linux 系统
- **自动更新**：内置更新机制，确保您始终使用最新版本
- **多语言支持**：完整的国际化支持，包括中文、英文等多种语言
- **原生集成**：与操作系统深度集成，提供原生菜单、快捷键和通知
- **安全可靠**：macOS 版本经过公证，确保安全性
- **多渠道发布**：提供稳定版、测试版和每日构建版本

## 开发环境设置

### 前提条件

- Node.js 22+
- pnpm 10+

### 安装依赖

```bash
pnpm install-isolated
```

### 开发模式运行

```bash
pnpm electron:dev
```

### 构建应用

构建所有平台：

```bash
pnpm build
```

构建特定平台：

```bash
# macOS
pnpm build:mac

# Windows
pnpm build:win

# Linux
pnpm build:linux
```

## 发布渠道

应用提供三个发布渠道：

- **稳定版**：经过充分测试的正式版本
- **测试版 (Beta)**：预发布版本，包含即将发布的新功能
- **每日构建版 (Nightly)**：包含最新开发进展的构建版本
