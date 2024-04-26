import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/server/featureFlags';

export default ({ children }: PropsWithChildren) => {
  const showLLM = serverFeatureFlags().showLLM;
  if (!showLLM) return notFound();

  return children;
};
