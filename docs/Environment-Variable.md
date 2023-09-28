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
- [Data Analytics](#data-analytics)
  - [Posthog Analytics](#posthog-analytics)
- [Development Environment](#development-environment)
  - [`DEV_API_END_PORT_URL`](#dev_api_end_port_url)

## General Variables

### `ACCESS_CODE`

- Type: Optional
- Description: Add a password to access the LobeChat service, the password should be 6 digits or letters
- Default: -
- Example: `awCT74` or `e3@09!`

<br/>

## OpenAI

### `OPENAI_API_KEY`

- Type: Required
- Description: This is the API key you apply for on the OpenAI account page, you can go [here][openai-api-page] to view
- Default: -
- Example: `sk-xxxxxx...xxxxxx`

### `OPENAI_PROXY_URL`

- Type: Optional
- Description: If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL
- Default: `https://api.openai.com`
- Example: `https://api.chatanywhere.cn`

<br/>

## Azure OpenAI

If you need to use Azure OpenAI to provide model services, you can refer to the [Deploy with Azure OpenAI](./Deploy-with-Azure-OpenAI.zh-CN.md) section for detailed steps. Here are the environment variables related to Azure OpenAI.

### `USE_AZURE_OPENAI`

- Type: Optional
- Description: Set this value to `1` to enable Azure OpenAI configuration
- Default: -
- Example: `1`

### `AZURE_API_KEY`

- Type: Optional
- Description: This is the API key you apply for on the Azure OpenAI account page
- Default: -
- Example: `c55168be3874490ef0565d9779ecd5a6`

### `AZURE_API_VERSION`

- Type: Optional
- Description: Azure's API version, following the YYYY-MM-DD format
- Default: `2023-08-01-preview`
- Example: `2023-05-15`, refer to [latest version][azure-api-verion-url]

<br/>

## Plugin Service

### `PLUGINS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat plugin market. If you have deployed the plugin market service yourself, you can use this variable to override the default plugin market address
- Default: `https://chat-plugins.lobehub.com`

<br/>

## Agent Service

### `AGENTS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat role market. If you have deployed the role market service yourself, you can use this variable to override the default plugin market address
- Default: `https://chat-agents.lobehub.com`

<br/>

## Data Analytics

### Posthog Analytics

#### `NEXT_PUBLIC_ANALYTICS_POSTHOG`

- Type: Optional
- Description: Environment variable to enable \[PostHog Analytics]\[posthog-analytics-url]. Set to `1` to enable PostHog Analytics.
- Default: -
- Example: `1`

#### `NEXT_PUBLIC_POSTHOG_KEY`

- Type: Optional
- Description: Set the PostHog project key.
- Default: -
- Example: `phc_xxxxxxxx`

#### `NEXT_PUBLIC_POSTHOG_HOST`

- Type: Optional
- Description: Set the deployment address of the PostHog service. Default is the official SAAS address.
- Default: `https://app.posthog.com`
- Example: `https://example.com`

#### `NEXT_PUBLIC_POSTHOG_DEBUG`

- Type: Optional
- Description: Enable debug mode for PostHog.
- Default: -
- Example: `1`

<br/>

## Development Environment

### `DEV_API_END_PORT_URL`

- Type: Optional
- Description: Define the proxy address of the LobeChat server request forwarding. Using this variable can conveniently forward requests to the line during development. See [configuration code](https://github.com/lobehub/lobe-chat/blob/main/next.config.mjs#L29-L38)
- Default: -
- Example: `https://chat-preview.lobehub.com`

[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[openai-api-page]: https://platform.openai.com/account/api-keys
