# LobeChat Environment Variables

LobeChat provides additional configuration options during deployment, which can be set using environment variables

#### TOC

- [General Variables](#general-variables)
  - [`ACCESS_CODE`](#access_code)
- [OpenAI](#openai)
  - [`OPENAI_API_KEY`](#openai_api_key)
  - [`OPENAI_PROXY_URL`](#openai_proxy_url)
- [Azure OpenAI](#azure-openai)
  - [`USE_AZURE_OPENAI`](#use_azure_openai)
  - [`AZURE_API_KEY`](#azure_api_key)
  - [`AZURE_API_VERSION`](#azure_api_version)
- [Plugin Service](#plugin-service)
  - [`PLUGINS_INDEX_URL`](#plugins_index_url)
- [Agent Service](#agent-service)
  - [`AGENTS_INDEX_URL`](#agents_index_url)
- [Development Environment](#development-environment)
  - [`DEV_API_END_PORT_URL`](#dev_api_end_port_url)

## General Variables

### `ACCESS_CODE`

- Type: Optional
- Description: Add a password to access the LobeChat service, the password should be 6 digits or letters
- Default Value: -
- Example: `awCT74` or `e3@09!`

<br/>

## OpenAI

### `OPENAI_API_KEY`

- Type: Required
- Description: This is the API key you apply for on the OpenAI account page, you can go [here][openai-api-page] to view
- Default Value: -
- Example: `sk-xxxxxx...xxxxxx`

### `OPENAI_PROXY_URL`

- Type: Optional
- Description: If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL
- Default Value: `https://api.openai.com`
- Example: `https://api.chatanywhere.cn`

<br/>

## Azure OpenAI

If you need to use Azure OpenAI to provide model services, you can refer to the [Deploy with Azure OpenAI](./Deploy-with-Azure-OpenAI.zh-CN.md) section for detailed steps. Here are the environment variables related to Azure OpenAI.

### `USE_AZURE_OPENAI`

- Type: Optional
- Description: Set this value to `1` to enable Azure OpenAI configuration
- Default Value: -
- Example: `1`

### `AZURE_API_KEY`

- Type: Optional
- Description: This is the API key you apply for on the Azure OpenAI account page
- Default Value: -
- Example: `c55168be3874490ef0565d9779ecd5a6`

### `AZURE_API_VERSION`

- Type: Optional
- Description: Azure's API version, following the YYYY-MM-DD format
- Default Value: `2023-08-01-preview`
- Example: `2023-05-15`, refer to [latest version][azure-api-verion-url]

<br/>

## Plugin Service

### `PLUGINS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat plugin market. If you have deployed the plugin market service yourself, you can use this variable to override the default plugin market address
- Default Value: `https://chat-plugins.lobehub.com`

<br/>

## Agent Service

### `AGENTS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat role market. If you have deployed the role market service yourself, you can use this variable to override the default plugin market address
- Default Value: `https://chat-agents.lobehub.com`

<br/>

## Development Environment

### `DEV_API_END_PORT_URL`

- Type: Optional
- Description: Define the proxy address of the LobeChat server request forwarding. Using this variable can conveniently forward requests to the line during development. See [configuration code](https://github.com/lobehub/lobe-chat/blob/main/next.config.mjs#L29-L38)
- Default Value: -
- Example: `https://chat-preview.lobehub.com`

[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[openai-api-page]: https://platform.openai.com/account/api-keys
