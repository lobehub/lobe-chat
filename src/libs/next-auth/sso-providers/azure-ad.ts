import AzureAD from 'next-auth/providers/azure-ad';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'azure-ad',
  provider: AzureAD({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
    authorization: { params: { scope: 'openid email profile' } },
    clientId: authEnv.AZURE_AD_CLIENT_ID,
    clientSecret: authEnv.AZURE_AD_CLIENT_SECRET,
    tenantId: authEnv.AZURE_AD_TENANT_ID,
    // TODO(NextAuth): map unique user id to `providerAccountId` field
    // profile(profile) {
    //   return {
    //     email: profile.email,
    //     image: profile.picture,
    //     name: profile.name,
    //     providerAccountId: profile.user_id,
    //   };
    // },
  }),
};

export default provider;
