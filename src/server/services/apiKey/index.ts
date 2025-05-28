import { ApiKeyModel } from '@/database/models/apiKey';
import { LobeChatDatabase } from '@/database/type';
import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

export class ApiKeyService {
  private model: ApiKeyModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.model = new ApiKeyModel(db, userId);
  }

  /**
   * 创建新的 API Key
   * @param params - 创建参数
   * @returns 创建的 API Key 信息
   */
  async create(params: CreateApiKeyParams): Promise<ApiKeyItem> {
    return this.model.create(params);
  }

  /**
   * 删除指定的 API Key
   * @param id - API Key ID
   */
  async delete(id: string): Promise<void> {
    await this.model.delete(id);
  }

  /**
   * 删除用户的所有 API Key
   */
  async deleteAll(): Promise<void> {
    await this.model.deleteAll();
  }

  /**
   * 获取指定的 API Key 信息
   * @param id - API Key ID
   * @returns API Key 信息
   */
  async getById(id: string): Promise<ApiKeyItem | undefined> {
    return this.model.findById(id);
  }

  /**
   * 获取用户的所有 API Key 列表
   * @returns API Key 列表
   */
  async list(): Promise<ApiKeyItem[]> {
    return this.model.query();
  }

  /**
   * 更新 API Key 信息
   * @param id - API Key ID
   * @param params - 更新参数
   */
  async update(id: string, params: UpdateApiKeyParams): Promise<void> {
    await this.model.update(id, params);
  }

  /**
   * 验证 API Key 是否有效
   * @param key - API Key
   * @returns 是否有效
   */
  async validate(key: string): Promise<boolean> {
    return this.model.validateKey(key);
  }

  /**
   * 更新 API Key 的最后使用时间
   * @param id - API Key ID
   */
  async updateLastUsed(id: string): Promise<void> {
    await this.model.updateLastUsed(id);
  }
}

// 导出服务实例
export const apiKeyService = {
  create: (db: LobeChatDatabase, userId: string) => new ApiKeyService(db, userId),
};
