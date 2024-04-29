import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { serverFeatureFlags } from '@/config/server/featureFlags';

export default ({ children }: PropsWithChildren) => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;

  if (!enableWebrtc) return notFound();

  return children;
};
