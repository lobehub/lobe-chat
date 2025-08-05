/**
 * 通用的模型名称美化处理
 */
const beautifyModelName = (name: string): string => {
  let result = name;

  // 处理 :free 后缀
  if (result.endsWith(':free')) {
    result = result.replace(':free', ' (Free)');
  }

  // 处理 -preview 后缀
  if (result.endsWith('-preview')) {
    result = result.replace('-preview', ' Preview');
  }

  // 处理数字和字母的组合（如 30b, 7b, 13b）
  result = result.replaceAll(/(\d+)b/g, '$1B');
  result = result.replaceAll(/(\d+)m/g, '$1M');

  // 将连字符替换为空格并进行首字母大写
  result = result
    .split(/[_-]/)
    .map((word) => {
      // 保持已经是大写的部分
      if (word === word.toUpperCase() && word.length <= 3) {
        return word;
      }
      // 首字母大写
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // 特殊处理一些常见缩写
  result = result
    .replaceAll(/\bGpt\b/g, 'GPT')
    .replaceAll(/\bApi\b/g, 'API')
    .replaceAll(/\bUi\b/g, 'UI')
    .replaceAll(/\bAi\b/g, 'AI')
    .replaceAll(/\bMl\b/g, 'ML')
    .replaceAll(/\bNlp\b/g, 'NLP')
    .replaceAll(/\bLlm\b/g, 'LLM');

  return result.trim();
};

/**
 * 模型显示名称优化工具
 * 将原始模型ID转换为用户友好的显示名称
 */

/**
 * 生成友好的模型显示名称
 */
export const generateModelDisplayName = (modelId: string, originalDisplayName?: string): string => {
  // 如果已有合适的displayName，直接使用
  if (originalDisplayName && originalDisplayName.trim() && originalDisplayName !== modelId) {
    return originalDisplayName;
  }

  // 处理常见的模型ID格式
  let displayName = modelId;

  // 移除提供商前缀（如 openai/, anthropic/, google/ 等）
  displayName = displayName.replace(/^[\dA-Za-z-]+\//, '');

  // 处理特殊格式的模型
  const modelMappings: Record<string, string> = {
    'claude-3-haiku': 'Claude 3 Haiku',
    // Claude 系列
    'claude-3-opus': 'Claude 3 Opus',

    'claude-3-sonnet': 'Claude 3 Sonnet',

    'claude-3.5-sonnet': 'Claude 3.5 Sonnet',

    // DeepSeek 系列
    'deepseek-chat': 'DeepSeek Chat',

    'deepseek-coder': 'DeepSeek Coder',

    'deepseek-r1': 'DeepSeek R1',

    'deepseek-r1:free': 'DeepSeek R1 (Free)',

    'gemini-1.5-pro': 'Gemini 1.5 Pro',

    // Gemini 系列
    'gemini-pro': 'Gemini Pro',

    'gemini-pro-vision': 'Gemini Pro Vision',

    'gpt-3.5-turbo': 'GPT-3.5 Turbo',

    'gpt-4': 'GPT-4',

    'gpt-4-turbo': 'GPT-4 Turbo',

    // GPT 系列
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',

    'qwen/qwen3-30b-a3b:free': 'Qwen3 30B A3B (Free)',
    // Qwen 系列
    'qwen2': 'Qwen2',
    'qwen2.5': 'Qwen2.5',
    'qwen3-30b-a3b:free': 'Qwen3 30B A3B (Free)',
  };

  // 检查是否有直接映射
  if (modelMappings[displayName]) {
    return modelMappings[displayName];
  }

  // 通用的名称美化处理
  displayName = beautifyModelName(displayName);

  return displayName;
};

/**
 * 检查模型是否为免费版本
 */
export const isModelFree = (modelId: string): boolean => {
  return modelId.includes(':free') || modelId.includes('free') || modelId.includes('Free');
};

/**
 * 提取模型的核心名称（移除提供商前缀和版本后缀）
 */
export const extractModelCoreName = (modelId: string): string => {
  let name = modelId;

  // 移除提供商前缀
  name = name.replace(/^[\dA-Za-z-]+\//, '');

  // 移除版本后缀
  name = name.replace(/:(free|preview|beta|alpha)$/i, '');

  return name;
};
