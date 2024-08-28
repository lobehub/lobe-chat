'use client';

import { memo } from 'react';

import { Artifacts } from './Artifacts';
import { FilePreview } from './FilePreview';
import { HomeBody, HomeHeader } from './Home';

const items = [Artifacts, FilePreview];

export const PortalHeader = memo(() => {
  const enabledList: boolean[] = [];

  for (const item of items) {
    const enabled = item.useEnable();
    enabledList.push(enabled);
  }

  for (const [i, element] of enabledList.entries()) {
    const Header = items[i].Header;
    if (element) {
      return <Header />;
    }
  }

  return <HomeHeader />;
});

const PortalBody = memo(() => {
  const enabledList: boolean[] = [];

  for (const item of items) {
    const enabled = item.useEnable();
    enabledList.push(enabled);
  }

  for (const [i, element] of enabledList.entries()) {
    const Body = items[i].Body;
    if (element) {
      return <Body />;
    }
  }

  return <HomeBody />;
});

export default PortalBody;
