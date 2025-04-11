import { eq } from 'drizzle-orm/expressions';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

import * as schema from '@/database/schemas';
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

interface OIDCModel {
  [key: string]: any;
  consumedAt?: Date;
  data: Record<string, any>;
  expiresAt?: Date;
  id: string;
}

class OIDCAdapter {
  private db: NeonDatabase<typeof schema>;
  private name: string;

  constructor(name: string, db: NeonDatabase<typeof schema>) {
    this.name = name;
    this.db = db;
  }

  /**
   * 根据模型名称获取对应的数据库表
   */
  private getTable() {
    switch (this.name) {
      case 'AccessToken': {
        return oidcAccessTokens;
      }
      case 'AuthorizationCode': {
        return oidcAuthorizationCodes;
      }
      case 'RefreshToken': {
        return oidcRefreshTokens;
      }
      case 'DeviceCode': {
        return oidcDeviceCodes;
      }
      case 'ClientCredentials': {
        return oidcAccessTokens;
      } // 使用相同的表
      case 'Client': {
        return oidcClients;
      }
      case 'InitialAccessToken': {
        return oidcAccessTokens;
      } // 使用相同的表
      case 'RegistrationAccessToken': {
        return oidcAccessTokens;
      } // 使用相同的表
      case 'Interaction': {
        return oidcInteractions;
      }
      case 'ReplayDetection': {
        return null;
      } // 不需要持久化
      case 'PushedAuthorizationRequest': {
        return oidcAuthorizationCodes;
      } // 使用相同的表
      case 'Grant': {
        return oidcGrants;
      }
      case 'Session': {
        return oidcSessions;
      }
      default: {
        throw new Error(`不支持的模型: ${this.name}`);
      }
    }
  }

