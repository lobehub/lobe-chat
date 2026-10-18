import { and, eq, isNull } from 'drizzle-orm';

import { quickNotes } from '../../schemas';
import type { LobeChatDatabase } from '../../type';

/** The caller identity every `QuickNoteModel` query is scoped by. */
export interface QuickNoteContext {
  db: LobeChatDatabase;
  userId: string;
  workspaceId?: string;
}

/** The parameters of a module function after its leading `ctx`, for the model's delegators. */
export type QuickNoteArgs<F> = F extends (ctx: QuickNoteContext, ...args: infer A) => unknown
  ? A
  : never;

/** Confines a query to the caller's own Quick Notes in the active scope (personal or workspace). */
export const quickNoteOwnershipWhere = (ctx: QuickNoteContext) =>
  and(
    eq(quickNotes.userId, ctx.userId),
    ctx.workspaceId ? eq(quickNotes.workspaceId, ctx.workspaceId) : isNull(quickNotes.workspaceId),
  )!;
