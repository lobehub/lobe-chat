# New Authentication Provider Guide

LobeChat uses [Auth.js v5](https://authjs.dev/) as the external authentication service. Auth.js is an open-source authentication library that provides a simple way to implement authentication and authorization features. This document will introduce how to use Auth.js to implement a new authentication provider.

### TOC

- [Add New Authentication Provider](#add-new-authentication-provider)
  - [Pre-requisites: Check the Official Provider List](#pre-requisites-check-the-official-provider-list)
  - [Step 1: Add Authenticator Core Code](#step-1-add-authenticator-core-code)
  - [Step 2: Update Server Configuration Code](#step-2-update-server-configuration-code)
  - [Step 3: Change Frontend Pages](#step-3-change-frontend-pages)
  - [Step 4: Configure the Environment Variables](#step-4-configure-the-environment-variables)

## Add New Authentication Provider

To add a new authentication provider in LobeChat (for example, adding Okta), you need to follow the steps below:

### Pre-requisites: Check the Official Provider List

First, you need to check the [Auth.js Provider List](https://authjs.dev/reference/core/providers) to see if your provider is already supported. If yes, you can directly use the SDK provided by Auth.js to implement the authentication feature.

Next, I will use [Okta](https://authjs.dev/reference/core/providers/okta) as an example to introduce how to add a new authentication provider.

### Step 1: Add Authenticator Core Code

Open the `src/app/api/auth/next-auth.ts` file and import `next-auth/providers/okta`.

```ts
import { NextAuth } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import Okta from 'next-auth/providers/okta';

// Import Okta provider
```

Add the predefined server configuration.

```ts
// Import server configuration
const { OKTA_CLIENT_ID, OKTA_CLIENT_SECRET, OKTA_ISSUER } = getServerConfig();

const nextAuth = NextAuth({
  providers: [
    // ... Other providers

    Okta({
      clientId: OKTA_CLIENT_ID,
      clientSecret: OKTA_CLIENT_SECRET,
      issuer: OKTA_ISSUER,
    }),
  ],
});
```

### Step 2: Update Server Configuration Code

Open the `src/config/server/app.ts` file and add Okta-related environment variables in the `getAppConfig` function.

```ts
export const getAppConfig = () => {
  // ... Other code

  return {
    // ... Other environment variables

    OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
    OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET || '',
    OKTA_ISSUER: process.env.OKTA_ISSUER || '',
  };
};
```

### Step 3: Change Frontend Pages

Modify the `signIn` function parameter in `src/Features/Conversation/Error/OAuthForm.tsx` and \`src/app/settings/common/Common.tsx

The default is `auth0`, which you can change to `okta` to switch to the Okta provider, or remove this parameter to support all added authentication services

This value is the id of the Auth.js provider, and you can read the source code of the corresponding `next-auth/providers` module to read the default ID.

### Step 4: Configure the Environment Variables

Add `OKTA_CLIENT_ID`、`OKTA_CLIENT_SECRET`、`OKTA_ISSUER` environment variables when you deploy.

Now, you can use Okta as your provider to implement the authentication feature in LobeChat.
