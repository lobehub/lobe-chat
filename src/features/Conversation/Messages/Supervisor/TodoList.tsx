import { Collapse, Icon, Text } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { CheckCircle, Circle, ListCheck } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { SupervisorTodoItem } from '@/store/chat/slices/message/supervisor';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, token }) => ({
  collapse: css`
    padding-block: 0;
    padding-inline: ${token.paddingXS}px;

    .ant-collapse-content-box {
      padding: 0;
    }

    .ant-collapse-header {
      padding: 0 !important;
      color: ${token.colorTextTertiary};
    }

    .ant-collapse-expand-icon {
      color: ${token.colorTextTertiary} !important;
    }
  `,
}));

export interface TodoData {
  timestamp: number;
  todos: SupervisorTodoItem[];
  type: 'supervisor_todo';
}

export interface TodoListProps {
  data: TodoData;
}

const TodoList = memo<TodoListProps>(({ data }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const { styles } = useStyles();

  const { todos } = data;
  const agents = useSessionStore(sessionSelectors.currentGroupAgents);

  const resolveAssigneeName = (assignee?: string) => {
    if (!assignee) return undefined;
    const agent = agents?.find((a) => a.id === assignee);
    return agent?.title || assignee;
  };
  const completedCount = todos.filter((todo) => todo.finished).length;
  const totalCount = todos.length;

  // Create the header with progress indicator
  const headerContent = (
    <Flexbox align="center" gap={8} horizontal style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Icon color={theme.colorTextTertiary} icon={ListCheck} size={16} style={{ flexShrink: 0 }} />
      <Text
        color={theme.colorTextTertiary}
        ellipsis={{ tooltip: true }}
        style={{ flex: 1 }}
        weight={400}
      >
        {completedCount} / {totalCount} {t('supervisor.todoList.title')}
      </Text>
    </Flexbox>
  );

  // Create todo items content
  const todoItems =
    todos.length === 0 ? (
      <Flexbox align="center" gap={8} horizontal padding="8px 0">
        <CheckCircle color={theme.colorSuccess} size={16} />
        <span
          style={{
            color: theme.colorTextSecondary,
            fontSize: theme.fontSizeSM,
          }}
        >
          {t('supervisor.todoList.allComplete')}
        </span>
      </Flexbox>
    ) : (
      <Flexbox gap={0}>
        {todos.map((todo, index) => (
          <Flexbox
            align="center"
            gap={8}
            horizontal
            key={index}
            style={{
              borderBottom:
                index < todos.length - 1 ? `1px solid ${theme.colorBorderSecondary}` : 'none',
              padding: '8px 0',
              width: '100%',
            }}
          >
            <Center
              style={{
                color: todo.finished ? theme.colorSuccess : theme.colorTextTertiary,
                flexShrink: 0,
              }}
            >
              {todo.finished ? <CheckCircle size={16} /> : <Circle size={16} />}
            </Center>
            <span
              style={{
                color: todo.finished ? theme.colorTextTertiary : theme.colorText,
                fontSize: theme.fontSize,
                textDecoration: todo.finished ? 'line-through' : 'none',
              }}
            >
              {todo.content}
            </span>
            {resolveAssigneeName(todo.assignee) && (
              <span
                style={{
                  color: theme.colorTextTertiary,
                  fontSize: theme.fontSizeSM,
                  marginLeft: 6,
                }}
              >
                @{resolveAssigneeName(todo.assignee)}
              </span>
            )}
          </Flexbox>
        ))}
      </Flexbox>
    );

  return (
    <Collapse
      className={styles.collapse}
      expandIconPosition="end"
      items={[
        {
          children: todoItems,
          key: 'todos',
          label: headerContent,
        },
      ]}
      size="small"
      styles={{
        header: {
          fontSize: theme.fontSize,
        },
      }}
      variant="borderless"
    />
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;
