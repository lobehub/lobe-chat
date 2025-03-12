'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import HeaderContent from '@/app/[variants]/(main)/chat/settings/features/HeaderContent';
import Menu from '@/components/Menu';
import { ChatSettingsTabs } from '@/store/global/initialState';

import { useCategory } from './useCategory';

interface CategoryContentProps {
  setTab: (tab: ChatSettingsTabs) => void;
  tab: string;
}
const CategoryContent = memo<CategoryContentProps>(({ setTab, tab }) => {
  const cateItems = useCategory();

  return (
    <>
      <Menu
        items={cateItems}
        onClick={({ key }) => {
          setTab(key as ChatSettingsTabs);
        }}
        selectable
        selectedKeys={[tab as any]}
        variant={'compact'}
      />
      <Flexbox align={'center'} gap={8} paddingInline={8} width={'100%'}>
        <HeaderContent modal />
      </Flexbox>
    </>
  );
});

export default CategoryContent;
