import { and, eq } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import { NewEvalResultsItem, evalResults } from '@/database/server/schemas/lobechat';

export class EvalResultModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalResultsItem) => {
    const [result] = await serverDB
      .insert(evalResults)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalResults)
      .where(and(eq(evalResults.id, id), eq(evalResults.userId, this.userId)));
  };

  query = async (reportId: number) => {
    return serverDB.query.evalResults.findMany({
      where: and(eq(evalResults.reportId, reportId), eq(evalResults.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalResultsItem>) => {
    return serverDB
      .update(evalResults)
      .set(value)
      .where(and(eq(evalResults.id, id), eq(evalResults.userId, this.userId)));
  };
}
