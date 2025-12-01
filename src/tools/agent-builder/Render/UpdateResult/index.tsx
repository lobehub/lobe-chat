'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { UpdateResultState } from '../../type';

const { Text } = Typography;

const UpdateResult = memo<BuiltinRenderProps<Record<string, any>, UpdateResultState>>(
  ({ pluginState }) => {
    if (!pluginState) return null;

    const { success, message, updatedFields } = pluginState;

    return (
      <Flexbox gap={8}>
        <Flexbox align={'center'} gap={8} horizontal>
          <Icon color={success ? 'green' : 'red'} icon={success ? CheckCircle : XCircle} />
          <Text strong>{message}</Text>
        </Flexbox>
        {updatedFields && updatedFields.length > 0 && (
          <Flexbox gap={4} style={{ marginLeft: 24 }}>
            {updatedFields.map((field) => (
              <Text key={field} type={'secondary'}>
                • {field}
              </Text>
            ))}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default UpdateResult;
