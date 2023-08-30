<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/robot.webp">

<h1>Lobe Chat</h1>

LobeChat 是一个开源的、可扩展的（[Function Calling](https://sspai.com/post/81986)）高性能聊天机器人框架。<br/> 它支持一键免费部署私人 ChatGPT/LLM 网页应用程序。

[English](./README.md) · **简体中文** · [更新日志](./CHANGELOG.md) · [报告问题][issues-url] · [请求功能][issues-url]

<!-- SHIELD GROUP -->

[![release][release-shield]][release-url]
[![releaseDate][release-date-shield]][release-date-url]
[![ciTest][ci-test-shield]][ci-test-url]
[![ciRelease][ci-release-shield]][ci-release-url] <br/>
[![contributors][contributors-shield]][contributors-url]
[![forks][forks-shield]][forks-url]
[![stargazers][stargazers-shield]][stargazers-url]
[![issues][issues-shield]][issues-url] <br/>

[![Deploy with Vercel][deploy-button-image]][deploy-url]

![cover](https://gw.alipayobjects.com/zos/kitchen/ES6q6C5kVM/lobechat.webp)

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [😎 开始上手](#-开始上手)

- [🚀 产品核心功能](#-产品核心功能)

- [🛳 开箱即用](#-开箱即用)

  - [部署到 Vercel](#部署到-vercel)

- [⌨️ 本地开发](#️-本地开发)

- [🤝 参与贡献](#-参与贡献)

####

</details>

## 😎 开始上手

- 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 点击右侧按钮开始部署： Deploy with Vercel，直接使用 Github 账号登录即可，记得在环境变量页填入 API Key 和页面访问密码 CODE；
- 部署完毕后，即可开始使用；
- （可选）绑定自定义域名：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。

## 🚀 产品核心功能

- 💨 **快速部署**：使用 Vercel 平台，只需点击一键部署按钮，即可在 1 分钟内完成部署，无需复杂的配置过程；
- 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果，支持亮暗色主题，适配移动端。支持 PWA，提供更加接近原生应用的体验；
- 🗣️ **流畅的对话体验**：流式响应带来流畅的对话体验，并且支持完整的 Markdown 渲染，包括代码高亮、LaTex 公式、Mermaid 流程图等；
- 🧩 **支持插件与自定义插件开发**：会话支持插件扩展，用户可以安装和使用各种插件，例如搜索引擎、网页提取等，同时也支持自定义插件的开发，满足自定义需求；
- 🔒 **隐私安全**：所有数据保存在用户浏览器本地，保证用户的隐私安全；
- 🤖 **自定义助手角色**：用户可以根据自己的需求创建、分享和调试个性化的对话助手角色，提供更加灵活和个性化的对话功能；
- 🏬 **角色市场**（WIP）：提供角色市场，用户可以在市场上选择自己喜欢的对话助手角色，丰富对话的内容和风格；
- 🌐 **自定义域名**：如果用户拥有自己的域名，可以将其绑定到平台上，方便在任何地方快速访问对话助手。

## 🛳 开箱即用

LobeChat 提供了 Vercel 的 [自托管版本][deploy-url]。这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。如果想自己部署该服务，可以按照以下步骤进行操作。

### 部署到 Vercel

点击下方按钮部署的私有插件网关。

[![使用 Vercel 部署][deploy-button-image]][deploy-url]

本项目提供了一些额外的配置项，使用环境变量进行设置：

#### `OPENAI_API_KEY` (必选)

这是你在OpenAI账户页面申请的API密钥。

示例: `sk-2EnxIQkLqLSCat0bWKHdT3BlbcFJhoCfEoSkwuBzUeisGCku`

#### `ACCESS_CODE` (可选)

这是访问此服务的密码，密码应为6位数字或字母。

示例: `awCT74` 或 `e3@09!`

#### `OPENAI_PROXY_URL` (可选)

> 默认值: `https://api.openai.com`

如果你手动配置了OpenAI接口代理，可以使用此配置项来覆盖默认的OpenAI API请求基础URL。

示例: `https://api.chatanywhere.cn`

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用Gitpod进行在线开发：

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
