import { and, desc, eq } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import { NewEvalReportsItem, evalReports } from '@/database/server/schemas/lobechat';

export class EvalReportModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalReportsItem) => {
    const [result] = await serverDB
      .insert(evalReports)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalReports)
      .where(and(eq(evalReports.id, id), eq(evalReports.userId, this.userId)));
  };

  query = async () => {
    return serverDB.query.evalReports.findMany({
      orderBy: [desc(evalReports.createdAt)],
      where: eq(evalReports.userId, this.userId),
    });
  };

  findById = async (id: number) => {
    return serverDB.query.evalReports.findFirst({
      where: and(eq(evalReports.id, id), eq(evalReports.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalReportsItem>) => {
    return serverDB
      .update(evalReports)
      .set(value)
      .where(and(eq(evalReports.id, id), eq(evalReports.userId, this.userId)));
  };
}
