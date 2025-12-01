'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { CheckCircle, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { EnableToolParams, ToolConfigState } from '../../type';

const { Text } = Typography;

const ToolConfig = memo<BuiltinRenderProps<EnableToolParams, ToolConfigState>>(({ pluginState }) => {
  if (!pluginState) return null;

  const { success, toolName, enabled } = pluginState;

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <Icon
        color={success ? (enabled ? 'green' : 'orange') : 'red'}
        icon={success ? (enabled ? ToggleRight : ToggleLeft) : XCircle}
      />
      <Flexbox gap={2}>
        <Text strong>{toolName}</Text>
        <Text type={'secondary'}>
          {success
            ? enabled
              ? 'Tool enabled successfully'
              : 'Tool disabled successfully'
            : 'Failed to update tool configuration'}
        </Text>
      </Flexbox>
    </Flexbox>
  );
});

export default ToolConfig;
