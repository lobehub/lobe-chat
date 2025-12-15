import { CodeInterpreterToolName, MarketSDK } from '@lobehub/market-sdk';
import debug from 'debug';
import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';

const log = debug('lobe-server:tools:code-interpreter');

const codeInterpreterProcedure = authedProcedure;

// Schema for tool call request
const callToolSchema = z.object({
  params: z.record(z.any()),
  toolName: z.string(),
  // Session context for isolation
  topicId: z.string(),
  userId: z.string(),
});

export type CallToolInput = z.infer<typeof callToolSchema>;

export interface CallToolResult {
  error?: {
    message: string;
    name?: string;
  };
  result: any;
  sessionExpiredAndRecreated?: boolean;
  success: boolean;
}

export const codeInterpreterRouter = router({
  callTool: codeInterpreterProcedure.input(callToolSchema).mutation(async ({ ctx, input }) => {
    const { toolName, params, userId, topicId } = input;

    log('Calling cloud code interpreter tool: %s with params: %O', toolName, {
      params,
      topicId,
      userId,
    });

    try {
      // Initialize MarketSDK with market access token from cookie (mp_token)
      const market = new MarketSDK({
        accessToken: ctx.marketAccessToken,
        baseURL: process.env.NEXT_PUBLIC_MARKET_BASE_URL,
      });

      // Call market-sdk's runBuildInTool
      // API signature: runBuildInTool(toolName, params, context, options?)
      const response = await market.plugins.runBuildInTool(
        toolName as CodeInterpreterToolName,
        params as any,
        { topicId, userId },
      );

      log('Cloud code interpreter tool %s response: %O', toolName, response);

      if (!response.success) {
        return {
          error: {
            message: response.error?.message || 'Unknown error',
            name: response.error?.code,
          },
          result: null,
          sessionExpiredAndRecreated: false,
          success: false,
        } as CallToolResult;
      }

      return {
        result: response.data?.result,
        sessionExpiredAndRecreated: response.data?.sessionExpiredAndRecreated || false,
        success: true,
      } as CallToolResult;
    } catch (error) {
      log('Error calling cloud code interpreter tool %s: %O', toolName, error);

      return {
        error: {
          message: (error as Error).message,
          name: (error as Error).name,
        },
        result: null,
        sessionExpiredAndRecreated: false,
        success: false,
      } as CallToolResult;
    }
  }),
});
