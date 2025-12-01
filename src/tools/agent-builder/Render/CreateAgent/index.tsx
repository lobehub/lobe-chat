'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CreateAgentParams, CreateAgentState } from '../../type';

const { Text, Title } = Typography;

const CreateAgent = memo<BuiltinRenderProps<CreateAgentParams, CreateAgentState>>(
  ({ args, pluginState }) => {
    if (!pluginState) return null;

    const { success, title, agentId } = pluginState;

    if (!success) {
      return (
        <Flexbox align={'center'} gap={8} horizontal>
          <Icon color={'red'} icon={XCircle} />
          <Text type={'danger'}>Failed to create agent: {args?.title}</Text>
        </Flexbox>
      );
    }

    return (
      <Flexbox gap={12}>
        <Flexbox align={'center'} gap={8} horizontal>
          <Icon color={'green'} icon={CheckCircle} />
          <Title level={5} style={{ margin: 0 }}>
            Agent created successfully!
          </Title>
        </Flexbox>
        <Flexbox
          align={'center'}
          gap={12}
          horizontal
          style={{
            background: 'var(--lobe-color-fill-tertiary)',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <Icon icon={Sparkles} />
          <Flexbox gap={4}>
            <Text strong>{title}</Text>
            <Text style={{ fontSize: 12 }} type={'secondary'}>
              ID: {agentId}
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default CreateAgent;
