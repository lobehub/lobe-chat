import { debounce } from 'es-toolkit/compat';

import { quickNoteService } from '@/services/quickNote';
import type { StoreSetter } from '@/store/types';

import type { QuickNoteStore } from './store';

/** Quiet period after a persisted edit before the client asks the server to claim Discovery. */
export const DISCOVERY_SETTLE_DELAY = 30_000;
/** Poll interval used to recover terminal Dive state through the existing service boundary. */
export const DIVE_POLL_INTERVAL = 1000;
/** Editor save debounce that limits network writes while typing. */
export const PERSIST_DEBOUNCE = 1000;
/** Maximum time an active editor may defer its next durable save. */
export const PERSIST_MAX_WAIT = 5000;

type Setter = StoreSetter<QuickNoteStore>;

/**
 * Coordinates optimistic Quick Note editing with server-owned persistence and Runs.
 *
 * Use when:
 * - Existing Quick Note components need CRUD, save status, Discovery, and Dive actions.
 *
 * Expects:
 * - The service owns durable state; local records are optimistic projections only.
 *
 * Returns:
 * - Public actions flattened into the Quick Note Zustand store.
 */
export class QuickNoteActionImpl {
  readonly #get: () => QuickNoteStore;
  readonly #set: Setter;
  readonly #dirtyIds = new Set<string>();
  readonly #pendingEditorData = new Map<string, Record<string, unknown>>();
  readonly #discoveryTimers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly #divePollers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(set: Setter, get: () => QuickNoteStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  initNotes = async () => {
    if (this.#get().notesInit) return;
    const notes = await quickNoteService.getNotes();
    const divingNoteIds = notes
      .filter(
        (note) => note.run?.kind === 'dive' && ['pending', 'running'].includes(note.run.status),
      )
      .map((note) => note.id);
    this.#set(
      {
        divingNoteIds,
        notes,
        notesInit: true,
      },
      false,
      'initNotes',
    );
    for (const id of divingNoteIds) this.#scheduleDivePoll(id);
  };

  createNote = async (): Promise<string> => {
    const note = await quickNoteService.createNote();
    this.#set({ notes: [note, ...this.#get().notes] }, false, 'createNote');
    return note.id;
  };

  removeNote = async (id: string) => {
    await quickNoteService.removeNote(id);
    const discoveryTimer = this.#discoveryTimers.get(id);
    if (discoveryTimer) clearTimeout(discoveryTimer);
    const divePoller = this.#divePollers.get(id);
    if (divePoller) clearTimeout(divePoller);
    this.#discoveryTimers.delete(id);
    this.#divePollers.delete(id);
    this.#dirtyIds.delete(id);
    this.#pendingEditorData.delete(id);
    const { activeNoteId, notes } = this.#get();
    this.#set(
      {
        activeNoteId: activeNoteId === id ? undefined : activeNoteId,
        notes: notes.filter((note) => note.id !== id),
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

    this.#pendingEditorData.set(id, editorData);
    this.#dirtyIds.add(id);
    this.#set(
      {
        notes: this.#get().notes.map((note) =>
          note.id === id ? { ...note, content, editorData, updatedAt: Date.now() } : note,
        ),
        saveStatus: 'saving',
      },
      false,
      'updateNoteContent',
    );
    this.#persist();
  };

  diveInto = async (id: string) => {
    const { divingNoteIds, notes } = this.#get();
    if (divingNoteIds.includes(id)) return;

    const note = notes.find((item) => item.id === id);
    if (!note || !note.content.trim()) return;

    // Dive must pin the latest durable revision, including edits still inside the save debounce.
    await this.#persist.flush();
    if (this.#get().saveStatus === 'failed') return;

    this.#set({ divingNoteIds: [...divingNoteIds, id] }, false, 'diveInto/start');

    try {
      await quickNoteService.dive(id);
      this.#scheduleDivePoll(id);
    } catch (error) {
      this.#set(
        { divingNoteIds: this.#get().divingNoteIds.filter((item) => item !== id) },
        false,
        'diveInto/failed',
      );
      throw error;
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

  toggleAnnotationPanel = (expand?: boolean) => {
    this.#set(
      { annotationPanelExpanded: expand ?? !this.#get().annotationPanelExpanded },
      false,
      'toggleAnnotationPanel',
    );
  };

  toggleListCollapsed = () => {
    this.#set({ listCollapsed: !this.#get().listCollapsed }, false, 'toggleListCollapsed');
  };

  retrySave = () => {
    this.#set({ saveStatus: 'saving' }, false, 'retrySave');
    for (const note of this.#get().notes) {
      if (note.editorData) {
        this.#dirtyIds.add(note.id);
        this.#pendingEditorData.set(note.id, note.editorData);
      }
    }
    this.#persist();
    this.#persist.flush();
  };

  #persist = debounce(
    async () => {
      const ids = [...this.#dirtyIds];
      if (ids.length === 0) return;
      for (const id of ids) this.#dirtyIds.delete(id);

      try {
        await Promise.all(
          ids.map(async (id) => {
            const note = this.#get().notes.find((item) => item.id === id);
            const editorData = this.#pendingEditorData.get(id);
            if (!note || !editorData) return;
            await quickNoteService.updateNoteContent(id, note.content, editorData);
            // A newer editor change may arrive while this network write is in flight.
            // Only clear the exact payload that this invocation durably saved.
            if (this.#pendingEditorData.get(id) === editorData) {
              this.#pendingEditorData.delete(id);
            }
            this.#scheduleDiscovery(id);
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

  #scheduleDiscovery = (id: string) => {
    const existing = this.#discoveryTimers.get(id);
    if (existing) clearTimeout(existing);

    this.#discoveryTimers.set(
      id,
      setTimeout(async () => {
        this.#discoveryTimers.delete(id);
        // The server-side due-time sweep is the durable fallback when this best-effort
        // request loses connectivity or the page closes before the quiet period ends.
        try {
          await quickNoteService.claimDiscovery(id);
        } catch {
          // The persisted due time remains claimable by the server sweep.
        }
      }, DISCOVERY_SETTLE_DELAY),
    );
  };

  #scheduleDivePoll = (id: string) => {
    const existing = this.#divePollers.get(id);
    if (existing) clearTimeout(existing);

    this.#divePollers.set(
      id,
      setTimeout(async () => {
        this.#divePollers.delete(id);
        try {
          const notes = await quickNoteService.getNotes();
          const note = notes.find((item) => item.id === id);
          const active =
            note?.run?.kind === 'dive' && ['pending', 'running'].includes(note.run.status);

          this.#set(
            {
              divingNoteIds: active
                ? this.#get().divingNoteIds
                : this.#get().divingNoteIds.filter((item) => item !== id),
              notes,
            },
            false,
            active ? 'diveInto/poll' : 'diveInto/done',
          );

          if (active) this.#scheduleDivePoll(id);
        } catch {
          // Keep recovering the operation after a transient status request failure.
          this.#scheduleDivePoll(id);
        }
      }, DIVE_POLL_INTERVAL),
    );
  };
}

export type QuickNoteAction = Pick<QuickNoteActionImpl, keyof QuickNoteActionImpl>;

/** Creates the Quick Note action slice for the shared Zustand store. */
export const createQuickNoteSlice = (set: Setter, get: () => QuickNoteStore, _api?: unknown) =>
  new QuickNoteActionImpl(set, get, _api);
