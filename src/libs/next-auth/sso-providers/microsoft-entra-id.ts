import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'microsoft-entra-id',
  provider: MicrosoftEntraID({
    ...CommonProviderConfig,
    // Specify auth scope, at least include 'openid email'
    // all scopes in Azure AD ref: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc#openid-connect-scopes
    authorization: { params: { scope: 'openid email profile' } },
    // TODO(NextAuth ENVs Migration): Remove once nextauth envs migration time end
    clientId: authEnv.MICROSOFT_ENTRA_ID_ID ?? process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    clientSecret: authEnv.MICROSOFT_ENTRA_ID_SECRET ?? process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    tenantId: authEnv.MICROSOFT_ENTRA_ID_TENANT_ID ?? process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
    // Remove end
    // TODO(NextAuth): map unique user id to `providerAccountId` field
    // profile(profile) {
    //   return {
    //     email: profile.email,
    //     image: profile.picture,
    //     name: profile.name,
    //     providerAccountId: profile.user_id,
    //     id: profile.user_id,
    //   };
    // },
  }),
};

export default provider;
