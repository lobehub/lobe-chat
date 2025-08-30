import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';

export interface ComfyUIError {
  code?: number | string;
  details?: any;
  message: string;
  status?: number;
  type?: string;
}

export interface ParsedError {
  error: ComfyUIError;
  errorType: ILobeAgentRuntimeErrorType;
}

/**
 * Clean ComfyUI error message by removing formatting characters and extra spaces
 * @param message - Original error message
 * @returns Cleaned error message
 */
export function cleanComfyUIErrorMessage(message: string): string {
  return message
    .replaceAll(/^\*\s*/g, '') // Remove leading asterisks and spaces
    .replaceAll('\\n', '\n') // Convert escaped newlines
    .replaceAll(/\n+/g, ' ') // Replace multiple newlines with single space
    .trim(); // Remove leading and trailing spaces
}

/**
 * Check if the error is a network connection error
 * @param error - Error object
 * @returns Whether it's a network connection error
 */
function isNetworkError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    message === 'fetch failed' ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('enotfound') ||
    lowerMessage.includes('etimedout') ||
    lowerMessage.includes('network error') ||
    lowerMessage.includes('connection refused') ||
    lowerMessage.includes('connection timeout') ||
    lowerMessage.includes('websocket') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ETIMEDOUT'
  );
}

/**
 * Check if the error is model-related
 * @param error - Error object
 * @returns Whether it's a model error
 */
function isModelError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('model not found') ||
    lowerMessage.includes('checkpoint not found') ||
    lowerMessage.includes('model file not found') ||
    lowerMessage.includes('ckpt_name') ||
    lowerMessage.includes('no models available') ||
    lowerMessage.includes('safetensors') ||
    error?.code === 'MODEL_NOT_FOUND'
  );
}

/**
 * Check if the error is a ComfyUI SDK custom error
 * @param error - Error object
 * @returns Whether it's a SDK custom error
 */
function isSDKCustomError(error: any): boolean {
  if (!error) return false;

  // Check for SDK error class names
  const errorName = error?.name || error?.constructor?.name || '';
  const sdkErrorTypes = [
    // Base error class
    'CallWrapperError',
    // Actual SDK error classes from comfyui-sdk
    'WentMissingError',
    'FailedCacheError',
    'EnqueueFailedError',
    'DisconnectedError',
    'ExecutionFailedError',
    'CustomEventError',
    'ExecutionInterruptedError',
    'MissingNodeError',
  ];

  if (sdkErrorTypes.includes(errorName)) {
    return true;
  }

  // Check for SDK error messages patterns
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('sdk error:') ||
    lowerMessage.includes('call wrapper') ||
    lowerMessage.includes('execution interrupted') ||
    lowerMessage.includes('missing node type') ||
    lowerMessage.includes('invalid model configuration') ||
    lowerMessage.includes('workflow validation failed') ||
    lowerMessage.includes('sdk timeout') ||
    lowerMessage.includes('sdk configuration error')
  );
}

/**
 * Check if the error is a WebSocket lifecycle error
 * @param error - Error object
 * @returns Whether it's a WebSocket lifecycle error
 */
function isWebSocketLifecycleError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('websocket initialization failed') ||
    lowerMessage.includes('maximum reconnection attempts') ||
    lowerMessage.includes('websocket connection lost') ||
    lowerMessage.includes('websocket handshake failed') ||
    lowerMessage.includes('websocket timeout') ||
    lowerMessage.includes('websocket disconnected') ||
    lowerMessage.includes('websocket error:') ||
    lowerMessage.includes('ws connection') ||
    lowerMessage.includes('websocket closed unexpectedly') ||
    lowerMessage.includes('connection lost to comfyui server') ||
    error?.code === 'WS_CONNECTION_FAILED' ||
    error?.code === 'WS_TIMEOUT' ||
    error?.code === 'WS_HANDSHAKE_FAILED'
  );
}

/**
 * Check if the error is a ComfyUI workflow error
 * @param error - Error object
 * @returns Whether it's a workflow error
 */
