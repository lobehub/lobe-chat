import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Menu from '@/components/Menu';

import UserInfo from '../UserInfo';
import LangButton from './LangButton';
import ThemeButton from './ThemeButton';
import { useMenu } from './useMenu';

const PopoverContent = memo<{ closePopover: () => void }>(({ closePopover }) => {
  const { mainItems } = useMenu();

  return (
    <Flexbox gap={2} style={{ minWidth: 300 }}>
      <UserInfo />
      <Menu items={mainItems} onClick={closePopover} />
      <Flexbox
        align={'center'}
        horizontal
        justify={'space-between'}
        style={{ padding: '6px 6px 6px 16px' }}
      >
        <BrandWatermark />
        <Flexbox align={'center'} flex={'none'} gap={6} horizontal>
          <LangButton />
          <ThemeButton />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default PopoverContent;
