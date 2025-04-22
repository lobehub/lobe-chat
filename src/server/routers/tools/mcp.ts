import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { isDesktop } from '@/const/version';
// Removed isDesktop import as stdio connection management is removed
// import { isDesktop } from '@/const/version';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { mcpService } from '@/server/services/mcp';

// Define Zod schemas for MCP Client parameters
const httpParamsSchema = z.object({
  name: z.string().min(1),
  type: z.literal('http'),
  url: z.string().url(),
});

const stdioParamsSchema = z.object({
  args: z.array(z.string()).optional().default([]),
  command: z.string().min(1),
  name: z.string().min(1),
  type: z.literal('stdio'),
});

// Union schema for MCPClientParams
const mcpClientParamsSchema = z.union([httpParamsSchema, stdioParamsSchema]);

const checkStdioEnvironment = (params: z.infer<typeof mcpClientParamsSchema>) => {
  if (params.type === 'stdio' && !isDesktop) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Stdio MCP type is not supported in web environment.',
    });
  }
};
export const mcpRouter = router({
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  // --- MCP Interaction ---
  // listTools now accepts MCPClientParams directly
  listTools: authedProcedure
    .input(mcpClientParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Stdio check can be done here or rely on the service/client layer
      checkStdioEnvironment(input);

      // Pass the validated MCPClientParams to the service
      return await mcpService.listTools(input);
    }),

  // callTool now accepts MCPClientParams, toolName, and args
  callTool: authedProcedure
    .input(
      z.object({
        params: mcpClientParamsSchema, // Use the unified schema for client params
        args: z.any(), // Arguments for the tool call
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Stdio check can be done here or rely on the service/client layer
      checkStdioEnvironment(input.params);

      // Pass the validated params, toolName, and args to the service
      return await mcpService.callTool(input.params, input.toolName, input.args);
    }),
});
