import { ModelProviderCard } from '@/types/llm';

// ref https://ollama.com/library
const Ollama: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama3.1 8B',
      enabled: true,
      id: 'llama3.1',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 70B',
      id: 'llama3.1:70b',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 405B',
      id: 'llama3.1:405b',
      tokens: 128_000,
    },
    {
      displayName: 'Code Llama 7B',
      enabled: true,
      id: 'codellama',
      tokens: 16_384,
    },
    {
      displayName: 'Code Llama 13B',
      id: 'codellama:13b',
      tokens: 16_384,
    },
    {
      displayName: 'Code Llama 34B',
      id: 'codellama:34b',
      tokens: 16_384,
    },
    {
      displayName: 'Code Llama 70B',
      id: 'codellama:70b',
      tokens: 16_384,
    },
    {
      displayName: 'Gemma2 2B',
      id: 'gemma2:2b',
      tokens: 8192,
    },
    {
      displayName: 'Gemma2 9B',
      enabled: true,
      id: 'gemma2',
      tokens: 8192,
    },
    {
      displayName: 'Gemma2 27B',
      id: 'gemma2:27b',
      tokens: 8192,
    },
    {
      displayName: 'CodeGemma 2B',
      id: 'codegemma:2b',
      tokens: 8192,
    },
    {
      displayName: 'CodeGemma 7B',
      enabled: true,
      id: 'codegemma',
      tokens: 8192,
    },
    {
      displayName: 'Phi-3 3.8B',
      enabled: true,
      id: 'phi3',
      tokens: 128_000,
    },
    {
      displayName: 'Phi-3 14B',
      id: 'phi3:14b',
      tokens: 128_000,
    },
    {
      displayName: 'WizardLM 2 7B',
      enabled: true,
      id: 'wizardlm2',
      tokens: 32_768,
    },
    {
      displayName: 'WizardLM 2 8x22B',
      id: 'wizardlm2:8x22b',
      tokens: 65_536,
    },
    {
      displayName: 'MathΣtral 7B',
      enabled: true,
      id: 'mathstral',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral 7B',
      enabled: true,
      id: 'mistral',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral 8x7B',
      enabled: true,
      id: 'mixtral',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral 8x22B',
      id: 'mixtral:8x22b',
      tokens: 65_536,
    },
    {
      displayName: 'Mixtral Large 123B',
      enabled: true,
      id: 'mistral-large',
      tokens: 128_000,
    },
    {
      displayName: 'Mixtral Nemo 12B',
      enabled: true,
      id: 'mistral-nemo',
      tokens: 128_000,
    },
    {
      displayName: 'Codestral 22B',
      enabled: true,
      id: 'codestral',
      tokens: 32_768,
    },
    {
      displayName: 'Aya 23 8B',
      enabled: true,
      id: 'aya',
      tokens: 8192,
    },
    {
      displayName: 'Aya 23 35B',
      id: 'aya:35b',
      tokens: 8192,
    },
    {
      displayName: 'Command R 35B',
      enabled: true,
      id: 'command-r',
      tokens: 131_072,
    },
    {
      displayName: 'Command R+ 104B',
      enabled: true,
      id: 'command-r-plus',
      tokens: 131_072,
    },
    {
      displayName: 'DeepSeek V2 16B',
      enabled: true,
      id: 'deepseek-v2',
      tokens: 32_768,
    },
    {
      displayName: 'DeepSeek V2 236B',
      id: 'deepseek-v2:236b',
      tokens: 128_000,
    },
    {
      displayName: 'DeepSeek Coder V2 16B',
      enabled: true,
      id: 'deepseek-coder-v2',
      tokens: 128_000,
    },
    {
      displayName: 'DeepSeek Coder V2 236B',
      id: 'deepseek-coder-v2:236b',
      tokens: 128_000,
    },
    {
      displayName: 'Qwen2 0.5B',
      id: 'qwen2:0.5b',
      tokens: 128_000,
    },
    {
      displayName: 'Qwen2 1.5B',
      id: 'qwen2:1.5b',
      tokens: 128_000,
    },
    {
      displayName: 'Qwen2 7B',
      enabled: true,
      id: 'qwen2',
      tokens: 128_000,
    },
    {
      displayName: 'Qwen2 72B',
      id: 'qwen2:72b',
      tokens: 128_000,
    },
    {
      displayName: 'CodeQwen1.5 7B',
      enabled: true,
      id: 'codeqwen',
      tokens: 65_536,
    },
    {
      displayName: 'LLaVA 7B',
      enabled: true,
      id: 'llava',
      tokens: 4096,
      vision: true,
    },
    {
      displayName: 'LLaVA 13B',
      id: 'llava:13b',
      tokens: 4096,
      vision: true,
    },
    {
      displayName: 'LLaVA 34B',
      id: 'llava:34b',
      tokens: 4096,
      vision: true,
    },
  ],
  defaultShowBrowserRequest: true,
  id: 'ollama',
  modelList: { showModelFetcher: true },
  name: 'Ollama',
  showApiKey: false,
};

export default Ollama;
