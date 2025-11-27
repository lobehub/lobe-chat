'use client';

import { memo } from 'react';

import Client from './Client';

const UsageSettings = memo<{ mobile?: boolean }>(({ mobile }) => {
  return <Client mobile={mobile} />;
});

export default UsageSettings;
