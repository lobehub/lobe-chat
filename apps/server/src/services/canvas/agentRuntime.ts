import { CanvasApiName, CanvasIdentifier } from '@lobechat/builtin-tool-canvas';
import { CanvasExecutionRuntime } from '@lobechat/builtin-tool-canvas/executionRuntime';

import { MessageModel } from '@/database/models/message';
import { UserModel } from '@/database/models/user';
import { WorkModel } from '@/database/models/work';
import type { LobeChatDatabase } from '@/database/type';

import { createCanvasStorageService } from './index';
import { CanvasToolServiceImpl } from './toolService';

export interface CanvasAgentRuntimeScope {
  agentId?: string | null;
  threadId?: string | null;
  topicId?: string | null;
  userId: string;
  workspaceId?: string;
}

export const isCanvasEnabledForUser = async (db: LobeChatDatabase, userId: string) => {
  const preference = await new UserModel(db, userId).getUserPreference();
  return preference?.lab?.enableCanvas === true;
};

export const createCanvasAgentRuntime = (db: LobeChatDatabase, scope: CanvasAgentRuntimeScope) => {
  const { userId, workspaceId } = scope;

  return new CanvasExecutionRuntime(
    new CanvasToolServiceImpl({
      agentId: scope.agentId,
      findGuideState: () =>
        new MessageModel(db, userId, workspaceId).findLatestPluginStateInTopic({
          apiName: CanvasApiName.readCanvasGuide,
          identifier: CanvasIdentifier,
          threadId: scope.threadId,
          topicId: scope.topicId!,
        }),
      storage: createCanvasStorageService(db, userId, workspaceId),
      storageFor: (ownerId) => createCanvasStorageService(db, ownerId, workspaceId),
      topicId: scope.topicId,
      workModel: new WorkModel(db, userId, workspaceId),
    }),
  );
};
