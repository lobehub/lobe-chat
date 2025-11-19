import { Accordion } from '@lobehub/ui';
import React, { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { CustomSessionGroup } from '@/types/session';

import Item from './Item';

interface GroupProps {
  dataSource: CustomSessionGroup[];
  openConfigGroupModal: () => void;
  openRenameGroupModal: (groupId: string) => void;
}

const Group = memo<GroupProps>(({ dataSource, openRenameGroupModal, openConfigGroupModal }) => {
  const [sessionGroupKeys, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.sessionGroupKeys(s),
    s.updateSystemStatus,
  ]);
  return (
    <Accordion
      expandedKeys={sessionGroupKeys}
      onExpandedChange={(keys) => updateSystemStatus({ expandSessionGroupKeys: keys as any })}
    >
      {dataSource.map((item) => (
        <Item
          {...item}
          key={item.id}
          openConfigGroupModal={openConfigGroupModal}
          openRenameGroupModal={openRenameGroupModal}
        />
      ))}
    </Accordion>
  );
});

export default Group;
