import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { oidcEnv } from '@/envs/oidc';

const Layout = ({ children }: PropsWithChildren) => {
  if (!oidcEnv.ENABLE_OIDC) return notFound();

  return children;
};

export default Layout;
