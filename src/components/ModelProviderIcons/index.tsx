import { Bedrock, OpenAI, Zhipu } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

interface ModelProviderIconProps {
  provider?: string;
}

const ModelProviderIcon = memo<ModelProviderIconProps>(({ provider }) => {
  switch (provider) {
    case ModelProvider.ZhiPu: {
      return <Zhipu size={20} />;
    }

    case ModelProvider.Bedrock: {
      return <Bedrock size={20} />;
    }

    default:
    case ModelProvider.OpenAI: {
      return <OpenAI size={20} />;
    }
  }
});

export default ModelProviderIcon;
