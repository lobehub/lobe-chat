import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/components/HeaderSpacing';

import Header from './Header';
import Settings from './Settings';
import SettingLayout from './layout';

const Setting = memo(() => {
  return (
    <SettingLayout>
      <Header />
      <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
        <HeaderSpacing />
        <Settings />
      </Flexbox>
    </SettingLayout>
  );
});

export default Setting;
