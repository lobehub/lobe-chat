import { Alert , Skeleton } from '@lobehub/ui';
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
      afterClose={() => {
        if (id) {
          deleteMessage(id);
        }
      }}
      closable
      showIcon
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
      type={'secondary'}
      {...error}
    />
  );
});

export default ErrorContent;
