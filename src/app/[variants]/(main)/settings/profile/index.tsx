'use client';

import { memo } from 'react';

import Client from './Client';

const ProfileSettings = memo<{ mobile?: boolean }>(({ mobile }) => {
  return <Client mobile={mobile} />;
});

export default ProfileSettings;
