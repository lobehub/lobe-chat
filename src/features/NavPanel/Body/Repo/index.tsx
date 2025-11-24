'use client';

import { AccordionItem, Dropdown, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Actions from './Actions';
import List from './List';
import { useRepoActionsDropdownMenu } from './useDropdownMenu';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
}));

interface RepoProps {
  itemKey: string;
}

const Repo = memo<RepoProps>(({ itemKey }) => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const { t } = useTranslation('common');
  const { cx, styles } = useStyles();
  const dropdownMenu = useRepoActionsDropdownMenu();
  return (
    <AccordionItem
      action={<Actions />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
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
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {t('navPanel.repo', { defaultValue: '仓库' })}
        </Text>
      }
    >
      <List />
    </AccordionItem>
  );
});

export default Repo;
