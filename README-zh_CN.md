<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/robot.webp">

<h1>Lobe Chat</h1>

LobeChat 是一个开源的、可扩展的（[Function Calling][fc-url]）高性能聊天机器人框架。<br/> 它支持一键免费部署私人 ChatGPT/LLM 网页应用程序。

[English](./README.md) · **简体中文** · [更新日志](./CHANGELOG.md) · [报告问题][issues-url] · [请求功能][issues-url]

<!-- SHIELD GROUP -->

[![release][release-shield]][release-url]
[![releaseDate][release-date-shield]][release-date-url]
[![ciTest][ci-test-shield]][ci-test-url]
[![ciRelease][ci-release-shield]][ci-release-url] <br/>
[![contributors][contributors-shield]][contributors-url]
[![forks][forks-shield]][forks-url]
[![stargazers][stargazers-shield]][stargazers-url]
[![issues][issues-shield]][issues-url]

[![Deploy with Vercel][deploy-button-image]][deploy-url]

![cover](https://gw.alipayobjects.com/zos/kitchen/3uH7fYVvfO/lobechat.webp)

</div>

<details>
<summary><kbd>目录树</kbd></summary>

#### TOC

- [✨ 功能特性](#-功能特性)

- [🛳 开箱即用](#-开箱即用)

- [⌨️ 本地开发](#️-本地开发)

  - [生态系统](#生态系统)
  - [插件](#插件)

- [🤝 参与贡献](#-参与贡献)

####

<br/>

</details>

## ✨ 功能特性

- [x] 💨 **快速部署**：使用 Vercel 平台，只需点击一键部署按钮，即可在 1 分钟内完成部署，无需复杂的配置过程；
- [x] 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果，支持亮暗色主题，适配移动端。支持 PWA，提供更加接近原生应用的体验；
- [x] 🗣️ **流畅的对话体验**：流式响应带来流畅的对话体验，并且支持完整的 Markdown 渲染，包括代码高亮、LaTex 公式、Mermaid 流程图等；
- [x] 🧩 **支持插件与自定义插件开发**：会话支持插件扩展，用户可以安装和使用各种插件，例如搜索引擎、网页提取等，同时也支持自定义插件的开发，满足自定义需求；
- [x] 🔒 **隐私安全**：所有数据保存在用户浏览器本地，保证用户的隐私安全；
- [x] 🤖 **自定义助手角色**：用户可以根据自己的需求创建、分享和调试个性化的对话助手角色，提供更加灵活和个性化的对话功能；
- [ ] 🏬 **角色市场**（WIP）：提供角色市场，用户可以在市场上选择自己喜欢的对话助手角色，丰富对话的内容和风格；
- [x] 🌐 **自定义域名**：如果用户拥有自己的域名，可以将其绑定到平台上，方便在任何地方快速访问对话助手。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 开箱即用

LobeChat 提供了 Vercel 的 [自托管版本][deploy-url]。这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。如果想自己部署该服务，可以按照以下步骤进行操作：

- 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 点击下方按钮开始部署： Deploy with Vercel，直接使用 Github 账号登录即可，记得在环境变量页填入 API Key 和页面访问密码 CODE；
- 部署完毕后，即可开始使用；
- 绑定自定义域名（可选）：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。

[![使用 Vercel 部署][deploy-button-image]][deploy-url]

> 👉 提示：本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量               | 类型 | 说明                                                      | 示例                                                                  |
| ------------------ | -- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| `OPENAI_API_KEY`   | 必选 | 这是你在 OpenAI 账户页面申请的 API 密钥                              | `sk-xxxxxx...xxxxxx`                                                |
| `OPENAI_PROXY_URL` | 可选 | 如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL | `https://api.chatanywhere.cn`<br/>默认值:<br/>`https://api.openai.com` |
| `ACCESS_CODE`      | 可选 | 添加访问此服务的密码，密码应为 6 位数字或字母                                | `awCT74` 或 `e3@09!`                                                 |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 生态系统

| NPM                                    | 仓库地址                                      | 描述                                                                                                | 版本                                         |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [@lobehub/ui][lobe-ui-url]             | [lobehub/lobe-ui][lobe-ui-github]         | Lobe UI 是一个开源的 UI 组件库，专门用于构建 AIGC 网络应用。                                                           | [![][lobe-ui-shield]][lobe-ui-url]         |
| [@lobehub/lint][lobe-lint-url]         | [lobehub/lobe-lint][lobe-lint-github]     | LobeLint 提供了针对 LobeHub 的 ESlint、Stylelint、Commitlint、Prettier、Remark 和 Semantic Release 的配置。      | [![][lobe-lint-shield]][lobe-lint-url]     |
| [@lobehub/commit-cli][lobe-commit-url] | [lobehub/lobe-commit][lobe-commit-github] | Lobe Commit 是一个利用 Langchain/ChatGPT 生成基于 Gitmoji 的提交信息的 CLI 工具。                                   | [![][lobe-commit-shield]][lobe-commit-url] |
| [@lobehub/i18n-cli][lobe-i18n-url]     | [lobehub/lobe-i18n][lobe-i18n-github]     | Lobe i18n 是一个由 ChatGPT 驱动的自动化工具，用于 i18n（国际化）翻译流程。它支持自动拆分大文件、增量更新以及对 OpenAI 模型、API 代理和温度的自定义选项等功能。 | [![][lobe-i18n-shield]][lobe-i18n-url]     |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 插件体系

插件提供了扩展 LobeChat [Function Calling][fc-url] 能力的方法。可以用于引入新的 Function Calling，甚至是新的消息结果渲染方式。

> 👉 注意：插件系统目前正在进行重大开发。您可以在 <https://github.com/lobehub/lobe-chat/issues/97> 中了解更多信息。

- [@lobehub/lobe-chat-plugins][lobe-chat-plugins]：这是 LobeChat 的插件索引。它从该仓库的 index.json 中获取插件列表并显示给用户。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]：LobeChat 插件 SDK 可帮助您创建出色的 Lobe Chat 插件。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]：LobeChat 插件网关是一个后端服务，作为 LobeChat 插件的网关。我们使用 Vercel 部署此服务。主要的 API POST /api/v1/runner 被部署为 Edge Function。

| 官方插件                                    | 描述                                     |
| --------------------------------------- | -------------------------------------- |
| [🔍 搜索引擎][chat-plugin-search-engine]    | 此插件允许使用 SerpApi 搜索引擎。                  |
| [🌈 实时天气][chat-plugin-realtime-weather] | 此插件通过获取实时天气数据提供实用的天气信息，并可以根据用户的位置自动更新。 |
| [🕸 网站爬虫][chat-plugin-web-crawler]      | 此插件自动爬取指定 URL 网页的主要内容，并将其用作上下文输入。      |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用 Gitpod 进行在线开发：

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-url]

或者使用以下命令进行本地开发：

```bash
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 参与贡献

<!-- CONTRIBUTION GROUP -->

> 📊 Total: <kbd>**4**</kbd>

<a href="https://github.com/arvinxx" title="arvinxx">
  <img src="https://avatars.githubusercontent.com/u/28616219?v=4" width="50" />
</a>
<a href="https://github.com/canisminor1990" title="canisminor1990">
  <img src="https://avatars.githubusercontent.com/u/17870709?v=4" width="50" />
</a>
<a href="https://github.com/apps/dependabot" title="dependabot[bot]">
  <img src="https://avatars.githubusercontent.com/in/29110?v=4" width="50" />
</a>
<a href="https://github.com/actions-user" title="actions-user">
  <img src="https://avatars.githubusercontent.com/u/65916846?v=4" width="50" />
</a>

<!-- CONTRIBUTION END -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [LobeHub][profile-url]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[official-url]: https://lobe-chat.vercel.app
[fc-url]: https://sspai.com/post/81986
[profile-url]: https://github.com/lobehub
[issues-url]: https://github.com/lobehub/lobe-chat/issues/new/choose
[gitpod-url]: https://gitpod.io/#https://github.com/lobehub/lobe-chat

<!-- SHIELD LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

<!-- release -->

[release-shield]: https://img.shields.io/npm/v/@lobehub/chat?label=%F0%9F%A4%AF%20Chat
[release-url]: https://www.npmjs.com/package/@lobehub/chat

<!-- releaseDate -->

[release-date-shield]: https://img.shields.io/github/release-date/lobehub/lobe-chat?style=flat
[release-date-url]: https://github.com/lobehub/lobe-chat/releases

<!-- ciTest -->

[ci-test-shield]: https://github.com/lobehub/lobe-chat/workflows/Test%20CI/badge.svg
[ci-test-url]: https://github.com/lobehub/lobe-chat/actions/workflows/test.yml

<!-- ciRelease -->

[ci-release-shield]: https://github.com/lobehub/lobe-chat/workflows/Release%20CI/badge.svg
[ci-release-url]: https://github.com/lobehub/lobe-chat/actions?query=workflow%3ARelease%20CI

<!-- contributors -->

[contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobe-chat.svg?style=flat
[contributors-url]: https://github.com/lobehub/lobe-chat/graphs/contributors

<!-- forks -->

[forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-chat.svg?style=flat
[forks-url]: https://github.com/lobehub/lobe-chat/network/members

<!-- stargazers -->

[stargazers-shield]: https://img.shields.io/github/stars/lobehub/lobe-chat.svg?style=flat
[stargazers-url]: https://github.com/lobehub/lobe-chat/stargazers

<!-- issues -->

[issues-shield]: https://img.shields.io/github/issues/lobehub/lobe-chat.svg?style=flat
[issues-url]: https://img.shields.io/github/issues/lobehub/lobe-chat.svg?style=flat

<!-- deploy -->

[deploy-button-image]: https://vercel.com/button
[deploy-url]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.%20%20&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobe-chat&repository-name=lobe-chat

<!-- @lobehub/ui -->

[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?label=%F0%9F%A4%AF%20NPM
[lobe-ui-url]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-github]: https://github.com/lobehub/lobe-ui

<!-- @lobehub/lint -->

[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?label=%F0%9F%A4%AF%20NPM
[lobe-lint-url]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-github]: https://github.com/lobehub/lobe-lint

<!-- @lobehub/commit-cli -->

[lobe-commit-shield]: https://img.shields.io/npm/v/@lobehub/commit-cli?label=%F0%9F%A4%AF%20NPM
[lobe-commit-url]: https://www.npmjs.com/package/@lobehub/commit-cli
[lobe-commit-github]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit

<!-- @lobehub/i18n-cli -->

[lobe-i18n-shield]: https://img.shields.io/npm/v/@lobehub/i18n-cli?label=%F0%9F%A4%AF%20NPM
[lobe-i18n-url]: https://www.npmjs.com/package/@lobehub/i18n-cli
[lobe-i18n-github]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n

<!-- plugins -->

[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[chat-plugin-search-engine]: https://github.com/lobehub/chat-plugin-search-engine
[chat-plugin-realtime-weather]: https://github.com/lobehub/chat-plugin-realtime-weather
[chat-plugin-web-crawler]: https://github.com/lobehub/chat-plugin-web-crawler
