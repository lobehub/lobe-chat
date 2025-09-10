import { getComponentInfo, isSystemComponent } from '@/server/services/comfyui/utils/componentInfo';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../types/error';

export interface ComfyUIError {
  code?: number | string;
  details?: any;
  message: string;
  missingFileName?: string;
  missingFileType?: 'model' | 'component';
  status?: number;
  type?: string;
  userGuidance?: string;
}

export interface ParsedError {
  error: ComfyUIError;
  errorType: ILobeAgentRuntimeErrorType;
}

/**
 * Generate user guidance message based on missing file info
 * @param fileName - The missing file name
 * @param fileType - The type of missing file
 * @returns User-friendly guidance message
 */
function generateUserGuidance(fileName: string, fileType: 'model' | 'component'): string {
  if (fileType === 'component') {
    // Use centralized component info utility (DRY principle)
    const componentInfo = getComponentInfo(fileName);

    if (componentInfo) {
      return `Missing ${componentInfo.displayName}: ${fileName}. Please download and place it in the ${componentInfo.folderPath} folder.`;
    }

    // Fallback for unknown components
    return `Missing component file: ${fileName}. Please download and place it in the appropriate ComfyUI models folder.`;
  }

  // Main model files
  return `Missing model file: ${fileName}. Please download and place it in the models/checkpoints folder.`;
}

/**
 * Extract missing file information from error message
 * @param message - Error message that may contain file names
 * @returns Object with extracted file name and type, or null if no file found
 */
