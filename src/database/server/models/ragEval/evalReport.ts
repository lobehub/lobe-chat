import { and, desc, eq } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import { NewEvalEvaluationItem, evalEvaluation } from '@/database/server/schemas/lobechat';

export class EvalEvaluationModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalEvaluationItem) => {
    const [result] = await serverDB
      .insert(evalEvaluation)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalEvaluation)
      .where(and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)));
  };

  query = async () => {
    return serverDB.query.evalEvaluation.findMany({
      orderBy: [desc(evalEvaluation.createdAt)],
      where: eq(evalEvaluation.userId, this.userId),
    });
  };

  findById = async (id: number) => {
    return serverDB.query.evalEvaluation.findFirst({
      where: and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalEvaluationItem>) => {
    return serverDB
      .update(evalEvaluation)
      .set(value)
      .where(and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)));
  };
}
