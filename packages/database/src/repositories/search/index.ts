import { sql } from 'drizzle-orm';

import { agents, documents, files, knowledgeBaseFiles, messages, topics } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export type SearchResultType =
  | 'agent'
  | 'topic'
  | 'file'
  | 'message'
  | 'mcp'
  | 'plugin'
  | 'assistant';

export interface BaseSearchResult {
  // 1=exact, 2=prefix, 3=contains
  createdAt: Date;
  description?: string | null;
  id: string;
  relevance: number;
  title: string;
  type: SearchResultType;
  updatedAt: Date;
}

export interface AgentSearchResult extends BaseSearchResult {
  avatar: string | null;
  backgroundColor: string | null;
  slug: string | null;
  tags: string[];
  type: 'agent';
}

export interface TopicSearchResult extends BaseSearchResult {
  agentId: string | null;
  favorite: boolean | null;
  sessionId: string | null;
  type: 'topic';
}

export interface FileSearchResult extends BaseSearchResult {
  fileType: string;
  knowledgeBaseId: string | null;
  name: string;
  size: number;
  type: 'file';
  url: string | null;
}

export interface MessageSearchResult extends BaseSearchResult {
  agentId: string | null;
  content: string;
  model: string | null;
  role: string;
  topicId: string | null;
  type: 'message';
}

export interface MCPSearchResult extends BaseSearchResult {
  author: string;
  avatar?: string | null;
  category?: string | null;
  connectionType?: 'http' | 'stdio' | null;
  identifier: string;
  installCount?: number | null;
  isFeatured?: boolean | null;
  isValidated?: boolean | null;
  tags?: string[] | null;
  type: 'mcp';
}

export interface PluginSearchResult extends BaseSearchResult {
  author: string;
  avatar?: string | null;
  category?: string | null;
  identifier: string;
  tags?: string[] | null;
  type: 'plugin';
}

export interface AssistantSearchResult extends BaseSearchResult {
  author: string;
  avatar?: string | null;
  homepage?: string | null;
  identifier: string;
  tags?: string[] | null;
  type: 'assistant';
}

export type SearchResult =
  | AgentSearchResult
  | TopicSearchResult
  | FileSearchResult
  | MessageSearchResult
  | MCPSearchResult
  | PluginSearchResult
  | AssistantSearchResult;

export interface SearchOptions {
  agentId?: string;
  limitPerType?: number;
  offset?: number;
  query: string;
  type?: SearchResultType;
}

/**
 * Search Repository - provides unified search across Agents, Topics, and Files
 */
