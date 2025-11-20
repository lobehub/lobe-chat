'use client';

import { AccordionItem, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

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
    pointer-events: none;
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
}));

interface AgentProps {
  itemKey: string;
}

const Agent = memo<AgentProps>(({ itemKey }) => {
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
          {t('navPanel.agent', { defaultValue: '助手' })}
        </Text>
      }
    >
      <Flexbox gap={4} paddingBlock={1}>
        <List />
      </Flexbox>
    </AccordionItem>
  );
});

export default Agent;
