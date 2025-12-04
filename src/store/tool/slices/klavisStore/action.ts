import { enableMapSet, produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { lambdaClient } from '@/libs/trpc/client';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { KlavisStoreState } from './initialState';
import {
  CallKlavisToolParams,
  CallKlavisToolResult,
  CreateKlavisServerParams,
  KlavisServer,
  KlavisServerStatus,
  KlavisTool,
} from './types';

enableMapSet();

const n = setNamespace('klavisStore');

/**
 * Klavis Store Actions
 */
export interface KlavisStoreAction {
  /**
   * 调用 Klavis 工具
   */
  callKlavisTool: (params: CallKlavisToolParams) => Promise<CallKlavisToolResult>;

  /**
   * 完成 OAuth 认证后，更新服务器状态
   */
  completeKlavisServerAuth: (serverName: string) => Promise<void>;

  /**
   * 创建单个 Klavis MCP Server 实例
   * @returns 创建的服务器实例，如果需要 OAuth 则返回带 oauthUrl 的对象
   */
  createKlavisServer: (params: CreateKlavisServerParams) => Promise<KlavisServer | undefined>;

  /**
   * 从数据库加载用户的 Klavis 插件
   */
  loadUserKlavisServers: () => Promise<void>;

  /**
   * 刷新 Klavis Server 的工具列表
   */
  refreshKlavisServerTools: (serverName: string) => Promise<void>;

  /**
   * 删除 Klavis Server
   */
  removeKlavisServer: (serverName: string) => Promise<void>;
}

export const createKlavisStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  KlavisStoreAction
> = (set, get) => ({
  callKlavisTool: async (params) => {
    const { serverUrl, toolName, toolArgs } = params;

    const toolId = `${serverUrl}:${toolName}`;

    set(
      produce((draft: KlavisStoreState) => {
        draft.executingToolIds.add(toolId);
      }),
      false,
      n('callKlavisTool/start'),
    );

    try {
      // 调用 tRPC 服务端接口执行工具
      const response = await lambdaClient.klavis.callTool.mutate({
        serverUrl,
        toolArgs,
        toolName,
      });

      set(
        produce((draft: KlavisStoreState) => {
          draft.executingToolIds.delete(toolId);
        }),
        false,
        n('callKlavisTool/success'),
      );

      return { data: response, success: true };
    } catch (error) {
      console.error('[Klavis] Failed to call tool:', error);

      set(
        produce((draft: KlavisStoreState) => {
          draft.executingToolIds.delete(toolId);
        }),
        false,
        n('callKlavisTool/error'),
      );

      return {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      };
    }
  },

  completeKlavisServerAuth: async (serverName) => {
    // OAuth 完成后，刷新工具列表
    await get().refreshKlavisServerTools(serverName);
  },

  createKlavisServer: async (params) => {
    const { userId, serverName } = params;

    set(
      produce((draft: KlavisStoreState) => {
        draft.loadingServerIds.add(serverName);
      }),
      false,
      n('createKlavisServer/start'),
    );

    try {
      // 调用 tRPC 服务端接口创建单个服务器实例
      const response = await lambdaClient.klavis.createServerInstance.mutate({
        serverName,
        userId,
      });

      // 构建服务器对象
      const server: KlavisServer = {
        createdAt: Date.now(),
        instanceId: response.instanceId,
        isAuthenticated: response.isAuthenticated,
        oauthUrl: response.oauthUrl,
        serverName: response.serverName,
        serverUrl: response.serverUrl,
        status: response.isAuthenticated
          ? KlavisServerStatus.CONNECTED
          : KlavisServerStatus.PENDING_AUTH,
      };

      // 添加到 servers 列表
      set(
        produce((draft: KlavisStoreState) => {
          // 检查是否已存在，如果存在则更新
          const existingIndex = draft.servers.findIndex((s) => s.serverName === serverName);
          if (existingIndex >= 0) {
            draft.servers[existingIndex] = server;
          } else {
            draft.servers.push(server);
          }
          draft.loadingServerIds.delete(serverName);
        }),
        false,
        n('createKlavisServer/success'),
      );

      return server;
    } catch (error) {
      console.error('[Klavis] Failed to create server:', error);

      set(
        produce((draft: KlavisStoreState) => {
          draft.loadingServerIds.delete(serverName);
        }),
        false,
        n('createKlavisServer/error'),
      );

      return undefined;
    }
  },

  loadUserKlavisServers: async () => {
    try {
      // 从数据库加载已保存的 Klavis 插件
      const klavisPlugins = await lambdaClient.klavis.getKlavisPlugins.query();

      if (klavisPlugins.length === 0) return;

      // 转换为 KlavisServer 对象
      const serversFromDb: KlavisServer[] = klavisPlugins
        .filter((plugin) => plugin.customParams?.klavis)
        .map((plugin) => {
          const klavisParams = plugin.customParams!.klavis!;
          const tools: KlavisTool[] = (plugin.manifest?.api || []).map((api) => ({
            description: api.description,
            inputSchema: api.parameters as KlavisTool['inputSchema'],
            name: api.name,
          }));

          return {
            createdAt: Date.now(),
            instanceId: klavisParams.instanceId,
            isAuthenticated: klavisParams.isAuthenticated,
            oauthUrl: klavisParams.oauthUrl,
            serverName: klavisParams.serverName,
            serverUrl: klavisParams.serverUrl,
            status: klavisParams.isAuthenticated
              ? KlavisServerStatus.CONNECTED
              : KlavisServerStatus.PENDING_AUTH,
            tools,
          };
        });

      if (serversFromDb.length > 0) {
        set(
          produce((draft: KlavisStoreState) => {
            const existingNames = new Set(draft.servers.map((s) => s.serverName));
            const newServers = serversFromDb.filter((s) => !existingNames.has(s.serverName));
            draft.servers = [...draft.servers, ...newServers];
          }),
          false,
          n('loadUserKlavisServers'),
        );
      }
    } catch (error) {
      console.error('[Klavis] Failed to load user integrations:', error);
    }
  },

  refreshKlavisServerTools: async (serverName) => {
    const { servers } = get();

    const server = servers.find((s) => s.serverName === serverName);
    if (!server) {
      console.error('[Klavis] Server not found:', serverName);
      return;
    }

    set(
      produce((draft: KlavisStoreState) => {
        draft.loadingServerIds.add(serverName);
      }),
      false,
      n('refreshKlavisServerTools/start'),
    );

    try {
      // 首先检查服务器的认证状态
      const instanceStatus = await lambdaClient.klavis.getServerInstance.query({
        instanceId: server.instanceId,
      });

      // 如果认证失败，删除服务器并重置状态
      if (!instanceStatus.isAuthenticated) {
        if (!instanceStatus.authNeeded) {
          // 如果不需要认证，说明没问题
          return;
        }

        // 从本地状态移除
        set(
          produce((draft: KlavisStoreState) => {
            draft.servers = draft.servers.filter((s) => s.serverName !== serverName);
            draft.loadingServerIds.delete(serverName);
          }),
          false,
          n('refreshKlavisServerTools/authFailed'),
        );

        // 从数据库删除
        await lambdaClient.klavis.deleteServerInstance.mutate({
          instanceId: server.instanceId,
          serverName,
        });

        return;
      }

      // 认证成功，获取工具列表
      const response = await lambdaClient.klavis.listTools.query({
        serverUrl: server.serverUrl,
      });

      const tools = response.tools as KlavisTool[];

      set(
        produce((draft: KlavisStoreState) => {
          const serverIndex = draft.servers.findIndex((s) => s.serverName === serverName);
          if (serverIndex >= 0) {
            draft.servers[serverIndex].tools = tools;
            draft.servers[serverIndex].status = KlavisServerStatus.CONNECTED;
            draft.servers[serverIndex].isAuthenticated = true;
            draft.servers[serverIndex].errorMessage = undefined;
          }
          draft.loadingServerIds.delete(serverName);
        }),
        false,
        n('refreshKlavisServerTools/success'),
      );

      // 更新数据库中的工具列表和认证状态
      await lambdaClient.klavis.updateKlavisPlugin.mutate({
        instanceId: server.instanceId,
        isAuthenticated: true,
        serverName,
        serverUrl: server.serverUrl,
        tools: tools.map((t) => ({
          description: t.description,
          inputSchema: t.inputSchema,
          name: t.name,
        })),
      });
    } catch (error) {
      console.error('[Klavis] Failed to refresh tools:', error);

      set(
        produce((draft: KlavisStoreState) => {
          const serverIndex = draft.servers.findIndex((s) => s.serverName === serverName);
          if (serverIndex >= 0) {
            draft.servers[serverIndex].status = KlavisServerStatus.ERROR;
            draft.servers[serverIndex].errorMessage =
              error instanceof Error ? error.message : String(error);
          }
          draft.loadingServerIds.delete(serverName);
        }),
        false,
        n('refreshKlavisServerTools/error'),
      );
    }
  },

  removeKlavisServer: async (serverName) => {
    const { servers } = get();
    const server = servers.find((s) => s.serverName === serverName);

    set(
      produce((draft: KlavisStoreState) => {
        draft.servers = draft.servers.filter((s) => s.serverName !== serverName);
      }),
      false,
      n('removeKlavisServer'),
    );

    // 从 Klavis API 和数据库删除
    if (server) {
      try {
        await lambdaClient.klavis.deleteServerInstance.mutate({
          instanceId: server.instanceId,
          serverName,
        });
      } catch (error) {
        console.error('[Klavis] Failed to delete server instance:', error);
      }
    }
  },
});
