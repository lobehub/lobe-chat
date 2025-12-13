/**
 * Lobe Web Browsing Executor
 *
 * Handles web search and page crawling tool calls.
 */
import { CrawlMultiPagesQuery, SEARCH_SEARXNG_NOT_CONFIG, SearchQuery } from '@lobechat/types';

import { searchService } from '@/services/search';
import { WebBrowsingApiName, WebBrowsingManifest } from '@/tools/web-browsing';
import { WebBrowsingExecutionRuntime } from '@/tools/web-browsing/ExecutionRuntime';

import type { BuiltinToolContext, BuiltinToolResult } from '../types';
import { BaseExecutor } from './BaseExecutor';

const runtime = new WebBrowsingExecutionRuntime({ searchService });

class WebBrowsingExecutor extends BaseExecutor<typeof WebBrowsingApiName> {
  readonly identifier = WebBrowsingManifest.identifier;
  protected readonly apiEnum = WebBrowsingApiName;

  /**
   * Search the web
   */
  search = async (params: SearchQuery, ctx: BuiltinToolContext): Promise<BuiltinToolResult> => {
    try {
      // Check if aborted
      if (ctx.signal?.aborted) {
        return { stop: true, success: false };
      }

      const result = await runtime.search(params, { signal: ctx.signal });

      if (result.success) {
        return {
          content: result.content,
          state: result.state,
          success: true,
        };
      }

      // Handle specific error cases
      const error = result.error as Error;
      if (error?.message === SEARCH_SEARXNG_NOT_CONFIG) {
        return {
          error: {
            body: { provider: 'searxng' },
            message: 'SearXNG is not configured',
            type: 'PluginSettingsInvalid',
          },
          success: false,
        };
      }

      return {
        error: {
          body: result.error,
          message: error?.message || 'Search failed',
          type: 'PluginServerError',
        },
        success: false,
      };
    } catch (e) {
      const err = e as Error;

      // Handle abort error
      if (err.name === 'AbortError' || err.message.includes('The user aborted a request.')) {
        return { stop: true, success: false };
      }

      return {
        error: {
          body: e,
          message: err.message,
          type: 'PluginServerError',
        },
        success: false,
      };
    }
  };

  /**
   * Crawl a single page
   */
  crawlSinglePage = async (
    params: { url: string },
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    return this.crawlMultiPages({ urls: [params.url] }, ctx);
  };

  /**
   * Crawl multiple pages
   */
  crawlMultiPages = async (
    params: CrawlMultiPagesQuery,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    try {
      // Check if aborted
      if (ctx.signal?.aborted) {
        return { stop: true, success: false };
      }

      const result = await runtime.crawlMultiPages(params);

      if (result.success) {
        return {
          content: result.content,
          state: result.state,
          success: true,
        };
      }

      return {
        content: result.content,
        error: {
          body: result.error,
          message: (result.error as Error)?.message || 'Crawl failed',
          type: 'PluginServerError',
        },
        success: false,
      };
    } catch (e) {
      const err = e as Error;

      // Handle abort error
      if (err.name === 'AbortError' || err.message.includes('The user aborted a request.')) {
        return { stop: true, success: false };
      }

      return {
        error: {
          body: e,
          message: err.message,
          type: 'PluginServerError',
        },
        success: false,
      };
    }
  };
}

// Export the executor instance for registration
export const webBrowsing = new WebBrowsingExecutor();
