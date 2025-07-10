import { Button } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import OllamaModelDownloader from '@/features/OllamaModelDownloader';
import { useChatStore } from '@/store/chat';

import { ErrorActionContainer } from '../style';

interface InvalidOllamaModelProps {
  id: string;
  model: string;
}

const InvalidOllamaModel = memo<InvalidOllamaModelProps>(({ id, model }) => {
  const { t } = useTranslation('error');

  const [delAndRegenerateMessage, deleteMessage] = useChatStore((s) => [
    s.delAndRegenerateMessage,
    s.deleteMessage,
  ]);
  return (
    <ErrorActionContainer>
      <OllamaModelDownloader
        extraAction={
          <Button
            onClick={() => {
              deleteMessage(id);
            }}
          >
            {t('unlock.closeMessage')}
          </Button>
        }
        model={model}
        onSuccessDownload={() => {
          delAndRegenerateMessage(id);
        }}
      />
    </ErrorActionContainer>
  );
});

export default InvalidOllamaModel;
