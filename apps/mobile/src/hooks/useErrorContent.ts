import { AgentRuntimeErrorType } from '@lobechat/model-runtime';
import { ChatErrorType, ChatMessageError } from '@lobechat/types';
import { AlertProps } from '@lobehub/ui-rn';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviderName } from './useProviderName';

// Config for the errorMessage display
const getErrorAlertConfig = (errorType?: string | number): Partial<AlertProps> | undefined => {
  // OpenAIBizError / ZhipuBizError / GoogleBizError / ...
  if (typeof errorType === 'string' && (errorType.includes('Biz') || errorType.includes('Invalid')))
    return {
      type: 'warning',
    };

  switch (errorType) {
    case ChatErrorType.SystemTimeNotMatchError:
    case AgentRuntimeErrorType.PermissionDenied:
    case AgentRuntimeErrorType.InsufficientQuota:
    case AgentRuntimeErrorType.ModelNotFound:
    case AgentRuntimeErrorType.QuotaLimitReached:
    case AgentRuntimeErrorType.ExceededContextWindow:
    case AgentRuntimeErrorType.LocationNotSupportError: {
      return {
        type: 'warning',
      };
    }

    case AgentRuntimeErrorType.OllamaServiceUnavailable:
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.ComfyUIServiceUnavailable:
    case AgentRuntimeErrorType.InvalidComfyUIArgs: {
      return {
        type: 'warning',
      };
    }

    default: {
      return undefined;
    }
  }
};

export const useErrorContent = (error?: ChatMessageError | null): AlertProps | undefined => {
  const { t } = useTranslation('error');
  const providerName = useProviderName(error?.body?.provider || '');

  return useMemo<AlertProps | undefined>(() => {
    if (!error) return;

    const alertConfig = getErrorAlertConfig(error.type);

    return {
      message: t(`response.${error.type}` as any, { provider: providerName }),
      type: 'error',
      ...alertConfig,
    };
  }, [error, providerName, t]);
};
