import { memo } from 'react';

import { ChatMessage } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidModel from './InvalidOllamaModel';

interface OllamaError {
  code: string | null;
  message: string;
  param?: any;
  type: string;
}

interface OllamaErrorResponse {
  error: OllamaError;
}

const UNRESOLVED_MODEL_REGEXP = /model '([\w+,-_]+)' not found/;

const OllamaBizError = memo<ChatMessage>(({ error, id }) => {
  const errorBody: OllamaErrorResponse = (error as any)?.body;

  const errorMessage = errorBody.error?.message;

  const unresolvedModel = errorMessage?.match(UNRESOLVED_MODEL_REGEXP)?.[1];
  if (unresolvedModel) {
    return <InvalidModel id={id} model={unresolvedModel} />;
  }

  return <ErrorJsonViewer error={error} id={id} />;
});

export default OllamaBizError;
