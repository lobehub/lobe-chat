import { z } from 'zod';

import { DESKTOP_USER_ID } from '@/const/desktop';
import { TableViewerRepo } from '@/database/repositories/tableViewer';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const pgTableProcedure = publicProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
  return next({
    ctx: {
      tableViewerRepo: new TableViewerRepo(ctx.serverDB, DESKTOP_USER_ID),
    },
  });
});

export const pgTableRouter = router({
  getAllTables: pgTableProcedure.query(async ({ ctx }) => {
    return ctx.tableViewerRepo.getAllTables();
  }),
  getTableData: pgTableProcedure
    .input(
      z.object({
        page: z.number(),
        pageSize: z.number(),
        tableName: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.tableViewerRepo.getTableData(input.tableName, {
        page: input.page,
        pageSize: input.pageSize,
      });
    }),
  getTableDetails: pgTableProcedure
    .input(
      z.object({
        tableName: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.tableViewerRepo.getTableDetails(input.tableName);
    }),
});
