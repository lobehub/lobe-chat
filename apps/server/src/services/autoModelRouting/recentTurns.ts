import type { LobeChatDatabase } from '@lobechat/database';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';

import { messages } from '@/database/schemas';

const RECENT_TURN_LIMIT = 6;
const TURN_CHAR_LIMIT = 600;
const PROMPT_CHAR_LIMIT = 4000;

export interface RecentTurn {
  content: string;
  role: 'assistant' | 'user';
}

/** Rough token estimate: ~3 chars per token, between English (~4) and CJK (~1-2). */
export const estimateTokens = (text: string) => Math.ceil(text.length / 3);

/**
 * The last few user / assistant rows of a topic and the prompt size of the
 * latest assistant call, used to describe the turn to the judge and to price
 * a model switch against the prompt cache.
 */
export const loadRecentTurns = async (
  db: LobeChatDatabase,
  { topicId, userId, workspaceId }: { topicId: string; userId: string; workspaceId?: string },
) => {
  const rows = await db
    .select({ content: messages.content, role: messages.role, usage: messages.usage })
    .from(messages)
    .where(
      and(
        workspaceId
          ? eq(messages.workspaceId, workspaceId)
          : and(eq(messages.userId, userId), isNull(messages.workspaceId)),
        eq(messages.topicId, topicId),
        inArray(messages.role, ['user', 'assistant']),
      ),
    )
    .orderBy(desc(messages.createdAt))
    .limit(RECENT_TURN_LIMIT);

  const lastAssistant = rows.find((row) => row.role === 'assistant' && row.usage);
  const usage = lastAssistant?.usage;
  const lastContextTokens = usage
    ? (usage.totalInputTokens ?? 0) + (usage.totalOutputTokens ?? 0)
    : undefined;

  const turns = rows
    .filter((row) => row.content && row.content.trim())
    .reverse()
    .map((row) => ({
      content: row.content!.slice(0, TURN_CHAR_LIMIT),
      role: row.role as RecentTurn['role'],
    }));

  return { lastContextTokens, turns };
};

/** Plain-text state handed to the judge model. */
export const buildJudgeState = (
  turns: RecentTurn[],
  prompt: string,
  attachments: { audios?: number; files?: number; images?: number; videos?: number },
) => {
  const attached = Object.entries(attachments)
    .filter(([, count]) => count)
    .map(([kind, count]) => `${count} ${kind}`);
  return [
    ...turns.map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`),
    `LATEST USER TURN${attached.length > 0 ? ` (attached: ${attached.join(', ')})` : ''}: ${prompt.slice(0, PROMPT_CHAR_LIMIT)}`,
  ].join('\n\n');
};
