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
      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const userInfo = await userService.getCurrentUser();

      return this.success(c, userInfo, '获取用户信息成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取系统中所有用户列表
   * @param c Hono Context
   * @returns 用户列表响应
   */
  async getAllUsers(c: Context): Promise<Response> {
    try {
      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const userList = await userService.getAllUsers();

      return this.success(c, userList, '获取用户列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
