import { ChatMessageError } from '@lobechat/types';
import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface ErrorJSONViewerProps {
  block?: boolean;
  error?: ChatMessageError | null;
  id: string;
}

const ErrorJsonViewer = memo<ErrorJSONViewerProps>(({ error, id, block }) => {
  const errorBody = error?.body || error;

  if (!errorBody) return;

  return (
    <Flexbox id={id} style={{ maxWidth: block ? '100%' : 600, width: block ? '100%' : undefined }}>
      <Highlighter actionIconSize={'small'} language={'json'} wrap>
        {JSON.stringify(errorBody, null, 2)}
      </Highlighter>
    </Flexbox>
  );
});

export default ErrorJsonViewer;
