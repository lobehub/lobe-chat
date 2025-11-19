import { AccordionItem, Icon, Text } from '@lobehub/ui';
import { ListMinusIcon } from 'lucide-react';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SessionList from '@/features/NavPanel/Body/Agent/List/List';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { CustomSessionGroup } from '@/types/session';

import Actions from './Actions';

interface GroupItemProps extends CustomSessionGroup {
  setActiveGroupId: (id: string) => void;
  setConfigGroupModalOpen: (open: boolean) => void;
  setRenameGroupModalOpen: (open: boolean) => void;
}

const GroupItem = memo<GroupItemProps>(
  ({ children, id, name, setActiveGroupId, setRenameGroupModalOpen, setConfigGroupModalOpen }) => {
    const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);

    const content = (
      <SessionList
        dataSource={children}
        itemStyle={
          expand
            ? {
                paddingLeft: 16,
              }
            : {}
        }
      />
    );

    if (!expand) return content;

    return (
      <AccordionItem
        action={
          <Actions
            id={id}
            isCustomGroup
            onOpenChange={(isOpen) => {
              if (isOpen) setActiveGroupId(id);
            }}
            openConfigModal={() => setConfigGroupModalOpen(true)}
            openRenameModal={() => setRenameGroupModalOpen(true)}
          />
        }
        itemKey={id}
        key={id}
        paddingBlock={4}
        paddingInline={'8px 4px'}
        title={
          <Flexbox align="center" gap={4} horizontal style={{ overflow: 'hidden' }}>
            <Icon icon={ListMinusIcon} style={{ opacity: 0.5 }} />
            <Text ellipsis fontSize={12} style={{ flex: 1 }} type={'secondary'} weight={500}>
              {name}
            </Text>
          </Flexbox>
        }
      >
        {content}
      </AccordionItem>
    );
  },
);

export default GroupItem;
