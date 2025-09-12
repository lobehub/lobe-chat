import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { SparkAIStream, transformSparkResponseToStream } from '../../core/streams';
import { ChatStreamPayload, ModelProvider } from '../../types';

export const LobeSparkAI = createOpenAICompatibleRuntime({
  baseURL: 'https://spark-api-open.xf-yun.com/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { enabledSearch, tools, ...rest } = payload;

      const sparkTools = enabledSearch
        ? [
            ...(tools || []),
            {
              type: 'web_search',
              web_search: {
                enable: true,
                search_mode: process.env.SPARK_SEARCH_MODE || 'normal', // normal or deep
                /*
            show_ref_label: true,
            */
              },
            },
          ]
        : tools;

      return {
        ...rest,
        tools: sparkTools,
      } as any;
    },
    handleStream: SparkAIStream,
    handleTransformResponseToStream: transformSparkResponseToStream,
    noUserId: true,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_SPARK_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Spark,
});
