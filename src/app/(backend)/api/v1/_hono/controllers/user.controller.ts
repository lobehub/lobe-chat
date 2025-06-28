import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { UserService } from '../services';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.type';

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

  /**
   * 创建新用户
   * @param c Hono Context
   * @returns 创建的用户信息响应
   */
  async createUser(c: Context): Promise<Response> {
    try {
      const userData = await this.getBody<CreateUserRequest>(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const newUser = await userService.createUser(userData);

      return this.success(c, newUser, '用户创建成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据ID获取用户详情
   * @param c Hono Context
   * @returns 用户详情响应
   */
  async getUserById(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: string }>(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const user = await userService.getUserById(id);

      return this.success(c, user, '获取用户信息成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新用户信息
   * @param c Hono Context
   * @returns 更新后的用户信息响应
   */
  async updateUser(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: string }>(c);
      const userData = await this.getBody<UpdateUserRequest>(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const updatedUser = await userService.updateUser(id, userData);

      return this.success(c, updatedUser, '用户信息更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除用户
   * @param c Hono Context
   * @returns 删除操作结果响应
   */
  async deleteUser(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: string }>(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const result = await userService.deleteUser(id);

      return this.success(c, result, '用户删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 搜索用户
   * @param c Hono Context
   * @returns 匹配的用户列表响应
   */
  async searchUsers(c: Context): Promise<Response> {
    try {
      const { keyword } = this.getQuery<{ keyword: string }>(c);

      // 获取数据库连接并创建服务实例
      const db = await this.getDatabase();
      const userService = new UserService(db, this.getUserId(c));
      const searchResults = await userService.searchUsers(keyword);

      return this.success(c, searchResults, `搜索到 ${searchResults.length} 个匹配用户`);
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
