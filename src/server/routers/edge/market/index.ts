import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { DEFAULT_LANG } from '@/const/locale';
import { publicProcedure, router } from '@/libs/trpc/edge';
import { Locales } from '@/locales/resources';
import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';
import { AgentStoreIndex } from '@/types/discover';

export const marketRouter = router({
  getAgent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        locale: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
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

  getPluginIndex: publicProcedure
    .input(
      z
        .object({
          locale: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const locale = input?.locale;

      const pluginStore = new PluginStore();

      try {
        // 获取插件索引URL
        let res = await fetch(pluginStore.getPluginIndexUrl(locale as Locales));

        // 如果找不到对应语言的插件索引，尝试获取默认语言的插件索引
        if (res.status === 404) {
          res = await fetch(pluginStore.getPluginIndexUrl(DEFAULT_LANG));
        }

        if (res.ok) {
          return res.json();
        }

        throw new Error('Failed to fetch plugin index');
      } catch (e) {
        // it means failed to fetch
        if ((e as Error).message.includes('fetch failed')) {
          return [];
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'failed to fetch plugin market index',
        });
      }
    }),
});
