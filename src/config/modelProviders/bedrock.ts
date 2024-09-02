import { ModelProviderCard } from '@/types/llm';

// ref https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
// ref https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
const Bedrock: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Titan Text G1 - Lite',
      id: 'amazon.titan-text-lite-v1',
      tokens: 4000,
    },
    {
      displayName: 'Titan Text G1 - Express',
      id: 'amazon.titan-text-express-v1',
      tokens: 8000,
    },
    {
      displayName: 'Titan Text Premier',
      id: 'amazon.titan-text-premier-v1:0',
      tokens: 32_000,
    },
    {
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 3 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-opus-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-haiku-20240307-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      tokens: 200_000,
    },
    {
      displayName: 'Claude 2.0',
      id: 'anthropic.claude-v2',
      tokens: 100_000,
    },
    {
      displayName: 'Claude Instant',
      id: 'anthropic.claude-instant-v1',
      tokens: 100_000,
    },
    {
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-8b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-70b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-405b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3 8B Instruct',
      id: 'meta.llama3-8b-instruct-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct',
      id: 'meta.llama3-70b-instruct-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Llama 2 Chat 13B',
      id: 'meta.llama2-13b-chat-v1',
      tokens: 4096,
    },
    {
      displayName: 'Llama 2 Chat 70B',
      id: 'meta.llama2-70b-chat-v1',
      tokens: 4096,
    },
    {
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistral.mistral-7b-instruct-v0:2',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral 8X7B Instruct',
      enabled: true,
      id: 'mistral.mixtral-8x7b-instruct-v0:1',
      tokens: 4096,
    },
    {
      displayName: 'Mistral Small',
      functionCall: true,
      id: 'mistral.mistral-small-2402-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Mistral Large 2 (24.07)',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2407-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Mistral Large',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2402-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Command R+',
      enabled: true,
      functionCall: true,
      id: 'cohere.command-r-plus-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Command R',
      enabled: true,
      functionCall: true,
      id: 'cohere.command-r-v1:0',
      tokens: 128_000,
    },
/*
    // Cohere Command (Text) and AI21 Labs Jurassic-2 (Text) don't support chat with the Converse API
    {
      displayName: 'Command',
      id: 'cohere.command-text-v14',
      tokens: 4096,
    },
    {
      displayName: 'Command Light',
      id: 'cohere.command-light-text-v14',
      tokens: 4096,
    },
*/
    {
      displayName: 'Jamba-Instruct',
      id: 'ai21.jamba-instruct-v1:0',
      tokens: 4096,
    },
/*
    // Cohere Command (Text) and AI21 Labs Jurassic-2 (Text) don't support chat with the Converse API
    {
      displayName: 'Jurassic-2 Mid',
      id: 'ai21.j2-mid-v1',
      tokens: 8192,
    },
    {
      displayName: 'Jurassic-2 Ultra',
      id: 'ai21.j2-ultra-v1',
      tokens: 8192,
    },
*/
  ],
  checkModel: 'amazon.titan-text-lite-v1',
  id: 'bedrock',
  name: 'Bedrock',
};

export default Bedrock;
