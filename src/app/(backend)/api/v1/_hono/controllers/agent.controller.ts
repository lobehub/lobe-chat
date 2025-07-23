import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { AgentService } from '../services/agent.service';
import {
  AgentDeleteRequest,
  AgentSessionBatchLinkRequest,
  AgentSessionLinkRequest,
  BatchDeleteAgentsRequest,
  BatchUpdateAgentsRequest,
  CreateAgentRequest,
  CreateSessionForAgentRequest,
  UpdateAgentRequest,
} from '../types/agent.type';

/**
 * Agent 控制器类
 * 处理 Agent 相关的 HTTP 请求和响应
 */
export class AgentController extends BaseController {
  /**
   * 获取系统中所有的 Agent 列表
   * GET /api/v1/agents/list
   * @param c Hono Context
   * @returns Agent 列表响应
   */
  async getAllAgents(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const agentsList = await agentService.getAllAgents();

      return this.success(c, agentsList, '获取 Agent 列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建智能体
   * POST /api/v1/agents/create
   * @param c Hono Context
   * @returns 创建完成的 Agent 信息响应
   */
  async createAgent(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<CreateAgentRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const createdAgent = await agentService.createAgent(body);

      return this.success(c, createdAgent, 'Agent 创建成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新智能体
   * PUT /api/v1/agents/update
   * @param c Hono Context
   * @returns 更新后的 Agent 信息响应
   */
  async updateAgent(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<UpdateAgentRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const updatedAgent = await agentService.updateAgent(body);

      return this.success(c, updatedAgent, 'Agent 更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除智能体
   * DELETE /api/v1/agents/delete
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteAgent(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: string }>(c);
      const request: AgentDeleteRequest = { agentId: id };

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      await agentService.deleteAgent(request);

      return this.success(c, null, 'Agent 删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据 ID 获取 Agent 详情
   * GET /api/v1/agents/:id
   * @param c Hono Context
   * @returns Agent 详情响应
   */
  async getAgentById(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const agent = await agentService.getAgentById(agentId);

      if (!agent) {
        return this.error(c, 'Agent 不存在', 404);
      }

      return this.success(c, agent, '获取 Agent 详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据 Session ID 获取关联的 Agent 详情
   * GET /api/v1/agents/session/:sessionId
   * @param c Hono Context
   * @returns Agent 详情响应
   */
  async getAgentBySessionId(c: Context): Promise<Response> {
    try {
      const { sessionId } = this.getParams<{ sessionId: string }>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const agent = await agentService.getAgentBySessionId(sessionId);

      if (!agent) {
        return this.error(c, 'Session 不存在或无关联的 Agent', 404);
      }

      return this.success(c, agent, '获取 Agent 详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 为 Agent 创建新的 Session
   * POST /api/v1/agents/:id/sessions
   * @param c Hono Context
   * @returns 新创建的 Session ID 响应
   */
  async createSessionForAgent(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<Omit<CreateSessionForAgentRequest, 'agentId'>>(c);

      const request: CreateSessionForAgentRequest = {
        agentId,
        ...body,
      };

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const sessionId = await agentService.createSessionForAgent(request);

      return c.json(
        {
          data: { id: sessionId },
          message: 'Agent Session 创建成功',
          success: true,
          timestamp: new Date().toISOString(),
        },
        201,
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取 Agent 关联的所有 Session
   * GET /api/v1/agents/:id/sessions
   * @param c Hono Context
   * @returns Agent 关联的 Session 列表响应
   */
  async getAgentSessions(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const sessions = await agentService.getAgentSessions(agentId);

      return this.success(c, sessions, '获取 Agent 关联的 Session 成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 关联 Agent 和 Session
   * POST /api/v1/agents/:id/sessions/link
   * @param c Hono Context
   * @returns 关联结果响应
   */
  async linkAgentSession(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<AgentSessionLinkRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      await agentService.linkAgentSession(agentId, body);

      return this.success(c, null, 'Agent Session 关联成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 取消 Agent 和 Session 的关联
   * DELETE /api/v1/agents/:id/sessions/:sessionId
   * @param c Hono Context
   * @returns 取消关联结果响应
   */
  async unlinkAgentSession(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const { sessionId } = this.getParams<{ sessionId: string }>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      await agentService.unlinkAgentSession(agentId, sessionId);

      return this.success(c, null, 'Agent Session 关联取消成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量关联 Agent 和多个 Session
   * POST /api/v1/agents/:id/sessions/batch-link
   * @param c Hono Context
   * @returns 批量关联结果响应
   */
  async batchLinkAgentSessions(c: Context): Promise<Response> {
    try {
      const { id: agentId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<AgentSessionBatchLinkRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      await agentService.batchLinkAgentSessions(agentId, body);

      return this.success(c, null, 'Agent Session 批量关联成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量删除 Agent
   * DELETE /api/v1/agents/batch
   * @param c Hono Context
   * @returns 批量删除结果响应
   */
  async batchDeleteAgents(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<BatchDeleteAgentsRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const result = await agentService.batchDeleteAgents(body);

      return this.success(c, result, '批量删除 Agent 完成');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量更新 Agent
   * PUT /api/v1/agents/batch
   * @param c Hono Context
   * @returns 批量更新结果响应
   */
  async batchUpdateAgents(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<BatchUpdateAgentsRequest>(c);

      const db = await this.getDatabase();
      const agentService = new AgentService(db, this.getUserId(c));
      const result = await agentService.batchUpdateAgents(body);

      return this.success(c, result, '批量更新 Agent 完成');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
