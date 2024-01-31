import { ModelProviderCard } from '@/types/llm';

const Bedrock: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Amazon Titan Text G1 - Express v1，上下文长度可达 8000 个 token，适合广泛的用途。',
      displayName: 'Titan Text G1 - Express',
      id: 'titan-text-g1-express',
      tokens: 8000,
    },
    {
      description:
        'Claude Instant 1.2 v1.2，上下文大小等于 100k，一个更快更便宜但仍然非常能干的模型，可以处理包括随意对话在内的多种任务。',
      displayName: 'Claude Instant 1.2',
      id: 'claude-instant-1.2',
      tokens: 100_000,
    },
    {
      description: `Claude 1.3 v1.3，上下文大小等于 100k，Anthropic's 通用大型语言模型的早期版本。`,
      displayName: 'Claude 1.3',
      id: 'claude-1.3',
      tokens: 100_000,
    },
    {
      description:
        'Claude 2.1 v2.1，上下文大小等于 200k，Claude 2 的更新版本，特性包括双倍的上下文窗口，以及在可靠性等方面的提升。',
      displayName: 'Claude 2.1',
      id: 'claude-2.1',
      tokens: 200_000,
    },
    {
      description: 'Claude 2 v2，上下文大小等于 100k。',
      displayName: 'Claude 2',
      id: 'claude-2',
      tokens: 100_000,
    },
    {
      description: 'Llama 2 Chat 13B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 13B',
      id: 'llama-2-chat-13b',
      tokens: 4000,
    },
    {
      description: 'Llama 2 Chat 70B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 70B',
      id: 'llama-2-chat-70b',
      tokens: 4000,
    },
  ],
  id: 'bedrock',
};

export default Bedrock;
