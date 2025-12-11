import { and, count, desc, eq, inArray } from 'drizzle-orm';

import { DocumentItem, NewDocument, documents } from '../schemas';
import { LobeChatDatabase } from '../type';

export interface QueryDocumentParams {
  current?: number;
  fileTypes?: string[];
  pageSize?: number;
  sourceTypes?: string[];
}

export class DocumentModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewDocument, 'userId'>): Promise<DocumentItem> => {
    const result = (await this.db
      .insert(documents)
      .values({ ...params, userId: this.userId })
      .returning()) as DocumentItem[];

    return result[0]!;
  };

  delete = async (id: string) => {
    return this.db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(documents).where(eq(documents.userId, this.userId));
  };

  query = async ({
    current = 0,
    pageSize = 9999,
    fileTypes,
    sourceTypes,
  }: QueryDocumentParams = {}): Promise<{
    items: DocumentItem[];
    total: number;
  }> => {
    const offset = current * pageSize;
    const conditions = [eq(documents.userId, this.userId)];

    if (fileTypes?.length) {
      conditions.push(inArray(documents.fileType, fileTypes));
    }

    if (sourceTypes?.length) {
      conditions.push(inArray(documents.sourceType, sourceTypes as ('file' | 'web' | 'api')[]));
    }

    const whereCondition = and(...conditions);

    // Fetch items and total count in parallel
    // Optimize: Exclude large JSONB fields (content, pages, editorData) for better performance
    const [rawItems, totalResult] = await Promise.all([
      this.db.query.documents.findMany({
        columns: {
          clientId: true,
          content: false, // Exclude large text content for list view performance
          createdAt: true,
          editorData: false, // Exclude large JSONB editorData for list view performance
          fileId: true,
          fileType: true,
          filename: true,
          id: true,
          metadata: true,
          pages: false, // Exclude large JSONB pages for list view performance
          parentId: true,
          slug: true,
          source: true,
          sourceType: true,
          title: true,
          totalCharCount: true,
          totalLineCount: true,
          updatedAt: true,
          userId: true,
        },
        limit: pageSize,
        offset,
        orderBy: [desc(documents.updatedAt)],
        where: whereCondition,
      }),
      this.db
        .select({ count: count(documents.id) })
        .from(documents)
        .where(whereCondition),
    ]);

    // Map to DocumentItem type with excluded fields as null
    const items = rawItems.map((item) => ({
      ...item,
      content: null,
      editorData: null,
      pages: null,
    })) as DocumentItem[];

    return { items, total: totalResult[0].count };
  };

  findById = async (id: string): Promise<DocumentItem | undefined> => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.userId, this.userId), eq(documents.id, id)),
    });
  };

  findByFileId = async (fileId: string) => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.userId, this.userId), eq(documents.fileId, fileId)),
    });
  };

  update = async (id: string, value: Partial<DocumentItem>) => {
    return this.db
      .update(documents)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(documents.userId, this.userId), eq(documents.id, id)));
  };
}
