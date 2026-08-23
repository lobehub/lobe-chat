import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { and, desc, eq, isNull, ne, or } from 'drizzle-orm';

import { QuickNoteModel } from '@/database/models/quickNote';
import { ThreadModel } from '@/database/models/thread';
import { documents, quickNoteResources, topics } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { AiAgentService } from '@/server/services/aiAgent';

interface QuickNoteDiscoveryOutput {
  /** Concise Markdown accepted into the Annotation lineage. */
  annotation: string;
  /** Existing Documents the agent judged clearly relevant. */
  relatedDocumentIds: string[];
  /** At most five lightweight labels merged onto the capture. */
  tags: string[];
}

interface QuickNoteContextCandidate {
  /** Candidate content or bounded summary. */
  content?: string | null;
  /** Stable Document or Topic identifier. */
  id: string;
  /** Candidate display title. */
  title?: string | null;
  /** Provenance family; Topic summaries are never presented as Documents. */
  type: 'document' | 'topic-summary';
}

/**
 * Normalizes rich-text JSON into bounded plain source text.
 *
 * Before:
 * - `{ root: { children: [{ text: "First" }, { text: "Second" }] } }`
 *
 * After:
 * - `First\nSecond`
 */
export const renderQuickNoteSourceText = (editorData: Record<string, unknown>): string => {
  const textNodes: string[] = [];

  // Walk only JSON values and collect explicit editor text nodes. This avoids
  // placing Lexical structure and formatting metadata into the model prompt.
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child);
      return;
    }

    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string' && record.text.trim()) textNodes.push(record.text.trim());
    if (typeof record.markdown === 'string' && record.markdown.trim()) {
      textNodes.push(record.markdown.trim());
    }
    for (const [key, child] of Object.entries(record)) {
      if (key !== 'markdown' && key !== 'text') visit(child);
    }
  };

  visit(editorData);
  return textNodes.join('\n');
};

/**
 * Normalizes Discovery model output into the bounded server-owned contract.
 *
 * Before:
 * - `````json\n{"annotation":"A","tags":["x"]}\n`````
 *
 * After:
 * - `{ annotation: "A", tags: ["x"], relatedDocumentIds: [] }`
 */
export const parseQuickNoteDiscoveryOutput = (content: string): QuickNoteDiscoveryOutput => {
  const normalized = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const value: unknown = JSON.parse(normalized);

  if (!value || typeof value !== 'object')
    throw new TypeError('Discovery output must be an object');
  const record = value as Record<string, unknown>;
  if (typeof record.annotation !== 'string' || !record.annotation.trim()) {
    throw new TypeError('Discovery output requires a non-empty annotation');
  }

  const stringArray = (candidate: unknown): string[] =>
    Array.isArray(candidate)
      ? candidate.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      : [];

  return {
    annotation: record.annotation.trim(),
    relatedDocumentIds: stringArray(record.relatedDocumentIds),
    tags: stringArray(record.tags).slice(0, 5),
  };
};

/**
 * Orchestrates immutable Quick Note Discovery and user-triggered Dive Runs.
 *
 * Call stack:
 *
 * QuickNote router / Agent Signal handler
 *   -> {@link QuickNoteProcessingService.startDiscovery} / {@link QuickNoteProcessingService.startDive}
 *     -> {@link QuickNoteModel.claimRun}
 *       -> {@link AiAgentService.execAgent}
 *         -> completion hook
 *           -> {@link QuickNoteProcessingService.onRunComplete}
 *             -> {@link QuickNoteModel.acceptAnnotation}
 *
 * Use when:
 * - Dispatching a lightweight background interpretation.
 * - Starting a manual Dive in the capture's stable Topic.
 *
 * Expects:
 * - The caller has already enforced the relevant user setting for Discovery.
 * - All reads and writes stay within the constructor's user/workspace scope.
 *
 * Returns:
 * - Domain Run and Agent Operation identities suitable for progress recovery.
 */
