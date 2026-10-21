'use client';

import { DEFAULT_AVATAR } from '@lobechat/const';
import type { AgentGroupMember, BuiltinRenderProps } from '@lobechat/types';
import { Accordion, Avatar, Block, Flexbox, Markdown, Text, useTheme } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

import type { ExecuteTasksParams } from '../../../types';

const styles = stylex.create({
  // Reaches the Accordion action slot through `classNames.action`, replacing the old
  // `.accordion-action` descendant rule. Its `!important` is gone: StyleX outranks the
  // slot's own classes and `alwaysShowAction` already keeps it visible.
  action: { marginInlineEnd: '8px', opacity: 1 },
  assignee: {
    display: 'flex',
    flexShrink: 0,
    gap: '6px',
    alignItems: 'center',
    fontSize: '12px',
    color: cssVar.colorTextSecondary,
  },
  index: { flexShrink: 0, fontSize: '12px', color: cssVar.colorTextQuaternary },
  instruction: { fontSize: '13px', lineHeight: 1.6, color: cssVar.colorTextSecondary },
  resultBox: { overflow: 'hidden' },
  resultLabel: { paddingInline: '4px', fontSize: '12px', color: cssVar.colorTextTertiary },
  taskTitle: {
    overflow: 'hidden',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

/**
 * ExecuteTasks Render component for Group Management tool
 * Accordion-style task list with expandable instruction and assignee on the right
 */
const ExecuteTasksRender = memo<BuiltinRenderProps<ExecuteTasksParams, unknown, string>>(
  ({ args, content }) => {
    const { t } = useTranslation('tool');
    const theme = useTheme();
    const { tasks } = args || {};
    const resultContent = typeof content === 'string' ? content.trim() : '';

    // Get active group ID and agents from store
    const activeGroupId = useAgentGroupStore(agentGroupSelectors.activeGroupId);
    const groupAgents = useAgentGroupStore((s) =>
      activeGroupId ? agentGroupSelectors.getGroupAgents(activeGroupId)(s) : [],
    );

    // Get agent details for each task
    const tasksWithAgents = useMemo(() => {
      if (!tasks?.length) return [];
      return tasks.map((task) => ({
        ...task,
        agent: groupAgents.find((agent) => agent.id === task.agentId) as
          AgentGroupMember | undefined,
      }));
    }, [tasks, groupAgents]);

    if (!tasksWithAgents.length && !resultContent) return null;

    return (
      <Flexbox gap={12}>
        {!!tasksWithAgents.length && (
          <Accordion
            classNames={{ action: stylex.props(styles.action).className }}
            defaultValue={[]}
            gap={0}
            variant={'borderless'}
            items={tasksWithAgents.map((task, index) => ({
              action: (
                <div {...stylex.props(styles.assignee)}>
                  <Avatar
                    avatar={task.agent?.avatar || DEFAULT_AVATAR}
                    background={task.agent?.backgroundColor || theme.colorBgContainer}
                    shape={'circle'}
                    size={20}
                  />
                  <span>{task.agent?.title}</span>
                </div>
              ),
              alwaysShowAction: true,
              children: task.instruction && (
                <Block padding={12} style={{ marginTop: 8 }} variant={'filled'}>
                  <Text className={stylex.props(styles.instruction).className}>
                    {task.instruction}
                  </Text>
                </Block>
              ),
              key: task.agentId || String(index),
              title: (
                <Flexbox horizontal align={'center'} gap={8} style={{ minWidth: 0 }}>
                  <span {...stylex.props(styles.index)}>{index + 1}.</span>
                  <Text className={stylex.props(styles.taskTitle).className} weight={500}>
                    {task.title || 'Task'}
                  </Text>
                </Flexbox>
              ),
            }))}
          />
        )}

        {resultContent && (
          <Flexbox gap={4}>
            <Text className={stylex.props(styles.resultLabel).className}>
              {t('agentGroupManagement.executeTasks.results')}
            </Text>
            <Block
              className={stylex.props(styles.resultBox).className}
              padding={12}
              variant={'filled'}
            >
              <Markdown style={{ maxHeight: 320, overflow: 'auto' }} variant={'chat'}>
                {resultContent}
              </Markdown>
            </Block>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

ExecuteTasksRender.displayName = 'ExecuteTasksRender';

export default ExecuteTasksRender;
