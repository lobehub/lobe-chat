import { authEnv } from '@/config/auth';

function getTenantId() {
  return (
    process.env.MICROSOFT_ENTRA_ID_TENANT_ID ??
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
    // https://private-user-images.githubusercontent.com/32095327/365451040-6d255a9d-2c70-4e79-bf0b-da93c34defd6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzA1MzE5NzMsIm5iZiI6MTczMDUzMTY3MywicGF0aCI6Ii8zMjA5NTMyNy8zNjU0NTEwNDAtNmQyNTVhOWQtMmM3MC00ZTc5LWJmMGItZGE5M2MzNGRlZmQ2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDExMDIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQxMTAyVDA3MTQzM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTA0NWJkMGZlYmMyYWRjZDMwNmYxZTMzMGQ1MjRlOTM3OGY0ZWZhODgyY2UyZGZmN2I5YWM4OTc5N2I4NDA2N2YmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.N9obnu8EL-lvpIMNtpjnkFzO02DsdHFs1-vBehHguOU
    return `https://login.microsoftonline.com/${tenantId}/v2.0`;
  } else {
    return undefined;
  }
}

export { getIssuer as getMicrosoftEntraIdIssuer, getTenantId as getMicrosoftEntraIdTenantId };
