'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useCategory } from '@/app/(main)/settings//hooks/useCategory';
import Cell from '@/components/Cell';
import Divider from '@/components/Cell/Divider';
import redirectHard from '@/server/redirectHard';

const SettingCate = memo(() => {
  const theme = useTheme();
  const settingItems = useCategory({ mobile: true });

  return (
    <Flexbox style={{ background: theme.colorBgContainer }} width={'100%'}>
      {settingItems?.map(({ key, icon, label, type }: any, index) => {
        if (type === 'divider') return <Divider key={index} />;
        return (
          <Cell
            icon={icon}
            key={key}
            label={label}
            onClick={() => redirectHard(urlJoin('/settings', key))}
          />
        );
      })}
    </Flexbox>
  );
});

export default SettingCate;
