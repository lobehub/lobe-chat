import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { publicProcedure, router } from '@/libs/trpc/lambda';
import { DiscoverService } from '@/server/services/discover';
import { AssistantSorts, McpSorts, ModelSorts, PluginSorts, ProviderSorts } from '@/types/discover';

const log = debug('lobe-edge-router:market');

const discoverService = new DiscoverService();

export const marketRouter = router({
  // ============================== Assistant Market ==============================

  getAssistantCategories: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('  getAssistantCategories: publicProcedure\n input: %O', input);

      try {
        return await discoverService.getAssistantCategories(input);
      } catch (error) {
        log('Error fetching assistant categories: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch assistant categories',
        });
      }
    }),

  getAssistantDetail: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        locale: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getAssistantDetail input: %O', input);

      try {
        return await discoverService.getAssistantDetail(input);
      } catch (error) {
        log('Error fetching assistants detail: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch assistants detail',
        });
      }
    }),

  getAssistantIdentifiers: publicProcedure.query(async () => {
    log('getAssistantIdentifiers called');

    try {
      return await discoverService.getAssistantIdentifiers();
    } catch (error) {
      log('Error fetching assistant identifiers: %O', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch assistant identifiers',
      });
    }
  }),

  getAssistantList: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          locale: z.string().optional(),
          order: z.enum(['asc', 'desc']).optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
          sort: z.nativeEnum(AssistantSorts).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getAssistantList input: %O', input);

      try {
        return await discoverService.getAssistantList(input);
      } catch (error) {
        log('Error fetching assistant list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch assistant list',
        });
      }
    }),

  getLegacyPluginList: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getLegacyPluginList input: %O', input);

      try {
        return await discoverService.getLegacyPluginList(input);
      } catch (error) {
        log('Error fetching legacy plugin list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch plugin list',
        });
      }
    }),

  // ============================== MCP Market ==============================
  getMcpCategories: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getMcpCategories input: %O', input);

      try {
        return await discoverService.getMcpCategories(input);
      } catch (error) {
        log('Error fetching mcp categories: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mcp categories',
        });
      }
    }),

  getMcpDetail: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        locale: z.string().optional(),
        version: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getMcpDetail input: %O', input);

      try {
        return await discoverService.getMcpDetail(input);
      } catch (error) {
        log('Error fetching mcp detail: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mcp detail',
        });
      }
    }),

  getMcpIdentifiers: publicProcedure.query(async () => {
    log('getMcpIdentifiers called');

    try {
      return await discoverService.getMcpIdentifiers();
    } catch (error) {
      log('Error fetching mcp identifiers: %O', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch mcp identifiers',
      });
    }
  }),

  getMcpList: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          locale: z.string().optional(),
          order: z.enum(['asc', 'desc']).optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
          sort: z.nativeEnum(McpSorts).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getMcpList input: %O', input);

      try {
        return await discoverService.getMcpList(input);
      } catch (error) {
        log('Error fetching mcp list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mcp list',
        });
      }
    }),

  getMcpManifest: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        install: z.boolean().optional(),
        locale: z.string().optional(),
        version: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getMcpManifest input: %O', input);

      try {
        return await discoverService.getMcpManifest(input);
      } catch (error) {
        log('Error fetching mcp manifest: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mcp manifest',
        });
      }
    }),

  // ============================== Models ==============================
  getModelCategories: publicProcedure
    .input(
      z
        .object({
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getModelCategories input: %O', input);

      try {
        return await discoverService.getModelCategories(input);
      } catch (error) {
        log('Error fetching model categories: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch model categories',
        });
      }
    }),

  getModelDetail: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        locale: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getModelDetail input: %O', input);

      try {
        return await discoverService.getModelDetail(input);
      } catch (error) {
        log('Error fetching model details: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch model details',
        });
      }
    }),

  getModelIdentifiers: publicProcedure.query(async () => {
    log('getModelIdentifiers called');

    try {
      return await discoverService.getModelIdentifiers();
    } catch (error) {
      log('Error fetching model identifiers: %O', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch model identifiers',
      });
    }
  }),

  getModelList: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          locale: z.string().optional(),
          order: z.enum(['asc', 'desc']).optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
          sort: z.nativeEnum(ModelSorts).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getModelList input: %O', input);

      try {
        return await discoverService.getModelList(input);
      } catch (error) {
        log('Error fetching model list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch model list',
        });
      }
    }),

  // ============================== Plugin Market ==============================
  getPluginCategories: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getPluginCategories input: %O', input);

      try {
        return await discoverService.getPluginCategories(input);
      } catch (error) {
        log('Error fetching plugin categories: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch plugin categories',
        });
      }
    }),

  getPluginDetail: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        locale: z.string().optional(),
        withManifest: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getPluginDetail input: %O', input);

      try {
        return await discoverService.getPluginDetail(input);
      } catch (error) {
        log('Error fetching plugin details: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch plugin details',
        });
      }
    }),

  getPluginIdentifiers: publicProcedure.query(async () => {
    log('getPluginIdentifiers called');

    try {
      return await discoverService.getPluginIdentifiers();
    } catch (error) {
      log('Error fetching plugin identifiers: %O', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch plugin identifiers',
      });
    }
  }),

  getPluginList: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          locale: z.string().optional(),
          order: z.enum(['asc', 'desc']).optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
          sort: z.nativeEnum(PluginSorts).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getPluginList input: %O', input);

      try {
        return await discoverService.getPluginList(input);
      } catch (error) {
        log('Error fetching plugin list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch plugin list',
        });
      }
    }),

  // ============================== Providers ==============================
  getProviderDetail: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        locale: z.string().optional(),
        withReadme: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getProviderDetail input: %O', input);

      try {
        return await discoverService.getProviderDetail(input);
      } catch (error) {
        log('Error fetching provider details: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch provider details',
        });
      }
    }),

  getProviderIdentifiers: publicProcedure.query(async () => {
    log('getProviderIdentifiers called');

    try {
      return await discoverService.getProviderIdentifiers();
    } catch (error) {
      log('Error fetching provider identifiers: %O', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch provider identifiers',
      });
    }
  }),

  getProviderList: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
          order: z.enum(['asc', 'desc']).optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
          sort: z.nativeEnum(ProviderSorts).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getProviderList input: %O', input);

      try {
        return await discoverService.getProviderList(input);
      } catch (error) {
        log('Error fetching provider list: %O', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch provider list',
        });
      }
    }),

  // ============================== Analytics ==============================

  reportMcpInstallResult: publicProcedure
    .input(
      z.object({
        errorCode: z.any().optional(),
        errorMessage: z.any().optional(),
        identifier: z.string(),
        installDurationMs: z.number().optional(),
        installParams: z.any().optional(),
        manifest: z.any().optional(),
        metadata: z.any().optional(),
        platform: z.string().optional(),
        success: z.boolean(),
        userAgent: z.string().optional(),
        version: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      log('reportMcpInstallResult input: %O', input);

      try {
        await discoverService.reportPluginInstallation(input);
        return { success: true };
      } catch (error) {
        log('Error reporting MCP installation result: %O', error);
        // 不抛出错误，因为上报失败不应影响主流程
        return { success: false };
      }
    }),
});
