'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Icon, Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { Check, Package, Puzzle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AvailableToolsState, ListAvailableToolsParams } from '../../type';

const { Text } = Typography;

const AvailableTools = memo<BuiltinRenderProps<ListAvailableToolsParams, AvailableToolsState>>(
  ({ pluginState }) => {
    if (!pluginState) return null;

    const { tools } = pluginState;

    if (tools.length === 0) {
      return <Text type={'secondary'}>No tools available</Text>;
    }

    const builtinTools = tools.filter((t) => t.category === 'builtin');
    const pluginTools = tools.filter((t) => t.category === 'plugin');

    return (
      <Flexbox gap={16}>
        {builtinTools.length > 0 && (
          <Flexbox gap={8}>
            <Flexbox align={'center'} gap={8} horizontal>
              <Icon icon={Package} size={'small'} />
              <Text strong>Built-in Tools ({builtinTools.length})</Text>
            </Flexbox>
            <Flexbox gap={8}>
              {builtinTools.map((tool) => (
                <Flexbox
                  align={'center'}
                  gap={8}
                  horizontal
                  key={tool.id}
                  style={{
                    background: 'var(--lobe-color-fill-tertiary)',
                    borderRadius: 6,
                    padding: '8px 12px',
                  }}
                >
                  <Flexbox flex={1} gap={2}>
                    <Flexbox align={'center'} gap={8} horizontal>
                      <Text strong>{tool.name}</Text>
                      {tool.enabled && (
                        <Tag color={'green'} style={{ fontSize: 10 }}>
                          <Icon icon={Check} /> Enabled
                        </Tag>
                      )}
                    </Flexbox>
                    {tool.description && (
                      <Text style={{ fontSize: 12 }} type={'secondary'}>
                        {tool.description}
                      </Text>
                    )}
                  </Flexbox>
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        )}

        {pluginTools.length > 0 && (
          <Flexbox gap={8}>
            <Flexbox align={'center'} gap={8} horizontal>
              <Icon icon={Puzzle} size={'small'} />
              <Text strong>Plugins ({pluginTools.length})</Text>
            </Flexbox>
            <Flexbox gap={8}>
              {pluginTools.map((tool) => (
                <Flexbox
                  align={'center'}
                  gap={8}
                  horizontal
                  key={tool.id}
                  style={{
                    background: 'var(--lobe-color-fill-tertiary)',
                    borderRadius: 6,
                    padding: '8px 12px',
                  }}
                >
                  <Flexbox flex={1} gap={2}>
                    <Flexbox align={'center'} gap={8} horizontal>
                      <Text strong>{tool.name}</Text>
                      {tool.enabled && (
                        <Tag color={'green'} style={{ fontSize: 10 }}>
                          <Icon icon={Check} /> Enabled
                        </Tag>
                      )}
                    </Flexbox>
                    {tool.description && (
                      <Text style={{ fontSize: 12 }} type={'secondary'}>
                        {tool.description}
                      </Text>
                    )}
                  </Flexbox>
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default AvailableTools;
