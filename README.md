<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/robot.webp">

<h1>Lobe Chat</h1>

LobeChat is a open-source, extensible ([Function Calling](https://sspai.com/post/81986)), high-performance chatbot framework. <br/> It supports one-click free deployment of your private ChatGPT/LLM web application.

**English** · [简体中文](./README-zh_CN.md) · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [✨ Features](#-features)
- [🛳 Self Hosting](#-self-hosting)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)

####

<br/>

</details>

## ✨ Features

- [x] 💨 **Quick Deployment**: Using the Vercel platform, you can deploy with just one click and complete the process within 1 minute, without any complex configuration;
- [x] 💎 **Exquisite UI Design**: With a carefully designed interface, it offers an elegant appearance and smooth interaction. It supports light and dark themes and is mobile-friendly. PWA support provides a more native-like experience;
- [x] 🗣️ **Smooth Conversation Experience**: Fluid responses ensure a smooth conversation experience. It fully supports Markdown rendering, including code highlighting, LaTex formulas, Mermaid flowcharts, and more;
- [x] 🧩 **Plugin Support & Custom Plugin Development**: Conversations are extendable with plugins. Users can install and use various plugins, such as search engines, web extraction, etc. It also supports the development of custom plugins to meet custom needs;
- [x] 🔒 **Privacy Protection**: All data is stored locally in the user's browser, ensuring user privacy;
- [x] 🤖 **Customizable Assistant Roles**: Users can create, share, and debug personalized dialogue assistant roles according to their needs, providing more flexible and personalized dialogue functions;
- [ ] 🏬 **Role Market** (WIP): A Role Market is provided where users can select their preferred dialogue assistant roles, enriching the content and style of the dialogue;
- [x] 🌐 **Custom Domain**: If users have their own domain, they can bind it to the platform for quick access to the dialogue assistant from anywhere.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 Self Hosting

LobeChat provides a [self-hosted version][deploy-url] with Vercel. This allows you to build your own chatbot within a few minutes, without any prior knowledge. If you want to deploy this service yourself, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Deploy with Vercel. Log in directly with your Github account and remember to fill in the API Key and access code CODE on the environment variable page;
- After deployment, you can start using it;
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas, binding a custom domain can connect directly.

[![Deploy with Vercel][deploy-button-image]][deploy-url]

> 👉 Note: This project provides some additional configuration items, set with environment variables:

| Environment Variable | Required | Description                                                                                                                                   | Example                                                                             |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                      | `sk-xxxxxx...xxxxxx`                                                                |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL | `https://api.chatanywhere.cn`<br/>The default value is<br/>`https://api.openai.com` |
| `ACCESS_CODE`        | No       | Add a password to access this service, the password should be a 6-digit number or letter                                                      | `awCT74` or `e3@09!`                                                                |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Gitpod for online development:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-url]

Or clone it for local development:

```bash
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev
```

### Ecosystem

| NPM                                    | Repository                                | Description                                                                                                                                                                                                                                                                    | Version                                    |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [@lobehub/ui][lobe-ui-url]             | [lobehub/lobe-ui][lobe-ui-github]         | Lobe UI is an open-source UI component library dedicated to building AIGC web applications.                                                                                                                                                                                    | [![][lobe-ui-shield]][lobe-ui-url]         |
| [@lobehub/lint][lobe-lint-url]         | [lobehub/lobe-lint][lobe-lint-github]     | LobeLint provides configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for LobeHub.                                                                                                                                                        | [![][lobe-lint-shield]][lobe-lint-url]     |
| [@lobehub/commit-cli][lobe-commit-url] | [lobehub/lobe-commit][lobe-commit-github] | Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.                                                                                                                                                                          | [![][lobe-commit-shield]][lobe-commit-url] |
| [@lobehub/i18n-cli][lobe-i18n-url]     | [lobehub/lobe-i18n][lobe-i18n-github]     | Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature. | [![][lobe-i18n-shield]][lobe-i18n-url]     |

### Plugins

Plugins provide a means to extend the [Function Calling][fc-url] capabilities of LobeChat. They can be used to introduce new function calls, and even new ways to render message results.

> 👉 Note: The plugin system is currently undergoing significant development. You can expect to see it in <https://github.com/lobehub/lobe-chat/issues/97>.

- [@lobehub/lobe-chat-plugins][lobe-chat-plugins]: This is the plugin index for LobeChat. It accesses index.json from this repository to display a list of available plugins for LobeChat to the user.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: The LobeChat Plugin SDK assists you in creating exceptional chat plugins for Lobe Chat.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: The LobeChat Plugins Gateway is a backend service that serves as a gateway for LobeChat plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

| Official Plugin                                     | Description                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [🔍 Search Engine][chat-plugin-search-engine]       | This plugin allows for the use of the SerpApi search engine.                                                                                      |
| [🌈 Realtime Weather][chat-plugin-realtime-weather] | This plugin provides practical weather information by obtaining real-time weather data and can automatically update based on the user's location. |
| [🕸 Website Crawler][chat-plugin-web-crawler]       | This plugin automatically crawls the main content of a specified URL webpage and uses it as context input.                                        |


<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

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
