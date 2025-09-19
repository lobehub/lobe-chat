import { IPaginationQuery } from '../types';

/**
 * 处理分页查询参数
 * @param request 查询参数对象
 * @returns 如果提供了分页参数，返回 { limit, offset }；否则返回空对象
 */
export function processPaginationConditions(request: Record<string, any> & IPaginationQuery): {
  limit?: number;
  offset?: number;
} {
  if (!request.page || !request.pageSize) {
    return {};
  }

  return {
    limit: request.pageSize,
    offset: (request.page - 1) * request.pageSize,
  };
}
