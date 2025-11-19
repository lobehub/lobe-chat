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
  openConfigGroupModal: () => void;
  openRenameGroupModal: (groupId: string) => void;
}

const GroupItem = memo<GroupItemProps>(
  ({ children, id, name, openRenameGroupModal, openConfigGroupModal }) => {
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
            openConfigModal={openConfigGroupModal}
            openRenameModal={() => openRenameGroupModal(id)}
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
