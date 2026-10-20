import { debounce } from 'es-toolkit/compat';

import { mutate, useClientDataSWR, useOnlyFetchOnceSWR } from '@/libs/swr';
import { type QuickNoteItem, quickNoteService } from '@/services/quickNote';
import type { StoreSetter } from '@/store/types';
import { flattenActions } from '@/store/utils/flattenActions';

import { initialState } from './initialState';
import { createQuickNoteProposalSlice, type QuickNoteProposalAction } from './proposalAction';
import type { QuickNoteStore } from './store';

/** Quiet period after a persisted edit before the client asks the server to claim Analyze. */
export const ANALYZE_SETTLE_DELAY = 6000;
/** Poll interval used to project completed background Analyze into the open panel. */
export const ANALYZE_POLL_INTERVAL = 1000;
/** Editor save debounce that limits network writes while typing. */
export const PERSIST_DEBOUNCE = 1000;
/** Maximum time an active editor may defer its next durable save. */
export const PERSIST_MAX_WAIT = 5000;
/**
 * Delays after a meaning check's due time at which the open note re-reads its Proposals.
 *
 * The server sweep claims due checks once a minute and then asks the model, so the result lands
 * up to about a minute after the due time; later attempts back off and the series stops there.
 */
export const STALE_CHECK_REFRESH_DELAYS = [15_000, 45_000, 90_000, 180_000];

type Setter = StoreSetter<QuickNoteStore>;

/** Each store generation (a reset on scope switch) reads its own list entry. */
let quickNoteListGeneration = 0;
const agenticDetailKey = (id: string) => ['QUICK_NOTE_AGENTIC_DETAIL', id] as const;

/**
 * Coordinates optimistic Quick Note editing with server-owned persistence and Runs.
 *
 * Use when:
 * - Existing Quick Note components need CRUD, save status, and Analyze actions.
 *
 * Expects:
 * - The service owns durable state; local records are optimistic projections only.
 *
 * Returns:
 * - Public actions flattened into the Quick Note Zustand store.
 */
