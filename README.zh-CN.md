<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji-anim/1.0.0/files/assets/robot.webp">

<h1>Lobe Chat</h1>

LobeChat 是一个开源的、可扩展的（[Function Calling][fc-link]）高性能聊天机器人框架。<br/> 它支持一键免费部署私人 ChatGPT/LLM 网页应用程序。

[English](./README.md) · **简体中文** · [更新日志](./CHANGELOG.md) · [文档][github-wiki-link] · [报告问题][github-issues-link] · [请求功能][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][docker-release-shield]][docker-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]<br/>
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

**分享 LobeChat 给你的好友**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]

![](https://gw.alipayobjects.com/zos/kitchen/RKnWrrfuMl/welcome.webp)

</div>

<details>
<summary><kbd>目录树</kbd></summary>

#### TOC

- [👋🏻 开始使用 & 交流](#-开始使用--交流)
- [✨ 功能特性](#-功能特性)
- [📸 快照预览](#-快照预览)
- [⚡️ 性能测试](#️-性能测试)
- [🛳 开箱即用](#-开箱即用)
  - [`A` 使用 Vercel 部署](#a-使用-vercel-部署)
  - [`B` 使用 Docker 部署](#b-使用-docker-部署)
  - [环境变量](#环境变量)
- [📦 生态系统](#-生态系统)
- [🧩 插件体系](#-插件体系)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [🔗 更多工具](#-更多工具)

####

<br/>

</details>

## 👋🏻 开始使用 & 交流

我们是一群充满热情的设计工程师，希望为 AIGC 提供现代化的设计组件和工具，并以开源的方式分享，以促进它们在更广泛的社区中的发展和采用，LobeChat 目前正在积极开发中，有需求或者问题，欢迎提交 [issues][issues-link]

| [![][vercel-shield-badge]][vercel-link]   | 无需安装或注册！访问我们的网站，快速体验                                     |
| :---------------------------------------- | :--------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | 加入我们的 Discord 社区！这是你可以与开发者和其他 LobeHub 热衷用户交流的地方 |

> \[!IMPORTANT]
>
> **收藏项目**，你将从 GitHub 上无延迟地接收所有发布通知～⭐️

![](https://gw.alipayobjects.com/zos/kitchen/0hcO8QiU9c/star.webp)

<details><summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ 功能特性

- [x] 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果，支持亮暗色主题，适配移动端。支持 PWA，提供更加接近原生应用的体验 .
- [x] 🗣️ **流畅的对话体验**：流式响应带来流畅的对话体验，并且支持完整的 Markdown 渲染，包括代码高亮、LaTex 公式、Mermaid 流程图等 .
- [x] 🧩 **支持插件与自定义插件开发**：会话支持插件扩展，用户可以安装和使用各种插件，例如搜索引擎、网页提取等，同时也支持自定义插件的开发，满足自定义需求 .
- [x] 🤖 **自定义助手角色**：用户可以根据自己的需求创建、分享和调试个性化的对话助手角色，提供更加灵活和个性化的对话功能 .
- [x] 🏬 **角色市场**：提供角色市场，用户可以在市场上选择自己喜欢的对话助手角色，丰富对话的内容和风格 .
- [x] 👁️ **视觉识别**: 通过集成视觉识别能力，AI 助手现在可以分析和理解对话过程中提供的图像。这使得对话代理能够进行更具交互性和上下文感知的对话，根据视觉内容提供相关和准确的回答。
- [ ] （WIP）📢 **文本转语音（TTS）对话**: 我们正在支持文本转语音技术，允许用户与对话代理进行语音对话。这个功能通过提供更自然和沉浸式的对话环境来增强用户体验。用户可以选择多种声音并调整语速以适应自己的偏好。

> \[!NOTE]
>
> 你可以在 Projects 中找到我们后续的 [Roadmap][github-project-link] 计划

---

除了上述功能特性以外，我们的底层技术方案为你带来了更多使用保障：

- [x] 💨 **快速部署**：使用 Vercel 平台或者我们的 Docker 镜像，只需点击一键部署按钮，即可在 1 分钟内完成部署，无需复杂的配置过程 .
- [x] 🔒 **隐私安全**：所有数据保存在用户浏览器本地，保证用户的隐私安全 .
- [x] 🌐 **自定义域名**：如果用户拥有自己的域名，可以将其绑定到平台上，方便在任何地方快速访问对话助手 .

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📸 快照预览

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/268670883-33c43a5c-a512-467e-855c-fa299548cce5.png)

#### `1` Function Calling 插件系统

通过构建强大的插件生态，ChatGPT 不仅能够实时获取最新新闻，还能助你一臂之力，轻松查询文档、访问各大电商数据。这使得 ChatGPT 在更广泛的领域中发挥其关键作用。如果你对编写插件有所兴趣，我们在下文的 [🧩 插件体系](#-插件体系) 中提供了详尽的组件开发文档、SDK、以及样板文件，让我们一起让助手变得更加好用和强大～

<br/>

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/268670869-f1ffbf66-42b6-42cf-a937-9ce1f8328514.png)

#### `2` Prompt 助手市场

在我们的助手市场中，我们积累了大量实用的助手 Prompt，这些都是在日常工作和学习中得到实际应用的。你也可以在这里分享你的助手，与更多的人一起迭代和优化你的助手提示词。你可以通过 [🤖/🏪 提交助手][submit-agents-link] 来提交你的助手，我们构建的自动化 i18n 工作流将会自动将你的助手翻译成多语言版本，让多语种用户都能享受到你的智慧成果。

<!-- AGENT LIST -->

| 最近新增                                                                                                                                                         | 助手说明                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [专家代理人导师](https://chat-preview.lobehub.com/market?agent=co-agent)<br/><sup>By **[tcmonster](https://github.com/tcmonster)** on **2023-11-16**</sup>       | 调用完全适合任务的专家代理人来支持您的目标<br/>`任务指导` `执行计划` `沟通` `支持`                                                                                                                                                           |
| [全栈开发人员](https://chat-preview.lobehub.com/market?agent=fs-dev)<br/><sup>By **[cloverfield11](https://github.com/cloverfield11)** on **2023-11-15**</sup>   | 具有 HTML、CSS、JavaScript、Python、Java、Ruby 和 React、Angular、Vue.js、Express、Django、Next.js、Flask 或 Ruby on Rails 框架经验的全栈 Web 开发人员。具备数据库、应用架构、安全性和测试经验。<br/>`web开发` `前端` `后端` `编程` `数据库` |
| [图形创意大师](https://chat-preview.lobehub.com/market?agent=graphic-creativity)<br/><sup>By **[yingxirz](https://github.com/yingxirz)** on **2023-11-15**</sup> | 擅长平面创意设计与图形创意<br/>`图形` `创意` `设计` `平面`                                                                                                                                                                                   |
| [专家代理人导师](https://chat-preview.lobehub.com/market?agent=synapse-co-r)<br/><sup>By **[tcmonster](https://github.com/tcmonster)** on **2023-11-15**</sup>   | 调用完全适合任务的专家代理人来支持您的目标<br/>`任务指导` `执行计划` `沟通` `支持`                                                                                                                                                           |

> 📊 Total agents: [<kbd>**48**</kbd> ](https://github.com/lobehub/lobe-chat-agents)

 <!-- AGENT LIST -->

<br/>

![](https://gw.alipayobjects.com/zos/kitchen/69x6bllkX3/pwa.webp)

#### `3` PWA 渐进式 Web 应用

利用渐进式 Web 应用 [PWA](https://support.google.com/chrome/answer/9658361) 技术，您可在电脑或移动设备上实现流畅的 LobeChat 体验。

> \[!NOTE]
>
> 若您未熟悉 PWA 的安装过程，您可以按照以下步骤将 LobeChat 添加为您的桌面应用（也适用于移动设备）：
>
> - 在电脑上运行 Chrome 或 Edge 浏览器 .
> - 访问 LobeChat 网页 .
> - 在地址栏的右上角，单击 <kbd>安装</kbd> 图标 .
> - 根据屏幕上的指示完成 PWA 的安装 .

<br/>

![](https://gw.alipayobjects.com/zos/kitchen/pvus1lo%26Z7/darkmode.webp)

#### `4` 主题模式选择

LobeChat 提供了两种独特的主题模式 - 明亮模式和暗黑模式，以及丰富的颜色定制选项，以满足您的个性化需求。默认情况下，我们的主题会智能地跟随您的系统设置进行切换，但如果您希望进行手动控制，也可以轻松在设置中进行切换。

<br/>

![](https://gw.alipayobjects.com/zos/kitchen/R441AuFS4W/mobile.webp)

#### `5` 移动设备适配

针对移动设备进行了一系列的优化设计，以提升用户的移动体验。目前，我们正在对移动端的用户体验进行版本迭代，以实现更加流畅和直观的交互。如果您有任何建议或想法，我们非常欢迎您通过 GitHub Issues 或者 Pull Requests 提供反馈。

> 🚧 更多快照和演示正在陆续添加中...

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ 性能测试

> \[!NOTE]
>
> 完整测试报告可见 [📘 Lighthouse 性能测试](https://github.com/lobehub/lobe-chat/wiki/Lighthouse.zh-CN)

|                    Desktop                    |                    Mobile                    |
| :-------------------------------------------: | :------------------------------------------: |
|               ![][chat-desktop]               |               ![][chat-mobile]               |
| [📑 Lighthouse 测试报告][chat-desktop-report] | [📑 Lighthouse 测试报告][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 开箱即用

LobeChat 提供了 Vercel 的 自托管版本 和 [Docker 镜像][docker-release-link]，这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。

<br/>

### `A` 使用 Vercel 部署

如果想在 Vercel 上部署该服务，可以按照以下步骤进行操作：

- 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 点击下方按钮开始部署： Deploy with Vercel，直接使用 GitHub 账号登录即可，记得在环境变量页填入 `OPENAI_API_KEY` （必填） and `ACCESS_CODE`（推荐）；
- 部署完毕后，即可开始使用；
- 绑定自定义域名（可选）：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。

<div align="center">

[![][deploy-button-image]][deploy-link]

</div>

#### 保持更新

如果你根据 README 中的一键部署步骤部署了自己的项目，你可能会发现总是被提示 “有可用更新”。这是因为 Vercel 默认为你创建新项目而非 fork 本项目，这将导致无法准确检测更新。

> \[!TIP]
>
> 我们建议按照 [📘 LobeChat 自部署保持更新](https://github.com/lobehub/lobe-chat/wiki/Upstream-Sync.zh-CN) 步骤重新部署。

<br/>

### `B` 使用 Docker 部署

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

我们提供了 Docker 镜像，供你在自己的私有设备上部署 LobeChat 服务。使用以下命令即可使用一键启动 LobeChat 服务：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!TIP]
>
> 如果你需要通过代理使用 OpenAI 服务，你可以使用 `OPENAI_PROXY_URL` 环境变量来配置代理地址：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> 有关 Docker 部署的详细说明，详见 [📘 使用 Docker 部署](https://github.com/lobehub/lobe-chat/wiki/Docker-Deployment.zh-CN)

<br/>

### 环境变量

本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量           | 类型 | 描述                                                                                   | 示例                                                                         |
| ------------------ | ---- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `OPENAI_API_KEY`   | 必选 | 这是你在 OpenAI 账户页面申请的 API 密钥                                                | `sk-xxxxxx...xxxxxx`                                                         |
| `OPENAI_PROXY_URL` | 可选 | 如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL | `https://api.chatanywhere.cn/v1`<br/>默认值:<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`      | 可选 | 添加访问此服务的密码，密码应为 6 位数字或字母                                          | `awCT74` 或 `e3@09!`                                                         |

> \[!NOTE]
>
> 完整环境变量可见 [📘环境变量](https://github.com/lobehub/lobe-chat/wiki/Environment-Variable.zh-CN)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 生态系统

| NPM                             | 仓库                                  | 描述                                                                                                  | 版本                                    |
| ------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [@lobehub/ui][lobe-ui-link]     | [lobehub/lobe-ui][lobe-ui-github]     | Lobe UI 是一个专为构建 AIGC 网页应用程序而设计的开源 UI 组件库。                                      | [![][lobe-ui-shield]][lobe-ui-link]     |
| [@lobehub/lint][lobe-lint-link] | [lobehub/lobe-lint][lobe-lint-github] | LobeLint 为 LobeHub 提供 ESlint，Stylelint，Commitlint，Prettier，Remark 和 Semantic Release 的配置。 | [![][lobe-lint-shield]][lobe-lint-link] |
| @lobehub/assets                 | [lobehub/assets][lobe-assets-github]  | LobeHub 的 Logo 资源、favicon、网页字体。                                                             |                                         |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 插件体系

插件提供了扩展 LobeChat [Function Calling][fc-link] 能力的方法。可以用于引入新的 Function Calling，甚至是新的消息结果渲染方式。如果你对插件开发感兴趣，请在 Wiki 中查阅我们的 [📘 插件开发指引](https://github.com/lobehub/lobe-chat/wiki/Plugin-Development.zh-CN) 。

- [lobe-chat-plugins][lobe-chat-plugins]：这是 LobeChat 的插件索引。它从该仓库的 index.json 中获取插件列表并显示给用户。
- [chat-plugin-template][chat-plugin-template]: Chat Plugin 插件开发模版，你可以通过项目模版快速新建插件项目。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]：LobeChat 插件 SDK 可帮助您创建出色的 Lobe Chat 插件。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]：LobeChat 插件网关是一个后端服务，作为 LobeChat 插件的网关。我们使用 Vercel 部署此服务。主要的 API POST /api/v1/runner 被部署为 Edge Function。

> \[!NOTE]
>
> 插件系统目前正在进行重大开发。您可以在以下 Issues 中了解更多信息:
>
> - [x] [**插件一期**](https://github.com/lobehub/lobe-chat/issues/73): 实现插件与主体分离，将插件拆分为独立仓库维护，并实现插件的动态加载
> - [x] [**插件二期**](https://github.com/lobehub/lobe-chat/issues/97): 插件的安全性与使用的稳定性，更加精准地呈现异常状态，插件架构的可维护性与开发者友好
> - [ ] [**插件三期**](https://github.com/lobehub/lobe-chat/issues/149)：更高阶与完善的自定义能力，支持插件鉴权与示例

<!-- PLUGIN LIST -->

| 官方插件                                                                                                    | 仓库                                                                                            | 插件描述                                     |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [时钟时间](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **LobeHub** on **2023-11-01**</sup> | [lobehub/chat-plugin-clock-time](https://github.com/lobehub/chat-plugin-clock-time)             | 显示一个时钟来展示当前时间<br/>`时钟` `时间` |
| [网站爬虫](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **LobeHub** on **2023-08-17**</sup> | [lobehub/chat-plugin-web-crawler](https://github.com/lobehub/chat-plugin-web-crawler)           | 从网页链接中提取内容<br/>`网页` `内容爬取器` |
| [搜索引擎](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **LobeHub** on **2023-08-15**</sup> | [lobehub/chat-plugin-search-engine](https://github.com/lobehub/chat-plugin-search-engine)       | 查询搜索引擎以获取信息<br/>`网络` `搜索`     |
| [实时天气](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **LobeHub** on **2023-08-12**</sup> | [lobehub/chat-plugin-realtime-weather](https://github.com/lobehub/chat-plugin-realtime-weather) | 获取实时天气信息<br/>`天气` `实时`           |

> 📊 Total plugins: [<kbd>**4**</kbd>](https://github.com/lobehub/lobe-chat-plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用 GitHub Codespaces 进行在线开发：

[![][codespaces-shield]][codespaces-link]

或者使用以下命令进行本地开发：

[![][bun-shield]][bun-link]

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ bun install
$ bun run dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 参与贡献

我们非常欢迎各种形式的贡献。如果你对贡献代码感兴趣，可以查看我们的 GitHub [Issues][github-issues-link] 和 [Projects][github-project-link]，大展身手，向我们展示你的奇思妙想。

[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]

[![][contributors-contrib]][contributors-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 更多工具

- [🤯 Lobe Theme][lobe-theme] : Stable Diffusion WebUI 的现代主题，精致的界面设计，高度可定制的 UI，以及提高效率的功能。
- [🌏 Lobe i18n][lobe-i18n] : Lobe i18n 是一个由 ChatGPT 驱动的 i18n（国际化）翻译过程的自动化工具。它支持自动分割大文件、增量更新，以及为 OpenAI 模型、API 代理和温度提供定制选项的功能。
- [💌 Lobe Commit][lobe-commit] : Lobe Commit 是一个 CLI 工具，它利用 Langchain/ChatGPT 生成基于 Gitmoji 的提交消息。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2023 [LobeHub][profile-link]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[bun-link]: https://bun.sh
[bun-shield]: https://img.shields.io/badge/-speedup%20with%20bun-black?logo=bun&style=for-the-badge
[chat-desktop]: https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/desktop/pagespeed.svg
[chat-desktop-report]: https://lobehub.github.io/lobe-chat/lighthouse/chat/desktop/chat_preview_lobehub_com_chat.html
[chat-mobile]: https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/mobile/pagespeed.svg
[chat-mobile-report]: https://lobehub.github.io/lobe-chat/lighthouse/chat/mobile/chat_preview_lobehub_com_chat.html
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-template]: https://github.com/lobehub/chat-plugin-template
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codespaces-link]: https://codespaces.new/lobehub/lobe-chat
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=lobehub/lobe-chat
[contributors-link]: https://github.com/lobehub/lobe-chat/graphs/contributors
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobe-chat&repository-name=lobe-chat
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square
[fc-link]: https://sspai.com/post/81986
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat.svg?type=large
[github-action-release-link]: https://github.com/lobehub/lobe-chat/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/lobehub/lobe-chat/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/lobe-chat/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobe-chat?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobe-chat/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-chat?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/lobehub/lobe-chat/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobe-chat?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/lobe-chat/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/lobehub/lobe-chat?color=white&labelColor=black&style=flat-square
[github-project-link]: https://github.com/lobehub/lobe-chat/projects
[github-release-link]: https://github.com/lobehub/lobe-chat/releases
[github-release-shield]: https://img.shields.io/github/v/release/lobehub/lobe-chat?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobe-chat/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobe-chat?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobe-chat/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobe-chat?color=ffcb47&labelColor=black&style=flat-square
[github-wiki-link]: https://github.com/lobehub/lobe-chat/wiki
[issues-link]: https://img.shields.io/github/issues/lobehub/lobe-chat.svg?style=flat
[lobe-assets-github]: https://github.com/lobehub/lobe-assets
[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[lobe-commit]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit
[lobe-i18n]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-chat/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[share-reddit-link]: https://www.reddit.com/submit?title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://chat-preview.lobehub.com
[vercel-shield]: https://img.shields.io/website?down_message=offline&label=vercel&labelColor=black&logo=vercel&style=flat-square&up_message=online&url=https%3A%2F%2Fchat-preview.lobehub.com
[vercel-shield-badge]: https://img.shields.io/website?down_message=offline&label=try%20lobechat&labelColor=black&logo=vercel&style=for-the-badge&up_message=online&url=https%3A%2F%2Fchat-preview.lobehub.com
