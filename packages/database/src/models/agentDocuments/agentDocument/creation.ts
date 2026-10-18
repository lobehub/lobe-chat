import { AGENT_DOCUMENT_FILE_TYPE, AGENT_DOCUMENT_SOURCE_TYPE } from '@lobechat/const';
import { and, eq, isNull } from 'drizzle-orm';

import {
  agentDocuments,
  documents,
  type NewAgentDocument,
  type NewDocument,
} from '../../../schemas';
import type { Transaction } from '../../../type';
import { buildCopyParams } from '../copyDocument';
import { buildDocumentFilename } from '../filename';
import { normalizePolicy } from '../policy';
import {
  AgentAccess,
  type AgentDocument,
  DocumentLoadFormat,
  DocumentLoadPosition,
  DocumentLoadRule,
  PolicyLoad,
} from '../types';
import {
  agentDocOwnership,
  type AgentDocumentContext,
  documentOwnership,
  scopeMetadata,
} from './context';
import { findById } from './queries';
import type { AgentDocumentCreateParams, ConvertAgentDocumentToSkillIndexParams } from './types';
import { getDocumentStats, getMetadataDescription, toAgentDocument } from './utils';

/**
 * Associates an existing document row with an agent document binding.
 *
 * Use when:
 * - A document already exists and should become visible to an agent.
 * - Managed mount providers need to bind pre-created document tree nodes.
 *
 * Expects:
 * - `documentId` belongs to the current user.
 * - Duplicate filenames are allowed; path-style callers resolve visible duplicates separately.
 *
 * Returns:
 * - The inserted or existing agent document binding id.
 * - An empty id only when the source document is missing.
 *
 */
export async function associate(
  ctx: AgentDocumentContext,
  params: {
    agentId: string;
    documentId: string;
    policyLoad?: PolicyLoad;
  },
): Promise<{ id: string }> {
  const { agentId, documentId, policyLoad } = params;

  return ctx.db.transaction(async (trx) => {
    const [doc] = await trx
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), documentOwnership(ctx)))
      .limit(1);

    if (!doc) return { id: '' };

    const [result] = await trx
      .insert(agentDocuments)
      .values({
        accessPublic: 0,
        accessSelf:
          AgentAccess.EXECUTE |
          AgentAccess.LIST |
          AgentAccess.READ |
          AgentAccess.WRITE |
          AgentAccess.DELETE,
        accessShared: 0,
        agentId,
        documentId,
        policyLoad: policyLoad ?? PolicyLoad.PROGRESSIVE,
        policyLoadFormat: DocumentLoadFormat.RAW,
        policyLoadPosition: DocumentLoadPosition.BEFORE_FIRST_USER,
        policyLoadRule: DocumentLoadRule.ALWAYS,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId ?? null,
      })
      .onConflictDoNothing()
      .returning({ id: agentDocuments.id });

    if (result) return result;

    // A concurrent caller (or an earlier run) may already own this unique
    // agent/document binding. The conflict loser must resolve that row instead
    // of leaking `undefined` to callers that need the binding id.
    const [existing] = await trx
      .select({ id: agentDocuments.id })
      .from(agentDocuments)
      .where(
        and(
          agentDocOwnership(ctx),
          eq(agentDocuments.agentId, agentId),
          eq(agentDocuments.documentId, documentId),
        ),
      )
      .limit(1);

    return { id: existing?.id ?? '' };
  });
}

/**
 * Creates a document row and links it to an agent in one transaction.
 *
 * Use when:
 * - Creating ordinary agent-visible VFS files or folders.
 * - Creating model-owned documents that still need agent document policy metadata.
 *
 * Expects:
 * - `filename` is a single VFS segment supplied by the caller.
 * - Duplicate filenames are allowed; path-style callers resolve visible duplicates separately.
 *
 * Returns:
 * - The created agent document with joined document content and metadata.
 *
 */
export async function create(
  ctx: AgentDocumentContext,
  agentId: string,
  filename: string,
  content: string,
  params?: AgentDocumentCreateParams,
): Promise<AgentDocument> {
  return ctx.db.transaction((trx) => createWithTx(ctx, trx, agentId, filename, content, params));
}

