import { memo } from 'react';

import { ChatMessage } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidAPIKey from './InvalidAPIKey';

interface OpenAIError {
  code: 'invalid_api_key' | 'insufficient_quota' | string;
  message: string;
  param?: any;
  type: string;
}

interface OpenAIErrorResponse {
  error: OpenAIError;
}

const OpenAiBizError = memo<ChatMessage>(({ error, id }) => {
  const errorBody: OpenAIErrorResponse = (error as any)?.body;

  const errorCode = errorBody.error?.code;

  if (errorCode === 'invalid_api_key') return <InvalidAPIKey id={id} />;

  return <ErrorJsonViewer error={error} id={id} />;
});

export default OpenAiBizError;
