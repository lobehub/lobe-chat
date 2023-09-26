# LobeChat 环境变量

## 通用变量

### `ACCESS_CODE`

- 类型：可选
- 描述：添加访问 LobeChat 服务的密码，密码应为 6 位数字或字母
- 示例：`awCT74` 或 `e3@09!`

## OpenAI

### `OPENAI_API_KEY`

- 类型：必选
- 描述：这是你在 OpenAI 账户页面申请的 API 密钥，可以前往[这里][openai-api-page]查看
- 示例：`sk-xxxxxx...xxxxxx`

### `OPENAI_PROXY_URL`

- 类型：可选
- 描述：如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL
- 默认值：`https://api.openai.com`
- 示例：`https://api.chatanywhere.cn`

## Azure OpenAI

如果你需要使用 Azure OpenAI 来提供模型服务，可以查阅 [使用 Azure OpenAI 部署](./Deploy-with-Azure-OpenAI.zh-CN.md) 章节查看详细步骤，这里将列举和 Azure OpenAI 相关的环境变量。

### `USE_AZURE_OPENAI`

- 类型：可选
- 描述：设置该值为 `1` 开启 Azure OpenAI 配置
- 默认值：-
- 示例：`1`

### `OPENAI_PROXY_URL`

- 类型：可选
- 描述：Azure API 地址，从 Azure 门户检查资源时，可在 “密钥和终结点” 部分中找到此值
- 默认值：-
- 示例：`https://docs-test-001.openai.azure.com`

### `AZURE_API_KEY`

- 类型：可选
- 描述：这是你在 Azure OpenAI 账户页面申请的 API 密钥
- 默认值：-
- 示例：`c55168be3874490ef0565d9779ecd5a6`

### `AZURE_API_VERSION`

- 类型：可选
- 描述：Azure 的 API 版本，遵循 YYYY-MM-DD 格式
- 默认值：2023-08-01-preview
- 示例：`2023-05-15`，查阅[最新版本][azure-api-verion-url]

## 插件服务

### `PLUGINS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 插件市场的索引地址，如果你自行部署了插件市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-plugins.lobehub.com`

## 角色服务

### `AGENTS_INDEX_URL`

- 类型：可选
- 描述：LobeChat 角色市场的索引地址，如果你自行部署了角色市场的服务，可以使用该变量来覆盖默认的插件市场地址
- 默认值：`https://chat-agents.lobehub.com`

## 开发环境

### `DEV_API_END_PORT_URL`

- 类型：可选
- 描述：定义 LobeChat 服务端请求转发的代理地址，使用该变量可以方便开发时将请求转发到线上。详见[配置代码](https://github.com/lobehub/lobe-chat/blob/main/next.config.mjs#L29-L38)
- 示例：`https://chat-preview.lobehub.com`

[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[openai-api-page]: https://platform.openai.com/account/api-keys
