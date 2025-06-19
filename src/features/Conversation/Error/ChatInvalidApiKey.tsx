import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviderName } from '@/hooks/useProviderName';
import { useChatStore } from '@/store/chat';
import { GlobalLLMProviderKey } from '@/types/user/settings/modelProvider';

import InvalidAPIKey from './InvalidAPIKey';

interface ChatInvalidAPIKeyProps {
  id: string;
  provider?: string;
}
const ChatInvalidAPIKey = memo<ChatInvalidAPIKeyProps>(({ id, provider }) => {
  const { t } = useTranslation('modelProvider');
  const { t: modelProviderErrorT } = useTranslation(['modelProvider', 'error']);
  const [resend, deleteMessage] = useChatStore((s) => [s.regenerateMessage, s.deleteMessage]);
  const providerName = useProviderName(provider as GlobalLLMProviderKey);

  return (
    <InvalidAPIKey
      bedrockDescription={t('bedrock.unlock.description')}
      description={modelProviderErrorT(`unlock.apiKey.description`, {
        name: providerName,
        ns: 'error',
      })}
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

export default ChatInvalidAPIKey;
