import { IPaginationQuery } from '../types';

/**
 * 处理分页查询参数
 * @param query 查询参数对象
 * @returns 如果提供了分页参数，返回 { limit, offset }；否则返回空对象
 */
export function processPaginationConditions(query: Record<string, any> & IPaginationQuery): {
  limit?: number;
  offset?: number;
} {
  if (!query.page || !query.pageSize) {
    return {};
  }

  return {
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  };
}
