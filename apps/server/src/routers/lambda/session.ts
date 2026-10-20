import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { AgentModel } from '@/database/models/agent';
import { ChatGroupModel } from '@/database/models/chatGroup';
import { ResourcePermissionModel } from '@/database/models/resourcePermission';
import { ResourceTransferRequestModel } from '@/database/models/resourceTransferRequest';
import { SessionModel } from '@/database/models/session';
import { SessionGroupModel } from '@/database/models/sessionGroup';
import { insertAgentSchema, insertSessionSchema } from '@/database/schemas';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { TrashService } from '@/server/services/trash';
import { type ChatSessionList, type LobeGroupSession } from '@/types/session';
import { TransferErrorCode } from '@/types/transferError';

import {
  assertWorkspaceRowManageable,
  isWorkspaceNonOwner,
} from './_helpers/assertWorkspaceRowManageable';

const sessionProcedure = wsCompatProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const wsId = ctx.workspaceId ?? undefined;

  return opts.next({
    ctx: {
      sessionGroupModel: new SessionGroupModel(ctx.serverDB, ctx.userId, wsId),
      sessionModel: new SessionModel(ctx.serverDB, ctx.userId, wsId),
    },
  });
});

/**
 * @deprecated Session router is legacy. Use agent router for agent CRUD operations.
 * Session-based agent creation (createSession) should migrate
 * to agent.createAgent which uses agentModel.create directly.
 * Session query/update methods are still used by mobile but should be migrated.
 */
export const sessionRouter = router({
  cloneSession: sessionProcedure
    .use(withScopedPermission('session:create'))
    .input(z.object({ id: z.string(), newTitle: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionModel.duplicate(input.id, input.newTitle);

      return data?.id;
    }),

  /** @deprecated Use agent.createAgent instead */
  createSession: sessionProcedure
    .use(withScopedPermission('session:create'))
    .input(
      z.object({
        config: insertAgentSchema
          .omit({
            chatConfig: true,
            openingMessage: true,
            openingQuestions: true,
            plugins: true,
            tags: true,
            tts: true,
          })
          .passthrough()
          .partial(),
        session: insertSessionSchema.omit({ createdAt: true, updatedAt: true }).partial(),
        type: z.enum(['agent', 'group']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionModel.create(input);

      return data.id;
    }),

  getGroupedSessions: wsCompatProcedure
    .use(serverDatabase)
    .query(async ({ ctx }): Promise<ChatSessionList> => {
      const userId = ctx.userId;
      const serverDB = ctx.serverDB;
      const wsId = ctx.workspaceId ?? undefined;
      const sessionModel = new SessionModel(serverDB, userId, wsId);
      const chatGroupModel = new ChatGroupModel(serverDB, userId, wsId);

      const [{ sessions, sessionGroups }, chatGroups] = await Promise.all([
        sessionModel.queryWithGroups(),
        chatGroupModel.queryWithMemberDetails(),
      ]);

      const groupSessions: LobeGroupSession[] = chatGroups.map((group) => {
        const { title, description, avatar, backgroundColor, groupId, ...rest } = group;
        return {
          ...rest,
          group: groupId, // Map groupId to group for consistent API
          meta: { avatar, backgroundColor, description, title },
          type: 'group',
        };
      });

      const allSessions = [...sessions, ...groupSessions].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return { sessionGroups, sessions: allSessions };
    }),

  removeSession: sessionProcedure
    .use(withScopedPermission('session:delete'))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.sessionModel.findByIdOrSlug(input.id);
      if (session) assertWorkspaceRowManageable(ctx, session.userId, 'session');

      // Deleting the last session of a workspace-shared agent orphan-deletes
      // the agent itself, and the session cascade erases every member's
      // topics/messages on it — the same blast radius as `agent.removeAgent`,
      // so apply the same foreign-rows owner gate here.
      if (
        ctx.workspaceId &&
        session?.agent &&
        session.agent.visibility === 'public' &&
        isWorkspaceNonOwner(ctx)
      ) {
        const agentModel = new AgentModel(ctx.serverDB, ctx.userId, ctx.workspaceId);
        if (await agentModel.transferHasForeignRows(session.agent.id)) {
          throw new TRPCError({
            cause: { data: { code: TransferErrorCode.OwnerOnly } },
            code: 'FORBIDDEN',
            message:
              "Only workspace owners can delete a session whose shared agent carries others' conversations",
          });
        }
      }

      // A session is normally the legacy 1:1 shell of an agent: removing it
      // means removing the agent, so route through the agent's recycle-bin
      // cascade (agent + session + topics all stamped, restorable as one unit).
      // When the agent has other shells (or this shell holds other agents),
      // only this session goes — the agent must stay with its other sessions.
      if (
        session?.agent &&
        (await ctx.sessionModel.isSoleShellOfAgent(session.id, session.agent.id))
      ) {
        const trashService = new TrashService(
          ctx.serverDB,
          ctx.userId,
          ctx.workspaceId ?? undefined,
        );
        const trashed = await trashService.trashAgent(session.agent.id);
        // Same as `agent.removeAgent`: the trashed agent is invisible to a
        // pending handover's recipient too, so an acceptance would move
        // ownership of recycle-bin content — void it now.
        if (ctx.workspaceId) {
          await new ResourceTransferRequestModel(
            ctx.serverDB,
            ctx.workspaceId,
          ).invalidateForResources('agent', [session.agent.id]);
        }
        return trashed;
      }

      // No linked agent (a stray legacy row) or a shell the agent does not
      // depend on: hard delete this session only, as before. An agent left
      // without any shell is orphan-deleted by the model.
      const { orphanedAgentIds, result } = await ctx.sessionModel.delete(input.id);
      if (ctx.workspaceId && orphanedAgentIds.length > 0) {
        const permissionModel = new ResourcePermissionModel(ctx.serverDB, ctx.workspaceId);
        await Promise.all(orphanedAgentIds.map((id) => permissionModel.removeAll('agent', id)));
      }

      return result;
    }),

  updateSession: sessionProcedure
    .use(withScopedPermission('session:update'))
    .input(
      z.object({
        id: z.string(),
        value: insertSessionSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.sessionModel.findByIdOrSlug(input.id);
      if (session) assertWorkspaceRowManageable(ctx, session.userId, 'session');

      return ctx.sessionModel.update(input.id, input.value);
    }),
});

export type SessionRouter = typeof sessionRouter;
