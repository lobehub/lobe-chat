import { authEnv } from '@/envs/auth';

function getTenantId() {
  return (
    process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ??
    process.env.AUTH_AZURE_AD_TENANT_ID ??
    authEnv.AZURE_AD_TENANT_ID
  );
}

function getIssuer() {
  const issuer = process.env.MICROSOFT_ENTRA_ID_ISSUER;
  if (issuer) {
    return issuer;
  }
  const tenantId = getTenantId();
  if (tenantId) {
    // refs: https://github.com/nextauthjs/next-auth/discussions/9154#discussioncomment-10583104
    return `https://login.microsoftonline.com/${tenantId}/v2.0`;
  } else {
    return undefined;
  }
}

export { getIssuer as getMicrosoftEntraIdIssuer, getTenantId as getMicrosoftEntraIdTenantId };
