import { Button } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';
import { useChatStore } from '@/store/chat';

import AnthropicForm from './Anthropic';
import BedrockForm from './Bedrock';
import GoogleForm from './Google';
import GroqForm from './Groq';
import MistralForm from './Mistral';
import MoonshotForm from './Moonshot';
import OpenAIForm from './OpenAI';
import OpenRouterForm from './OpenRouter';
import PerplexityForm from './Perplexity';
import ZeroOneForm from './ZeroOne';
import ZhipuForm from './Zhipu';

interface APIKeyFormProps {
  id: string;
  provider?: string;
}

const APIKeyForm = memo<APIKeyFormProps>(({ id, provider }) => {
  const { t } = useTranslation('error');

  const [resend, deleteMessage] = useChatStore((s) => [s.internalResendMessage, s.deleteMessage]);

  const action = useMemo(() => {
    switch (provider as ModelProvider) {
      case ModelProvider.Bedrock: {
        return <BedrockForm />;
      }

      case ModelProvider.Google: {
        return <GoogleForm />;
      }

      case ModelProvider.ZhiPu: {
        return <ZhipuForm />;
      }

      case ModelProvider.Mistral: {
        return <MistralForm />;
      }

      case ModelProvider.Moonshot: {
        return <MoonshotForm />;
      }

      case ModelProvider.Perplexity: {
        return <PerplexityForm />;
      }

      case ModelProvider.Anthropic: {
        return <AnthropicForm />;
      }

      case ModelProvider.Groq: {
        return <GroqForm />;
      }

      case ModelProvider.OpenRouter: {
        return <OpenRouterForm />;
      }

      case ModelProvider.ZeroOne: {
        return <ZeroOneForm />;
      }

      default:
      case ModelProvider.OpenAI: {
        return <OpenAIForm />;
      }
    }
  }, [provider]);

  return (
    <Center gap={16} style={{ maxWidth: 300 }}>
      {action}
      <Flexbox gap={12} width={'100%'}>
        <Button
          block
          onClick={() => {
            resend(id);
            deleteMessage(id);
          }}
          style={{ marginTop: 8 }}
          type={'primary'}
        >
          {t('unlock.confirm')}
        </Button>
        <Button
          onClick={() => {
            deleteMessage(id);
          }}
        >
          {t('unlock.closeMessage')}
        </Button>
      </Flexbox>
    </Center>
  );
});

export default APIKeyForm;
