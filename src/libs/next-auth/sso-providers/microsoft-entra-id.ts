import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'microsoft-entra-id',
  provider: MicrosoftEntraID({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
    authorization: { params: { scope: 'openid email profile' } },
  }),
};

export default provider;