export class QuickNoteProcessingService {
  private readonly db: LobeChatDatabase;
  private readonly model: QuickNoteModel;
  private readonly threadModel: ThreadModel;
  private readonly userId: string;
  private readonly workspaceId?: string;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.db = db;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.model = new QuickNoteModel(db, userId, workspaceId);
    this.threadModel = new ThreadModel(db, userId, workspaceId);
  }

  /**
   * Claims and dispatches a projection-only Discovery Run.
   *
   * Use when:
   * - A quiet-period claim or server sweep has confirmed Automatic Discovery is enabled.
   *
   * Expects:
   * - The Quick Note is owned by this service scope.
   *
   * Returns:
   * - The active/new Run plus its operation identity, or `undefined` when inaccessible.
   */
  startDiscovery = async (quickNoteId: string) => {
    if (!(await QuickNoteModel.isAutomaticDiscoveryEnabled(this.db, this.userId))) return undefined;
    const run = await this.model.claimRun(quickNoteId, { kind: 'discovery' });
    if (!run) return undefined;
    if (run.operationId) return run;

    return this.execute(run.id, BUILTIN_AGENT_SLUGS.quickNoteDiscovery);
  };

  /**
   * Starts a Discovery Run already claimed by an Agent Signal producer.
   *
   * Use when:
   * - The `quick_note.discovery.requested` handler consumes a queued source.
   *
   * Expects:
   * - `runId` pins an immutable source history and belongs to this service scope.
   *
   * Returns:
   * - The running Run, existing active operation, or `undefined`.
   */
  dispatchDiscoveryRun = async (runId: string) => {
    if (!(await QuickNoteModel.isAutomaticDiscoveryEnabled(this.db, this.userId))) return undefined;
    const run = await this.model.getRunContext(runId);
    if (!run || run.kind !== 'discovery') return undefined;
    if (run.operationId) return run;

    return this.execute(runId, BUILTIN_AGENT_SLUGS.quickNoteDiscovery);
  };

  /**
   * Claims a Dive, creates its standalone Thread, and starts the Dive Agent.
   *
   * Use when:
   * - The user explicitly clicks the existing Dive button.
   *
   * Expects:
   * - Manual Dive remains available regardless of Automatic Discovery settings.
   *
   * Returns:
   * - The active/new Dive Run plus operation identity, or `undefined`.
   */
  startDive = async (quickNoteId: string) => {
    const run = await this.model.claimRun(quickNoteId, { kind: 'dive' });
    if (!run) return undefined;
    if (run.operationId) return run;

    const note = await this.model.findWithContent(quickNoteId);
    if (!note) return undefined;

    const thread = await this.threadModel.create({
      title: 'Quick Note Dive',
      topicId: note.topicId,
      type: 'standalone',
    });

    return this.execute(run.id, BUILTIN_AGENT_SLUGS.quickNoteDive, thread.id);
  };

  /**
   * Projects terminal Agent output back into the Run's Annotation lineage.
   *
   * Use when:
   * - An in-process hook or QStash-authenticated completion callback fires.
   *
   * Expects:
   * - `lastAssistantContent` is the terminal assistant projection for this Run.
   *
   * Returns:
   * - The accepted Resource output, or a failed Run when projection is invalid.
   */
  onRunComplete = async (params: {
    errorMessage?: string;
    lastAssistantContent?: string;
    reason: string;
    runId: string;
  }) => {
    const run = await this.model.getRunContext(params.runId);
    if (!run) return undefined;

    if (params.reason !== 'done' || !params.lastAssistantContent?.trim()) {
      return this.model.failRun(
        params.runId,
        params.errorMessage || `Agent completed without accepted output (${params.reason})`,
      );
    }

    try {
      if (run.kind === 'discovery' || run.kind === 'signal_enrichment') {
        const output = parseQuickNoteDiscoveryOutput(params.lastAssistantContent);
        const annotation = await this.model.acceptAnnotation(params.runId, {
          content: output.annotation,
          editorData: { markdown: output.annotation },
          tags: output.tags,
        });
        if (!annotation) return undefined;
        await Promise.all(
          output.relatedDocumentIds.map((documentId) =>
            this.model.linkDocumentResource(params.runId, documentId),
          ),
        );
        return annotation;
      }

      return this.model.acceptAnnotation(params.runId, {
        content: params.lastAssistantContent.trim(),
        editorData: { markdown: params.lastAssistantContent.trim() },
      });
    } catch (error) {
      return this.model.failRun(
        params.runId,
        error instanceof Error ? error.message : 'Failed to project Quick Note output',
      );
    }
  };

  private execute = async (runId: string, slug: string, threadId?: string) => {
    const context = await this.model.getRunContext(runId);
    if (!context) return undefined;

    const sourceText = renderQuickNoteSourceText(context.sourceEditorData);
    const candidates = await this.collectContextCandidates(
      context.quickNoteId,
      context.sourceHistoryId,
      context.topicId,
    );
    const prompt = [
      `<quick_note source_history_id="${context.sourceHistoryId}">`,
      sourceText,
      '</quick_note>',
      '<recent_context_candidates>',
      JSON.stringify(candidates),
      '</recent_context_candidates>',
    ].join('\n');

    const model = this.model;
    const userId = this.userId;
    const service = new AiAgentService(this.db, this.userId, { workspaceId: this.workspaceId });

    try {
      const result = await service.execAgent({
        appContext: {
          documentId: context.sourceDocumentId,
          scope: 'quick_note',
          suppressSignal: true,
          threadId,
          topicId: context.topicId,
        },
        hooks: [
          {
            handler: async (event) => {
              await this.onRunComplete({
                errorMessage: event.errorMessage,
                lastAssistantContent: event.lastAssistantContent,
                reason: event.reason || 'done',
                runId,
              });
            },
            id: 'quick-note-on-complete',
            type: 'onComplete' as const,
            webhook: {
              body: { runId, userId },
              delivery: 'qstash' as const,
              fallback: 'none' as const,
              url: '/api/workflows/quick-note/on-run-complete',
            },
          },
        ],
        maxSteps: slug === BUILTIN_AGENT_SLUGS.quickNoteDiscovery ? 1 : 12,
        prompt,
        slug,
        trigger: context.kind === 'dive' ? 'quick-note-dive' : 'agent-signal',
      });

      return model.attachOperation(runId, { operationId: result.operationId, threadId });
    } catch (error) {
      await model.failRun(
        runId,
        error instanceof Error ? error.message : 'Failed to start Quick Note Agent',
      );
      throw error;
    }
  };

  private collectContextCandidates = async (
    quickNoteId: string,
    sourceHistoryId: string,
    quickNoteTopicId: string,
  ): Promise<QuickNoteContextCandidate[]> => {
    const workspaceWhere = this.workspaceId
      ? eq(topics.workspaceId, this.workspaceId)
      : and(eq(topics.userId, this.userId), isNull(topics.workspaceId));
    const documentWhere = this.workspaceId
      ? and(
          eq(documents.workspaceId, this.workspaceId),
          or(eq(documents.visibility, 'public'), eq(documents.userId, this.userId)),
        )
      : and(eq(documents.userId, this.userId), isNull(documents.workspaceId));

    const [linkedDocuments, recentTopics, recentDocuments] = await Promise.all([
      this.db
        .select({ content: documents.content, id: documents.id, title: documents.title })
        .from(quickNoteResources)
        .innerJoin(documents, eq(documents.id, quickNoteResources.documentId))
        .where(
          and(
            eq(quickNoteResources.quickNoteId, quickNoteId),
            eq(quickNoteResources.sourceHistoryId, sourceHistoryId),
            ne(quickNoteResources.role, 'annotation'),
            documentWhere,
          ),
        )
        .orderBy(desc(quickNoteResources.updatedAt))
        .limit(5),
      this.db
        .select({ content: topics.historySummary, id: topics.id, title: topics.title })
        .from(topics)
        .where(workspaceWhere)
        .orderBy(desc(topics.updatedAt))
        .limit(5),
      this.db
        .select({ content: documents.content, id: documents.id, title: documents.title })
        .from(documents)
        .where(
          and(
            documentWhere,
            // Source/Annotation Documents are internal evidence, not Page candidates.
            eq(documents.sourceType, 'api'),
          ),
        )
        .orderBy(desc(documents.updatedAt))
        .limit(5),
    ]);

    const documentCandidates = new Map(
      [...linkedDocuments, ...recentDocuments].map((document) => [
        document.id,
        { ...document, content: document.content?.slice(0, 2000) },
      ]),
    );

    return [
      ...recentTopics
        .filter((topic) => topic.id !== quickNoteTopicId && Boolean(topic.content))
        .map((topic) => ({ ...topic, type: 'topic-summary' as const })),
      ...[...documentCandidates.values()].map((document) => ({
        ...document,
        type: 'document' as const,
      })),
    ];
  };
}
