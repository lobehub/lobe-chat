import { DrizzleMigrationModel } from '@/database/models/drizzleMigration';
import { DataExporterRepos } from '@/database/repositories/dataExporter';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { ExportDatabaseData } from '@/types/export';

const exportProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const dataExporterRepos = new DataExporterRepos(ctx.serverDB, ctx.userId);
  const drizzleMigration = new DrizzleMigrationModel(ctx.serverDB);

  return opts.next({
    ctx: { dataExporterRepos, drizzleMigration },
  });
});

export const exporterRouter = router({
  exportData: exportProcedure.mutation(async ({ ctx }): Promise<ExportDatabaseData> => {
    const data = await ctx.dataExporterRepos.export(5);

    const schemaHash = await ctx.drizzleMigration.getLatestMigrationHash();

    return { data, schemaHash };
  }),
});
