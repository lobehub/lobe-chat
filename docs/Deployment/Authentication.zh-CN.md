# 身份验证服务

LobeChat 支持配置外部身份验证服务，供企业 / 组织内部使用，统一管理用户授权，目前支持 [Auth0][auth0-client-page]，本文将介绍如何配置身份验证服务。

### TOC

- [创建 Auth0 应用](#创建-auth0-应用)
- [新增用户](#新增用户)
- [配置环境变量](#配置环境变量)
- [进阶 - 连接现有的单点登录服务](#进阶---连接现有的单点登录服务)
- [进阶 - 配置社交登录](#进阶---配置社交登录)

## 创建 Auth0 应用

注册并登录 [Auth0][auth0-client-page]，点击左侧导航栏的「Applications」，切换到应用管理界面，点击右上角「Create Application」以创建应用。

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/1b405347-f4c3-4c55-82f6-47116f2210d0)

填写你想向组织用户显示的应用名称，可选择任意应用类型，点击「Create」。

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/75c92f85-3ad3-4473-a9c6-e667e28d428d)

创建成功后，点击相应的应用，进入应用详情页，切换到「Settings」标签页，就可以看到相应的配置信息

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/a1ed996b-95ef-4b7d-a50d-b4666eccfecb)

在应用配置页面中，还需要配置 Allowed Callback URLs，在此处填写 `http(s)://<your-domain>/api/auth/callback/auth0`

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/575f46aa-f485-49bd-8b90-dbb1ce1a5c1b)

> \[!NOTE]
>
> 可以在部署后再填写或修改 Allowed Callback URLs，但是务必保证填写的 URL 与部署的 URL 一致

## 新增用户

点击左侧导航栏的「Users Management」，进入用户管理界面，可以为你的组织新建用户，用以登录 LobeChat

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/3b8127ab-dc4f-4ff9-a4cb-dec3ef0295cc)

## 配置环境变量

在部署 LobeChat 时，你需要配置以下环境变量：

| 环境变量              | 类型 | 描述                                                                                    | 默认值 | 示例                                                               |
| --------------------- | ---- | --------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `ENABLE_OAUTH_SSO`    | 必选 | 为 LobeChat 启用单点登录 (SSO)。设置为 `1` 以启用单点登录。                             | -      | `1`                                                                |
| `NEXTAUTH_SECRET`     | 必选 | 用于加密 Auth.js 会话令牌的密钥。您可以使用以下命令生成秘钥： `openssl rand -base64 32` | -      | `Tfhi2t2pelSMEA8eaV61KaqPNEndFFdMIxDaJnS1CUI=`                     |
| `AUTH0_CLIENT_ID`     | 必选 | Auth0 应用程序的 Client ID                                                              | -      | `evCnOJP1UX8FMnXR9Xkj5t0NyFn5p70P`                                 |
| `AUTH0_CLIENT_SECRET` | 必选 | Auth0 应用程序的 Client Secret                                                          | -      | `wnX7UbZg85ZUzF6ioxPLnJVEQa1Elbs7aqBUSF16xleBS5AdkVfASS49-fQIC8Rm` |
| `AUTH0_ISSUER`        | 必选 | Auth0 应用程序的 Domain                                                                 | -      | `https://example.auth0.com`                                        |
| `ACCESS_CODE`         | 必选 | 添加访问此服务的密码，你可以设置一个足够长的随机密码以 “禁用” 访问码授权                | -      | `awCT74` 或 `e3@09!` or `code1,code2,code3`                        |

> \[!NOTE]
>
> 部署成功后，用户将可以使用 Auth0 中配置的用户通过身份认证并使用 LobeChat。

## 进阶 - 连接现有的单点登录服务

如果你的企业或组织已有现有的统一身份认证设施，可在 Applications -> SSO Integrations 中，连接现有的单点登录服务。

Auth0 支持 Azure Active Directory, Slack, Google Workspace, Office 365, Zoom 等单点登录服务，详细支持列表可参考 [这里][auth0-sso-integrations]

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/32650f4f-d0b0-4843-b26d-d35bad11d8a3)

## 进阶 - 配置社交登录

如果你的企业或组织需要支持外部人员登录，可以在 Authentication -> Social 中，配置社交登录服务。

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/7b6f6a6c-2686-49d8-9dbd-0516053f1efa)

> \[!NOTE]
>
> 配置社交登录服务默认会允许所有人通过认证，这可能会导致 LobeChat 被外部人员滥用。如果你需要限制登录人员，务必配置阻止策略
>
> 请在打开社交登录选项后，参考 [这篇文章][auth0-login-actions-manual] 创建 Action 来设置阻止 / 允许 列表

[auth0-client-page]: https://manage.auth0.com/dashboard
[auth0-login-actions-manual]: https://auth0.com/blog/permit-or-deny-login-requests-using-auth0-actions/
[auth0-sso-integrations]: https://marketplace.auth0.com/features/sso-integrations
