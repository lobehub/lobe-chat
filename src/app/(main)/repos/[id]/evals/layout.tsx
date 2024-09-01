import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/featureFlags';

export default ({ children }: PropsWithChildren) => {
  const enableRAGEval = serverFeatureFlags().enableRAGEval;

  if (!enableRAGEval) return notFound();

  return children;
};
