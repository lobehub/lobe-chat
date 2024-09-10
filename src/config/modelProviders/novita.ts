import { ModelProviderCard } from '@/types/llm';

// ref: https://novita.ai/model-api/product/llm-api
const Novita: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-8b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-70b-instruct',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3.1-405b-instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Llama 3 8B Instruct',
      id: 'meta-llama/llama-3-8b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct',
      id: 'meta-llama/llama-3-70b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'Mistral Nemo',
      enabled: true,
      id: 'mistralai/mistral-nemo',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistralai/mistral-7b-instruct',
      tokens: 32_768,
    },
    {
      displayName: 'WizardLM 2 7B',
      enabled: true,
      id: 'microsoft/wizardlm 2-7b',
      tokens: 32_768,
    },
    {
      displayName: 'WizardLM-2 8x22B',
      enabled: true,
      id: 'microsoft/wizardlm-2-8x22b',
      tokens: 65_535,
    },
    {
      displayName: 'Dolphin Mixtral 8x22B',
      id: 'cognitivecomputations/dolphin-mixtral-8x22b',
      tokens: 16_000,
    },
    {
      displayName: 'Hermes 2 Pro Llama 3 8B',
      id: 'nousresearch/hermes-2-pro-llama-3-8b',
      tokens: 8192,
    },
    {
      displayName: 'Hermes 2 Mixtral 8x7B DPO',
      id: 'Nous-Hermes-2-Mixtral-8x7B-DPO',
      tokens: 32_768,
    },
    {
      displayName: 'MythoMax l2 13B',
      id: 'gryphe/mythomax-l2-13b',
      tokens: 4096,
    },
    {
      displayName: 'OpenChat 7B',
      id: 'openchat/openchat-7b',
      tokens: 4096,
    },
  ],
  checkModel: 'meta-llama/llama-3.1-8b-instruct',
  disableBrowserRequest: true,
  id: 'novita',
  modelList: { showModelFetcher: true },
  name: 'Novita',
};

export default Novita;
