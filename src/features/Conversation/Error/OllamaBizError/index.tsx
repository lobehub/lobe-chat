import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { ChatMessage } from '@/types/message';

import ErrorJsonViewer from '../ErrorJsonViewer';

const loading = () => <Skeleton active style={{ width: 300 }} />;

const SetupGuide = dynamic(() => import('./SetupGuide'), { loading, ssr: false });

const InvalidModel = dynamic(() => import('./InvalidOllamaModel'), { loading, ssr: false });

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

  // error of not pull the model
  const unresolvedModel = errorMessage?.match(UNRESOLVED_MODEL_REGEXP)?.[1];
  if (unresolvedModel) {
    return <InvalidModel id={id} model={unresolvedModel} />;
  }

  // error of not enable model or not set the CORS rules
  if (errorMessage?.includes('Failed to fetch')) {
    return <SetupGuide />;
  }

  return <ErrorJsonViewer error={error} id={id} />;
});

export default OllamaBizError;
