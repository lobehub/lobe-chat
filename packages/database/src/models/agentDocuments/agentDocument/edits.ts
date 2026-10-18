import { and, eq, isNull, sql } from 'drizzle-orm';

import {
  agentDocuments,
  documents,
  type NewAgentDocument,
  type NewDocument,
} from '../../../schemas';
import { buildDocumentFilename } from '../filename';
import { composeToolPolicyUpdate, normalizePolicy, parseLoadRules } from '../policy';
import {
  type AgentDocument,
  type AgentDocumentPolicy,
  DocumentLoadFormat,
  DocumentLoadPosition,
  DocumentLoadRule,
  type DocumentLoadRules,
  type PolicyLoad,
  type ToolUpdateLoadRule,
} from '../types';
import {
  agentDocOwnership,
  type AgentDocumentContext,
  documentOwnership,
  scopeMetadata,
} from './context';
import { create } from './creation';
import { findByFilename, findById } from './queries';
import { getDocumentStats, getMetadataDescription } from './utils';

/**
 * Writes a repaired editor snapshot only if the backing document still holds
 * the version the repair was computed from.
 *
 * Use when:
 * - A read path rebuilds `editorData` from Markdown and must persist it so the
 *   node ids it exposes stay addressable, without clobbering a concurrent save.
 *
 * Expects:
 * - `expected` is the `content` / `editorData` pair the caller read.
 *
 * Returns:
 * - `true` when the snapshot was written; `false` when the document changed
 *   (or is gone) since it was read, in which case nothing is written.
 */
export async function updateEditorSnapshotIfUnchanged(
  ctx: AgentDocumentContext,
  documentId: string,
  expected: { content: string; editorData: Record<string, any> | null },
  next: { content: string; editorData: Record<string, any> },
): Promise<boolean> {
  const existing = await findById(ctx, documentId);
  if (!existing) return false;

  const stats = getDocumentStats(next.content);
  const expectedEditorData =
    expected.editorData === null || expected.editorData === undefined
      ? null
      : JSON.stringify(expected.editorData);

  const updated = await ctx.db
    .update(documents)
    .set({
      content: next.content,
      editorData: next.editorData,
      totalCharCount: stats.totalCharCount,
      totalLineCount: stats.totalLineCount,
    })
    .where(
      and(
        eq(documents.id, existing.documentId),
        documentOwnership(ctx),
        sql`coalesce(${documents.content}, '') = ${expected.content}`,
        sql`${documents.editorData} IS NOT DISTINCT FROM ${expectedEditorData}::jsonb`,
      ),
    )
    .returning({ id: documents.id });

  return updated.length > 0;
}

