import AzureAD from 'next-auth/providers/azure-ad';

import { getServerConfig } from '@/config/server';

const { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID } = getServerConfig();

const provider = {
  id: 'azure-ad',
  provider: AzureAD({
    // Specify auth scope, at least include 'openid email'
    // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
    authorization: { params: { scope: 'openid email profile' } },
    clientId: AZURE_AD_CLIENT_ID,
    clientSecret: AZURE_AD_CLIENT_SECRET,
    tenantId: AZURE_AD_TENANT_ID,
  }),
};

export default provider;
