# LobeChat 插件开发

#### TOC

- [插件构成](#插件构成)

- [自定义插件流程](#自定义插件流程)

  - [1. 创建并启动插件项目](#1-创建并启动插件项目)
  - [2. 在 LobeChat 角色设置中添加本地插件](#2-在-lobechat-角色设置中添加本地插件)
  - [3. 会话测试插件功能](#3-会话测试插件功能)

- [本地插件开发](#本地插件开发)

  - [manifest](#manifest)
  - [项目结构](#项目结构)
  - [服务端](#服务端)
  - [插件 UI 界面](#插件-ui-界面)

- [插件部署与发布](#插件部署与发布)

## 插件构成

一个 LobeChat 的插件由以下几个部分组成：

1. **插件索引**：用于展示插件的基本信息，包括插件名称、描述、作者、版本、插件描述清单的链接，官方的插件索引地址：[lobe-chat-plugins](https://github.com/lobehub/lobe-chat-plugins)。若想上架插件到官方插件市场，需要[提交 PR](https://github.com/lobehub/lobe-chat-plugins/pulls) 到该仓库；
2. **插件描述清单 (manifest)**：用于描述插件的功能实现，包含了插件的服务端描述、前端展示信息、版本号等。关于 manifest 的详细介绍，详见 [manifest][manifest-docs-url]；
3. **插件服务**：用于实现插件描述清单中所描述的服务端和前端模块，分别如下：
   - **服务端**：需要实现 manifest 中描述的 `api` 部分的接口能力；
   - **前端 UI**（可选）：需要实现 manifest 中描述的 `ui` 部分的界面，该界面将会在插件消息中透出，进而实现比文本更加丰富地信息展示方式。

## 自定义插件流程

插件开发需要将插件集成进 LobeChat 中，因此本部分将会介绍如何在 LobeChat 中添加和使用一个自定义插件。

### 1. 创建并启动插件项目

你需要先在本地创建一个插件项目，可以使用我们准备好的 [lobe-chat-plugin-template][lobe-chat-plugin-template-url] 模板；

```bash
$ git clone https://github.com/lobehub/chat-plugin-template.git
$ cd chat-plugin-template
$ npm i
$ npm run dev
```

当出现 `ready started server on 0.0.0.0:3400, url: http://localhost:3400` 时，说明插件服务已经在本地启动成功。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259526-9ef25272-4312-429b-93bc-a95515727ed3.png)

### 2. 在 LobeChat 角色设置中添加本地插件

接下来进入到 LobeChat 中，创建一个新的助手，并进入它的会话设置页：

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259643-1a9cc34a-76f3-4ccf-928b-129654670efd.png)

点击「插件列表」右侧的「添加」按钮，打开自定义插件添加弹窗：

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259748-2ef6a244-39bb-483c-b359-f156ffcbe1a4.png)

在 「插件描述文件 Url 地址」中填入 `http://localhost:3400/manifest-dev.json` ，这是我们本地启动的插件描述清单地址。

此时，你应该可以看到看到插件的标识符一栏已经被自动识别为 `chat-plugin-template`。接下来你需要填写剩下的表单字段（只有标题必填），然后点击「保存」按钮，即可完成自定义插件添加。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259964-59f4906d-ae2e-4ec0-8b43-db36871d0869.png)

完成添加后，即可在插件列表中看到刚刚添加的插件，如果需要修改插件的配置，可以点击「设置」按钮进行修改。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260093-a0363c74-0b5b-48dd-b103-2db6b4a8262e.png)

### 3. 会话测试插件功能

接来下我们需要测试下这个自定义插件的功能是否正常。

点击「返回」按钮回到会话区，然后向助手发送消息：「我应该穿什么？ 」此时助手将会尝试向你询问，了解你的性别与当前的心情。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260291-f0aa0e7c-0ffb-486c-a834-08e73d49896f.png)

当回答完毕后，助手将会发起插件的调用，根据你的性别、心情，从服务端获取推荐的衣服数据，并推送给你。最后基于这些信息做一轮文本总结。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260461-c22ae797-2809-464b-96fc-d0c020f4807b.png)

当完成这些操作后，你已经了解了添加自定义插件，并在 LobeChat 中使用的基础流程。

## 本地插件开发

在上述流程中，我们已经了解插件的添加和使用的方式，接下来重点介绍自定义插件开发的过程。

### manifest

manifest 聚合了插件功能如何实现的信息。核心的字段为 `api` 与 `ui`，分别描述了插件的服务端接口能力与前端渲染的界面地址。

以我们提供的模板中的 manifest 为例：

```json
{
  "api": [
    {
      "url": "http://localhost:3400/api/clothes",
      "name": "recommendClothes",
      "description": "根据用户的心情，给用户推荐他有的衣服",
      "parameters": {
        "properties": {
          "mood": {
            "description": "用户当前的心情，可选值有：开心（happy）, 难过（sad）,生气 （anger）,害怕（fear）,惊喜（ surprise）,厌恶 （disgust）",
            "enums": ["happy", "sad", "anger", "fear", "surprise", "disgust"],
            "type": "string"
          },
          "gender": {
            "type": "string",
            "enum": ["man", "woman"],
            "description": "对话用户的性别，需要询问用户后才知道这个信息"
          }
        },
        "required": ["mood", "gender"],
        "type": "object"
      }
    }
  ],
  "gateway": "http://localhost:3400/api/gateway",
  "identifier": "chat-plugin-template",
  "ui": {
    "url": "http://localhost:3400",
    "height": 200
  },
  "version": "1"
}
```

在这份 manifest 中，主要包含了以下几个部分：

1. `identifier`：这是插件的唯一标识符，用来区分不同的插件，这个字段需要全局唯一。
2. `api`：这是一个数组，包含了插件所提供的所有 API 接口信息。每个接口都包含了url、name、description和 parameters 字段，均为必填项。其中 `description` 和 `parameters` 两个字段，将会作为 [Function Call](https://sspai.com/post/81986) 的 `functions` 参数发送给 gpt， parameters 需要符合 [JSON Schema](https://json-schema.org/) 规范。 在这个例子中，api 接口名为 `recommendClothes` ，这个接口的功能是根据用户的心情和性别来推荐衣服。接口的参数包括用户的心情和性别，这两个参数都是必填项。
3. `ui`：这个字段包含了插件的用户界面信息，指明了 LobeChat 从哪个地址加载插件的前端界面。由于 LobeChat 插件界面加载是基于 iframe 实现的，因此可以按需指定插件界面的高度、宽度。
4. `gateway`：这个字段指定了 LobeChat 查询 api 接口的网关。LobeChat 默认的插件网关是云端服务，而自定义插件的请求需要发送给本地服务的，因此通过在 manifest 中指定网关，LobeChat 将会直接请求这个地址，进而访问到本地的插件服务，发布到线上的插件可以不用指定该字段。
5. `version`：这是插件的版本号，现阶段暂时没有作用；

在实际开发中，你可以根据自己的需求，修改插件的描述清单，声明自己想要实现的功能。 关于 manifest 各个字段的完整介绍，参见：[manifest][manifest-docs-url]。

### 项目结构

[lobe-chat-plugin-template][lobe-chat-plugin-template-url] 这个模板项目使用了 Next.js 作为开发框架，它的核心目录结构如下：

```
➜  chat-plugin-template
├── public
│   └── manifest-dev.json            # 描述清单文件
├── src
│   └── pages
│   │   ├── api                      # nextjs 服务端文件夹
│   │   │   ├── clothes.ts           # recommendClothes 接口实现
│   │   │   └── gateway.ts           # 本地插件代理网关
│   │   └── index.tsx                # 前端展示界面
```

当然，模板使用 Next.js 作为开发框架，只是因为我们熟悉 Next.js，开发方便。你可以使用任何你熟悉的开发框架与开发语言，只要能够实现 manifest 中描述的功能即可。

同时也欢迎贡献更多框架与语言的插件模板。

### 服务端

服务端只需要实现 manifest 中描述的 api 接口即可。在模板中，我们使用了 vercel 的 [Edge Runtime](https://nextjs.org/docs/pages/api-reference/edge) 作为服务，免去运维成本。

#### api 实现

针对 Edge Runtime ，我们在 `@lobehub/chat-plugin-sdk` 提供了 `createErrorResponse` 方法，用于快速返回错误响应。目前提供的错误类型详见：[PluginErrorType][plugin-error-type-url]。

模板中的 clothes 接口实现如下：

```ts
export default async (req: Request) => {
  if (req.method !== 'POST') return createErrorResponse(PluginErrorType.MethodNotAllowed);

  const { gender, mood } = (await req.json()) as RequestData;

  const clothes = gender === 'man' ? manClothes : womanClothes;

  const result: ResponseData = {
    clothes: clothes[mood] || [],
    mood,
    today: Date.now(),
  };

  return new Response(JSON.stringify(result));
};
```

其中 `maniClothes` 和 `womanClothes` 是写死的 mock 数据，在实际场景中，可以替换为数据库请求。

#### gateway

由于 LobeChat 默认的插件网关是云端服务（<https://chat.lobehub.com/api/plugins>），云端服务通过 manifest 上的 api 地址发送请求，以解决跨域问题。

而针对自定义插件，插件的请求需要发送给本地服务的， 因此通过在 manifest 中指定网关 (<http://localhost:3400/api/gateway>)，LobeChat 将会直接请求该地址，然后只需要在该地址下创建一个网关实现即可。

```ts
import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default async createLobeChatPluginGateway();
```

[`@lobehub/chat-plugins-gateway`](https://github.com/lobehub/chat-plugins-gateway) 包含了 LobeChat 中插件网关的[实现](https://github.com/lobehub/lobe-chat/blob/main/src/pages/api/plugins.api.ts)，你可以直接使用该包创建网关，进而让 LobeChat 访问到本地的插件服务。

### 插件 UI 界面

对于一个插件而言，UI 界面是一个可选项。例如 [「网页内容提取」插件](https://github.com/lobehub/chat-plugin-web-crawler)，就没有实现相应的用户界面。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263241-0e765fdc-3463-4c36-a398-aef177a30df9.png)

如果你希望在插件消息中展示更加丰富的信息，或者包含一些富交互，可以为插件定义一个用户界面。例如下图，则为搜索引擎插件的用户界面。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263427-9bdc03d5-aa61-4f62-a2ce-88683f3308d8.png)

#### 插件 UI 界面实现

LobeChat 通过 `iframe` + `postMessage` 实现插件 ui 的加载与通信。因此， 插件 UI 的实现方式与普通的网页开发一致，你可以使用任何你熟悉的前端框架与开发语言。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263653-4ea87abc-249a-49f3-a241-7ed93ddb1ddf.png)

在我们提供的模板中，我们使用了 React + Next.js + antd 作为前端界面框架，你可以在 `src/pages/index.tsx` 中找到用户界面的实现。

其中关于插件通信，我们在 [`@lobehub/chat-plugin-sdk`](https://github.com/lobehub/chat-plugin-sdk) 提供了相关方法，用于简化插件与 LobeChat 的通信。你可以通过 `fetchPluginMessage` 方法主动向 LobeChat 获取当前消息的数据。关于该方法的详细介绍，参见：[fetchPluginMessage][fetch-plugin-message-url]。

```tsx
import { fetchPluginMessage } from '@lobehub/chat-plugin-sdk';
import { memo, useEffect, useState } from 'react';

import { ResponseData } from '@/type';

const Render = memo(() => {
  const [data, setData] = useState<ResponseData>();

  useEffect(() => {
    // 从 LobeChat 获取当前插件的消息
    fetchPluginMessage().then((e: ResponseData) => {
      setData(e);
    });
  }, []);

  return <>...</>;
});

export default Render;
```

## 插件部署与发布

当你完成插件的开发后，你可以使用你习惯的方式进行插件的部署。例如使用 vercel ，或者打包成 docker 发布等等。

如果你希望插件被更多人使用，欢迎将你的插件 [提交上架](https://github.com/lobehub/lobe-chat-plugins) 到插件市场。

[manifest-docs-url]: https://github.com/lobehub/chat-plugin-sdk/tree/master/docs/manifest.zh-CN.md
[lobe-chat-plugin-template-url]: https://github.com/lobehub/chat-plugin-template
[plugin-error-type-url]: https://github.com/lobehub/chat-plugin-template
[fetch-plugin-message-url]: https://github.com/lobehub/chat-plugin-template
