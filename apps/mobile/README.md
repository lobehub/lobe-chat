<div align="center"><a name="readme-top"></a>

# LobeHub Mobile

The LobeHub application for iOS, and Android

[Parent Project][parent-project] · [Changelog][changelog] · [Report Bug][issues-link] · [Request Feature][issues-link]

<!-- SHIELD GROUP -->

[![][expo-sdk-shield]][expo-link]
[![][react-native-shield]][react-native-link]
[![][typescript-shield]][typescript-link]<br/>
[![][license-shield]][license-link]
[![][github-stars-shield]][github-stars-link]
[![][github-forks-shield]][github-forks-link]
[![][github-issues-shield]][github-issues-link]

**Share LobeHub Mobile**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]

<sup>Experience AI conversations on your mobile device. Built for you, the Super Individual.</sup>

![][image-preview]

</div>

> \[!IMPORTANT]
>
> **📱 iOS Open Beta Now Available!**
>
> Join our TestFlight beta program and be among the first to experience LobeHub Mobile on your iPhone or iPad!
>
> 🔗 **[Join TestFlight Beta](https://testflight.apple.com/join/2ZbjX4Qp)**
>
> We'd love to hear your feedback! Share your experience with us on [Discord][discord-link] or [GitHub Issues][issues-link]. 🫰

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [👋🏻 Getting Started](#-getting-started)
- [✨ Features](#-features)
  - [📱 Cross-Platform Native Experience](#-cross-platform-native-experience)
  - [🎨 Modern UI Design](#-modern-ui-design)
  - [🤖 Multi-Model AI Provider Support](#-multi-model-ai-provider-support)
  - [💬 Rich Conversation Features](#-rich-conversation-features)
  - [🔒 Privacy & Security First](#-privacy--security-first)
  - [`*` What's more](#-whats-more)
- [📱 Platform Support](#-platform-support)
- [🚀 Quick Start](#-quick-start)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Development](#development)
- [🛠️ Tech Stack](#️-tech-stack)
- [⌨️ Local Development](#️-local-development)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Development Workflow](#development-workflow)
- [🤝 Contributing](#-contributing)
  - [Contribution Workflow](#contribution-workflow)
  - [Development Standards](#development-standards)
- [📦 Ecosystem](#-ecosystem)
- [❤️ Community](#️-community)

####

<br/>

</details>

## 👋🏻 Getting Started

We are bringing the powerful LobeHub experience to your mobile devices! Whether you're an iOS or Android user, LobeHub Mobile provides a seamless, native AI chat experience on the go.

| [![][testflight-shield]][testflight-link] | Download the iOS beta now! Join our TestFlight program to experience LobeHub Mobile. |
| :---------------------------------------: | :----------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | Join our Discord community! Connect with other users and share your feedback.        |

> \[!IMPORTANT]
>
> **Star Us**, You will receive all release notifications from GitHub without any delay \~ ⭐️

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ✨ Features

### 📱 Cross-Platform Native Experience

**True Native Performance on Both Platforms**

Built with React Native and Expo SDK 54, LobeHub Mobile delivers genuine native performance across iOS and Android. Enjoy smooth 60fps animations, instant touch feedback, and platform-specific UI patterns that feel right at home on your device.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 🎨 Modern UI Design

**Beautifully Crafted for Mobile**

- 💎 **Refined Interface**: Carefully crafted UI with elegant visuals and smooth interactions
- 🌗 **Adaptive Themes**: Seamless dark/light mode switching that follows system preferences
- 📱 **Mobile-First**: Optimized touch interactions and gestures for the best mobile experience
- ✨ **Fluid Animations**: Powered by React Native Reanimated for buttery-smooth 60fps animations
- 🎯 **Native Patterns**: Platform-specific UI components following iOS and Android design guidelines

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 🤖 Multi-Model AI Provider Support

**60+ AI Service Providers at Your Fingertips**

LobeHub Mobile supports an extensive range of AI service providers, giving you unparalleled flexibility to choose the best models for your needs:

**Major Providers:**

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5, and more
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku
- **Google**: Gemini 2.0 Flash, Gemini Pro, and Vision models
- **Microsoft**: Azure OpenAI, Azure AI services
- **xAI**: Grok models

**Local & Self-Hosted:**

- Ollama, LM Studio, vLLM, Xinference

**Chinese Providers:**

- DeepSeek, Moonshot, Qwen, ZhiPu, Baichuan, Minimax
- Hunyuan, Spark, SenseNova, Wenxin, and more

**Additional Providers:**

- Groq, Perplexity, Mistral, Together AI, Fireworks AI
- OpenRouter, HuggingFace, Cloudflare Workers AI
- Bedrock, Vertex AI, and 40+ more providers

> \[!TIP]
>
> Seamlessly switch between providers and models. All API keys are stored securely using Expo SecureStore (iOS Keychain / Android Keystore).

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 💬 Rich Conversation Features

**Everything You Need for Powerful AI Conversations**

- 🗣️ **Streaming Responses**: Real-time AI replies with smooth streaming animation
- 📝 **Rich Markdown**: Full Markdown support with tables, lists, GFM, and alerts
- 🎨 **Code Highlighting**: Professional syntax highlighting powered by Shiki (100+ languages)
- 📐 **Math Rendering**: Beautiful LaTeX formula rendering with KaTeX
- 🎙️ **Voice Interaction**: Built-in TTS (Text-to-Speech) and STT (Speech-to-Text) support
- 🖼️ **Vision Models**: Upload images and chat with vision-enabled AI models
- 🎨 **Image Generation**: Create images with DALL·E, Midjourney, and more
- 💾 **Lightning Fast Storage**: MMKV-powered local storage for instant access
- 📤 **Export & Share**: Export conversations in multiple formats
- 🔄 **Multi-Session**: Manage unlimited conversations with smart organization

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 🔒 Privacy & Security First

**Your Data, Your Control**

- 🔐 **Secure Storage**: API keys protected with Expo SecureStore (iOS Keychain / Android Keystore)
- 💾 **Local First**: All data stored locally on your device using MMKV
- 🚫 **No Tracking**: Zero analytics or tracking - your conversations stay private
- 🔓 **Open Source**: Fully transparent codebase you can audit and trust
- 📴 **Offline Access**: View your chat history even without internet connection

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### `*` What's more

Beyond these features, LobeHub Mobile also offers:

- [x] 🌐 **i18n Support**: Built-in support for 18 languages with auto-detection
- [x] 🎯 **Context Menu**: Long-press for quick actions (copy, delete, retry, regenerate)
- [x] 📋 **Smart Copy**: Intelligent content detection for code blocks, text, or entire messages
- [x] 🔍 **Global Search**: Quickly find messages across all conversations with full-text search
- [x] 🏷️ **Session Groups**: Organize conversations with custom groups, folders, and tags
- [x] 🗂️ **Topic Management**: Auto-create topics and organize conversations by context
- [x] ⚙️ **Advanced Customization**: Fine-tune model parameters (temperature, top-p, frequency penalty, etc.)
- [x] 📱 **Haptic Feedback**: Native haptic feedback for enhanced touch experience
- [x] 🎨 **Theme System**: Dynamic theming with dark/light modes and system preferences
- [x] 🔔 **Push Notifications**: Stay updated with conversation notifications
- [x] 📊 **Token Usage Tracking**: Monitor your API usage and costs
- [x] 🔄 **Pull to Refresh**: Natural gesture-based UI updates
- [x] ⌨️ **Keyboard Shortcuts**: Enhanced productivity with keyboard controls
- [x] 📤 **Import/Export**: Backup and restore your conversations

> ✨ More features will be added as LobeHub Mobile evolves.

---

> \[!NOTE]
>
> Check out our [Roadmap](https://github.com/lobehub/lobe-chat/projects) to see what's coming next!

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📱 Platform Support

| Platform | Status          | Recommended           |
| -------- | --------------- | --------------------- |
| iOS      | ✅ Fully Tested | iOS 18.0+             |
| Android  | ✅ Fully Tested | Android 15.0 (API 35) |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🚀 Quick Start

### Installation

1. Clone the repository:

```bash
git clone https://github.com/lobehub/lobe-chat.git
cd lobe-chat/apps/mobile
```

2. Install dependencies:

```bash
pnpm install
```

### Configuration

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Configure your API keys in `.env.local`:

```bash
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Optional: Custom API Base URL
# OPENAI_PROXY_URL=https://api.openai.com/v1
```

### Development

Start the development server:

```bash
# Start Expo development server
pnpm start

# Or run directly on a specific platform
pnpm ios     # iOS simulator (macOS only)
pnpm android # Android emulator
pnpm web     # Web browser preview
```

**Testing on Physical Devices:**

1. Install [Expo Go](https://expo.dev/client) on your device:
   - [📱 iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [🤖 Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code in the terminal with Expo Go to launch the app

> \[!TIP]
>
> For a faster development experience on physical devices, consider using [EAS Build](https://docs.expo.dev/build/introduction/) to create custom development builds.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛠️ Tech Stack

Our technology choices focus on **performance**, **developer experience**, and **maintainability**:

| Technology                       | Version  | Purpose                                 |
| -------------------------------- | -------- | --------------------------------------- |
| **React Native**                 | 0.81.5   | Core framework for cross-platform apps  |
| **Expo SDK**                     | \~54.0.0 | Development platform and native modules |
| **TypeScript**                   | ^5.8.2   | Type safety and better DX               |
| **Expo Router**                  | \~4.0.17 | File-based navigation                   |
| **Zustand**                      | ^5.0.3   | Lightweight state management            |
| **MMKV**                         | ^3.1.0   | Lightning-fast local storage            |
| **React Native Reanimated**      | \~3.16.7 | 60fps animations on native thread       |
| **React Native Gesture Handler** | \~2.20.2 | Native touch gestures                   |
| **Shiki**                        | ^3.1.0   | Beautiful code syntax highlighting      |
| **React Native Markdown**        | Latest   | Rich markdown rendering                 |
| **React i18next**                | ^15.2.0  | Internationalization (18 languages)     |
| **Jest**                         | Latest   | Testing framework                       |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

### Available Scripts

```bash
# Development
pnpm start   # Start Expo dev server
pnpm ios     # Run on iOS simulator
pnpm android # Run on Android emulator
pnpm web     # Run in web browser

# Testing & Quality
pnpm test       # Run Jest tests
pnpm test:watch # Run tests in watch mode
pnpm lint       # Run ESLint
pnpm type-check # Run TypeScript compiler check

# Internationalization
pnpm i18n # Generate translations for all languages

# Production
pnpm build              # Create production build
pnpm production:ios     # Build iOS production app
pnpm production:android # Build Android production app
```

### Project Structure

```bash
apps/mobile/
├── app/                # Expo Router pages
│   ├── (main)/        # Main app routes
│   ├── (setting)/     # Settings routes
│   └── playground/    # Component playground
├── src/
│   ├── components/    # Reusable UI components
│   ├── features/      # Feature-based modules
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── locales/       # i18n source files
├── assets/            # Images, fonts, etc.
├── locales/           # Generated translations
└── test/              # Test utilities
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `feat/mobile-app`
   - Follow [Development Guidelines](./docs/DEVELOPMENT.md)
   - Write tests for new features

2. **Code Quality**
   - Run `pnpm lint` before committing
   - Use TypeScript strictly (no `any`)
   - Follow existing code patterns

3. **Internationalization**
   - Add translations to `src/locales/default/common.ts`
   - Run `pnpm i18n` to generate all languages
   - Test with different locales in app settings

4. **Testing**
   - Write unit tests for utilities and hooks
   - Write component tests with React Native Testing Library
   - Ensure `pnpm test` passes before PR

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome! If you are interested in contributing code, feel free to check out our GitHub [Issues](https://github.com/lobehub/lobe-chat/issues) and [Projects](https://github.com/lobehub/lobe-chat/projects).

> \[!TIP]
>
> We are building a modern mobile AI chat application. Join us in creating an amazing user experience!
>
> Whether it's **reporting bugs**, **requesting features**, **improving documentation**, or **contributing code** - we appreciate it all.

[![][pr-welcome-shield]][pr-welcome-link]

### Contribution Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/lobe-chat.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** your changes: `pnpm test && pnpm lint`
6. **Commit** with conventional commit messages: `git commit -m 'feat: add amazing feature'`
7. **Push** to your fork: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Development Standards

- 📝 **Commit Messages**: Follow [Conventional Commits](https://conventionalcommits.org/)
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `style:` Code style changes (formatting, etc.)
  - `refactor:` Code refactoring
  - `test:` Adding or updating tests
  - `chore:` Build process or auxiliary tool changes

- 💻 **Code Style**
  - Use TypeScript strictly
  - Follow ESLint and Prettier rules
  - Write meaningful variable and function names
  - Add comments for complex logic

- 🧪 **Testing**
  - Write tests for new features
  - Ensure all tests pass
  - Maintain or improve code coverage

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Ecosystem

| NPM                               | Repository                              | Description                                                         | Version                                   |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | Open-source UI component library for building AIGC web applications | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | Popular AI / LLM Model Brand SVG Logo and Icon Collection           | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | High-quality & reliable TTS/STT React Hooks library                 | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | ESlint, Stylelint, Commitlint, Prettier configurations for LobeHub  | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ❤️ Community

We are a group of e/acc design-engineers, hoping to provide modern design components and tools for AIGC. By adopting the Bootstrapping approach, we aim to provide developers and users with a more open, transparent, and user-friendly product ecosystem.

|   [![][parent-shield]][parent-project]    | No installation or registration necessary! Visit our website to experience the web version firsthand. |
| :---------------------------------------: | :---------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | Join our Discord community! Connect with developers and other enthusiastic users of LobeHub.          |

> \[!IMPORTANT]
>
> **Star Us**, You will receive all release notifications from GitHub without any delay \~ ⭐️

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][license-image]][license-link]

</details>

Copyright © 2025 [LobeHub][profile-link]. <br />
This project is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License][license-link].

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[changelog]: https://github.com/lobehub/lobe-chat/blob/main/CHANGELOG.md
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[expo-link]: https://expo.dev
[expo-sdk-shield]: https://img.shields.io/badge/Expo-54.0.0-000020?labelColor=black&logo=expo&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobe-chat/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-chat?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/lobehub/lobe-chat/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobe-chat?color=ff80eb&labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobe-chat/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobe-chat?color=ffcb47&labelColor=black&style=flat-square
[image-preview]: https://github.com/user-attachments/assets/preview-mobile-app.png
[issues-link]: https://github.com/lobehub/lobe-chat/issues/new/choose
[license-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[license-link]: https://creativecommons.org/licenses/by-nc/4.0/
[license-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey?labelColor=black&style=flat-square
[lobe-icons-github]: https://github.com/lobehub/lobe-icons
[lobe-icons-link]: https://www.npmjs.com/package/@lobehub/icons
[lobe-icons-shield]: https://img.shields.io/npm/v/@lobehub/icons?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-tts-github]: https://github.com/lobehub/lobe-tts
[lobe-tts-link]: https://www.npmjs.com/package/@lobehub/tts
[lobe-tts-shield]: https://img.shields.io/npm/v/@lobehub/tts?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[parent-project]: https://github.com/lobehub/lobe-chat
[parent-shield]: https://img.shields.io/badge/🤯_Lobe_Chat-Web_Version-55b467?labelColor=black&style=for-the-badge
[pr-welcome-link]: https://github.com/lobehub/lobe-chat/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_PR_WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[react-native-link]: https://reactnative.dev
[react-native-shield]: https://img.shields.io/badge/React%20Native-0.81.5-61dafb?labelColor=black&logo=react&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20Mobile%20-%20An%20open-source%2C%20modern-design%20AI%20chat%20mobile%20application.%20One-click%20FREE%20deployment%20of%20your%20private%20ChatGPT%2FClaude%2FGemini%20mobile%20app.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20Mobile%20-%20An%20open-source%2C%20modern-design%20AI%20chat%20mobile%20application.%20One-click%20FREE%20deployment%20of%20your%20private%20ChatGPT%2FClaude%2FGemini%20mobile%20app.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20Mobile%20-%20An%20open-source%2C%20modern-design%20AI%20chat%20mobile%20application.%20One-click%20FREE%20deployment%20of%20your%20private%20ChatGPT%2FClaude%2FGemini%20mobile%20app.%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2Cmobile%2Creactnative&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeHub%20Mobile%20-%20An%20open-source%2C%20modern-design%20AI%20chat%20mobile%20application.%20One-click%20FREE%20deployment%20of%20your%20private%20ChatGPT%2FClaude%2FGemini%20mobile%20app.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[testflight-link]: https://testflight.apple.com/join/2ZbjX4Qp
[testflight-shield]: https://img.shields.io/badge/TestFlight-iOS_Beta-0D96F6?labelColor=black&logo=apple&style=for-the-badge
[typescript-link]: https://www.typescriptlang.org
[typescript-shield]: https://img.shields.io/badge/TypeScript-5.8.2-3178c6?labelColor=black&logo=typescript&style=flat-square
