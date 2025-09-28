'use client';

import { Button, Text } from '@lobehub/ui';
import { LucideRefreshCw } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ChatItem from '@/components/ChatItem/ChatItem';
import { DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { ChatErrorType } from '@/types/fetch';
import { ChatMessage } from '@/types/message';

import TodoList, { TodoData } from './TodoList';

// Helper function to parse legacy markdown todo format
const parseMarkdownTodos = (content: string): TodoData => {
  const lines = content.split('\n');
  const todos: Array<{ content: string; finished: boolean }> = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match todo item pattern: - [x] or - [ ] followed by content
    const todoMatch = trimmed.match(/^-\s*\[([\sx])]\s*(.+)$/i);
    if (todoMatch) {
      const [, checkbox, todoContent] = todoMatch;
      const finished = checkbox.toLowerCase() === 'x';

      // Remove strikethrough formatting if present
      const content = todoContent.replace(/^~~(.+)~~$/, '$1');

      todos.push({
        content: content.trim(),
        finished,
      });
    }
  }

  return {
    timestamp: Date.now(),
    todos,
    type: 'supervisor_todo',
  };
};

export interface SupervisorMessageProps {
  message: ChatMessage;
}

const SupervisorMessage = memo<SupervisorMessageProps>(({ message }) => {
  const { t } = useTranslation('chat');
  const triggerSupervisorDecision = useChatStore((s) => s.internal_triggerSupervisorDecision);

  // Try to parse the message content as JSON for todo data
  let todoData: TodoData | null = null;
  let isTodoMessage = false;

  if (message.content && !message.error) {
    try {
      const parsed = JSON.parse(message.content);
      if (parsed.type === 'supervisor_todo' && Array.isArray(parsed.todos)) {
        todoData = parsed as TodoData;
        isTodoMessage = true;
      }
    } catch {
      // Not JSON or invalid format, check for legacy markdown format
      if (message.role === 'supervisor' && message.content?.startsWith('### Todo List')) {
        todoData = parseMarkdownTodos(message.content);
        isTodoMessage = true;
      }
    }
  }

  const errorText =
    message.error?.type === ChatErrorType.SupervisorDecisionFailed
      ? t('supervisor.decisionFailed', { ns: 'error' })
      : message.error?.message;

  // Retry action for supervisor decision failure
  const handleRetry = useCallback(() => {
    if (!message.groupId) return;
    triggerSupervisorDecision(message.groupId, undefined, true);
  }, [message.groupId, triggerSupervisorDecision]);

  const errorContentNode = errorText ? (
    <Flexbox
      gap={8}
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 8,
        padding: 12,
        width: '100%',
      }}
    >
      <div style={{ fontWeight: 600, lineHeight: 1.4 }}>
        {t('groupSidebar.members.orchestrator')}
      </div>
      <Text>{errorText}</Text>
      {message.role === 'supervisor' && message.groupId && (
        <Button icon={LucideRefreshCw} onClick={handleRetry} type={'primary'}>
          {t('retry', { ns: 'common' })}
        </Button>
      )}
    </Flexbox>
  ) : undefined;

  // Render todo message with dedicated component
  if (isTodoMessage && todoData) {
    return (
      <ChatItem
        avatar={{
          avatar: DEFAULT_SUPERVISOR_AVATAR,
          title: t('groupSidebar.members.orchestrator'),
        }}
        loading={false}
        placement="left"
        primary={false}
        renderMessage={() => <TodoList data={todoData} />}
        showTitle={true}
        time={message.updatedAt || message.createdAt}
        variant="bubble"
      />
    );
  }

  // Render regular supervisor message
  const renderErrorMessage = message.error ? () => errorContentNode : undefined;

  return (
    <ChatItem
      avatar={{
        avatar: DEFAULT_SUPERVISOR_AVATAR,
        title: t('groupSidebar.members.orchestrator'),
      }}
      loading={false}
      message={message.error ? undefined : message.content}
      placement="left"
      primary={false}
      renderMessage={renderErrorMessage}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant={isTodoMessage || message.error ? 'docs' : 'bubble'}
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
