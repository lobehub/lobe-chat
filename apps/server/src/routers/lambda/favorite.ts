import { FAVORITE_LIMIT, FAVORITE_TYPES, type FavoriteItem } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { FavoriteLimitError, FavoriteModel } from '@/database/models/favorite';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const favoriteProcedure = wsCompatProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  return opts.next({
    ctx: {
      favoriteModel: new FavoriteModel(ctx.serverDB, ctx.userId, ctx.workspaceId),
    },
  });
});

/**
 * Favorites only ever open inside the app, so the path must be an in-app
 * absolute path: `//host` and `/\host` would leave the origin.
 */
const inAppPath = z
  .string()
  .min(1)
  .max(2048)
  .regex(/^\/(?![/\\])/, 'Favorites must link to a page inside the app');

const favoriteType = z.enum(FAVORITE_TYPES);
const title = z.string().trim().min(1).max(512);
const icon = z.string().max(2048).nullable();

export const favoriteRouter = router({
  add: favoriteProcedure
    .input(
      z.object({
        icon: icon.optional(),
        path: inAppPath,
        targetId: z.string().min(1).max(2048),
        title,
        type: favoriteType,
      }),
    )
    .mutation(async ({ ctx, input }): Promise<FavoriteItem> => {
      try {
        return await ctx.favoriteModel.add(input);
      } catch (error) {
        if (error instanceof FavoriteLimitError)
          throw new TRPCError({ cause: error, code: 'BAD_REQUEST', message: error.message });
        throw error;
      }
    }),

  list: favoriteProcedure.query(async ({ ctx }): Promise<FavoriteItem[]> =>
    ctx.favoriteModel.query(),
  ),

  remove: favoriteProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => ctx.favoriteModel.remove(input.id)),

  removeByTarget: favoriteProcedure
    .input(z.object({ targetId: z.string(), type: favoriteType }))
    .mutation(async ({ ctx, input }) =>
      ctx.favoriteModel.removeByTarget(input.type, input.targetId),
    ),

  reorder: favoriteProcedure
    .input(z.object({ ids: z.array(z.string()).max(FAVORITE_LIMIT) }))
    .mutation(async ({ ctx, input }) => ctx.favoriteModel.reorder(input.ids)),

  update: favoriteProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.object({
          icon: icon.optional(),
          path: inAppPath.optional(),
          title: title.optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => ctx.favoriteModel.update(input.id, input.value)),
});

export type FavoriteRouter = typeof favoriteRouter;