/**
 * Creates a document row and links it to an agent inside a caller-owned transaction.
 *
 * Use when:
 * - A higher-level aggregate must create multiple agent documents atomically.
 * - Callers already run `db.transaction` and need to avoid nested transactions.
 *
 * Expects:
 * - `trx` is the active transaction for every write in the aggregate.
 * - `filename` is a single VFS segment supplied by the caller.
 *
 * Returns:
 * - The created agent document with joined document content and metadata.
 */
export async function createWithTx(
  ctx: AgentDocumentContext,
  trx: Transaction,
  agentId: string,
  filename: string,
  content: string,
  params?: AgentDocumentCreateParams,
): Promise<AgentDocument> {
  const {
    createdAt,
    editorData,
    fileId,
    fileType = AGENT_DOCUMENT_FILE_TYPE,
    loadPosition,
    loadRules,
    metadata,
    parentId,
    policy,
    policyLoad,
    source,
    sourceType = AGENT_DOCUMENT_SOURCE_TYPE,
    templateId,
    title: providedTitle,
    updatedAt,
  } = params ?? {};

  const title = providedTitle?.trim() || filename.replace(/\.[^.]+$/, '');
  const stats = getDocumentStats(content);
  const normalizedPolicy = normalizePolicy(loadPosition, loadRules, policy);
  const scopedMetadata = scopeMetadata(ctx, metadata);

  const documentPayload: NewDocument = {
    content,
    createdAt,
    description: getMetadataDescription(scopedMetadata),
    // NOTICE:
    // Agent documents often carry Markdown `content`, but editor history and restore UI
    // depend on this serialized editor snapshot. Service callers that derive content from
    // Markdown should pass a matching `editorData` snapshot instead of relying on content alone.
    // Root cause: `document_histories` snapshots `editor_data`, so missing editor data makes
    // pre-mutation history capture impossible.
    // Removal condition: only if document history supports Markdown-content snapshots.
    editorData,
    fileType,
    filename,
    parentId,
    metadata: scopedMetadata,
    ...(fileId ? { fileId } : {}),
    source: source ?? `agent-document://${agentId}/${encodeURIComponent(filename)}`,
    sourceType,
    title,
    totalCharCount: stats.totalCharCount,
    totalLineCount: stats.totalLineCount,
    updatedAt: updatedAt ?? createdAt,
    userId: ctx.userId,
    // Keep newly created agent resources shared within their existing workspace scope.
    visibility: 'public',
    workspaceId: ctx.workspaceId ?? null,
  };

  const [insertedDocument] = await trx.insert(documents).values(documentPayload).returning();

  const newDoc: NewAgentDocument = {
    accessPublic: 0,
    accessSelf:
      AgentAccess.EXECUTE |
      AgentAccess.LIST |
      AgentAccess.READ |
      AgentAccess.WRITE |
      AgentAccess.DELETE,
    accessShared: 0,
    agentId,
    createdAt,
    policyLoad: policyLoad ?? PolicyLoad.PROGRESSIVE,
    deleteReason: null,
    deletedAt: null,
    deletedByAgentId: null,
    deletedByUserId: null,
    documentId: insertedDocument!.id,
    policy: normalizedPolicy,
    policyLoadFormat: normalizedPolicy.context?.policyLoadFormat || DocumentLoadFormat.RAW,
    policyLoadPosition:
      normalizedPolicy.context?.position || DocumentLoadPosition.BEFORE_FIRST_USER,
    policyLoadRule: normalizedPolicy.context?.rule || DocumentLoadRule.ALWAYS,
    templateId,
    updatedAt: updatedAt ?? createdAt,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId ?? null,
  };

  const [settings] = await trx.insert(agentDocuments).values(newDoc).returning();

  return toAgentDocument(settings!, insertedDocument!);
}

/**
 * Converts an existing ordinary agent document binding into a managed skill index.
 *
 * Use when:
 * - Agent Signal promoted an already-created agent document into skill management.
 * - The caller must preserve both the agent document id and backing document id.
 *
 * Expects:
 * - `agentDocumentId` is a live binding owned by the current user.
 * - `parentId` points to the managed skill bundle document row.
 *
 * Returns:
 * - The same agent document binding after document identity and load metadata are updated.
 *
 */
