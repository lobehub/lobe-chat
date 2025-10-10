import fetch from 'node-fetch';
import { RequestFilteringAgentOptions, useAgent as ssrfAgent } from 'request-filtering-agent';

/**
 * SSRF-safe fetch implementation for server-side use
 * Uses request-filtering-agent to prevent requests to private IP addresses
 */
// eslint-disable-next-line no-undef
export const ssrfSafeFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    // Configure SSRF protection options
    const agentOptions: RequestFilteringAgentOptions = {
      allowIPAddressList: process.env.SSRF_ALLOW_IP_ADDRESS_LIST?.split(',') || [],
      allowMetaIPAddress: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS === '1',
      allowPrivateIPAddress: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS === '1',
      denyIPAddressList: [],
    };

    // Use node-fetch with SSRF protection agent
    const response = await fetch(url, {
      ...options,
      agent: ssrfAgent(url, agentOptions),
    } as any);

    // Convert node-fetch Response to standard Response
    return new Response(await response.arrayBuffer(), {
      headers: response.headers as any,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('SSRF-safe fetch error:', error);
    throw new Error(
      `SSRF-safe fetch failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
