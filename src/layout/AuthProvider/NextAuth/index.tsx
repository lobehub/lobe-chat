import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

import { API_ENDPOINTS } from '@/services/_url';

const NextAuth = ({ children }: PropsWithChildren) => {
  return <SessionProvider basePath={API_ENDPOINTS.oauth}>{children}</SessionProvider>;
};

export default NextAuth;
