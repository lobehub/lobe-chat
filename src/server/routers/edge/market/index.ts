import { MarketSDK } from '@lobehub/market-sdk';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { DEFAULT_LANG } from '@/const/locale';
import { publicProcedure, router } from '@/libs/trpc/edge';
import { Locales } from '@/locales/resources';
import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';
import { AgentStoreIndex } from '@/types/discover';

const log = debug('lobe-edge-router:market');

export const marketRouter = router({
  getAgent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        locale: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getAgent input: %O', input);
      const { id, locale } = input;

      const market = new AssistantStore();

      // 获取助手 URL
      const url = market.getAgentUrl(id, locale as Locales);

      // 获取助手数据
      let res = await fetch(url);

      // 如果找不到对应语言的助手，尝试获取默认语言的助手
      if (res.status === 404) {
        res = await fetch(market.getAgentUrl(id, DEFAULT_LANG));
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch agent with id ${id}`);
      }

      return res.json();
    }),

  getAgentIndex: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }): Promise<AgentStoreIndex> => {
      log('getAgentIndex input: %O', input);
      const locale = input?.locale;

      const market = new AssistantStore();
      try {
        return await market.getAgentIndex(locale as Locales);
      } catch (e) {
        // it means failed to fetch
        if ((e as Error).message.includes('fetch failed')) {
          return { agents: [], schemaVersion: 1 };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'failed to fetch agent market index',
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
      const pluginStore = new PluginStore();
      const locale = input?.locale;

      try {
        return await pluginStore.getPluginList(locale);
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'failed to fetch plugin market index',
        });
      }
    }),

  getPluginList: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          locale: z.string().optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      log('getPluginList input: %O', input);
      const market = new MarketSDK({ baseUrl: 'http://localhost:8787/api' });

      return await market.getPluginList({
        category: input?.category,
        locale: input?.locale,
        page: input?.page,
        pageSize: input?.pageSize,
        q: input?.q,
      });
    }),

  getPluginManifest: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        install: z.boolean().optional(),
        locale: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      log('getPluginManifest input: %O', input);
      const market = new MarketSDK({ baseUrl: 'http://localhost:8787/api' });

      return await market.getPluginManifest(input.identifier, input.locale);
    }),
});
