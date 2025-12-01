'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { Cpu } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AvailableModelsState, ListAvailableModelsParams } from '../../type';

const { Text } = Typography;

const AvailableModels = memo<BuiltinRenderProps<ListAvailableModelsParams, AvailableModelsState>>(
  ({ pluginState }) => {
    if (!pluginState) return null;

    const { models } = pluginState;

    if (models.length === 0) {
      return <Text type={'secondary'}>No models available</Text>;
    }

    // Group models by provider
    const groupedModels = models.reduce(
      (acc, model) => {
        const provider = model.provider || 'Other';
        if (!acc[provider]) {
          acc[provider] = [];
        }
        acc[provider].push(model);
        return acc;
      },
      {} as Record<string, typeof models>,
    );

    return (
      <Flexbox gap={16}>
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <Flexbox gap={8} key={provider}>
            <Text strong style={{ textTransform: 'capitalize' }}>
              {provider} ({providerModels.length})
            </Text>
            <Flexbox gap={8}>
              {providerModels.map((model) => (
                <Flexbox
                  align={'center'}
                  gap={8}
                  horizontal
                  key={model.id}
                  style={{
                    background: 'var(--lobe-color-fill-tertiary)',
                    borderRadius: 6,
                    padding: '8px 12px',
                  }}
                >
                  <Icon icon={Cpu} />
                  <Flexbox gap={2}>
                    <Text strong>{model.name}</Text>
                    <Text style={{ fontSize: 11 }} type={'secondary'}>
                      {model.id}
                    </Text>
                  </Flexbox>
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        ))}
      </Flexbox>
    );
  },
);

export default AvailableModels;
