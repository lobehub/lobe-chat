import { Alert } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '../style';
import { ChatItemProps } from '../type';

export interface ErrorContentProps {
  error?: ChatItemProps['error'];
  message?: ChatItemProps['errorMessage'];
}

const ErrorContent = memo<ErrorContentProps>(({ message, error }) => {
  const { styles } = useStyles();

  if (!error?.message) {
    if (!message) return null;
    return <Flexbox className={styles.errorContainer}>{message}</Flexbox>;
  }

  return (
    <Flexbox className={styles.errorContainer}>
      <Alert closable={false} extra={message} showIcon type={'error'} {...error} />
    </Flexbox>
  );
});

export default ErrorContent;
