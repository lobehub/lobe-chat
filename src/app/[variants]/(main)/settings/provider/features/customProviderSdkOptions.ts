import type { AiProviderSDKType } from '@/types/aiProvider';

export const CUSTOM_PROVIDER_SDK_OPTIONS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Azure OpenAI', value: 'azure' },
  { label: 'Azure AI', value: 'azureai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Google', value: 'google' },
  { label: 'Amazon Bedrock', value: 'bedrock' },
  { label: 'OpenRouter', value: 'router' },
  { label: 'Hugging Face', value: 'huggingface' },
  { label: 'Cloudflare', value: 'cloudflare' },
  { label: 'Qwen', value: 'qwen' },
  { label: 'Volcengine', value: 'volcengine' },
  { label: 'Ollama', value: 'ollama' },
] satisfies { label: string; value: AiProviderSDKType }[];
