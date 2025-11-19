import { Accordion } from '@lobehub/ui';
import React, { memo, useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { CustomSessionGroup } from '@/types/session';

import Item from './Item';

interface GroupProps {
  dataSource: CustomSessionGroup[];
}

const Group = memo<GroupProps>(({ dataSource }) => {
  const [sessionGroupKeys, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.sessionGroupKeys(s),
    s.updateSystemStatus,
  ]);

  const list = useMemo(
    () => dataSource.map((item) => <Item {...item} key={item.id} />),
    [dataSource],
  );

  return (
    <Accordion
      expandedKeys={sessionGroupKeys}
      onExpandedChange={(keys) => updateSystemStatus({ expandSessionGroupKeys: keys as any })}
    >
      {list}
    </Accordion>
  );
});

export default Group;
