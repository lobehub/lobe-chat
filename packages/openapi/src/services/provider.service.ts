import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';

import { aiModels, aiProviders, AiProviderSelectItem } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

import { BaseService } from '../common/base.service';
import { processPaginationConditions } from '../helpers/pagination';
import { ServiceResult } from '../types';
import {
  CreateProviderRequest,
  DeleteProviderRequest,
  GetProviderDetailRequest,
  GetProvidersResponse,
  ProviderDetailResponse,
  ProviderKeyVaults,
  ProviderListQuery,
  ProviderRecord,
  UpdateProviderRequest,
} from '../types/provider.type';

/**
 * Provider 服务实现类，负责处理 AI Provider 的业务逻辑
 */
export class ProviderService extends BaseService {
  private gateKeeperPromise: Promise<KeyVaultsGateKeeper> | null = null;

  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  private async getGateKeeper(): Promise<KeyVaultsGateKeeper> {
    if (!this.gateKeeperPromise) {
      this.gateKeeperPromise = KeyVaultsGateKeeper.initWithEnvKey();
    }

    return this.gateKeeperPromise;
  }

  private async encryptKeyVaults(
    keyVaults: ProviderKeyVaults | null | undefined,
  ): Promise<string | null | undefined> {
    if (keyVaults === undefined) return undefined;
    if (keyVaults === null) return null;

    const gateKeeper = await this.getGateKeeper();

    return gateKeeper.encrypt(JSON.stringify(keyVaults));
  }

