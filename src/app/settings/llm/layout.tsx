import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/server/featureFlags';

export default ({ children }: PropsWithChildren) => {
  const hideLLM = serverFeatureFlags().hideLLM;
  if (hideLLM) return notFound();

  return children;
};
