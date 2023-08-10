import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer, useStyles } from './style';

interface OpenAIError {
  code: 'invalid_api_key' | string;
  message: string;
  param?: any;
  type: string;
}

interface OpenAIErrorResponse {
  error: OpenAIError;
}

const OpenAiBizError = memo<{ content: OpenAIErrorResponse; id: string }>(({ content, id }) => {
  const { styles } = useStyles();

  const [resend, deleteMessage] = useSessionStore((s) => [s.resendMessage, s.deleteMessage]);

  const errorCode = content.error?.code;

  if (errorCode === 'invalid_api_key') {
    return (
      <ErrorActionContainer>
        <APIKeyForm
          onConfirm={() => {
            console.log(id);
            resend(id);
            deleteMessage(id);
          }}
        />
      </ErrorActionContainer>
    );
  }
  return (
    <Flexbox className={styles.container} style={{ maxWidth: 600 }}>
      <Highlighter language={'json'}>{JSON.stringify(content, null, 2)}</Highlighter>
    </Flexbox>
  );
});

export default OpenAiBizError;
