import { lambdaClient } from '@/libs/trpc/client';

import type { QuickNoteItem } from './type';

export type { QuickNoteAnnotation, QuickNoteItem } from './type';

interface ServerQuickNoteItem {
  annotation?: { content: string; divedAt: Date | string };
  collection?: string | null;
  content?: string | null;
  createdAt: Date | string;
  documentId: string;
  editorData?: Record<string, unknown> | null;
  id: string;
  location?: string | null;
  run?: QuickNoteItem['run'];
  tags: string[];
  topicId: string;
  updatedAt: Date | string;
}

/**
 * Normalizes server dates and nullable storage fields for the existing Quick Note UI.
 *
 * Before:
 * - `{ createdAt: "2026-08-24T00:00:00Z", collection: null }`
 *
 * After:
 * - `{ createdAt: 1787529600000, collection: undefined }`
 */
const normalizeQuickNote = (note: ServerQuickNoteItem): QuickNoteItem => ({
  annotation: note.annotation
    ? { content: note.annotation.content, divedAt: new Date(note.annotation.divedAt).getTime() }
    : undefined,
  collection: note.collection ?? undefined,
  content: note.content ?? '',
  createdAt: new Date(note.createdAt).getTime(),
  documentId: note.documentId,
  editorData: note.editorData ?? undefined,
  id: note.id,
  location: note.location ?? undefined,
  run: note.run,
  tags: note.tags,
  topicId: note.topicId,
  updatedAt: new Date(note.updatedAt).getTime(),
});

/**
 * Client boundary for server-backed Quick Note persistence and Agent Runs.
 *
 * Use when:
 * - The Quick Note Zustand store needs CRUD, Discovery, or Dive operations.
 *
 * Expects:
 * - UI components continue consuming the existing `QuickNoteItem` projection.
 *
 * Returns:
 * - Normalized client records and server-owned Run identities.
 */
class QuickNoteService {
  getNotes = async (): Promise<QuickNoteItem[]> => {
    const notes = await lambdaClient.quickNote.list.query();
    return notes.map((note) => normalizeQuickNote(note as ServerQuickNoteItem));
  };

  createNote = async (): Promise<QuickNoteItem> => {
    const note = await lambdaClient.quickNote.create.mutate({ content: '', tags: [] });
    return normalizeQuickNote({ ...note, content: '', editorData: undefined });
  };

  removeNote = async (id: string): Promise<void> => {
    await lambdaClient.quickNote.delete.mutate({ id });
  };

  updateNoteContent = async (
    id: string,
    content: string,
    editorData: Record<string, unknown>,
  ): Promise<void> => {
    await lambdaClient.quickNote.updateContent.mutate({ content, editorData, id });
  };

  claimDiscovery = async (id: string) => lambdaClient.quickNote.claimDiscovery.mutate({ id });

  dive = async (id: string) => lambdaClient.quickNote.dive.mutate({ id });
}

export const quickNoteService = new QuickNoteService();