export async function update(
  ctx: AgentDocumentContext,
  documentId: string,
  params?: {
    content?: string;
    editorData?: Record<string, any> | null;
    fileType?: string;
    loadPosition?: DocumentLoadPosition;
    loadRules?: Partial<DocumentLoadRules>;
    metadata?: Record<string, any>;
    policy?: AgentDocumentPolicy;
    policyLoad?: PolicyLoad;
  },
): Promise<void> {
  const { content, editorData, fileType, loadPosition, loadRules, metadata, policy, policyLoad } =
    params ?? {};

  const existing = await findById(ctx, documentId);

  if (!existing) return;

  const existingPolicy = existing.policy || {};
  const existingContext = existingPolicy.context || {};

  const mergedPolicy = normalizePolicy(
    loadPosition ||
      (existingContext.position as DocumentLoadPosition | undefined) ||
      DocumentLoadPosition.BEFORE_FIRST_USER,
    {
      keywordMatchMode: loadRules?.keywordMatchMode ?? existingContext.keywordMatchMode,
      keywords: loadRules?.keywords ?? existingContext.keywords,
      maxTokens: loadRules?.maxTokens ?? existingContext.maxTokens,
      priority: loadRules?.priority ?? existingContext.priority,
      regexp: loadRules?.regexp ?? existingContext.regexp,
      rule: (loadRules?.rule ??
        existingContext.rule ??
        DocumentLoadRule.ALWAYS) as DocumentLoadRule,
      timeRange: loadRules?.timeRange ?? existingContext.timeRange,
    },
    policy ? { ...existingPolicy, ...policy } : existingPolicy,
  );

  const settingsUpdate: Partial<NewAgentDocument> = {
    policy: mergedPolicy,
    policyLoadFormat: mergedPolicy.context?.policyLoadFormat || DocumentLoadFormat.RAW,
    policyLoadPosition: mergedPolicy.context?.position || DocumentLoadPosition.BEFORE_FIRST_USER,
    policyLoadRule: mergedPolicy.context?.rule || DocumentLoadRule.ALWAYS,
    ...(policyLoad !== undefined && { policyLoad }),
  };

  await ctx.db.transaction(async (trx) => {
    if (
      content !== undefined ||
      editorData !== undefined ||
      fileType !== undefined ||
      metadata !== undefined
    ) {
      const documentUpdate: Partial<NewDocument> = {};

      if (content !== undefined) {
        // NOTICE:
        // Updating Markdown content alone is valid for raw consumers, but it does not refresh
        // the editor snapshot used by document history. Callers that replace full Markdown
        // should also provide `editorData` from the same content when they expect history or
        // editor restore support to keep working.
        // Root cause: `DocumentService.trySaveCurrentDocumentHistory` validates editor data
        // before creating history rows.
        // Removal condition: only if document history supports Markdown-content snapshots.
        const stats = getDocumentStats(content);
        documentUpdate.content = content;
        documentUpdate.totalCharCount = stats.totalCharCount;
        documentUpdate.totalLineCount = stats.totalLineCount;
      }

      if (editorData !== undefined) {
        documentUpdate.editorData = editorData;
      }

      if (fileType !== undefined) {
        documentUpdate.fileType = fileType;
      }

      if (metadata !== undefined) {
        const scopedMetadata = scopeMetadata(ctx, metadata);
        documentUpdate.metadata = scopedMetadata;
        documentUpdate.description = getMetadataDescription(scopedMetadata);
      }

      await trx
        .update(documents)
        .set(documentUpdate)
        .where(and(eq(documents.id, existing.documentId), documentOwnership(ctx)));
    }

    await trx
      .update(agentDocuments)
      .set(settingsUpdate)
      .where(and(eq(agentDocuments.id, documentId), agentDocOwnership(ctx)));
  });
}

/**
 * Updates backing document identity fields without changing ids or load policy.
 *
 * Use when:
 * - Managed skill services need to rename or reparent a document row.
 * - Callers must preserve agent document id and backing document id.
 *
 * Expects:
 * - `agentDocumentId` is the agent document binding id, not the backing document row id.
 * - Omitted fields are left untouched.
 *
 * Returns:
 * - The same agent document binding after identity fields are updated.
 *
 */
export async function updateDocumentIdentity(
  ctx: AgentDocumentContext,
  agentDocumentId: string,
  params: {
    filename?: string;
    metadata?: Record<string, unknown>;
    parentId?: string | null;
    title?: string;
  },
): Promise<AgentDocument | undefined> {
  const existing = await findById(ctx, agentDocumentId);
  if (!existing) return undefined;

  if (
    params.filename === undefined &&
    params.metadata === undefined &&
    params.parentId === undefined &&
    params.title === undefined
  ) {
    return existing;
  }

  await ctx.db
    .update(documents)
    .set({
      ...(params.filename !== undefined && { filename: params.filename }),
      ...(params.metadata !== undefined && {
        description: getMetadataDescription(scopeMetadata(ctx, params.metadata)),
        metadata: scopeMetadata(ctx, params.metadata),
      }),
      ...(params.parentId !== undefined && { parentId: params.parentId }),
      ...(params.title !== undefined && { title: params.title }),
    })
    .where(and(eq(documents.id, existing.documentId), documentOwnership(ctx)));

  return findById(ctx, agentDocumentId);
}

/**
 * Renames an agent document by updating the backing document filename and title.
 *
 * Use when:
 * - A caller wants title-style rename behavior.
 * - The document should keep its binding, content, policy, and document identity.
 *
 * Expects:
 * - `newTitle` is a human-readable title that can be normalized into a filename.
 * - Duplicate filenames are allowed; path-style callers resolve visible duplicates separately.
 *
 * Returns:
 * - The renamed agent document, or `undefined` when the binding is not visible.
 *
 */
export async function rename(
  ctx: AgentDocumentContext,
  documentId: string,
  newTitle: string,
  options?: { filename?: string },
): Promise<AgentDocument | undefined> {
  const existing = await findById(ctx, documentId);
  if (!existing) return undefined;

  const title = newTitle.trim();
  if (!title) return existing;

  const filename = options?.filename?.trim() || buildDocumentFilename(title);
  const source = `agent-document://${existing.agentId}/${encodeURIComponent(filename)}`;

  await ctx.db.transaction(async (trx) => {
    await trx
      .update(documents)
      .set({
        filename,
        source,
        title,
      })
      .where(and(eq(documents.id, existing.documentId), documentOwnership(ctx)));
  });

  return findById(ctx, documentId);
}

