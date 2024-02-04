import { ModelProviderCard } from '@/types/llm';

const Bedrock: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Amazon Titan Text G1 - Express v1，上下文长度可达 8000 个 token，适合广泛的用途。',
      displayName: 'Titan Text G1 - Express',
      hidden: true,
      id: 'amazon.titan-text-express-v1:0:8k',
      tokens: 8000,
    },
    {
      description:
        'Claude Instant 1.2 v1.2，上下文大小等于 100k，一个更快更便宜但仍然非常能干的模型，可以处理包括随意对话在内的多种任务。',
      displayName: 'Claude Instant 1.2',
      id: 'anthropic.claude-instant-v1',
      tokens: 100_000,
    },
    {
      description:
        'Claude 2.1 v2.1，上下文大小等于 200k，Claude 2 的更新版本，特性包括双倍的上下文窗口，以及在可靠性等方面的提升。',
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      tokens: 200_000,
    },
    {
      description: 'Llama 2 Chat 13B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 13B',
      id: 'meta.llama2-13b-chat-v1',
      tokens: 4000,
    },
    {
      description: 'Llama 2 Chat 70B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 70B',
      id: 'meta.llama2-70b-chat-v1',
      tokens: 4000,
    },
  ],
  id: 'bedrock',
};

export default Bedrock;
