import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeSparkAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://spark-api-open.xf-yun.com/v1',
  chatCompletion: {
    noUserId: true,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_SPARK_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Spark,
});
