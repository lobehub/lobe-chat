'use client';

import { memo } from 'react';

import { Artifacts } from './Artifacts';
import { FilePreview } from './FilePreview';
import { GroupThread } from './GroupThread';
import { HomeBody, HomeTitle } from './Home';
import { MessageDetail } from './MessageDetail';
import { Plugins } from './Plugins';
import { Thread } from './Thread';
import Header from './components/Header';
import { PortalImpl } from './type';

// Keep GroupThread before Thread so group DM threads take precedence when enabled
const items: PortalImpl[] = [GroupThread, Thread, MessageDetail, Artifacts, Plugins, FilePreview];

export const PortalTitle = memo(() => {
  const enabledList: boolean[] = [];

  for (const item of items) {
    const enabled = item.useEnable();
    enabledList.push(enabled);
  }

  for (const [i, element] of enabledList.entries()) {
    const Title = items[i].Title;
    if (element) {
      return <Title />;
    }
  }

  return <HomeTitle />;
});

export const PortalHeader = memo(() => {
  const enabledList: boolean[] = [];

  for (const item of items) {
    const enabled = item.useEnable();
    enabledList.push(enabled);
  }

  for (const [i, element] of enabledList.entries()) {
    const Header = items[i].Header;
    if (element && Header) {
      return <Header />;
    }
  }

  return <Header title={<PortalTitle />} />;
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
