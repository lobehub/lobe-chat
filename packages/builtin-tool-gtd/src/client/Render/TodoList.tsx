'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Checkbox, Input } from 'antd';
import { CheckCircle, Circle, ListTodo, Plus, Trash2 } from 'lucide-react';
import { KeyboardEvent, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import type { TodoItem, TodoList as TodoListType } from '../../types';

export interface TodoListRenderState {
  todos?: TodoListType;
}

export interface TodoListCallbacks {
  onAddTodo?: (items: string[]) => void;
  onClearTodos?: (mode: 'completed' | 'all') => void;
  onCompleteTodo?: (indices: number[]) => void;
  onDeleteTodo?: (index: number) => void;
  onToggleTodo?: (index: number, done: boolean) => void;
}

interface TodoListProps {
  callbacks?: TodoListCallbacks;
  items: TodoItem[];
  showActions?: boolean;
}

/**
 * Interactive TodoList UI component
 */
const TodoListUI = memo<TodoListProps>(({ items, callbacks, showActions = true }) => {
  const { t } = useTranslation('tool');
  const [newTodoText, setNewTodoText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = items.filter((item) => item.done).length;
  const pendingCount = items.length - completedCount;

  const handleToggle = useCallback(
    (index: number, currentDone: boolean) => {
      if (callbacks?.onToggleTodo) {
        callbacks.onToggleTodo(index, !currentDone);
      } else if (callbacks?.onCompleteTodo && !currentDone) {
        callbacks.onCompleteTodo([index]);
      }
    },
    [callbacks],
  );

  const handleAddTodo = useCallback(() => {
    if (!newTodoText.trim() || !callbacks?.onAddTodo) return;
    callbacks.onAddTodo([newTodoText.trim()]);
    setNewTodoText('');
    setIsAdding(false);
  }, [newTodoText, callbacks]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddTodo();
      } else if (e.key === 'Escape') {
        setIsAdding(false);
        setNewTodoText('');
      }
    },
    [handleAddTodo],
  );

  if (items.length === 0 && !isAdding) {
    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-text-tertiary)' }}>
          <ListTodo size={14} />
          <span>{t('lobe-gtd.listTodos.empty')}</span>
          {showActions && callbacks?.onAddTodo && (
            <Flexbox
              align={'center'}
              gap={4}
              horizontal
              onClick={() => setIsAdding(true)}
              style={{
                color: 'var(--lobe-primary-6)',
                cursor: 'pointer',
                marginLeft: 8,
              }}
            >
              <Plus size={12} />
              <span style={{ fontSize: 12 }}>{t('lobe-gtd.actions.add')}</span>
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={8} style={{ fontSize: 13 }}>
      {/* Header */}
      <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-primary-6)' }}>
        <ListTodo size={14} />
        <span style={{ fontWeight: 500 }}>
          {t('lobe-gtd.listTodos.title')} ({t('lobe-gtd.listTodos.items', { count: items.length })})
        </span>
        <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>
          {t('lobe-gtd.status.done', { count: completedCount })},{' '}
          {t('lobe-gtd.status.pending', { count: pendingCount })}
        </span>
      </Flexbox>

      {/* Todo Items */}
      <Flexbox
        gap={4}
        style={{
          background: 'var(--lobe-fill-tertiary)',
          borderRadius: 6,
          marginLeft: 20,
          maxHeight: 300,
          overflow: 'auto',
          padding: 12,
        }}
      >
        {items.map((item, index) => (
          <Flexbox
            align={'center'}
            gap={8}
            horizontal
            key={index}
            style={{
              borderBottom: index < items.length - 1 ? '1px solid var(--lobe-border)' : 'none',
              paddingBottom: index < items.length - 1 ? 8 : 0,
              paddingTop: index > 0 ? 4 : 0,
            }}
          >
            {showActions ? (
              <Checkbox
                checked={item.done}
                onChange={() => handleToggle(index, item.done)}
                style={{ marginRight: 0 }}
              />
            ) : item.done ? (
              <CheckCircle size={14} style={{ color: 'var(--lobe-success-6)', flexShrink: 0 }} />
            ) : (
              <Circle size={14} style={{ color: 'var(--lobe-text-quaternary)', flexShrink: 0 }} />
            )}
            <span
              style={{
                color: item.done ? 'var(--lobe-text-tertiary)' : 'var(--lobe-text)',
                flex: 1,
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              {item.text}
            </span>
            {showActions && callbacks?.onDeleteTodo && (
              <Trash2
                onClick={() => callbacks.onDeleteTodo?.(index)}
                size={14}
                style={{
                  color: 'var(--lobe-text-quaternary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: 0.6,
                }}
              />
            )}
          </Flexbox>
        ))}

        {/* Add new todo input */}
        {isAdding && (
          <Flexbox align={'center'} gap={8} horizontal style={{ marginTop: 8 }}>
            <Circle size={14} style={{ color: 'var(--lobe-text-quaternary)', flexShrink: 0 }} />
            <Input
              autoFocus
              onBlur={() => {
                if (!newTodoText.trim()) {
                  setIsAdding(false);
                }
              }}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('lobe-gtd.actions.placeholder')}
              size="small"
              style={{ flex: 1 }}
              value={newTodoText}
            />
          </Flexbox>
        )}
      </Flexbox>

      {/* Actions */}
      {showActions && (
        <Flexbox
          gap={12}
          horizontal
          style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12, marginLeft: 20 }}
        >
          {callbacks?.onAddTodo && !isAdding && (
            <Flexbox
              align={'center'}
              gap={4}
              horizontal
              onClick={() => setIsAdding(true)}
              style={{ cursor: 'pointer' }}
            >
              <Plus size={12} />
              <span>{t('lobe-gtd.actions.add')}</span>
            </Flexbox>
          )}
          {callbacks?.onClearTodos && completedCount > 0 && (
            <Flexbox
              align={'center'}
              gap={4}
              horizontal
              onClick={() => callbacks.onClearTodos?.('completed')}
              style={{ cursor: 'pointer' }}
            >
              <Trash2 size={12} />
              <span>{t('lobe-gtd.actions.clearCompleted')}</span>
            </Flexbox>
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
});

TodoListUI.displayName = 'TodoListUI';

/**
 * TodoList Render component for GTD tool
 * Wraps TodoListUI with callbacks that use useConversationStore
 */
const TodoListRender = memo<BuiltinRenderProps<unknown, TodoListRenderState>>(({ pluginState }) => {
  const todos = pluginState?.todos;
  const items: TodoItem[] = todos?.items || [];

  // For now, render without interactive callbacks
  // Interactive callbacks require integration with ConversationStore
  // which needs to be done at the app level, not in the package
  return <TodoListUI items={items} showActions={false} />;
});

TodoListRender.displayName = 'TodoListRender';

export default TodoListRender;
export { TodoListUI };
