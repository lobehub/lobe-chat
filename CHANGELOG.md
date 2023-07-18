<a name="readme-top"></a>

# Changelog

## Version 1.0.0

<sup>Released on **2023-07-18**</sup>

#### ♻ Code Refactoring

- **misc**: GetStaticPaths, Simplify index page component and remove internationalization configuration, Update configurations, remove unused files, and adjust components and selectors.

#### ✨ Features

- **i18n**: Add i18next and lobe-i18n internationalization configuration files and update dependencies.
- **issue-template**: Add templates for Bug Report, Feature Request, and Help Wanted.
- **wip**: Add setting page.
- **misc**: Add and modify settings page, update Header styles, and improve useTranslation hook, Add fallback language, modify React suspense settings, enable strict mode, and update dependencies, Add new import statement and update module.exports in .i18nrc.js, add openai server api, agent profile, ChatList 支持操作行为, Introduce new features and styles for chat application, Update localization paths, add new files, settings, descriptions, generate TOC, modify imports/exports, define types, 优化 Agent 实现，支持自动补全, 优化设置页, 增加不同模型, 完成自动添加 meta 的能力, 实现优化重发请求功能, 支持模型设置.

#### 🐛 Bug Fixes

- **vercel**: Fix deploy.
- **misc**: Fix ssr, Fix ssr, Fix ssr, Fix ssr, Fix ssr, Fix ssr, Fix ssr, Fix title, lock zustand, lock zustand, 使用 client 加载 i18n 以解决 nextjs 集成问题, 修正 SessionList 的删除逻辑, 修正发送的请求不包含 systemRole 的问题, 修正水合导致 list 丢失的问题.

<br/>

<details>
<summary><kbd>Improvements and Fixes</kbd></summary>

#### Code refactoring

- **misc**: GetStaticPaths ([59dcbe9](https://github.com/lobehub/lobe-chat/commit/59dcbe9))
- **misc**: Simplify index page component and remove internationalization configuration ([47c3f0e](https://github.com/lobehub/lobe-chat/commit/47c3f0e))
- **misc**: Update configurations, remove unused files, and adjust components and selectors ([23524b2](https://github.com/lobehub/lobe-chat/commit/23524b2))

#### What's improved

- **i18n**: Add i18next and lobe-i18n internationalization configuration files and update dependencies ([53cd87c](https://github.com/lobehub/lobe-chat/commit/53cd87c))
- **issue-template**: Add templates for Bug Report, Feature Request, and Help Wanted ([6c01ce7](https://github.com/lobehub/lobe-chat/commit/6c01ce7))
- **wip**: Add setting page ([88d837f](https://github.com/lobehub/lobe-chat/commit/88d837f))
- **misc**: Add and modify settings page, update Header styles, and improve useTranslation hook ([4a1995f](https://github.com/lobehub/lobe-chat/commit/4a1995f))
- **misc**: Add fallback language, modify React suspense settings, enable strict mode, and update dependencies ([8ecd401](https://github.com/lobehub/lobe-chat/commit/8ecd401))
- **misc**: Add new import statement and update module.exports in .i18nrc.js ([32e0255](https://github.com/lobehub/lobe-chat/commit/32e0255))
- **misc**: Add openai server api ([59d381e](https://github.com/lobehub/lobe-chat/commit/59d381e))
- **misc**: Agent profile ([e9560a8](https://github.com/lobehub/lobe-chat/commit/e9560a8))
- **misc**: ChatList 支持操作行为 ([30da537](https://github.com/lobehub/lobe-chat/commit/30da537))
- **misc**: Introduce new features and styles for chat application ([cef01c0](https://github.com/lobehub/lobe-chat/commit/cef01c0))
- **misc**: Update localization paths, add new files, settings, descriptions, generate TOC, modify imports/exports, define types, closes [#11](https://github.com/lobehub/lobe-chat/issues/11) ([579a0bf](https://github.com/lobehub/lobe-chat/commit/579a0bf))
- **misc**: 优化 Agent 实现，支持自动补全 ([455a1f7](https://github.com/lobehub/lobe-chat/commit/455a1f7))
- **misc**: 优化设置页 ([47b316c](https://github.com/lobehub/lobe-chat/commit/47b316c))
- **misc**: 增加不同模型 ([d95027d](https://github.com/lobehub/lobe-chat/commit/d95027d))
- **misc**: 完成自动添加 meta 的能力 ([a82f35d](https://github.com/lobehub/lobe-chat/commit/a82f35d))
- **misc**: 实现优化重发请求功能 ([d7195d9](https://github.com/lobehub/lobe-chat/commit/d7195d9))
- **misc**: 支持模型设置 ([170567a](https://github.com/lobehub/lobe-chat/commit/170567a))

#### What's fixed

- **vercel**: Fix deploy ([626c4ce](https://github.com/lobehub/lobe-chat/commit/626c4ce))
- **misc**: Fix ssr ([be6281d](https://github.com/lobehub/lobe-chat/commit/be6281d))
- **misc**: Fix ssr ([9a13ec0](https://github.com/lobehub/lobe-chat/commit/9a13ec0))
- **misc**: Fix ssr ([a834e76](https://github.com/lobehub/lobe-chat/commit/a834e76))
- **misc**: Fix ssr ([a51cc0c](https://github.com/lobehub/lobe-chat/commit/a51cc0c))
- **misc**: Fix ssr ([4da2829](https://github.com/lobehub/lobe-chat/commit/4da2829))
- **misc**: Fix ssr ([c733936](https://github.com/lobehub/lobe-chat/commit/c733936))
- **misc**: Fix ssr ([40b9e93](https://github.com/lobehub/lobe-chat/commit/40b9e93))
- **misc**: Fix title ([0b7baf4](https://github.com/lobehub/lobe-chat/commit/0b7baf4))
- **misc**: Lock zustand ([85e5007](https://github.com/lobehub/lobe-chat/commit/85e5007))
- **misc**: Lock zustand ([3198753](https://github.com/lobehub/lobe-chat/commit/3198753))
- **misc**: 使用 client 加载 i18n 以解决 nextjs 集成问题, closes [#10](https://github.com/lobehub/lobe-chat/issues/10) ([390ebfe](https://github.com/lobehub/lobe-chat/commit/390ebfe))
- **misc**: 修正 SessionList 的删除逻辑 ([d37bb47](https://github.com/lobehub/lobe-chat/commit/d37bb47))
- **misc**: 修正发送的请求不包含 systemRole 的问题 ([a3653a4](https://github.com/lobehub/lobe-chat/commit/a3653a4))
- **misc**: 修正水合导致 list 丢失的问题 ([a3d9724](https://github.com/lobehub/lobe-chat/commit/a3d9724))

</details>

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>
