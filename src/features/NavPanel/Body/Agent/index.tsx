'use client';

import { AccordionItem, Text } from '@lobehub/ui';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import CreateButton from './CreateButton';
import List from './List';
import { AgentModalProvider } from './ModalProvider';

interface AgentProps {
  itemKey: string;
}

const Agent = memo<AgentProps>(({ itemKey }) => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const content = (
    <Flexbox gap={1} paddingBlock={1}>
      <List />
    </Flexbox>
  );

  if (!expand) return <AgentModalProvider>{content}</AgentModalProvider>;

  return (
    <AgentModalProvider>
      <AccordionItem
        action={<CreateButton />}
        itemKey={itemKey}
        paddingBlock={4}
        paddingInline={'8px 4px'}
        title={
          <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
            {'助手'}
          </Text>
        }
      >
        {content}
      </AccordionItem>
    </AgentModalProvider>
  );
});

export default Agent;
