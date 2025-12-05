import { BuiltinRenderProps } from '@lobechat/types';
import { Tag } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { GetAvailableToolsParams, GetAvailableToolsState } from '../types';

const GetAvailableTools = memo<BuiltinRenderProps<GetAvailableToolsParams, GetAvailableToolsState>>(
  ({ pluginState }) => {
    const { tools } = pluginState || {};

    if (!tools || tools.length === 0) {
      return (
        <Flexbox style={{ color: 'var(--lobe-text-secondary)', fontSize: 13 }}>
          No available tools found.
        </Flexbox>
      );
    }

    const builtinTools = tools.filter((t) => t.type === 'builtin');
    const pluginTools = tools.filter((t) => t.type === 'plugin');

    return (
      <Flexbox gap={12} style={{ fontSize: 13 }}>
        {builtinTools.length > 0 && (
          <Flexbox gap={8}>
            <Flexbox align="center" gap={8} horizontal>
              <span style={{ fontWeight: 600 }}>Built-in Tools</span>
              <Tag color="blue" style={{ margin: 0 }}>
                {builtinTools.length}
              </Tag>
            </Flexbox>
            <Flexbox
              gap={4}
              style={{
                background: 'var(--lobe-fill-tertiary)',
                borderRadius: 6,
                maxHeight: 200,
                overflow: 'auto',
                padding: 8,
              }}
            >
              {builtinTools.map((tool) => (
                <Flexbox gap={2} key={tool.identifier}>
                  <Flexbox align="center" gap={8} horizontal>
                    <code style={{ color: 'var(--lobe-text)', fontSize: 12 }}>
                      {tool.identifier}
                    </code>
                    <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 11 }}>
                      {tool.title}
                    </span>
                  </Flexbox>
                  {tool.description && (
                    <span
                      style={{
                        color: 'var(--lobe-text-tertiary)',
                        fontSize: 11,
                        paddingLeft: 4,
                      }}
                    >
                      {tool.description}
                    </span>
                  )}
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        )}

        {pluginTools.length > 0 && (
          <Flexbox gap={8}>
            <Flexbox align="center" gap={8} horizontal>
              <span style={{ fontWeight: 600 }}>Installed Plugins</span>
              <Tag color="green" style={{ margin: 0 }}>
                {pluginTools.length}
              </Tag>
            </Flexbox>
            <Flexbox
              gap={4}
              style={{
                background: 'var(--lobe-fill-tertiary)',
                borderRadius: 6,
                maxHeight: 200,
                overflow: 'auto',
                padding: 8,
              }}
            >
              {pluginTools.map((tool) => (
                <Flexbox gap={2} key={tool.identifier}>
                  <Flexbox align="center" gap={8} horizontal>
                    <code style={{ color: 'var(--lobe-text)', fontSize: 12 }}>
                      {tool.identifier}
                    </code>
                    <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 11 }}>
                      {tool.title}
                    </span>
                  </Flexbox>
                  {tool.description && (
                    <span
                      style={{
                        color: 'var(--lobe-text-tertiary)',
                        fontSize: 11,
                        paddingLeft: 4,
                      }}
                    >
                      {tool.description}
                    </span>
                  )}
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default GetAvailableTools;