  private async decryptKeyVaults(encrypted: string | null): Promise<ProviderKeyVaults | undefined> {
    if (!encrypted) return undefined;

    try {
      const gateKeeper = await this.getGateKeeper();
      const { plaintext, wasAuthentic } = await gateKeeper.decrypt(encrypted);

      if (!wasAuthentic || !plaintext) return undefined;

      const parsed = JSON.parse(plaintext);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as ProviderKeyVaults;
      }

      return undefined;
    } catch (error) {
      this.log('warn', '解密 Provider KeyVaults 失败', {
        error,
      });
      return undefined;
    }
  }

  private transformProviderRecord(provider: AiProviderSelectItem): ProviderRecord {
    const { keyVaults: _ignored, fetchOnClient, ...rest } = provider;

    return {
      ...rest,
      fetchOnClient: typeof fetchOnClient === 'boolean' ? fetchOnClient : undefined,
    };
  }

  async getProviders(request: ProviderListQuery = {}): ServiceResult<GetProvidersResponse> {
    this.log('info', '获取 Provider 列表', {
      request,
      userId: this.userId,
    });

    try {
      const permissionResult = await this.resolveOperationPermission('AI_PROVIDER_READ');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问 Provider 列表');
      }

      const conditions = [] as any[];

      if (permissionResult.condition?.userId) {
        conditions.push(eq(aiProviders.userId, permissionResult.condition.userId));
      }

      if (request.keyword) {
        conditions.push(
          or(
            ilike(aiProviders.id, `%${request.keyword}%`),
            ilike(aiProviders.name, `%${request.keyword}%`),
            ilike(aiProviders.description, `%${request.keyword}%`),
          ),
        );
      }

      if (typeof request.enabled === 'boolean') {
        conditions.push(eq(aiProviders.enabled, request.enabled));
      }

      if (request.source) {
        conditions.push(eq(aiProviders.source, request.source));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0] ?? undefined;

      const { limit, offset } = processPaginationConditions(request);

      const [providers, totalResult] = await Promise.all([
        this.db.query.aiProviders.findMany({
          limit,
          offset,
          orderBy: [asc(aiProviders.sort), desc(aiProviders.updatedAt)],
          where: whereCondition,
        }),
        this.db.select({ count: count() }).from(aiProviders).where(whereCondition),
      ]);

      const sanitizedProviders = providers.map((provider) => this.transformProviderRecord(provider));

      return {
        providers: sanitizedProviders,
        total: totalResult[0]?.count ?? 0,
      };
    } catch (error) {
      this.handleServiceError(error, '获取 Provider 列表');
    }
  }

  async getProviderDetail(request: GetProviderDetailRequest): ServiceResult<ProviderDetailResponse> {
    this.log('info', '获取 Provider 详情', {
      id: request.id,
      userId: this.userId,
    });

    try {
      const permissionResult = await this.resolveOperationPermission('AI_PROVIDER_READ', {
        targetProviderId: request.id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问 Provider 详情');
      }

      const whereConditions = [eq(aiProviders.id, request.id)];

      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(aiProviders.userId, permissionResult.condition.userId));
      }

      const whereCondition =
        whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

      const provider = await this.db.query.aiProviders.findFirst({
        where: whereCondition,
      });

      if (!provider) {
        throw this.createNotFoundError(`未找到 Provider: ${request.id}`);
      }

      const sanitized = this.transformProviderRecord(provider);
      const keyVaults = await this.decryptKeyVaults(provider.keyVaults);

      return {
        ...sanitized,
        keyVaults,
      };
    } catch (error) {
      this.handleServiceError(error, '获取 Provider 详情');
    }
  }

  async createProvider(request: CreateProviderRequest): ServiceResult<ProviderDetailResponse> {
    this.log('info', '创建 Provider', {
      id: request.id,
      userId: this.userId,
    });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未登录');
      }

      const permissionResult = await this.resolveOperationPermission('AI_PROVIDER_CREATE');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权创建 Provider');
      }

      const ownerId = permissionResult.condition?.userId ?? this.userId;

      const existed = await this.db.query.aiProviders.findFirst({
        where: and(eq(aiProviders.id, request.id), eq(aiProviders.userId, ownerId)),
      });

      if (existed) {
        throw this.createBusinessError(`Provider "${request.id}" 已存在`);
      }

      const encryptedKeyVaults = await this.encryptKeyVaults(request.keyVaults);
      const now = new Date();

      const [createdProvider] = await this.db
        .insert(aiProviders)
        .values({
          checkModel: request.checkModel ?? null,
          config: request.config ?? {},
          createdAt: now,
          description: request.description ?? null,
          enabled: request.enabled ?? true,
          fetchOnClient: request.fetchOnClient ?? null,
          id: request.id,
          keyVaults: encryptedKeyVaults ?? null,
          logo: request.logo ?? null,
          name: request.name ?? null,
          settings: request.settings ?? {},
          sort: request.sort ?? null,
          source: request.source,
          updatedAt: now,
          userId: ownerId,
        })
        .returning();

      const sanitized = this.transformProviderRecord(createdProvider);

      return {
        ...sanitized,
        keyVaults: request.keyVaults,
      };
    } catch (error) {
      this.handleServiceError(error, '创建 Provider');
    }
  }

  async updateProvider(request: UpdateProviderRequest): ServiceResult<ProviderDetailResponse> {
    this.log('info', '更新 Provider', {
      id: request.id,
      userId: this.userId,
    });

    try {
      const permissionResult = await this.resolveOperationPermission('AI_PROVIDER_UPDATE', {
        targetProviderId: request.id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权更新 Provider');
      }

      const whereConditions = [eq(aiProviders.id, request.id)];

      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(aiProviders.userId, permissionResult.condition.userId));
      }

      const whereCondition =
        whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

      const existing = await this.db.query.aiProviders.findFirst({
        where: whereCondition,
      });

      if (!existing) {
        throw this.createNotFoundError(`未找到 Provider: ${request.id}`);
      }

      const encryptedKeyVaults = await this.encryptKeyVaults(request.keyVaults);

      const updateData: Partial<typeof aiProviders.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (request.name !== undefined) updateData.name = request.name ?? null;
      if (request.description !== undefined) updateData.description = request.description ?? null;
      if (request.logo !== undefined) updateData.logo = request.logo ?? null;
      if (request.checkModel !== undefined) updateData.checkModel = request.checkModel ?? null;
      if (request.fetchOnClient !== undefined) updateData.fetchOnClient = request.fetchOnClient;
      if (request.enabled !== undefined) updateData.enabled = request.enabled;
      if (request.sort !== undefined) updateData.sort = request.sort ?? null;
      if (request.source !== undefined) updateData.source = request.source;
      if (request.settings !== undefined) updateData.settings = request.settings ?? {};
      if (request.config !== undefined) updateData.config = request.config ?? {};
      if (encryptedKeyVaults !== undefined) updateData.keyVaults = encryptedKeyVaults;

      const [updatedProvider] = await this.db
        .update(aiProviders)
        .set(updateData)
        .where(whereCondition)
        .returning();

      if (!updatedProvider) {
        throw this.createBusinessError('更新 Provider 失败');
      }

      const sanitized = this.transformProviderRecord(updatedProvider);
      const keyVaults =
        request.keyVaults !== undefined
          ? request.keyVaults ?? undefined
          : await this.decryptKeyVaults(updatedProvider.keyVaults);

      return {
        ...sanitized,
        keyVaults,
      };
    } catch (error) {
      this.handleServiceError(error, '更新 Provider');
    }
  }

  async deleteProvider(request: DeleteProviderRequest): ServiceResult<void> {
    this.log('info', '删除 Provider', {
      id: request.id,
      userId: this.userId,
    });

    try {
      const permissionResult = await this.resolveOperationPermission('AI_PROVIDER_DELETE', {
        targetProviderId: request.id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权删除 Provider');
      }

      const whereConditions = [eq(aiProviders.id, request.id)];

      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(aiProviders.userId, permissionResult.condition.userId));
      }

      const providerWhere =
        whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]!;

      const provider = await this.db.query.aiProviders.findFirst({
        where: providerWhere,
      });

      if (!provider) {
        throw this.createNotFoundError(`未找到 Provider: ${request.id}`);
      }

      await this.db.transaction(async (tx) => {
        const modelConditions = [eq(aiModels.providerId, request.id)];

        if (permissionResult.condition?.userId) {
          modelConditions.push(eq(aiModels.userId, permissionResult.condition.userId));
        }

        const modelWhere =
          modelConditions.length > 1 ? and(...modelConditions) : modelConditions[0]!;

        await tx.delete(aiModels).where(modelWhere);
        await tx.delete(aiProviders).where(providerWhere);
      });

      this.log('info', 'Provider 删除成功', {
        id: request.id,
      });
    } catch (error) {
      this.handleServiceError(error, '删除 Provider');
    }
  }
}
