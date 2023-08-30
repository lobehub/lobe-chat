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

- [🛳 Self Hosting](#-self-hosting)

  - [Deploy to Vercel](#deploy-to-vercel)

- [⌨️ Local Development](#️-local-development)

- [🤝 Contributing](#-contributing)

####

</details>

## 🛳 开箱即用

LobeChat 提供了 [官方版本][official-url] 和 Vercel 的 [自托管版本][deploy-url]。这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。如果想自己部署该服务，可以按照以下步骤进行操作。

### 部署到 Vercel

点击下方按钮部署的私有插件网关。

[![使用 Vercel 部署][deploy-button-image]][deploy-url]

如果想进行一些自定义设置，可以添加环境变量：

| 环境变量              | 描述                                                                | 示例                          |
| -------------------- | ------------------------------------------------------------------ | ----------------------------- |
| `OPENAI_PROXY_URL`   | OpenAI API代理URL，例如：`https://api.chatanywhere.cn`               | `https://api.chatanywhere.cn` |
| `ACCESS_CODE`        | 添加访问此服务的密码，密码应为6位数字或字母                                | `awCT74` \| `e3@09!`          |


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