  /**
   * 创建模型实例
   */
  async upsert(id: string, payload: any, expiresIn: number): Promise<void> {
    const table = this.getTable();
    if (!table) return;

    if (this.name === 'Client') {
      // 客户端模型特殊处理，直接使用传入的数据
      await this.db
        .insert(table)
        .values({
          applicationType: payload.application_type,
          clientSecret: payload.clientSecret,
          clientUri: payload.client_uri,
          description: payload.description,
          grants: payload.grant_types || [],
          id,
          isFirstParty: !!payload.isFirstParty,
          logoUri: payload.logo_uri,
          name: payload.name,
          policyUri: payload.policy_uri,
          redirectUris: payload.redirectUris || [],
          responseTypes: payload.response_types || [],
          scopes: payload.scope ? payload.scope.split(' ') : [],
          tokenEndpointAuthMethod: payload.token_endpoint_auth_method,
          tosUri: payload.tos_uri,
        })
        .onConflictDoUpdate({
          set: {
            applicationType: payload.application_type,
            clientSecret: payload.clientSecret,
            clientUri: payload.client_uri,
            description: payload.description,
            grants: payload.grant_types || [],
            isFirstParty: !!payload.isFirstParty,
            logoUri: payload.logo_uri,
            name: payload.name,
            policyUri: payload.policy_uri,
            redirectUris: payload.redirectUris || [],
            responseTypes: payload.response_types || [],
            scopes: payload.scope ? payload.scope.split(' ') : [],
            tokenEndpointAuthMethod: payload.token_endpoint_auth_method,
            tosUri: payload.tos_uri,
          },
          target: (table as any).id,
        });
      return;
    }

    // 对其他模型，保存完整数据和元数据
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    const record: Record<string, any> = {
      data: payload,
      expiresAt,
      id,
    };

    // 添加特定字段
    if (payload.accountId) {
      record.userId = payload.accountId;
    }

    if (payload.clientId) {
      record.clientId = payload.clientId;
    }

    if (payload.grantId) {
      record.grantId = payload.grantId;
    }

    if (this.name === 'DeviceCode' && payload.userCode) {
      record.userCode = payload.userCode;
    }

    try {
      await this.db
        .insert(table)
        .values(record)
        .onConflictDoUpdate({
          set: {
            data: payload,
            expiresAt,
            ...(payload.accountId ? { userId: payload.accountId } : {}),
            ...(payload.clientId ? { clientId: payload.clientId } : {}),
            ...(payload.grantId ? { grantId: payload.grantId } : {}),
            ...(this.name === 'DeviceCode' && payload.userCode
              ? { userCode: payload.userCode }
              : {}),
          },
          target: (table as any).id,
        });
    } catch (error) {
      console.error(`[OIDC Adapter] Error upserting ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * 查找模型实例
   */
  async find(id: string): Promise<any> {
    const table = this.getTable();
    if (!table) return undefined;

    try {
      const result = await this.db
        .select()
        .from(table)
        .where(eq((table as any).id, id))
        .limit(1);

      if (!result || result.length === 0) return undefined;

      const model = result[0];

      // 客户端模型特殊处理
      if (this.name === 'Client') {
        return {
          application_type: model.applicationType,
          client_id: model.id,
          client_secret: model.clientSecret,
          client_uri: model.clientUri,
          grant_types: model.grants,
          isFirstParty: model.isFirstParty,
          logo_uri: model.logoUri,
          policy_uri: model.policyUri,
          redirect_uris: model.redirectUris,
          response_types: model.responseTypes,
          scope: model.scopes.join(' '),
          token_endpoint_auth_method: model.tokenEndpointAuthMethod,
          tos_uri: model.tosUri,
        };
      }

      // 如果记录已过期，返回 undefined
      if (model.expiresAt && new Date() > new Date(model.expiresAt)) {
        return undefined;
      }

      // 如果记录已被消费，返回 undefined
      if (model.consumedAt) {
        return undefined;
      }

      return model.data;
    } catch (error) {
      console.error(`[OIDC Adapter] Error finding ${this.name}:`, error);
      return undefined;
    }
  }

  /**
   * 查找模型实例 by userCode (仅用于设备流程)
   */
  async findByUserCode(userCode: string): Promise<any> {
    if (this.name !== 'DeviceCode') {
      throw new Error('findByUserCode 只能用于 DeviceCode 模型');
    }

    try {
      const result = await this.db
        .select()
        .from(oidcDeviceCodes)
        .where(eq(oidcDeviceCodes.userCode, userCode))
        .limit(1);

      if (!result || result.length === 0) return undefined;

      const model = result[0];

      // 如果记录已过期，返回 undefined
      if (model.expiresAt && new Date() > new Date(model.expiresAt)) {
        return undefined;
      }

      // 如果记录已被消费，返回 undefined
      if (model.consumedAt) {
        return undefined;
      }

      return model.data;
    } catch (error) {
      console.error('[OIDC Adapter] Error finding DeviceCode by userCode:', error);
      return undefined;
    }
  }

  /**
   * 查找模型实例 by uid (仅用于交互)
   */
  async findByUid(uid: string): Promise<any> {
    if (this.name !== 'Interaction') {
      throw new Error('findByUid 只能用于 Interaction 模型');
    }

    return this.find(uid);
  }

  /**
   * 销毁模型实例
   */
  async destroy(id: string): Promise<void> {
    const table = this.getTable();
    if (!table) return;

    try {
      await this.db.delete(table).where(eq((table as any).id, id));
    } catch (error) {
      console.error(`[OIDC Adapter] Error destroying ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * 消费模型实例 (标记为已使用)
   */
  async consume(id: string): Promise<void> {
    const table = this.getTable();
    if (!table || !('consumedAt' in table)) return;

    try {
      await this.db
        .update(table)
        .set({ consumedAt: new Date() })
        .where(eq((table as any).id, id));
    } catch (error) {
      console.error(`[OIDC Adapter] Error consuming ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * 根据授权ID查找匹配的模型实例
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    // 确保模型支持 grantId
    if (
      !(
        this.name === 'AccessToken' ||
        this.name === 'AuthorizationCode' ||
        this.name === 'RefreshToken' ||
        this.name === 'DeviceCode'
      )
    ) {
      return;
    }

    const table = this.getTable();
    if (!table || !('grantId' in table)) return;

    try {
      await this.db.delete(table).where(eq((table as any).grantId, grantId));
    } catch (error) {
      console.error(`[OIDC Adapter] Error revoking ${this.name} by grantId:`, error);
      throw error;
    }
  }
}

export const DrizzleAdapter = {
  /**
   * 创建适配器工厂
   */
  createAdapterFactory(db: NeonDatabase<typeof schema>) {
    return (name: string) => new OIDCAdapter(name, db);
  },
};
