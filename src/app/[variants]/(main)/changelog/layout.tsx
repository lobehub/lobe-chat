import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

import ServerLayout from '@/components/server/ServerLayout';
import { serverFeatureFlags } from '@/config/featureFlags';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const ChangelogLayoutInner = ServerLayout({ Desktop, Mobile });

ChangelogLayoutInner.displayName = 'ChangelogLayoutInner';

const ChangelogLayout = ({ children }: { children: ReactNode }) => {
  const flags = serverFeatureFlags();

  if (!flags.showChangelog) {
    notFound();
  }

  return <ChangelogLayoutInner>{children}</ChangelogLayoutInner>;
};

export default ChangelogLayout;
