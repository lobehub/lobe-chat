import { z } from 'zod';

import { getKlavisClient } from '@/libs/klavis';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { MCPService } from '@/server/services/mcp';

/**
 * Klavis router for tools
 * Contains callTool and listTools which call external Klavis API
 */
export const klavisRouter = router({
  /**
   * Call a tool on a Klavis Strata server
   */
  callTool: authedProcedure
    .input(
      z.object({
        serverUrl: z.string(),
        toolArgs: z.record(z.unknown()).optional(),
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const klavisClient = getKlavisClient();

      const response = await klavisClient.mcpServer.callTools({
        serverUrl: input.serverUrl,
        toolArgs: input.toolArgs,
        toolName: input.toolName,
      });

      // Handle error case
      if (!response.success || !response.result) {
        return {
          content: response.error || 'Unknown error',
          state: {
            content: [{ text: response.error || 'Unknown error', type: 'text' }],
            isError: true,
          },
          success: false,
        };
      }

      // Process the response using the common MCP tool call result processor
      const processedResult = await MCPService.processToolCallResult({
        content: (response.result.content || []) as any[],
        isError: response.result.isError,
      });

      return processedResult;
    }),

  /**
   * List tools available on a Klavis Strata server
   */
  listTools: authedProcedure
    .input(
      z.object({
        serverUrl: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const klavisClient = getKlavisClient();

      const response = await klavisClient.mcpServer.listTools({
        serverUrl: input.serverUrl,
      });

      return {
        tools: response.tools,
      };
    }),
});
