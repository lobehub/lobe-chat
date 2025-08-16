/**
 * Model list parsing utility for Bedrock provider
 * Handles inclusion/exclusion syntax with 'all', '+model', '-model' patterns
 */

/**
 * Parses a model list string with inclusion/exclusion syntax
 * @param modelList - Comma-separated list with 'all', '+model', '-model' syntax
 * @param availableModels - Array of all available model IDs
 * @returns Array of filtered model IDs
 *
 * @example
 * parseModelList('all,-claude-v1', ['claude-v1', 'claude-v2', 'titan'])
 * // Returns: ['claude-v2', 'titan']
 *
 * parseModelList('+claude-v2,+titan', ['claude-v1', 'claude-v2', 'titan'])
 * // Returns: ['claude-v2', 'titan']
 *
 * parseModelList('claude-v2,titan', ['claude-v1', 'claude-v2', 'titan'])
 * // Returns: ['claude-v2', 'titan']
 */
export function parseModelList(modelList: string, availableModels: string[]): string[] {
  if (!modelList || !modelList.trim()) {
    return [];
  }

  const items = modelList
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return [];
  }

  const inclusions: string[] = [];
  const exclusions: string[] = [];
  let includeAll = false;

  for (const entry of items) {
    if (entry === 'all') {
      includeAll = true;
    } else if (entry.startsWith('-')) {
      const modelId = entry.slice(1);
      if (modelId) exclusions.push(modelId);
    } else if (entry.startsWith('+')) {
      const modelId = entry.slice(1);
      if (modelId) inclusions.push(modelId);
    } else {
      inclusions.push(entry);
    }
  }

  let finalModels: string[];
  if (includeAll) {
    finalModels = availableModels.filter((m) => !exclusions.includes(m));
  } else {
    finalModels = inclusions.filter((m) => availableModels.includes(m) && !exclusions.includes(m));
  }

  // Remove duplicates using Set
  return [...new Set(finalModels)];
}

/**
 * Validates model list syntax
 * @param modelList - Model list string to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateModelListSyntax(modelList: string): { error?: string; valid: boolean } {
  if (!modelList || !modelList.trim()) {
    return { valid: true }; // Empty list is valid
  }

  const items = modelList
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  for (const item of items) {
    if (item === 'all') {
      continue;
    }

    if (item.startsWith('-') || item.startsWith('+')) {
      const modelId = item.slice(1);
      if (!modelId) {
        return {
          error: `Invalid syntax: '${item}' - prefix must be followed by model ID`,
          valid: false,
        };
      }
    }

    // Check for invalid characters (basic validation)
    // Allow colons for cross-region inference profile IDs (e.g., us.amazon.nova-premier-v1:0)
    if (!/^[\w+.:-]+$/.test(item)) {
      return {
        error: `Invalid model ID: '${item}' - contains invalid characters`,
        valid: false,
      };
    }
  }

  return { valid: true };
}
