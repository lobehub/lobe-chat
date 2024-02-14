# 环境变量

LobeChat 在部署时提供了一些额外的配置项，使用环境变量进行设置

#### TOC

- [通用变量](#通用变量)
  - [`ACCESS_CODE`](#access_code)
  - [`ENABLE_OAUTH_SSO`](#enable_oauth_sso)
  - [`NEXT_PUBLIC_BASE_PATH`](#next_public_base_path)
- [身份验证服务](#身份验证服务)
  - [通用设置](#通用设置)
  - [Auth0](#auth0)
- [模型服务商](#模型服务商)
  - [OpenAI](#openai)
  - [Azure OpenAI](#azure-openai)
  - [智谱 AI](#智谱-ai)
  - [Moonshot AI](#moonshot-ai)
  - [Google AI](#google-ai)
  - [AWS Bedrock](#aws-bedrock)
  - [Ollama](#ollama)
- [插件服务](#插件服务)
  - [`PLUGINS_INDEX_URL`](#plugins_index_url)
  - [`PLUGIN_SETTINGS`](#plugin_settings)
- [角色服务](#角色服务)
  - [`AGENTS_INDEX_URL`](#agents_index_url)
- [数据统计](#数据统计)
  - [Vercel Analytics](#vercel-analytics)
  - [Posthog Analytics](#posthog-analytics)
  - [Umami Analytics](#umami-analytics)

## 通用变量

### `ACCESS_CODE`

- 类型：可选
- 描述：添加访问 LobeChat 服务的密码，你可以设置一个长密码以防被爆破
- 默认值：-
- 示例：`awCTe)re_r74` or `rtrt_ewee3@09!`

### `ENABLE_OAUTH_SSO`

- 类型：可选
- 描述：为 LobeChat 启用单点登录 (SSO)。设置为 `1` 以启用单点登录。有关详细信息，请参阅[身份验证服务](#身份验证服务)。
- 默认值: `-`
- 示例: `1`

### `NEXT_PUBLIC_BASE_PATH`

- 类型：可选
- 描述：为 LobeChat 添加 `basePath`
- 默认值: `-`
- 示例: `/test`

#### `DEFAULT_AGENT_CONFIG`

- 类型：可选
- 描述：用于配置 LobeChat 默认助理的默认配置。它支持多种数据类型和结构，包括键值对、嵌套字段、数组值等。
- 默认值：`-`
- 示例：`'model=gpt-4-1106-preview;params.max_tokens=300;plugins=search-engine,lobe-image-designer`

`DEFAULT_AGENT_CONFIG` 用于配置 LobeChat 默认助理的默认配置。它支持多种数据类型和结构，包括键值对、嵌套字段、数组值等。下表详细说明了 `DEFAULT_AGENT_CONFIG` 环境变量的配置项、示例以及相应解释：

| 配置项类型 | 示例                                         | 解释                                                                         |
| ---------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| 基本键值对 | `model=gpt-4`                                | 设置模型为 `gpt-4`。                                                         |
| 嵌套字段   | `tts.sttLocale=en-US`                        | 设置文本到语音服务的语言区域为 `en-US`。                                     |
| 数组       | `plugins=search-engine,lobe-image-designer`  | 启用 `search-engine` 和 `lobe-image-designer` 插件。                         |
| 中文逗号   | `plugins=search-engine，lobe-image-designer` | 同上，演示支持中文逗号分隔。                                                 |
| 多个配置项 | `model=glm-4;provider=zhipu`                 | 设置模型为 `glm-4` 且模型服务商为 `zhipu`。                                  |
| 数字值     | `params.max_tokens=300`                      | 设置最大令牌数为 `300`。                                                     |
| 布尔值     | `enableAutoCreateTopic=true`                 | 启用自动创建主题。                                                           |
| 特殊字符   | `inputTemplate="Hello; I am a bot;"`         | 设置输入模板为 `Hello; I am a bot;`。                                        |
| 错误处理   | `model=gpt-4;maxToken`                       | 忽略无效条目 `maxToken`，仅解析出 `model=gpt-4`。                            |
| 值覆盖     | `model=gpt-4;model=gpt-4-1106-preview`       | 如果键重复，使用最后一次出现的值，此处 `model` 的值为 `gpt-4-1106-preview`。 |

相关阅读：

- [\[RFC\] 022 - 环境变量配置默认助手参数](https://github.com/lobehub/lobe-chat/discussions/913)

## 身份验证服务

### 通用设置

#### `NEXTAUTH_SECRET`

- 类型：必须
- 描述：用于加密 Auth.js 会话令牌的密钥。您可以使用以下命令生成秘钥： `openssl rand -base64 32`.
- 默认值: `-`
- 示例: `Tfhi2t2pelSMEA8eaV61KaqPNEndFFdMIxDaJnS1CUI=`

### Auth0

> \[!NOTE] 注意事项：
>
> 目前我们只支持 Auth0 身份验证服务提供商。如果您需要使用其他身份验证服务提供商，可以提交功能请求或 Pull Request。

#### `AUTH0_CLIENT_ID`

- 类型：必须
- 描述: Auth0 应用程序的 Client ID，您可以访问[这里][auth0-client-page]并导航至应用程序设置来查看
- 默认值: `-`
- 示例: `evCnOJP1UX8FMnXR9Xkj5t0NyFn5p70P`

#### `AUTH0_CLIENT_SECRET`

- 类型：必须
- 描述: Auth0 应用程序的 Client Secret
- 默认值: `-`
- 示例: `wnX7UbZg85ZUzF6ioxPLnJVEQa1Elbs7aqBUSF16xleBS5AdkVfASS49-fQIC8Rm`

#### `AUTH0_ISSUER`

- 类型：必须
- 描述: Auth0 应用程序的签发人 / 域
- 默认值: `-`
- 示例: `https://example.auth0.com`

## 模型服务商

### OpenAI

#### `OPENAI_API_KEY`

- 类型：必选
- 描述：这是你在 OpenAI 账户页面申请的 API 密钥，可以前往[这里][openai-api-page]查看
- 默认值：-
- 示例：`sk-xxxxxx...xxxxxx`

#### `OPENAI_PROXY_URL`

- 类型：可选
- 描述：如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL
- 默认值：`https://api.openai.com/v1`
- 示例：`https://api.chatanywhere.cn` 或 `https://aihubmix.com/v1`

> \[!NOTE] 注意事项：
>
> 请检查你的代理服务商的请求后缀，有的代理服务商会在请求后缀添加 `/v1`，有的则不会。
> 如果你在测试时发现 AI 返回的消息为空，请尝试添加 `/v1` 后缀后重试。

是否填写 `/v1` 跟模型服务商有很大关系，比如 openai 的默认地址是 `api.openai.com/v1` 。如果你的代理上是转发了 `/v1` 这个接口，那么直接填 `proxy.com` 即可。 但如果模型服务商是直接转发了 `api.openai.com` 域名，那么你就要自己加上 `/v1` 这个 url。

相关讨论：

- [Docker 安装，配置好环境变量后，为何返回值是空白？](https://github.com/lobehub/lobe-chat/discussions/623)
- [使用第三方接口报错的原因](https://github.com/lobehub/lobe-chat/discussions/734)
- [代理服务器地址填了聊天没任何反应](https://github.com/lobehub/lobe-chat/discussions/1065)

#### `CUSTOM_MODELS`

- 类型：可选
- 描述：用来控制模型列表，使用 `+` 增加一个模型，使用 `-` 来隐藏一个模型，使用 `模型名=展示名` 来自定义模型的展示名，用英文逗号隔开。
- 默认值：`-`
- 示例：`+qwen-7b-chat,+glm-6b,-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo`

上面示例表示增加 `qwen-7b-chat` 和 `glm-6b` 到模型列表，而从列表中删除 `gpt-3.5-turbo`，并将 `gpt-4-0125-preview` 模型名字展示为 `gpt-4-turbo`。如果你想先禁用所有模型，再启用指定模型，可以使用 `-all,+gpt-3.5-turbo`，则表示仅启用 `gpt-3.5-turbo`。

你可以在 [modelProviders](https://github.com/lobehub/lobe-chat/tree/main/src/config/modelProviders) 查找到当前的所有模型名。

### Azure OpenAI

如果你需要使用 Azure OpenAI 来提供模型服务，可以查阅 [使用 Azure OpenAI 部署](Deploy-with-Azure-OpenAI.zh-CN.md) 章节查看详细步骤，这里将列举和 Azure OpenAI 相关的环境变量。

#### `USE_AZURE_OPENAI`

- 类型：可选
- 描述：设置该值为 `1` 开启 Azure OpenAI 配置
- 默认值：-
- 示例：`1`

#### `AZURE_API_KEY`

- 类型：可选
- 描述：这是你在 Azure OpenAI 账户页面申请的 API 密钥
- 默认值：-
- 示例：`c55168be3874490ef0565d9779ecd5a6`

#### `AZURE_API_VERSION`

- 类型：可选
- 描述：Azure 的 API 版本，遵循 YYYY-MM-DD 格式
- 默认值：`2023-08-01-preview`
- 示例：`2023-05-15`，查阅[最新版本][azure-api-verion-url]

### 智谱 AI

#### `ZHIPU_API_KEY`

- 类型：必选
- 描述：这是你在 智谱 AI 服务中申请的 API 密钥
- 默认值：-
- 示例：`4582d332441a313f5c2ed9824d1798ca.rC8EcTAhgbOuAuVT`

### Moonshot AI

#### `MOONSHOT_API_KEY`

- 类型：必选
- 描述：这是你在 Moonshot AI 服务中申请的 API 密钥
- 默认值：-
- 示例：`Y2xpdGhpMzNhZXNoYjVtdnZjMWc6bXNrLWIxQlk3aDNPaXpBWnc0V1RaMDhSRmRFVlpZUWY=`

### Google AI

#### `GOOGLE_API_KEY`

- 类型：必选
- 描述：这是你在 Google AI Platform 申请的 API 密钥，用于访问 Google AI 服务
- 默认值：-
- 示例：`AIraDyDwcw254kwJaGjI9wwaHcdDCS__Vt3xQE`

### AWS Bedrock

#### `AWS_ACCESS_KEY_ID`

- 类型：必选
- 描述：用于 AWS 服务认证的访问键 ID
- 默认值：-
- 示例：`AKIA5STVRLFSB4S9HWBR`

#### `AWS_SECRET_ACCESS_KEY`

- 类型：必选
- 描述：用于 AWS 服务认证的密钥
- 默认值：-
- 示例：`Th3vXxLYpuKcv2BARktPSTPxx+jbSiFT6/0w7oEC`

#### `AWS_REGION`

- 类型：可选
- 描述：AWS 服务的区域设置
- 默认值：`us-east-1`
- 示例：`us-east-1`

### Ollama

#### `OLLAMA_PROXY_URL`

- 类型：可选
- 描述：用于启用 Ollama 服务，设置后可在语言模型列表内展示可选开源语言模型，也可以指定自定义语言模型
- 默认值：-
- 示例：`http://127.0.0.1:11434/v1`

## 插件服务

### `PLUGINS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 插件市场的索引地址，如果你自行部署了插件市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-plugins.lobehub.com`

### `PLUGIN_SETTINGS`

- 类型：可选
- 描述：用于配置插件的设置，使用 `插件名:设置字段=设置值` 的格式来配置插件的设置，多个设置字段用英文分号 `;` 隔开，多个插件设置使用英文逗号`,`隔开。
- 默认值：`-`
- 示例：`search-engine:SERPAPI_API_KEY=xxxxx,plugin-2:key1=value1;key2=value2`

上述示例表示设置 `search-engine` 插件的 `SERPAPI_API_KEY` 为 `xxxxx`，设置 `plugin-2` 的 `key1` 为 `value1`，`key2` 为 `value2`。生成的插件设置配置如下：

```json
{
  "plugin-2": {
    "key1": "value1",
    "key2": "value2"
  },
  "search-engine": {
    "SERPAPI_API_KEY": "xxxxx"
  }
}
```

## 角色服务

### `AGENTS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 角色市场的索引地址，如果你自行部署了角色市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-agents.lobehub.com`

## 数据统计

### Vercel Analytics

#### `NEXT_PUBLIC_ANALYTICS_VERCEL`

- 类型：可选
- 描述：用于配置 Vercel Analytics 的环境变量，当设为 `1` 时开启 Vercel Analytics
- 默认值： `-`
- 示例：`1`

#### `NEXT_PUBLIC_VERCEL_DEBUG`

- 类型：可选
- 描述：用于开启 Vercel Analytics 的调试模式
- 默认值： `-`
- 示例：`1`

### Posthog Analytics

#### `NEXT_PUBLIC_ANALYTICS_POSTHOG`

- 类型：可选
- 描述：用于开启 [PostHog Analytics][posthog-analytics-url] 的环境变量，设为 `1` 时开启 PostHog Analytics
- 默认值： `-`
- 示例：`1`

#### `NEXT_PUBLIC_POSTHOG_KEY`

- 类型：可选
- 描述：设置 PostHog 项目 Key
- 默认值： `-`
- 示例：`phc_xxxxxxxx`

#### `NEXT_PUBLIC_POSTHOG_HOST`

- 类型：可选
- 描述：设置 PostHog 服务的部署地址，默认为官方的 SAAS 地址
- 默认值：`https://app.posthog.com`
- 示例：`https://example.com`

#### `NEXT_PUBLIC_POSTHOG_DEBUG`

- 类型：可选
- 描述：开启 PostHog 的调试模式
- 默认值： `-`
- 示例：`1`

### Umami Analytics

#### `NEXT_PUBLIC_ANALYTICS_UMAMI`

- 类型：可选
- 描述：用于开启 [Umami Analytics][umami-analytics-url] 的环境变量，设为 `1`
  时开启 Umami Analytics
- 默认值： `-`
- 示例：`1`

#### `NEXT_PUBLIC_UMAMI_SCRIPT_URL`

- 类型：可选
- 描述：Umami 脚本的网址，默认为 Umami Cloud 提供的脚本网址
- 默认值：`https://analytics.umami.is/script.js`
- 示例：`https://umami.your-site.com/script.js`

#### `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

- 类型：必选
- 描述：你的 Umami 的 Website ID
- 默认值：`-`
- 示例：`E738D82A-EE9E-4806-A81F-0CA3CAE57F65`

[auth0-client-page]: https://manage.auth0.com/dashboard
[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[openai-api-page]: https://platform.openai.com/account/api-keys
[posthog-analytics-url]: https://posthog.com
[umami-analytics-url]: https://umami.is
