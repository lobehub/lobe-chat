import { FileSource } from '@lobechat/types';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { files, globalFiles } from '../schemas';
import type { LobeChatDatabase } from '../type';
import { buildWorkspacePayload, buildWorkspaceWhere } from '../utils/workspace';

export interface CanvasBlobRecord {
  contentType: string;
  hash: string;
  name: string;
  size: number;
  url: string;
}

const canvasIdField = sql<string | null>`${files.metadata} ->> 'canvasId'`;

export class CanvasFileModel {
  private db: LobeChatDatabase;
  private userId: string;
  private workspaceId?: string;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.db = db;
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  private ownership = () =>
    and(
      buildWorkspaceWhere({ userId: this.userId, workspaceId: this.workspaceId }, files),
      eq(files.userId, this.userId),
      eq(files.source, FileSource.Canvas),
    );

  listByHashes = async (hashes: string[]) => {
    if (hashes.length === 0) return [];

    return this.db
      .select({ canvasId: canvasIdField, fileHash: files.fileHash, id: files.id, url: files.url })
      .from(files)
      .where(and(this.ownership(), inArray(files.fileHash, hashes)));
  };

  register = async (canvasId: string, blobs: CanvasBlobRecord[]) => {
    const existing = new Set(
      (await this.listByHashes(blobs.map((item) => item.hash)))
        .filter((row) => row.canvasId === canvasId)
        .map((row) => row.fileHash),
    );
    const fresh = blobs.filter((item) => !existing.has(item.hash));
    if (fresh.length === 0) return;

    await this.db.transaction(async (tx) => {
      await tx
        .insert(globalFiles)
        .values(
          fresh.map((item) => ({
            creator: this.userId,
            fileType: item.contentType,
            hashId: item.hash,
            size: item.size,
            url: item.url,
          })),
        )
        .onConflictDoNothing();

      await tx.insert(files).values(
        fresh.map((item) =>
          buildWorkspacePayload(
            { userId: this.userId, workspaceId: this.workspaceId },
            {
              fileHash: item.hash,
              fileType: item.contentType,
              metadata: { canvasId },
              name: item.name,
              size: item.size,
              source: FileSource.Canvas,
              url: item.url,
            },
          ),
        ),
      );
    });
  };

  deleteByCanvas = async (canvasId: string): Promise<string[]> => {
    const removed = await this.db
      .delete(files)
      .where(and(this.ownership(), eq(canvasIdField, canvasId)))
      .returning({ url: files.url });

    const urls = [...new Set(removed.map((row) => row.url))];
    if (urls.length === 0) return [];

    const stillUsed = await this.db
      .select({ url: files.url })
      .from(files)
      .where(and(this.ownership(), inArray(files.url, urls)));
    const used = new Set(stillUsed.map((row) => row.url));

    return urls.filter((url) => !used.has(url));
  };
}
