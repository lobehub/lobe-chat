import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { UserService } from '../services';

/**
 * 用户控制器类
 * 处理用户相关的HTTP请求和响应
 */
export class UserController extends BaseController {
  /**
   * 获取当前登录用户信息
   * @param c Hono Context
   * @returns 用户公开信息响应
   */
  async getCurrentUser(c: Context): Promise<Response> {
    try {
      // 获取用户ID（可能为空，用于可选认证）
      const userId = this.getUserId(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();

      const userService = new UserService(db);

      const userInfo = await userService.getCurrentUser(userId!);

      return this.success(c, userInfo);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
