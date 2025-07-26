import Auth0 from './auth0';
import Authelia from './authelia';
import Authentik from './authentik';
import AzureAD from './azure-ad';
import Bypass from './bypass';
import Casdoor from './casdoor';
import CloudflareZeroTrust from './cloudflare-zero-trust';
import Cognito from './cognito';
import GenericOIDC from './generic-oidc';
import Github from './github';
import Google from './google';
import Keycloak from './keycloak';
import Logto from './logto';
import MicrosoftEntraID from './microsoft-entra-id';
import WeChat from './wechat';
import Zitadel from './zitadel';

const ssoProviders = [
  Auth0,
  Authentik,
  AzureAD,
  GenericOIDC,
  Github,
  Zitadel,
  Authelia,
  Logto,
  CloudflareZeroTrust,
  Casdoor,
  MicrosoftEntraID,
  WeChat,
  Keycloak,
  Google,
  Cognito,
  Bypass,
];

if (process.env.NODE_ENV === 'development') {
  ssoProviders.push(Bypass);
}

export { ssoProviders };
