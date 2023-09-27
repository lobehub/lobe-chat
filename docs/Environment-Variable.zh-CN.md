# LobeChat 环境变量

LobeChat 在部署时提供了一些额外的配置项，使用环境变量进行设置

#### TOC

- [通用变量](#通用变量)
  - [`ACCESS_CODE`](#access_code)
- [OpenAI](#openai)
  - [`OPENAI_API_KEY`](#openai_api_key)
  - [`OPENAI_PROXY_URL`](#openai_proxy_url)
- [Azure OpenAI](#azure-openai)
  - [`USE_AZURE_OPENAI`](#use_azure_openai)
  - [`AZURE_API_KEY`](#azure_api_key)
  - [`AZURE_API_VERSION`](#azure_api_version)
- [插件服务](#插件服务)
  - [`PLUGINS_INDEX_URL`](#plugins_index_url)
- [角色服务](#角色服务)
  - [`AGENTS_INDEX_URL`](#agents_index_url)
- [数据统计](#数据统计)
  - [Vercel Analytics](#vercel-analytics)
  - [Mixpanel Analytics](#mixpanel-analytics)
  - [`NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN`](#next_public_mixpanel_project_token)
  - [`NEXT_PUBLIC_MIXPANEL_DEBUG`](#next_public_mixpanel_debug)
  - [Posthog Analytics](#posthog-analytics)
  - [`NEXT_PUBLIC_POSTHOG_DEBUG`](#next_public_posthog_debug)
- [开发环境](#开发环境)
  - [`DEV_API_END_PORT_URL`](#dev_api_end_port_url)

## 通用变量

### `ACCESS_CODE`

- 类型：可选
- 描述：添加访问 LobeChat 服务的密码，密码应为 6 位数字或字母
- 默认值：-
- 示例：`awCT74` 或 `e3@09!`

<br/>

## OpenAI

### `OPENAI_API_KEY`

- 类型：必选
- 描述：这是你在 OpenAI 账户页面申请的 API 密钥，可以前往[这里][openai-api-page]查看
- 默认值：-
- 示例：`sk-xxxxxx...xxxxxx`

### `OPENAI_PROXY_URL`

- 类型：可选
- 描述：如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL
- 默认值：`https://api.openai.com`
- 示例：`https://api.chatanywhere.cn`

<br/>

## Azure OpenAI

如果你需要使用 Azure OpenAI 来提供模型服务，可以查阅 [使用 Azure OpenAI 部署](./Deploy-with-Azure-OpenAI.zh-CN.md) 章节查看详细步骤，这里将列举和 Azure OpenAI 相关的环境变量。

### `USE_AZURE_OPENAI`

- 类型：可选
- 描述：设置该值为 `1` 开启 Azure OpenAI 配置
- 默认值：-
- 示例：`1`

### `AZURE_API_KEY`

- 类型：可选
- 描述：这是你在 Azure OpenAI 账户页面申请的 API 密钥
- 默认值：-
- 示例：`c55168be3874490ef0565d9779ecd5a6`

### `AZURE_API_VERSION`

- 类型：可选
- 描述：Azure 的 API 版本，遵循 YYYY-MM-DD 格式
- 默认值：`2023-08-01-preview`
- 示例：`2023-05-15`，查阅[最新版本][azure-api-verion-url]

<br/>

## 插件服务

### `PLUGINS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 插件市场的索引地址，如果你自行部署了插件市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-plugins.lobehub.com`

<br/>

## 角色服务

### `AGENTS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 角色市场的索引地址，如果你自行部署了角色市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-agents.lobehub.com`

## 数据统计

### Vercel Analytics

#### `NEXT_PUBLIC_ANALYTICS_VERCEL`

- 类型：可选
- 描述：用于配置 Vercel Analytics 的环境变量，当设为 `0` 则关闭 Vercel Analytics
- 默认值： -
- 示例：`0`

#### `NEXT_PUBLIC_VERCEL_DEBUG`

- 类型：可选
- 描述：用于开启 Vercel Analytics 的调试模式
- 默认值： -
- 示例：`1`

### Mixpanel Analytics

#### `NEXT_PUBLIC_ANALYTICS_MIXPANEL`

- 类型：可选
- 描述：用于开启 [Mixpanel Analytics][mixpanel-analytics-url] 的环境变量，设为 `1` 时开启 Mixpanel Analytics
- 默认值： -
- 示例：`1`

### `NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN`

- 类型：可选
- 描述：设置 Mixpanel 项目的识别 Token，可以在[这里][mixpanel-project-url]找到
- 默认值： -
- 示例：`60db2abae7fdd29961f4e8f91b074b3a`

### `NEXT_PUBLIC_MIXPANEL_DEBUG`

- 类型：可选
- 描述：开启 Mixpanel 的调试模式
- 默认值： -
- 示例：`1`

### Posthog Analytics

#### `NEXT_PUBLIC_ANALYTICS_POSTHOG`

- 类型：可选
- 描述：用于开启 [PostHog Analytics][posthog-analytics-url] 的环境变量，设为 `1` 时开启 PostHog Analytics
- 默认值： -
- 示例：`1`

#### `NEXT_PUBLIC_POSTHOG_KEY`

- 类型：可选
- 描述：设置 PostHog 项目 Key
- 默认值： -
- 示例：`phc_xxxxxxxx`

#### `NEXT_PUBLIC_POSTHOG_HOST`

- 类型：可选
- 描述：设置 PostHog 服务的部署地址，默认为官方的 SAAS 地址
- 默认值：`https://app.posthog.com`
- 示例：`https://example.com`

### `NEXT_PUBLIC_POSTHOG_DEBUG`

- 类型：可选
- 描述：开启 PostHog 的调试模式
- 默认值： -
- 示例：`1`

## 开发环境

### `DEV_API_END_PORT_URL`

- 类型：可选
- 描述：定义 LobeChat 服务端请求转发的代理地址，使用该变量可以方便开发时将请求转发到线上。详见[配置代码](https://github.com/lobehub/lobe-chat/blob/main/next.config.mjs#L29-L38)
- 默认值：-
- 示例：`https://chat-preview.lobehub.com`

[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[mixpanel-analytics-url]: https://mixpanel.com
[mixpanel-project-url]: https://mixpanel.com/settings/project
[openai-api-page]: https://platform.openai.com/account/api-keys
[posthog-analytics-url]: https://posthog.com
