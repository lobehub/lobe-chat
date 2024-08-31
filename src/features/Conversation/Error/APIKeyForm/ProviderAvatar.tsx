import {
  Ai360,
  AiMass,
  Anthropic,
  Baichuan,
  DeepSeek,
  Google,
  Groq,
  Minimax,
  Mistral,
  Moonshot,
  Novita,
  OpenAI,
  OpenRouter,
  Perplexity,
  Stepfun,
  Together,
  Tongyi,
  Upstage,
  ZeroOne,
  Zhipu,
} from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

interface ProviderAvatarProps {
  provider: ModelProvider;
}

const ProviderAvatar = memo<ProviderAvatarProps>(({ provider }) => {
  const theme = useTheme();

  switch (provider as ModelProvider) {
    case ModelProvider.Google: {
      return <Google.Color size={56} />;
    }

    case ModelProvider.ZhiPu: {
      return <Zhipu.Color size={64} />;
    }

    case ModelProvider.Minimax: {
      return <Minimax.Color size={56} />;
    }

    case ModelProvider.Mistral: {
      return <Mistral.Color size={56} />;
    }

    case ModelProvider.Moonshot: {
      return <Moonshot size={56} />;
    }

    case ModelProvider.Perplexity: {
      return <Perplexity.Color size={56} />;
    }

    case ModelProvider.Anthropic: {
      return <Anthropic color={Anthropic.colorPrimary} size={52} />;
    }

    case ModelProvider.Baichuan: {
      return <Baichuan color={Baichuan.colorPrimary} size={56} />;
    }

    case ModelProvider.DeepSeek: {
      return <DeepSeek color={DeepSeek.colorPrimary} size={56} />;
    }

    case ModelProvider.Groq: {
      return <Groq color={Groq.colorPrimary} size={56} />;
    }

    case ModelProvider.OpenRouter: {
      return <OpenRouter color={OpenRouter.colorPrimary} size={56} />;
    }

    case ModelProvider.Qwen: {
      return <Tongyi color={Tongyi.colorPrimary} size={56} />;
    }

    case ModelProvider.Stepfun: {
      return <Stepfun color={Stepfun.colorPrimary} size={56} />;
    }

    case ModelProvider.Taichu: {
      return <AiMass.Color size={56} />;
    }

    case ModelProvider.TogetherAI: {
      return <Together color={Together.colorPrimary} size={56} />;
    }

    case ModelProvider.ZeroOne: {
      return <ZeroOne color={ZeroOne.colorPrimary} size={56} />;
    }
    case ModelProvider.Novita: {
      return <Novita color={Novita.colorPrimary} size={56} />;
    }

    case ModelProvider.Ai360: {
      return <Ai360 color={Ai360.colorPrimary} size={56} />;
    }

    case ModelProvider.Upstage: {
      return <Upstage color={Upstage.colorPrimary} size={56} />;
    }

    default:
    case ModelProvider.OpenAI: {
      return <OpenAI color={theme.colorText} size={64} />;
    }
  }
});

export default ProviderAvatar;
