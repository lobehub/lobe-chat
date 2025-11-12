'use client';

import { memo } from 'react';

import StatsClient from './Client';

const DesktopProfileStatsPage = memo(() => {
  const mobile = false;
  return <StatsClient mobile={mobile} />;
});

DesktopProfileStatsPage.displayName = 'DesktopProfileStatsPage';

export default DesktopProfileStatsPage;
