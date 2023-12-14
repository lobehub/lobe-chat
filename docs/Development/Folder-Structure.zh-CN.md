# 目录架构

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

## app

在 `app` 文件夹中，我们将每个路由页面按照 app router 的 [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) 进行组织，以此来分别处理桌面端和移动端的代码实现。以 `welcome` 页面的文件结构为例：

```bash
welcome
├── (desktop)               # 桌面端实现
│   ├── features            # 桌面端特有的功能
│   ├── index.tsx           # 桌面端的主入口文件
│   └── layout.desktop.tsx  # 桌面端的布局组件
├── (mobile)                # 移动端实现
│   ├── features            # 移动端特有的功能
│   ├── index.tsx           # 移动端的主入口文件
│   └── layout.mobile.tsx   # 移动端的布局组件
├── features                # 此文件夹包含双端共享的特性代码，如 Banner 组件
│   └── Banner
└── page.tsx                # 此为页面的主入口文件，用于根据设备类型选择加载桌面端或移动端的代码
```

通过这种方式，我们可以清晰地区分和管理桌面端和移动端的代码，同时也能方便地复用在两种设备上都需要的代码，从而提高开发效率并保持代码的整洁和可维护性。
