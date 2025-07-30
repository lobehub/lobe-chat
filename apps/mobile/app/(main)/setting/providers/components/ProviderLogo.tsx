import {
  Bot,
  Brain,
  Cloud,
  Database,
  Globe,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { ModelProvider } from '@/mobile/types/agent';

const ProviderLogo = memo<{ provider: string }>(({ provider }) => {
  switch (provider) {
    case ModelProvider.Azure: {
      return <Cloud color="#0078d4" size={24} />;
    }
    case ModelProvider.Google: {
      return <Globe color="#4285f4" size={24} />;
    }
    case ModelProvider.Anthropic: {
      return <Bot color="#d97706" size={24} />;
    }
    case ModelProvider.Bedrock: {
      return <Database color="#ff9900" size={24} />;
    }
    case ModelProvider.DeepSeek: {
      return <Brain color="#6366f1" size={24} />;
    }
    case ModelProvider.Groq: {
      return <Zap color="#f59e0b" size={24} />;
    }
    case ModelProvider.Mistral: {
      return <Sparkles color="#7c3aed" size={24} />;
    }
    case ModelProvider.Moonshot: {
      return <MessageSquare color="#10b981" size={24} />;
    }
    case ModelProvider.OpenAI: {
      return <Bot color="#10a37f" size={24} />;
    }
    case ModelProvider.OpenRouter: {
      return <Globe color="#8b5cf6" size={24} />;
    }
    case ModelProvider.Perplexity: {
      return <Brain color="#ef4444" size={24} />;
    }
    case ModelProvider.TogetherAI: {
      return <Sparkles color="#06b6d4" size={24} />;
    }
    case ModelProvider.ZeroOne: {
      return <Bot color="#f97316" size={24} />;
    }
    case ModelProvider.ZhiPu: {
      return <Brain color="#059669" size={24} />;
    }
    case ModelProvider.Minimax: {
      return <MessageSquare color="#dc2626" size={24} />;
    }
    case ModelProvider.Ollama: {
      return <Bot color="#0891b2" size={20} />;
    }
    case ModelProvider.Spark: {
      return <Sparkles color="#7c2d12" size={24} />;
    }
    case ModelProvider.TencentCloud: {
      return <Cloud color="#1d4ed8" size={20} />;
    }
    case ModelProvider.Baichuan: {
      return <Bot color="#be185d" size={24} />;
    }
    case ModelProvider.Wenxin: {
      return <Brain color="#1e40af" size={24} />;
    }
    case ModelProvider.Stepfun: {
      return <Zap color="#a855f7" size={24} />;
    }
    case ModelProvider.Cloudflare: {
      return <Cloud color="#f59e0b" size={20} />;
    }
    case ModelProvider.Nvidia: {
      return <Database color="#059669" size={24} />;
    }
    case 'gitee': {
      return <Globe color="#dc2626" size={24} />;
    }
    case ModelProvider.Ai360: {
      return <Bot color="#7c3aed" size={20} />;
    }
    case ModelProvider.Ai21: {
      return <Brain color="#0891b2" size={20} />;
    }

    default: {
      return <View style={{ height: 28, width: 28 }} />;
    }
  }
});

export default ProviderLogo;
