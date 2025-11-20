'use client';

import { AccordionItem, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Actions from './Actions';
import List from './List';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motionEaseInOut};
  `,
  hide: css`
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
  return (
    <AccordionItem
      action={<Actions />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {t('navPanel.repo', { defaultValue: '仓库' })}
        </Text>
      }
    >
      <List expand={expand} />
    </AccordionItem>
  );
});

export default Repo;
