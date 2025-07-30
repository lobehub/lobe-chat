# LobeChat React Native

A modern open-source AI chat application built with React Native\
Get your own cross-platform ChatGPT/Claude/Gemini app for **free** with one click

**简体中文** · [English](./README.md)

[![GitHub release](https://img.shields.io/github/v/release/lobehub/lobe-chat-react-native?color=369eff&labelColor=black&logo=github&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/releases) [![Expo SDK](https://img.shields.io/badge/Expo-52.0.5-000020?labelColor=black&logo=expo&style=flat-square)](https://expo.dev) [![React Native](https://img.shields.io/badge/React%20Native-0.76.6-61dafb?labelColor=black&logo=react&style=flat-square)](https://reactnative.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?labelColor=black&logo=typescript&style=flat-square)](https://www.typescriptlang.org)

[![GitHub stars](https://img.shields.io/github/stars/lobehub/lobe-chat-react-native?color=ffcb47&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/stargazers) [![GitHub forks](https://img.shields.io/github/forks/lobehub/lobe-chat-react-native?color=8ae8ff&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/network/members) [![GitHub issues](https://img.shields.io/github/issues/lobehub/lobe-chat-react-native?color=ff80eb&labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/issues) [![GitHub license](https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-react-native/blob/main/LICENSE)

Explore the limitless possibilities of AI conversations on mobile, crafted for you in an era of individual empowerment.

![](https://img.shields.io/badge/-POWERED%20BY%20LOBEHUB-151515?labelColor=black&logo=github&style=flat-square)

## Table of Contents

- [✨ Features Overview](#-features-overview)
- [📱 Supported Platforms](#-supported-platforms)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Project Structure](#-project-structure)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🔗 More Tools](#-more-tools)

## ✨ Features Overview

### `1` Cross-Platform Support

Built with React Native and Expo, fully supporting both iOS and Android platforms with a single codebase running on multiple devices.

### `2` Modern UI Design

- 💎 **Refined UI**: Carefully crafted interface with elegant visuals and smooth interactions
- 🌗 **Dark/Light Themes**: Supports theme switching and adapts to system preferences
- 📱 **Mobile Optimization**: Deeply optimized for mobile devices, delivering a native app-like experience

### `3` Multi-Model Provider Support

Supports a variety of mainstream AI service providers:

- **OpenAI**: GPT-4, GPT-3.5, and more
- **Anthropic**: Claude series models
- **Google**: Gemini series models
- **Local Models**: Supports local LLMs like Ollama

### `4` Powerful Conversation Features

- 🗣️ **Smooth Chat Experience**: Supports streaming responses for real-time AI replies
- 📝 **Markdown Rendering**: Full support for Markdown formatting, including code highlighting
- 🎨 **Code Syntax Highlighting**: Professional code rendering powered by Shiki
- 🔊 **Voice Interaction**: Supports text-to-speech and speech-to-text functionality

### `5` Security and Privacy

- 🔒 **Data Security**: Supports local data storage to protect user privacy
- 💾 **Offline Support**: Important data cached locally so you can view chat history offline

### `6` Developer Friendly

- 🛠️ **TypeScript**: Full type support for a better development experience
- 📦 **Modular Architecture**: Clear project structure for easy maintenance and extensibility
- 🧪 **Testing Support**: Built-in Jest testing framework
- 📱 **Hot Reloading**: Real-time preview during development

## 📱 Supported Platforms

| Platform | Status       | Version Requirement   |
| -------- | ------------ | --------------------- |
| iOS      | ✅ Supported | iOS 13.4+             |
| Android  | ✅ Supported | Android 6.0+ (API 23) |

## 🚀 Quick Start

### Environment Requirements

Before getting started, please ensure your development environment meets the following requirements:

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (recommended)
- **Expo CLI**: Latest version
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio

### Install Dependencies

```bash
# Clone the repository
git clone https://github.com/lobehub/lobe-chat-react-native.git
cd lobe-chat-react-native

# Install dependencies
pnpm install
```

### Configure Environment Variables

```bash
# Copy the environment variable template
cp .env.example .env.local

# Edit the environment variables and add your API keys
# OPENAI_API_KEY=your_openai_api_key
```

### Start the Development Server

```bash
# Start the Expo development server
pnpm start

# Or run on a specific platform directly
pnpm run ios     # iOS simulator
pnpm run android # Android emulator
```

### Run on a Physical Device

1. Install the **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code displayed in the terminal to preview on your device

## 🛠️ Technology Stack

| Technology                  | Version  | Description                                     |
| --------------------------- | -------- | ----------------------------------------------- |
| **React Native**            | 0.76.6   | Cross-platform mobile app framework             |
| **Expo**                    | \~52.0.5 | React Native development platform and toolchain |
| **TypeScript**              | ^5.8.2   | Type-safe JavaScript superset                   |
| **Expo Router**             | \~4.0.17 | File system-based routing solution              |
| **Zustand**                 | ^5.0.3   | Lightweight state management library            |
| **React Native Reanimated** | \~3.16.7 | High-performance animation library              |
| **Shiki**                   | ^3.1.0   | Code syntax highlighting engine                 |

## ⌨️ Local Development

### Development Scripts

```bash
# Start the development server
pnpm start

# Run on iOS simulator
pnpm run ios

# Run on Android emulator
pnpm run android

# Run tests
pnpm run test

# Code linting
pnpm run lint

# Build the app
pnpm build
```

### Code Standards

This project follows strict code standards:

- **ESLint** + **Prettier** for code formatting
- **TypeScript** strict type checking
- **Git Hooks** for pre-commit checks
- **Conventional Commits** for commit message conventions

## 🤝 Contributing

We warmly welcome all forms of contributions!

### Contribution Guide

1. **Fork** this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Development Guidelines

- Please follow the [Conventional Commits](https://conventionalcommits.org/) specification for commit messages
- Use Prettier for code formatting and ESLint for code linting
- All new features should include corresponding test cases

## 🔗 More Tools

| Project | Description |
| --- | --- |
| **[🤯 Lobe Chat](https://github.com/lobehub/lobe-chat)** | Modern open-source ChatGPT/LLM chat app (Web version) |
| **[🅰️ Lobe UI](https://github.com/lobehub/lobe-ui)** | Open-source UI component library for building AIGC web apps |
| **[🌏 Lobe i18n](https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n)** | ChatGPT-powered i18n translation automation tool |
| **[💌 Lobe Commit](https://github.com/lobehub/lobe-commit)** | AI-based Git commit message generator |

---

#### 📝 License

Copyright © 2025 [LobeHub](https://github.com/lobehub). This project is open source under the [Apache 2.0](./LICENSE) license.
