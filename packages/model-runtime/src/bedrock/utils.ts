/**
 * Utility functions for Bedrock model runtime
 */

// Re-export from dedicated utility
export { parseModelList, validateModelListSyntax } from './modelListParser';

// Type imports
type RequestInit = globalThis.RequestInit;

/**
 * Creates HTTP request options with timeout for Bedrock API calls
 * @param body - Request body
 * @param bearerToken - Authorization token
 * @param signal - Optional abort signal
 * @returns Fetch options and cleanup function
 */
export function createBedrockRequestOptions(
  body: any,
  bearerToken: string,
  signal?: AbortSignal,
): { cleanup: () => void; options: RequestInit } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s timeout

  return {
    cleanup: () => clearTimeout(timeoutId),
    options: {
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: signal || controller.signal,
    },
  };
}

/**
 * Executes a fetch request with retry logic
 * @param url - Request URL
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Retry on server errors (5xx) or rate limits (429)
      if (response.status >= 500 || response.status === 429) {
        if (attempt === maxRetries) return response;
        await new Promise((resolve) => {
          setTimeout(resolve, Math.pow(2, attempt) * 1000);
        });
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;
      await new Promise((resolve) => {
        setTimeout(resolve, Math.pow(2, attempt) * 1000);
      });
    }
  }

  throw lastError!;
}

/**
 * Regex for reliable Claude model detection
 */
export const CLAUDE_MODEL_REGEX = /^claude[\w-]*(:|$)/i;

/**
 * Builds HTTP request body for Bedrock Converse API
 * @param payload - Chat stream payload
 * @param systemMessage - Optional system message
 * @param converseMessages - Processed user/assistant messages
 * @returns Request body object
 */
export function buildConverseRequestBody(
  payload: {
    max_tokens?: number;
    model: string;
    temperature?: number;
    tools?: any[];
    top_p?: number;
  },
  converseMessages: any[],
  systemMessage?: { content: string },
  tools?: any[],
): any {
  const requestBody: any = {
    inferenceConfig: {
      maxTokens: payload.max_tokens || 4096,
    },
    messages: converseMessages,
  };

  // Add system message if present
  if (systemMessage?.content) {
    requestBody.system = [{ text: systemMessage.content }];
  }

  // Add temperature with model-specific scaling
  if (payload.temperature !== undefined) {
    if (CLAUDE_MODEL_REGEX.test(payload.model)) {
      requestBody.inferenceConfig.temperature = payload.temperature / 2;
    } else {
      requestBody.inferenceConfig.temperature = payload.temperature;
    }
  }

  if (payload.top_p !== undefined) {
    requestBody.inferenceConfig.topP = payload.top_p;
  }

  // Add tools if present
  if (tools && tools.length > 0) {
    requestBody.toolConfig = { tools };
  }

  return requestBody;
}

/**
 * Processes and validates chat messages for Bedrock Converse API
 * @param messages - Raw chat messages
 * @returns Processed messages and system message
 */
export function processConverseMessages(messages: any[]): {
  converseMessages: any[];
  systemMessage?: { content: string };
} {
  const systemMessage = messages.find(
    (m): m is { content: string; role: 'system' } =>
      m.role === 'system' && typeof m.content === 'string',
  );

  const userMessages = messages.filter((m) => m.role !== 'system');

  const converseMessages = userMessages
    .filter((msg) => msg.content && (msg.content as string).trim())
    .map((msg) => {
      let mappedRole: string;
      switch (msg.role) {
        case 'assistant': {
          mappedRole = 'assistant';
          break;
        }
        case 'user': {
          mappedRole = 'user';
          break;
        }
        case 'system': {
          mappedRole = 'system';
          break;
        }
        default: {
          console.warn(`Unknown message role encountered: ${msg.role}. Defaulting to 'user'.`);
          mappedRole = 'user';
        }
      }
      return {
        content: [{ text: (msg.content as string).trim() }],
        role: mappedRole,
      };
    });

  return { converseMessages, systemMessage };
}

/**
 * Valid AWS Bedrock regions
 */
export const VALID_BEDROCK_REGIONS = new Set([
  'us-east-1',
  'us-east-2',
  'us-west-2',
  'ap-south-1',
  'ap-south-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-central-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'eu-south-1',
  'eu-south-2',
  'sa-east-1',
  'us-gov-east-1',
  'us-gov-west-1',
]);

/**
 * Handles Bedrock API errors and creates appropriate error responses
 * @param error - The caught error
 * @param region - AWS region
 * @returns AgentRuntimeError
 */
export function handleBedrockError(error: any, region: string): any {
  // Import dynamically to avoid circular dependencies
  const { AgentRuntimeError } = require('../utils/createError');
  const { AgentRuntimeErrorType } = require('../error');
  const { ModelProvider } = require('../types');

  return AgentRuntimeError.chat({
    error: {
      body: undefined,
      message: error.message,
      type: error.name,
    },
    errorType: AgentRuntimeErrorType.ProviderBizError,
    provider: ModelProvider.Bedrock,
    region,
  });
}
