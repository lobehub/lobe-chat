'use client';

import { Block, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { TaskDetail, ThreadStatus } from '@/types/index';

import CompletedState from './CompletedState';
import ErrorState from './ErrorState';
import ProcessingState from './ProcessingState';

const useStyles = createStyles(({ css, token }) => ({
  instruction: css`
    padding-block: 12px;
    padding-inline: 16px;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    font-size: 12px;
    line-height: 1.6;
    color: ${token.colorTextTertiary};
  `,
}));

interface TaskDetailPanelProps {
  content?: string;
  instruction?: string;
  taskDetail: TaskDetail;
}

const TaskDetailPanel = memo<TaskDetailPanelProps>(({ taskDetail, instruction, content }) => {
  const { styles } = useStyles();
  const { status } = taskDetail;

  // Processing states: Processing, InReview, Pending, Active, Todo
  const isProcessing =
    status === ThreadStatus.Processing ||
    status === ThreadStatus.InReview ||
    status === ThreadStatus.Pending ||
    status === ThreadStatus.Active ||
    status === ThreadStatus.Todo;

  // Completed state
  const isCompleted = status === ThreadStatus.Completed;

  // Error states: Failed, Cancel
  const isError = status === ThreadStatus.Failed || status === ThreadStatus.Cancel;

  const renderStatusContent = () => {
    if (isProcessing) {
      return <ProcessingState taskDetail={taskDetail} />;
    }

    if (isCompleted) {
      return <CompletedState content={content} taskDetail={taskDetail} />;
    }

    if (isError) {
      return <ErrorState taskDetail={taskDetail} />;
    }

    // Fallback to processing state for unknown status
    return <ProcessingState taskDetail={taskDetail} />;
  };

  return (
    <Block variant="filled">
      {/* Instruction Header */}
      {instruction && (
        <Text className={styles.instruction} style={{ display: 'block' }}>
          {instruction}
        </Text>
      )}

      {/* Status Content */}
      <Block variant="outlined">{renderStatusContent()}</Block>
    </Block>
  );
});

TaskDetailPanel.displayName = 'TaskDetailPanel';

export default TaskDetailPanel;
