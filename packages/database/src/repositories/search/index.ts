import { sql } from 'drizzle-orm';

import { agents, documents, files, topics } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export type SearchResultType = 'agent' | 'topic' | 'file';

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
  name: string;
  size: number;
  type: 'file';
  url: string | null;
}

export type SearchResult = AgentSearchResult | TopicSearchResult | FileSearchResult;

export interface SearchOptions {
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
    const { query, type, limitPerType = 5 } = options;

    // Early return for empty query
    if (!query || query.trim() === '') return [];

    const trimmedQuery = query.trim();
    const searchTerm = `%${trimmedQuery}%`;
    const exactQuery = trimmedQuery;
    const prefixQuery = `${trimmedQuery}%`;

    // Build queries based on type filter
    const queries = [];
    if (!type || type === 'agent') {
      queries.push(this.buildAgentQuery(searchTerm, exactQuery, prefixQuery, limitPerType));
    }
    if (!type || type === 'topic') {
      queries.push(this.buildTopicQuery(searchTerm, exactQuery, prefixQuery, limitPerType));
    }
    if (!type || type === 'file') {
      queries.push(this.buildFileQuery(searchTerm, exactQuery, prefixQuery, limitPerType));
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
        NULL::text as url
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
   * Build topic search query
   * Searches: title, content, historySummary
   */
  private buildTopicQuery(
    searchTerm: string,
    exactQuery: string,
    prefixQuery: string,
    limit: number,
  ): ReturnType<typeof sql> {
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
        CASE
          WHEN t.title ILIKE ${exactQuery} THEN 1
          WHEN t.title ILIKE ${prefixQuery} THEN 2
          ELSE 3
        END as relevance,
        t.favorite,
        t.session_id,
        t.agent_id,
        NULL::text as name,
        NULL::varchar(255) as file_type,
        NULL::integer as size,
        NULL::text as url
      FROM ${topics} t
      WHERE t.user_id = ${this.userId}
        AND (
          COALESCE(t.title, '') ILIKE ${searchTerm}
          OR COALESCE(t.content, '') ILIKE ${searchTerm}
          OR COALESCE(t.history_summary, '') ILIKE ${searchTerm}
        )
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
        COALESCE(d.id, f.id) as id,
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
        f.url
      FROM ${files} f
      LEFT JOIN ${documents} d ON f.id = d.file_id
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
        d.source as url
      FROM ${documents} d
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
            name: row.name,
            size: Number(row.size),
            type: 'file' as const,
            url: row.url,
          };
        }
        default: {
          throw new Error(`Unknown search result type: ${row.type}`);
        }
      }
    });
  }
}
