'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import HeaderContent from '@/app/(main)/chat/settings/features/HeaderContent';
import Menu from '@/components/Menu';
import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ChatSettingsTabs } from '@/store/global/initialState';

import { useCategory } from './useCategory';

const CategoryContent = memo(() => {
  const cateItems = useCategory();
  const router = useQueryRoute();
  const { tab = ChatSettingsTabs.Meta } = useQuery();

  return (
    <>
      <Menu
        items={cateItems}
        onClick={({ key }) => {
          router.replace('/chat/settings/modal', { query: { tab: key } });
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
