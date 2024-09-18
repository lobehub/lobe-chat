import Auth0 from './auth0';
import Authelia from './authelia';
import Authentik from './authentik';
import AzureAD from './azure-ad';
import CloudflareZeroTrust from './cloudflare-zero-trust';
import GenericOIDC from './generic-oidc';
import Github from './github';
import Logto from './logto';
import Zitadel from './zitadel';

export const ssoProviders = [Auth0, Authentik, AzureAD, GenericOIDC, Github, Zitadel, Authelia, Logto, CloudflareZeroTrust];
