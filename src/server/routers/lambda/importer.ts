// import urlJoin from 'url-join';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// import { fileEnv } from '@/config/file';
import { DataImporter } from '@/database/server/modules/DataImporter';
import { authedProcedure, router } from '@/libs/trpc';
import { S3 } from '@/server/files/s3';
import { ImportResults, ImporterEntryData } from '@/types/importer';

export const importerRouter = router({
  importByFile: authedProcedure
    .input(z.object({ pathname: z.string() }))
    .mutation(async ({ input, ctx }): Promise<ImportResults> => {
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

      const dataImporter = new DataImporter(ctx.userId);

      return dataImporter.importData(data);
    }),

  importByPost: authedProcedure
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
    .mutation(async ({ input, ctx }): Promise<ImportResults> => {
      const dataImporter = new DataImporter(ctx.userId);

      return dataImporter.importData(input.data);
    }),
});
