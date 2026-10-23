import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { FileModel } from '@/database/models/file';
import { FileShareModel } from '@/database/models/fileShare';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';

/** How long a visitor's download URL stays valid. */
const SHARED_FILE_URL_TTL_SECONDS = 5 * 60;

const visibilitySchema = z.enum(['private', 'link']);
const fileIdInput = z.object({ fileId: z.string().trim().min(1) });

const fileShareProcedure = wsCompatProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const workspaceId = ctx.workspaceId ?? undefined;
  return opts.next({
    ctx: {
      fileModel: new FileModel(ctx.serverDB, ctx.userId, workspaceId),
      fileShareModel: new FileShareModel(ctx.serverDB, ctx.userId, workspaceId),
    },
  });
});

/**
 * The file the caller owns. Ownership is strict: the scoped model also returns
 * files other workspace members created, but a share link publishes the file,
 * so only its creator may manage it — a workspace owner included.
 */
const requireOwnedFile = async (ctx: { fileModel: FileModel; userId: string }, fileId: string) => {
  const file = await ctx.fileModel.findById(fileId);
  if (!file) throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
  if (file.userId !== ctx.userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only the file owner can manage this file share',
    });
  }
  return file;
};

const rethrow = (error: unknown, procedure: string, message: string): never => {
  if (error instanceof TRPCError) throw error;
  console.error(`[fileShare:${procedure}]`, error);
  throw new TRPCError({ cause: error, code: 'INTERNAL_SERVER_ERROR', message });
};

export const fileShareRouter = router({
  /** Remove the share link (deletes the share record). */
  disable: fileShareProcedure
    .use(withScopedPermission('file:update'))
    .input(fileIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await requireOwnedFile(ctx, input.fileId);
        await ctx.fileShareModel.deleteByFileId(input.fileId);
        return { success: true };
      } catch (error) {
        return rethrow(error, 'disable', 'Failed to disable file share');
      }
    }),

  /** Create (or reuse) the share of a file. */
  enable: fileShareProcedure
    .use(withScopedPermission('file:update'))
    .input(fileIdInput.extend({ visibility: visibilitySchema.default('private') }))
    .mutation(async ({ ctx, input }) => {
      try {
        await requireOwnedFile(ctx, input.fileId);
        const created = await ctx.fileShareModel.create(input.fileId, input.visibility);
        // `create` keeps an existing record as is; an explicit visibility on a
        // re-enable still has to win.
        const share =
          created && created.visibility !== input.visibility
            ? await ctx.fileShareModel.updateVisibility(input.fileId, input.visibility)
            : created;
        return { data: share, success: true };
      } catch (error) {
        return rethrow(error, 'enable', 'Failed to enable file share');
      }
    }),

  /** The share record of a file, or null when it is not shared. */
  getInfo: fileShareProcedure.input(fileIdInput).query(async ({ ctx, input }) => {
    try {
      await requireOwnedFile(ctx, input.fileId);
      return { data: await ctx.fileShareModel.getByFileId(input.fileId), success: true };
    } catch (error) {
      return rethrow(error, 'getInfo', 'Failed to read file share');
    }
  }),

  /**
   * What a visitor sees of a shared file: its name, mime, size and a short-lived
   * signed download URL — nothing else: no owner, visibility or storage key. The URL is signed
   * as the share owner's storage, the visitor owns nothing.
   */
  getSharedFile: publicProcedure
    .use(serverDatabase)
    .input(z.object({ shareId: z.string().trim().min(1) }))
    .query(async ({ ctx, input }) => {
      const share = await FileShareModel.findByShareIdWithAccessCheck(
        ctx.serverDB,
        input.shareId,
        ctx.userId ?? undefined,
      );
      const isOwner = !!ctx.userId && share.ownerId === ctx.userId;

      try {
        const downloadUrl = await new FileService(
          ctx.serverDB,
          share.ownerId,
          share.workspaceId ?? undefined,
        ).getFullFileUrl(share.url, SHARED_FILE_URL_TTL_SECONDS);

        if (!isOwner) {
          // A counter must never break the page it counts.
          await FileShareModel.incrementViewCount(ctx.serverDB, share.shareId).catch(() => {});
        }

        return {
          data: { downloadUrl, mime: share.fileType, name: share.name, size: share.size },
          success: true,
        };
      } catch (error) {
        return rethrow(error, 'getSharedFile', 'Failed to read shared file');
      }
    }),

  /** Change who can open the link. */
  setVisibility: fileShareProcedure
    .use(withScopedPermission('file:update'))
    .input(fileIdInput.extend({ visibility: visibilitySchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await requireOwnedFile(ctx, input.fileId);
        const share = await ctx.fileShareModel.updateVisibility(input.fileId, input.visibility);
        if (!share) throw new TRPCError({ code: 'NOT_FOUND', message: 'This file is not shared' });
        return { data: share, success: true };
      } catch (error) {
        return rethrow(error, 'setVisibility', 'Failed to update file share');
      }
    }),
});
