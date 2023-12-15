# 技术开发上手指南

欢迎来到 LobeChat 技术开发上手指南。LobeChat 是一款基于 Next.js 框架构建的 AI 会话应用，它汇集了一系列的技术栈，以实现多样化的功能和特性。本指南将详细介绍 LobeChat 的主要技术组成，以及如何在你的开发环境中配置和使用这些技术。

#### TOC

- [基础技术栈](#基础技术栈)
- [文件夹目录架构](#文件夹目录架构)

## 基础技术栈

LobeChat 的核心技术栈如下：

- **框架**：我们选择了 [Next.js](https://nextjs.org/)，这是一款强大的 React 框架，为我们的项目提供了服务端渲染、路由框架、Router Handler 等关键功能。
- **组件库**：我们使用了 [Ant Design (antd)](https://ant.design/) 作为基础组件库，同时引入了 [lobe-ui](https://github.com/lobehub/lobe-ui) 作为我们的业务组件库。
- **状态管理**：我们选用了 [zustand](https://github.com/pmndrs/zustand)，一款轻量级且易于使用的状态管理库。
- **网络请求**：我们采用 [swr](https://swr.vercel.app/)，这是一款用于数据获取的 React Hooks 库。
- **路由**：路由管理我们直接使用 [Next.js](https://nextjs.org/) 自身提供的解决方案。
- **国际化**：我们使用 [i18next](https://www.i18next.com/) 来实现应用的多语言支持。
- **样式**：我们使用 [antd-style](https://github.com/ant-design/antd-style)，这是一款与 Ant Design 配套的 CSS-in-JS 库。
- **单元测试**：我们使用 [vitest](https://github.com/vitest-dev/vitest) 进行单元测试。

## 文件夹目录架构

LobeChat 的文件夹目录架构如下：

```bash
src
├── app        # 应用主要逻辑和状态管理相关的代码
├── components # 可复用的 UI 组件
├── config     # 应用的配置文件，包含客户端环境变量与服务端环境变量
├── const      # 用于定义常量，如 action 类型、路由名等
├── features   # 与业务功能相关的功能模块，如 Agent 设置、插件开发弹窗等
├── hooks      # 全应用复用自定义的工具 Hooks
├── layout     # 应用的布局组件，如导航栏、侧边栏等
├── locales    # 国际化的语言文件
├── services   # 封装的后端服务接口，如 HTTP 请求
├── store      # 用于状态管理的 zustand store
├── types      # TypeScript 的类型定义文件
└── utils      # 通用的工具函数
```

有关目录架构的详细介绍，详见： [文件夹目录架构](Folder-Structure.zh-CN.md)
