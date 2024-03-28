import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

import { getServerConfig } from '@/config/server';
import { API_ENDPOINTS } from '@/services/_url';

const { ENABLE_OAUTH_SSO = false } = getServerConfig();

const AuthProvider = ({ children }: PropsWithChildren) =>
  ENABLE_OAUTH_SSO ? (
    <SessionProvider basePath={API_ENDPOINTS.oauth}>{children}</SessionProvider>
  ) : (
    children
  );

export default AuthProvider;
