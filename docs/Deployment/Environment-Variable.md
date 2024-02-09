# Environment Variables

LobeChat provides additional configuration options during deployment, which can be set using environment variables

#### TOC

- [General Variables](#general-variables)
  - [`ACCESS_CODE`](#access_code)
  - [`ENABLE_OAUTH_SSO`](#enable_oauth_sso)
  - [`NEXT_PUBLIC_BASE_PATH`](#next_public_base_path)
- [Authentication Service Providers](#authentication-service-providers)
  - [Common Settings](#common-settings)
  - [Auth0](#auth0)
- [Model Service Providers](#model-service-providers)
  - [OpenAI](#openai)
  - [Azure OpenAI](#azure-openai)
  - [Zhipu AI](#zhipu-ai)
  - [Moonshot AI](#moonshot-ai)
  - [Google AI](#google-ai)
  - [AWS Bedrock](#aws-bedrock)
- [Plugin Service](#plugin-service)
  - [`PLUGINS_INDEX_URL`](#plugins_index_url)
  - [`PLUGIN_SETTINGS`](#plugin_settings)
- [Agent Service](#agent-service)
  - [`AGENTS_INDEX_URL`](#agents_index_url)
- [Data Analytics](#data-analytics)
  - [Vercel Analytics](#vercel-analytics)
  - [Posthog Analytics](#posthog-analytics)
  - [Umami Analytics](#umami-analytics)

## General Variables

### `ACCESS_CODE`

- Type: Optional
- Description: Add a password to access the LobeChat service; you can set a long password to avoid leaking. If this value contains a comma, it is a password array.
- Default: `-`
- Example: `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3`

### `ENABLE_OAUTH_SSO`

- Type: Optional
- Description: Enable OAuth single sign-on (SSO) for LobeChat. Set to `1` to enable OAuth SSO. See [Authentication Service Providers](#authentication-service-providers) for more details.
- Default: `-`
- Example: `1`

### `NEXT_PUBLIC_BASE_PATH`

- Type：Optional
- Description：add `basePath` for LobeChat
- Default: `-`
- Example: `/test`

## Authentication Service Providers

### Common Settings

#### `NEXTAUTH_SECRET`

- Type: Required
- Description: The secret key used to encrypt the Auth.js session token. You can generate a secret key using the following command: `openssl rand -base64 32`
- Default: `-`
- Example: `Tfhi2t2pelSMEA8eaV61KaqPNEndFFdMIxDaJnS1CUI=`

### Auth0

> \[!NOTE]
>
> We only support the Auth0 authentication service provider at the moment. If you need to use other authentication service providers, you can submit a feature request or pull request.

#### `AUTH0_CLIENT_ID`

- Type: Required
- Description: The Client ID of the Auth0 application, you can go [here][auth0-client-page] and navigate to the application settings to view
- Default: `-`
- Example: `evCnOJP1UX8FMnXR9Xkj5t0NyFn5p70P`

#### `AUTH0_CLIENT_SECRET`

- Type: Required
- Description: The Client Secret of the Auth0 application
- Default: `-`
- Example: `wnX7UbZg85ZUzF6ioxPLnJVEQa1Elbs7aqBUSF16xleBS5AdkVfASS49-fQIC8Rm`

#### `AUTH0_ISSUER`

- Type: Required
- Description: The issuer/domain of the Auth0 application
- Default: `-`
- Example: `https://example.auth0.com`

## Model Service Providers

### OpenAI

#### `OPENAI_API_KEY`

- Type: Required
- Description: This is the API key you apply for on the OpenAI account page, you can go [here][openai-api-page] to view
- Default: `-`
- Example: `sk-xxxxxx...xxxxxx`

#### `OPENAI_PROXY_URL`

- Type: Optional
- Description: If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL
- Default: `https://api.openai.com/v1`
- Example: `https://api.chatanywhere.cn` or `https://aihubmix.com/v1`

> \[!NOTE]
>
> Please check the request suffix of your proxy service provider. Some proxy service providers may add `/v1` to the request suffix, while others may not.
> If you find that the AI returns an empty message during testing, try adding the `/v1` suffix and retrying.

Whether to fill in `/v1` is closely related to the model service provider. For example, the default address of OpenAI is `api.openai.com/v1`. If your proxy forwards this interface, you can directly fill in `proxy.com`. However, if the model service provider directly forwards the `api.openai.com` domain, you need to add the `/v1` URL by yourself.

Related discussions:

- [Why is the return value blank after installing Docker, configuring the environment variables?](https://github.com/lobehub/lobe-chat/discussions/623)
- [Reasons for errors when using third-party interfaces](https://github.com/lobehub/lobe-chat/discussions/734)
- [No response when filling in the proxy server address for chatting](https://github.com/lobehub/lobe-chat/discussions/1065)

#### `CUSTOM_MODELS`

- Type: Optional
- Description: Used to control the model list. Use `+` to add a model, `-` to hide a model, and `model_name=display_name` to customize the display name of a model, separated by commas.
- Default: `-`
- Example: `+qwen-7b-chat,+glm-6b,-gpt-3.5-turbo,gpt-4-0125-preview=gpt-4-turbo`

The above example adds `qwen-7b-chat` and `glm-6b` to the model list, removes `gpt-3.5-turbo` from the list, and displays the model name `gpt-4-0125-preview` as `gpt-4-turbo`. If you want to disable all models first and then enable specific models, you can use `-all,+gpt-3.5-turbo`, which means only `gpt-3.5-turbo` will be enabled.

You can find all current model names in [modelProviders](https://github.com/lobehub/lobe-chat/tree/main/src/config/modelProviders).

### Azure OpenAI

If you need to use Azure OpenAI to provide model services, you can refer to the [Deploy with Azure OpenAI](Deploy-with-Azure-OpenAI.zh-CN.md) section for detailed steps. Here are the environment variables related to Azure OpenAI.

#### `USE_AZURE_OPENAI`

- Type: Optional
- Description: Set this value to `1` to enable Azure OpenAI configuration
- Default: `-`
- Example: `1`

#### `AZURE_API_KEY`

- Type: Optional
- Description: This is the API key you apply for on the Azure OpenAI account page
- Default: `-`
- Example: `c55168be3874490ef0565d9779ecd5a6`

#### `AZURE_API_VERSION`

- Type: Optional
- Description: Azure's API version, following the YYYY-MM-DD format
- Default: `2023-08-01-preview`
- Example: `2023-05-15`, refer to [latest version][azure-api-verion-url]

<br/>

### Zhipu AI

#### `ZHIPU_API_KEY`

- Type: Required
- Description: This is the API key you applied for in the Zhipu AI service
- Default Value: -
- Example: `4582d332441a313f5c2ed9824d1798ca.rC8EcTAhgbOuAuVT`

### Moonshot AI

#### `MOONSHOT_API_KEY`

- Type: Required
- Description: This is the API key you applied for in the Zhipu AI service
- Default Value: -
- Example: `Y2xpdGhpMzNhZXNoYjVtdnZjMWc6bXNrLWIxQlk3aDNPaXpBWnc0V1RaMDhSRmRFVlpZUWY=`

### Google AI

#### `GOOGLE_API_KEY`

- Type: Required
- Description: This is the API key you applied for on Google Cloud Platform, used to access Google AI services
- Default Value: -
- Example: `AIraDyDwcw254kwJaGjI9wwaHcdDCS__Vt3xQE`

### AWS Bedrock

#### `AWS_ACCESS_KEY_ID`

- Type: Required
- Description: The access key ID for AWS service authentication
- Default Value: -
- Example: `AKIA5STVRLFSB4S9HWBR`

#### `AWS_SECRET_ACCESS_KEY`

- Type: Required
- Description: The secret key for AWS service authentication
- Default Value: -
- Example: `Th3vXxLYpuKcv2BARktPSTPxx+jbSiFT6/0w7oEC`

#### `AWS_REGION`

- Type: Optional
- Description: The region setting for AWS services
- Default Value: `us-east-1`
- Example: `us-east-1`

## Plugin Service

### `PLUGINS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat plugin market. If you have deployed the plugin market service yourself, you can use this variable to override the default plugin market address
- Default: `https://chat-plugins.lobehub.com`

### `PLUGIN_SETTINGS`

- Type: Optional
- Description: Used to set the plugin settings, the format is `plugin-identifier:key1=value1;key2=value2`, multiple settings fields are separated by semicolons `;`, multiple plugin settings are separated by commas `,`.
- Default: `-`
- Example：`search-engine:SERPAPI_API_KEY=xxxxx,plugin-2:key1=value1;key2=value2`

The above example adds `search-engine` plugin settings, and sets the `SERPAPI_API_KEY` of the `search-engine` plugin to `xxxxx`, and sets the `key1` of the `plugin-2` plugin to `value1`, and `key2` to `value2`. The generated plugin settings configuration is as follows:

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

## Agent Service

### `AGENTS_INDEX_URL`

- Type: Optional
- Description: The index address of the LobeChat role market. If you have deployed the role market service yourself, you can use this variable to override the default plugin market address
- Default: `https://chat-agents.lobehub.com`

<br/>

## Data Analytics

### Vercel Analytics

#### `NEXT_PUBLIC_ANALYTICS_VERCEL`

- Type: Optional
- Description: Environment variable to enable [Vercel Analytics][vercel-analytics-url]. Set to `1` to enable Vercel Analytics.
- Default: `-`
- Example: `1`

#### `NEXT_PUBLIC_VERCEL_DEBUG`

- Type: Optional
- Description: Enable debug mode for Vercel Analytics.
- Default: `-`
- Example: `1`

### Posthog Analytics

#### `NEXT_PUBLIC_ANALYTICS_POSTHOG`

- Type: Optional
- Description: Environment variable to enable [PostHog Analytics][posthog-analytics-url]. Set to `1` to enable PostHog Analytics.
- Default: `-`
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

### Umami Analytics

#### `NEXT_PUBLIC_ANALYTICS_UMAMI`

- Type: Optional
- Description: Environment variable to enable [Umami Analytics][umami-analytics-url]. Set to `1` to enable Umami Analytics.
- Default: `-`
- Example: `1`

#### `NEXT_PUBLIC_UMAMI_SCRIPT_URL`

- Type: Optional
- Description: Set the url of the umami script. Default is the script address of Umami Cloud.
- Default: `https://analytics.umami.is/script.js`
- Example: `https://umami.your-site.com/script.js`

#### `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

- Type: Required
- Description: The website ID in umami
- Default: `-`
- Example: `E738D82A-EE9E-4806-A81F-0CA3CAE57F65`

[auth0-client-page]: https://manage.auth0.com/dashboard
[azure-api-verion-url]: https://docs.microsoft.com/zh-cn/azure/developer/javascript/api-reference/es-modules/azure-sdk/ai-translation/translationconfiguration?view=azure-node-latest#api-version
[openai-api-page]: https://platform.openai.com/account/api-keys
[posthog-analytics-url]: https://posthog.com
[umami-analytics-url]: https://umami.is
[vercel-analytics-url]: https://vercel.com/analytics
