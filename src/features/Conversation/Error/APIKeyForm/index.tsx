import { Button } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';
import { useChatStore } from '@/store/chat';

import BedrockForm from './Bedrock';
import GoogleForm from './Google';
import MoonshotForm from './Moonshot';
import OpenAIForm from './OpenAI';
import PerplexityForm from './Perplexity';
import ZhipuForm from './Zhipu';

interface APIKeyFormProps {
  id: string;
  provider?: string;
}

const APIKeyForm = memo<APIKeyFormProps>(({ id, provider }) => {
  const { t } = useTranslation('error');

  const [resend, deleteMessage] = useChatStore((s) => [s.resendMessage, s.deleteMessage]);

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

      case ModelProvider.Moonshot: {
        return <MoonshotForm />;
      }

      case ModelProvider.Perplexity: {
        return <PerplexityForm />;
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
