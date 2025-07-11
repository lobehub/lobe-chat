import { ApiKeyItem, CreateApiKeyParams, UpdateApiKeyParams } from '@/types/apiKey';

export interface IApiKeyService {
  /**
   * 创建新的 API Key
   * @param params - 创建参数
   * @returns 创建的 API Key 信息
   */
  create: (params: CreateApiKeyParams) => Promise<ApiKeyItem>;

  /**
   * 删除指定的 API Key
   * @param id - API Key ID
   */
  delete: (id: number) => Promise<void>;

  /**
   * 删除所有 API Key
   */
  deleteAll: () => Promise<void>;

  /**
   * 获取指定的 API Key 信息
   * @param id - API Key ID
   * @returns API Key 信息
   */
  getById: (id: number) => Promise<ApiKeyItem>;

  /**
   * 获取所有 API Key 列表
   * @returns API Key 列表
   */
  list: () => Promise<ApiKeyItem[]>;

  /**
   * 更新 API Key 信息
   * @param id - API Key ID
   * @param params - 更新参数
   */
  update: (id: number, params: UpdateApiKeyParams) => Promise<void>;

  /**
   * 验证 API Key 是否有效
   * @param key - API Key
   * @returns 是否有效
   */
  validate: (key: string) => Promise<boolean>;
}
