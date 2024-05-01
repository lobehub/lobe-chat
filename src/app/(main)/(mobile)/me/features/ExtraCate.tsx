'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Cell from '@/components/Cell';
import Divider from '@/components/Cell/Divider';

import { useExtraCate } from './useExtraCate';

const ExtraCate = memo(() => {
  const theme = useTheme();
  const mainItems = useExtraCate();

  return (
    <Flexbox style={{ background: theme.colorBgContainer }} width={'100%'}>
      {mainItems?.map(({ key, icon, label, type, onClick }: any, index) => {
        if (type === 'divider') return <Divider key={index} />;
        return <Cell icon={icon} key={key} label={label} onClick={onClick} />;
      })}
    </Flexbox>
  );
});

export default ExtraCate;
