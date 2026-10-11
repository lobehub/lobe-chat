import urlJoin from 'url-join';

import { OIDC_DISCOVERY_PATH, OIDC_ISSUER_PATH, OIDC_ROUTES } from '@/libs/oidc-provider/routes';

export type IntegrationEndpointKey =
  'authorization' | 'deviceAuthorization' | 'discovery' | 'issuer' | 'token';

export interface IntegrationEndpoint {
  key: IntegrationEndpointKey;
  url: string;
}

/**
 * The URLs a developer configures in their OAuth / OIDC client, in the order
 * they need them. Each app type gets only the endpoints its flow uses: a web
 * app redirects users to the authorization endpoint, a CLI / device app starts
 * at the device authorization endpoint instead.
 */
export const getIntegrationEndpoints = (
  origin: string,
  applicationType?: string | null,
): IntegrationEndpoint[] => {
  const url = (path: string) => urlJoin(origin, path);
  const isWeb = applicationType === 'web';

  return [
    { key: 'issuer', url: url(OIDC_ISSUER_PATH) },
    { key: 'discovery', url: url(OIDC_DISCOVERY_PATH) },
    isWeb
      ? { key: 'authorization', url: url(OIDC_ROUTES.authorization) }
      : { key: 'deviceAuthorization', url: url(OIDC_ROUTES.device_authorization) },
    { key: 'token', url: url(OIDC_ROUTES.token) },
  ];
};
