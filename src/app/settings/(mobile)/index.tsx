'use client';

import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { CURRENT_VERSION } from '@/const/version';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';

import SettingList from '../features/SettingList';
import AvatarBanner from './features/AvatarBanner';
import ExtraList from './features/ExtraList';

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
  const avatar = useGlobalStore(commonSelectors.userAvatar);
  const { styles } = useStyles();

  return (
    <Flexbox style={{ overflow: 'scroll' }}>
      <AvatarBanner avatar={avatar}>
        <Center style={{ marginTop: 32, position: 'absolute', zIndex: 2 }}>
          <AvatarWithUpload size={88} />
        </Center>
      </AvatarBanner>
      <div style={{ width: '100%' }}>
        <SettingList />
        <div className={styles.divider} />
        <ExtraList />
        <Center style={{ paddingInline: 64 }}>
          <Divider>
            <span className={styles.footer}>LobeChat v{CURRENT_VERSION}</span>
          </Divider>
        </Center>
      </div>
    </Flexbox>
  );
});

export default Setting;
