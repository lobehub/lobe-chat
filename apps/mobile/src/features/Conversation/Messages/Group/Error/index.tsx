import { UIChatMessage } from '@lobechat/types';
import { Alert, Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorContentProps {
  error: UIChatMessage['error'];
  id: string;
}

const ErrorContent = memo<ErrorContentProps>(({ error }) => {
  const { t } = useTranslation('error');

  if (!error) return null;

  const errorMessage = error.message || t('fetchError');

  return (
    <Flexbox gap={8}>
      <Alert closable={false} message={errorMessage} showIcon type="error" />
    </Flexbox>
  );
});

ErrorContent.displayName = 'GroupErrorContent';

export default ErrorContent;
