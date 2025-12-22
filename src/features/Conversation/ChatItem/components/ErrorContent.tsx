import { Alert, Skeleton } from '@lobehub/ui';
import { Suspense, memo } from 'react';

import { useConversationStore } from '@/features/Conversation';

import { ChatItemProps } from '../type';

export interface ErrorContentProps {
  customErrorRender?: ChatItemProps['customErrorRender'];
  error: ChatItemProps['error'];
  id?: string;
}

const ErrorContent = memo<ErrorContentProps>(({ customErrorRender, error, id }) => {
  const [deleteMessage] = useConversationStore((s) => [s.deleteMessage]);

  if (!error) return;

  if (customErrorRender) {
    return (
      <Suspense fallback={<Skeleton.Button active block />}>{customErrorRender(error)}</Suspense>
    );
  }

  return (
    <Alert
      closable
      extraIsolate={false}
      showIcon
      type={'secondary'}
      {...error}
      afterClose={() => {
        error?.afterClose?.();
        if (id) {
          deleteMessage(id);
        }
      }}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        ...error.style,
      }}
      title={error.message}
    />
  );
});

export default ErrorContent;