export class SearchRepo {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Search across agents, topics, and files
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, type, limitPerType = 5, agentId } = options;

    // Early return for empty query
    if (!query || query.trim() === '') return [];

    const trimmedQuery = query.trim();
    const searchTerm = `%${trimmedQuery}%`;
    const exactQuery = trimmedQuery;
    const prefixQuery = `${trimmedQuery}%`;

    // Context-aware limits: prioritize topics in agent context
    const limits = this.calculateLimits(limitPerType, type, agentId);

    // Build queries based on type filter
    const queries = [];
    if (!type || type === 'agent') {
      queries.push(this.buildAgentQuery(searchTerm, exactQuery, prefixQuery, limits.agent));
    }
    if (!type || type === 'topic') {
      queries.push(
        this.buildTopicQuery(searchTerm, exactQuery, prefixQuery, limits.topic, agentId),
      );
    }
    if (!type || type === 'message') {
      queries.push(
        this.buildMessageQuery(searchTerm, exactQuery, prefixQuery, limits.message, agentId),
      );
    }
    if (!type || type === 'file') {
      queries.push(this.buildFileQuery(searchTerm, exactQuery, prefixQuery, limits.file));
    }

    if (queries.length === 0) return [];

    // Combine with UNION ALL (pattern from KnowledgeRepo)
    const unionQuery = sql.join(
      queries.map((q) => sql`(${q})`),
      sql` UNION ALL `,
    );

    const finalQuery = sql`
      SELECT * FROM (${unionQuery}) as combined
      ORDER BY relevance ASC, updated_at DESC
    `;

    const result = await this.db.execute(finalQuery);
    return this.mapResults(result.rows as any[]);
  }

  /**
   * Calculate result limits based on context
   * In agent context: prioritize messages (10) and topics (5), reduce others (3 each)
   * In general context: balanced distribution (5 each)
   */
  private calculateLimits(
    baseLimit: number,
    type?: SearchResultType,
    agentId?: string,
  ): { agent: number; file: number; message: number; topic: number } {
    // If type filter is specified, use full limit for that type
    if (type) {
      return {
        agent: type === 'agent' ? baseLimit : 0,
        file: type === 'file' ? baseLimit : 0,
        message: type === 'message' ? baseLimit : 0,
        topic: type === 'topic' ? baseLimit : 0,
      };
    }

    // Agent context: prioritize messages and topics
    if (agentId) {
      return {
        agent: 3,
        file: 3,
        message: 10,
        topic: 5,
      };
    }

    // General context: balanced
    return {
      agent: baseLimit,
      file: baseLimit,
      message: baseLimit,
      topic: baseLimit,
    };
  }

  /**
   * Build agent search query
   * Searches: title, description, slug, tags (JSONB array)
   */
  private buildAgentQuery(
    searchTerm: string,
    exactQuery: string,
    prefixQuery: string,
    limit: number,
  ): ReturnType<typeof sql> {
    return sql`
      SELECT
        a.id,
        'agent' as type,
        a.title,
        a.description,
        a.slug,
        a.avatar,
        a.background_color,
        a.tags,
        a.created_at,
        a.updated_at,
        CASE
          WHEN a.title ILIKE ${exactQuery} THEN 1
          WHEN a.title ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END as relevance,
        NULL::boolean as favorite,
        NULL::text as session_id,
        NULL::text as agent_id,
        NULL::text as name,
        NULL::varchar(255) as file_type,
        NULL::integer as size,
        NULL::text as url,
        NULL::text as knowledge_base_id
      FROM ${agents} a
      WHERE a.user_id = ${this.userId}
        AND (
          a.title ILIKE ${searchTerm}
          OR COALESCE(a.description, '') ILIKE ${searchTerm}
          OR COALESCE(a.slug, '') ILIKE ${searchTerm}
          OR (
            a.tags IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(a.tags) AS tag
              WHERE tag ILIKE ${searchTerm}
            )
          )
        )
      LIMIT ${limit}
    `;
  }

  /**
   * Build topic search query with optional agent-context boosting
   * Searches: title, content, historySummary
   * When agentId is provided:
   * - Current agent's topics: relevance 0.5-0.7 (highest priority)
   * - Other topics: relevance 1-3 (normal priority)
   */
  private buildTopicQuery(
    searchTerm: string,
    exactQuery: string,
    prefixQuery: string,
    limit: number,
    agentId?: string,
  ): ReturnType<typeof sql> {
    // Build relevance CASE statement with agent boosting
    const relevanceCase = agentId
      ? sql`
        CASE
          WHEN t.agent_id = ${agentId} THEN
            CASE
              WHEN t.title ILIKE ${exactQuery} THEN 0.5
              WHEN t.title ILIKE ${prefixQuery} THEN 0.6
              ELSE 0.7
            END
          WHEN t.title ILIKE ${exactQuery} THEN 1
          WHEN t.title ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END
      `
      : sql`
        CASE
          WHEN t.title ILIKE ${exactQuery} THEN 1
          WHEN t.title ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END
      `;

    return sql`
      SELECT
        t.id,
        'topic' as type,
        t.title,
        t.content as description,
        NULL::varchar(100) as slug,
        NULL::text as avatar,
        NULL::text as background_color,
        NULL::jsonb as tags,
        t.created_at,
        t.updated_at,
        ${relevanceCase} as relevance,
        t.favorite,
        t.session_id,
        t.agent_id,
        NULL::text as name,
        NULL::varchar(255) as file_type,
        NULL::integer as size,
        NULL::text as url,
        NULL::text as knowledge_base_id
      FROM ${topics} t
      WHERE t.user_id = ${this.userId}
        AND (
          COALESCE(t.title, '') ILIKE ${searchTerm}
          OR COALESCE(t.content, '') ILIKE ${searchTerm}
          OR COALESCE(t.history_summary, '') ILIKE ${searchTerm}
        )
      ORDER BY relevance ASC, t.updated_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Build message search query with optional agent-context boosting
   * Searches: message content (supports multi-word queries)
   * When agentId is provided:
   * - Current agent's messages: relevance 0.5-0.7 (highest priority)
   * - Other messages: relevance 1-3 (normal priority)
   */
  private buildMessageQuery(
    searchTerm: string,
    exactQuery: string,
    prefixQuery: string,
    limit: number,
    agentId?: string,
  ): ReturnType<typeof sql> {
    // Split search query into words for better multi-word search
    const words = exactQuery
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // Build WHERE clause: search for any of the words
    const wordConditions =
      words.length > 1
        ? sql.join(
            words.map((word) => sql`COALESCE(m.content, '') ILIKE ${`%${word}%`}`),
            sql` OR `,
          )
        : sql`COALESCE(m.content, '') ILIKE ${searchTerm}`;

    // Build relevance CASE statement with agent boosting
    const relevanceCase = agentId
      ? sql`
        CASE
          WHEN m.agent_id = ${agentId} THEN
            CASE
              WHEN m.content ILIKE ${exactQuery} THEN 0.5
              WHEN m.content ILIKE ${prefixQuery} THEN 0.6
              ELSE 0.7
            END
          WHEN m.content ILIKE ${exactQuery} THEN 1
          WHEN m.content ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END
      `
      : sql`
        CASE
          WHEN m.content ILIKE ${exactQuery} THEN 1
          WHEN m.content ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END
      `;

    return sql`
      SELECT
        m.id,
        'message' as type,
        CASE
          WHEN length(m.content) > 100 THEN substring(m.content, 1, 100) || '...'
          ELSE m.content
        END as title,
        COALESCE(a.title, 'General Chat') as description,
        m.model as slug,
        NULL::text as avatar,
        NULL::text as background_color,
        NULL::jsonb as tags,
        m.created_at,
        m.updated_at,
        ${relevanceCase} as relevance,
        NULL::boolean as favorite,
        m.topic_id as session_id,
        m.agent_id,
        m.role as name,
        NULL::varchar(255) as file_type,
        NULL::integer as size,
        NULL::text as url,
        NULL::text as knowledge_base_id
      FROM ${messages} m
      LEFT JOIN ${agents} a ON m.agent_id = a.id
      WHERE m.user_id = ${this.userId}
        AND m.role != 'tool'
        AND (${wordConditions})
      ORDER BY relevance ASC, m.created_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Build file/document search query
   * Searches both files and standalone documents (similar to KnowledgeRepo pattern)
   * - Files with linked documents
   * - Standalone documents (source_type != 'file')
   */
  private buildFileQuery(
    searchTerm: string,
    exactQuery: string,
    prefixQuery: string,
    limit: number,
  ): ReturnType<typeof sql> {
    // Query for files (with optional linked documents)
    const fileQuery = sql`
      SELECT
        f.id,
        'file' as type,
        f.name as title,
        d.content as description,
        NULL::varchar(100) as slug,
        NULL::text as avatar,
        NULL::text as background_color,
        NULL::jsonb as tags,
        f.created_at,
        f.updated_at,
        CASE
          WHEN f.name ILIKE ${exactQuery} THEN 1
          WHEN f.name ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END as relevance,
        NULL::boolean as favorite,
        NULL::text as session_id,
        NULL::text as agent_id,
        f.name,
        f.file_type,
        f.size,
        f.url,
        kbf.knowledge_base_id
      FROM ${files} f
      LEFT JOIN ${documents} d ON f.id = d.file_id
      LEFT JOIN ${knowledgeBaseFiles} kbf ON f.id = kbf.file_id
      WHERE f.user_id = ${this.userId}
        AND f.name ILIKE ${searchTerm}
    `;

    // Query for standalone documents (not linked to files)
    const documentQuery = sql`
      SELECT
        d.id,
        'file' as type,
        COALESCE(d.title, d.filename, 'Untitled') as title,
        d.content as description,
        NULL::varchar(100) as slug,
        NULL::text as avatar,
        NULL::text as background_color,
        NULL::jsonb as tags,
        d.created_at,
        d.updated_at,
        CASE
          WHEN COALESCE(d.title, d.filename) ILIKE ${exactQuery} THEN 1
          WHEN COALESCE(d.title, d.filename) ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END as relevance,
        NULL::boolean as favorite,
        NULL::text as session_id,
        NULL::text as agent_id,
        COALESCE(d.title, d.filename, 'Untitled') as name,
        d.file_type,
        d.total_char_count as size,
        d.source as url,
        kbf.knowledge_base_id
      FROM ${documents} d
      LEFT JOIN ${files} f ON d.file_id = f.id
      LEFT JOIN ${knowledgeBaseFiles} kbf ON f.id = kbf.file_id
      WHERE d.user_id = ${this.userId}
        AND d.source_type != 'file'
        AND (
          COALESCE(d.title, '') ILIKE ${searchTerm}
          OR COALESCE(d.filename, '') ILIKE ${searchTerm}
          OR COALESCE(d.content, '') ILIKE ${searchTerm}
        )
    `;

    // Combine both queries
    return sql`
      SELECT * FROM (
        (${fileQuery})
        UNION ALL
        (${documentQuery})
      ) as combined
      ORDER BY relevance ASC, updated_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Map raw SQL results to typed SearchResult objects
   * Parse JSONB strings and convert snake_case to camelCase
   */
  private mapResults(rows: any[]): SearchResult[] {
    return rows.map((row) => {
      const base = {
        createdAt: new Date(row.created_at),
        description: row.description,
        id: row.id,
        relevance: row.relevance,
        title: row.title,
        type: row.type as SearchResultType,
        updatedAt: new Date(row.updated_at),
      };

      switch (row.type) {
        case 'agent': {
          // Parse tags JSONB if string
          let tags: string[] = [];
          if (row.tags) {
            if (typeof row.tags === 'string') {
              try {
                tags = JSON.parse(row.tags);
              } catch {
                tags = [];
              }
            } else {
              tags = row.tags;
            }
          }

          return {
            ...base,
            avatar: row.avatar,
            backgroundColor: row.background_color,
            slug: row.slug,
            tags,
            type: 'agent' as const,
          };
        }
        case 'topic': {
          return {
            ...base,
            agentId: row.agent_id,
            favorite: row.favorite,
            sessionId: row.session_id,
            type: 'topic' as const,
          };
        }
        case 'file': {
          return {
            ...base,
            fileType: row.file_type,
            knowledgeBaseId: row.knowledge_base_id,
            name: row.name,
            size: Number(row.size),
            type: 'file' as const,
            url: row.url,
          };
        }
        case 'message': {
          return {
            ...base,
            agentId: row.agent_id,
            content: row.description || '',
            model: row.slug,
            role: row.name || 'user',
            topicId: row.session_id,
            type: 'message' as const,
          };
        }
        default: {
          throw new Error(`Unknown search result type: ${row.type}`);
        }
      }
    });
  }
}
