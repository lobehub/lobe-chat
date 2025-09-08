import { chainTranslate } from '@lobechat/prompts';
import { TraceNameMap } from '@lobechat/types';
import { useCallback } from 'react';

import { chatService } from '@/services/chat';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/selectors';
import { merge } from '@/utils/merge';

export const useInputTranslate = () => {
  const getCurrentTracePayload = useChatStore((s) => s.getCurrentTracePayload);

  const translateToEnglish = useCallback(
    async (content: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Get current translation settings
        const translationSetting = systemAgentSelectors.translation(useUserStore.getState());
        
        let translatedContent = '';

        chatService
          .fetchPresetTaskResult({
            onFinish: (result) => {
              if (result && typeof result === 'string') {
                resolve(result);
              } else {
                resolve(translatedContent);
              }
            },
            onMessageHandle: (chunk) => {
              if (chunk.type === 'text') {
                translatedContent += chunk.text;
              }
            },
            params: merge(translationSetting, chainTranslate(content, 'en-US')),
            trace: getCurrentTracePayload({ traceName: TraceNameMap.Translator }),
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    [getCurrentTracePayload],
  );

  return {
    translateToEnglish,
  };
};