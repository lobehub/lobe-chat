import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SessionModel } from '@/database/_deprecated/models/session';
import { SessionGroups } from '@/types/session';

import { DB_SessionGroup } from '../../schemas/sessionGroup';
import { SessionGroupModel } from '../sessionGroup';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('SessionGroupModel', () => {
  let sessionGroupData: DB_SessionGroup;

  beforeEach(() => {
    // 设置正确结构的会话组数据
    sessionGroupData = {
      name: 'test-group',
      sort: 1,
    };
  });

  afterEach(async () => {
    // 每次测试后清理数据库
    await SessionGroupModel.clear();
  });

  describe('create', () => {
    it('should create a session group record', async () => {
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );
      const item = await SessionGroupModel.findById(createdGroup.id);
      expect(item.name).toEqual(sessionGroupData.name);
      expect(item.sort).toEqual(sessionGroupData.sort);
    });
  });

  describe('batchCreate', () => {
    it('should batch create session group records', async () => {
      const groups = [
        sessionGroupData,
        { ...sessionGroupData, name: 'another-group' },
      ] as SessionGroups;
      await SessionGroupModel.batchCreate(groups);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update a session group', async () => {
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );
      const updatedGroupData: DB_SessionGroup = { ...sessionGroupData, name: 'updated-group' };
      await SessionGroupModel.update(createdGroup.id, updatedGroupData);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].name).toEqual(updatedGroupData.name);
    });
  });

  describe('delete', () => {
    it('should delete a session group', async () => {
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );
      await SessionGroupModel.delete(createdGroup.id);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toHaveLength(0);
    });
    it('should delete a session group and update associated sessions', async () => {
      // Create a new session group
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );

      // Delete the created session group
      await SessionGroupModel.delete(createdGroup.id);

      // Fetch all session groups to confirm deletion
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toHaveLength(0);

      // Fetch all sessions to confirm update
      const fetchedSessions = await SessionModel.query();
      fetchedSessions.forEach((session) => {
        expect(session.group).not.toEqual(createdGroup.id);
      });
    });
    it('should update associated sessions to default group when a session group is deleted', async () => {
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );
      const sessionId = await SessionModel.create('agent', {}, createdGroup.id);
      await SessionGroupModel.delete(createdGroup.id);
      const updatedSession = await SessionModel.findById(sessionId.id);
      expect(updatedSession.group).toEqual('default');
    });
  });

  describe('query', () => {
    it('should fetch and return the session group list', async () => {
      await SessionGroupModel.create(sessionGroupData.name, sessionGroupData.sort);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toHaveLength(1);
      expect(fetchedGroups[0].name).toEqual(sessionGroupData.name);
    });

    it('should return an empty array when there are no session groups', async () => {
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toEqual([]);
    });

    it('should return session groups sorted by sort field when it exists', async () => {
      const group1 = await SessionGroupModel.create('group1', 2);
      const group2 = await SessionGroupModel.create('group2', 1);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(group2.id);
      expect(fetchedGroups[1].id).toEqual(group1.id);
    });

    it('should return session groups sorted by createdAt when sort field does not exist', async () => {
      const group1 = await SessionGroupModel.create('group1');
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const group2 = await SessionGroupModel.create('group2');

      const fetchedGroups = await SessionGroupModel.query();

      expect(fetchedGroups[0].id).toEqual(group2.id);
      expect(fetchedGroups[1].id).toEqual(group1.id);
    });

    it('should return session groups sorted by sort field first and then by createdAt', async () => {
      const group0 = await SessionGroupModel.create('group0');
      await sleep(10);
      const group1 = await SessionGroupModel.create('group1', 1);
      await sleep(10);
      const group2 = await SessionGroupModel.create('group2');
      await sleep(10);
      const group3 = await SessionGroupModel.create('group3', 2);
      await sleep(10);

      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(group1.id);
      expect(fetchedGroups[1].id).toEqual(group3.id);
      expect(fetchedGroups[2].id).toEqual(group2.id);
      expect(fetchedGroups[3].id).toEqual(group0.id);
    });

    it('should return session groups sorted by sort ', async () => {
      const group1 = await SessionGroupModel.create('group1', 1);
      const group2 = await SessionGroupModel.create('group2');
      const group3 = await SessionGroupModel.create('group3', 2);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(group1.id);
      expect(fetchedGroups[1].id).toEqual(group3.id);
      expect(fetchedGroups[2].id).toEqual(group2.id);
    });

    it('should return session groups sorted by createdAt when sort fields are equal', async () => {
      const group1 = await SessionGroupModel.create('group1', 1);
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 300));
      const group2 = await SessionGroupModel.create('group2', 1);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(group2.id);
      expect(fetchedGroups[1].id).toEqual(group1.id);
    });

    it('should sort session groups correctly when only b has a sort value', async () => {
      const groupA = await SessionGroupModel.create('groupA'); // sort undefined
      const groupB = await SessionGroupModel.create('groupB', 1); // sort defined
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(groupB.id);
      expect(fetchedGroups[1].id).toEqual(groupA.id);
    });
  });

  describe('updateOrder', () => {
    it('should update the order of session groups', async () => {
      const group1 = await SessionGroupModel.create(sessionGroupData.name, sessionGroupData.sort);
      const group2 = await SessionGroupModel.create('another-group', 2);
      await SessionGroupModel.updateOrder([
        { id: group1.id, sort: 2 },
        { id: group2.id, sort: 1 },
      ]);
      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups[0].id).toEqual(group2.id);
      expect(fetchedGroups[1].id).toEqual(group1.id);
    });
  });

  describe('findById', () => {
    it('should find a session group by id', async () => {
      const createdGroup = await SessionGroupModel.create(
        sessionGroupData.name,
        sessionGroupData.sort,
      );
      const fetchedGroup = await SessionGroupModel.findById(createdGroup.id);
      expect(fetchedGroup).toMatchObject({ ...createdGroup, ...sessionGroupData });
    });
  });

  describe('clear', () => {
    it('should clear all session groups', async () => {
      await SessionGroupModel.create(sessionGroupData.name, sessionGroupData.sort);
      const first = await SessionGroupModel.query();
      expect(first).toHaveLength(1);

      await SessionGroupModel.clear();

      const fetchedGroups = await SessionGroupModel.query();
      expect(fetchedGroups).toHaveLength(0);
    });
  });
});
