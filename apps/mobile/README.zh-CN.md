# LobeChat React Native

现代化设计的开源 AI 聊天应用，基于 React Native 构建\
一键**免费**拥有你自己的跨平台 ChatGPT/Claude/Gemini 应用

**简体中文** · [English](./README.md)

[![GitHub release](https://img.shields.io/github/v/release/lobehub/lobe-chat-react-native?color=369eff&labelColor=black&logo=github&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/releases) [![Expo SDK](https://img.shields.io/badge/Expo-52.0.5-000020?labelColor=black&logo=expo&style=flat-square)](https://expo.dev) [![React Native](https://img.shields.io/badge/React%20Native-0.76.6-61dafb?labelColor=black&logo=react&style=flat-square)](https://reactnative.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?labelColor=black&logo=typescript&style=flat-square)](https://www.typescriptlang.org)

[![GitHub stars](https://img.shields.io/github/stars/lobehub/lobe-chat-react-native?color=ffcb47&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/stargazers) [![GitHub forks](https://img.shields.io/github/forks/lobehub/lobe-chat-react-native?color=8ae8ff&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/network/members) [![GitHub issues](https://img.shields.io/github/issues/lobehub/lobe-chat-react-native?color=ff80eb&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/issues) [![GitHub license](https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/blob/main/LICENSE)

探索移动端 AI 对话的无限可能，在个体崛起的时代中为你打造

![](https://img.shields.io/badge/-POWERED%20BY%20LOBEHUB-151515?labelColor=black&logo=github&style=flat-square)

## 目录

- [✨ 特性一览](#-特性一览)
- [📱 支持平台](#-支持平台)
- [🚀 快速开始](#-快速开始)
- [🛠️ 技术栈](#️-技术栈)
- [📦 项目结构](#-项目结构)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [🔗 更多工具](#-更多工具)

## ✨ 特性一览

### `1` 跨平台支持

基于 React Native 和 Expo 构建，完美支持 iOS 和 Android 平台，一套代码多端运行。

### `2` 现代化 UI 设计

- 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果
- 🌗 **深色 / 浅色主题**：支持明暗主题切换，适配系统主题
- 📱 **移动端优化**：针对移动设备进行了深度优化，提供原生应用般的体验

### `3` 多模型服务商支持

支持多种主流 AI 服务提供商：

- **OpenAI**：GPT-4、GPT-3.5 等模型
- **Anthropic**：Claude 系列模型
- **Google**：Gemini 系列模型
- **本地模型**：支持 Ollama 等本地 LLM

### `4` 强大的会话功能

- 🗣️ **流畅的对话体验**：支持流式响应，实时显示 AI 回复
- 📝 **Markdown 渲染**：完整支持 Markdown 格式，包括代码高亮
- 🎨 **代码语法高亮**：基于 Shiki 的专业代码渲染
- 🔊 **语音交互**：支持文字转语音和语音转文字功能

### `5` 安全与隐私

- 🔒 **数据安全**：支持本地数据存储，保护用户隐私
- 💾 **离线支持**：重要数据本地缓存，离线也能查看历史对话

### `6` 开发者友好

- 🛠️ **TypeScript**：完整的类型支持，提供更好的开发体验
- 📦 **模块化架构**：清晰的项目结构，易于维护和扩展
- 🧪 **测试支持**：内置 Jest 测试框架
- 📱 **热重载**：开发过程中支持实时预览

## 📱 支持平台

| 平台    | 状态    | 版本要求              |
| ------- | ------- | --------------------- |
| iOS     | ✅ 支持 | iOS 13.4+             |
| Android | ✅ 支持 | Android 6.0+ (API 23) |

## 🚀 快速开始

### 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0（推荐）
- **Expo CLI**: 最新版本
- **iOS**: Xcode 14+ (仅限 macOS)
- **Android**: Android Studio

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/lobehub/lobe-chat-react-native.git
cd lobe-chat-react-native

# 安装依赖
pnpm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量，填入你的 API 密钥
# OPENAI_API_KEY=your_openai_api_key
```

### 启动开发服务器

```bash
# 启动 Expo 开发服务器
pnpm start

# 或者直接运行指定平台
pnpm run ios     # iOS 模拟器
pnpm run android # Android 模拟器
```

### 在设备上运行

1. 安装 **Expo Go** 应用：
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 扫描终端中显示的二维码即可在真机上预览

## 🛠️ 技术栈

| 技术                        | 版本     | 描述                          |
| --------------------------- | -------- | ----------------------------- |
| **React Native**            | 0.76.6   | 跨平台移动应用开发框架        |
| **Expo**                    | \~52.0.5 | React Native 开发平台和工具链 |
| **TypeScript**              | ^5.8.2   | 类型安全的 JavaScript 超集    |
| **Expo Router**             | \~4.0.17 | 基于文件系统的路由解决方案    |
| **Zustand**                 | ^5.0.3   | 轻量级状态管理库              |
| **React Native Reanimated** | \~3.16.7 | 高性能动画库                  |
| **Shiki**                   | ^3.1.0   | 代码语法高亮引擎              |

## ⌨️ 本地开发

### 开发脚本

```bash
# 启动开发服务器
pnpm start

# 在 iOS 模拟器中运行
pnpm run ios

# 在 Android 模拟器中运行
pnpm run android

# 运行测试
pnpm run test


# 代码检查
pnpm run lint

# 构建应用
pnpm build
```

### 代码规范

本项目遵循严格的代码规范：

- **ESLint** + **Prettier** 代码格式化
- **TypeScript** 严格类型检查
- **Git Hooks** 提交前自动检查
- **Conventional Commits** 提交信息规范

## 🤝 参与贡献

我们非常欢迎各种形式的贡献！

### 贡献指南

1. **Fork** 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 **Pull Request**

### 开发规范

- 提交信息请遵循 [Conventional Commits](https://conventionalcommits.org/) 规范
- 代码格式化使用 Prettier，代码检查使用 ESLint
- 所有新功能都需要包含相应的测试用例

## 🔗 更多工具

| 项目 | 描述 |
| --- | --- |
| **[🤯 Lobe Chat](https://github.com/lobehub/lobe-chat)** | 现代化设计的开源 ChatGPT/LLM 聊天应用（Web 版） |
| **[🅰️ Lobe UI](https://github.com/lobehub/lobe-ui)** | 构建 AIGC 网页应用的开源 UI 组件库 |
| **[🌏 Lobe i18n](https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n)** | 由 ChatGPT 驱动的 i18n 翻译自动化工具 |
| **[💌 Lobe Commit](https://github.com/lobehub/lobe-commit)** | 基于 AI 的 Git 提交信息生成工具 |

---

#### 📝 开源协议

Copyright © 2025 [LobeHub](https://github.com/lobehub). 本项目基于 [Apache 2.0](./LICENSE) 协议开源.
