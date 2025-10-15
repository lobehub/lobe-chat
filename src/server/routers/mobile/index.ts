/**
 * This file contains the root router of Lobe Chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc/lambda';

import { ragEvalRouter } from '../async/ragEval';
import { agentRouter } from '../lambda/agent';
import { aiChatRouter } from '../lambda/aiChat';
import { aiModelRouter } from '../lambda/aiModel';
import { aiProviderRouter } from '../lambda/aiProvider';
import { apiKeyRouter } from '../lambda/apiKey';
import { chunkRouter } from '../lambda/chunk';
import { configRouter } from '../lambda/config';
import { documentRouter } from '../lambda/document';
import { exporterRouter } from '../lambda/exporter';
import { fileRouter } from '../lambda/file';
import { generationRouter } from '../lambda/generation';
import { generationBatchRouter } from '../lambda/generationBatch';
import { generationTopicRouter } from '../lambda/generationTopic';
import { imageRouter } from '../lambda/image';
import { importerRouter } from '../lambda/importer';
import { knowledgeBaseRouter } from '../lambda/knowledgeBase';
import { marketRouter } from '../lambda/market';
import { messageRouter } from '../lambda/message';
import { pluginRouter } from '../lambda/plugin';
import { sessionRouter } from '../lambda/session';
import { sessionGroupRouter } from '../lambda/sessionGroup';
import { threadRouter } from '../lambda/thread';
import { topicRouter } from '../lambda/topic';
import { userRouter } from '../lambda/user';

export const mobileRouter = router({
  agent: agentRouter,
  aiChat: aiChatRouter,
  aiModel: aiModelRouter,
  aiProvider: aiProviderRouter,
  apiKey: apiKeyRouter,
  chunk: chunkRouter,
  config: configRouter,
  document: documentRouter,
  exporter: exporterRouter,
  file: fileRouter,
  generation: generationRouter,
  generationBatch: generationBatchRouter,
  generationTopic: generationTopicRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  image: imageRouter,
  importer: importerRouter,
  knowledgeBase: knowledgeBaseRouter,
  market: marketRouter,
  message: messageRouter,
  plugin: pluginRouter,
  ragEval: ragEvalRouter,
  session: sessionRouter,
  sessionGroup: sessionGroupRouter,
  thread: threadRouter,
  topic: topicRouter,
  user: userRouter,
});

export type MobileRouter = typeof mobileRouter;
