import { eq } from 'drizzle-orm/expressions';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { getTestDBInstance } from '@/database/core/dbForTest';
import {
  oidcAccessTokens,
  oidcAuthorizationCodes,
  oidcClients,
  oidcDeviceCodes,
  oidcGrants,
  oidcInteractions,
  oidcRefreshTokens,
  oidcSessions,
} from '@/database/schemas/oidc';
import { LobeChatDatabase } from '@/database/type';
import { DrizzleAdapter } from '@/libs/oidc-provider/adapter';

let serverDB = await getTestDBInstance();

// 测试数据
const testModelName = 'Session';
const testId = 'test-id';
const testUserId = 'test-user-id';
const testClientId = 'test-client-id';
const testGrantId = 'test-grant-id';
const testUserCode = 'test-user-code';
const testExpires = new Date(Date.now() + 3600 * 1000); // 1小时后过期

// 清理测试表
beforeAll(async () => {
  await serverDB.delete(oidcSessions);
  await serverDB.delete(oidcAccessTokens);
  await serverDB.delete(oidcAuthorizationCodes);
  await serverDB.delete(oidcClients);
  await serverDB.delete(oidcDeviceCodes);
  await serverDB.delete(oidcGrants);
  await serverDB.delete(oidcInteractions);
  await serverDB.delete(oidcRefreshTokens);
});

// 每次测试后清理数据
afterEach(async () => {
  await serverDB.delete(oidcSessions);
  await serverDB.delete(oidcAccessTokens);
  await serverDB.delete(oidcAuthorizationCodes);
  await serverDB.delete(oidcClients);
  await serverDB.delete(oidcDeviceCodes);
  await serverDB.delete(oidcGrants);
  await serverDB.delete(oidcInteractions);
  await serverDB.delete(oidcRefreshTokens);
});

// 所有测试完成后清理数据
afterAll(async () => {
  await serverDB.delete(oidcSessions);
  await serverDB.delete(oidcAccessTokens);
  await serverDB.delete(oidcAuthorizationCodes);
  await serverDB.delete(oidcClients);
  await serverDB.delete(oidcDeviceCodes);
  await serverDB.delete(oidcGrants);
  await serverDB.delete(oidcInteractions);
  await serverDB.delete(oidcRefreshTokens);
});

