import { Alert, Block } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { Suspense, memo } from 'react';

import { useStyles } from '../style';
import { ChatItemProps } from '../type';

export interface ErrorContentProps {
  customErrorRender?: ChatItemProps['customErrorRender'];
  error: ChatItemProps['error'];
}

const ErrorContent = memo<ErrorContentProps>(({ customErrorRender, error }) => {
  const { styles } = useStyles();

  if (!error) return;

  if (customErrorRender) {
    return (
      <Block className={styles.errorContainer} gap={8} padding={16} variant={'outlined'}>
        <Suspense fallback={<Skeleton active paragraph={{ rows: 1 }} title={false} />}>
          {customErrorRender(error)}
        </Suspense>
      </Block>
    );
  }

  return (
    <Alert
      classNames={{
        container: styles.errorContainer,
      }}
      closable={false}
      showIcon
      type={'secondary'}
      {...error}
    />
  );
});

export default ErrorContent;
