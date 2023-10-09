'use client';

import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import pkg from '@/../package.json';
import AgentCardBanner from '@/app/market/features/AgentCard/AgentCardBanner';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useGlobalStore, useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { AVATAR } from '@/store/session/slices/chat/actions/share';

import List from '../../features/SideBar/List';
import ExtraList from '../features/ExtraList';
import Layout from './layout.mobile';

const useStyles = createStyles(({ css, token }) => ({
  divider: css`
    height: 6px;
    background: ${token.colorFillTertiary};
  `,
  footer: css`
    font-size: 12px;
    color: ${token.colorTextQuaternary};
  `,
}));

const Setting = memo(() => {
  useSwitchSideBarOnInit(SidebarTabKey.Setting);
  const avatar = useGlobalStore((s) => s.settings.avatar);
  const { styles } = useStyles();

  return (
    <Layout>
      <AgentCardBanner
        mask
        meta={{ avatar: avatar || AVATAR }}
        size={10}
        style={{ height: 172, marginBottom: 0 }}
      >
        <Center style={{ position: 'absolute', zIndex: 2 }}>
          <AvatarWithUpload size={88} />
        </Center>
      </AgentCardBanner>
      <div style={{ width: '100%' }}>
        <List />
        <div className={styles.divider} />
        <ExtraList />
        <Center style={{ paddingInline: 64 }}>
          <Divider>
            <span className={styles.footer}>LobeChat v{pkg.version}</span>
          </Divider>
        </Center>
      </div>
    </Layout>
  );
});

export default Setting;
