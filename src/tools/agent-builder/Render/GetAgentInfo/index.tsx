'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Avatar, Icon, Tag } from '@lobehub/ui';
import { Collapse, Typography } from 'antd';
import { Bot, Brain, Settings, Wrench } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AgentInfoState, GetAgentInfoParams } from '../../type';

const { Text, Paragraph } = Typography;

const GetAgentInfo = memo<BuiltinRenderProps<GetAgentInfoParams, AgentInfoState>>(
  ({ pluginState }) => {
    if (!pluginState) return null;

    const { agent, enabledTools, knowledgeBases, params, chatConfig } = pluginState;

    if (!agent) {
      return <Text type={'secondary'}>No agent information available</Text>;
    }

    const collapseItems = [
      {
        children: (
          <Paragraph
            style={{
              background: 'var(--lobe-color-fill-tertiary)',
              borderRadius: 8,
              fontSize: 12,
              maxHeight: 200,
              overflow: 'auto',
              padding: 12,
              whiteSpace: 'pre-wrap',
            }}
          >
            {agent.systemRole || 'No system role defined'}
          </Paragraph>
        ),
        key: 'systemRole',
        label: (
          <Flexbox align={'center'} gap={8} horizontal>
            <Icon icon={Brain} size={'small'} />
            <Text>System Role</Text>
          </Flexbox>
        ),
      },
      {
        children: (
          <Flexbox gap={8}>
            <Flexbox gap={4} horizontal wrap={'wrap'}>
              {enabledTools.length > 0 ? (
                enabledTools.map((tool) => <Tag key={tool}>{tool}</Tag>)
              ) : (
                <Text type={'secondary'}>No tools enabled</Text>
              )}
            </Flexbox>
          </Flexbox>
        ),
        key: 'tools',
        label: (
          <Flexbox align={'center'} gap={8} horizontal>
            <Icon icon={Wrench} size={'small'} />
            <Text>Enabled Tools ({enabledTools.length})</Text>
          </Flexbox>
        ),
      },
      {
        children: (
          <Flexbox gap={4}>
            <Text>
              <Text type={'secondary'}>Model: </Text>
              {agent.model || 'Not set'}
            </Text>
            <Text>
              <Text type={'secondary'}>Provider: </Text>
              {agent.provider || 'Not set'}
            </Text>
            {params && (
              <>
                {params.temperature !== undefined && (
                  <Text>
                    <Text type={'secondary'}>Temperature: </Text>
                    {params.temperature}
                  </Text>
                )}
                {params.top_p !== undefined && (
                  <Text>
                    <Text type={'secondary'}>Top P: </Text>
                    {params.top_p}
                  </Text>
                )}
                {params.max_tokens !== undefined && (
                  <Text>
                    <Text type={'secondary'}>Max Tokens: </Text>
                    {params.max_tokens}
                  </Text>
                )}
              </>
            )}
          </Flexbox>
        ),
        key: 'model',
        label: (
          <Flexbox align={'center'} gap={8} horizontal>
            <Icon icon={Settings} size={'small'} />
            <Text>Model Configuration</Text>
          </Flexbox>
        ),
      },
    ];

    // Add knowledge bases section if there are any
    if (knowledgeBases.length > 0) {
      collapseItems.push({
        children: (
          <Flexbox gap={4} horizontal wrap={'wrap'}>
            {knowledgeBases.map((kb) => (
              <Tag key={kb.id}>{kb.name}</Tag>
            ))}
          </Flexbox>
        ),
        key: 'knowledgeBases',
        label: (
          <Flexbox align={'center'} gap={8} horizontal>
            <Icon icon={Brain} size={'small'} />
            <Text>Knowledge Bases ({knowledgeBases.length})</Text>
          </Flexbox>
        ),
      });
    }

    return (
      <Flexbox gap={16}>
        {/* Header with Avatar and Basic Info */}
        <Flexbox align={'center'} gap={12} horizontal>
          <Avatar avatar={agent.avatar || <Bot />} size={48} />
          <Flexbox gap={4}>
            <Text strong style={{ fontSize: 16 }}>
              {agent.title || 'Untitled Agent'}
            </Text>
            {agent.description && <Text type={'secondary'}>{agent.description}</Text>}
            {agent.tags && agent.tags.length > 0 && (
              <Flexbox gap={4} horizontal style={{ marginTop: 4 }}>
                {agent.tags.map((tag) => (
                  <Tag key={tag} style={{ fontSize: 10 }}>
                    {tag}
                  </Tag>
                ))}
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>

        {/* Collapsible Sections */}
        <Collapse
          bordered={false}
          defaultActiveKey={['tools']}
          items={collapseItems}
          size={'small'}
          style={{ background: 'transparent' }}
        />
      </Flexbox>
    );
  },
);

export default GetAgentInfo;
