import { Alert, Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatMessageError, ChatPluginPayload } from '@/types/message';

import PluginSettings from './PluginSettings';

interface ErrorResponseProps extends ChatMessageError {
  id: string;
  plugin?: ChatPluginPayload;
}

const ErrorResponse = memo<ErrorResponseProps>(({ id, type, body, message, plugin }) => {
  const { t } = useTranslation('error');
  if (type === 'PluginSettingsInvalid') {
    return <PluginSettings id={id} plugin={plugin} />;
  }

  return (
    <Alert
      extra={
        <Flexbox>
          <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
            {JSON.stringify(body || { message, type }, null, 2)}
          </Highlighter>
        </Flexbox>
      }
      message={t(`response.${type}` as any)}
      showIcon
      type={'error'}
    />
  );
});
export default ErrorResponse;