function extractMissingFileInfo(message: string): {
  fileName: string;
  fileType: 'model' | 'component';
} | null {
  if (!message) return null;

  // Check for "Expected one of:" pattern from enhanced model errors
  const expectedPattern = /expected one of:\s*([^.]+\.(?:safetensors|ckpt|pt|pth))/i;
  const expectedMatch = message.match(expectedPattern);

  if (expectedMatch) {
    // Extract the first file from the match
    const fileName = expectedMatch[1].trim().split(',')[0].trim();
    if (fileName) {
      return {
        fileName,
        fileType: 'model',
      };
    }
  }

  // Common model file extensions - allow dots in filename
  const modelFilePattern = /([\w.-]+\.(?:safetensors|ckpt|pt|pth))\b/gi;
  const fileMatch = message.match(modelFilePattern);

  if (fileMatch) {
    const fileName = fileMatch[0];

    // Use centralized utility to check if it's a system component
    if (isSystemComponent(fileName)) {
      return {
        fileName,
        fileType: 'component',
      };
    }

    // If not found in SYSTEM_COMPONENTS, treat as main model
    return {
      fileName,
      fileType: 'model',
    };
  }

  return null;
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
 * Check if the error is a model-related error
 * @param error - Error object
 * @returns Whether it's a model error
 */
function isModelError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  // Check for explicit model error patterns
  const hasModelErrorPattern =
    lowerMessage.includes('model not found') ||
    lowerMessage.includes('checkpoint not found') ||
    lowerMessage.includes('model file not found') ||
    lowerMessage.includes('ckpt_name') ||
    lowerMessage.includes('no models available') ||
    lowerMessage.includes('safetensors') ||
    error?.code === 'MODEL_NOT_FOUND';

  // Also check if the error contains a model file that's missing
  if (!hasModelErrorPattern) {
    const fileInfo = extractMissingFileInfo(message);
    return fileInfo !== null; // Any missing model file is considered a model error
  }

  return hasModelErrorPattern;
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
 * Check if the error is a network connection error (including WebSocket)
 * @param error - Error object
 * @returns Whether it's a network connection error
 */
function isNetworkError(error: any): boolean {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    // Basic network errors
    message === 'fetch failed' ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('enotfound') ||
    lowerMessage.includes('etimedout') ||
    lowerMessage.includes('network error') ||
    lowerMessage.includes('connection refused') ||
    lowerMessage.includes('connection timeout') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ETIMEDOUT' ||
    // WebSocket specific errors
    lowerMessage.includes('websocket') ||
    lowerMessage.includes('ws connection') ||
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
 * Simplified version that focuses on extracting essential information
 * @param error - Original error object
 * @returns Structured ComfyUI error information
 */
function extractComfyUIErrorInfo(error: any): ComfyUIError {
  // Handle string errors
  if (typeof error === 'string') {
    const cleanedMessage = cleanComfyUIErrorMessage(error);
    const fileInfo = extractMissingFileInfo(cleanedMessage);

    return {
      message: cleanedMessage,
      missingFileName: fileInfo?.fileName,
      missingFileType: fileInfo?.fileType,
      userGuidance: fileInfo
        ? generateUserGuidance(fileInfo.fileName, fileInfo.fileType)
        : undefined,
    };
  }

  // Handle Error objects - prioritize cause field (SDK pattern)
  if (error instanceof Error) {
    // Check if there's a cause field with actual error details (SDK pattern)
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

    const cleanedMessage = cleanComfyUIErrorMessage(error.message);
    const fileInfo = extractMissingFileInfo(cleanedMessage);

    return {
      code: (error as any).code,
      message: cleanedMessage,
      missingFileName: fileInfo?.fileName,
      missingFileType: fileInfo?.fileType,
      status: (error as any).status || (error as any).statusCode,
      type: error.name,
      userGuidance: fileInfo
        ? generateUserGuidance(fileInfo.fileName, fileInfo.fileType)
        : undefined,
    };
  }

  // Handle structured objects
  if (error && typeof error === 'object') {
    // Check for cause field first (SDK pattern)
    if (error.cause) {
      const causeInfo = extractComfyUIErrorInfo(error.cause);
      return {
        ...causeInfo,
        type: causeInfo.type || error.type || error.name || error.constructor?.name,
      };
    }

    // Extract message from various possible sources
    const possibleMessage = [
      error.exception_message, // ComfyUI specific field (highest priority)
      error.error?.exception_message, // Nested ComfyUI exception message
      error.error?.error, // Deeply nested error.error.error path
      error.message,
      error.error?.message,
      error.data?.message,
      error.body?.message,
      error.response?.data?.message,
      error.response?.data?.error?.message,
      error.response?.text,
      error.response?.body,
      error.statusText,
    ].find(Boolean);

    const message = possibleMessage || String(error);

    // Extract status code from various possible locations
    const possibleStatus = [
      error.status,
      error.statusCode,
      error.details?.status, // ServicesError puts status in details
      error.response?.status,
      error.response?.statusCode,
      error.error?.status,
      error.error?.statusCode,
    ].find(Number.isInteger);

    const code = error.code || error.error?.code || error.response?.data?.code;

    // Extract details including ComfyUI specific fields
    let details = error.response?.data || error.details || undefined;

    // Include ComfyUI specific fields in details
    if (error.node_id || error.node_type || error.nodeId || error.nodeType || error.nodeName) {
      details = {
        ...details,
        nodeName: error.nodeName,
        node_id: error.node_id || error.nodeId,
        node_type: error.node_type || error.nodeType,
      };
    }

    const cleanedMessage = cleanComfyUIErrorMessage(message);
    const fileInfo = extractMissingFileInfo(cleanedMessage);

    return {
      code,
      details,
      message: cleanedMessage,
      missingFileName: fileInfo?.fileName,
      missingFileType: fileInfo?.fileType,
      status: possibleStatus,
      type: error.type || error.name || error.constructor?.name,
      userGuidance: fileInfo
        ? generateUserGuidance(fileInfo.fileName, fileInfo.fileType)
        : undefined,
    };
  }

  // Fallback handling
  const cleanedMessage = cleanComfyUIErrorMessage(String(error));
  const fileInfo = extractMissingFileInfo(cleanedMessage);

  return {
    message: cleanedMessage,
    missingFileName: fileInfo?.fileName,
    missingFileType: fileInfo?.fileType,
    userGuidance: fileInfo ? generateUserGuidance(fileInfo.fileName, fileInfo.fileType) : undefined,
  };
}

/**
 * Parse ComfyUI error message and return structured error information
 * Simplified version that focuses on ComfyUI-specific error handling
 * @param error - Original error object
 * @returns Parsed error object and error type
 */
export function parseComfyUIErrorMessage(error: any): ParsedError {
  const errorInfo = extractComfyUIErrorInfo(error);

  // Default error type
  let errorType: ILobeAgentRuntimeErrorType = AgentRuntimeErrorType.ComfyUIBizError;

  // Check for JSON parsing errors (indicates non-ComfyUI service)
  if (error instanceof SyntaxError || error?.name === 'SyntaxError') {
    const message = error?.message || String(error);
    if (message.includes('JSON') || message.includes('Unexpected token')) {
      // JSON parsing failed - service is not ComfyUI
      errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;
      return {
        error: {
          ...errorInfo,
          message: 'Service is not ComfyUI - received non-JSON response',
          userGuidance:
            'The service at this URL is not a ComfyUI server. Please check your baseURL configuration.',
        },
        errorType,
      };
    }
  }

  // 1. HTTP status code errors (priority check)
  const status = errorInfo.status;
  const message = errorInfo.message;

  switch (status) {
    case 400:
    case 401: {
      // These trigger ComfyUIAuth component
      errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;

      break;
    }
    case 403: {
      // Permission denied
      errorType = AgentRuntimeErrorType.PermissionDenied;

      break;
    }
    case 404: {
      // 404 should trigger ComfyUIAuth for baseURL errors
      errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;

      break;
    }
    default: {
      if (status && status >= 500) {
        // Server errors
        errorType = AgentRuntimeErrorType.ComfyUIServiceUnavailable;
      }
      // 2. Check HTTP status code from error message (when status field doesn't exist)
      else if (!status && message) {
        if (message.includes('HTTP 401') || message.includes('401')) {
          errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;
        } else if (message.includes('HTTP 403') || message.includes('403')) {
          errorType = AgentRuntimeErrorType.PermissionDenied;
        } else if (message.includes('HTTP 404') || message.includes('404')) {
          errorType = AgentRuntimeErrorType.InvalidProviderAPIKey; // 修复：与 switch 保持一致，触发 ComfyUIAuth
        } else if (message.includes('HTTP 400') || message.includes('400')) {
          errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;
        }
      }
    }
  }
  // 3. Check for more specific error types only if it's still a generic ComfyUIBizError
  if (errorType === AgentRuntimeErrorType.ComfyUIBizError) {
    // 4. SDK custom errors (keep as ComfyUIBizError)
    if (isSDKCustomError(error)) {
      // SDK errors remain as ComfyUIBizError
      errorType = AgentRuntimeErrorType.ComfyUIBizError;
    }
    // 5. Network errors (including WebSocket)
    else if (isNetworkError(error)) {
      errorType = AgentRuntimeErrorType.ComfyUIServiceUnavailable;
    }
    // 6. Workflow errors
    else if (isWorkflowError(error)) {
      errorType = AgentRuntimeErrorType.ComfyUIWorkflowError;
    }
    // 7. Model errors - map to framework's ModelNotFound
    else if (isModelError(error)) {
      errorType = AgentRuntimeErrorType.ModelNotFound;
    }
  }

  return {
    error: errorInfo,
    errorType,
  };
}
