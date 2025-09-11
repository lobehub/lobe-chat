/**
 * Error Handler Service
 *
 * Centralized error handling for ComfyUI runtime
 * Maps internal errors to framework errors
 */
import {
  AgentRuntimeError,
  AgentRuntimeErrorType,
  ILobeAgentRuntimeErrorType,
} from '@lobechat/model-runtime';
import {
  ConfigError,
  ServicesError,
  UtilsError,
  WorkflowError,
  isComfyUIInternalError,
} from '@/server/services/comfyui/errors';
import { ModelResolverError } from '@/server/services/comfyui/errors/modelResolverError';

interface ComfyUIError {
  code?: number | string;
  details?: any;
  message: string;
  status?: number;
  type?: string;
}

interface ParsedError {
  error: ComfyUIError;
  errorType: ILobeAgentRuntimeErrorType;
}

/**
 * Simple ComfyUI error parser
 * Extracts error information and determines error type
 */
function parseComfyUIErrorMessage(error: any): ParsedError {
  // Default error info
  let message = 'Unknown error';
  let status: number | undefined;
  let code: string | undefined;
  let errorType: ILobeAgentRuntimeErrorType = AgentRuntimeErrorType.ComfyUIBizError;

  // Extract message
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    code = (error as any).code;
  } else if (error && typeof error === 'object') {
    message = error.message || error.error?.message || String(error);
    status = error.status || error.statusCode || error.response?.status;
    code = error.code || error.error?.code;
  }

  // Determine error type based on status code
  if (status) {
    switch (status) {
      case 400:
      case 401:
      case 404:
        errorType = AgentRuntimeErrorType.InvalidProviderAPIKey;
        break;
      case 403:
        errorType = AgentRuntimeErrorType.PermissionDenied;
        break;
      default:
        if (status >= 500) {
          errorType = AgentRuntimeErrorType.ComfyUIServiceUnavailable;
        }
    }
  }

  // Check for network errors
  const lowerMessage = message.toLowerCase();
  if (
    message === 'fetch failed' ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('network error')
  ) {
    errorType = AgentRuntimeErrorType.ComfyUIServiceUnavailable;
  }

  // Check for model errors
  if (
    lowerMessage.includes('model not found') ||
    lowerMessage.includes('checkpoint not found') ||
    lowerMessage.includes('safetensors')
  ) {
    errorType = AgentRuntimeErrorType.ModelNotFound;
  }

  return {
    error: {
      code,
      message,
      status,
      type: error?.name || error?.type,
    },
    errorType,
  };
}

/**
 * Error Handler Service
 * Provides unified error handling and transformation
 */
export class ErrorHandlerService {
  /**
   * Handle and transform any error into framework error
   * Enhanced to preserve more debugging information while maintaining compatibility
   * @param error - The error to handle
   * @throws {AgentRuntimeError} Always throws a properly formatted error
   */
  handleError(error: unknown): never {
    // 1. If already a framework error, pass through (maintain existing behavior)
    if (error && typeof error === 'object' && 'errorType' in error) {
      throw error;
    }

    // 2. Handle ComfyUI internal errors - enhance information preservation
    if (isComfyUIInternalError(error)) {
      const errorType = this.mapInternalErrorToRuntimeError(error);

      // Enhanced: preserve more context information
      const enhancedError = {
        details: error.details || {},
        message: error.message,
        // New: preserve original error type and reason
        originalErrorType: error.constructor.name,
        originalReason: error.reason,
        // New: preserve stack trace in development
        ...(process.env.NODE_ENV !== 'production' && {
          originalError: error,
          stack: error.stack,
        }),
      };

      throw AgentRuntimeError.createImage({
        error: enhancedError,
        errorType: errorType as ILobeAgentRuntimeErrorType,
        provider: 'comfyui',
      });
    }

    // 3. Parse other errors - use enhanced parser with more information
    const { error: parsedError, errorType } = parseComfyUIErrorMessage(error);

    // Enhanced: add more context
    const enhancedParsedError = {
      ...parsedError,
      // New: timestamp and request ID (if available)
      timestamp: new Date().toISOString(),
      // Preserve original error info for debugging
      ...(process.env.NODE_ENV !== 'production' && {
        originalError:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      }),
    };

    throw AgentRuntimeError.createImage({
      error: enhancedParsedError,
      errorType,
      provider: 'comfyui',
    });
  }