export class QuickNoteActionImpl {
  readonly #get: () => QuickNoteStore;
  readonly #set: (state: Partial<QuickNoteStore>, replace?: false, action?: string) => void;
  readonly #rawSet: Setter;
  #disposed = false;
  #notesHydrated = false;
  readonly #listKey = ['QUICK_NOTE_LIST', ++quickNoteListGeneration] as const;
  #pollingActive = true;
  readonly #observedAnalyze = new Set<string>();
  readonly #pollFailures = new Map<string, number>();
  readonly #dirtyIds = new Set<string>();
  readonly #pendingEditorData = new Map<string, Record<string, unknown>>();
  /** The in-flight save of each note; the next save of that note waits for it. */
  readonly #inFlightSaves = new Map<string, Promise<void>>();
  readonly #analyzeTimers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly #analyzePollers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly #staleCheckTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(set: Setter, get: () => QuickNoteStore, _api?: unknown) {
    void _api;
    this.#rawSet = set;
    this.#set = (state, replace, action) => {
      if (!this.#disposed) set(state, replace, action);
    };
    this.#get = get;
  }

  /**
   * Clears scoped data and replaces actions so old asynchronous work cannot write into the new scope.
   *
   * Use when:
   * - The authenticated user, server, or active workspace changes.
   *
   * Expects:
   * - Scope switching calls reset before hydrating the next list.
   *
   * Returns:
   * - A clean store; old timers, pending saves, and response writers are invalidated.
   */
  reset = (): void => {
    this.#disposed = true;
    this.#persist.cancel();
    for (const timers of [this.#analyzeTimers, this.#analyzePollers, this.#staleCheckTimers]) {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    }
    this.#dirtyIds.clear();
    this.#pendingEditorData.clear();
    this.#rawSet(
      {
        ...initialState,
        ...flattenActions<QuickNoteStoreAction>([
          new QuickNoteActionImpl(this.#rawSet, this.#get),
          createQuickNoteProposalSlice(this.#rawSet, this.#get),
        ]),
      },
      false,
      'resetQuickNoteStore',
    );
  };

  /**
   * Suspends status reads while the Quick Note surface is inactive and resumes pending observations.
   *
   * Use when:
   * - The note surface mounts, unmounts, or changes document visibility.
   *
   * Expects:
   * - Persistence and server-side execution continue independently.
   *
   * Returns:
   * - Nothing; suspended run observations are retained until resumption or reset.
   */
  setPollingActive = (active: boolean): void => {
    if (this.#disposed) return;
    this.#pollingActive = active;
    for (const timer of this.#analyzePollers.values()) clearTimeout(timer);
    this.#analyzePollers.clear();
    if (!active) {
      // An inactive surface re-reads its Proposals on return (SWR revalidates on focus).
      this.#cancelStaleCheckRefresh();
      return;
    }
    for (const id of this.#observedAnalyze) this.#scheduleAnalyzePoll(id);
  };

  /**
   * Loads the note list once for a mounted Quick Note surface.
   *
   * Use when:
   * - A Home feed or Note route mounts and needs the list.
   *
   * Expects:
   * - Local edits made after the first load are authoritative, so later responses do not replace them.
   *
   * Returns:
   * - The SWR response; results are projected into the store.
   */
  useFetchNotes = (enabled = true) =>
    useOnlyFetchOnceSWR(enabled ? this.#listKey : null, () => quickNoteService.getNotes(), {
      onError: () => this.#markNotesLoadFailed(),
      onSuccess: (notes: QuickNoteItem[]) => this.#hydrateNotes(notes),
    });

  /** Loads the note list imperatively (retry, or before creating a note outside a mounted surface). */
  initNotes = async () => {
    if (this.#disposed) return;
    if (this.#get().notesInit && !this.#get().notesLoadError) return;
    this.#set({ notesLoadError: false }, false, 'initNotes/start');

    try {
      this.#hydrateNotes(await quickNoteService.getNotes());
    } catch {
      this.#markNotesLoadFailed();
    }
  };

  #markNotesLoadFailed = () => {
    if (this.#disposed) return;
    this.#set({ notesInit: true, notesLoadError: true }, false, 'initNotes/failed');
  };

  #hydrateNotes = (notes: QuickNoteItem[]) => {
    if (this.#disposed) return;
    // A later response must not overwrite edits made after the first successful load.
    if (this.#notesHydrated) return;
    this.#notesHydrated = true;

    const analyzingActiveNoteIds = notes
      .filter(
        (note) => note.run?.kind === 'analyze' && ['pending', 'running'].includes(note.run.status),
      )
      .map((note) => note.id);
    this.#set(
      {
        notes,
        notesInit: true,
        notesLoadError: false,
      },
      false,
      'initNotes/success',
    );
    for (const id of analyzingActiveNoteIds) this.#scheduleAnalyzePoll(id);
    for (const note of notes) {
      if (note.analyzeDueAt && !analyzingActiveNoteIds.includes(note.id)) {
        this.#scheduleAnalyze(note.id, note.analyzeDueAt);
      }
    }
  };

  createNote = async (content = '', editorData?: Record<string, unknown>): Promise<string> => {
    const note = await quickNoteService.createNote(content, editorData);
    this.#set({ notes: [note, ...this.#get().notes] }, false, 'createNote');
    if (note.analyzeDueAt) this.#scheduleAnalyze(note.id, note.analyzeDueAt);
    return note.id;
  };

  flushPendingWrites = async (): Promise<void> => {
    await this.#persist.flush();
  };

  useFetchAgenticDetails = (id?: string) =>
    useClientDataSWR(
      id ? agenticDetailKey(id) : null,
      () => quickNoteService.getAgenticDetails(id!),
      {
        onSuccess: (details) => {
          this.#set(
            { agenticDetailMap: { ...this.#get().agenticDetailMap, [id!]: details } },
            false,
            'useFetchAgenticDetails/success',
          );
        },
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      },
    );

  refreshAgenticDetails = async (id: string): Promise<void> => {
    if (!this.#disposed) await mutate(agenticDetailKey(id));
  };

  createComment = async (quickNoteId: string, content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed || this.#get().creatingCommentNoteIds.includes(quickNoteId)) return;

    this.#set(
      { creatingCommentNoteIds: [...this.#get().creatingCommentNoteIds, quickNoteId] },
      false,
      'createComment/start',
    );
    try {
      await quickNoteService.createComment(quickNoteId, trimmed);
      await this.refreshAgenticDetails(quickNoteId);
    } finally {
      this.#set(
        {
          creatingCommentNoteIds: this.#get().creatingCommentNoteIds.filter(
            (id) => id !== quickNoteId,
          ),
        },
        false,
        'createComment/end',
      );
    }
  };

  updateComment = async (
    quickNoteId: string,
    commentId: string,
    content: string,
  ): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed || this.#get().editingCommentIds.includes(commentId)) return;

    this.#set(
      { editingCommentIds: [...this.#get().editingCommentIds, commentId] },
      false,
      'updateComment/start',
    );
    try {
      await quickNoteService.updateComment(commentId, trimmed);
      await this.refreshAgenticDetails(quickNoteId);
    } finally {
      this.#set(
        { editingCommentIds: this.#get().editingCommentIds.filter((id) => id !== commentId) },
        false,
        'updateComment/end',
      );
    }
  };

  removeNote = async (id: string) => {
    await quickNoteService.removeNote(id);
    const analyzeTimer = this.#analyzeTimers.get(id);
    if (analyzeTimer) clearTimeout(analyzeTimer);
    const analyzePoller = this.#analyzePollers.get(id);
    if (analyzePoller) clearTimeout(analyzePoller);
    this.#analyzeTimers.delete(id);
    this.#analyzePollers.delete(id);
    this.#cancelStaleCheckRefresh(id);
    this.#observedAnalyze.delete(id);
    this.#pollFailures.delete('analyze:' + id);
    this.#dirtyIds.delete(id);
    this.#pendingEditorData.delete(id);
    const { activeNoteId, agenticDetailMap, notes, taskMap } = this.#get();
    const { [id]: _, ...remainingAgenticDetails } = agenticDetailMap;
    const { [id]: __, ...remainingTasks } = taskMap;
    this.#set(
      {
        activeNoteId: activeNoteId === id ? undefined : activeNoteId,
        agenticDetailMap: remainingAgenticDetails,
        notes: notes.filter((note) => note.id !== id),
        taskMap: remainingTasks,
      },
      false,
      'removeNote',
    );
  };

  updateNoteContent = (
    id: string,
    content: string,
    editorData: Record<string, unknown> = { markdown: content },
  ) => {
    const target = this.#get().notes.find((note) => note.id === id);
    if (!target || (target.content === content && target.editorData === editorData)) return;

    const scheduledAnalyze = this.#analyzeTimers.get(id);
    if (scheduledAnalyze) clearTimeout(scheduledAnalyze);
    this.#analyzeTimers.delete(id);

    this.#pendingEditorData.set(id, editorData);
    this.#dirtyIds.add(id);
    this.#set(
      {
        notes: this.#get().notes.map((note) =>
          note.id === id
            ? { ...note, content, analyzeDueAt: undefined, editorData, updatedAt: Date.now() }
            : note,
        ),
        saveStatus: 'saving',
      },
      false,
      'updateNoteContent',
    );
    this.#persist();
  };

  analyzeNote = async (id: string): Promise<void> => {
    const { analyzingNoteIds, notes } = this.#get();
    const note = notes.find((item) => item.id === id);
    if (
      !note?.content.trim() ||
      analyzingNoteIds.includes(id) ||
      (note.run && ['pending', 'running'].includes(note.run.status))
    ) {
      return;
    }

    const priorTimer = this.#analyzeTimers.get(id);
    if (priorTimer) clearTimeout(priorTimer);
    this.#analyzeTimers.delete(id);

    // Manual Analyze must pin the editor revision visible when the user clicks the action.
    await this.#persist.flush();
    if (this.#disposed || this.#get().saveStatus === 'failed') return;

    // Flushing persistence can schedule a fresh automatic timer for this same revision.
    const scheduledAnalyze = this.#analyzeTimers.get(id);
    if (scheduledAnalyze) clearTimeout(scheduledAnalyze);
    this.#analyzeTimers.delete(id);

    this.#set(
      { analyzingNoteIds: [...this.#get().analyzingNoteIds, id] },
      false,
      'analyzeNote/start',
    );
    try {
      const trigger =
        note.run?.kind === 'analyze' && note.run.status === 'failed' ? 'retry' : 'manual';
      const result = await quickNoteService.analyze(id, trigger);
      if (!result.accepted) return;

      this.#set(
        {
          notes: this.#get().notes.map((item) =>
            item.id === id
              ? {
                  ...item,
                  analyzeDueAt: undefined,
                  run: {
                    kind: result.run.kind,
                    operationId: result.run.operationId,
                    status: result.run.status,
                    topicId: result.run.topicId,
                    trigger,
                  },
                }
              : item,
          ),
        },
        false,
        'analyzeNote/accepted',
      );
      this.#scheduleAnalyzePoll(id);
    } finally {
      this.#set(
        { analyzingNoteIds: this.#get().analyzingNoteIds.filter((item) => item !== id) },
        false,
        'analyzeNote/end',
      );
    }
  };

  setActiveCollection = (collection: string | null) => {
    this.#set({ activeCollection: collection, activeTag: null }, false, 'setActiveCollection');
  };

  setActiveTag = (tag: string | null) => {
    this.#set({ activeCollection: null, activeTag: tag }, false, 'setActiveTag');
  };

  setSearchKeywords = (searchKeywords: string) => {
    this.#set({ searchKeywords }, false, 'setSearchKeywords');
  };

  toggleAiPanel = (expand?: boolean) => {
    this.#set({ aiPanelExpanded: expand ?? !this.#get().aiPanelExpanded }, false, 'toggleAiPanel');
  };

  retrySave = () => {
    this.#set({ saveStatus: 'saving' }, false, 'retrySave');
    // Failed saves retain their payloads; hydrated but untouched notes must not be rewritten.
    for (const id of this.#pendingEditorData.keys()) this.#dirtyIds.add(id);
    this.#persist();
    this.#persist.flush();
  };

  #persist = debounce(
    async () => {
      if (this.#disposed) return;
      const ids = [...this.#dirtyIds];
      if (ids.length === 0) return;
      for (const id of ids) this.#dirtyIds.delete(id);

      try {
        await Promise.all(
          ids.map(async (id) => {
            const previous = this.#inFlightSaves.get(id);
            const save = (async () => {
              // The server keeps the last write it receives, so an older request finishing after
              // a newer one would overwrite it. Writes of one note therefore go one at a time,
              // and each sends whatever is pending once the previous one has settled.
              await previous?.catch(() => {});
              if (this.#disposed) return;
              const note = this.#get().notes.find((item) => item.id === id);
              const editorData = this.#pendingEditorData.get(id);
              if (!note || !editorData) return;
              const result = await quickNoteService.updateNoteContent(id, note.content, editorData);
              // A newer editor change may arrive while this network write is in flight.
              // Only clear the exact payload that this invocation durably saved.
              if (this.#pendingEditorData.get(id) === editorData) {
                this.#pendingEditorData.delete(id);
                this.#set(
                  {
                    notes: this.#get().notes.map((item) =>
                      item.id === id ? { ...item, analyzeDueAt: result.analyzeDueAt } : item,
                    ),
                  },
                  false,
                  'persist/analyzeDueAt',
                );
                if (result.analyzeDueAt) this.#scheduleAnalyze(id, result.analyzeDueAt);
                if (result.contentChange === 'changed' && result.contentCheckDueAt) {
                  this.#scheduleStaleCheckRefresh(id, result.contentCheckDueAt);
                }
              }
            })();
            this.#inFlightSaves.set(id, save);
            try {
              await save;
            } finally {
              if (this.#inFlightSaves.get(id) === save) this.#inFlightSaves.delete(id);
            }
          }),
        );
        if (this.#dirtyIds.size === 0) this.#set({ saveStatus: 'saved' }, false, 'persist');
      } catch {
        for (const id of ids) this.#dirtyIds.add(id);
        this.#set({ saveStatus: 'failed' }, false, 'persist/failed');
      }
    },
    PERSIST_DEBOUNCE,
    { maxWait: PERSIST_MAX_WAIT },
  );

  #scheduleAnalyze = (id: string, dueAt: number) => {
    if (this.#disposed) return;
    const existing = this.#analyzeTimers.get(id);
    if (existing) clearTimeout(existing);

    this.#analyzeTimers.set(
      id,
      setTimeout(
        async () => {
          this.#analyzeTimers.delete(id);
          // The server-side due-time sweep is the durable fallback when this best-effort
          // request loses connectivity or the page closes before the quiet period ends.
          try {
            const result = await quickNoteService.analyze(id, 'automatic');
            if (result.accepted) this.#scheduleAnalyzePoll(id);
          } catch {
            // The persisted due time remains claimable by the server sweep.
          }
        },
        Math.max(0, dueAt - Date.now()),
      ),
    );
  };

  /** Ids of the note's Proposals still pending against the current source. */
  #currentProposalIds = (id: string) =>
    (this.#get().agenticDetailMap[id]?.proposals ?? [])
      .filter(
        (proposal) => proposal.decisionStatus === 'pending' && proposal.validity === 'current',
      )
      .map((proposal) => proposal.id);

  #cancelStaleCheckRefresh = (id?: string) => {
    const ids = id === undefined ? [...this.#staleCheckTimers.keys()] : [id];
    for (const key of ids) {
      const timer = this.#staleCheckTimers.get(key);
      if (timer) clearTimeout(timer);
      this.#staleCheckTimers.delete(key);
    }
  };

  /**
   * Re-reads an open note's Proposals around the time the server marks them stale.
   *
   * Use when:
   * - A save changed the text and the note has current pending Proposals. The server judges the
   *   meaning change after the quiet period (minute sweep + model call) and may then mark them
   *   stale; without this the badge only appeared after a reload or refocus.
   *
   * Expects:
   * - `dueAt` is the server's `content_check_due_at`; a later real edit re-arms it.
   *
   * Returns:
   * - Nothing. Stops after {@link STALE_CHECK_REFRESH_DELAYS}, once a tracked Proposal is no
   *   longer current, when another note is opened, or when the surface goes inactive.
   */
  #scheduleStaleCheckRefresh = (id: string, dueAt: number, attempt = 0) => {
    if (this.#disposed || !this.#pollingActive) return;
    const tracked = this.#currentProposalIds(id);
    if (tracked.length === 0 || attempt >= STALE_CHECK_REFRESH_DELAYS.length) {
      this.#cancelStaleCheckRefresh(id);
      return;
    }

    this.#cancelStaleCheckRefresh(id);
    this.#staleCheckTimers.set(
      id,
      setTimeout(
        async () => {
          this.#staleCheckTimers.delete(id);
          const { activeNoteId } = this.#get();
          if (this.#disposed || (activeNoteId && activeNoteId !== id)) return;

          try {
            await this.#get().refreshAgenticDetails(id);
          } catch {
            // A transient failure is retried by the next attempt.
          }
          const current = new Set(this.#currentProposalIds(id));
          if (tracked.some((proposalId) => !current.has(proposalId))) return;
          this.#scheduleStaleCheckRefresh(id, dueAt, attempt + 1);
        },
        Math.max(0, dueAt - Date.now()) + STALE_CHECK_REFRESH_DELAYS[attempt],
      ),
    );
  };

  /** Fetches run metadata while preserving edits pending or made during the request. */
  #getPolledNotes = async () => {
    const before = new Map(this.#get().notes.map((note) => [note.id, note]));
    const pending = new Set(this.#pendingEditorData.keys());
    const notes = await quickNoteService.getNotes();
    const current = new Map(this.#get().notes.map((note) => [note.id, note]));
    return notes.map((note) => {
      const local = current.get(note.id);
      const original = before.get(note.id);
      if (
        !local ||
        (!pending.has(note.id) &&
          !this.#pendingEditorData.has(note.id) &&
          local.content === original?.content &&
          local.editorData === original?.editorData)
      )
        return note;
      return {
        ...note,
        content: local.content,
        editorData: local.editorData,
        updatedAt: local.updatedAt,
      };
    });
  };

  #scheduleAnalyzePoll = (id: string) => {
    if (this.#disposed) return;
    this.#observedAnalyze.add(id);
    if (!this.#pollingActive) return;
    const existing = this.#analyzePollers.get(id);
    if (existing) clearTimeout(existing);

    this.#analyzePollers.set(
      id,
      setTimeout(
        async () => {
          this.#analyzePollers.delete(id);
          try {
            const notes = await this.#getPolledNotes();
            const note = notes.find((item) => item.id === id);
            this.#pollFailures.delete('analyze:' + id);
            // The list exposes one active run; another kind can hide this run until it finishes.
            const active = Boolean(note?.run && ['pending', 'running'].includes(note.run.status));

            this.#set({ notes }, false, active ? 'analyze/poll' : 'analyze/done');
            if (active) {
              this.#scheduleAnalyzePoll(id);
            } else {
              this.#observedAnalyze.delete(id);
              // A delegate scored 4 may have started a Task without a Proposal.
              await Promise.all([this.refreshAgenticDetails(id), this.#get().refreshTasks(id)]);
              if ((this.#get().taskMap[id] ?? []).some((task) => task.status === 'backlog')) {
                this.#get().refreshTasksUntilStarted(id);
              }
            }
          } catch {
            // Keep recovering background Analyze after a transient status request failure.
            // Exponential delay caps outage traffic at one retry per 30 seconds for this observation.
            this.#pollFailures.set(
              'analyze:' + id,
              (this.#pollFailures.get('analyze:' + id) ?? 0) + 1,
            );
            this.#scheduleAnalyzePoll(id);
          }
        },
        Math.min(
          30_000,
          ANALYZE_POLL_INTERVAL * 2 ** Math.min(this.#pollFailures.get('analyze:' + id) ?? 0, 5),
        ),
      ),
    );
  };
}

export type QuickNoteAction = Pick<QuickNoteActionImpl, keyof QuickNoteActionImpl>;

/** Every action flattened into the Quick Note store. */
export type QuickNoteStoreAction = QuickNoteAction & QuickNoteProposalAction;

/** Creates the Quick Note action slice for the shared Zustand store. */
export const createQuickNoteSlice = (set: Setter, get: () => QuickNoteStore, _api?: unknown) =>
  new QuickNoteActionImpl(set, get, _api);
