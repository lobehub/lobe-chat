import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { GlobalLLMConfig, GlobalLLMProviderKey } from '@/types/settings';

import { getProviderAuthPayload } from './_auth';

// Mock data for different providers
const mockZhiPuAPIKey = 'zhipu-api-key';
const mockMoonshotAPIKey = 'moonshot-api-key';
const mockGoogleAPIKey = 'google-api-key';
const mockAnthropicAPIKey = 'anthropic-api-key';
const mockMistralAPIKey = 'mistral-api-key';

// mock the traditional zustand
vi.mock('zustand/traditional');

const setModelProviderConfig = <T extends GlobalLLMProviderKey>(
  provider: T,
  config: Partial<GlobalLLMConfig[T]>,
) => {
  useGlobalStore.setState({
    settings: { languageModel: { [provider]: config } },
  });
};

describe('getProviderAuthPayload', () => {
  it('should return correct payload for ZhiPu provider', () => {
    act(() => {
      setModelProviderConfig('zhipu', { apiKey: mockZhiPuAPIKey });
    });

    const payload = getProviderAuthPayload(ModelProvider.ZhiPu);
    expect(payload).toEqual({ apiKey: mockZhiPuAPIKey });
  });

  it('should return correct payload for Moonshot provider', () => {
    act(() => {
      setModelProviderConfig('moonshot', { apiKey: mockMoonshotAPIKey });
    });

    const payload = getProviderAuthPayload(ModelProvider.Moonshot);
    expect(payload).toEqual({ apiKey: mockMoonshotAPIKey });
  });

  it('should return correct payload for Anthropic provider', () => {
    act(() => {
      setModelProviderConfig('anthropic', { apiKey: mockAnthropicAPIKey });
    });

    const payload = getProviderAuthPayload(ModelProvider.Anthropic);
    expect(payload).toEqual({ apiKey: mockAnthropicAPIKey });
  });

  it('should return correct payload for Mistral provider', () => {
    act(() => {
      setModelProviderConfig('mistral', { apiKey: mockMistralAPIKey });
    });

    const payload = getProviderAuthPayload(ModelProvider.Mistral);
    expect(payload).toEqual({ apiKey: mockMistralAPIKey });
  });

  it('should return correct payload for Google provider', () => {
    act(() => {
      setModelProviderConfig('google', { apiKey: mockGoogleAPIKey });
    });

    const payload = getProviderAuthPayload(ModelProvider.Google);
    expect(payload).toEqual({ apiKey: mockGoogleAPIKey });
  });

  it('should return correct payload for Bedrock provider', () => {
    // 假设的 Bedrock 配置
    const mockBedrockConfig = {
      accessKeyId: 'bedrock-access-key-id',
      region: 'bedrock-region',
      secretAccessKey: 'bedrock-secret-access-key',
    };
    act(() => {
      setModelProviderConfig('bedrock', mockBedrockConfig);
    });

    const payload = getProviderAuthPayload(ModelProvider.Bedrock);
    expect(payload).toEqual({
      apiKey: mockBedrockConfig.secretAccessKey + mockBedrockConfig.accessKeyId,
      awsAccessKeyId: mockBedrockConfig.accessKeyId,
      awsRegion: mockBedrockConfig.region,
      awsSecretAccessKey: mockBedrockConfig.secretAccessKey,
    });
  });

  it('should return correct payload for Azure provider', () => {
    // 假设的 Azure 配置
    const mockAzureConfig = {
      apiKey: 'azure-api-key',
      apiVersion: 'azure-api-version',
      endpoint: 'azure-endpoint',
    };
    act(() => {
      setModelProviderConfig('azure', mockAzureConfig);
    });

    const payload = getProviderAuthPayload(ModelProvider.Azure);
    expect(payload).toEqual({
      apiKey: mockAzureConfig.apiKey,
      azureApiVersion: mockAzureConfig.apiVersion,
      endpoint: mockAzureConfig.endpoint,
    });
  });

  it('should return correct payload for Ollama provider', () => {
    // 假设的 Ollama 配置
    const mockOllamaProxyUrl = 'ollama-proxy-url';
    act(() => {
      setModelProviderConfig('ollama', { endpoint: mockOllamaProxyUrl });
    });

    const payload = getProviderAuthPayload(ModelProvider.Ollama);
    expect(payload).toEqual({
      endpoint: mockOllamaProxyUrl,
    });
  });

  it('should return correct payload for OpenAI provider', () => {
    // 假设的 OpenAI 配置
    const mockOpenAIConfig = {
      OPENAI_API_KEY: 'openai-api-key',
      endpoint: 'openai-endpoint',
      useAzure: true,
      azureApiVersion: 'openai-azure-api-version',
    };
    act(() => {
      setModelProviderConfig('openAI', mockOpenAIConfig);
    });

    const payload = getProviderAuthPayload(ModelProvider.OpenAI);
    expect(payload).toEqual({
      apiKey: mockOpenAIConfig.OPENAI_API_KEY,
      azureApiVersion: mockOpenAIConfig.azureApiVersion,
      endpoint: mockOpenAIConfig.endpoint,
      useAzure: mockOpenAIConfig.useAzure,
    });
  });

  it('should return an empty object or throw an error for an unknown provider', () => {
    const payload = getProviderAuthPayload('UnknownProvider');
    expect(payload).toEqual({ apiKey: '', endpoint: '' });
  });
});