  /**
   * Map internal ComfyUI errors to runtime error types
   */
  private mapInternalErrorToRuntimeError(
    error: ConfigError | WorkflowError | UtilsError | ServicesError | ModelResolverError,
  ): string {
    if (error instanceof ConfigError) {
      const mapping: Record<string, string> = {
        [ConfigError.Reasons.INVALID_CONFIG]: AgentRuntimeErrorType.ComfyUIBizError,
        [ConfigError.Reasons.MISSING_CONFIG]: AgentRuntimeErrorType.ComfyUIBizError,
        [ConfigError.Reasons.CONFIG_PARSE_ERROR]: AgentRuntimeErrorType.ComfyUIBizError,
        [ConfigError.Reasons.REGISTRY_ERROR]: AgentRuntimeErrorType.ComfyUIBizError,
      };
      return mapping[error.reason] || AgentRuntimeErrorType.ComfyUIBizError;
    }

    if (error instanceof WorkflowError) {
      const mapping: Record<string, string> = {
        [WorkflowError.Reasons.INVALID_CONFIG]: AgentRuntimeErrorType.ComfyUIWorkflowError,
        [WorkflowError.Reasons.MISSING_COMPONENT]: AgentRuntimeErrorType.ComfyUIModelError,
        [WorkflowError.Reasons.MISSING_ENCODER]: AgentRuntimeErrorType.ComfyUIModelError,
        [WorkflowError.Reasons.UNSUPPORTED_MODEL]: AgentRuntimeErrorType.ModelNotFound,
        [WorkflowError.Reasons.INVALID_PARAMS]: AgentRuntimeErrorType.ComfyUIWorkflowError,
      };
      return mapping[error.reason] || AgentRuntimeErrorType.ComfyUIWorkflowError;
    }

    if (error instanceof ServicesError) {
      // If error already has parsed errorType in details, use it directly
      if (error.details?.errorType) {
        return error.details.errorType;
      }

      // Otherwise use mapping table
      const mapping: Record<string, string> = {
        [ServicesError.Reasons.INVALID_ARGS]: AgentRuntimeErrorType.InvalidComfyUIArgs,
        [ServicesError.Reasons.INVALID_AUTH]: AgentRuntimeErrorType.InvalidProviderAPIKey,
        [ServicesError.Reasons.INVALID_CONFIG]: AgentRuntimeErrorType.InvalidComfyUIArgs,
        [ServicesError.Reasons.CONNECTION_FAILED]: AgentRuntimeErrorType.InvalidProviderAPIKey, // Trigger auth dialog for connection issues
        [ServicesError.Reasons.UPLOAD_FAILED]: AgentRuntimeErrorType.ComfyUIBizError,
        [ServicesError.Reasons.EXECUTION_FAILED]: AgentRuntimeErrorType.ComfyUIWorkflowError,
        [ServicesError.Reasons.MODEL_NOT_FOUND]: AgentRuntimeErrorType.ModelNotFound,
        [ServicesError.Reasons.EMPTY_RESULT]: AgentRuntimeErrorType.ComfyUIBizError,
        [ServicesError.Reasons.IMAGE_FETCH_FAILED]: AgentRuntimeErrorType.ComfyUIBizError,
        [ServicesError.Reasons.IMAGE_TOO_LARGE]: AgentRuntimeErrorType.ComfyUIBizError,
        [ServicesError.Reasons.UNSUPPORTED_PROTOCOL]: AgentRuntimeErrorType.ComfyUIBizError,
        [ServicesError.Reasons.MODEL_VALIDATION_FAILED]: AgentRuntimeErrorType.ModelNotFound,
        [ServicesError.Reasons.WORKFLOW_BUILD_FAILED]: AgentRuntimeErrorType.ComfyUIWorkflowError,
      };
      return mapping[error.reason] || AgentRuntimeErrorType.ComfyUIBizError;
    }

    if (error instanceof UtilsError || error instanceof ModelResolverError) {
      const mapping: Record<string, string> = {
        CONNECTION_ERROR: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
        DETECTION_FAILED: AgentRuntimeErrorType.ComfyUIBizError,
        INVALID_API_KEY: AgentRuntimeErrorType.InvalidProviderAPIKey,
        INVALID_MODEL_FORMAT: AgentRuntimeErrorType.ComfyUIBizError,
        MODEL_NOT_FOUND: AgentRuntimeErrorType.ModelNotFound,
        NO_BUILDER_FOUND: AgentRuntimeErrorType.ComfyUIWorkflowError,
        PERMISSION_DENIED: AgentRuntimeErrorType.PermissionDenied,
        ROUTING_FAILED: AgentRuntimeErrorType.ComfyUIWorkflowError,
        SERVICE_UNAVAILABLE: AgentRuntimeErrorType.ComfyUIServiceUnavailable,
      };
      return mapping[error.reason] || AgentRuntimeErrorType.ComfyUIBizError;
    }

    return AgentRuntimeErrorType.ComfyUIBizError;
  }
}
