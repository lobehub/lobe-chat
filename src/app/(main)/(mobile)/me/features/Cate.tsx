'use client';

import { useTheme } from 'antd-style';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useCategory } from '@/app/(main)/settings//hooks/useCategory';
import Cell from '@/components/Cell';
import Divider from '@/components/Cell/Divider';

const SettingCate = memo(() => {
  const theme = useTheme();
  const settingItems = useCategory({ mobile: true });
  const router = useRouter();

  return (
    <Flexbox style={{ background: theme.colorBgContainer }} width={'100%'}>
      {settingItems?.map(({ key, icon, label, type }: any, index) => {
        if (type === 'divider') return <Divider key={index} />;
        return (
          <Cell
            icon={icon}
            key={key}
            label={label}
            onClick={() => router.replace(urlJoin('/settings', key))}
          />
        );
      })}
    </Flexbox>
  );
});

export default SettingCate;
