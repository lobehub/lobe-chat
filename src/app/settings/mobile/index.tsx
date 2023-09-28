'use client';

import { Divider } from 'antd';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import AgentCardBanner from '@/app/market/features/AgentCard/AgentCardBanner';
import Header from '@/app/market/features/Header';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import AppMobileLayout from '@/layout/AppMobileLayout';
import { useGlobalStore, useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { AVATAR } from '@/store/session/slices/chat/actions/share';

import List from '../features/SideBar/List';
import ExtraList from './ExtraList';

const Setting = memo(() => {
  const avatar = useGlobalStore((s) => s.settings.avatar);
  useSwitchSideBarOnInit(SidebarTabKey.Setting);
  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <AgentCardBanner
        mask
        meta={{ avatar: avatar || AVATAR }}
        size={10}
        style={{ height: 180, marginBottom: 0 }}
      >
        <Center style={{ position: 'absolute', zIndex: 2 }}>
          <AvatarWithUpload size={100} />
        </Center>
      </AgentCardBanner>
      <div style={{ width: '100%' }}>
        <Divider style={{ margin: '0 0 8px' }} />
        <List />
        <Divider style={{ margin: '8px 0' }} />
        <ExtraList />
      </div>
    </AppMobileLayout>
  );
});

export default Setting;
