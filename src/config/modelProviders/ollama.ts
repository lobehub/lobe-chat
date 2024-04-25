import { ModelProviderCard } from '@/types/llm';

const Ollama: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama3 8B',
      enabled: true,
      id: 'llama3',
      tokens: 8000,
    },
    {
      displayName: 'Llama3 70B',
      id: 'llama3:70b',
      tokens: 8000,
    },
    {
      displayName: 'Command R 35B',
      enabled: true,
      id: 'command-r',
      tokens: 128_000,
    },
    {
      displayName: 'Command R+ 104B (Q2_K)',
      id: 'command-r-plus:104b-q2_K',
      tokens: 128_000,
    },
    {
      displayName: 'Gemma 7B',
      enabled: true,
      id: 'gemma',
      tokens: 4000,
    },
    {
      displayName: 'Gemma 2B',
      id: 'gemma:2b',
      tokens: 4000,
    },
    {
      displayName: 'Llama2 Chat 13B',
      id: 'llama2:13b',
      tokens: 4000,
    },
    {
      displayName: 'Llama2 Chat 7B',
      id: 'llama2',
      tokens: 4000,
    },
    {
      displayName: 'Llama2 Chat 70B',
      id: 'llama2:70b',
      tokens: 4000,
    },
    {
      displayName: 'Llama2 CN 13B',
      id: 'llama2-chinese:13b',
      tokens: 4000,
    },
    {
      displayName: 'Llama2 CN 7B',
      id: 'llama2-chinese',
      tokens: 4000,
    },
    {
      displayName: 'WizardLM 2 7B',
      enabled: true,
      id: 'wizardlm2',
      tokens: 65_536,
    },
    {
      displayName: 'WizardLM 2 8x22B',
      id: 'wizardlm2:8x22b',
      tokens: 65_536,
    },
    {
      displayName: 'Code Llama 7B',
      id: 'codellama',
      tokens: 16_000,
    },
    {
      displayName: 'Code Llama 34B',
      id: 'codellama:34b',
      tokens: 16_000,
    },
    {
      displayName: 'Code Llama 70B',
      id: 'codellama:70b',
      tokens: 16_000,
    },
    {
      displayName: 'Code Llama 7B (Python)',
      id: 'codellama:python',
      tokens: 16_000,
    },
    {
      displayName: 'Mistral',
      enabled: true,
      id: 'mistral',
      tokens: 4800,
    },
    {
      displayName: 'Mixtral 8x7B',
      enabled: true,
      id: 'mixtral',
      tokens: 32_000,
    },
    {
      displayName: 'Mixtral 8x22B',
      id: 'mixtral:8x22b',
      tokens: 64_000,
    },
    {
      displayName: 'Qwen Chat 4B',
      id: 'qwen',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen Chat 7B',
      enabled: true,
      id: 'qwen:7b',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen Chat 14B',
      id: 'qwen:14b',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen Chat 72B',
      id: 'qwen:72b',
      tokens: 32_768,
    },
    {
      displayName: 'LLaVA 7B',
      id: 'llava',
      tokens: 4000,
      vision: true,
    },
    {
      displayName: 'LLaVA 13B',
      id: 'llava:13b',
      tokens: 4000,
      vision: true,
    },
    {
      displayName: 'LLaVA 34B',
      id: 'llava:34b',
      tokens: 4000,
      vision: true,
    },
  ],
  id: 'ollama',
};

export default Ollama;