export async function convertAgentDocumentToSkillIndex(
  ctx: AgentDocumentContext,
  params: ConvertAgentDocumentToSkillIndexParams,
): Promise<AgentDocument | undefined> {
  return ctx.db.transaction((trx) => convertAgentDocumentToSkillIndexWithTx(ctx, trx, params));
}

/**
 * Converts a live agent document binding into a managed skill index inside a transaction.
 *
 * Use when:
 * - A higher-level skill aggregate also creates the owning bundle in the same transaction.
 * - The caller must preserve both `agent_documents.id` and `documents.id`.
 *
 * Expects:
 * - `trx` is the active transaction for the whole skill creation operation.
 * - `parentId` points to the managed skill bundle document row inside the same transaction.
 *
 * Returns:
 * - The same agent document binding after document identity and load metadata are updated.
 */
export async function convertAgentDocumentToSkillIndexWithTx(
  ctx: AgentDocumentContext,
  trx: Transaction,
  params: ConvertAgentDocumentToSkillIndexParams,
): Promise<AgentDocument | undefined> {
  const [existingResult] = await trx
    .select({ doc: documents, settings: agentDocuments })
    .from(agentDocuments)
    .innerJoin(documents, eq(agentDocuments.documentId, documents.id))
    .where(
      and(
        eq(agentDocuments.id, params.agentDocumentId),
        agentDocOwnership(ctx),
        isNull(agentDocuments.deletedAt),
      ),
    )
    .limit(1);

  if (!existingResult) return undefined;

  const existing = toAgentDocument(existingResult.settings, existingResult.doc);
  if (!existing) return undefined;

  const stats = getDocumentStats(params.content);
  const updatedAt = new Date();
  const scopedMetadata = scopeMetadata(ctx, params.metadata);

  await trx
    .update(documents)
    .set({
      content: params.content,
      description: getMetadataDescription(scopedMetadata),
      ...(params.editorData !== undefined && { editorData: params.editorData }),
      filename: params.filename,
      fileType: 'skills/index',
      metadata: scopedMetadata,
      parentId: params.parentId,
      source: params.source,
      sourceType: params.sourceType,
      title: params.title,
      totalCharCount: stats.totalCharCount,
      totalLineCount: stats.totalLineCount,
    })
    .where(and(eq(documents.id, existing.documentId), documentOwnership(ctx)));

  await trx
    .update(agentDocuments)
    .set({
      policyLoad: PolicyLoad.DISABLED,
      templateId: 'agent-skill',
      updatedAt,
    })
    .where(
      and(
        eq(agentDocuments.id, params.agentDocumentId),
        agentDocOwnership(ctx),
        isNull(agentDocuments.deletedAt),
      ),
    );

  const [updatedResult] = await trx
    .select({ doc: documents, settings: agentDocuments })
    .from(agentDocuments)
    .innerJoin(documents, eq(agentDocuments.documentId, documents.id))
    .where(
      and(
        eq(agentDocuments.id, params.agentDocumentId),
        agentDocOwnership(ctx),
        isNull(agentDocuments.deletedAt),
      ),
    )
    .limit(1);

  return updatedResult ? toAgentDocument(updatedResult.settings, updatedResult.doc) : undefined;
}

export async function copy(
  ctx: AgentDocumentContext,
  documentId: string,
  newTitle?: string,
): Promise<AgentDocument | undefined> {
  const existing = await findById(ctx, documentId);
  if (!existing) return undefined;

  const title = newTitle?.trim();
  const filename = title ? buildDocumentFilename(title) : `copy-${Date.now()}-${existing.filename}`;

  // Empty-parse shells must not be duplicated as another shell (the clone
  // reads as Lexical error #38 and blocks cleanup); see `copyDocument.ts`
  // for the shell detection and raw-text downgrade.
  return create(
    ctx,
    existing.agentId,
    filename,
    existing.content,
    buildCopyParams(existing, title),
  );
}
