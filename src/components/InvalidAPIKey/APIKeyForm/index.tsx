import { ProviderIcon } from '@lobehub/icons';
import { Button } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/model-runtime';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import BedrockForm from './Bedrock';
import { LoadingContext } from './LoadingContext';
import ProviderApiKeyForm from './ProviderApiKeyForm';

interface APIKeyFormProps {
  bedrockDescription: string;
  description: string;
  id: string;
  onClose: () => void;
  onRecreate: () => void;
  provider?: string;
}

const APIKeyForm = memo<APIKeyFormProps>(
  ({ provider, description, bedrockDescription, onRecreate, onClose }) => {
    const { t } = useTranslation('error');
    const [loading, setLoading] = useState(false);

    const apiKeyPlaceholder = useMemo(() => {
      switch (provider) {
        case ModelProvider.Anthropic: {
          return 'sk-ant_*****************************';
        }

        case ModelProvider.OpenRouter: {
          return 'sk-or-********************************';
        }

        case ModelProvider.Perplexity: {
          return 'pplx-********************************';
        }

        case ModelProvider.ZhiPu: {
          return '*********************.*************';
        }

        case ModelProvider.Groq: {
          return 'gsk_*****************************';
        }

        case ModelProvider.DeepSeek: {
          return 'sk_******************************';
        }

        case ModelProvider.Qwen: {
          return 'sk-********************************';
        }

        case ModelProvider.Github: {
          return 'ghp_*****************************';
        }

        default: {
          return '*********************************';
        }
      }
    }, [provider]);

    return (
      <LoadingContext value={{ loading, setLoading }}>
        <Center gap={16} style={{ maxWidth: 300 }}>
          {provider === ModelProvider.Bedrock ? (
            <BedrockForm description={bedrockDescription} />
          ) : (
            <ProviderApiKeyForm
              apiKeyPlaceholder={apiKeyPlaceholder}
              avatar={<ProviderIcon provider={provider} size={80} type={'avatar'} />}
              description={description}
              provider={provider as GlobalLLMProviderKey}
              showEndpoint
            />
          )}
          <Flexbox gap={12} width={'100%'}>
            <Button
              block
              disabled={loading}
              onClick={() => {
                onRecreate();
              }}
              style={{ marginTop: 8 }}
              type={'primary'}
            >
              {t('unlock.confirm')}
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
            >
              {t('unlock.closeMessage')}
            </Button>
          </Flexbox>
        </Center>
      </LoadingContext>
    );
  },
);

export default APIKeyForm;
