<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/robot.webp">

<h1>Lobe Chat</h1>

LobeChat is a open-source, extensible ([Function Calling][fc-link]), high-performance chatbot framework. <br/> It supports one-click free deployment of your private ChatGPT/LLM web application.

**English** · [简体中文](./README.zh-CN.md) · [Changelog](./CHANGELOG.md) · [Wiki][github-wiki-link] · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

[![Deploy with Vercel][deploy-button-image]][deploy-link]

![](https://gw.alipayobjects.com/zos/kitchen/RKnWrrfuMl/welcome.webp)

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [👋🏻 Getting Started & Join Our Community](#-getting-started--join-our-community)

- [✨ Features](#-features)

- [📸 Snapshot](#-snapshot)

- [🛳 Self Hosting](#-self-hosting)

  - [Keep Updated](#keep-updated)

- [📦 Ecosystem](#-ecosystem)

- [🧩 Plugins](#-plugins)

- [⌨️ Local Development](#️-local-development)

- [🤝 Contributing](#-contributing)

- [🔗 More Products](#-more-products)

####

<br/>

</details>

## 👋🏻 Getting Started & Join Our Community

Please be aware that LobeChat is currently under active development，feedback is welcome for any [issues][issues-link] encountered.

| [![][vercel-shield-badge]][vercel-link]   | No installation or registration necessary! Visit our website to experience it firsthand.                           |
| :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | Join our Discord community! This is where you can connect with developers and other enthusiastic users of LobeHub. |

> **Important**\
> **Star Us**，You will receive all releases notifications from GitHub without any delay \~ ⭐️

![](https://gw.alipayobjects.com/zos/kitchen/0hcO8QiU9c/star.webp)

<details><summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ Features

- [x] 💨 **Quick Deployment**: Using the Vercel platform, you can deploy with just one click and complete the process within 1 minute, without any complex configuration;
- [x] 💎 **Exquisite UI Design**: With a carefully designed interface, it offers an elegant appearance and smooth interaction. It supports light and dark themes and is mobile-friendly. PWA support provides a more native-like experience;
- [x] 🗣️ **Smooth Conversation Experience**: Fluid responses ensure a smooth conversation experience. It fully supports Markdown rendering, including code highlighting, LaTex formulas, Mermaid flowcharts, and more;
- [x] 🧩 **Plugin Support & Custom Plugin Development**: Conversations are extendable with plugins. Users can install and use various plugins, such as search engines, web extraction, etc. It also supports the development of custom plugins to meet custom needs;
- [x] 🔒 **Privacy Protection**: All data is stored locally in the user's browser, ensuring user privacy;
- [x] 🤖 **Customizable Assistant Roles**: Users can create, share, and debug personalized dialogue assistant roles according to their needs, providing more flexible and personalized dialogue functions;
- [x] 🌐 **Custom Domain**: If users have their own domain, they can bind it to the platform for quick access to the dialogue assistant from anywhere.
- [x] 🏬 **Role Market**: A Role Market is provided where users can select their preferred dialogue assistant roles, enriching the content and style of the dialogue;

> **Note**\
> You can find our upcoming [Roadmap][github-project-link] plans in the Projects section.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📸 Snapshot

![](https://gw.alipayobjects.com/zos/kitchen/69x6bllkX3/pwa.webp)

**Progress Web App**

Utilize the Progressive Web Application ([PWA](https://support.google.com/chrome/answer/9658361)) technology to achieve a seamless LobeChat experience on your computer or mobile device.

> **Note**\
> If you are unfamiliar with the installation process of PWA, you can add LobeChat as your desktop application (also applicable to mobile devices) by following these steps:
>
> - Launch the Chrome or Edge browser on your computer
> - Visit the LobeChat webpage
> - In the upper right corner of the address bar, click on the <kbd>Install</kbd> icon
> - Follow the instructions on the screen to complete the PWA installation

![](https://gw.alipayobjects.com/zos/kitchen/pvus1lo%26Z7/darkmode.webp)

**Theme Mode Selection**

LobeChat provides two theme modes, light and dark, along with color customization options. By default, the theme follows the system settings, but you can also manually switch in the settings.

![](https://gw.alipayobjects.com/zos/kitchen/R441AuFS4W/mobile.webp)

**Mobile Device Adaptation**

We have designed a series of adaptations for mobile devices to enhance user experience. We are currently iterating the version for mobile experience, and we welcome any suggestions or ideas you might have.

> 🚧 Additional snapshots and demonstrations are being progressively added...

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 Self Hosting

LobeChat provides a [self-hosted version][deploy-link] with Vercel. This allows you to build your own chatbot within a few minutes, without any prior knowledge. If you want to deploy this service yourself, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Deploy with Vercel. Log in directly with your Github account and remember to fill in the API Key and access code CODE on the environment variable page;
- After deployment, you can start using it;
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas, binding a custom domain can connect directly.

[![Deploy with Vercel][deploy-button-image]][deploy-link]

> **Note**\
> This project provides some additional configuration items, set with environment variables:

| Environment Variable | Required | Description                                                                                                                                   | Example                                                                             |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                      | `sk-xxxxxx...xxxxxx`                                                                |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL | `https://api.chatanywhere.cn`<br/>The default value is<br/>`https://api.openai.com` |
| `ACCESS_CODE`        | No       | Add a password to access this service, the password should be a 6-digit number or letter                                                      | `awCT74` or `e3@09!`                                                                |

### Keep Updated

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available". This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to accurately detect updates. We suggest you redeploy using the following steps, [📘 Maintaining Updates with LobeChat Self-Deployment](https://github.com/lobehub/lobe-chat/wiki/Upstream-Sync).

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Ecosystem

| NPM                             | Repository                            | Description                                                                                                             | Version                                 |
| ------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [@lobehub/ui][lobe-ui-link]     | [lobehub/lobe-ui][lobe-ui-github]     | Lobe UI is an open-source UI component library dedicated to building AIGC web applications.                             | [![][lobe-ui-shield]][lobe-ui-link]     |
| [@lobehub/lint][lobe-lint-link] | [lobehub/lobe-lint][lobe-lint-github] | LobeLint provides configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for LobeHub. | [![][lobe-lint-shield]][lobe-lint-link] |
| @lobehub/assets                 | [lobehub/assets][lobe-assets-github]  | Logo assets, favicons, webfonts for LobeHub.                                                                            |                                         |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 Plugins

Plugins provide a means to extend the [Function Calling][fc-link] capabilities of LobeChat. They can be used to introduce new function calls, and even new ways to render message results. If you are interested in plugin development, please refer to our [📘 Plugin Development Guide](https://github.com/lobehub/lobe-chat/wiki/Plugin-Development) in the Wiki.

> **Note**\
> The plugin system is currently undergoing major development. You can learn more in the following issues:
>
> - [x] [**Plugin Phase 1**](https://github.com/lobehub/lobe-chat/issues/73): Implement separation of the plugin from the main body, split the plugin into an independent repository for maintenance, and realize dynamic loading of the plugin.
> - [x] [**Plugin Phase 2**](https://github.com/lobehub/lobe-chat/issues/97): The security and stability of the plugin's use, more accurately presenting abnormal states, the maintainability of the plugin architecture and developer-friendly.
> - [ ] [**Plugin Phase 3**](https://github.com/lobehub/lobe-chat/issues/149): Higher-level and more comprehensive customization capabilities, support for plugin authentication and examples.

- [@lobehub/lobe-chat-plugins][lobe-chat-plugins]: This is the plugin index for LobeChat. It accesses index.json from this repository to display a list of available plugins for LobeChat to the user.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: The LobeChat Plugin SDK assists you in creating exceptional chat plugins for Lobe Chat.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: The LobeChat Plugins Gateway is a backend service that serves as a gateway for LobeChat plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

| Official Plugin                                 | Description                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [SearchEngine][chat-plugin-search-engine]       | This plugin allows for the use of the SerpApi search engine.                                                                                      |
| [RealtimeWeather][chat-plugin-realtime-weather] | This plugin provides practical weather information by obtaining real-time weather data and can automatically update based on the user's location. |
| [WebsiteCrawler][chat-plugin-web-crawler]       | This plugin automatically crawls the main content of a specified URL webpage and uses it as context input.                                        |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development:

[![][bun-shield]][bun-link]

```bash
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ bun install
$ bun dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] and [Projects][github-project-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]

[![][contributors-contrib]][contributors-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 More Products

- **[🤯 Lobe Theme][lobe-theme] :** The modern theme for stable diffusion webui, exquisite interface design, highly customizable UI, and efficiency boosting features.
- **[🌏 Lobe i18n][lobe-i18n] :** Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.
- **[💌 Lobe Commit][lobe-commit] :** Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.

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
[chat-plugin-realtime-weather]: https://github.com/lobehub/chat-plugin-realtime-weather
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-search-engine]: https://github.com/lobehub/chat-plugin-search-engine
[chat-plugin-web-crawler]: https://github.com/lobehub/chat-plugin-web-crawler
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codespaces-link]: https://codespaces.new/lobehub/lobe-chat
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=lobehub/lobe-chat
[contributors-link]: https://github.com/lobehub/lobe-chat/graphs/contributors
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-link=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat&env=OPENAI_API_KEY&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.%20%20&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobe-chat&repository-name=lobe-chat
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[fc-link]: https://sspai.com/post/81986
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat.svg?type=large
[github-action-release-link]: https://github.com/actions/workflows/lobehub/lobe-chat/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/release.yml?labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/actions/workflows/lobehub/lobe-chat/test.yml
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
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://chat-preview.lobehub.com
[vercel-shield]: https://img.shields.io/website?down_message=offline&label=vercel&labelColor=black&logo=vercel&style=flat-square&up_message=online&url=https%3A%2F%2Fchat-preview.lobehub.com
[vercel-shield-badge]: https://img.shields.io/website?down_message=offline&label=try%20lobechat&labelColor=black&logo=vercel&style=for-the-badge&up_message=online&url=https%3A%2F%2Fchat-preview.lobehub.com
