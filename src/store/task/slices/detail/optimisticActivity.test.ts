import { describe, expect, it } from 'vitest';

import {
  buildOptimisticAssignmentActivities,
  buildOptimisticCommentActivity,
  isOptimisticActivityId,
  OPTIMISTIC_ACTIVITY_ID_PREFIX,
} from './optimisticActivity';

const actor = { avatar: null, id: 'user_me', name: 'Me', type: 'user' as const };
const now = '2024-01-01T00:00:00.000Z';

describe('buildOptimisticAssignmentActivities', () => {
  it('synthesizes an assignment row with the picker-supplied target', () => {
    const rows = buildOptimisticAssignmentActivities({
      actor,
      assigneeAgentId: 'agt_1',
      current: { agentId: null, userId: null },
      now,
      target: { avatar: 'a.png', id: 'agt_1', name: 'Rika', type: 'agent' },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      assignment: { from: null, kind: 'agent', to: { id: 'agt_1', name: 'Rika' } },
      author: actor,
      time: now,
      type: 'assignment',
    });
    expect(rows[0].id?.startsWith(OPTIMISTIC_ACTIVITY_ID_PREFIX)).toBe(true);
  });

  it('reads as a removal when the slot is cleared', () => {
    const rows = buildOptimisticAssignmentActivities({
      actor,
      assigneeUserId: null,
      current: { agentId: null, userId: 'user_bob' },
      now,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].assignment).toEqual({
      from: { id: 'user_bob', name: null, type: 'user' },
      kind: 'member',
      to: null,
    });
  });

  it('mirrors the server: a re-saved identical assignee produces no row', () => {
    expect(
      buildOptimisticAssignmentActivities({
        actor,
        assigneeAgentId: 'agt_1',
        current: { agentId: 'agt_1', userId: null },
        now,
      }),
    ).toEqual([]);
  });

  it('leaves an untouched slot alone and logs both when both move', () => {
    const rows = buildOptimisticAssignmentActivities({
      actor,
      assigneeAgentId: 'agt_2',
      assigneeUserId: 'user_bob',
      current: { agentId: 'agt_1', userId: null },
      now,
    });
    expect(rows.map((r) => r.assignment?.kind)).toEqual(['agent', 'member']);
  });

  it('refuses to invent an actor when the viewer identity is unknown', () => {
    expect(
      buildOptimisticAssignmentActivities({
        assigneeAgentId: 'agt_1',
        current: { agentId: null, userId: null },
        now,
      }),
    ).toEqual([]);
  });
});

describe('buildOptimisticCommentActivity', () => {
  it('synthesizes the comment as the signed-in user, carrying the topic it replies to', () => {
    const row = buildOptimisticCommentActivity({
      actor,
      content: 'hello',
      editorData: { root: {} },
      now,
      topicId: 'tpc_1',
    });
    expect(row).toMatchObject({
      author: actor,
      content: 'hello',
      editorData: { root: {} },
      time: now,
      topicId: 'tpc_1',
      type: 'comment',
    });
    expect(isOptimisticActivityId(row?.id)).toBe(true);
  });

  it('does not invent an author when the viewer identity is unknown', () => {
    expect(buildOptimisticCommentActivity({ content: 'x', now })).toBeUndefined();
  });

  it('never mistakes a persisted id for a synthesized one', () => {
    expect(isOptimisticActivityId('cmt_abc')).toBe(false);
    expect(isOptimisticActivityId(undefined)).toBe(false);
  });
});
