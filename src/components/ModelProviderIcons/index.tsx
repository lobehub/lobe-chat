import { SiAmazonaws, SiOpenai } from '@icons-pack/react-simple-icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import { Anthropic } from './Anthropic';
import { ChatGLM } from './ChatGLM';
import { GoogleDeepMind } from './GoogleDeepMind';
import { Mistral } from './Mistral';
import { Tongyi } from './Tongyi';

interface ModelProviderIconProps {
  provider?: string;
}

const ModelProviderIcon = memo<ModelProviderIconProps>(({ provider }) => {
  switch (provider) {
    case ModelProvider.Anthropic: {
      return <Anthropic size={12} />;
    }
    case ModelProvider.Tongyi: {
      return <Tongyi size={12} />;
    }
    case ModelProvider.Mistral: {
      return <Mistral size={11} />;
    }
    case ModelProvider.Bedrock: {
      return <SiAmazonaws size={18} />;
    }

    case 'zhipu':
    case ModelProvider.ChatGLM: {
      return <ChatGLM size={16} />;
    }

    case ModelProvider.Google: {
      return <GoogleDeepMind size={12} />;
    }

    default:
    case ModelProvider.OpenAI: {
      return <SiOpenai size={12} />;
    }
  }
});

export default ModelProviderIcon;
