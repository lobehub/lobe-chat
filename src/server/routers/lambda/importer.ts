import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { DataImporterRepos } from '@/database/repositories/dataImporter';
import { authedProcedure, router, serverDatabase } from '@/libs/trpc';
import { S3 } from '@/server/modules/S3';
import { ImportPgDataStructure } from '@/types/export';
import { ImportResultData, ImporterEntryData } from '@/types/importer';

const importProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const dataImporterService = new DataImporterRepos(ctx.serverDB, ctx.userId);

  return opts.next({
    ctx: { dataImporterService },
  });
});

export const importerRouter = router({
  importByFile: importProcedure
    .input(z.object({ pathname: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ImportResultData> => {
      let data: ImporterEntryData | undefined;

      try {
        const s3 = new S3();
        const dataStr = await s3.getFileContent(input.pathname);
        data = JSON.parse(dataStr);
      } catch {
        data = undefined;
      }

      if (!data) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to read file at ${input.pathname}`,
        });
      }

      if ('schemaHash' in data) {
        return ctx.dataImporterService.importPgData(data as unknown as ImportPgDataStructure);
      }

      return ctx.dataImporterService.importData(data);
    }),

  importByPost: importProcedure
    .input(
      z.object({
        data: z.object({
          messages: z.array(z.any()).optional(),
          sessionGroups: z.array(z.any()).optional(),
          sessions: z.array(z.any()).optional(),
          topics: z.array(z.any()).optional(),
          version: z.number(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ImportResultData> => {
      return ctx.dataImporterService.importData(input.data);
    }),
  importPgByPost: importProcedure
    .input(
      z.object({
        data: z.record(z.string(), z.array(z.any())),
        mode: z.enum(['pglite', 'postgres']),
        schemaHash: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<ImportResultData> => {
      return ctx.dataImporterService.importPgData(input);
    }),
});
