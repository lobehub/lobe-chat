import { describe, expect, it } from 'vitest';

import { isFreshProjectTopic } from './isFreshProjectTopic';

describe('isFreshProjectTopic', () => {
  it('keeps a just-created topic of this project before the list has it', () => {
    expect(
      isFreshProjectTopic({
        listed: false,
        projectId: 'prj_a',
        storedTopic: { projectId: 'prj_a' },
        topicId: 'tpc_new',
      }),
    ).toBe(true);
  });

  /** @example Review: project A's cached topic rendered inside project B's conversation URL. */
  it("does not treat another project's cached topic as fresh", () => {
    expect(
      isFreshProjectTopic({
        listed: false,
        projectId: 'prj_b',
        storedTopic: { projectId: 'prj_a' },
        topicId: 'tpc_a',
      }),
    ).toBe(false);
    expect(
      isFreshProjectTopic({
        listed: false,
        projectId: 'prj_b',
        storedTopic: { projectId: null },
        topicId: 'tpc_plain',
      }),
    ).toBe(false);
  });

  it('is false once the project list has the topic', () => {
    expect(
      isFreshProjectTopic({
        listed: true,
        projectId: 'prj_a',
        storedTopic: { projectId: 'prj_a' },
        topicId: 'tpc_new',
      }),
    ).toBe(false);
  });
});
