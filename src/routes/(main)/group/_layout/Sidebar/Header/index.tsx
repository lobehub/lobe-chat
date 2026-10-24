'use client';

import { type PropsWithChildren } from 'react';

import ChannelNav from '@/features/Channels/Sidebar/ChannelNav';
import GroupSidebarTabs from '@/features/Channels/Sidebar/GroupSidebarTabs';
import { useGroupSidebarTab } from '@/features/Channels/Sidebar/useGroupSidebarTab';
import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import Agent from './Agent';
import Nav from './Nav';

const HeaderInfo = (_props: PropsWithChildren) => {
  const tab = useGroupSidebarTab();

  return (
    <>
      <SideBarHeaderLayout left={<Agent />} />
      <GroupSidebarTabs />
      {tab === 'channel' ? <ChannelNav /> : <Nav />}
    </>
  );
};

export default HeaderInfo;
