'use client';

import { AccordionItem, Text } from '@lobehub/ui';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import CreateButton from './CreateButton';
import List from './List';

interface AgentProps {
  itemKey: string;
}

const Agent = memo<AgentProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);

  const listContent = useMemo(
    () => (
      <Flexbox gap={1} paddingBlock={1}>
        <List />
      </Flexbox>
    ),
    [],
  );

  if (!expand) return listContent;

  return (
    <AccordionItem
      action={<CreateButton />}
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {t('navPanel.agent', { defaultValue: '助手' })}
        </Text>
      }
    >
      <Flexbox gap={1} paddingBlock={1}>
        <List />
      </Flexbox>
    </AccordionItem>
  );
});

export default Agent;
