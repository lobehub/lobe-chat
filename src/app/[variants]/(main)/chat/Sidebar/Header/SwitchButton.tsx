import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { ChevronsUpDownIcon } from 'lucide-react';
import React, { memo } from 'react';

import SwitchContent from './SwitchContent';

const SwitchButton = memo(() => {
  return (
    <Popover
      arrow={false}
      content={<SwitchContent />}
      placement={'bottom'}
      styles={{
        body: {
          padding: 0,
        },
      }}
      trigger={['click']}
    >
      <ActionIcon
        icon={ChevronsUpDownIcon}
        size={{
          blockSize: 32,
          size: 16,
        }}
        style={{
          width: 24,
        }}
      />
    </Popover>
  );
});

export default SwitchButton;