function isWorkflowError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  // Check for structured workflow error fields
  if (
    error &&
    typeof error === 'object' &&
    (error.node_id || error.nodeId || error.node_type || error.nodeType)
  ) {
    return true;
  }

  return (
    lowerMessage.includes('node') ||
    lowerMessage.includes('workflow') ||
    lowerMessage.includes('execution') ||
    lowerMessage.includes('prompt') ||
    lowerMessage.includes('queue') ||
    lowerMessage.includes('invalid input') ||
    lowerMessage.includes('missing required') ||
    lowerMessage.includes('node execution failed') ||
    lowerMessage.includes('workflow validation') ||
    error?.type === 'workflow_error'
  );
}

/**
 * Extract structured information from error object
 * @param error - Original error object
 * @returns Structured ComfyUI error information
 */
function extractComfyUIErrorInfo(error: any): ComfyUIError {
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: cleanComfyUIErrorMessage(error),
    };
  }

  // Handle Error objects (higher priority than generic object check)
  if (error instanceof Error) {
    // Check if there's a cause field with actual error details (SDK pattern)
    // Always prefer the cause if it exists, as it contains the actual error
    if ((error as any).cause) {
      const cause = (error as any).cause;
      // Recursively extract error info from cause
      const causeInfo = extractComfyUIErrorInfo(cause);
      return {
        ...causeInfo,
        // Preserve the original error type if cause doesn't have one
        type: causeInfo.type || error.name,
      };
    }

    return {
      code: (error as any).code,
      message: cleanComfyUIErrorMessage(error.message),
      status: (error as any).status || (error as any).statusCode,
      type: error.name,
    };
  }

  // If error is already a structured ComfyUIError (but not a nested error object)
  if (error && typeof error === 'object' && error.message && !error.error) {
    // Check if there's an exception_message that should override the message
    const finalMessage = error.exception_message || error.message;

    // Handle ComfyUI specific fields in details
    let details = error.response?.data || error.details;
    if (error.node_id || error.node_type || error.nodeId || error.nodeType) {
      details = {
        ...details,
        node_id: error.node_id || error.nodeId,
        node_type: error.node_type || error.nodeType,
      };
    }

    return {
      code: error.code,
      details,
      message: cleanComfyUIErrorMessage(finalMessage),
      status: error.status || error.statusCode,
      type: error.type,
    };
  }

  // Handle other object types - restore more comprehensive status code extraction
  if (error && typeof error === 'object') {
    // Check for cause field first (SDK pattern)
    // Always prefer cause if it exists, as it contains the actual error details
    if (error.cause) {
      const causeInfo = extractComfyUIErrorInfo(error.cause);
      return {
        ...causeInfo,
        type: causeInfo.type || error.type || error.name || error.constructor?.name,
      };
    }

    // Enhanced message extraction from various possible sources including ComfyUI specific formats
    // Put exception_message first as it usually contains more detailed information
    const possibleMessage = [
      error.exception_message, // ComfyUI specific field (highest priority)
      error.error?.exception_message, // Nested ComfyUI exception message
      error.error?.error, // Deeply nested error.error.error path
      error.message,
      error.error?.message,
      error.details, // Restore: original version had this path
      error.data?.message,
      error.body?.message,
      error.response?.data?.message,
      error.response?.data?.error?.message,
      error.response?.text,
      error.response?.body,
      error.statusText, // Restore: original version had this path
    ].find(Boolean);

    const message = possibleMessage || String(error);

    // Restore more comprehensive status code extraction logic
    const possibleStatus = [
      error.status,
      error.statusCode,
      error.response?.status,
      error.response?.statusCode,
      error.error?.status,
      error.error?.statusCode,
    ].find(Number.isInteger);

    const code = error.code || error.error?.code || error.response?.data?.code;

    // Enhanced details extraction including ComfyUI specific fields
    let details = error.response?.data || error.details || error.error || undefined;

    // Include ComfyUI specific fields in details
    if (error.node_id || error.node_type || error.nodeId || error.nodeType) {
      details = {
        ...details,
        node_id: error.node_id || error.nodeId,
        node_type: error.node_type || error.nodeType,
      };
    }

    return {
      code,
      details,
      message: cleanComfyUIErrorMessage(message),
      status: possibleStatus,
      type: error.type || error.name || error.constructor?.name,
    };
  }

  // Fallback handling
  return {
    message: cleanComfyUIErrorMessage(String(error)),
  };
}

