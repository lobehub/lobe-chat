import type { Provider } from '@auth/core/providers';

import { auth0 } from './auth0';
import { authelia } from './authelia';
import { authentik } from './authentik';
import { azureAd } from './azure-ad';
import { bypass } from './bypass';
import { casdoor } from './casdoor';
import { cloudflareZeroTrust } from './cloudflare-zero-trust';
import { cognito } from './cognito';
import { genericOidc } from './generic-oidc';
import { github } from './github';
import { google } from './google';
import { keycloak } from './keycloak';
import { logto } from './logto';
import { microsoftEntraId } from './microsoft-entra-id';
import { wechat } from './wechat';
import { zitadel } from './zitadel';

function createSSOProviders() {
  const providers: Record<string, Provider> = {
    auth0,
    authelia,
    authentik,
    azureAd,
    casdoor,
    'cloudflare-zero-trust': cloudflareZeroTrust,
    cognito,
    'generic-oidc': genericOidc,
    github,
    google,
    keycloak,
    logto,
    'microsoft-entra-id': microsoftEntraId,
    wechat,
    zitadel,
  };

  if (process.env.NODE_ENV === 'development') {
    providers.bypass = bypass;
  }

  return providers;
}

export const ssoProviders = createSSOProviders();
