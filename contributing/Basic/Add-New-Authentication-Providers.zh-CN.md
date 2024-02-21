# 新身份验证方式开发指南

LobeChat 使用 [Auth.js v5](https://authjs.dev/) 作为外部身份验证服务。Auth.js 是一个开源的身份验证库，它提供了一种简单的方式来实现身份验证和授权功能。本文档将介绍如何使用 Auth.js 来实现新的身份验证方式。

### TOC

- [添加新的身份验证提供者](#添加新的身份验证提供者)
  - [准备工作：查阅官方的提供者列表](#准备工作查阅官方的提供者列表)
  - [步骤 1: 新增关键代码](#步骤-1-新增关键代码)
  - [步骤 2: 更新服务端配置代码](#步骤-2-更新服务端配置代码)
  - [步骤 3: 修改前端页面](#步骤-3-修改前端页面)
  - [步骤 4: 配置环境变量](#步骤-4-配置环境变量)

## 添加新的身份验证提供者

为了在 LobeChat 中添加新的身份验证提供者（例如添加 Okta)，你需要完成以下步骤：

### 准备工作：查阅官方的提供者列表

首先，你需要查阅 [Auth.js 提供者列表](https://authjs.dev/reference/core/providers) 来了解是否你的提供者已经被支持。如果你的提供者已经被支持，你可以直接使用 Auth.js 提供的 SDK 来实现身份验证功能。

接下来我会以 [Okta](https://authjs.dev/reference/core/providers/okta) 为例来介绍如何添加新的身份验证提供者

### 步骤 1: 新增关键代码

打开 `src/app/api/auth/next-auth.ts` 文件，引入 `next-auth/providers/okta`

```ts
import { NextAuth } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import Okta from 'next-auth/providers/okta';

// 引入 Okta 提供者
```

新增预定义的服务端配置

```ts
// 导入服务器配置
const { OKTA_CLIENT_ID, OKTA_CLIENT_SECRET, OKTA_ISSUER } = getServerConfig();

const nextAuth = NextAuth({
  providers: [
    // ... 其他提供者

    Okta({
      clientId: OKTA_CLIENT_ID,
      clientSecret: OKTA_CLIENT_SECRET,
      issuer: OKTA_ISSUER,
    }),
  ],
});
```

### 步骤 2: 更新服务端配置代码

打开 `src/config/server/app.ts` 文件，在 `getAppConfig` 函数中新增 Okta 相关的环境变量

```ts
export const getAppConfig = () => {
  // ... 其他代码

  return {
    // ... 其他环境变量

    OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
    OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
    OKTA_ISSUER: process.env.OKTA_ISSUER || '',
  };
};
```

### 步骤 3: 修改前端页面

修改在 `src/features/Conversation/Error/OAuthForm.tsx` 及 `src/app/settings/common/Common.tsx` 中的 `signIn` 函数参数

默认为 `auth0`，你可以将其修改为 `okta` 以切换到 Okta 提供者，或删除该参数以支持所有已添加的身份验证服务

该值为 Auth.js 提供者 的 id，你可以阅读相应的 `next-auth/providers` 模块源码以读取默认 ID

### 步骤 4: 配置环境变量

在部署时新增 Okta 相关的环境变量 `OKTA_CLIENT_ID`、`OKTA_CLIENT_SECRET`、`OKTA_ISSUER`，并填入相应的值，即可使用