/**
 * Parse ComfyUI error message and return structured error information
 * Enhanced to extract more useful information while maintaining interface compatibility
 * @param error - Original error object
 * @returns Parsed error object and error type
 */
export function parseComfyUIErrorMessage(error: any): ParsedError {
  const comfyError = extractComfyUIErrorInfo(error);

  // Enhanced: extract additional helpful information from error message
  const message = comfyError.message;
  let enhancedDetails = comfyError.details || {};

  // Extract useful information patterns from message
  if (message) {
    // CUDA out of memory detection - provide helpful suggestion
    if (message.includes('CUDA out of memory') || message.includes('OutOfMemoryError')) {
      enhancedDetails.resourceIssue = 'memory';
      enhancedDetails.suggestion = 'Try reducing image size or batch size';
    }

    // Extract model name from error message
    if (message.includes('Model') || message.includes('checkpoint')) {
      const modelMatch = message.match(/Model[:\s]+([^\s,]+)|checkpoint[:\s]+([^\s,]+)/i);
      if (modelMatch) {
        enhancedDetails.modelName = modelMatch[1] || modelMatch[2];
      }
    }

    // Extract node information from error message
    if (message.includes('node') || message.includes('Node')) {
      const nodeMatch = message.match(/node[:\s]+([^\s,]+)|Node[:\s]+([^\s,]+)/i);
      if (nodeMatch) {
        enhancedDetails.nodeInfo = nodeMatch[1] || nodeMatch[2];
      }
    }

    // Connection issue detection
    if (message.includes('Connection') || message.includes('connection')) {
      enhancedDetails.connectionIssue = true;
    }

    // Add timestamp for debugging
    enhancedDetails.timestamp = new Date().toISOString();

    // Preserve original error info in development
    if (process.env.NODE_ENV !== 'production') {
      enhancedDetails.originalMessage = message;
      if (error instanceof Error) {
        enhancedDetails.errorName = error.name;
        enhancedDetails.stack = error.stack;
      }
    }
  }

  // Update comfyError with enhanced details
  const enhancedError = {
    ...comfyError,
    details: enhancedDetails,
  };

  // 1. HTTP status code errors (priority check)
  const status = comfyError.status;
  if (status) {
    if (status === 401) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
      };
    }

    if (status === 403) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.PermissionDenied,
      };
    }

    // 400 indicates bad request, usually configuration or authentication error
    if (status === 400) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
      };
    }

    // 404 indicates service endpoint does not exist, meaning ComfyUI service is unavailable or address is incorrect
    if (status === 404) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
      };
    }

    if (status >= 500) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
      };
    }
  }

  // 2. SDK custom errors (high priority)
  if (isSDKCustomError(error)) {
    return {
      error: enhancedError,
      errorType: AgentRuntimeErrorType.ComfyUIBizError,
    };
  }

  // 3. WebSocket lifecycle errors (check before general network errors)
  if (isWebSocketLifecycleError(error)) {
    return {
      error: enhancedError,
      errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
    };
  }

  // 4. Network connection errors (only check when no HTTP status code)
  if (!status && isNetworkError(error)) {
    return {
      error: enhancedError,
      errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
    };
  }

  // 5. Check HTTP status code from error message (when status field doesn't exist)
  if (!status && message) {
    if (message.includes('HTTP 401') || message.includes('401')) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
      };
    }
    if (message.includes('HTTP 400') || message.includes('400')) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
      };
    }
    if (message.includes('HTTP 403') || message.includes('403')) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.PermissionDenied,
      };
    }
    if (message.includes('HTTP 404') || message.includes('404')) {
      return {
        error: enhancedError,
        errorType: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
      };
    }
  }

  // 6. Model-related errors
  if (isModelError(error)) {
    return {
      error: enhancedError,
      errorType: AgentRuntimeErrorType.ModelNotFound,
    };
  }

  // 7. Workflow errors (enhanced with node-specific detection)
  if (isWorkflowError(error)) {
    return {
      error: enhancedError,
      errorType: AgentRuntimeErrorType.ComfyUIWorkflowError,
    };
  }

  // 8. Other ComfyUI business errors (default)
  return {
    error: enhancedError,
    errorType: AgentRuntimeErrorType.ComfyUIBizError,
  };
}
