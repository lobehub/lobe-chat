import type { MeetingActionItem } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { buildActionItemDrafts, selectedTaskItems } from './actionItemDrafts';

const items: MeetingActionItem[] = [
  {
    assignee: { id: 'u_1', name: 'Alice', type: 'user' },
    dueDate: '2026-10-28',
    id: 'a',
    segmentIds: [],
    status: 'suggested',
    text: 'Write release notes',
  },
  { id: 'b', segmentIds: [], status: 'suggested', text: 'Book a room' },
  { id: 'c', segmentIds: [], status: 'created', taskId: 'task_1', text: 'Done already' },
  { id: 'd', segmentIds: [], status: 'dismissed', text: 'Not needed' },
];

describe('buildActionItemDrafts', () => {
  it('starts every suggestion ticked with its matched assignee and deadline', () => {
    expect(buildActionItemDrafts(items)).toEqual({
      a: {
        assignee: { id: 'u_1', type: 'user' },
        checked: true,
        dueDate: '2026-10-28',
        text: 'Write release notes',
      },
      b: { assignee: null, checked: true, dueDate: null, text: 'Book a room' },
    });
  });

  it('keeps what the user already edited when the list refreshes', () => {
    const edited = {
      a: { assignee: null, checked: false, dueDate: null, text: 'Edited' },
    };
    expect(buildActionItemDrafts(items, edited).a).toEqual(edited.a);
  });
});

describe('selectedTaskItems', () => {
  it('sends only ticked suggestions with text, carrying the confirmed edits', () => {
    const drafts = buildActionItemDrafts(items);
    drafts.a = { ...drafts.a, dueDate: '2026-10-30', text: '  Write release notes v2 ' };
    drafts.b = { ...drafts.b, checked: false };

    expect(
      selectedTaskItems(
        items.filter((item) => item.status === 'suggested'),
        drafts,
      ),
    ).toEqual([
      {
        assignee: { id: 'u_1', type: 'user' },
        dueDate: '2026-10-30',
        id: 'a',
        text: 'Write release notes v2',
      },
    ]);
  });

  it('skips a suggestion whose text was cleared', () => {
    const drafts = buildActionItemDrafts(items);
    drafts.a = { ...drafts.a, text: '   ' };
    expect(selectedTaskItems([items[0]], drafts)).toEqual([]);
  });
});
