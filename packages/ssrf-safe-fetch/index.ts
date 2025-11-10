import fetch from 'node-fetch';
import type { RequestInit as NodeFetchOptions } from 'node-fetch';
import { RequestFilteringAgentOptions, useAgent as ssrfAgent } from 'request-filtering-agent';

interface FetchOptions extends RequestInit {
  ssrf?: boolean;
}

const toStandardResponse = async (response: Awaited<ReturnType<typeof fetch>>) => {
  return new Response(await response.arrayBuffer(), {
    headers: response.headers as any,
    status: response.status,
    statusText: response.statusText,
  });
};

/**
 * SSRF-safe fetch implementation for server-side use
 * Uses request-filtering-agent to prevent requests to private IP addresses
 */
// eslint-disable-next-line no-undef
export const ssrfSafeFetch = async (url: string, options?: FetchOptions): Promise<Response> => {
  const { ssrf, ...restOptions } = options ?? {};
  const fetchOptions = restOptions as NodeFetchOptions;

  try {
    if (!ssrf) {
      const response = await fetch(url, fetchOptions);
      return await toStandardResponse(response);
    }

    // Configure SSRF protection options
    const agentOptions: RequestFilteringAgentOptions = {
      allowIPAddressList: process.env.SSRF_ALLOW_IP_ADDRESS_LIST?.split(',') || [],
      allowMetaIPAddress: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS === '1',
      allowPrivateIPAddress: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS === '1',
      denyIPAddressList: [],
    };

    // Use node-fetch with SSRF protection agent
    const response = await fetch(url, {
      ...fetchOptions,
      agent: ssrfAgent(url, agentOptions),
    });

    return await toStandardResponse(response);
  } catch (error) {
    console.error('SSRF-safe fetch error:', error);
    throw new Error(
      `SSRF-safe fetch failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
