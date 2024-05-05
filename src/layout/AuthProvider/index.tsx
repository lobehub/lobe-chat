import { PropsWithChildren } from 'react';

import { getClientConfig } from '@/config/client';
import { getServerConfig } from '@/config/server';

import Clerk from './Clerk';
import NextAuth from './NextAuth';

const { ENABLE_OAUTH_SSO = false } = getServerConfig();

const { ENABLED_CLERK } = getClientConfig();
const AuthProvider = ({ children }: PropsWithChildren) => {
  if (ENABLED_CLERK) return <Clerk>{children}</Clerk>;

  if (ENABLE_OAUTH_SSO) return <NextAuth>{children}</NextAuth>;

  return children;
};

export default AuthProvider;
