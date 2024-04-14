import { getAnalyticsConfig } from './analytics';
import { getAppConfig } from './app';
import { getAuthConfig } from './auth';
import { getProviderConfig } from './provider';

export const getServerConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  const provider = getProviderConfig();
  const app = getAppConfig();
  const auth = getAuthConfig();
  const analytics = getAnalyticsConfig();

  return { ...provider, ...app, ...analytics, ...auth };
};
