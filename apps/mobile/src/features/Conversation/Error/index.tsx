import { AgentRuntimeErrorType } from '@lobechat/model-runtime';
import { ChatMessageError } from '@lobechat/types';
import { memo } from 'react';

import ChatInvalidAPIKey from './ChatInvalidApiKey';
import ErrorJsonViewer from './ErrorJsonViewer';

interface ErrorMessageData {
  error?: ChatMessageError | null;
  id: string;
}

interface ErrorExtraProps {
  data: ErrorMessageData;
}

/**
 * ErrorMessageExtra - 错误详情组件
 *
 * 根据不同错误类型显示不同的 UI
 */
const ErrorMessageExtra = memo<ErrorExtraProps>(({ data }) => {
  const error = data.error;
  if (!error?.type) return null;

  // 根据 error.type 返回特殊的错误处理组件
  switch (error.type) {
    case AgentRuntimeErrorType.NoOpenAIAPIKey: {
      return <ChatInvalidAPIKey id={data.id} provider={error.body?.provider} />;
    }

    // TODO: 添加其他特殊错误类型的处理
    // - OllamaServiceUnavailable -> OllamaSetupGuide
    // - InvalidAccessCode -> AccessCodeForm
    // - InvalidClerkUser -> ClerkLogin

    default: {
      break;
    }
  }

  // InvalidProviderAPIKey - 包含 'Invalid' 关键字的错误
  if (error.type.toString().includes('Invalid')) {
    return <ChatInvalidAPIKey id={data.id} provider={error.body?.provider} />;
  }

  // 默认使用 ErrorJsonViewer
  return <ErrorJsonViewer error={error} id={data.id} />;
});

ErrorMessageExtra.displayName = 'ErrorMessageExtra';

export default ErrorMessageExtra;
