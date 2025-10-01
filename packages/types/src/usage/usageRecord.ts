import { MessageMetadata } from '../message';

export interface UsageRecordItem {
  /**
   * 记录 ID
   **/
  id: string;
  /**
   * 模型id
   */
  model: string;
  /**
   * 提供商
   */
  provider: string;
  /**
   * 花费
   **/
  spend: number;
  /**
   * 调用类型
   **/
  type: string;
  /**
   * 用户 ID
   **/
  userId: string;
  /**
   * 性能信息
   **/
  ttft?: number | null;
  tps?: number | null;
  inputStartAt?: Date | null;
  outputStartAt?: Date | null;
  outputFinishAt?: Date | null;
  /**
   * 使用信息
   **/
  totalInputTokens?: number | null;
  totalOutputTokens?: number | null;
  totalTokens?: number | null;
  /**
   * 元数据
   **/
  metadata?: MessageMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UsageLog = {
  date: number;
  day: string;
  records: UsageRecordItem[];
  totalRequests: number;
  totalSpend: number;
  totalTokens: number;
};