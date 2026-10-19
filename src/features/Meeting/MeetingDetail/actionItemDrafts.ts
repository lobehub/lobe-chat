import type { MeetingActionItem, MeetingAssigneeType } from '@lobechat/types';

import type { CreateMeetingTaskItem } from '@/services/meeting';

/** What the user has set for one suggested item before confirming it. */
export interface ActionItemDraft {
  assignee: { id: string; type: MeetingAssigneeType } | null;
  checked: boolean;
  dueDate: string | null;
  text: string;
}

export type DraftMap = Record<string, ActionItemDraft>;

/**
 * Drafts for the suggested items, starting from what the minutes suggest
 * (ticked, matched assignee, extracted deadline). Drafts the user already
 * edited are kept, so a background refresh never discards their changes.
 */
export const buildActionItemDrafts = (
  items: MeetingActionItem[],
  current: DraftMap = {},
): DraftMap =>
  Object.fromEntries(
    items
      .filter((item) => item.status === 'suggested')
      .map((item) => [
        item.id,
        current[item.id] ?? {
          assignee: item.assignee ? { id: item.assignee.id, type: item.assignee.type } : null,
          checked: true,
          dueDate: item.dueDate ?? null,
          text: item.text,
        },
      ]),
  );

/** The ticked suggestions with non-empty text, as the `createTasks` payload. */
export const selectedTaskItems = (
  suggested: MeetingActionItem[],
  drafts: DraftMap,
): CreateMeetingTaskItem[] =>
  suggested.flatMap((item) => {
    const draft = drafts[item.id];
    if (!draft?.checked || !draft.text.trim()) return [];
    return [
      { assignee: draft.assignee, dueDate: draft.dueDate, id: item.id, text: draft.text.trim() },
    ];
  });
