import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import { LobeAgentSession, LobeSessionType, SessionGroupKey } from '@/types/session';

import { SessionModel } from '../session';

describe('SessionModel', () => {
  let sessionData: Partial<LobeAgentSession>;

  beforeEach(() => {
    // Set up session data with the correct structure
    sessionData = {
      type: LobeSessionType.Agent,
      group: 'testGroup',
      meta: {},
      config: DEFAULT_AGENT_CONFIG,
      // ... other properties based on LobeAgentSession
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    await SessionModel.clearTable();
  });

  it('should create a session record', async () => {
    const result = await SessionModel.create('agent', sessionData);

    expect(result).toHaveProperty('id');
    // Verify that the session has been added to the database
    // Assuming findById is a method that retrieves a session by ID
    const sessionInDb = await SessionModel.findById(result.id);

    expect(sessionInDb).toEqual(expect.objectContaining(sessionData));
  });

  it('should batch create session records', async () => {
    const sessionsToCreate = [sessionData, sessionData];
    const results = await SessionModel.batchCreate(sessionsToCreate as LobeAgentSession[]);

    expect(results.ids).toHaveLength(sessionsToCreate.length);
    // Verify that the sessions have been added to the database
    for (const result of results.ids!) {
      const sessionInDb = await SessionModel.findById(result);
      expect(sessionInDb).toEqual(expect.objectContaining(sessionData));
    }
  });

  it('should query sessions with pagination', async () => {
    // Create multiple sessions to test the query method
    await SessionModel.batchCreate([sessionData, sessionData] as LobeAgentSession[]);

    const queriedSessions = await SessionModel.query({ pageSize: 1, current: 0 });

    expect(queriedSessions).toHaveLength(1);
  });

  it('should query sessions by group', async () => {
    // Create multiple sessions to test the queryByGroup method
    const group: SessionGroupKey = 'testGroup';
    await SessionModel.batchCreate([sessionData, sessionData] as LobeAgentSession[]);

    const sessionsByGroup = await SessionModel.queryByGroup(group);

    // Assuming all created sessions belong to the same group
    expect(sessionsByGroup).toHaveLength(2);
    expect(sessionsByGroup.every((i) => i.group === group)).toBeTruthy();
  });

  it('should update a session', async () => {
    const createdSession = await SessionModel.create('agent', sessionData);
    const updateData = { group: 'newGroup' };

    await SessionModel.update(createdSession.id, updateData);
    const updatedSession = await SessionModel.findById(createdSession.id);

    expect(updatedSession).toHaveProperty('group', 'newGroup');
  });

  // 删除一个 session 时，也需要同步删除具有 sessionId 的 topic 和 message
  it('should delete a session and its associated data', async () => {
    // create session , topic and message test data
    const { id: sessionId } = await SessionModel.create('agent', sessionData);

    const topicData = {
      title: 'Test Topic',
      sessionId: sessionId,
      favorite: false,
    };
    const createdTopic = await TopicModel.create(topicData);

    const messageData: CreateMessageParams = {
      content: 'Test Message',
      sessionId: sessionId,
      topicId: createdTopic.id,
      role: 'user',
    };
    await MessageModel.create(messageData);

    await SessionModel.delete(sessionId);

    // Verify the session and its related data (topics, messages) are deleted
    const sessionInDb = await SessionModel.findById(sessionId);
    expect(sessionInDb).toBeUndefined();

    // You need to verify that topics and messages related to the session are also deleted
    const topicsInDb = await TopicModel.findBySessionId(sessionId);
    expect(topicsInDb).toHaveLength(0);

    // Verify all associated messages are deleted
    const messagesInDb = await MessageModel.query({ sessionId });
    expect(messagesInDb).toHaveLength(0);
  });
});
