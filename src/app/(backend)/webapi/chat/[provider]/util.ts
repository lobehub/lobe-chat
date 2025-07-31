import { ChatMethodOptions } from '@/libs/model-runtime';

export const mergeMultipleCompletionOptions = (options: ChatMethodOptions[]): ChatMethodOptions => {
  let completionOptions: ChatMethodOptions = {};
  completionOptions.callback = {
    onCompletion: async (data) => {
      for (const option of options) {
        if (option.callback?.onCompletion) {
          await option.callback.onCompletion(data);
        }
      }
    },
    onFinal: async (data) => {
      for (const option of options) {
        if (option.callback?.onFinal) {
          await option.callback.onFinal(data);
        }
      }
    },
    onGrounding: async (data) => {
      for (const option of options) {
        if (option.callback?.onGrounding) {
          await option.callback.onGrounding(data);
        }
      }
    },
    onStart: async () => {
      for (const option of options) {
        if (option.callback?.onStart) {
          await option.callback.onStart();
        }
      }
    },
    onText: async (data) => {
      for (const option of options) {
        if (option.callback?.onText) {
          await option.callback.onText(data);
        }
      }
    },
    onThinking: async (data) => {
      for (const option of options) {
        if (option.callback?.onThinking) {
          await option.callback.onThinking(data);
        }
      }
    },
    onToolsCalling: async (data) => {
      for (const option of options) {
        if (option.callback?.onToolsCalling) {
          await option.callback.onToolsCalling(data);
        }
      }
    },
    onUsage: async (data) => {
      for (const option of options) {
        if (option.callback?.onUsage) {
          await option.callback.onUsage(data);
        }
      }
    },
  };
  completionOptions.headers = options.reduce((acc, option) => {
    return {
      ...acc,
      ...option.headers,
    };
  }, {});
  completionOptions.requestHeaders = options.reduce((acc, option) => {
    return {
      ...acc,
      ...option.requestHeaders,
    };
  }, {});
  return completionOptions;
};
