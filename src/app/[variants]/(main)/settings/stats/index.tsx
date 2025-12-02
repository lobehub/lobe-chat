'use client';

import { memo } from 'react';

import Client from './Client';

const StatsSettings = memo<{ mobile?: boolean }>(({ mobile }) => {
  return <Client mobile={mobile} />;
});

export default StatsSettings;
