import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/featureFlags';
import { isServerMode } from '@/const/version';

export default ({ children }: PropsWithChildren) => {
  const enableKnowledgeBase = serverFeatureFlags().enableKnowledgeBase;

  if (!isServerMode || !enableKnowledgeBase) return notFound();

  return children;
};
