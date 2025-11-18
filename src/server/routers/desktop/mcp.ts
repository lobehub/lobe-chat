import { GetStreamableMcpServerManifestInputSchema } from '@lobechat/types';
import debug from 'debug';
import { z } from 'zod';

import { ToolCallContent } from '@/libs/mcp';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';
import { mcpService } from '@/server/services/mcp';
import { processContentBlocks } from '@/server/services/mcp/contentProcessor';

const log = debug('lobe-mcp:router');

const stdioParamsSchema = z.object({
  args: z.array(z.string()).optional().default([]),
  command: z.string().min(1),
  env: z.any().optional(),
  metadata: z
    .object({
      avatar: z.string().optional(),
      description: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  name: z.string().min(1),
  type: z.literal('stdio').default('stdio'),
});

const mcpProcedure = authedProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
  return next({
    ctx: {
      fileService: new FileService(ctx.serverDB, ctx.userId),
    },
  });
});

export const mcpRouter = router({
  getStdioMcpServerManifest: mcpProcedure.input(stdioParamsSchema).query(async ({ input }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { env: _, ...rest } = input;
    log('getStdioMcpServerManifest input: %O', rest);

    return await mcpService.getStdioMcpServerManifest(input, input.metadata);
  }),

  getStreamableMcpServerManifest: mcpProcedure
    .input(GetStreamableMcpServerManifestInputSchema)
    .query(async ({ input }) => {
      log('getStreamableMcpServerManifest input: %O', {
        identifier: input.identifier,
        url: input.url,
      });
      return await mcpService.getStreamableMcpServerManifest(
        input.identifier,
        input.url,
        input.metadata,
        input.auth,
        input.headers,
      );
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

  // listResources now accepts MCPClientParams directly
  listResources: mcpProcedure
    .input(stdioParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Pass the validated MCPClientParams to the service
      return await mcpService.listResources(input);
    }),

  // listPrompts now accepts MCPClientParams directly
  listPrompts: mcpProcedure
    .input(stdioParamsSchema) // Use the unified schema
    .query(async ({ input }) => {
      // Pass the validated MCPClientParams to the service
      return await mcpService.listPrompts(input);
    }),

  // callTool now accepts MCPClientParams, toolName, and args
  callTool: mcpProcedure
    .input(
      z.object({
        params: stdioParamsSchema, // Use the unified schema for client params
        args: z.any(), // Arguments for the tool call
        env: z.any(), // Arguments for the tool call
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Create a closure that binds fileService and userId to processContentBlocks
      const boundProcessContentBlocks = async (blocks: ToolCallContent[]) =>
        processContentBlocks(blocks, ctx.fileService);

      // Pass the validated params, toolName, args, and bound processContentBlocks to the service
      return await mcpService.callTool({
        clientParams: { ...input.params, env: input.env },
        toolName: input.toolName,
        argsStr: input.args,
        processContentBlocks: boundProcessContentBlocks,
      });
    }),

  validMcpServerInstallable: mcpProcedure
    .input(
      z.object({
        deploymentOptions: z.array(z.object({}).passthrough()),
      }),
    )
    .mutation(async ({ input }) => {
      return await mcpService.checkMcpInstall(input as any);
    }),
});
