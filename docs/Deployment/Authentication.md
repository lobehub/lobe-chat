# Authentication Service

LobeChat supports configuring external identity verification services for internal use within enterprises/organizations, facilitating centralized management of user authorizations. Currently, [Auth0][auth0-client-page] is supported. This article will guide you through the process of setting up the identity verification service.

### TOC

- [Creating an Auth0 Application](#creating-an-auth0-application)
- [Adding Users](#adding-users)
- [Configuring Environment Variables](#configuring-environment-variables)
- [Advanced - Connecting to an Existing Single Sign-On Service](#advanced---connecting-to-an-existing-single-sign-on-service)
- [Advanced - Configuring Social Login](#advanced---configuring-social-login)

## Creating an Auth0 Application

To begin, register and log in to [Auth0][auth0-client-page]. Then, navigate to the **_Applications_** section in the left sidebar to access the application management interface. Click on **_Create Application_** in the top right corner to initiate the application creation process.

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/1b405347-f4c3-4c55-82f6-47116f2210d0)

Next, fill in the desired application name to be displayed to organization users. You can choose any application type, then click on **_Create_**.

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/75c92f85-3ad3-4473-a9c6-e667e28d428d)

Once the application is successfully created, click on the respective application to access its details page. Switch to the **_Settings_** tab to view the corresponding configuration information.

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/a1ed996b-95ef-4b7d-a50d-b4666eccfecb)

On the application configuration page, you also need to configure the **_Allowed Callback URLs_** to be `http(s)://<your-domain>/api/auth/callback/auth0`

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/575f46aa-f485-49bd-8b90-dbb1ce1a5c1b)

> \[!NOTE]
>
> You can fill in or modify the Allowed Callback URLs after deployment, but make sure the URLs are consistent with the deployed URLs!

## Adding Users

Navigate to the **_Users Management_** section in the left sidebar to access the user management interface. You can create new users for your organization to log in to LobeChat.

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/3b8127ab-dc4f-4ff9-a4cb-dec3ef0295cc)

## Configuring Environment Variables

When deploying LobeChat, you need to configure the following environment variables:

| Environment Variable  | Required | Description                                                                                                                         | Default Value | Example                                                            |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `ENABLE_OAUTH_SSO`    | Yes      | Enable single sign-on (SSO) for LobeChat. Set this value to `1` to enable single sign-on.                                           | -             | `1`                                                                |
| `NEXTAUTH_SECRET`     | Yes      | The key used to encrypt the session token in Auth.js. You can generate a key using the following command: `openssl rand -base64 32` | -             | `Tfhi2t2pelSMEA8eaV61KaqPNEndFFdMIxDaJnS1CUI=`                     |
| `AUTH0_CLIENT_ID`     | Yes      | Client ID of the Auth0 application                                                                                                  | -             | `evCnOJP1UX8FMnXR9Xkj5t0NyFn5p70P`                                 |
| `AUTH0_CLIENT_SECRET` | Yes      | Client Secret of the Auth0 application                                                                                              | -             | `wnX7UbZg85ZUzF6ioxPLnJVEQa1Elbs7aqBUSF16xleBS5AdkVfASS49-fQIC8Rm` |
| `AUTH0_ISSUER`        | Yes      | Domain of the Auth0 application                                                                                                     | -             | `https://example.auth0.com`                                        |
| `ACCESS_CODE`         | Yes      | Add a password to access this service. You can set a long random password to "disable" accessed by the code                         | -             | `awCT74` or `e3@09!` or `code1,code2,code3`                        |

> \[!NOTE]
>
> After successful deployment, users will be able to authenticate and use LobeChat using the users configured in Auth0.

## Advanced - Connecting to an Existing Single Sign-On Service

If your enterprise or organization already has an existing unified identity verification infrastructure, you can connect to an existing single sign-on service in **_Applications -> SSO Integrations_**.

Auth0 supports single sign-on services such as Azure Active Directory, Slack, Google Workspace, Office 365, and Zoom. For a detailed list of supported services, refer to [this page][auth0-sso-integrations].

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/32650f4f-d0b0-4843-b26d-d35bad11d8a3)

## Advanced - Configuring Social Login

If your enterprise or organization needs to support external personnel login, you can configure social login services in **_Authentication -> Social_**.

![](https://github.com/CloudPassenger/lobe-chat/assets/30863298/7b6f6a6c-2686-49d8-9dbd-0516053f1efa)

> \[!NOTE]
>
> Configuring social login services will allow anyone to authenticate by default, which may lead to abuse of LobeChat by external personnel. If you need to restrict login personnel, be sure to configure a blocking policy.
>
> After enabling social login options, refer to [this article][auth0-login-actions-manual] to create an Action to set the deny/allow list.

[auth0-client-page]: https://manage.auth0.com/dashboard
[auth0-login-actions-manual]: https://auth0.com/blog/permit-or-deny-login-requests-using-auth0-actions/
[auth0-sso-integrations]: https://marketplace.auth0.com/features/sso-integrations
