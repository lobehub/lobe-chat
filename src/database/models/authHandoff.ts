import { and, eq, lt, sql } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';

import { AuthHandoffItem, NewAuthHandoff, authHandoffs } from '../schemas';

export class AuthHandoffModel {
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  /**
   * 创建新的认证凭证传递记录
   * @param params 凭证数据
   * @returns 创建的记录
   */
  create = async (params: NewAuthHandoff): Promise<AuthHandoffItem> => {
    const [result] = await this.db.insert(authHandoffs).values(params).returning();

    return result;
  };

  /**
   * 获取并消费认证凭证
   * 该方法会先查询记录，如果找到则立即删除，确保凭证只能被使用一次
   * @param id 凭证ID
   * @param client 客户端类型
   * @returns 凭证数据，如果不存在或已过期则返回null
   */
  fetchAndConsume = async (id: string, client: string): Promise<AuthHandoffItem | null> => {
    // 先查找记录，同时检查是否过期 (5分钟TTL)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const handoff = await this.db.query.authHandoffs.findFirst({
      where: and(
        eq(authHandoffs.id, id),
        eq(authHandoffs.client, client),
        // 检查记录是否在5分钟内创建
        sql`${authHandoffs.createdAt} > ${fiveMinutesAgo}`,
      ),
    });

    if (!handoff) {
      return null;
    }

    // 立即删除记录以确保一次性使用
    await this.db.delete(authHandoffs).where(eq(authHandoffs.id, id));

    return handoff;
  };

  /**
   * 清理过期的认证凭证记录
   * 这个方法应该被定期调用（比如通过 cron job）来清理过期的记录
   * @returns 清理的记录数量
   */
  cleanupExpired = async (): Promise<number> => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await this.db
      .delete(authHandoffs)
      .where(lt(authHandoffs.createdAt, fiveMinutesAgo));

    return result.rowCount || 0;
  };

  /**
   * 检查凭证是否存在（不消费）
   * 主要用于测试和调试
   * @param id 凭证ID
   * @param client 客户端类型
   * @returns 是否存在且未过期
   */
  exists = async (id: string, client: string): Promise<boolean> => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const handoff = await this.db.query.authHandoffs.findFirst({
      where: and(
        eq(authHandoffs.id, id),
        eq(authHandoffs.client, client),
        sql`${authHandoffs.createdAt} > ${fiveMinutesAgo}`,
      ),
    });

    return !!handoff;
  };
}
