import { notFound } from 'next/navigation';

import { oidcEnv } from '@/envs/oidc';

import Client from './Client';

const DesktopCallbackPage = async () => {
  if (!oidcEnv.ENABLE_OIDC) return notFound();

  return <Client />;
};

export default DesktopCallbackPage;
