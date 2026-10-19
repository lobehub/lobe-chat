// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  acceptances,
  agents,
  agentsFiles,
  documents,
  files,
  filesToSessions,
  generationBatches,
  generations,
  generationTopics,
  knowledgeBaseFiles,
  knowledgeBases,
  messages,
  messagesFiles,
  messageTTS,
  sessions,
  topics,
  users,
  verifyCheckResults,
  verifyEvidence,
  verifyRuns,
} from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { FileModel } from '../file';

// Which of a topic's attachments a purge may delete: the reference set that
// keeps a file alive once the topic and its messages are gone.

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'file-topic-cleanup-test-user-id';
const fileModel = new FileModel(serverDB, userId);

const knowledgeBase = { id: 'kb-topic-cleanup', name: 'knowledgeBase', userId };

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'user2' }]);
  await serverDB.insert(knowledgeBases).values(knowledgeBase);
});

afterEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(files);
});

describe('findDeletableFilesByTopicId', () => {
  const sessionId = 'topic-files-session-1';
  const topicId = 'topic-files-topic-1';

  beforeEach(async () => {
    await serverDB.insert(sessions).values({ id: sessionId, userId });
    await serverDB.insert(topics).values([
      { id: topicId, sessionId, userId },
      { id: 'topic-files-topic-2', sessionId, userId },
    ]);
    await serverDB.insert(messages).values([
      { id: 'tf-msg-1', role: 'user', topicId, userId },
      { id: 'tf-msg-1b', role: 'user', topicId, userId },
      { id: 'tf-msg-2', role: 'user', topicId: 'topic-files-topic-2', userId },
    ]);
    await serverDB.insert(files).values([
      { fileType: 'text/csv', id: 'tf-msg', name: 'msg.csv', size: 1, url: 'k-msg', userId },
      {
        fileType: 'application/pdf',
        id: 'tf-shared',
        name: 'shared.pdf',
        size: 2,
        url: 'k-shared',
        userId,
      },
      { fileType: 'text/plain', id: 'tf-sess', name: 's.txt', size: 3, url: 'k-sess', userId },
      { fileType: 'text/plain', id: 'tf-other', name: 'o.txt', size: 4, url: 'k-other', userId },
    ]);
  });

  it('returns only files attached exclusively inside the topic, de-duped', async () => {
    await serverDB.insert(messagesFiles).values([
      { fileId: 'tf-msg', messageId: 'tf-msg-1', userId },
      // same file attached to another message in the topic → must be de-duped
      { fileId: 'tf-msg', messageId: 'tf-msg-1b', userId },
      // attached only to a different topic → not a candidate
      { fileId: 'tf-other', messageId: 'tf-msg-2', userId },
    ]);

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual(['tf-msg']);
  });

  it('preserves a file still attached to a message in another topic', async () => {
    await serverDB.insert(messagesFiles).values([
      { fileId: 'tf-msg', messageId: 'tf-msg-1', userId },
      // tf-shared lives in both the deleted topic and another topic
      { fileId: 'tf-shared', messageId: 'tf-msg-1', userId },
      { fileId: 'tf-shared', messageId: 'tf-msg-2', userId },
    ]);

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual(['tf-msg']);
  });

  it('preserves a file still attached to a message with no topic', async () => {
    await serverDB.insert(messages).values({ id: 'tf-msg-inbox', role: 'user', userId });
    await serverDB.insert(messagesFiles).values([
      { fileId: 'tf-shared', messageId: 'tf-msg-1', userId },
      // also attached to an inbox message (topicId = null) → must be preserved
      { fileId: 'tf-shared', messageId: 'tf-msg-inbox', userId },
    ]);

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual([]);
  });

  it('preserves a file still attached at the session level', async () => {
    await serverDB
      .insert(messagesFiles)
      .values({ fileId: 'tf-sess', messageId: 'tf-msg-1', userId });
    // also bound to the session → survives a single-topic deletion
    await serverDB.insert(filesToSessions).values({ fileId: 'tf-sess', sessionId, userId });

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual([]);
  });

  it('preserves files still used by a knowledge base, an agent or an image generation', async () => {
    await serverDB.insert(files).values(
      ['tf-kb', 'tf-agent', 'tf-gen'].map((id) => ({
        fileType: 'image/png',
        id,
        name: `${id}.png`,
        size: 1,
        url: `k-${id}`,
        userId,
      })),
    );
    await serverDB.insert(messagesFiles).values(
      ['tf-msg', 'tf-kb', 'tf-agent', 'tf-gen'].map((fileId) => ({
        fileId,
        messageId: 'tf-msg-1',
        userId,
      })),
    );
    await serverDB
      .insert(knowledgeBaseFiles)
      .values({ fileId: 'tf-kb', knowledgeBaseId: knowledgeBase.id, userId });
    await serverDB.insert(agents).values({ id: 'tf-agent-1', userId });
    await serverDB
      .insert(agentsFiles)
      .values({ agentId: 'tf-agent-1', fileId: 'tf-agent', userId });
    await serverDB.insert(generationTopics).values({ id: 'tf-gen-topic', userId });
    await serverDB.insert(generationBatches).values({
      generationTopicId: 'tf-gen-topic',
      id: 'tf-gen-batch',
      model: 'model',
      prompt: 'prompt',
      provider: 'provider',
      userId,
    });
    await serverDB
      .insert(generations)
      .values({ fileId: 'tf-gen', generationBatchId: 'tf-gen-batch', userId });

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual(['tf-msg']);
  });

  it('preserves a file a non-mirror document is built on, but not its own parse mirror', async () => {
    await serverDB.insert(files).values(
      ['tf-doc', 'tf-mirror'].map((id) => ({
        fileType: 'application/pdf',
        id,
        name: `${id}.pdf`,
        size: 1,
        url: `k-${id}`,
        userId,
      })),
    );
    await serverDB
      .insert(messagesFiles)
      .values(['tf-doc', 'tf-mirror'].map((fileId) => ({ fileId, messageId: 'tf-msg-1', userId })));
    await serverDB.insert(documents).values([
      {
        content: 'note',
        fileId: 'tf-doc',
        fileType: 'custom/document',
        source: 'note',
        sourceType: 'topic',
        totalCharCount: 4,
        totalLineCount: 1,
        userId,
      },
      {
        content: 'parsed',
        fileId: 'tf-mirror',
        fileType: 'custom/document',
        source: 'k-tf-mirror',
        sourceType: 'file',
        totalCharCount: 6,
        totalLineCount: 1,
        userId,
      },
    ]);

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual(['tf-mirror']);
  });

  it("preserves TTS audio of a message outside the topic, not of the topic's own", async () => {
    await serverDB.insert(files).values(
      ['tf-tts-out', 'tf-tts-in'].map((id) => ({
        fileType: 'audio/mpeg',
        id,
        name: `${id}.mp3`,
        size: 1,
        url: `k-${id}`,
        userId,
      })),
    );
    await serverDB
      .insert(messagesFiles)
      .values(
        ['tf-tts-out', 'tf-tts-in'].map((fileId) => ({ fileId, messageId: 'tf-msg-1', userId })),
      );
    await serverDB.insert(messageTTS).values([
      // audio of a message in another topic → survives, so the file must too
      { fileId: 'tf-tts-out', id: 'tf-msg-2', userId },
      // audio of a message in the deleted topic → goes with it
      { fileId: 'tf-tts-in', id: 'tf-msg-1b', userId },
    ]);

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual(['tf-tts-in']);
  });

  it('preserves a file used as acceptance evidence', async () => {
    await serverDB
      .insert(messagesFiles)
      .values({ fileId: 'tf-shared', messageId: 'tf-msg-1', userId });
    const [acceptance] = await serverDB
      .insert(acceptances)
      .values({ subjectId: 'tf-subject', subjectType: 'standalone', userId })
      .returning();
    const [run] = await serverDB
      .insert(verifyRuns)
      .values({ acceptanceId: acceptance.id, roundIndex: 1, userId })
      .returning();
    const [checkResult] = await serverDB
      .insert(verifyCheckResults)
      .values({ checkItemId: 'c1', userId, verifierType: 'agent', verifyRunId: run.id })
      .returning();
    await serverDB
      .insert(verifyEvidence)
      .values({ checkResultId: checkResult.id, fileId: 'tf-shared', type: 'screenshot', userId });

    const result = await fileModel.findDeletableFilesByTopicId(topicId);

    expect(result).toEqual([]);
  });

  it('returns an empty array when the topic has no message files', async () => {
    const result = await fileModel.findDeletableFilesByTopicId(topicId);
    expect(result).toEqual([]);
  });

  it('does not return files belonging to another user', async () => {
    await serverDB.insert(messages).values({
      id: 'tf-msg-other',
      role: 'user',
      topicId,
      userId: 'user2',
    });
    await serverDB.insert(files).values({
      fileType: 'text/plain',
      id: 'tf-user2',
      name: 'u2.txt',
      size: 5,
      url: 'k-u2',
      userId: 'user2',
    });
    await serverDB
      .insert(messagesFiles)
      .values({ fileId: 'tf-user2', messageId: 'tf-msg-other', userId: 'user2' });

    const result = await fileModel.findDeletableFilesByTopicId(topicId);
    expect(result).toEqual([]);
  });
});
