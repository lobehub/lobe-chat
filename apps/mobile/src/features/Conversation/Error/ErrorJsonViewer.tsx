import { ChatMessageError } from '@lobechat/types';
import { Highlighter } from '@lobehub/ui-rn';
import { memo } from 'react';

interface ErrorJsonViewerProps {
  error?: ChatMessageError | null;
  id: string;
}

const ErrorJsonViewer = memo<ErrorJsonViewerProps>(({ error }) => {
  if (!error) return null;

  return (
    <Highlighter
      code={JSON.stringify(error.body || error, null, 2)}
      lang={'json'}
      padding={0}
      variant={'borderless'}
    />
  );
});

ErrorJsonViewer.displayName = 'ErrorJsonViewer';

export default ErrorJsonViewer;
