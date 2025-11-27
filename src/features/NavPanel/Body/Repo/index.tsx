'use client';

import { AccordionItem, Dropdown, Text } from '@lobehub/ui';
import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SkeletonList from '@/features/NavPanel/Body/SkeletonList';

import Actions from './Actions';
import List from './List';
import { useRepoActionsDropdownMenu } from './useDropdownMenu';

interface RepoProps {
  itemKey: string;
}

const Repo = memo<RepoProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  const dropdownMenu = useRepoActionsDropdownMenu();
  return (
    <AccordionItem
      action={<Actions />}
      headerWrapper={(header) => (
        <Dropdown
          menu={{
            items: dropdownMenu,
          }}
          trigger={['contextMenu']}
        >
          {header}
        </Dropdown>
      )}
      itemKey={itemKey}
      paddingBlock={6}
      paddingInline={'8px 6px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {t('navPanel.library', { defaultValue: '资料库' })}
        </Text>
      }
    >
      <Suspense fallback={<SkeletonList />}>
        <List />
      </Suspense>
    </AccordionItem>
  );
});

export default Repo;