/**
 * Moves or renames an agent document without changing its binding or document identity.
 *
 * Use when:
 * - VFS `rename(from, to)` needs filesystem-style metadata mutation
 * - Callers must preserve document id, agent document id, policy, history, and load settings
 *
 * Expects:
 * - `filename` is already validated as a single VFS path segment
 * - `parentId` points to a document row owned by the same user, or `null` for root
 * - Duplicate filenames are allowed; path-style callers resolve visible duplicates separately
 * - `title` defaults to `filename` (path-style rename); id-based moves pass the current title
 *   so relocating a document never rewrites what the user sees
 *
 * Returns:
 * - The same agent document binding after the backing document row is moved
 *
 */
export async function movePath(
  ctx: AgentDocumentContext,
  documentId: string,
  params: { filename: string; parentId: string | null; title?: string },
): Promise<AgentDocument | undefined> {
  const existing = await findById(ctx, documentId);
  if (!existing) return undefined;

  const filename = params.filename.trim();
  if (!filename) return existing;

  const source = `agent-document://${existing.agentId}/${encodeURIComponent(filename)}`;

  await ctx.db.transaction(async (trx) => {
    await trx
      .update(documents)
      .set({
        filename,
        parentId: params.parentId,
        source,
        title: params.title ?? filename,
      })
      .where(and(eq(documents.id, existing.documentId), documentOwnership(ctx)));
  });

  return findById(ctx, documentId);
}

export async function updateToolLoadRule(
  ctx: AgentDocumentContext,
  documentId: string,
  rule: ToolUpdateLoadRule,
): Promise<AgentDocument | undefined> {
  const existing = await findById(ctx, documentId);
  if (!existing) return undefined;
  const composedPolicy = composeToolPolicyUpdate(existing.policy, rule, existing.policyLoad);

  await ctx.db
    .update(agentDocuments)
    .set({
      policyLoad: composedPolicy.policyLoad,
      policy: composedPolicy.policy,
      policyLoadFormat: composedPolicy.policyLoadFormat,
      policyLoadRule: composedPolicy.policyLoadRule,
    })
    .where(
      and(
        eq(agentDocuments.id, documentId),
        agentDocOwnership(ctx),
        isNull(agentDocuments.deletedAt),
      ),
    );

  return findById(ctx, documentId);
}

/**
 * Updates an existing document by filename or creates a new one when missing.
 *
 * Use when:
 * - Callers want idempotent writes keyed by agent and filename.
 * - Existing document policy and metadata should be merged on update.
 *
 * Expects:
 * - `filename` addresses the current agent's ordinary filename lookup.
 * - Duplicate filenames are allowed; the first matching filename is the oldest live binding.
 *
 * Returns:
 * - The updated or created agent document.
 *
 */
export async function upsert(
  ctx: AgentDocumentContext,
  agentId: string,
  filename: string,
  content: string,
  params?: {
    createdAt?: Date;
    editorData?: Record<string, any>;
    loadPosition?: DocumentLoadPosition;
    loadRules?: DocumentLoadRules;
    metadata?: Record<string, any>;
    policy?: AgentDocumentPolicy;
    policyLoad?: PolicyLoad;
    templateId?: string;
    updatedAt?: Date;
  },
): Promise<AgentDocument> {
  const {
    createdAt,
    editorData,
    loadPosition,
    loadRules,
    metadata,
    policy,
    policyLoad,
    templateId,
    updatedAt,
  } = params ?? {};

  const existing = await findByFilename(ctx, agentId, filename);

  if (existing) {
    const currentRules = parseLoadRules(existing);
    const mergedRules = loadRules ? { ...currentRules, ...loadRules } : currentRules;
    const mergedMetadata = metadata
      ? { ...existing.metadata, ...metadata }
      : (existing.metadata ?? undefined);

    await update(ctx, existing.id, {
      content,
      editorData,
      loadPosition,
      loadRules: mergedRules,
      metadata: mergedMetadata,
      policy,
      policyLoad,
    });

    return (await findByFilename(ctx, agentId, filename))!;
  }

  return create(ctx, agentId, filename, content, {
    createdAt,
    editorData,
    loadPosition,
    loadRules,
    metadata,
    policy,
    policyLoad,
    templateId,
    updatedAt,
  });
}
