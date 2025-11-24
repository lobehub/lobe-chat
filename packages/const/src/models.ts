export const systemToUserModels = new Set([
  'o1-preview',
  'o1-preview-2024-09-12',
  'o1-mini',
  'o1-mini-2024-09-12',
]);

// TODO: 临时写法，后续要重构成 model card 展示配置
export const disableStreamModels = new Set([
  'o1',
  'o1-2024-12-17',
  'o1-pro',
  'o1-pro-2025-03-19',
  /*
  官网显示不支持，但是实际试下来支持 Streaming，暂时注释掉
  'o3-pro',
  'o3-pro-2025-06-10',
  */
  'computer-use-preview',
  'computer-use-preview-2025-03-11',
]);

/**
 * models use Responses API only
 */
export const responsesAPIModels = new Set([
  'o1-pro',
  'o1-pro-2025-03-19',
  'o3-deep-research',
  'o3-deep-research-2025-06-26',
  'o3-pro',
  'o3-pro-2025-06-10',
  'o4-mini-deep-research',
  'o4-mini-deep-research-2025-06-26',
  'codex-mini-latest',
  'computer-use-preview',
  'computer-use-preview-2025-03-11',
]);

/**
 * models support context caching
 */
export const contextCachingModels = new Set([
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5-latest',
  'claude-sonnet-4-5-20250929',
  'anthropic/claude-sonnet-4.5',
  'claude-opus-4-latest',
  'claude-opus-4-20250514',
  'claude-sonnet-4-latest',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku-20241022',
]);

export const thinkingWithToolClaudeModels = new Set([
  'claude-opus-4-latest',
  'claude-opus-4-20250514',
  'claude-sonnet-4-latest',
  'claude-sonnet-4-20250514',
  'claude-sonnet-4-5-latest',
  'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5-20251001',
  'anthropic/claude-sonnet-4.5',
  'claude-3-7-sonnet-latest',
  'claude-3-7-sonnet-20250219',
]);
