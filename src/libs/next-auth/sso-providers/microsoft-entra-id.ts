import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

import { getMicrosoftEntraIdIssuer } from './microsoft-entra-id-helper';
import { CommonProviderConfig } from './sso.config';

export const microsoftEntraId = MicrosoftEntraID({
  ...CommonProviderConfig,
  // Specify auth scope, at least include 'openid email'
  // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
  authorization: { params: { scope: 'openid email profile' } },
  clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? process.env.AUTH_AZURE_AD_ID,
  clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? process.env.AUTH_AZURE_AD_SECRET,
  issuer: getMicrosoftEntraIdIssuer(),
});
