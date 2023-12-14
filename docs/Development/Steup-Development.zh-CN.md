# 环境设置指南

欢迎阅读 LobeChat 的开发环境设置指南。

#### TOC

- [在线开发](#在线开发)
- [本地开发](#本地开发)
  - [开发环境需求](#开发环境需求)
  - [项目设置](#项目设置)

## 在线开发

如果你有 GitHub Codespaces 的使用权限，可以点击下方按钮一键进入在线开发环境：

[![][codespaces-shield]][codespaces-link]

## 本地开发

在开始开发 LobeChat 之前，你需要在本地环境中安装和配置一些必要的软件和工具。本文档将指导你完成这些步骤。

### 开发环境需求

首先，你需要安装以下软件：

- Node.js：LobeChat 是基于 Node.js 构建的，因此你需要安装 Node.js。我们建议安装最新的稳定版。
- Bun：我们使用 Bun 作为首选包管理器。你可以从 Bun 的官方网站上下载并安装。
- PNPM：我们使用 PNPM 作为辅助包管理器。你可以从 pnpm 的官方网站上下载并安装。
- Git：我们使用 Git 进行版本控制。你可以从 Git 的官方网站上下载并安装。
- IDE：你可以选择你喜欢的集成开发环境（IDE）。我们推荐使用 WebStorm，它是一款功能强大的 IDE，特别适合 TypeScript 开发。

### 项目设置

完成上述软件的安装后，你可以开始设置 LobeChat 项目了。

1. **获取代码**：首先，你需要从 GitHub 上克隆 LobeChat 的代码库。在终端中运行以下命令：

```bash
git clone https://github.com/lobehub/lobe-chat.git
```

2. **安装依赖**：然后，进入项目目录，并使用 bun 安装项目的依赖包：

```bash
cd lobe-chat
bun i
```

如果你使用 pnpm ，可以执行:

```bash
cd lobe-chat
pnpm i
```

3. **启动开发服务器**：安装完依赖后，你可以启动开发服务器：

```bash
bun run dev
```

现在，你可以在浏览器中打开 `http://localhost:3010`，你应该能看到 LobeChat 的欢迎页面。这表明你已经成功地设置了开发环境。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/274655364-414bc31e-8511-47a3-af17-209b530effc7.png)

在开发过程中，如果你在环境设置上遇到任何问题，或者有任何关于 LobeChat 开发的问题，欢迎随时向我们提问。我们期待看到你的贡献！

[codespaces-link]: https://codespaces.new/lobehub/lobe-chat
[codespaces-shield]: https://github.com/codespaces/badge.svg
