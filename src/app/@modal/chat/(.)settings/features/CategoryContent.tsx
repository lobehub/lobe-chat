'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import HeaderContent from '@/app/(main)/chat/settings/features/HeaderContent';
import Menu from '@/components/Menu';

import { SettingsTabs, useCategory } from './useCategory';

const CategoryContent = memo(() => {
  const rawQuery = useSearchParams();
  const cateItems = useCategory();
  const router = useRouter();

  const { tab = SettingsTabs.Meta, ...rest } = qs.parse(rawQuery.toString());

  return (
    <>
      <Menu
        items={cateItems}
        onClick={({ key }) => {
          const path = qs.stringifyUrl({
            query: { ...rest, tab: key },
            url: '/chat/settings',
          });
          router.replace(path);
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
