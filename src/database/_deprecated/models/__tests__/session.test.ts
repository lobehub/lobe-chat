import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { CreateMessageParams, MessageModel } from '@/database/_deprecated/models/message';
import { SessionGroupModel } from '@/database/_deprecated/models/sessionGroup';
import { TopicModel } from '@/database/_deprecated/models/topic';
import { LobeAgentConfig } from '@/types/agent';
import {
  LobeAgentSession,
  LobeSessionType,
  SessionDefaultGroup,
  SessionGroupId,
} from '@/types/session';

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
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    await SessionModel.clearTable();
  });
  describe('create', () => {
    it('should create a session record', async () => {
      const result = await SessionModel.create('agent', sessionData);

      expect(result).toHaveProperty('id');
      // Verify that the session has been added to the database
      // Assuming findById is a method that retrieves a session by ID
      const sessionInDb = await SessionModel.findById(result.id);

      expect(sessionInDb).toEqual(expect.objectContaining(sessionData));
    });
  });

  describe('batchCreate', () => {
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

    it('should set group to default if it does not exist in SessionGroup', async () => {
      const sessionDataWithInvalidGroup = {
        ...sessionData,
        group: 'nonExistentGroup',
      } as LobeAgentSession;

      const results = await SessionModel.batchCreate([sessionDataWithInvalidGroup]);

      // Verify that the group has been set to default
      for (const result of results.ids!) {
        const sessionInDb = await SessionModel.findById(result);
        expect(sessionInDb.group).toEqual(SessionDefaultGroup.Default);
      }
    });
  });

  describe('query', () => {
    it('should query sessions with pagination', async () => {
      // Create multiple sessions to test the query method
      await SessionModel.batchCreate([sessionData, sessionData] as LobeAgentSession[]);

      const queriedSessions = await SessionModel.query({ pageSize: 1, current: 0 });

      expect(queriedSessions).toHaveLength(1);
    });
  });

  describe('querySessionsByGroupId', () => {
    it('should query sessions by group', async () => {
      // Create multiple sessions to test the queryByGroup method
      const group: SessionGroupId = 'testGroup';
      await SessionGroupModel.create('测试分组', 0, group);

      await SessionModel.batchCreate([sessionData, sessionData] as LobeAgentSession[]);

      const sessionsByGroup = await SessionModel.querySessionsByGroupId(group);

      // Assuming all created sessions belong to the same group
      expect(sessionsByGroup).toHaveLength(2);
      expect(sessionsByGroup.every((i) => i.group === group)).toBeTruthy();
    });
  });

  describe('update', () => {
    it('should update a session', async () => {
      const createdSession = await SessionModel.create('agent', sessionData);
      const updateData = { group: 'newGroup' };

      await SessionModel.update(createdSession.id, updateData);
      const updatedSession = await SessionModel.findById(createdSession.id);

      expect(updatedSession).toHaveProperty('group', 'newGroup');
    });

    it('should update pinned status of a session', async () => {
      const createdSession = await SessionModel.create('agent', sessionData);
      await SessionModel.update(createdSession.id, { pinned: 1 });
      const updatedSession = await SessionModel.findById(createdSession.id);
      expect(updatedSession).toHaveProperty('pinned', 1);
    });
  });

  describe('updateConfig', () => {
    it('should update config of a session', async () => {
      const { id } = await SessionModel.create('agent', sessionData);
      const dbSession = await SessionModel.findById(id);

      const newConfig = { ...dbSession.config, systemRole: 'newValue' } as LobeAgentConfig;
      await SessionModel.updateConfig(id, newConfig);
      const updatedSession = await SessionModel.findById(id);
      expect(updatedSession.config).toEqual(newConfig);
    });
  });

  describe('clearTable', () => {
    it('should clear all sessions', async () => {
      await SessionModel.batchCreate([sessionData, sessionData] as LobeAgentSession[]);
      await SessionModel.clearTable();
      const sessionsInDb = await SessionModel.query();
      expect(sessionsInDb).toHaveLength(0);
    });
  });

  describe('isEmpty', () => {
    it('should check if table is empty', async () => {
      await SessionModel.clearTable();
      const isEmpty = await SessionModel.isEmpty();
      expect(isEmpty).toBeTruthy();
      await SessionModel.create('agent', sessionData);
      const isNotEmpty = await SessionModel.isEmpty();
      expect(isNotEmpty).toBeFalsy();
    });
  });

  describe('queryByKeyword', () => {
    it('should query sessions by keyword', async () => {
      const keyword = 'testKeyword';
      const sessionWithKeyword = { ...sessionData, meta: { title: keyword } };
      await SessionModel.create('agent', sessionWithKeyword);
      const sessionsByKeyword = await SessionModel.queryByKeyword(keyword);
      expect(sessionsByKeyword).toHaveLength(1);
      expect(sessionsByKeyword[0].meta.title).toContain(keyword);
    });
  });

  describe('getPinnedSessions', () => {
    it('should get pinned sessions', async () => {
      const pinnedSession = { ...sessionData, pinned: true };
      const unpinnedSession = { ...sessionData, pinned: false };
      await SessionModel.batchCreate([pinnedSession, unpinnedSession] as LobeAgentSession[]);
      const pinnedSessions = await SessionModel.getPinnedSessions();
      expect(pinnedSessions).toHaveLength(1);
      expect(pinnedSessions[0].pinned).toBeTruthy();
    });
  });

  describe('queryWithGroups', () => {
    it('should query sessions with groups', async () => {
      await SessionModel.create('agent', sessionData);

      const sessionsWithGroups = await SessionModel.queryWithGroups();
      expect(sessionsWithGroups.sessions).toHaveLength(1);
      expect(sessionsWithGroups.sessions[0]).toEqual(expect.objectContaining(sessionData));
    });
  });

  describe('queryByGroupIds', () => {
    it('should query sessions by group ids', async () => {
      const createdSession = await SessionModel.create('agent', sessionData);
      const session = await SessionModel.findById(createdSession.id);
      const sessionsByGroupIds = await SessionModel.queryByGroupIds([session.group]);
      expect(sessionsByGroupIds[session.group]).toHaveLength(1);
      expect(sessionsByGroupIds[session.group][0]).toEqual(expect.objectContaining(sessionData));
    });
  });

  describe('delete', () => {
    it('should delete a session', async () => {
      const createdSession = await SessionModel.create('agent', sessionData);
      await SessionModel.delete(createdSession.id);
      const sessionInDb = await SessionModel.findById(createdSession.id);
      expect(sessionInDb).toBeUndefined();
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

  describe('duplicate', () => {
    it('should duplicate a session', async () => {
      const createdSession = await SessionModel.create('agent', sessionData);
      const duplicatedSession = await SessionModel.duplicate(createdSession.id);
      const sessionsInDb = await SessionModel.query();
      expect(sessionsInDb).toHaveLength(2);

      if (!duplicatedSession) return;
      const session = await SessionModel.findById(duplicatedSession.id);

      expect(session).toEqual(expect.objectContaining(sessionData));
    });
  });
});
