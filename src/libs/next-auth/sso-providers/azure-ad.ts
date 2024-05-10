import AzureAD from 'next-auth/providers/azure-ad';

import { authEnv } from '@/config/auth';

const provider = {
  id: 'azure-ad',
  provider: AzureAD({
    // Specify auth scope, at least include 'openid email'
    // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.AZURE_AD_CLIENT_ID,
    clientSecret: authEnv.AZURE_AD_CLIENT_SECRET,
    tenantId: authEnv.AZURE_AD_TENANT_ID,
  }),
};

export default provider;
