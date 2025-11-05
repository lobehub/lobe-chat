import { Alert, AlertProps } from '@lobehub/ui-rn';
import type { FC, ReactNode } from 'react';

interface ErrorContentProps {
  error?: AlertProps;
  message?: ReactNode;
}

const ErrorContent: FC<ErrorContentProps> = ({ error, message }) => {
  console.log('message', message);
  console.log('error', error);
  // 如果 error 没有 message，但有传入 message prop，直接显示
  if (!error?.message) {
    if (!message) return null;
    return message;
  }

  // 有 error 时，显示 Alert，message 作为 extra 额外信息
  return <Alert closable={false} extra={message} showIcon {...error} />;
};

export default ErrorContent;
