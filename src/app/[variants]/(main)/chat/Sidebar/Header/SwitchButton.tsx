import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { ChevronsUpDownIcon } from 'lucide-react';
import { memo } from 'react';

const SwitchButton = memo(() => {
  return (
    <Popover content={'111'} trigger={['click']}>
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
