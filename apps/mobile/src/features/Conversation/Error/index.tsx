import { ChatMessageError } from '@lobechat/types';
import { memo } from 'react';

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
 * 目前只实现了通用的 JSON 查看器
 * TODO: 后续可以添加特殊错误类型的处理（如 Ollama、API Key 等）
 */
const ErrorMessageExtra = memo<ErrorExtraProps>(({ data }) => {
  const error = data.error;
  if (!error?.type) return null;

  // TODO: 根据 error.type 返回特殊的错误处理组件
  // 目前统一使用 ErrorJsonViewer
  return <ErrorJsonViewer error={error} id={data.id} />;
});

ErrorMessageExtra.displayName = 'ErrorMessageExtra';

export default ErrorMessageExtra;
