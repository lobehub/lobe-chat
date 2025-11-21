import { ChatMessageError } from '@lobechat/types';
import { Alert } from '@lobehub/ui';
import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

import ErrorMessageExtra, { useErrorContent } from '../../../Error';

export interface ErrorContentProps {
  error?: ChatMessageError;
  id: string;
}

const ErrorContent = memo<ErrorContentProps>(({ error, id }) => {
  const { t } = useTranslation('common');

  const [deleteMessage] = useChatStore((s) => [s.deleteDBMessage]);
  const message = <ErrorMessageExtra block data={{ error, id }} />;

  const errorProps = useErrorContent(error);

  if (!errorProps?.message) {
    if (!message) return null;
    return <Flexbox>{message}</Flexbox>;
  }

  return (
    <Flexbox>
      <Alert
        action={
          <Button
            color={'default'}
            onClick={() => {
              deleteMessage(id);
            }}
            size={'small'}
            variant={'filled'}
          >
            {t('delete')}
          </Button>
        }
        closable={false}
        extra={message}
        showIcon
        type={'error'}
        {...errorProps}
      />
    </Flexbox>
  );
});

export default ErrorContent;