describe('DrizzleAdapter', () => {
  describe('constructor', () => {
    it('应该正确创建适配器实例', () => {
      const adapter = new DrizzleAdapter(testModelName, serverDB);
      expect(adapter).toBeDefined();
    });
  });

  describe('upsert', () => {
    it('应该为Session模型创建新记录', async () => {
      const adapter = new DrizzleAdapter('Session', serverDB);
      const payload = {
        accountId: testUserId,
        cookie: 'cookie-value',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      const result = await serverDB.query.oidcSessions.findFirst({
        where: eq(oidcSessions.id, testId),
      });
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testId);
      expect(result?.userId).toBe(testUserId);
      expect(result?.data).toEqual(payload);
    });

    it('应该为Client模型创建新记录', async () => {
      const adapter = new DrizzleAdapter('Client', serverDB);
      const payload = {
        client_id: testClientId,
        client_uri: 'https://example.com',
        application_type: 'web',
        client_secret: 'secret',
        grant_types: ['authorization_code', 'refresh_token'],
        name: 'Test Client',
        redirectUris: ['https://example.com/callback'],
        response_types: ['code'],
        scope: 'openid profile email',
        token_endpoint_auth_method: 'client_secret_basic',
      };
      
      await adapter.upsert(testClientId, payload, 0);
      
      const result = await serverDB.query.oidcClients.findFirst({
        where: eq(oidcClients.id, testClientId),
      });
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testClientId);
      expect(result?.name).toBe(payload.name);
      expect(result?.redirectUris).toEqual(payload.redirectUris);
      expect(result?.scopes).toEqual(['openid', 'profile', 'email']);
    });

    it('应该为AccessToken模型创建新记录', async () => {
      const adapter = new DrizzleAdapter('AccessToken', serverDB);
      const payload = {
        accountId: testUserId,
        clientId: testClientId,
        grantId: testGrantId,
        scope: 'openid profile',
        iat: Math.floor(Date.now() / 1000),
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      const result = await serverDB.query.oidcAccessTokens.findFirst({
        where: eq(oidcAccessTokens.id, testId),
      });
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testId);
      expect(result?.userId).toBe(testUserId);
      expect(result?.clientId).toBe(testClientId);
      expect(result?.grantId).toBe(testGrantId);
      expect(result?.data).toEqual(payload);
    });

    it('应该为DeviceCode模型创建新记录并包含userCode', async () => {
      const adapter = new DrizzleAdapter('DeviceCode', serverDB);
      const payload = {
        clientId: testClientId,
        userCode: testUserCode,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      const result = await serverDB.query.oidcDeviceCodes.findFirst({
        where: eq(oidcDeviceCodes.id, testId),
      });
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testId);
      expect(result?.clientId).toBe(testClientId);
      expect(result?.userCode).toBe(testUserCode);
      expect(result?.data).toEqual(payload);
    });
  });

  describe('find', () => {
    it('应该找到存在的记录', async () => {
      // 先创建一个记录
      const adapter = new DrizzleAdapter('Session', serverDB);
      const payload = {
        accountId: testUserId,
        cookie: 'cookie-value',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      // 然后查找它
      const result = await adapter.find(testId);
      
      expect(result).toBeDefined();
      expect(result).toEqual(payload);
    });

    it('应该为Client模型返回正确的格式', async () => {
      // 先创建一个Client记录
      const adapter = new DrizzleAdapter('Client', serverDB);
      const payload = {
        client_id: testClientId,
        client_uri: 'https://example.com',
        application_type: 'web',
        client_secret: 'secret',
        grant_types: ['authorization_code', 'refresh_token'],
        name: 'Test Client',
        redirectUris: ['https://example.com/callback'],
        response_types: ['code'],
        scope: 'openid profile email',
        token_endpoint_auth_method: 'client_secret_basic',
      };
      
      await adapter.upsert(testClientId, payload, 0);
      
      // 然后查找它
      const result = await adapter.find(testClientId);
      
      expect(result).toBeDefined();
      expect(result.client_id).toBe(testClientId);
      expect(result.client_secret).toBe(payload.client_secret);
      expect(result.redirect_uris).toEqual(payload.redirectUris);
      expect(result.scope).toBe(payload.scope);
    });

    it('应该返回undefined如果记录不存在', async () => {
      const adapter = new DrizzleAdapter('Session', serverDB);
      const result = await adapter.find('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('应该返回undefined如果记录已过期', async () => {
      // 创建一个过期的记录（过期时间设为过去）
      const adapter = new DrizzleAdapter('Session', serverDB);
      const payload = {
        accountId: testUserId,
        cookie: 'cookie-value',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1小时前
      };
      
      // 负的过期时间表示立即过期
      await adapter.upsert(testId, payload, -1);
      
      // 等待一小段时间确保过期
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 然后查找它
      const result = await adapter.find(testId);
      
      expect(result).toBeUndefined();
    });
  });

  describe('findByUserCode', () => {
    it('应该通过userCode找到DeviceCode记录', async () => {
      // 先创建一个DeviceCode记录
      const adapter = new DrizzleAdapter('DeviceCode', serverDB);
      const payload = {
        clientId: testClientId,
        userCode: testUserCode,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      // 然后通过userCode查找它
      const result = await adapter.findByUserCode(testUserCode);
      
      expect(result).toBeDefined();
      expect(result).toEqual(payload);
    });

    it('应该在非DeviceCode模型上抛出错误', async () => {
      const adapter = new DrizzleAdapter('Session', serverDB);
      await expect(adapter.findByUserCode(testUserCode)).rejects.toThrow();
    });
  });

  describe('findSessionByUserId', () => {
    it('应该通过userId找到Session记录', async () => {
      // 先创建一个Session记录
      const adapter = new DrizzleAdapter('Session', serverDB);
      const payload = {
        accountId: testUserId,
        cookie: 'cookie-value',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      // 然后通过userId查找它
      const result = await adapter.findSessionByUserId(testUserId);
      
      expect(result).toBeDefined();
      expect(result).toEqual(payload);
    });

    it('应该在非Session模型上返回undefined', async () => {
      const adapter = new DrizzleAdapter('AccessToken', serverDB);
      const result = await adapter.findSessionByUserId(testUserId);
      expect(result).toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('应该删除存在的记录', async () => {
      // 先创建一个记录
      const adapter = new DrizzleAdapter('Session', serverDB);
      const payload = {
        accountId: testUserId,
        cookie: 'cookie-value',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      // 确认记录存在
      let result = await serverDB.query.oidcSessions.findFirst({
        where: eq(oidcSessions.id, testId),
      });
      expect(result).toBeDefined();
      
      // 删除记录
      await adapter.destroy(testId);
      
      // 验证记录已被删除
      result = await serverDB.query.oidcSessions.findFirst({
        where: eq(oidcSessions.id, testId),
      });
      expect(result).toBeUndefined();
    });
  });

  describe('consume', () => {
    it('应该标记记录为已消费', async () => {
      // 先创建一个记录
      const adapter = new DrizzleAdapter('AccessToken', serverDB);
      const payload = {
        accountId: testUserId,
        clientId: testClientId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      await adapter.upsert(testId, payload, 3600);
      
      // 消费记录
      await adapter.consume(testId);
      
      // 验证记录已被标记为已消费
      const result = await serverDB.query.oidcAccessTokens.findFirst({
        where: eq(oidcAccessTokens.id, testId),
      });
      
      expect(result).toBeDefined();
      expect(result?.consumedAt).not.toBeNull();
    });
  });

  describe('revokeByGrantId', () => {
    it('应该撤销与指定grantId相关的所有记录', async () => {
      // 创建AccessToken记录
      const accessTokenAdapter = new DrizzleAdapter('AccessToken', serverDB);
      const accessTokenPayload = {
        accountId: testUserId,
        clientId: testClientId,
        grantId: testGrantId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      await accessTokenAdapter.upsert(testId, accessTokenPayload, 3600);
      
      // 创建RefreshToken记录
      const refreshTokenAdapter = new DrizzleAdapter('RefreshToken', serverDB);
      const refreshTokenPayload = {
        accountId: testUserId,
        clientId: testClientId,
        grantId: testGrantId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      await refreshTokenAdapter.upsert('refresh-' + testId, refreshTokenPayload, 3600);
      
      // 撤销与testGrantId相关的所有记录
      await accessTokenAdapter.revokeByGrantId(testGrantId);
      
      // 验证记录已被删除
      const accessTokenResult = await serverDB.query.oidcAccessTokens.findFirst({
        where: eq(oidcAccessTokens.id, testId),
      });
      expect(accessTokenResult).toBeUndefined();
      
      const refreshTokenResult = await serverDB.query.oidcRefreshTokens.findFirst({
        where: eq(oidcRefreshTokens.id, 'refresh-' + testId),
      });
      expect(refreshTokenResult).toBeUndefined();
    });

    it('应该在Grant模型上直接返回', async () => {
      // Grant模型不需要通过grantId来撤销
      const adapter = new DrizzleAdapter('Grant', serverDB);
      await adapter.revokeByGrantId(testGrantId);
      // 如果没有抛出错误，测试通过
    });
  });

  describe('createAdapterFactory', () => {
    it('应该创建一个适配器工厂函数', () => {
      const factory = DrizzleAdapter.createAdapterFactory(serverDB as any);
      expect(factory).toBeDefined();
      expect(typeof factory).toBe('function');
      
      const adapter = factory('Session');
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(DrizzleAdapter);
    });
  });
}); 