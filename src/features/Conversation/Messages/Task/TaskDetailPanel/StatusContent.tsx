'use client';

import { memo } from 'react';

import { TaskDetail, ThreadStatus } from '@/types/index';

import CompletedState from './CompletedState';
import ErrorState from './ErrorState';
import InitializingState from './InitializingState';
import ProcessingState from './ProcessingState';

interface StatusContentProps {
  content?: string;
  messageId: string;
  taskDetail?: TaskDetail;
}

const StatusContent = memo<StatusContentProps>(({ taskDetail, content, messageId }) => {
  const status = taskDetail?.status;

  // Initializing state: no status yet (task just created, waiting for backend)
  if (!status) {
    return <InitializingState />;
  }

  // Processing states: Processing, InReview, Pending, Active, Todo
  const isProcessing =
    status === ThreadStatus.Processing ||
    status === ThreadStatus.InReview ||
    status === ThreadStatus.Pending ||
    status === ThreadStatus.Active ||
    status === ThreadStatus.Todo;

  if (isProcessing) {
    return <ProcessingState messageId={messageId} taskDetail={taskDetail!} />;
  }

  // Completed state
  if (status === ThreadStatus.Completed) {
    return <CompletedState content={content} taskDetail={taskDetail!} />;
  }

  // Error states: Failed, Cancel
  if (status === ThreadStatus.Failed || status === ThreadStatus.Cancel) {
    return <ErrorState taskDetail={taskDetail!} />;
  }

  // Fallback to initializing state for unknown status
  return <InitializingState />;
});

StatusContent.displayName = 'StatusContent';

export default StatusContent;
