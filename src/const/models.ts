export const systemToUserModels = new Set([
  'o1-preview',
  'o1-preview-2024-09-12',
  'o1-mini',
  'o1-mini-2024-09-12',
]);

// TODO: 临时写法，后续要重构成 model card 展示配置
export const disableStreamModels = new Set(['o1', 'o1-2024-12-17']);

/**
 * models support context caching
 */
export const contextCachingModels = new Set([
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
  'claude-3-7-sonnet-latest',
  'claude-3-7-sonnet-20250219',
]);
