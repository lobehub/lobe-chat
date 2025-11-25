import type { ChatStreamPayload } from '../../types';

/**
 * Normalize Anthropic / Bedrock Claude model ids to the canonical Anthropic id.
 * Examples:
 * - anthropic.claude-3-opus-20240229-v1:0 -> claude-3-opus-20240229
 * - us.anthropic.claude-haiku-4-5-20251001-v1:0 -> claude-haiku-4-5-20251001
 */
export const normalizeAnthropicModelId = (modelId: string) => {
  const withoutAlias = modelId.split(':')[0];
  const withoutPrefix = withoutAlias.replace(/^(global\.)?([a-z]+\.)?anthropic\./, '');

  return withoutPrefix.replace(/-v\d+$/, '');
};

const modelsWithSmallContextWindow = new Set(['claude-3-opus-20240229', 'claude-3-haiku-20240307']);

/**
 * Resolve the max_tokens value to align Anthropic and Bedrock behavior.
 * Priority: user input > model-bank default maxOutput > hardcoded fallback (context-window aware).
 */
export const resolveMaxTokens = async ({
  max_tokens,
  model,
  thinking,
}: {
  max_tokens?: number;
  model: string;
  thinking?: ChatStreamPayload['thinking'];
}) => {
  const normalizedModelId = normalizeAnthropicModelId(model);

  const { anthropic: anthropicModels } = await import('model-bank');
  const defaultMaxOutput = anthropicModels.find((m) => m.id === normalizedModelId)?.maxOutput;

  const preferredMaxTokens = max_tokens ?? defaultMaxOutput;

  if (preferredMaxTokens) return preferredMaxTokens;

  if (thinking?.type === 'enabled') return 32_000;

  return modelsWithSmallContextWindow.has(normalizedModelId) ? 4096 : 8192;
};
