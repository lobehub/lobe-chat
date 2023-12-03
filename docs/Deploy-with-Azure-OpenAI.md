# Deploying with Azure OpenAI

LobeChat supports using [Azure OpenAI][azure-openai-url] as the model service provider for OpenAI. This document will guide you through the configuration of Azure OpenAI.

#### TOC

- [Usage Limitations](#usage-limitations)
- [Configuration in the Interface](#configuration-in-the-interface)
- [Configuration at Deployment](#configuration-at-deployment)

## Usage Limitations

Considering development costs ([#178][rfc]), the current version of LobeChat does not fully conform to Azure OpenAI's implementation model. Instead, it adopts a solution based on `openai` that is compatible with Azure OpenAI. This brings about the following limitations:

- You can only choose one between OpenAI and Azure OpenAI. Once you enable Azure OpenAI, you will not be able to use OpenAI as the model service provider.
- LobeChat requires deployment names to be the same as the model names in order to function properly. For example, the deployment name for the `gpt-35-turbo` model must be `gpt-35-turbo`, otherwise LobeChat will not be able to match the model correctly.
  ![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/267082091-d89d53d3-1c8c-40ca-ba15-0a9af2a79264.png)
- Due to the complexity of integrating the Azure OpenAI SDK, it is currently impossible to query the model list of configured resources.

## Configuration in the Interface

Click on "Operation" - "Settings" in the bottom left corner, switch to the "Language Model" tab and enable the "Azure OpenAI" switch to start using Azure OpenAI.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/267083420-422a3714-627e-4bef-9fbc-141a2a8ca916.png)

You can fill in the corresponding configuration items as needed:

- **APIKey**: The API key you applied for on the Azure OpenAI account page, which can be found in the "Keys and Endpoints" section.
- **API Address**: Azure API address, which can be found in the "Keys and Endpoints" section when checking resources from the Azure portal.
- **Azure Api Version**: The API version of Azure, which follows the YYYY-MM-DD format, refer to the [latest version][azure-api-version-url].

After completing the above field configuration, click on "Check". If the prompt says "Check Passed", it means the configuration was successful.

<br/>

## Configuration at Deployment

If you want the deployed version to be directly configured with Azure OpenAI for end users to use immediately, you need to configure the following environment variables at deployment:

| Environment Variable | Required | Description                                                                       | Default Value      | Example                                                        |
| -------------------- | -------- | --------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------- |
| `USE_AZURE_OPENAI`   | Yes      | Set this value to `1` to enable Azure OpenAI configuration                        | -                  | `1`                                                            |
| `AZURE_API_KEY`      | Yes      | This is the API key you applied for on the Azure OpenAI account page              | -                  | `c55168be3874490ef0565d9779ecd5a6`                             |
| `OPENAI_PROXY_URL`   | Yes      | Azure API address, can be found in the "Keys and Endpoints" section               | -                  | `https://docs-test-001.openai.azure.com`                       |
| `AZURE_API_VERSION`  | No       | Azure's API version, follows the YYYY-MM-DD format                                | 2023-08-01-preview | `2023-05-15`, refer to [latest version][azure-api-version-url] |
| `ACCESS_CODE`        | No       | Add a password to access this service, the password should be 6 digits or letters | -                  | `awCT74` or `e3@09!`                                           |

> \[!NOTE]
>
> When you enable `USE_AZURE_OPENAI` on the server side, users will not be able to modify and use the OpenAI key in the front-end configuration.

[azure-api-version-url]: https://learn.microsoft.com/zh-cn/azure/ai-services/openai/reference#chat-completions
[azure-openai-url]: https://learn.microsoft.com/zh-cn/azure/ai-services/openai/concepts/models
[rfc]: https://github.com/lobehub/lobe-chat/discussions/178
