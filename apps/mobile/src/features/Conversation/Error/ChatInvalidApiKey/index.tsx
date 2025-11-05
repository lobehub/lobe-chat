import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviderName } from '@/hooks/useProviderName';
import { useChatStore } from '@/store/chat';

import InvalidAPIKey from './APIKeyForm';

interface ChatInvalidAPIKeyProps {
  id: string;
  provider?: string;
}

const ChatInvalidAPIKey = memo<ChatInvalidAPIKeyProps>(({ id, provider }) => {
  const { t } = useTranslation(['modelProvider', 'error']);
  const [resend, deleteMessage] = useChatStore((s) => [s.regenerateMessage, s.deleteMessage]);
  const providerName = useProviderName(provider || '');

  return (
    <InvalidAPIKey
      bedrockDescription={t('bedrock.unlock.description', { ns: 'modelProvider' })}
      description={t('unlock.apiKey.description', { name: providerName, ns: 'error' })}
      id={id}
      onClose={() => {
        deleteMessage(id);
      }}
      onRecreate={() => {
        resend(id);
        deleteMessage(id);
      }}
      provider={provider}
    />
  );
});

ChatInvalidAPIKey.displayName = 'ChatInvalidAPIKey';

export default ChatInvalidAPIKey;
