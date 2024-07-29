import { ModelProviderCard } from '@/types/llm';

const Novita: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama3 8B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3-8b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama3 70B Instruct',
      enabled: true,
      id: 'meta-llama/llama-3-70b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Nous Hermes 2 Pro - Llama3 8B',
      enabled: true,
      id: 'nousresearch/hermes-2-pro-llama-3-8b',
      tokens: 8192,
    },
    {
      displayName: 'Nous Hermes - Llama2 8B',
      enabled: true,
      id: 'nousresearch/nous-hermes-llama2-13b',
      tokens: 4096,
    },
    {
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistralai/mistral-7b-instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Dolphin Mixtral 8x22B',
      enabled: true,
      id: 'cognitivecomputations/dolphin-mixtral-8x22b',
      tokens: 16_000,
    },
    {
      displayName: 'L3-70b-Euryale-v2.1',
      enabled: true,
      id: 'sao10k/l3-70b-euryale-v2.1',
      tokens: 16_000,
    },
    {
      displayName: 'Midnight Rose 70B',
      enabled: true,
      id: 'sophosympatheia/midnight-rose-70b',
      tokens: 4096,
    },
    {
      displayName: 'Mythomax L2 13b',
      enabled: true,
      id: 'gryphe/mythomax-l2-13b',
      tokens: 4096,
    },
    {
      displayName: 'Nous Hermes 2 - Mixtral 8x7B-DPO',
      enabled: true,
      id: 'Nous-Hermes-2-Mixtral-8x7B-DPO',
      tokens: 32_768,
    },
    {
      displayName: 'Lzlv 70b',
      enabled: true,
      id: 'lzlv_70b',
      tokens: 4096,
    },
    {
      displayName: 'Open Hermes 2.5 Mistral 7B',
      enabled: true,
      id: 'teknium/openhermes-2.5-mistral-7b',
      tokens: 4096,
    },
    {
      displayName: 'Wizardlm2 8x22B',
      enabled: true,
      id: 'microsoft/wizardlm-2-8x22b',
      tokens: 65_535,
    },
  ],
  checkModel: 'meta-llama/llama-3-70b-instruct',
  disableBrowserRequest: true,
  id: 'novita',
  modelList: { showModelFetcher: true },
  name: 'Novita',
};

export default Novita;
