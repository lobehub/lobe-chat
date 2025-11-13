'use client';

import { memo } from 'react';

import StatsClient from './Client';

const MobileProfileStatsPage = memo(() => {
  const mobile = true;
  return <StatsClient mobile={mobile} />;
});

MobileProfileStatsPage.displayName = 'MobileProfileStatsPage';


const DesktopProfileStatsPage = memo(() => {
  const mobile = false;
  return <StatsClient mobile={mobile} />;
});

export { DesktopProfileStatsPage,MobileProfileStatsPage };
