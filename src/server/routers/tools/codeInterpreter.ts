import { CodeInterpreterToolName, MarketSDK } from '@lobehub/market-sdk';
import debug from 'debug';
import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
import { FileS3 } from '@/server/modules/S3';

const log = debug('lobe-server:tools:code-interpreter');

const codeInterpreterProcedure = authedProcedure;

// Schema for tool call request
const callToolSchema = z.object({
  /** Market access token from OIDC (stored in user settings) */
  marketAccessToken: z.string().optional(),
  params: z.record(z.any()),
  toolName: z.string(),
  // Session context for isolation
  topicId: z.string(),
  userId: z.string(),
});

// Schema for getting export file upload URL
const getExportFileUploadUrlSchema = z.object({
  /** Original filename from sandbox */
  filename: z.string(),
  /** Topic ID for organizing files */
  topicId: z.string(),
});

export type CallToolInput = z.infer<typeof callToolSchema>;
export type GetExportFileUploadUrlInput = z.infer<typeof getExportFileUploadUrlSchema>;

export interface CallToolResult {
  error?: {
    message: string;
    name?: string;
  };
  result: any;
  sessionExpiredAndRecreated?: boolean;
  success: boolean;
}

export interface GetExportFileUploadUrlResult {
  /** The download URL after file is uploaded */
  downloadUrl: string;
  error?: {
    message: string;
  };
  /** The S3 key where file will be stored */
  key: string;
  success: boolean;
  /** Pre-signed upload URL */
  uploadUrl: string;
}

export const codeInterpreterRouter = router({
  callTool: codeInterpreterProcedure.input(callToolSchema).mutation(async ({ input }) => {
    const { toolName, params, userId, topicId, marketAccessToken } = input;

    log('Calling cloud code interpreter tool: %s with params: %O', toolName, {
      params,
      topicId,
      userId,
    });
    log('Market access token available: %s', marketAccessToken ? 'yes' : 'no');

    try {
      // Initialize MarketSDK with market access token from OIDC (passed via input)
      const market = new MarketSDK({
        accessToken: marketAccessToken,
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

  /**
   * Generate a pre-signed upload URL for exporting files from sandbox
   * The URL can be used by the sandbox to upload the file directly to S3
   */
  getExportFileUploadUrl: codeInterpreterProcedure
    .input(getExportFileUploadUrlSchema)

    // TODO if upload success, should add it path to files db
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .mutation(async ({ ctx, input }) => {
      const { filename, topicId } = input;

      log('Generating export file upload URL for: %s in topic: %s', filename, topicId);

      try {
        const s3 = new FileS3();

        // Generate a unique key for the exported file
        // Format: code-interpreter-exports/{topicId}/{filename}
        const key = `code-interpreter-exports/${topicId}/${filename}`;

        // Generate pre-signed upload URL
        const uploadUrl = await s3.createPreSignedUrl(key);

        // Generate download URL (pre-signed for preview)
        const downloadUrl = await s3.createPreSignedUrlForPreview(key);

        log('Generated upload URL for key: %s', key);

        return {
          downloadUrl,
          key,
          success: true,
          uploadUrl,
        } as GetExportFileUploadUrlResult;
      } catch (error) {
        log('Error generating export file upload URL: %O', error);

        return {
          downloadUrl: '',
          error: {
            message: (error as Error).message,
          },
          key: '',
          success: false,
          uploadUrl: '',
        } as GetExportFileUploadUrlResult;
      }
    }),
});
