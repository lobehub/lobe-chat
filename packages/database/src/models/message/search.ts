import type { SQL } from 'drizzle-orm';
import { and, desc, eq, gte, inArray, isNull, lte, ne, notInArray, or, sql } from 'drizzle-orm';

import { messages, topics } from '../../schemas';
import { sanitizeBm25Query } from '../../utils/bm25';
import { inJsonStringArray } from '../../utils/inJsonStringArray';
import { searchableMessage } from '../../utils/searchableMessage';
import type { MessageLookupQueries } from './lookup';
import type { MessageScopeArgs } from './scope';
import { MessageScope } from './scope';

/**
 * Topic triggers whose `user` turns are written by the system (task runs, cron
 * jobs, evals, goal supervision), not typed by a person. Their assistant turns
 * are still real work and stay searchable. Doc-anchored chat (`document`) is
 * human input and is deliberately absent.
 */
export const AUTOMATED_PROMPT_TOPIC_TRIGGERS = [
  'cron',
  'eval',
  'goal_supervision',
  'task',
  'task_manager',
];

export const MESSAGE_KEYWORD_SEARCH_MAX_LIMIT = 100;

const DEFAULT_LIMIT = 20;
/** Short lead-in so the match stays visible in a truncated terminal column. */
const SNIPPET_BEFORE = 24;
const SNIPPET_AFTER = 200;

export interface MessageKeywordSearchParams {
  agentId?: string;
  endDate?: Date;
  /** Case-sensitive substring match on top of full-text retrieval. */
  exact?: boolean;
  /** Keep system-written `user` prompts of automation topics in the results. */
  includeAutomatedPrompts?: boolean;
  keyword: string;
  limit?: number;
  offset?: number;
  roles?: string[];
  startDate?: Date;
  topicId?: string;
}

export interface MessageKeywordSearchItem {
  agentId: string | null;
  contentLength: number;
  createdAt: Date;
  id: string;
  role: string;
  snippet: string;
  threadId: string | null;
  topicId: string | null;
  topicTitle: string | null;
}

export interface MessageKeywordSearchResult {
  hasMore: boolean;
  items: MessageKeywordSearchItem[];
}

/**
 * A window of `content` around the first keyword occurrence, whitespace
 * collapsed. Falls back to the first query term, then to the head of the text.
 */
export const buildMessageSnippet = (content: string, keyword: string, exact?: boolean) => {
  const haystack = exact ? content : content.toLowerCase();
  const needles = [keyword.trim(), ...keyword.trim().split(/\s+/)].filter(Boolean);
  let index = -1;
  let length = 0;
  for (const needle of needles) {
    index = haystack.indexOf(exact ? needle : needle.toLowerCase());
    if (index !== -1) {
      length = needle.length;
      break;
    }
  }

  const start = index === -1 ? 0 : Math.max(0, index - SNIPPET_BEFORE);
  const end = index === -1 ? SNIPPET_BEFORE + SNIPPET_AFTER : index + length + SNIPPET_AFTER;
  const body = content.slice(start, end).replaceAll(/\s+/g, ' ').trim();

  return `${start > 0 ? '…' : ''}${body}${end < content.length ? '…' : ''}`;
};

/**
 * Filtered, paginated keyword search for callers that read history rather than
 * render a command palette (CLI, agents). Unlike `queryByKeyword` it returns a
 * lean projection with the parent topic title and a match snippet.
 */
export class MessageKeywordSearchQueries extends MessageScope {
  private lookups: MessageLookupQueries;

  constructor(args: MessageScopeArgs, deps: { lookups: MessageLookupQueries }) {
    super(...args);
    this.lookups = deps.lookups;
  }

  searchByKeyword = async ({
    agentId,
    endDate,
    exact,
    includeAutomatedPrompts,
    keyword,
    limit = DEFAULT_LIMIT,
    offset = 0,
    roles,
    startDate,
    topicId,
  }: MessageKeywordSearchParams): Promise<MessageKeywordSearchResult> => {
    const text = keyword.trim();
    if (!text) return { hasMore: false, items: [] };

    const pageSize = Math.min(Math.max(limit, 1), MESSAGE_KEYWORD_SEARCH_MAX_LIMIT);

    const candidateResult = this.ftsSearchCandidateSource?.ftsSearchCandidateEnabled
      ? await this.ftsSearchCandidateSource.ftsSearchCandidates({
          entity: 'messages',
          filters: {},
          pagination: {},
          query: { fields: ['content'], text },
        })
      : undefined;
    const candidateIds = candidateResult?.candidates.map(({ id }) => id);
    if (candidateIds?.length === 0) return { hasMore: false, items: [] };

    const conditions: (SQL | undefined)[] = [
      this.ownership(),
      searchableMessage(),
      candidateIds
        ? inJsonStringArray(messages.id, candidateIds)
        : sql`${messages.content} @@@ ${sanitizeBm25Query(text)}`,
      exact ? sql`strpos(${messages.content}, ${text}) > 0` : undefined,
      startDate ? gte(messages.createdAt, startDate) : undefined,
      endDate ? lte(messages.createdAt, endDate) : undefined,
      roles?.length ? inArray(messages.role, roles) : undefined,
      topicId ? eq(messages.topicId, topicId) : undefined,
      agentId ? await this.lookups.buildAgentCondition(agentId) : undefined,
      includeAutomatedPrompts
        ? undefined
        : or(
            ne(messages.role, 'user'),
            isNull(topics.trigger),
            notInArray(topics.trigger, AUTOMATED_PROMPT_TOPIC_TRIGGERS),
          ),
    ];

    const rows = await this.db
      .select({
        agentId: messages.agentId,
        content: messages.content,
        createdAt: messages.createdAt,
        id: messages.id,
        role: messages.role,
        summary: messages.summary,
        threadId: messages.threadId,
        topicId: messages.topicId,
        topicTitle: topics.title,
      })
      .from(messages)
      .leftJoin(topics, eq(messages.topicId, topics.id))
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(pageSize + 1)
      .offset(Math.max(offset, 0));

    return {
      hasMore: rows.length > pageSize,
      items: rows.slice(0, pageSize).map(({ content, summary, ...row }) => {
        const body = content || summary || '';
        return {
          ...row,
          contentLength: body.length,
          snippet: buildMessageSnippet(body, text, exact),
        };
      }),
    };
  };
}
