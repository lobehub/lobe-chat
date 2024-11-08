import { PropsWithChildren } from 'react';

import { authEnv } from '@/config/auth';

import Clerk from './Clerk';
import NextAuth from './NextAuth';
import NoAuth from './NoAuth';

const AuthProvider = ({ children }: PropsWithChildren) => {
  if (authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH) return <Clerk>{children}</Clerk>;

  if (authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH) return <NextAuth>{children}</NextAuth>;

  return <NoAuth>{children}</NoAuth>;
};

export default AuthProvider;
