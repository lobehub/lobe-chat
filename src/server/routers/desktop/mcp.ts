import { z } from 'zod';

import { isServerMode } from '@/const/version';
import { passwordProcedure } from '@/libs/trpc/edge';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { mcpService } from '@/server/services/mcp';

const stdioParamsSchema = z.object({
  args: z.array(z.string()).optional().default([]),
  command: z.string().min(1),
  name: z.string().min(1),
  type: z.literal('stdio').default('stdio'),
});

const mcpProcedure = isServerMode ? authedProcedure : passwordProcedure;

export const mcpRouter = router({
  getStdioMcpServerManifest: mcpProcedure.input(stdioParamsSchema).query(async ({ input }) => {
    return await mcpService.getStdioMcpServerManifest(input.name, input.command, input.args);
  }),

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  // --- MCP Interaction ---
  // listTools now accepts MCPClientParams directly
  listTools: mcpProcedure
    .input(stdioParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Pass the validated MCPClientParams to the service
      return await mcpService.listTools(input);
    }),

  // callTool now accepts MCPClientParams, toolName, and args
  callTool: mcpProcedure
    .input(
      z.object({
        params: stdioParamsSchema, // Use the unified schema for client params
        args: z.any(), // Arguments for the tool call
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Pass the validated params, toolName, and args to the service
      const data = await mcpService.callTool(input.params, input.toolName, input.args);

      return JSON.stringify(data);
    }),
});
