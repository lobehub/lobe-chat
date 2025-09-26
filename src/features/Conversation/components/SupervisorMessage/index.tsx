'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatItem from '@/components/ChatItem/ChatItem';
import { DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
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

  const errorMessage =
    message.error?.type === ChatErrorType.SupervisorDecisionFailed
      ? t('supervisor.decisionFailed', { ns: 'error' })
      : message.error?.message;

  const errorProps = errorMessage
    ? {
        message: errorMessage,
        type: 'error' as const,
      }
    : undefined;

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
  return (
    <ChatItem
      avatar={{
        avatar: DEFAULT_SUPERVISOR_AVATAR,
        title: t('groupSidebar.members.orchestrator'),
      }}
      error={isTodoMessage ? undefined : errorProps}
      loading={false}
      message={message.content}
      placement="left"
      primary={false}
      showTitle={true}
      time={message.updatedAt || message.createdAt}
      variant={isTodoMessage ? 'docs' : 'bubble'}
    />
  );
});

SupervisorMessage.displayName = 'SupervisorMessage';

export default SupervisorMessage;
