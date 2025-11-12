'use client';

import { memo } from 'react';

import StatsClient from './Client';

const MobileProfileStatsPage = memo(() => {
  const mobile = true;
  return <StatsClient mobile={mobile} />;
});

MobileProfileStatsPage.displayName = 'MobileProfileStatsPage';

export default MobileProfileStatsPage;
