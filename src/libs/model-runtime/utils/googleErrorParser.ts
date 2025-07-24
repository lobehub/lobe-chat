import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';

export interface ParsedError {
  error: any;
  errorType: ILobeAgentRuntimeErrorType;
}

export interface GoogleChatError {
  '@type': string;
  'domain': string;
  'metadata': {
    service: string;
  };
  'reason': string;
}

export type GoogleChatErrors = GoogleChatError[];

/**
 * 清理错误消息，移除格式化字符和多余的空格
 * @param message - 原始错误消息
 * @returns 清理后的错误消息
 */
export function cleanErrorMessage(message: string): string {
  return message
    .replaceAll(/^\*\s*/g, '') // 移除开头的星号和空格
    .replaceAll('\\n', '\n') // 转换转义的换行符
    .replaceAll(/\n+/g, ' ') // 将多个换行符替换为单个空格
    .trim(); // 去除首尾空格
}

/**
 * 从错误消息中提取状态码信息
 * @param message - 错误消息
 * @returns 提取的错误详情和前缀
 */
export function extractStatusCodeFromError(message: string): {
  errorDetails: any;
  prefix: string;
} {
  // 使用正则表达式匹配状态码部分 [数字 描述文本]
  const regex = /^(.*?)(\[\d+ [^\]]+])(.*)$/;
  const match = message.match(regex);

  if (match) {
    const prefix = match[1].trim();
    const statusCodeWithBrackets = match[2].trim();
    const messageContent = match[3].trim();

    // 提取状态码数字
    const statusCodeMatch = statusCodeWithBrackets.match(/\[(\d+)/);
    const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1]) : null;

    // 创建包含状态码和消息的JSON
    const resultJson = {
      message: messageContent,
      statusCode: statusCode,
      statusCodeText: statusCodeWithBrackets,
    };

    return {
      errorDetails: resultJson,
      prefix: prefix,
    };
  }

  // 如果无法匹配，返回原始消息
  return {
    errorDetails: null,
    prefix: message,
  };
}

/**
 * 解析Google AI API返回的错误消息
 * @param message - 原始错误消息
 * @returns 解析后的错误对象和错误类型
 */
export function parseGoogleErrorMessage(message: string): ParsedError {
  const defaultError = {
    error: { message },
    errorType: AgentRuntimeErrorType.ProviderBizError,
  };

  // 快速识别特殊错误
  if (message.includes('location is not supported')) {
    return { error: { message }, errorType: AgentRuntimeErrorType.LocationNotSupportError };
  }

  // 统一的错误类型判断函数
  const getErrorType = (code: number | null, message: string): ILobeAgentRuntimeErrorType => {
    if (code === 400 && message.includes('API key not valid')) {
      return AgentRuntimeErrorType.InvalidProviderAPIKey;
    } else if (code === 429) {
      return AgentRuntimeErrorType.QuotaLimitReached;
    }
    return AgentRuntimeErrorType.ProviderBizError;
  };

  // 递归解析JSON，处理嵌套的JSON字符串
  const parseJsonRecursively = (str: string, maxDepth: number = 5): any => {
    if (maxDepth <= 0) return null;

    try {
      const parsed = JSON.parse(str);

      // 如果解析出的对象包含error字段
      if (parsed && typeof parsed === 'object' && parsed.error) {
        const errorInfo = parsed.error;

        // 清理错误消息
        if (typeof errorInfo.message === 'string') {
          errorInfo.message = cleanErrorMessage(errorInfo.message);

          // 如果error.message还是一个JSON字符串，继续递归解析
          try {
            const nestedResult = parseJsonRecursively(errorInfo.message, maxDepth - 1);
            // 只有当深层结果包含带有 code 的 error 对象时，才优先返回深层结果
            if (nestedResult && nestedResult.error && nestedResult.error.code) {
              return nestedResult;
            }
          } catch {
            // 如果嵌套解析失败，使用当前层的信息
          }
        }

        return parsed;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  // 1. 处理 "got status: UNAVAILABLE. {JSON}" 格式
  const statusJsonMatch = message.match(/got status: (\w+)\.\s*({.*})$/);
  if (statusJsonMatch) {
    const statusFromMessage = statusJsonMatch[1];
    const jsonPart = statusJsonMatch[2];

    const parsedError = parseJsonRecursively(jsonPart);
    if (parsedError && parsedError.error) {
      const errorInfo = parsedError.error;
      const finalMessage = errorInfo.message || message;
      const finalCode = errorInfo.code || null;
      const finalStatus = errorInfo.status || statusFromMessage;

      return {
        error: {
          code: finalCode,
          message: finalMessage,
          status: finalStatus,
        },
        errorType: getErrorType(finalCode, finalMessage),
      };
    }
  }

  // 2. 尝试直接解析整个消息作为JSON
  const directParsed = parseJsonRecursively(message);
  if (directParsed && directParsed.error) {
    const errorInfo = directParsed.error;
    const finalMessage = errorInfo.message || message;
    const finalCode = errorInfo.code || null;
    const finalStatus = errorInfo.status || '';

    return {
      error: {
        code: finalCode,
        message: finalMessage,
        status: finalStatus,
      },
      errorType: getErrorType(finalCode, finalMessage),
    };
  }

  // 3. 处理嵌套JSON格式，特别是message字段包含JSON的情况
  try {
    const firstLevelParsed = JSON.parse(message);
    if (firstLevelParsed && firstLevelParsed.error && firstLevelParsed.error.message) {
      const nestedParsed = parseJsonRecursively(firstLevelParsed.error.message);
      if (nestedParsed && nestedParsed.error) {
        const errorInfo = nestedParsed.error;
        const finalMessage = errorInfo.message || message;
        const finalCode = errorInfo.code || null;
        const finalStatus = errorInfo.status || '';

        return {
          error: {
            code: finalCode,
            message: finalMessage,
            status: finalStatus,
          },
          errorType: getErrorType(finalCode, finalMessage),
        };
      }
    }
  } catch {
    // 继续其他解析方式
  }

  // 4. 原有的数组格式解析逻辑
  const startIndex = message.lastIndexOf('[');
  if (startIndex !== -1) {
    try {
      const jsonString = message.slice(startIndex);
      const json: GoogleChatErrors = JSON.parse(jsonString);
      const bizError = json[0];

      if (bizError?.reason === 'API_KEY_INVALID') {
        return { ...defaultError, errorType: AgentRuntimeErrorType.InvalidProviderAPIKey };
      }

      return { error: json, errorType: AgentRuntimeErrorType.ProviderBizError };
    } catch {
      // 忽略解析错误
    }
  }

  // 5. 使用状态码提取逻辑作为最后的后备方案
  const errorObj = extractStatusCodeFromError(message);
  if (errorObj.errorDetails) {
    return { error: errorObj.errorDetails, errorType: AgentRuntimeErrorType.ProviderBizError };
  }

  return defaultError;
}
